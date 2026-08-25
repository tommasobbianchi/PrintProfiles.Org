#!/usr/bin/env node
// Eryone (Shopify): https://eryone3d.com/products/<handle>
// Filament specs live in the product description as a plain list:
//   Printing Temperature: 190°C-220°C / Heated Bed Temperature: 55-70°C /
//   Printing Speed: 30-100mm/s / Filament Diameter: 1.75mm
// Non-filament products (nozzles, beds, motors…) have no such block and parse to null.

import { get, decodeEntities } from '../fetch.mjs';

export const MANUFACTURER = 'Eryone';
export const ORIGIN = 'https://eryone3d.com';

const SITEMAP_INDEX = 'https://eryone3d.com/sitemap.xml';

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

const nums = (s) => [...String(s).matchAll(/\d+(?:\.\d+)?/g)].map((m) => parseFloat(m[0]));
const mid = (v) => {
  const n = nums(v);
  if (!n.length) return undefined;
  return Math.round(n.length >= 2 ? (n[0] + n[1]) / 2 : n[0]);
};

export async function listProducts() {
  const idx = await get(SITEMAP_INDEX);
  if (!idx.ok) return [];
  const sitemaps = [...idx.body.matchAll(/<loc>\s*(https:\/\/eryone3d\.com\/(?:[^<\s]*\/)?sitemap_products[^<\s]+)\s*<\/loc>/g)].map((m) => m[1]);
  const products = new Set();
  for (const sm of sitemaps) {
    const res = await get(sm);
    if (!res.ok) continue;
    for (const m of res.body.matchAll(/<loc>\s*(https:\/\/eryone3d\.com\/products\/[^<\s]+)\s*<\/loc>/g)) {
      products.add(m[1]);
    }
  }
  return [...products];
}

export async function parseProduct(url) {
  const res = await get(url);
  if (!res.ok) return null;
  const html = res.body;

  const clean = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&deg;/g, '°')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ');

  const pt = /Printing\s+Temperature:\s*([\d.,\s–—°C-]+)/i.exec(clean);
  const bt = /Heated\s+Bed\s+Temperature:\s*([\d.,\s–—°C-]+)/i.exec(clean);
  const nozzleTemp = pt ? mid(pt[1]) : undefined;
  const bedTemp = bt ? mid(bt[1]) : undefined;
  if (nozzleTemp === undefined || bedTemp === undefined) return null;

  // brand: decode entities, normalise full-width comma, drop diameter/weight tail and the
  // trailing "3D Printer Filament" marketing suffix.
  const og = (/property="og:title"\s+content="([^"]+)"/i.exec(html) || [, ''])[1];
  const brand = String(decodeEntities(og))
    .split(/\s*\|\s*/)[0]
    .replace(/，/g, ',')
    .replace(/,\s*\d+(?:\.\d+)?\s*mm.*$/i, '')
    .replace(/\s*3D\s+Printer\s+Filament\s*$/i, '')
    .replace(/\s+/g, ' ')
    .trim();

  const out = {
    manufacturer: MANUFACTURER,
    brand,
    filamentType: detectType(brand),
    nozzleTemp,
    bedTemp,
    sourceUrl: url,
    sourceType: 'manufacturer',
  };

  const speed = /Printing\s+Speed:\s*([\d.,\s–—-]+)\s*mm\/s/i.exec(clean);
  if (speed) out.printSpeed = mid(speed[1]);
  const dia = /Filament\s+Diameter:\s*([\d.]+)\s*mm/i.exec(clean);
  if (dia) out.filamentDiameter = parseFloat(dia[1]);

  return out;
}
