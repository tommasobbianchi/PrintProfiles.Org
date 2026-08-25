#!/usr/bin/env node
// OrcaSlicer system filament profiles -> parameter facts.
//
//   https://github.com/SoftFever/OrcaSlicer  (resources/profiles/<Vendor>/filament/*.json)
//
// LICENCE POSTURE. OrcaSlicer is AGPL-3.0. This parser extracts ONLY the numeric parameter
// values as facts (temperatures, volumetric speed, flow ratio, fan speeds, density) plus the
// material identifier, and cites the exact source profile name and its raw URL on every row.
// It deliberately does NOT: copy profile JSON into this repo (fetch.mjs's cache/ is gitignored
// and no profile file is ever written by this module), reuse creative profile/product-line
// names as our product names ("Panchroma", "PolyLite", "PolyTerra", "Fiberon", "Basic",
// "Galaxy"… are dropped — the product name is derived from vendor + material), or reproduce
// g-code, custom start/end scripts, notes, or any other prose field. Numbers and material
// identifiers only; anything ambiguous is left out.
//
// TWO STRUCTURAL FACTS OF THE SOURCE
//
// 1. Inheritance. A profile carries "inherits": "<other profile name>" and most values live
//    up the chain, often 3 levels deep ("Bambu PLA Basic @BBL X1C" -> "Bambu PLA Basic @base"
//    -> "fdm_filament_pla" -> "fdm_filament_common"). Values are resolved leaf-first over the
//    whole chain; "nil" means "not set here, keep inheriting".
// 2. Duplication. The same filament is shipped once per printer and nozzle
//    ("… @BBL A1", "… @BBL X1C 0.2 nozzle", …). Files are grouped by the name with the
//    "@…" suffix stripped, ONE representative per group is resolved (the "@base" member when
//    there is one), and rows are then deduplicated again on vendor + derived material name,
//    so ~4000 files collapse to a few hundred rows.
//
// Index source: resources/profiles/<Vendor>.json carries a filament_list of
// { name, sub_path } — that is the name -> file index used for inheritance, and it costs one
// raw file per vendor instead of one GitHub API call per directory (the unauthenticated API
// allows only 60 requests/hour).

import { get, log } from '../fetch.mjs';

export const MANUFACTURER = 'SlicerProfiles';
export const ORIGIN = 'https://github.com/SoftFever/OrcaSlicer';
export const LICENSE = 'AGPL-3.0 — parameter values used as facts, with attribution';

const API_DIRS = 'https://api.github.com/repos/SoftFever/OrcaSlicer/contents/resources/profiles';
const RAW = 'https://raw.githubusercontent.com/SoftFever/OrcaSlicer/main/resources/profiles/';

