#!/usr/bin/env node
// Audits constants.ts for values that are physically odd for their material.
//
//   node scripts/scrape-manufacturers/audit-presets.mjs          report
//   node scripts/scrape-manufacturers/audit-presets.mjs --strict exit 1 if anything is outside
//
// The importer's guard only rejects the universally impossible (nozzle under 150 C, nozzle
// cooler than bed). That misses the errors that actually occur: PLA at bed 110, PETG at 190,
// ASA at bed 30 — each plausible in isolation, wrong for that polymer. Those come from a
// parser pairing the wrong two numbers on a page, so they are worth catching separately.
//
// Envelopes are deliberately generous. Being outside one is a prompt to check the source, not
// proof of error: high-temp and filled grades legitimately sit outside the common range.

import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const CONSTANTS = join(HERE, '..', '..', 'constants.ts');

// [nozzleMin, nozzleMax, bedMin, bedMax]
const ENVELOPE = {
  PLA: [180, 250, 0, 80], PETG: [210, 275, 50, 110], ABS: [210, 285, 80, 120],
  ASA: [220, 290, 80, 120], TPU: [190, 260, 0, 80], TPE: [190, 260, 0, 80],
  PC: [240, 320, 90, 130], Nylon: [220, 320, 40, 120], 'PA-CF': [240, 320, 40, 120],
  'PA-GF': [240, 320, 40, 120], PA6: [230, 320, 40, 120], PA12: [230, 320, 40, 120],
  PVA: [170, 230, 40, 80], BVOH: [170, 230, 40, 80], HIPS: [210, 260, 80, 120],
  PP: [200, 280, 60, 120], PCTG: [220, 280, 50, 110], PVB: [190, 250, 50, 90],
  PET: [210, 280, 50, 110], CPE: [220, 280, 50, 110], PEBA: [200, 260, 0, 80],
  PHA: [180, 240, 0, 80], PEI: [350, 450, 120, 180], Copolyester: [210, 280, 50, 110],
};

const field = (l, re) => re.exec(l)?.[1];

const constants = await readFile(CONSTANTS, 'utf8');
const lines = constants.split('\n').filter((l) => l.trim().startsWith('createPreset'));

const findings = [];
for (const l of lines) {
  const type = field(l, /filamentType:\s*['"]([^'"]*)['"]/);
  const env = ENVELOPE[type];
  if (!env) continue; // 'Other' and unmapped types have no meaningful envelope
  const nozzle = Number(field(l, /nozzleTemp:\s*(\d+)/) ?? 0);
  const bed = Number(field(l, /bedTemp:\s*(\d+)/) ?? 0);
  const why = [];
  if (nozzle < env[0] || nozzle > env[1]) why.push(`nozzle ${nozzle} outside ${env[0]}-${env[1]}`);
  if (bed < env[2] || bed > env[3]) why.push(`bed ${bed} outside ${env[2]}-${env[3]}`);
  if (!why.length) continue;
  findings.push({
    id: field(l, /id:\s*['"]([^'"]+)['"]/),
    manufacturer: field(l, /manufacturer:\s*['"]([^'"]*)['"]/),
    brand: field(l, /brand:\s*['"]([^'"]*)['"]/),
    source: field(l, /sourceType: "([^"]*)"/) ?? 'seed',
    type, why: why.join('; '),
  });
}

const bySource = {};
for (const f of findings) bySource[f.source] = (bySource[f.source] || 0) + 1;

console.log(`${lines.length} presets audited, ${findings.length} outside their material envelope`);
console.log(`by source: ${JSON.stringify(bySource)}`);
for (const f of findings) {
  console.log(`  [${f.source}] ${f.manufacturer} "${f.brand}" ${f.type} — ${f.why}`);
}

if (process.argv.includes('--strict') && findings.length) process.exitCode = 1;
