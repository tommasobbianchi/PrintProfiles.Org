#!/usr/bin/env node
// Reads data/<parser>.json and prints createPreset({...}) lines for the profiles that are
// NOT already in constants.ts. Dry run only — it never writes constants.ts.
//
//   node scripts/scrape-manufacturers/import-manufacturers.mjs
//
// Dedup key: norm(manufacturer)+'|'+norm(brand), checked against constants.ts AND within
// the batch. notes carries the attribution: "Official <MANUFACTURER> data — <sourceUrl>".

import { readdir, readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const DATA = join(HERE, 'data');
const CONSTANTS = join(HERE, '..', '..', 'constants.ts');

const norm = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '');

const ORDER = [
  'id', 'profileName', 'printerBrand', 'manufacturer', 'brand', 'filamentType',
  'nozzleTemp', 'bedTemp', 'printSpeed', 'fanSpeedMin', 'fanSpeedMax',
  'dryingTemp', 'dryingTime', 'density', 'filamentDiameter',
  'nozzleTempInitial', 'bedTempInitial', 'notes',
];

function serialize(p) {
  const body = ORDER
    .filter((k) => p[k] !== undefined && p[k] !== '')
    .map((k) => `${k}: ${typeof p[k] === 'number' ? p[k] : JSON.stringify(p[k])}`)
    .join(', ');
  return `  createPreset({ ${body} }),`;
}

async function main() {
  const files = (await readdir(DATA).catch(() => [])).filter((f) => f.endsWith('.json'));
  if (!files.length) {
    console.error(`No data in ${DATA} — run run-all.mjs first.`);
    process.exit(1);
  }

  const constants = await readFile(CONSTANTS, 'utf8');
  const existing = new Set(
    [...constants.matchAll(/manufacturer:\s*'([^']*)'[^}]*?brand:\s*'([^']*)'/g)].map(
      (m) => norm(m[1]) + '|' + norm(m[2])
    )
  );
  console.log(`constants.ts: ${existing.size} existing manufacturer|brand keys`);

  const lines = [];
  let n = 0;
  let dup = 0;

  for (const f of files) {
    const parser = f.replace(/\.json$/, '');
    let rows;
    try {
      rows = JSON.parse(await readFile(join(DATA, f), 'utf8'));
    } catch {
      continue;
    }
    if (!Array.isArray(rows)) continue;

    for (const raw of rows) {
      const key = norm(raw.manufacturer) + '|' + norm(raw.brand);
      if (existing.has(key)) { dup++; continue; }
      if (raw.nozzleTemp === undefined || raw.bedTemp === undefined) continue;

      n++;
      const p = {
        id: `mfr-${parser}-${n}`,
        profileName: `${raw.manufacturer} ${raw.brand}`.trim(),
        printerBrand: 'Other',
        manufacturer: raw.manufacturer,
        brand: raw.brand,
        filamentType: raw.filamentType || 'Other',
        nozzleTemp: raw.nozzleTemp,
        bedTemp: raw.bedTemp,
        printSpeed: raw.printSpeed,
        fanSpeedMin: raw.fanSpeedMin,
        fanSpeedMax: raw.fanSpeedMax,
        dryingTemp: raw.dryingTemp,
        dryingTime: raw.dryingTime,
        density: raw.density,
        filamentDiameter: raw.filamentDiameter,
        nozzleTempInitial: raw.nozzleTempInitial,
        bedTempInitial: raw.bedTempInitial,
        notes: `Official ${raw.manufacturer} data — ${raw.sourceUrl}`,
      };
      lines.push(serialize(p));
      existing.add(key);
    }
  }

  console.log(`data files=${files.length} alreadyPresent=${dup} new=${lines.length}`);
  if (!lines.length) return;

  console.log(`\n// --- Imported from official manufacturer sites (${new Date().toISOString().slice(0, 10)}) ---`);
  console.log(lines.join('\n'));
  console.log(`\n// ${lines.length} presets. Paste into PRESET_PROFILES in constants.ts, then run: npx tsc --noEmit`);
}

main();
