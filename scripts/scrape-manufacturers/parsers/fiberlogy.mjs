#!/usr/bin/env node
// Fiberlogy product pages (WooCommerce): https://fiberlogy.com/en/product/<slug>/
// The "Technical Data" tab holds "Printing temperature" and "Bed temperature" in an
// unordered list, plus density.

import { get, decodeEntities } from '../fetch.mjs';

export const MANUFACTURER = 'Fiberlogy';
export const ORIGIN = 'https://fiberlogy.com';

// The product sitemap is not used: product URLs are enumerated by crawling the paginated
// shop archive instead.
const SHOP = 'https://fiberlogy.com/en/sklep/';

const detectType = (name) => {
  const s = String(name || '').toUpperCase();
  if (/PA[ -]?CF|NYLON.*CF|CF.*NYLON|CARBON.*NYLON|NYLON.*CARBON/.test(s)) return 'PA-CF';
  if (/PA[ -]?GF|NYLON.*GLASS|GLASS.*NYLON/.test(s)) return 'PA-GF';
  if (/TPE/.test(s)) return 'TPE';
  if (/TPU/.test(s)) return 'TPU';
  if (/PEBA/.test(s)) return 'PEBA';
  if (/PETG|PET-G/.test(s)) return 'PETG';
  if (/ABS/.test(s)) return 'ABS';
  if (/ASA/.test(s)) return 'ASA';
  if (/PC[ -]|POLYCARBON/.test(s)) return 'PC';
  if (/CPE|COPOLYESTER|PETT/.test(s)) return 'Copolyester';
  if (/NYLON|PA6|PA11|PA12|POLYAMIDE/.test(s)) return 'Nylon';
  if (/WOOD/.test(s)) return 'PLA';
  if (/PLA/.test(s)) return 'PLA';
  return 'Other';
};

// "210–230°C" (en-dash/hyphen range) -> midpoint; "60°C" -> 60.
const nums = (s) => [...String(s).matchAll(/\d+(?:\.\d+)?/g)].map((m) => parseFloat(m[0]));
const mid = (v) => {
  const n = nums(v);
  if (!n.length) return undefined;
  return Math.round(n.length >= 2 ? (n[0] + n[1]) / 2 : n[0]);
};

export async function listProducts() {
  const products = new Set();
  const pageOf = (n) => (n === 1 ? SHOP : `${SHOP}page/${n}/`);
  const collect = (body) => {
    for (const m of body.matchAll(/href="(https:\/\/fiberlogy\.com\/en\/product\/[^"?#]+)"/g)) {
      products.add(m[1]);
    }
  };

  const res1 = await get(pageOf(1));
  if (!res1.ok) return [];
  collect(res1.body);

  const maxPage = [...res1.body.matchAll(/\/en\/sklep\/page\/(\d+)\//g)]
    .map((m) => parseInt(m[1], 10))
    .reduce((a, b) => Math.max(a, b), 1);

  for (let p = 2; p <= maxPage; p++) {
    const r = await get(pageOf(p));
    if (r.ok) collect(r.body);
  }
  return [...products];
}

export async function parseProduct(url) {
  const res = await get(url);
  if (!res.ok) return null;
  const html = res.body;

  const clean = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '');

  const h1 = decodeEntities((/<h1[^>]*product_title[^>]*>([\s\S]*?)<\/h1>/i.exec(clean) || [, ''])[1])
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const title = decodeEntities((/<title>([^<]*)<\/title>/i.exec(clean) || [, ''])[1]).trim();
  const brand = (h1 || title).split(/\s+[-–]\s+/)[0].replace(/\s+-\s+Fiberlogy$/i, '').trim();

  const printing = /Printing temperature:\s*([^\n<]+)/i.exec(clean);
  const bed = /Bed temperature:\s*([^\n<]+)/i.exec(clean);
  const nozzleTemp = printing ? mid(printing[1]) : undefined;
  const bedTemp = bed ? mid(bed[1]) : undefined;
  if (nozzleTemp === undefined || bedTemp === undefined) return null;

  const out = {
    manufacturer: MANUFACTURER,
    brand,
    filamentType: detectType(brand || h1 || title),
    nozzleTemp,
    bedTemp,
    sourceUrl: url,
    sourceType: 'manufacturer',
  };

  const density = /Density:\s*([\d.]+)/i.exec(clean);
  if (density) out.density = parseFloat(density[1]);

  return out;
}
