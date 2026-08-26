#!/usr/bin/env node
// Ultimaker/fdm_materials XML material definitions -> parameter facts.
//
//   https://github.com/Ultimaker/fdm_materials  (vendor/*.xml.fdm_material)
//
// LICENCE POSTURE. fdm_materials is CC0-1.0 (public domain dedication). This parser extracts
// ONLY the numeric parameter values as facts (print temperature, heated bed temperature, print
// cooling, density, diameter, spool weight) plus the material identifier, and cites the exact
// source file and its raw URL on every row. It deliberately does NOT: copy the XML into this
// repo (the corpus lives under vendor/, gitignored, and no file is ever written by this module),
// reuse colour/label as product identity (this database collapses colour variants and the colour
// plays no part in a parameter row), or reproduce descriptions, adhesion_info, or any other
// prose field. Numbers and material identifiers only; anything ambiguous is left out.
//
// TWO STRUCTURAL FACTS OF THE SOURCE
//
// 1. Printer overrides. <settings> holds material-level <setting key="…"> elements as DIRECT
//    children, and printer-specific <machine> blocks nested inside it (each <machine> carrying
//    its own <setting> overrides, often inside <hotend>). The direct children are the primary
//    values; a <setting> inside <machine> is a printer override and is never taken over a direct
//    value (e.g. ultimaker_pla has "print temperature 200" at the top level and 210/230/240
//    inside its machine hotends — 200 wins). When a required setting is absent at the top level,
//    the <machine> blocks are consulted as a fallback, but only if every machine that states it
//    agrees on ONE value (never averaging, never first-pick); on disagreement the row is dropped.
// 2. Colour collapse. <name> carries <brand>, <material>, <color> and <label>; the colour is
//    discarded, so many files fold onto the same brand|material pair. Rows are deduplicated on
//    that raw pair via the emitted Set. A temperature of 0 is a real value here (cold bed / cold
//    extrusion — clay, silicone, unheated delta printers), not an "unset" placeholder.

