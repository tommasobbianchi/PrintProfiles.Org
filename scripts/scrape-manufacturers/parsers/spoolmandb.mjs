#!/usr/bin/env node
// SpoolmanDB (https://github.com/Donkie/SpoolmanDB) — MIT licensed community filament
// database, used here WITH ATTRIBUTION (every row carries the raw JSON permalink in
// sourceUrl, and sourceType 'spoolmandb' keeps the provenance distinguishable from rows
// scraped off a manufacturer's own site).
//
// Why this source exists in the pipeline: bambulab, polymaker, hatchbox, creality and
// anycubic all answer our crawler with a 403 bot challenge. SpoolmanDB republishes their
// published figures under a permissive licence, so we take them from here and never crawl
// those vendor sites.
//
// Layout:
//   https://api.github.com/repos/Donkie/SpoolmanDB/contents/filaments   -> vendor file list
//   https://raw.githubusercontent.com/.../filaments/<vendor>.json       -> one vendor
//   { manufacturer, filaments: [ { name, material, density, diameters, colors,
//                                  extruder_temp | extruder_temp_range,
//                                  bed_temp      | bed_temp_range } ] }
//
// One row per filament PRODUCT, not per colour: the `{color_name}` placeholder and any
// trailing colour word are stripped before the name becomes `brand`.

import { get, log } from '../fetch.mjs';

export const MANUFACTURER = 'SpoolmanDB';
export const ORIGIN = 'https://github.com/Donkie/SpoolmanDB';

const LISTING = 'https://api.github.com/repos/Donkie/SpoolmanDB/contents/filaments';
const RAW = 'https://raw.githubusercontent.com/Donkie/SpoolmanDB/master/filaments/';

const norm = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '');

// vendor file url -> parsed JSON. listProducts() already downloads every vendor file, so
// parseProduct() reads it from here instead of asking fetch.mjs 415 more times.
const vendorCache = new Map();

async function vendorFile(rawUrl) {
  if (vendorCache.has(rawUrl)) return vendorCache.get(rawUrl);
  const res = await get(rawUrl);
  if (!res.ok) {
    await log(`WARN spoolmandb ${rawUrl} -> ${res.status}`);
    vendorCache.set(rawUrl, null);
    return null;
  }
  let json = null;
  try {
    json = JSON.parse(res.body);
  } catch (e) {
    await log(`WARN spoolmandb ${rawUrl} is not valid JSON: ${e.message}`);
  }
  vendorCache.set(rawUrl, json);
  return json;
}

// ---------- material -> FilamentType (the union in types.ts) ----------
// SpoolmanDB material strings are free text ("PA12-CF", "PLA+WOOD", "GREENTEC", "CF").
// Anything whose base polymer is not in the union stays 'Other' rather than being guessed
// into the nearest-looking type.
export function mapType(material, name = '') {
  const m = String(material || '').toUpperCase().replace(/\s+/g, '');
  const all = `${m} ${String(name).toUpperCase()}`;
  const reinforced = /\bCF\b|-CF|CARBON/.test(all)
    ? 'CF'
    : /\bGF\b|-GF|GF\d|GLASS/.test(all)
      ? 'GF'
      : '';

  if (/^PPS/.test(m)) return 'Other'; // PPS-CF: not in the union, and not a PP
  if (/^PCTG/.test(m)) return 'PCTG';
  if (/^PETG/.test(m)) return 'PETG';
  if (/^PET\b|^PET-|^PET$/.test(m)) return 'PET';
  if (/^PLA/.test(m)) return 'PLA'; // PLA, PLA+, PLA-CF, PLA+WOOD — no PLA-CF in the union
  if (/^ABS/.test(m)) return 'ABS';
  if (/^ASA/.test(m)) return 'ASA';
  if (/^TPU/.test(m)) return 'TPU';
  if (/^TPE/.test(m)) return 'TPE';
  if (/^PEBA/.test(m)) return 'PEBA';
  if (/^PC/.test(m)) return 'PC'; // PC, PC-CF, PC+ABS, PCABS, PCPBT: polycarbonate-dominant
  if (/^PA|^NYLON|^PAHT/.test(m)) {
    if (reinforced === 'CF') return 'PA-CF';
    if (reinforced === 'GF') return 'PA-GF';
    if (/^PA6/.test(m)) return 'PA6';
    if (/^PA12/.test(m)) return 'PA12';
    return 'Nylon';
  }
  if (/^PVA/.test(m)) return 'PVA';
  if (/^PVB/.test(m)) return 'PVB';
  if (/^BVOH/.test(m)) return 'BVOH';
  if (/^HIPS/.test(m)) return 'HIPS';
  if (/^PEI/.test(m)) return 'PEI';
  if (/^PHA/.test(m)) return 'PHA';
  if (/^CPE/.test(m)) return 'CPE';
  if (/^PP\b|^PP$|^PP-/.test(m)) return 'PP';
  return 'Other';
}

