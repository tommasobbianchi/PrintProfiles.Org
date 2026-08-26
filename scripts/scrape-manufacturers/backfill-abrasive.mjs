#!/usr/bin/env node
// Adds the hardened-nozzle warning to presets already in constants.ts, and restores the fill
// word to product names that lost it.
//
//   node scripts/scrape-manufacturers/backfill-abrasive.mjs --dry   report only
//   node scripts/scrape-manufacturers/backfill-abrasive.mjs         rewrite in place
//
// The importer warns on every row it adds, but it only started doing so recently: the presets
// imported before that carry the fill in their name and no warning at all.
//
// Worse, some lost the fill from the name too. The colour-collapse step keeps only whitelisted
// identity tokens, and "Tungsten"/"Magnetite" were not on that list, so Prusament PETG Tungsten
// 75 and Magnetite 40 — both metal-filled, both abrasive — ended up stored as plain "PETG",
// indistinguishable from the unfilled product. The storefront slug in sourceUrl still names the
// fill, so the name can be rebuilt from it.

import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { isAbrasive, ABRASIVE_NOTE } from './abrasive.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const CONSTANTS = join(HERE, '..', '..', 'constants.ts');
const DRY = process.argv.includes('--dry');

const field = (l, re) => (re.exec(l) || [])[1] || '';

// notes is the one field that contains escaped quotes: the slicer-profile attribution embeds
// the profile name, e.g. notes: "OrcaSlicer profile \"Anycubic PLA Glow @… 0.4 nozzle\" (…)".
// A naive ["']([^"']*) stops at that first \" and rewriting from there truncates the string
// into invalid TypeScript, so the note is matched as a real JS string literal with escapes.
const NOTES = /(notes: )(["'])((?:[^\\]|\\.)*?)\2(?=\s*[,}])/;
const notesOf = (l) => (NOTES.exec(l) || [])[3] || '';

// Fill words worth restoring to a name, as they appear in a product slug. Only words that
// change how the filament prints — never colours.
const FILL_WORD = /\b(tungsten|magnetite|galaxy|glitter|marble|granite|basalt|slate|stone|ceramic|wood|bamboo|cork|copper|bronze|brass|steel|iron|aluminium|aluminum|glow)\b/i;
const titleCase = (w) => w[0].toUpperCase() + w.slice(1).toLowerCase();

const src = await readFile(CONSTANTS, 'utf8');
const lines = src.split('\n');

let warned = 0;
let renamed = 0;
const examples = [];

const out = lines.map((l) => {
  if (!l.trim().startsWith('createPreset')) return l;

  const brand = field(l, /brand: ["']([^"']*)/);
  const url = field(l, /sourceUrl: "([^"]*)"/);
  const profile = field(l, /sourceProfile: "([^"]*)"/);
  const notes = notesOf(l);
  if (!isAbrasive(brand, profile, url)) return l;

  let line = l;

  // 1. Restore the fill word when the name lost it but the source still names it.
  const inName = FILL_WORD.exec(brand);
  const inSource = FILL_WORD.exec(`${profile} ${url}`);
  if (!inName && inSource) {
    const word = titleCase(inSource[1]);
    const next = `${brand} ${word}`.trim();
    line = line.replace(/(brand: )(["'])([^"']*)\2/, (_, k, q) => `${k}${q}${next}${q}`);
    // profileName is "<manufacturer> <brand>" and must not drift out of step with it.
    const pn = field(line, /profileName: ["']([^"']*)/);
    if (pn && pn.endsWith(brand)) {
      line = line.replace(/(profileName: )(["'])([^"']*)\2/, (_, k, q) => `${k}${q}${pn} ${word}${q}`);
    }
    renamed++;
    if (examples.length < 8) examples.push(`  ${brand} -> ${next}   (${url.slice(-52)})`);
  }

  // 2. Add the warning if it is not already there.
  if (!/hardened nozzle/i.test(notes)) {
    line = line.replace(NOTES, (_, k, q, body) => `${k}${q}${body}${ABRASIVE_NOTE}${q}`);
    // A row with no notes field at all still needs the warning.
    if (!/notes: /.test(line)) {
      line = line.replace(/( \}\),\s*)$/, `, notes: ${JSON.stringify(ABRASIVE_NOTE.trim())}$1`);
    }
    warned++;
  }
  return line;
});

console.log(`abrasive presets warned: ${warned}`);
console.log(`names with the fill word restored: ${renamed}`);
examples.forEach((e) => console.log(e));

if (DRY) { console.log('\n--dry: constants.ts not written'); process.exit(0); }
await writeFile(CONSTANTS, out.join('\n'));
console.log('constants.ts rewritten');
