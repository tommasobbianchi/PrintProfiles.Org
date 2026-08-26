#!/usr/bin/env node
// PrusaSlicer system filament profiles -> parameter facts.
//
//   https://github.com/prusa3d/PrusaSlicer  (resources/profiles/*.ini)
//
// LICENCE POSTURE. PrusaSlicer is AGPL-3.0. This parser extracts ONLY the numeric parameter
// values as facts (temperatures, volumetric speed, flow ratio, fan speeds, density, cost,
// spool weight) plus the material identifier, and cites the exact source profile name and its
// raw URL on every row. It deliberately does NOT: copy profile text into this repo (the corpus
// lives under vendor/, gitignored, and no profile file is ever written by this module), reuse
// creative profile/product-line names as our product names ("Prusament", "Ultrafuse", "nGen",
// "Fusion+", "Hatchbox"… are dropped — the product name is derived from vendor + material), or
// reproduce start_filament_gcode, end_filament_gcode, filament_notes, or any other prose field.
// Numbers and material identifiers only; anything ambiguous is left out.
//
// TWO STRUCTURAL FACTS OF THE SOURCE
//
// 1. Inheritance. A profile carries "inherits = <other section name>" (possibly several, split
//    by ';') and most values live up the chain, often 3 levels deep ("ColorFabb XT" -> "*PET*"
//    -> "*common*"). Values are resolved leaf-first over the whole chain, left to right.
// 2. Duplication. The same filament is shipped once per printer and nozzle ("… @PG", "… @MK4S
//    0.6", "… @XL"). Sections are grouped by the name with the "@…" suffix stripped, ONE
//    representative per group is resolved (the base member without an "@"), and rows are then
//    deduplicated again on vendor + derived material name, so ~7000 sections collapse to a few
//    hundred rows.
//
// Sections wrapped in asterisks ("*PET*", "*common*") are Prusa's abstract templates: the
// chain is resolved THROUGH them but they are never emitted as products.