// A local OrcaSlicer checkout is used when present: 7684 profile files behind a 1.5 s/domain
// rate limit is hours of wall-clock, and the same files on disk are read in seconds. Set
// ORCA_PROFILES to a resources/profiles directory; it is synced, gitignored and never
// committed, which keeps the AGPL corpus out of this repo while its parameter values are used
// as facts. Falls back to the network when the directory is absent.
import { readFile as _readFile, readdir as _readdir } from 'node:fs/promises';
import { join as _join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
const LOCAL = process.env.ORCA_PROFILES
  || _join(dirname(fileURLToPath(import.meta.url)), '..', 'orca-profiles');
let localOk = null;
async function localAvailable() {
  if (localOk !== null) return localOk;
  try { await _readdir(LOCAL); localOk = true; } catch { localOk = false; }
  return localOk;
}
// Mirrors get()'s shape so callers need no branching.
async function readProfile(url) {
  if (await localAvailable() && url.startsWith(RAW)) {
    const rel = decodeURIComponent(url.slice(RAW.length));
    try { return { ok: true, status: 200, body: await _readFile(_join(LOCAL, rel), 'utf8'), fromCache: true }; }
    catch { return { ok: false, status: 404, body: '' }; }
  }
  return get(url);
}
async function listLocalDirs() {
  const ents = await _readdir(LOCAL, { withFileTypes: true });
  return ents.filter((e) => e.isDirectory()).map((e) => e.name);
}

const rawUrl = (vendorDir, subPath) => RAW + encodeURI(`${vendorDir}/${subPath}`);

// A vendor string that identifies nobody. Attributing a profile to "Generic" would invent a
// manufacturer that does not exist, so those rows are dropped.
const ANON_VENDOR = /^(generic|unknown|orca(slicer)?|custom|third[- ]?party|n\/a|none)$/i;

// ---------------------------------------------------------------- vendor index

const indexes = new Map(); // vendorDir -> Map(profileName -> subPath)

async function indexFor(vendorDir) {
  if (indexes.has(vendorDir)) return indexes.get(vendorDir);
  const res = await readProfile(RAW + encodeURI(`${vendorDir}.json`));
  const map = new Map();
  if (res.ok) {
    try {
      for (const f of JSON.parse(res.body).filament_list || []) {
        if (f && f.name && f.sub_path) map.set(f.name, f.sub_path);
      }
    } catch {
      await log(`slicerprofiles: ${vendorDir}.json is not valid JSON`);
    }
  }
  indexes.set(vendorDir, map);
  return map;
}

// The index misses a few roots (BBL's fdm_filament_* are not all listed), so fall back to the
// two conventional locations before giving up.
const pathMemo = new Map(); // vendorDir|name -> subPath|null (a miss costs two 404s, pay once)

async function pathForName(vendorDir, name) {
  const memoKey = `${vendorDir}|${name}`;
  if (pathMemo.has(memoKey)) return pathMemo.get(memoKey);
  const idx = await indexFor(vendorDir);
  let found = idx.get(name) ?? null;
  if (!found) {
    for (const guess of [`filament/${name}.json`, `filament/base/${name}.json`]) {
      const probe = await readProfile(rawUrl(vendorDir, guess));
      if (probe.ok) { found = guess; break; }
    }
  }
  pathMemo.set(memoKey, found);
  return found;
}

// ---------------------------------------------------------------- value helpers

// Orca stores scalars as single-element arrays of strings; "nil" means inherit/unset.
function val(v) {
  const s = Array.isArray(v) ? v[0] : v;
  if (s === undefined || s === null) return undefined;
  const t = String(s).trim();
  return t === '' || t === 'nil' ? undefined : t;
}

function num(v, { zeroIsUnset = true } = {}) {
  const s = val(v);
  if (s === undefined) return undefined;
  const n = parseFloat(s);
  if (!Number.isFinite(n)) return undefined;
  if (zeroIsUnset && n === 0) return undefined; // "0" is the source's placeholder for unset
  return n;
}

// ---------------------------------------------------------------- inheritance

// Walk leaf -> root, returning the chain of parsed profiles. Depth-capped and cycle-guarded
// because a malformed "inherits" would otherwise loop forever.
async function resolveChain(vendorDir, subPath) {
  const chain = [];
  const seen = new Set();
  let path = subPath;
  for (let depth = 0; path && depth < 12; depth++) {
    if (seen.has(path)) break;
    seen.add(path);
    const res = await readProfile(rawUrl(vendorDir, path));
    if (!res.ok) break;
    let json;
    try {
      json = JSON.parse(res.body);
    } catch {
      await log(`slicerprofiles: unparseable JSON at ${vendorDir}/${path}`);
      break;
    }
    chain.push({ path, json, name: json.name || path });
    const parent = val(json.inherits);
    if (!parent) break;
    path = await pathForName(vendorDir, parent);
  }
  return chain;
}

// First non-nil value down the chain, with the profile that supplied it.
function pick(chain, key) {
  for (const node of chain) {
    if (val(node.json[key]) !== undefined) return { value: node.json[key], from: node.name, depth: chain.indexOf(node) };
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
//   "Panchroma PLA Matte @base"   -> "PLA Matte"
//   "PolyLite ABS @base"          -> "ABS"
//   "Bambu PLA Basic @BBL X1C"    -> "PLA"
//   "Fiberon PA6-CF @base"        -> "PA6-CF"
function deriveBrand(profileName, filamentType) {
  const core = String(profileName).replace(/\s*@.*$/, '');
  const kept = [];
  let hasPolymer = false;
  // A hyphen is a compound separator in "PA6-CF" (one polymer token) but a plain joiner in
  // "PLA-Marble" / "eSUN PLA-Basic". Split it only when the whole token is not a polymer,
  // otherwise "PLA-Marble" would lose its fill and collide with plain PLA.
  const tokens = core.split(/[\s_/]+/).flatMap((t) => (POLYMER.test(t.replace(/[(),]/g, '')) ? [t] : t.split('-')));
  for (const tok of tokens) {
    const t = tok.replace(/[(),]/g, '');
    if (!t) continue;
    if (POLYMER.test(t)) {
      hasPolymer = true;
      kept.push(canonPolymer(t).toUpperCase().replace(/^COPE$/, 'CoPE'));
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

// A group is one distinct filament: every "<name> @<printer/nozzle>" variant of the same
// product folds into it. Keyed on the containing directory (the vendor folder inside the
// profile pack) + the name without its "@…" suffix, lower-cased.
const groups = new Map(); // key -> { vendorDir, members: [{ name, subPath }] }

const groupKey = (subPath, name) => {
  const seg = subPath.split('/');
  const dir = seg.length > 2 ? seg[seg.length - 2] : '_root';
  return `${dir}|${name.replace(/\s*@.*$/, '')}`.toLowerCase();
};

// The "@base" member holds the shared truth for the product; printer variants only re-tune it.
const representative = (members) =>
  members.find((m) => /@base$/i.test(m.name)) ||
  members.find((m) => !m.name.includes('@')) ||
  members[0];

export async function listProducts() {
  const dirs = await get(API_DIRS);
  if (!dirs.ok) {
    await log(`slicerprofiles: cannot list vendor dirs (${dirs.status})`);
    return [];
  }
  let entries;
  try {
    entries = JSON.parse(dirs.body).filter((e) => e.type === 'dir').map((e) => e.name);
  } catch {
    return [];
  }

  let files = 0;
  for (const vendorDir of entries.sort()) {
    const idx = await indexFor(vendorDir);
    for (const [name, subPath] of idx) {
      if (!subPath.startsWith('filament/')) continue;
      files++;
      // Roots are shared machinery, not products; they are reached through inheritance only.
      if (/^fdm_filament_/i.test(name)) continue;
      const key = groupKey(subPath, name);
      const g = groups.get(key) || { vendorDir, members: [] };
      g.members.push({ name, subPath });
      groups.set(key, g);
    }
  }

  const urls = [];
  for (const g of groups.values()) {
    const rep = representative(g.members);
    urls.push(rawUrl(g.vendorDir, rep.subPath));
  }
  await log(`slicerprofiles: ${entries.length} vendor dirs, ${files} filament files, ${groups.size} distinct filaments`);
  return [...new Set(urls)];
}

// ---------------------------------------------------------------- parsing

const emitted = new Set(); // norm(vendor)|norm(brand) — the same filament ships in several packs

const norm = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '');

function splitUrl(url) {
  const rest = decodeURIComponent(url.slice(RAW.length));
  const i = rest.indexOf('/');
  return { vendorDir: rest.slice(0, i), subPath: rest.slice(i + 1) };
}

// Other files of the same product, used when the representative resolves without temperatures.
async function siblings(vendorDir, subPath, exclude) {
  const idx = await indexFor(vendorDir);
  const want = groupKey(subPath, exclude);
  const out = [];
  for (const [name, p] of idx) {
    if (!p.startsWith('filament/') || p === subPath) continue;
    if (groupKey(p, name) === want) out.push({ name, subPath: p });
  }
  return out;
}

export async function parseProduct(url) {
  if (!url.startsWith(RAW)) return null;
  const { vendorDir, subPath } = splitUrl(url);
  const leafName = subPath.split('/').pop().replace(/\.json$/, '');

  let chain = await resolveChain(vendorDir, subPath);
  if (!chain.length) return null;
  let sourceUrl = url;

  // A representative whose chain never states a temperature (some packs put every value in the
  // printer-specific variants) — retry through one sibling before giving up.
  const hasTemps = (c) => pick(c, 'nozzle_temperature').value !== undefined && pick(c, 'hot_plate_temp').value !== undefined;
  if (!hasTemps(chain)) {
    for (const sib of await siblings(vendorDir, subPath, leafName)) {
      const alt = await resolveChain(vendorDir, sib.subPath);
      if (hasTemps(alt)) {
        chain = alt;
        sourceUrl = rawUrl(vendorDir, sib.subPath);
        break;
      }
    }
  }

  const nozzleTemp = num(pick(chain, 'nozzle_temperature').value);
  const bedTemp = num(pick(chain, 'hot_plate_temp').value);
  // Required. Never invent them.
  if (nozzleTemp === undefined || bedTemp === undefined) return null;

  const vendor = val(pick(chain, 'filament_vendor').value);
  if (!vendor || ANON_VENDOR.test(vendor)) return null;

  const sourceProfile = chain[0].name;
  const filamentType = mapType(val(pick(chain, 'filament_type').value));
  const brand = deriveBrand(sourceProfile, filamentType);
  if (!brand) return null;

  const key = `${norm(vendor)}|${norm(brand)}`;
  if (emitted.has(key)) return null; // same filament, another printer pack
  emitted.add(key);

  const out = {
    manufacturer: vendor,
    brand,
    filamentType,
    nozzleTemp,
    bedTemp,
    sourceType: 'slicer-profile',
    sourceUrl,
    sourceProfile,
  };

  const opt = {
    nozzleTempInitial: num(pick(chain, 'nozzle_temperature_initial_layer').value),
    bedTempInitial: num(pick(chain, 'hot_plate_temp_initial_layer').value),
    maxVolumetricSpeed: num(pick(chain, 'filament_max_volumetric_speed').value),
    flowRatio: num(pick(chain, 'filament_flow_ratio').value),
    fanSpeedMin: num(pick(chain, 'fan_min_speed').value, { zeroIsUnset: false }),
    fanSpeedMax: num(pick(chain, 'fan_max_speed').value, { zeroIsUnset: false }),
    density: num(pick(chain, 'filament_density').value),
    filamentDiameter: num(pick(chain, 'filament_diameter').value),
  };
  for (const [k, v] of Object.entries(opt)) if (v !== undefined) out[k] = v;

  // Attribution detail: which ancestors the required values actually came from.
  const nz = pick(chain, 'nozzle_temperature');
  const bd = pick(chain, 'hot_plate_temp');
  if (nz.depth > 0 || bd.depth > 0) {
    out.inheritedFrom = [...new Set([nz.from, bd.from].filter((n) => n && n !== sourceProfile))];
  }

  return out;
}
