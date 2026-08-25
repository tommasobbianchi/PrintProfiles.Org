#!/usr/bin/env node
// Extrudr product pages (Saleor headless storefront): https://extrudr.com/de/de/products/<slug>/
// The full spec table lives in the __NEXT_DATA__ JSON as product.attributes
// [{attribute:{slug,name}, values:[{name}]}]. Slugs are stable; values are ranges.

import { get, decodeEntities } from '../fetch.mjs';

export const MANUFACTURER = 'Extrudr';
export const ORIGIN = 'https://extrudr.com';

const SITEMAP = 'https://extrudr.com/sitemap-0.xml';

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
  const res = await get(SITEMAP);
  if (!res.ok) return [];
  return [...new Set(
    [...res.body.matchAll(/<loc>\s*(https:\/\/extrudr\.com\/[^<\s]*\/products\/[^<\s]+)\s*<\/loc>/g)].map((m) => m[1])
  )];
}

export async function parseProduct(url) {
  const res = await get(url);
  if (!res.ok) return null;
  const html = res.body;

  const m = /<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/.exec(html);
  if (!m) return null;
  let product;
  try {
    product = JSON.parse(m[1]).props?.pageProps?.product;
  } catch {
    return null;
  }
  if (!product) return null;

  const attrs = {};
  for (const a of product.attributes || []) {
    if (a?.attribute?.slug && Array.isArray(a.values) && a.values[0]?.name) {
      attrs[a.attribute.slug] = a.values[0].name;
    }
  }

  const nozzleTemp = mid(attrs['nozzle-temperature'] ?? attrs['print-temperature']);
  const bedTemp = mid(attrs['build-plate-temperature'] ?? attrs['heating-bed-temperature']);
  if (nozzleTemp === undefined || bedTemp === undefined) return null;

  const out = {
    manufacturer: MANUFACTURER,
    brand: decodeEntities(product.name || 'Unknown'),
    filamentType: detectType(product.name),
    nozzleTemp,
    bedTemp,
    sourceUrl: url,
    sourceType: 'manufacturer',
  };

  if (attrs['print-speed']) out.printSpeed = mid(attrs['print-speed']);
  const fan = nums(attrs['cooling-fan']);
  if (fan.length) {
    out.fanSpeedMin = fan[0];
    out.fanSpeedMax = fan[1] ?? fan[0];
  }
  if (attrs['drying-temperature']) out.dryingTemp = mid(attrs['drying-temperature']);
  if (attrs['drying-time']) out.dryingTime = attrs['drying-time'].replace(/\s+/g, '');
  if (attrs['density']) out.density = nums(attrs['density'])[0];

  return out;
}
