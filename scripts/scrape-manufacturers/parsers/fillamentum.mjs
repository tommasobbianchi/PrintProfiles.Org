#!/usr/bin/env node
// Fillamentum (Shopify storefront at shop.fillamentum.com).
// Two spec templates coexist:
//   (a) "Product information" accordion: "Working temperature: 250–270 °C" /
//       "Heated bed: 80–110 °C"   (industrial materials)
//   (b) "PRINTING SETTING" section:  "Printing Temperature: 190 – 210 °C" /
//       "Bed Temperature: 0 – 55 °C"   (PLA/PETG/…)
// The bed lower bound in (b) is a template default of "0"; when it is present we take the
// upper bound as the recommended bed temp rather than the midpoint of a fake range.

import { get, decodeEntities } from '../fetch.mjs';

export const MANUFACTURER = 'Fillamentum';
export const ORIGIN = 'https://fillamentum.com';

const SHOP = 'https://shop.fillamentum.com';
const SITEMAP_INDEX = `${SHOP}/sitemap.xml`;

const detectType = (name) => {
  const s = String(name || '').toUpperCase();
  if (/PA[ -]?CF|NYLON.*CF|CF.*NYLON|CARBON.*NYLON|NYLON.*CARBON|CF\d+|CARBON/.test(s)) return 'PA-CF';
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
  if (/WOOD|TIMBERFILL|NONOILEN/.test(s)) return 'PLA';
  if (/PLA/.test(s)) return 'PLA';
  return 'Other';
};

const nums = (s) => [...String(s).matchAll(/\d+(?:\.\d+)?/g)].map((m) => parseFloat(m[0]));
const mid = (v) => {
  const n = nums(v);
  if (!n.length) return undefined;
  return Math.round(n.length >= 2 ? (n[0] + n[1]) / 2 : n[0]);
};

// "PLA Extrafill "Signal Red" | 2.85 mm" -> "PLA Extrafill"; "0rCA® | Nylon ... | ..." -> "0rCA®"
function materialBrand(h1) {
  let s = String(h1 || '').replace(/"[^"]*"/g, '').replace(/\s+/g, ' ').trim();
  const seg = s.split(/\s*\|\s*/)[0];
  return seg.replace(/\s*\d+(?:\.\d+)?\s*mm.*$/i, '').trim();
}

export async function listProducts() {
  const idx = await get(SITEMAP_INDEX);
  if (!idx.ok) return [];
  const sitemaps = [...idx.body.matchAll(/<loc>\s*(https:\/\/shop\.fillamentum\.com\/sitemap_products[^<\s]+)\s*<\/loc>/g)].map((m) => m[1]);
  if (!sitemaps.length) return [];
  const products = new Set();
  for (const sm of sitemaps) {
    const res = await get(sm);
    if (!res.ok) continue;
    for (const m of res.body.matchAll(/<loc>\s*(https:\/\/shop\.fillamentum\.com\/products\/[^<\s]+)\s*<\/loc>/g)) {
      products.add(m[1]);
    }
  }
  return [...products];
}

export async function parseProduct(url) {
  const res = await get(url);
  if (!res.ok) return null;
  const html = res.body;

  const h1 = decodeEntities((/<h1[^>]*product-detail__title[^>]*>([\s\S]*?)<\/h1>/i.exec(html) || [, ''])[1])
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!h1) return null;

  const clean = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&deg;/g, '°')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ');

  let nozzleTemp;
  let bedTemp;

  // (a) authoritative accordion format
  const work = /Working temperature[:\s]*([\d.,\s–—-]+)\s*°?C/i.exec(clean);
  const hbed = /Heated bed[:\s]*([\d.,\s–—-]+)\s*°?C/i.exec(clean);
  if (work) nozzleTemp = mid(work[1]);
  if (hbed) bedTemp = mid(hbed[1]);

  // (b) newer PRINTING SETTING format (fallback)
  if (nozzleTemp === undefined) {
    const pt = /Printing\s+Temperature[:\s]*([\d.,\s–—-]+)\s*°?C/i.exec(clean);
    if (pt) nozzleTemp = mid(pt[1]);
  }
  if (bedTemp === undefined) {
    const bt = /Bed\s+Temperature[:\s]*([\d.,\s–—-]+)\s*°?C/i.exec(clean);
    if (bt) {
      const n = nums(bt[1]);
      // template default "0 – 55" -> use the upper bound
      bedTemp = n.length >= 2 && n[0] === 0 ? Math.round(n[1]) : mid(bt[1]);
    }
  }

  if (nozzleTemp === undefined || bedTemp === undefined) return null;

  return {
    manufacturer: MANUFACTURER,
    brand: materialBrand(h1),
    filamentType: detectType(h1),
    nozzleTemp,
    bedTemp,
    sourceUrl: url,
    sourceType: 'manufacturer',
  };
}
