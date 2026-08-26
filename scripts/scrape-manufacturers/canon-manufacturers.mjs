#!/usr/bin/env node
// Rewrites constants.ts so every preset uses the canonical manufacturer spelling, then drops
// the duplicates that folding the spellings creates.
//
//   node scripts/scrape-manufacturers/canon-manufacturers.mjs --dry   report only
//   node scripts/scrape-manufacturers/canon-manufacturers.mjs         rewrite in place
//
// Uniqueness is (manufacturer, brand, filamentType, nozzleTemp, bedTemp).
//
// Neither shorter key is safe. (manufacturer, brand) merges away real materials: "3DXTech
// CarbonX" ships as both PA-CF and PETG, "BASF Ultrafuse" as PLA, TPU, PETG and metal. Adding
// filamentType is still not enough — constants.ts holds four rows reading
// `manufacturer: "Prusa", brand: "PETG"` that are Prusament PETG Ultraglow, Magnetite 40,
// plain, and Tungsten 75, printing at 260/85, 270/100, 250/80 and 260/80. Their distinguishing
// names were stripped as if they were colours, so on any name-only key they look identical
// while being four different products.
//
// So: two rows are the same preset only when they also agree on what to print at. Rows that
// share a name but state different settings are kept, both of them — a duplicate name is a
// naming defect to fix at the source, never a licence to delete data.
//
// When rows do collide on the full key, the survivor is chosen by provenance and then by how
// much it actually states — a vendor's own figure beats a slicer's tuned profile, which beats a
// community database, which beats an unattributed seed row.

import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { canonManufacturer } from './manufacturer-aliases.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const CONSTANTS = join(HERE, '..', '..', 'constants.ts');
const DRY = process.argv.includes('--dry');

const RANK = { manufacturer: 4, 'slicer-profile': 3, spoolmandb: 2, generic: 1 };
const field = (l, re) => (re.exec(l) || [])[1] || '';
const manufacturerOf = (l) => field(l, /manufacturer: ["']([^"']*)/);
const rankOf = (l) => RANK[field(l, /sourceType: "([^"]*)"/) || 'generic'] ?? 1;
// How much the row actually states: more fields set = more useful preset.
const richness = (l) => (l.match(/\w+:/g) || []).length;

const src = await readFile(CONSTANTS, 'utf8');
const lines = src.split('\n');

const renamed = new Map(); // from -> to (count)
const rewritten = lines.map((l) => {
  if (!l.trim().startsWith('createPreset')) return l;
  const from = manufacturerOf(l);
  const to = canonManufacturer(from);
  if (to === from) return l;
  renamed.set(`${from} -> ${to}`, (renamed.get(`${from} -> ${to}`) || 0) + 1);
  // Replace only the manufacturer field's value, leaving brand/profileName untouched: a
  // blanket string replace would rewrite "Prusament" inside brand: 'Prusament' too.
  return l.replace(/(manufacturer: )(["'])([^"']*)\2/, (_, k, q) => `${k}${q}${to}${q}`);
});

// ---- drop duplicates: same name AND same settings ----
const groups = new Map();
rewritten.forEach((l, i) => {
  if (!l.trim().startsWith('createPreset')) return;
  const key = [
    manufacturerOf(l),
    field(l, /brand: ["']([^"']*)/),
    field(l, /filamentType: ["']([^"']*)/),
    field(l, /nozzleTemp: (\d+)/),
    field(l, /bedTemp: (\d+)/),
  ].join('|').toLowerCase();
  if (!groups.has(key)) groups.set(key, []);
  groups.get(key).push(i);
});

const drop = new Set();
const dropped = [];
for (const [key, idx] of groups) {
  if (idx.length < 2) continue;
  const best = idx.slice().sort((a, b) => {
    const r = rankOf(rewritten[b]) - rankOf(rewritten[a]);
    return r || richness(rewritten[b]) - richness(rewritten[a]);
  })[0];
  for (const i of idx) if (i !== best) { drop.add(i); dropped.push(key); }
}

const out = rewritten.filter((_, i) => !drop.has(i));

const presets = (s) => s.filter((l) => l.trim().startsWith('createPreset')).length;
const mfrs = (s) => new Set(s.filter((l) => l.trim().startsWith('createPreset')).map(manufacturerOf)).size;

console.log(`presets ${presets(lines)} -> ${presets(out)}   manufacturers ${mfrs(lines)} -> ${mfrs(out)}`);
console.log(`renamed ${[...renamed.values()].reduce((a, b) => a + b, 0)} rows across ${renamed.size} spellings`);
for (const [k, n] of [...renamed].sort()) console.log(`  ${k}  (${n})`);
console.log(`dropped ${drop.size} duplicate presets (same manufacturer, brand, type AND settings)`);

if (DRY) { console.log('\n--dry: constants.ts not written'); process.exit(0); }
await writeFile(CONSTANTS, out.join('\n'));
console.log('constants.ts rewritten');
