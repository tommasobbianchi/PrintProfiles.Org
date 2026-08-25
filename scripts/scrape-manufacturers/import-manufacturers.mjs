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

// Listing rows that are not a filament product.
// Makers whose filament is resold by other storefronts in this crawl. A product whose name
// carries one of these under a DIFFERENT manufacturer is a resold spool, not their own line.
const OTHER_MAKERS = ['colorFabb', 'Polymaker', 'Fillamentum', 'Prusament', 'Fiberlogy',
  'Extrudr', 'FormFutura', 'BASF', 'Ultimaker', 'Spectrum', 'Devil Design', 'NinjaTek',
  'Protopasta', 'Eryone', 'Kexcelled', 'AzureFilm'];

const JUNK = /\b(sample|gift\s*card|voucher|spool\s*holder|nozzle|bundle|sticker|t-shirt|dryer)\b|MOQ:|\bbe the first\b|\bnew colou?r collection\b/i;

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
    // Both quote styles: the hand-written presets use ', the ones this script emits use ".
    // Without that the second run would re-add everything it added on the first.
    [...constants.matchAll(/manufacturer:\s*(['"])(.*?)\1[^}]*?brand:\s*(['"])(.*?)\3/g)].map(
      (m) => norm(m[2]) + '|' + norm(m[4])
    )
  );
  // Settings already represented in constants.ts. Brand text is not a stable key across runs
  // (the variant collapse picks a representative name), so the import would otherwise re-add
  // near-identical presets every time. Settings are stable, so dedup on those too.
  const existingSettings = new Set(
    [...constants.matchAll(/manufacturer:\s*(['"])(.*?)\1[\s\S]*?filamentType:\s*(['"])(.*?)\3[\s\S]*?nozzleTemp:\s*(\d+),\s*bedTemp:\s*(\d+)/g)]
      .map((m) => [norm(m[2]), m[4], m[5], m[6]].join('|'))
  );

  // Highest mfr-*-N already issued, so new ids continue the sequence instead of restarting.
  const idBase = Math.max(0, ...[...constants.matchAll(/id:\s*["']mfr-[a-z]+-(\d+)["']/g)].map((m) => +m[1]));
  console.log(`constants.ts: ${existing.size} existing manufacturer|brand keys, max imported id ${idBase}`);

  const lines = [];
  const variants = new Map(); // settings-key -> { count, row, parser }
  let n = 0;
  let dup = 0;
  let junk = 0;
  let resold = 0;
  let implausible = 0;

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
      // Shop listings carry entries that are not distinct filaments: sample lengths
      // ("15 m Sample"), gift cards, spool holders. They would become junk presets.
      if (JUNK.test(raw.brand)) { junk++; continue; }
      // "PLA Mineral Filament" -> "PLA Mineral": the vendor's trailing noun adds nothing
      // and the existing presets use bare product names.
      raw.brand = String(raw.brand || '').replace(/\s+filaments?$/i, '').trim();
      // Many stores title products "<Brand> <Product>", and profileName is built as
      // "<manufacturer> <brand>" — without this the name doubles up
      // ("Siraya Tech Siraya Tech Fibreheart ASA-GF").
      const mfrPrefix = new RegExp('^' + raw.manufacturer.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s+', 'i');
      raw.brand = raw.brand.replace(mfrPrefix, '').trim();
      if (!raw.brand) { junk++; continue; }

      // A storefront may resell another maker's filament (ninjatek.com lists colorFabb).
      // Attributing that to the shop owner would be simply false, so drop it.
      const foreign = OTHER_MAKERS.find((m) => norm(raw.brand).includes(norm(m)) && norm(m) !== norm(raw.manufacturer));
      if (foreign) { resold++; continue; }

      const key = norm(raw.manufacturer) + '|' + norm(raw.brand);
      if (existing.has(key)) { dup++; continue; }
      if (raw.nozzleTemp === undefined || raw.bedTemp === undefined) continue;

      // Physical sanity. No filament extrudes below ~150C, and a nozzle cooler than the bed
      // means the parser paired the wrong two numbers (seen: iSanmate PEI1010 as 100/120,
      // where the real figures are around 400/140). Reject rather than ship a bad preset.
      if (raw.nozzleTemp < 150 || raw.nozzleTemp > 500 || raw.bedTemp > 200 || raw.nozzleTemp <= raw.bedTemp) {
        implausible++;
        continue;
      }

      // Spool weight is not part of the product identity: "Easy ASA White 200g" -> "Easy ASA White".
      raw.brand = raw.brand.replace(/[\s,–-]*\b\d+(?:[.,]\d+)?\s*(?:g|kg)\b\s*$/i, '').trim();

      // Colour and spool weight do not change print settings, so "PLA CF Onyx Black" and
      // "PLA CF Forest Green" are one preset. Collapse on identical settings and keep the
      // shortest name, which is reliably the family name rather than a colour variant.
      const skey = [norm(raw.manufacturer), raw.filamentType, raw.nozzleTemp, raw.bedTemp].join('|');
      if (existingSettings.has(skey)) { dup++; continue; }

      const vkey = [norm(raw.manufacturer), raw.filamentType, raw.nozzleTemp, raw.bedTemp, raw.printSpeed ?? ''].join('|');
      const seen = variants.get(vkey);
      if (seen) {
        seen.count++;
        if (raw.brand.length < seen.row.brand.length) seen.row.brand = raw.brand;
        continue;
      }
      variants.set(vkey, { count: 1, row: raw, parser });
      existing.add(key);
    }
  }

  // Emit one preset per distinct settings group.
  let collapsed = 0;
  for (const { count, row: raw, parser } of variants.values()) {
      if (count > 1) collapsed += count - 1;
      n++;
      const p = {
        // Seeded past the highest id already in constants.ts. The counter used to restart at
        // 1 every run, so a second import re-issued mfr-<parser>-1 and collided.
        id: `mfr-${parser}-${idBase + n}`,
        profileName: `${raw.manufacturer} ${raw.brand}`.trim(),
        printerBrand: 'Other',
        manufacturer: raw.manufacturer,
        brand: raw.brand,
        filamentType: raw.filamentType || 'Other',
        nozzleTemp: raw.nozzleTemp,
        bedTemp: raw.bedTemp,
        // Some datasheets state speed as a capability ceiling ("up to 1000 mm/s") rather
        // than a setpoint. Copying that into printSpeed would hand the slicer a default no
        // printer can run, so above this bound we drop the field and let createPreset's
        // default stand — the claim itself stays visible in the source URL.
        printSpeed: raw.printSpeed > 300 ? undefined : raw.printSpeed,
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
  }

  console.log(`data files=${files.length} alreadyPresent=${dup} skippedNonFilament=${junk} resold=${resold} implausible=${implausible} variantsCollapsed=${collapsed} new=${lines.length}`);
  if (!lines.length) return;

  console.log(`\n// --- Imported from official manufacturer sites (${new Date().toISOString().slice(0, 10)}) ---`);
  console.log(lines.join('\n'));
  console.log(`\n// ${lines.length} presets. Paste into PRESET_PROFILES in constants.ts, then run: npx tsc --noEmit`);
}

main();
