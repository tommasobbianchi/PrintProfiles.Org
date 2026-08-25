#!/usr/bin/env node
// Generic Shopify filament parser, driven by a host table.
//
// Shopify exposes a public JSON endpoint on every store:
//   GET https://<host>/products.json?limit=250&page=N
//   -> { products: [ { id, title, handle, body_html, product_type, tags, variants:[{title}] } ] }
//
// One parser covers all stores: listProducts() paginates /products.json for every host in
// BRANDS and returns canonical product URLs; parseProduct() looks the product up from the
// same cached records and extracts the specs from body_html (labels vary a lot per store).
//
// Non-filament products (printers, resin, nozzles, dryers, spares, gift cards) have no
// nozzle/bed temp in body_html and simply parse to null.

import { get, decodeEntities } from '../fetch.mjs';

export const MANUFACTURER = 'Shopify'; // multi-brand; the real brand is per-BRAND below
export const ORIGIN = null;

export const BRANDS = [
  { manufacturer: 'Elegoo',      host: 'elegoo.com' },
  { manufacturer: 'Overture',    host: 'overture3d.com' },
  { manufacturer: 'Jayo',        host: 'jayo3d.com' },
  { manufacturer: 'Protopasta',  host: 'proto-pasta.com' },
  { manufacturer: 'Amolen',      host: 'amolen.com' },
  { manufacturer: 'Siraya Tech', host: 'siraya.tech' },
  { manufacturer: 'Kexcelled',   host: 'kexcelled3d.com' },
];

// ---------- shared helpers (same heuristics as eryone.mjs) ----------
const detectType = (name) => {
  const s = String(name || '').toUpperCase();
  if (/PA[ -]?CF|NYLON.*CF|CF.*NYLON|CARBON.*NYLON|NYLON.*CARBON/.test(s)) return 'PA-CF';
  if (/PA[ -]?GF|NYLON.*GLASS|GLASS.*NYLON/.test(s)) return 'PA-GF';
  // \b guards so short codes don't match inside longer words (TPE inside HTPETG, PC inside PCTG).
  if (/\bTPE\b/.test(s)) return 'TPE';
  if (/\bTPU\b/.test(s)) return 'TPU';
  if (/\bPEBA\b/.test(s)) return 'PEBA';
  if (/PETG|PET-G/.test(s)) return 'PETG';
  if (/\bABS\b/.test(s)) return 'ABS';
  if (/\bASA\b/.test(s)) return 'ASA';
  if (/\bPC\b|POLYCARBON/.test(s)) return 'PC';
  if (/\bCPE\b|COPOLYESTER|PETT/.test(s)) return 'Copolyester';
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

// Strip tags, decode entities, normalise the celsius sign, collapse whitespace.
const strip = (html) => decodeEntities(String(html || ''))
  .replace(/<script[\s\S]*?<\/script>/gi, '')
  .replace(/<style[\s\S]*?<\/style>/gi, '')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&deg;|℃/g, '°')
  .replace(/\s+/g, ' ')
  .trim();

// A temperature value: a digit, then a run of digits/dots/commas/spaces/°/C/~ and dashes.
// This accepts both "200-230°C" and the interleaved "200°C-230°C", and "270 ~ 310 ℃".
const TEMP_VAL = `[0-9][0-9.,\\s°C~–—-]*`;
// Labels are followed by an optional connector ("of"/"at"/"is"/"from"/"up to"/":"/"=").
const NOZZLE_RE = new RegExp(`(?:nozzle|print(?:ing)?|extruder|hot\\s*end|hotend)\\s*(?:temp(?:erature)?s?)?\\s*(?:of|at|is|from|up\\s+to|=|:)?\\s*(${TEMP_VAL})`, 'i');
const BED_RE = new RegExp(`(?:heated\\s*bed|build\\s*plate|print\\s*bed|heat\\s*bed|bed)\\s*(?:temp(?:erature)?s?)?\\s*(?:of|at|is|from|up\\s+to|=|:)?\\s*(${TEMP_VAL})`, 'i');

// Plausibility guards: throw away obvious non-temperatures (print size, build volume, …).
const okNozzle = (n) => n !== undefined && n >= 100 && n <= 450;
const okBed = (n) => n !== undefined && n >= 0 && n <= 200;

