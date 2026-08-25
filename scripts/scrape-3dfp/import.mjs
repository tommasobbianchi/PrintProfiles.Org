#!/usr/bin/env node
// Run AFTER scrape.mjs has populated data/. Compares scraped profiles against the presets
// already in constants.ts and prints createPreset({...}) lines for the MISSING ones only.
//
//   node scripts/scrape-3dfp/import.mjs            # dry run, prints to stdout
//   node scripts/scrape-3dfp/import.mjs --write    # appends to constants.ts before the closing ];
//
// NOTE: LABEL_MAP below is unvalidated — the source pages were unreachable when this was
// written (bot challenge), so the field labels are a best guess from the site's vocabulary.
// The script prints every unmapped label it meets; fix the map from that list on first real run.

import { readdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const DATA = join(HERE, 'data');
const CONSTANTS = join(HERE, '..', '..', 'constants.ts');
const WRITE = process.argv.includes('--write');

const LABEL_MAP = {
  'nozzle temperature': 'nozzleTemp',
  'nozzle temp': 'nozzleTemp',
  'hotend temperature': 'nozzleTemp',
  'first layer nozzle temperature': 'nozzleTempInitial',
  'bed temperature': 'bedTemp',
  'bed temp': 'bedTemp',
  'first layer bed temperature': 'bedTempInitial',
  'print speed': 'printSpeed',
  'max volumetric speed': 'maxVolumetricSpeed',
  'maximum volumetric speed': 'maxVolumetricSpeed',
  'flow ratio': 'flowRatio',
  'retraction distance': 'retractionDistance',
  'retraction length': 'retractionDistance',
  'retraction speed': 'retractionSpeed',
  'min fan speed': 'fanSpeedMin',
  'minimum fan speed': 'fanSpeedMin',
  'max fan speed': 'fanSpeedMax',
  'maximum fan speed': 'fanSpeedMax',
  'density': 'density',
  'drying temperature': 'dryingTemp',
  'diameter': 'filamentDiameter',
};

const TYPES = ['PLA','ABS','PETG','TPU','ASA','PC','PA-CF','PA-GF','Copolyester','PETT','Nylon','TPE','PEBA'];
const num = (v) => { const m = /-?[\d.]+/.exec(String(v)); return m ? Number(m[0]) : undefined; };
const norm = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '');

function toProfile(raw, idx) {
  // /defaults/{brand}/{material}/{variant}
  const seg = new URL(raw.url).pathname.split('/').filter(Boolean);
  const [, brandSeg, materialSeg, variantSeg] = seg;
  const un = (s) => decodeURIComponent(s || '').replace(/[-_]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()).trim();

  const out = {};
  const unmapped = [];
  for (const [label, value] of Object.entries(raw.fields || {})) {
    const key = LABEL_MAP[label.toLowerCase().trim()];
    if (key) out[key] = num(value);
    else unmapped.push(label);
  }

  const manufacturer = un(brandSeg);
  const material = un(materialSeg);
  const filamentType = TYPES.find((t) => norm(material).startsWith(norm(t))) || 'Other';
  const profileName = (raw.h1 || `${manufacturer} ${material} ${un(variantSeg)}`).trim();

  return {
    profile: {
      id: `3dfp-${idx}`,
      profileName,
      printerBrand: 'Other',
      manufacturer,
      brand: material,
      filamentType,
      ...out,
      notes: `Imported from 3dfilamentprofiles.com — ${raw.url}`,
      sourceUrl: raw.url,
    },
    unmapped,
  };
}

const REQUIRED = ['nozzleTemp', 'bedTemp'];

function serialize(p) {
  const order = ['id','profileName','printerBrand','manufacturer','brand','filamentType','nozzleTempInitial','nozzleTemp','bedTempInitial','bedTemp','printSpeed','maxVolumetricSpeed','flowRatio','retractionDistance','retractionSpeed','fanSpeedMin','fanSpeedMax','density','dryingTemp','filamentDiameter','notes'];
  const body = order
    .filter((k) => p[k] !== undefined && p[k] !== '')
    .map((k) => `${k}: ${typeof p[k] === 'number' ? p[k] : JSON.stringify(p[k])}`)
    .join(', ');
  return `  createPreset({ ${body} }),`;
}

async function main() {
  const files = (await readdir(DATA).catch(() => [])).filter((f) => f.endsWith('.json'));
  if (!files.length) {
    console.error(`No scraped data in ${DATA} — run scrape.mjs first.`);
    process.exit(1);
  }

  const constants = await readFile(CONSTANTS, 'utf8');
  // existing identity = manufacturer + filament brand/material, normalised
  const existing = new Set(
    [...constants.matchAll(/manufacturer:\s*'([^']*)'[^}]*?brand:\s*'([^']*)'/g)].map(
      (m) => norm(m[1]) + '|' + norm(m[2])
    )
  );
  console.log(`constants.ts: ${existing.size} existing manufacturer|material keys`);

  const lines = [];
  const allUnmapped = new Set();
  let dup = 0, incomplete = 0;

  for (const [i, f] of files.entries()) {
    const raw = JSON.parse(await readFile(join(DATA, f), 'utf8'));
    const { profile, unmapped } = toProfile(raw, i + 1);
    unmapped.forEach((u) => allUnmapped.add(u));

    if (existing.has(norm(profile.manufacturer) + '|' + norm(profile.brand))) { dup++; continue; }
    if (REQUIRED.some((k) => profile[k] === undefined)) { incomplete++; continue; }

    const { sourceUrl, ...rest } = profile;
    lines.push(serialize(rest));
    existing.add(norm(profile.manufacturer) + '|' + norm(profile.brand)); // de-dup within the batch too
  }

  console.log(`scraped=${files.length} alreadyPresent=${dup} incomplete=${incomplete} new=${lines.length}`);
  if (allUnmapped.size) {
    console.log(`\nUNMAPPED LABELS (add to LABEL_MAP):\n  ${[...allUnmapped].join('\n  ')}`);
  }
  if (!lines.length) return;

  const block = `\n  // --- Imported from 3dfilamentprofiles.com (${new Date().toISOString().slice(0, 10)}) ---\n${lines.join('\n')}\n`;

  if (!WRITE) {
    console.log('\n--- dry run, pass --write to apply ---');
    console.log(block);
    return;
  }
  const at = constants.lastIndexOf('];');
  await writeFile(CONSTANTS, constants.slice(0, at) + block + constants.slice(at));
  console.log(`\nAppended ${lines.length} presets to constants.ts. Run: npx tsc --noEmit`);
}

main();