import { readFile as _readFile, readdir as _readdir } from 'node:fs/promises';
import { join as _join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { log } from '../fetch.mjs';

export const MANUFACTURER = 'PrusaProfiles';
export const ORIGIN = 'https://github.com/prusa3d/PrusaSlicer';
export const LICENSE = 'AGPL-3.0 — parameter values used as facts, with attribution';

const RAW = 'https://raw.githubusercontent.com/prusa3d/PrusaSlicer/master/resources/profiles/';

// The PrusaSlicer checkout is used when present: 35 bundles / ~7500 sections on disk are read
// in seconds. Set PRUSA_PROFILES to a resources/profiles directory; the clone is gitignored and
// never committed, which keeps the AGPL corpus out of this repo while its parameter values are
// used as facts. There is NO network fallback: without the directory the parser returns [].
const LOCAL = process.env.PRUSA_PROFILES
  || _join(dirname(fileURLToPath(import.meta.url)), '..', 'vendor', 'PrusaSlicer', 'resources', 'profiles');
let localOk = null;
async function localAvailable() {
  if (localOk !== null) return localOk;
  try { await _readdir(LOCAL); localOk = true; } catch { localOk = false; }
  return localOk;
}

// Where run-all.mjs keeps this parser's rows; read back so a resumed run stays deduplicated.
const DATA_FILE = _join(dirname(fileURLToPath(import.meta.url)), '..', 'data', 'prusaprofiles.json');

// A vendor string that identifies nobody. Attributing a profile to "Generic" would invent a
// manufacturer that does not exist, so those rows are dropped.
const ANON_VENDOR = /^(generic|unknown|orca(slicer)?|custom|third[- ]?party|n\/a|none)$/i;

// ---------------------------------------------------------------- bundle parsing

const bundles = new Map(); // fileName -> Map(sectionName -> section)

function parseIni(text) {
  const sections = new Map();
  let cur = null;
  for (const raw of text.split('\n')) {
    const line = raw.trim();
    if (!line || line.startsWith('#') || line.startsWith(';')) continue;
    const sec = /^\[(.+)\]$/.exec(line);
    if (sec) {
      cur = null;
      const head = sec[1];
      if (!head.startsWith('filament:')) continue;
      const name = head.slice('filament:'.length);
      cur = { name, inherits: [], values: {}, isTemplate: /^\*.*\*$/.test(name) };
      sections.set(name, cur);
      continue;
    }
    if (!cur) continue;
    const kv = /^([^=\s]+)\s*=\s*(.*)$/.exec(line);
    if (!kv) continue;
    if (kv[1] === 'inherits') cur.inherits = kv[2].split(/[;,]/).map((s) => s.trim()).filter(Boolean);
    else cur.values[kv[1]] = kv[2].trim();
  }
  return sections;
}

async function bundleFor(fileName) {
  if (bundles.has(fileName)) return bundles.get(fileName);
  let map = new Map();
  try {
    map = parseIni(await _readFile(_join(LOCAL, fileName), 'utf8'));
  } catch { /* leave empty — parseProduct returns null on an empty chain */ }
  bundles.set(fileName, map);
  return map;
}

// ---------------------------------------------------------------- value helpers

// Prusa stores per-extruder values as comma-separated lists ("260,260"); an empty value means
// "not set here, keep inheriting".
function iniVal(raw) {
  if (raw === undefined || raw === null) return undefined;
  const first = String(raw).trim().split(',')[0].trim();
  return first === '' ? undefined : first;
}

function iniNum(raw, { zeroIsUnset = true } = {}) {
  const s = iniVal(raw);
  if (s === undefined) return undefined;
  const n = parseFloat(s);
  if (!Number.isFinite(n)) return undefined;
  if (zeroIsUnset && n === 0) return undefined; // "0" is the source's placeholder for unset
  return n;
}

// ---------------------------------------------------------------- inheritance

// Walk leaf -> root, returning the chain of parsed sections. Depth-capped and cycle-guarded
// because a malformed "inherits" would otherwise loop forever. Multiple parents are taken left
// to right, so the left parent (the material source) wins on a first-match lookup.
async function resolveChain(fileName, sectionName) {
  const bundle = await bundleFor(fileName);
  const chain = [];
  const seen = new Set();
  const walk = (name, depth) => {
    if (depth > 12 || seen.has(name)) return;
    seen.add(name);
    const sec = bundle.get(name);
    if (!sec) return;
    chain.push(sec);
    for (const parent of sec.inherits) walk(parent, depth + 1);
  };
  walk(sectionName, 0);
  return chain;
}

// First non-empty value down the chain, with the section that supplied it.
function pick(chain, key) {
  for (let i = 0; i < chain.length; i++) {
    const v = iniVal(chain[i].values[key]);
    if (v !== undefined) return { value: v, from: chain[i].name, depth: i };
  }
  return { value: undefined, from: null, depth: -1 };
}

// ---------------------------------------------------------------- material identity

// Polymer tokens, including the compounds the source uses ("PA6-CF", "PETG-rCF", "HT-PLA-GF",
// "PLA-AERO"). These are technical identifiers, not creative names.
const POLYMER = /^(?:(?:HT|LW|HS)-)?(?:PLA|PETG|PET|PCTG|PBT|PA(?:6|11|12|612)?|PPA|PPS|PSU|PEEK|PEKK|PEI|PVB|PVA|BVOH|HIPS|ABS|ASA|TPU|TPE|PEBA|PC|PP|PE|PHA|CPE|CoPE|SBS|EVA|PMMA)(?:-(?:CF|GF|rCF|rGF|ESD|FR|HF|AERO|GF\d+|CF\d+))*$/i;

// Factual descriptors: fills, finishes and functional grades that change how the material
// behaves or what it is made of. Everything not listed here (colour names, product lines,
// marketing tiers) is discarded rather than reused.
const DESCRIPTORS = new Set([
  'cf', 'gf', 'rcf', 'carbon', 'glass', 'fiber', 'fibre', 'wood', 'metal', 'metallic', 'marble',
  'stone', 'ceramic', 'mineral', 'cork', 'silk', 'matte', 'matt', 'satin', 'glow', 'luminous',
  'translucent', 'transparent', 'foaming', 'aero', 'lw', 'lightweight', 'conductive', 'esd',
  'flame', 'retardant', 'fr', 'recycled', 'support', 'soluble', 'breakaway', 'tough', 'impact',
  'flexible', 'flex', 'soft', 'hard', 'high', 'speed', 'hf', 'hs', 'ht', 'uhf', 'strong',
]);

// Descriptors that are acronyms and must stay upper-case ("PETG HF", not "PETG Hf").
const ACRONYMS = new Set(['cf', 'gf', 'rcf', 'esd', 'fr', 'hf', 'hs', 'ht', 'lw', 'uhf']);

const canonPolymer = (t) => t.replace(/^(ht|lw|hs)-/i, (m) => m.toUpperCase())
  .replace(/-(cf|gf|rcf|rgf|esd|fr|hf|aero)(\d*)$/i, (m, a, b) => '-' + a.toUpperCase() + b);

// Derive OUR product name from vendor + material, never from the source's creative naming.
//   "ColorFabb XT"      -> "PET"      (XT is ColorFabb's product line, dropped)
//   "Ultrafuse PET"     -> "PET"
//   "Fillamentum CPE HG100" -> "CPE"  (HG100 is a grade, dropped)
function deriveBrand(profileName, filamentType) {
  const core = String(profileName).replace(/\s*@.*$/, '');
  const kept = [];
  let hasPolymer = false;
  // A hyphen or plus is a compound separator in "PA6-CF" / "PA12+CF15" (a polymer token plus
  // its fill) but a plain joiner in "PLA-Marble" / "eSUN PLA-Basic". Split it only when the
  // whole token is not a polymer, otherwise "PLA-Marble" would lose its fill and collide with
  // plain PLA.
  const tokens = core.split(/[\s_/]+/).flatMap((t) => (POLYMER.test(t.replace(/[(),]/g, '')) ? [t] : t.split(/[-+]/)));
  for (const tok of tokens) {
    const t = tok.replace(/[(),]/g, '');
    if (!t) continue;
    const fibre = /(r?cf|gf|af)\d*/i.exec(t);
    if (POLYMER.test(t)) {
      hasPolymer = true;
      kept.push(canonPolymer(t).toUpperCase().replace(/^COPE$/, 'CoPE'));
    } else if (fibre && !/[a-z]/.test(t[fibre.index + fibre[0].length] || '')) {
      // Fibre fill ("CF20", "GF30", "rCF08", "CFJet", "HPP4GF25") is material identity and a
      // hardened-nozzle fact, not marketing: an abrasive must not be shown as unfilled PETG/PA.
      kept.push(fibre[0].replace(/^(r?)(cf|gf|af)/i, (_, r, a) => r.toLowerCase() + a.toUpperCase()));
    } else if (/^(kevlar|aramid|carbon|glass)$/i.test(t)) {
      kept.push(t[0].toUpperCase() + t.slice(1).toLowerCase());
    } else if (DESCRIPTORS.has(t.toLowerCase())) {
      const lower = t.toLowerCase();
      kept.push(ACRONYMS.has(lower) ? lower.toUpperCase() : t[0].toUpperCase() + t.slice(1).toLowerCase());
    } else if (/^\d+[AD]$/i.test(t)) {
      kept.push(t.toUpperCase()); // shore hardness (95A, 60D) is material identity
    }
  }
  if (!hasPolymer && filamentType) kept.unshift(filamentType);
  // "PLA+" would be dropped downstream by the importer's junk filter (it rejects '+').
  const out = [...new Set(kept)].join(' ').replace(/\+/g, ' Plus').replace(/\s+/g, ' ').trim();
  return out;
}

// filament_type -> the FilamentType union in types.ts.
function mapType(raw) {
  const s = String(raw || '').toUpperCase().replace(/\s+/g, '');
  if (/^PA(6|-6)/.test(s)) return 'PA6';
  if (/^PA(12|-12)/.test(s)) return 'PA12';
  if (/^PA/.test(s) || /NYLON/.test(s)) {
    if (/GF/.test(s)) return 'PA-GF';
    if (/CF/.test(s)) return 'PA-CF';
    return 'Nylon';
  }
  if (/^PETG/.test(s)) return 'PETG';
  if (/^PCTG/.test(s)) return 'PCTG';
  if (/^PET/.test(s)) return 'PET';
  if (/^PLA/.test(s)) return 'PLA';
  if (/^ABS/.test(s)) return 'ABS';
  if (/^ASA/.test(s)) return 'ASA';
  if (/^TPU/.test(s)) return 'TPU';
  if (/^TPE/.test(s)) return 'TPE';
  if (/^PEBA/.test(s)) return 'PEBA';
  if (/^PVB/.test(s)) return 'PVB';
  if (/^PVA/.test(s)) return 'PVA';
  if (/^BVOH/.test(s)) return 'BVOH';
  if (/^HIPS/.test(s)) return 'HIPS';
  if (/^PEI/.test(s)) return 'PEI';
  if (/^PHA/.test(s)) return 'PHA';
  if (/^PCTG/.test(s)) return 'PCTG';
  if (/^COPE/.test(s) || /^CPE/.test(s)) return 'CPE';
  if (/^PC/.test(s)) return 'PC';
  if (/^PP/.test(s) && !/^PPS|^PPA/.test(s)) return 'PP';
  return 'Other';
}

// ---------------------------------------------------------------- listing

const stripped = (name) => name.replace(/\s*@.*$/, '');

const rawUrl = (fileName, sectionName) =>
  `${RAW}${encodeURIComponent(fileName)}#filament:${encodeURIComponent(sectionName)}`;

// A group is one distinct filament: every "<name> @<printer/nozzle>" variant of the same
// product folds into it. Keyed on the bundle file + the name without its "@…" suffix.
const groups = new Map(); // key -> { fileName, members: [sectionName] }

// The base member (no "@…" suffix) holds the material facts; printer variants only re-tune it.
const representative = (members) => members.find((m) => !m.includes('@')) || members[0];

export async function listProducts() {
  if (!(await localAvailable())) {
    await log('prusaprofiles: no local PrusaSlicer profiles directory — set PRUSA_PROFILES');
    return [];
  }
  const files = (await _readdir(LOCAL, { withFileTypes: true }))
    .filter((e) => e.isFile() && e.name.endsWith('.ini')).map((e) => e.name).sort();

  let sections = 0;
  for (const fileName of files) {
    const bundle = await bundleFor(fileName);
    for (const [name, sec] of bundle) {
      if (sec.isTemplate) continue;
      sections++;
      const key = `${fileName}|${stripped(name)}`.toLowerCase();
      const g = groups.get(key) || { fileName, members: [] };
      g.members.push(name);
      groups.set(key, g);
    }
  }

  // run-all.mjs resumes by skipping URLs already in data/<parser>.json, but the collapse below
  // lives in this process's memory: without re-seeding it, a resumed run re-emits a second row
  // for every filament the first run had already folded away. Seed from what is on disk.
  try {
    const prior = JSON.parse(await _readFile(DATA_FILE, 'utf8'));
    if (Array.isArray(prior)) for (const r of prior) emitted.add(`${norm(r.manufacturer)}|${norm(r.brand)}`);
    if (emitted.size) await log(`prusaprofiles: ${emitted.size} filaments already in data/prusaprofiles.json — not re-emitting`);
  } catch { /* no previous run */ }

  const urls = [];
  for (const g of groups.values()) urls.push(rawUrl(g.fileName, representative(g.members)));
  await log(`prusaprofiles: ${files.length} bundles, ${sections} filament sections, ${groups.size} distinct filaments`);
  return [...new Set(urls)];
}

// ---------------------------------------------------------------- parsing

const emitted = new Set(); // norm(vendor)|norm(brand) — the same filament ships in several bundles

const norm = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '');