// ---------- temperatures ----------
// The DB states a temperature either as a scalar (`extruder_temp: 220`) or as a range
// (`extruder_temp_range: [260,300]`). Range -> rounded midpoint, scalar -> as published.
// Neither present, or non-numeric -> undefined, and the row is dropped. Nothing is
// defaulted or inferred: a filament with no published temperature yields no preset.
export function temp(scalar, range) {
  if (Array.isArray(range) && range.length === 2) {
    const [a, b] = range.map(Number);
    if (Number.isFinite(a) && Number.isFinite(b)) return Math.round((a + b) / 2);
    return undefined;
  }
  const n = Number(scalar);
  return Number.isFinite(n) && scalar !== null && scalar !== undefined && scalar !== ''
    ? Math.round(n)
    : undefined;
}

// ---------- product name ----------
// "Fiberon™ PA12-CF10 {color_name}" -> "Fiberon PA12-CF10"
// "{color_name} Wood"               -> "Wood"
// "{color_name}"                    -> ''  (falls back to the material)
export function productName(rawName, colors = []) {
  let s = String(rawName || '')
    .replace(/\{[a-z_]+\}/gi, ' ')   // {color_name} and any sibling placeholder
    .replace(/[™®©]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  // A concrete colour sometimes sits in the name instead of the placeholder. Strip it only
  // when it matches a colour this very filament declares — a blocklist of colour words
  // would eat product names like "Galaxy" or "Pearl".
  const names = (Array.isArray(colors) ? colors : [])
    .map((c) => String(c && c.name || '').trim())
    .filter(Boolean)
    .sort((a, b) => b.length - a.length);
  for (const c of names) {
    const esc = c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const stripped = s
      .replace(new RegExp(`\\s*\\b${esc}\\b\\s*$`, 'i'), '')
      .replace(new RegExp(`^\\s*\\b${esc}\\b\\s*`, 'i'), '');
    if (stripped.trim()) s = stripped; // never strip the name down to nothing
  }

  return s.replace(/^[\s\-–,:]+|[\s\-–,:]+$/g, '').trim();
}

export async function listProducts() {
  const idx = await get(LISTING);
  if (!idx.ok) {
    await log(`ERROR spoolmandb listing -> ${idx.status}`);
    return [];
  }
  let entries;
  try {
    entries = JSON.parse(idx.body);
  } catch (e) {
    await log(`ERROR spoolmandb listing is not valid JSON: ${e.message}`);
    return [];
  }
  const vendors = (Array.isArray(entries) ? entries : [])
    .filter((e) => e && e.type === 'file' && /\.json$/i.test(e.name))
    .map((e) => e.name);

  const urls = [];
  for (const file of vendors) {
    const rawUrl = RAW + file;
    const json = await vendorFile(rawUrl);
    const n = json && Array.isArray(json.filaments) ? json.filaments.length : 0;
    if (!n) {
      await log(`WARN spoolmandb ${file}: no filaments array`);
      continue;
    }
    // The index goes in the fragment so each filament has its own listing url (run-all
    // dedups on it); the fragment is dropped again before anything is fetched, and
    // sourceUrl stays the clean permalink.
    for (let i = 0; i < n; i++) urls.push(`${rawUrl}#${i}`);
  }
  return urls;
}

export async function parseProduct(url) {
  const hash = url.lastIndexOf('#');
  if (hash < 0) return null;
  const rawUrl = url.slice(0, hash);
  const idx = Number(url.slice(hash + 1));
  if (!Number.isInteger(idx) || idx < 0) return null;

  const json = await vendorFile(rawUrl);
  if (!json || !Array.isArray(json.filaments)) return null;
  const f = json.filaments[idx];
  if (!f) return null;

  const manufacturer = String(json.manufacturer || '').trim();
  if (!manufacturer) return null;

  const nozzleTemp = temp(f.extruder_temp, f.extruder_temp_range);
  const bedTemp = temp(f.bed_temp, f.bed_temp_range);
  if (nozzleTemp === undefined || bedTemp === undefined) return null;

  // 142 of the 415 entries name only the colour ("{color_name}"), i.e. the product IS the
  // vendor's plain material line. The material is then the only honest product name.
  const material = String(f.material || '').trim();
  let brand = productName(f.name, f.colors) || material;
  if (!brand) return null;
  // Many names carry only the finish ("Matte", "Silk", "Hyper", "Glitter") and leave the
  // polymer to the `material` field. A preset called "Bambu Lab Matte" says nothing, so the
  // material is appended when the name does not already state it.
  if (material && !norm(brand).includes(norm(material))) brand = `${brand} ${material}`;
  // A trailing '+' is part of the real product name ("PLA+", "ABS+") and is kept. An internal
  // one just joins two components ("PLA+WOOD" -> "PLA WOOD"). The importer's junk filter used
  // to drop any '+' at all, which would have silently lost these rows; it now matches only the
  // spaced form used by bundle listings ("2x A + 2x B").
  brand = brand.replace(/\+(?=\S)/g, ' ').replace(/\s+/g, ' ').trim();

  const out = {
    manufacturer,
    brand,
    filamentType: mapType(f.material, brand),
    nozzleTemp,
    bedTemp,
    sourceUrl: rawUrl,
    sourceType: 'spoolmandb',
  };

  const density = Number(f.density);
  if (Number.isFinite(density) && density > 0) out.density = density;
  const dia = Array.isArray(f.diameters) ? Number(f.diameters[0]) : NaN;
  if (Number.isFinite(dia) && dia > 0) out.filamentDiameter = dia;

  return out;
}
