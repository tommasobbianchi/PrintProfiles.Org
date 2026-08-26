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
import { ENVELOPE } from './envelopes.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const CONSTANTS = join(HERE, '..', '..', 'constants.ts');


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
  // Direction matters more than distance. Running HOT is what filled and engineering grades do
  // — PET-CF at 300 is correct — so above-max is usually fine. Running COLD is the signature of
  // a profile carrying another polymer's settings: AnycubicSlicerNext ships an "Artillery PC"
  // that inherits Artillery Generic PLA and states 210 C, which will not extrude polycarbonate.
  // Those deserve to be read first, so they are labelled separately.
  const why = [];
  let cold = false;
  if (nozzle < env[0]) { why.push(`nozzle ${nozzle} BELOW ${env[0]}`); cold = true; }
  else if (nozzle > env[1]) why.push(`nozzle ${nozzle} above ${env[1]}`);
  if (bed < env[2]) { why.push(`bed ${bed} BELOW ${env[2]}`); cold = true; }
  else if (bed > env[3]) why.push(`bed ${bed} above ${env[3]}`);
  if (!why.length) continue;
  findings.push({
    id: field(l, /id:\s*['"]([^'"]+)['"]/),
    manufacturer: field(l, /manufacturer:\s*['"]([^'"]*)['"]/),
    brand: field(l, /brand:\s*['"]([^'"]*)['"]/),
    source: field(l, /sourceType: "([^"]*)"/) ?? 'seed',
    type, why: why.join('; '), cold,
  });
}

const bySource = {};
for (const f of findings) bySource[f.source] = (bySource[f.source] || 0) + 1;
// Cold first: those are the ones most likely to be a real error rather than a hot grade.
findings.sort((a, b) => Number(b.cold) - Number(a.cold));

console.log(`${lines.length} presets audited, ${findings.length} outside their material envelope`);
console.log(`by source: ${JSON.stringify(bySource)}`);
const cold = findings.filter((f) => f.cold).length;
console.log(`${cold} run COLD for their polymer (check these first — likely another polymer's settings), ${findings.length - cold} run hot (usually a filled or engineering grade)`);
for (const f of findings) {
  console.log(`  [${f.source}] ${f.manufacturer} "${f.brand}" ${f.type} — ${f.why}`);
}

if (process.argv.includes('--strict') && findings.length) process.exitCode = 1;