export async function parseProduct(url) {
  if (!url.startsWith(RAW)) return null;
  const hash = url.indexOf('#');
  if (hash < 0) return null;
  const fileName = decodeURIComponent(url.slice(RAW.length, hash));
  const fragment = decodeURIComponent(url.slice(hash + 1));
  const sectionName = fragment.startsWith('filament:') ? fragment.slice('filament:'.length) : fragment;

  const chain = await resolveChain(fileName, sectionName);
  if (!chain.length) return null;
  const sourceProfile = chain[0].name;

  const nozzleTemp = iniNum(pick(chain, 'temperature').value);
  const bedTemp = iniNum(pick(chain, 'bed_temperature').value);
  // Required. Never invent them.
  if (nozzleTemp === undefined || bedTemp === undefined) return null;

  const vendor = iniVal(pick(chain, 'filament_vendor').value);
  if (!vendor || ANON_VENDOR.test(vendor)) return null;

  const filamentType = mapType(iniVal(pick(chain, 'filament_type').value));
  const brand = deriveBrand(sourceProfile, filamentType);
  if (!brand) return null;

  const key = `${norm(vendor)}|${norm(brand)}`;
  if (emitted.has(key)) return null; // same filament, another bundle
  emitted.add(key);

  const out = {
    manufacturer: vendor,
    brand,
    filamentType,
    nozzleTemp,
    bedTemp,
    sourceType: 'slicer-profile',
    sourceUrl: url.slice(0, hash),
    sourceProfile,
  };

  const opt = {
    nozzleTempInitial: iniNum(pick(chain, 'first_layer_temperature').value),
    bedTempInitial: iniNum(pick(chain, 'first_layer_bed_temperature').value),
    fanSpeedMin: iniNum(pick(chain, 'min_fan_speed').value, { zeroIsUnset: false }),
    fanSpeedMax: iniNum(pick(chain, 'max_fan_speed').value, { zeroIsUnset: false }),
    maxVolumetricSpeed: iniNum(pick(chain, 'filament_max_volumetric_speed').value),
    flowRatio: iniNum(pick(chain, 'extrusion_multiplier').value),
    density: iniNum(pick(chain, 'filament_density').value),
    filamentDiameter: iniNum(pick(chain, 'filament_diameter').value),
    filamentCost: iniNum(pick(chain, 'filament_cost').value),
    spoolWeight: iniNum(pick(chain, 'filament_spool_weight').value),
  };
  for (const [k, v] of Object.entries(opt)) if (v !== undefined) out[k] = v;

  // Attribution detail: which ancestors the required values actually came from.
  const nz = pick(chain, 'temperature');
  const bd = pick(chain, 'bed_temperature');
  if (nz.depth > 0 || bd.depth > 0) {
    out.inheritedFrom = [...new Set([nz.from, bd.from].filter((n) => n && n !== sourceProfile))];
  }

  return out;
}