import { readFile as _readFile, readdir as _readdir } from 'node:fs/promises';
import { join as _join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { log } from '../fetch.mjs';
import { mapType, deriveBrand } from './slicerprofiles.mjs';

export const MANUFACTURER = 'FdmMaterials';
export const ORIGIN = 'https://github.com/Ultimaker/fdm_materials';
export const LICENSE = 'CC0-1.0 — public domain dedication, attributed by choice';

const RAW = 'https://raw.githubusercontent.com/Ultimaker/fdm_materials/master/';

// The fdm_materials clone is used when present: 281 flat XML files on disk are read in seconds.
// Set FDM_MATERIALS to a directory of *.xml.fdm_material files; the clone is gitignored and
// never committed. There is NO network fallback: without the directory the parser returns [].
const LOCAL = process.env.FDM_MATERIALS
  || _join(dirname(fileURLToPath(import.meta.url)), '..', 'vendor', 'fdm_materials');
let localOk = null;
async function localAvailable() {
  if (localOk !== null) return localOk;
  try { await _readdir(LOCAL); localOk = true; } catch { localOk = false; }
  return localOk;
}

// Where run-all.mjs keeps this parser's rows; read back so a resumed run stays deduplicated.
const DATA_FILE = _join(dirname(fileURLToPath(import.meta.url)), '..', 'data', 'fdmmaterials.json');

// A vendor string that identifies nobody. Attributing a material to "Generic" would invent a
// manufacturer that does not exist, so those rows are dropped.
const ANON_VENDOR = /^(generic|unknown|orca(slicer)?|custom|third[- ]?party|n\/a|none)$/i;

// ---------------------------------------------------------------- xml reading

// Text content of a leaf tag ("<density>1.24</density>" -> "1.24"). The corpus is flat and
// machine-generated, so a string reader is enough — no XML library.
function childText(text, tag) {
  const m = new RegExp(`<${tag}(?:\\s[^>]*)?>([^<]*)</${tag}>`).exec(text);
  return m ? m[1].trim() : undefined;
}

// A block ("<name>…</name>") returned raw so its nested leaf tags can be read from it.
function block(text, tag) {
  const m = new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`).exec(text);
  return m ? m[1] : '';
}

// Every <setting key="…">…</setting> in a chunk of XML, into a key -> value map. Namespace-
// prefixed <cura:setting> elements are excluded because the '<setting' anchor does not match
// '<cura:setting'.
function settingsFrom(xml) {
  const map = new Map();
  const re = /<setting\b[^>]*key="([^"]+)"[^>]*>([\s\S]*?)<\/setting>/g;
  let s;
  while ((s = re.exec(xml))) map.set(s[1], s[2].trim());
  return map;
}

// Direct children of <settings> only: the settings body with every <machine>…</machine> block
// stripped out.
function directSettings(text) {
  const m = /<settings\b[^>]*>([\s\S]*?)<\/settings>/.exec(text);
  if (!m) return new Map();
  return settingsFrom(m[1].replace(/<machine\b[\s\S]*?<\/machine>/g, ''));
}

function num(raw, { zeroIsUnset = true } = {}) {
  if (raw === undefined || raw === null) return undefined;
  const s = String(raw).trim();
  if (s === '') return undefined;
  const n = parseFloat(s);
  if (!Number.isFinite(n)) return undefined;
  if (zeroIsUnset && n === 0) return undefined;
  return n;
}

// ---------------------------------------------------------------- machine fallback

// The distinct values a required setting takes across every <machine> block. A block "states"
// the setting if any <setting> in it (including inside its <hotend>s) carries the key.
//   { status: 'ok', value }  — every machine that states it agrees on one numeric value
//   { status: 'none' }       — no machine states it
//   { status: 'disagree' }   — machines disagree (never average, never pick the first)
function machineValues(text, key) {
  const m = /<settings\b[^>]*>([\s\S]*?)<\/settings>/.exec(text);
  const values = new Set();
  if (m) {
    const re = /<machine\b[\s\S]*?<\/machine>/g;
    let mm;
    while ((mm = re.exec(m[1]))) {
      for (const [k, v] of settingsFrom(mm[0])) if (k === key) values.add(v);
    }
  }
  if (values.size === 0) return { status: 'none' };
  if (values.size > 1) return { status: 'disagree' };
  const value = num([...values][0], { zeroIsUnset: false });
  return value === undefined ? { status: 'none' } : { status: 'ok', value };
}

// ---------------------------------------------------------------- listing

const rawUrl = (fileName) => `${RAW}${encodeURIComponent(fileName)}`;

export async function listProducts() {
  if (!(await localAvailable())) {
    await log('fdmmaterials: no local fdm_materials directory — set FDM_MATERIALS');
    return [];
  }
  const files = (await _readdir(LOCAL, { withFileTypes: true }))
    .filter((e) => e.isFile() && e.name.endsWith('.xml.fdm_material'))
    .map((e) => e.name).sort();

  // run-all.mjs resumes by skipping URLs already in data/fdmmaterials.json, but the dedupe
  // below lives in this process's memory: without re-seeding it, a resumed run re-emits a row
  // for every colour variant the first run had already folded away. Seed from what is on disk.
  try {
    const prior = JSON.parse(await _readFile(DATA_FILE, 'utf8'));
    if (Array.isArray(prior)) for (const r of prior) emitted.add(`${r.manufacturer}|${materialOf(r)}`);
    if (emitted.size) await log(`fdmmaterials: ${emitted.size} filaments already in data/fdmmaterials.json — not re-emitting`);
  } catch { /* no previous run */ }

  await log(`fdmmaterials: ${files.length} files`);
  return files.map(rawUrl);
}

// ---------------------------------------------------------------- parsing

const emitted = new Set(); // "brand|material" (raw) — colour variants fold into one row

// The raw <material> of a saved row, recovered from its sourceProfile "<brand> <material>".
const materialOf = (r) => String(r.sourceProfile || '').slice(String(r.manufacturer || '').length).trim();

export async function parseProduct(url) {
  if (!url.startsWith(RAW)) return null;
  const fileName = decodeURIComponent(url.slice(RAW.length));

  let text;
  try { text = await _readFile(_join(LOCAL, fileName), 'utf8'); }
  catch { return null; }

  const settings = directSettings(text);
  let nozzleTemp = num(settings.get('print temperature'), { zeroIsUnset: false });
  let bedTemp = num(settings.get('heated bed temperature'), { zeroIsUnset: false });
  let machineFallback = false;

  // Required: both temperatures, never invented. A 0 is a real value (cold bed / cold
  // extrusion), so it is kept. When one is absent at the top level, fall back to the machines
  // only on a unanimous value; none or disagree means drop.
  if (nozzleTemp === undefined || bedTemp === undefined) {
    const nz = nozzleTemp === undefined ? machineValues(text, 'print temperature') : { status: 'ok', value: nozzleTemp };
    const bd = bedTemp === undefined ? machineValues(text, 'heated bed temperature') : { status: 'ok', value: bedTemp };
    if (nz.status !== 'ok' || bd.status !== 'ok') return null;
    nozzleTemp = nz.value;
    bedTemp = bd.value;
    machineFallback = true;
  }

  const name = block(text, 'name');
  const vendor = childText(name, 'brand');
  const material = childText(name, 'material');
  if (!vendor || !material || ANON_VENDOR.test(vendor)) return null;

  const sourceProfile = `${vendor} ${material}`.trim();
  const filamentType = mapType(material);
  const brand = deriveBrand(sourceProfile, filamentType);
  if (!brand) return null;

  const key = `${vendor}|${material}`;
  if (emitted.has(key)) return null; // another colour of the same brand|material
  emitted.add(key);

  const properties = block(text, 'properties');

  const out = {
    manufacturer: vendor,
    brand,
    filamentType,
    nozzleTemp,
    bedTemp,
    sourceType: 'slicer-profile',
    sourceUrl: url,
    sourceProfile,
  };
  if (machineFallback) out.machineFallback = true;

  const opt = {
    fanSpeedMax: num(settings.get('print cooling'), { zeroIsUnset: false }),
    fanSpeedMin: num(settings.get('print cooling'), { zeroIsUnset: false }),
    density: num(childText(properties, 'density')),
    filamentDiameter: num(childText(properties, 'diameter')),
    spoolWeight: num(childText(properties, 'weight')),
  };
  for (const [k, v] of Object.entries(opt)) if (v !== undefined) out[k] = v;

  return out;
}
