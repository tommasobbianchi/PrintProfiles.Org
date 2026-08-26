#!/usr/bin/env node
// Runs every parser in sequence and writes data/<parser>.json incrementally.
//
//   MAX_PER_PARSER=2 node scripts/scrape-manufacturers/run-all.mjs   # smoke run
//   node scripts/scrape-manufacturers/run-all.mjs                    # full run
//
// Resumable: on start it reloads existing data/<parser>.json and skips URLs already there.
// Per-product errors are logged and skipped, never fatal.

import { mkdir, readFile, writeFile, stat, rm } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { log } from './fetch.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));

// Write the UNION of what is on disk and what this run holds, keyed by sourceKey/sourceUrl.
// A plain overwrite loses rows whenever two runs touch the same parser — that happened here,
// cutting slicerprofiles from 669 rows back to 498. Merging makes the write order irrelevant.
async function mergeWrite(outFile, rows) {
  let onDisk = [];
  try { onDisk = JSON.parse(await readFile(outFile, 'utf8')); } catch { /* first write */ }
  if (!Array.isArray(onDisk)) onDisk = [];
  const key = (r) => r.sourceKey || r.sourceUrl;
  const merged = new Map();
  for (const r of [...onDisk, ...rows]) { const k = key(r); if (k) merged.set(k, r); }
  await writeFile(outFile, JSON.stringify([...merged.values()], null, 2));
  return merged.size;
}
const DATA = join(HERE, 'data');
const MAX = Number(process.env.MAX_PER_PARSER) || Infinity;
const FLUSH_EVERY = 5;

const ALL_PARSERS = ['prusament', 'fiberlogy', 'extrudr', 'fillamentum', 'eryone', 'shopify', 'woocommerce', 'generic', 'spoolmandb', 'slicerprofiles', 'bambuprofiles', 'prusaprofiles', 'fdmmaterials'];
// ONLY=generic,spoolmandb runs just those. Without it every parser runs, and a parser with a
// large backlog (shopify has thousands of pages) would otherwise block the ones behind it.
const PARSERS = process.env.ONLY ? process.env.ONLY.split(',').map((s) => s.trim()) : ALL_PARSERS;

async function main() {
  await mkdir(DATA, { recursive: true });
  await log(`=== run start === MAX_PER_PARSER=${Number.isFinite(MAX) ? MAX : 'unlimited'}`);

  const summary = [];

  // Two run-all instances touching the same parser both hold the row array in memory and both
  // rewrite data/<parser>.json, so the one that finishes last wins and the other's rows vanish.
  // That actually happened here: a concurrent slicerprofiles run cut 669 rows back to 498.
  // A stale lock from a killed run is ignored after LOCK_STALE_MS.
  const LOCK_STALE_MS = 30 * 60 * 1000;
  for (const name of PARSERS) {
    const lockFile = join(DATA, `.${name}.lock`);
    try {
      const st = await stat(lockFile);
      if (Date.now() - st.mtimeMs < LOCK_STALE_MS) {
        await log(`SKIP ${name}: another run holds ${lockFile}`);
        continue;
      }
      await log(`${name}: ignoring stale lock`);
    } catch { /* no lock, proceed */ }
    await writeFile(lockFile, String(process.pid));
    try {
    const outFile = join(DATA, `${name}.json`);
    let rows = [];
    try {
      const existing = JSON.parse(await readFile(outFile, 'utf8'));
      if (Array.isArray(existing)) rows = existing;
    } catch {
      rows = [];
    }
    // Key on the listing URL when the parser records one: a parser may publish a different
    // canonical sourceUrl for attribution (SpoolmanDB cites the vendor file permalink while
    // listing rows as <file>#<index>), and keying on sourceUrl alone re-appends every row.
    const done = new Set(rows.map((r) => r.sourceKey || r.sourceUrl).filter(Boolean));

    const mod = await import(`./parsers/${name}.mjs`);
    let urls;
    try {
      urls = await mod.listProducts();
    } catch (e) {
      await log(`ERROR ${name} listProducts: ${e.message}`);
      summary.push({ name, listed: 'ERR', parsed: 0, total: rows.length });
      continue;
    }

    const pending = urls.filter((u) => !done.has(u));
    await log(`${name}: ${urls.length} listed, ${done.size} already saved, ${pending.length} pending`);

    let parsed = 0;
    for (const url of pending) {
      if (parsed >= MAX) break;
      try {
        const p = await mod.parseProduct(url);
        if (p) {
          // Record the listing URL so a resume can tell this row was already fetched even when
          // the parser publishes a different canonical sourceUrl for attribution.
          if (p.sourceUrl !== url) p.sourceKey = url;
          rows.push(p);
          done.add(url);
          parsed++;
          await log(`${name} ok ${p.brand} (nozzle ${p.nozzleTemp}°C / bed ${p.bedTemp}°C) ${url}`);
        }
      } catch (e) {
        await log(`ERROR ${name} ${url}: ${e.message}`);
      }
      if (rows.length % FLUSH_EVERY === 0) {
        await mergeWrite(outFile, rows);
      }
    }
    const total = await mergeWrite(outFile, rows);
    summary.push({ name, listed: urls.length, parsed, total });
    } finally {
      await rm(lockFile, { force: true });
    }
  }

  await log('=== run done ===');
  for (const s of summary) {
    process.stdout.write(`${s.name}: listed=${s.listed} new=${s.parsed} total=${s.total}\n`);
  }
}

main().catch(async (e) => {
  await log(`FATAL ${e.message}`);
  process.exitCode = 1;
});
