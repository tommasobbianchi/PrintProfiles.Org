#!/usr/bin/env node
// Corrects presets whose filamentType contradicts their own product name.
//
//   node scripts/scrape-manufacturers/fix-filament-type.mjs --dry   report only
//   node scripts/scrape-manufacturers/fix-filament-type.mjs         rewrite in place
//
// Storefront parsers infer the polymer from a page, and on a busy listing they sometimes pick
// the wrong one: "GT-3 High Speed Matte PLA" was stored as PETG, "Black ABS Virgin" as PETG.
// The preset then exports the wrong filament_type to the slicer.
//
// TWO SIGNALS MUST AGREE before anything is rewritten:
//   1. the name states exactly ONE of PLA / PETG / ABS / ASA, and it is not the stored type
//   2. the stored temperatures fall inside the NAMED polymer's envelope
//
// Requiring (2) is what makes this safe. A genuinely mislabelled row prints at the temperature
// its name implies — that is why the mislabelling went unnoticed — so temperature is
// independent evidence. Without it this would be a rename based on marketing text, and names
// like "PLA / PETG" (a bundle of both) or "PETG made on our PLA line" would be rewritten wrongly.
//
// TWO KINDS OF ROW ARE REPAIRED.
//
// CONFUSED: typed as one of PLA/PETG/ABS/ASA while the name says another of the four. Those are
// the ones storefront parsers actually mix up; the engineering polymers are named too
// distinctively, and a row typed PA-CF whose name says "Nylon" is more specific, not wrong.
//
// UNTYPED: typed 'Other' while the name states a polymer that types.ts can now represent. Most
// of these predate the FilamentType union gaining PCTG, PVB, PP, HIPS, PEI, BVOH, PVA, PA6,
// PA12, PET, CPE and PHA — they were 'Other' because there was nothing better to be. They
// matter because the exporters map filamentType to the slicer's own vocabulary, so 'Other'
// ships a filament with no usable type in the generated profile.

import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ENVELOPE, tooCold } from './envelopes.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const CONSTANTS = join(HERE, '..', '..', 'constants.ts');
const DRY = process.argv.includes('--dry');

const FOUR = ['PLA', 'PETG', 'ABS', 'ASA'];
const REPRESENTABLE = Object.keys(ENVELOPE);
// "PA-CF" must also match "PA CF" and "PACF" in a product name.
const nameRe = (t) => new RegExp(`(^|[^A-Z0-9])${t.toUpperCase().replace('-', '[- ]?')}([^A-Z0-9]|$)`);
const field = (l, re) => (re.exec(l) || [])[1] || '';

const src = await readFile(CONSTANTS, 'utf8');
const lines = src.split('\n');

let fixed = 0;
const skipped = [];

const out = lines.map((l) => {
  if (!l.trim().startsWith('createPreset')) return l;
  const type = field(l, /filamentType: ["']([^"']*)/);
  const pool = FOUR.includes(type) ? FOUR : (type === 'Other' ? REPRESENTABLE : null);
  if (!pool) return l;

  const name = `${field(l, /brand: ["']([^"']*)/)} ${field(l, /profileName: ["']([^"']*)/)}`.toUpperCase();
  const said = pool.filter((p) => nameRe(p).test(name));
  if (said.length !== 1 || said[0] === type) return l;

  const want = said[0];
  const nozzle = Number(field(l, /nozzleTemp: (\d+)/));
  const bed = Number(field(l, /bedTemp: (\d+)/));
  // Cold-only, for the same reason the audit separates the two directions: running HOT is what
  // filled grades do, so "PET-CF at 285" is still a PET and should be typed one. Running cold
  // means the numbers probably belong to a different polymer, and renaming the type to match
  // the name would then just move the contradiction rather than resolve it.
  const cold = ENVELOPE[want] ? tooCold(want, nozzle, bed) : 'no envelope';
  if (cold) {
    skipped.push(`${field(l, /brand: ["']([^"']*)/)}: name says ${want} but ${nozzle}/${bed} runs cold for it (${cold}) — left alone`);
    return l;
  }

  fixed++;
  console.log(`  ${field(l, /manufacturer: ["']([^"']*)/)} | ${field(l, /brand: ["']([^"']*)/)} | ${type} -> ${want}  (${nozzle}/${bed})`);
  return l.replace(/(filamentType: )(["'])([^"']*)\2/, (_, k, q) => `${k}${q}${want}${q}`);
});

console.log(`\nfilamentType corrected on ${fixed} presets`);
skipped.forEach((s) => console.log(`  SKIPPED ${s}`));

if (DRY) { console.log('--dry: constants.ts not written'); process.exit(0); }
await writeFile(CONSTANTS, out.join('\n'));
console.log('constants.ts rewritten');
