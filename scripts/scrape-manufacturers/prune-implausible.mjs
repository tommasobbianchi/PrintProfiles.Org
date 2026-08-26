#!/usr/bin/env node
// Removes presets that state temperatures their own polymer cannot print at.
//
//   node scripts/scrape-manufacturers/prune-implausible.mjs --dry   report only
//   node scripts/scrape-manufacturers/prune-implausible.mjs         rewrite in place
//
// This is the counterpart of the tooCold() guard in import-manufacturers.mjs, applied to rows
// that were already shipped before that guard existed. Run it after widening a floor in
// envelopes.mjs, never on a hunch.
//
// WHY REMOVE RATHER THAN FLAG. Everywhere else in this project an out-of-envelope value is
// treated as a prompt to check the source, not proof of error — being ABOVE the ceiling is
// normal for filled and engineering grades. The cold side is different. Each row this drops was
// traced to its source first: they come from multi-roll bundle listings and accessory-cluttered
// pages where the scraped number belongs to a different product, or from material files that
// state no heated bed at all. "ABS at bed 43" and "PETG at nozzle 150" cannot be printed by
// anyone, and a preset that cannot print is worse than a preset that is missing — the user
// loads it, it fails, and the whole database loses credibility.
//
// The floors are deliberately generous and evidence-based; see the citations in envelopes.mjs.

import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tooCold } from './envelopes.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const CONSTANTS = join(HERE, '..', '..', 'constants.ts');
const DRY = process.argv.includes('--dry');

const field = (l, re) => (re.exec(l) || [])[1] || '';

const src = await readFile(CONSTANTS, 'utf8');
const lines = src.split('\n');

const dropped = [];
const out = lines.filter((l) => {
  if (!l.trim().startsWith('createPreset')) return true;
  const why = tooCold(
    field(l, /filamentType: ["']([^"']*)/),
    Number(field(l, /nozzleTemp: (\d+)/)),
    Number(field(l, /bedTemp: (\d+)/)),
  );
  if (!why) return true;
  dropped.push(`${field(l, /manufacturer: ["']([^"']*)/)} "${field(l, /brand: ["']([^"']*)/)}" ${field(l, /filamentType: ["']([^"']*)/)} — ${why}`);
  return false;
});

console.log(`dropping ${dropped.length} presets below their polymer's floor:`);
dropped.forEach((d) => console.log(`  ${d}`));

if (DRY) { console.log('\n--dry: constants.ts not written'); process.exit(0); }
await writeFile(CONSTANTS, out.join('\n'));
console.log('constants.ts rewritten');