const COLOURS = 'black|white|red|blue|green|yellow|orange|purple|pink|brown|grey|gray|silver|gold|natural|transparent|clear|turquoise|cyan|magenta';

function cleanBrand(title) {
  let s = decodeEntities(title || '')
    .replace(/，/g, ',')
    .replace(/(?:\s*[|,])?\s*\d+(?:\.\d+)?\s*mm\b.*$/i, '')   // ", 1.75mm(1kg)" / " 1.75mm 1kg"
    .replace(/\s*3D\s+Printer\s+Filament\s*$/i, '')            // trailing marketing suffix
    .replace(/\s+\d+(?:\.\d+)?\s*(?:kg|g)\b.*$/i, '')          // trailing weight tail
    .replace(new RegExp(`\\s+[-–]?\\s*(?:${COLOURS})\\s*$`, 'i'), '') // obvious trailing colour
    .replace(/\s+/g, ' ')
    .trim();
  return s;
}

// ---------- per-host products.json cache ----------
const hostCache = new Map(); // host -> Map<handle, record>

async function loadHost(host) {
  if (hostCache.has(host)) return hostCache.get(host);
  const map = new Map();
  let page = 1;
  for (;;) {
    const res = await get(`https://${host}/products.json?limit=250&page=${page}`);
    if (!res.ok) break;
    let data;
    try { data = JSON.parse(res.body); } catch { break; }
    const products = Array.isArray(data.products) ? data.products : [];
    if (!products.length) break;
    for (const p of products) map.set(p.handle, p);
    if (products.length < 250) break;
    page++;
  }
  hostCache.set(host, map);
  return map;
}

export async function listProducts() {
  const urls = [];
  for (const b of BRANDS) {
    const map = await loadHost(b.host);
    for (const handle of map.keys()) urls.push(`https://${b.host}/products/${handle}`);
  }
  return urls;
}

export async function parseProduct(url) {
  const u = new URL(url);
  const host = u.hostname;
  const handle = decodeURIComponent(u.pathname.split('/').filter(Boolean).pop());
  const brand = BRANDS.find((b) => b.host === host);
  if (!brand || !handle) return null;

  const map = await loadHost(host);
  const rec = map.get(handle);
  if (!rec) return null;

  const text = strip(rec.body_html);

  let nozzleTemp = mid((NOZZLE_RE.exec(text) || [])[1]);
  let bedTemp = mid((BED_RE.exec(text) || [])[1]);
  if (!okNozzle(nozzleTemp) || !okBed(bedTemp)) return null;

  const name = cleanBrand(rec.title);
  const out = {
    manufacturer: brand.manufacturer,
    brand: name,
    filamentType: detectType(`${rec.title} ${rec.product_type || ''} ${(rec.tags || []).join(' ')}`),
    nozzleTemp,
    bedTemp,
    sourceUrl: `https://${host}/products/${handle}`,
    sourceType: 'manufacturer',
  };

  // optional fields — best effort
  const speed = /(?:print(?:ing)?\s*speed)\s*[:~=]?\s*([0-9][0-9.,\s~–—-]*)\s*mm\/s/i.exec(text);
  if (speed) out.printSpeed = mid(speed[1]);
  const density = /density\s*[:~=]?\s*([0-9]+(?:\.[0-9]+)?)/i.exec(text);
  if (density) out.density = parseFloat(density[1]);
  // filament diameter is only ever 1.75 / 2.85 / 3.0 — anything else ("±0.02mm",
  // "0.2mm layer height") is a tolerance or layer height, not the spool diameter.
  const dia = /(1\.75|2\.85|3\.0)\s*mm/i.exec(text);
  if (dia) out.filamentDiameter = parseFloat(dia[1]);
  const fan = /(?:cooling\s*fan|fan\s*speed)\s*[:~=]?\s*([0-9][0-9.,\s~–—-]*)\s*%/i.exec(text);
  if (fan) {
    const n = nums(fan[1]);
    if (n.length) {
      out.fanSpeedMin = n[0];
      out.fanSpeedMax = n.length >= 2 ? n[1] : n[0];
    }
  }

  return out;
}
