#!/usr/bin/env node
// Runs every parser in sequence and writes data/<parser>.json incrementally.
//
//   MAX_PER_PARSER=2 node scripts/scrape-manufacturers/run-all.mjs   # smoke run
//   node scripts/scrape-manufacturers/run-all.mjs                    # full run
//
// Resumable: on start it reloads existing data/<parser>.json and skips URLs already there.
// Per-product errors are logged and skipped, never fatal.

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { log } from './fetch.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const DATA = join(HERE, 'data');
const MAX = Number(process.env.MAX_PER_PARSER) || Infinity;
const FLUSH_EVERY = 5;

const PARSERS = ['prusament', 'fiberlogy', 'extrudr', 'fillamentum', 'eryone', 'shopify', 'woocommerce'];

async function main() {
  await mkdir(DATA, { recursive: true });
  await log(`=== run start === MAX_PER_PARSER=${Number.isFinite(MAX) ? MAX : 'unlimited'}`);

  const summary = [];

  for (const name of PARSERS) {
    const outFile = join(DATA, `${name}.json`);
    let rows = [];
    try {
      const existing = JSON.parse(await readFile(outFile, 'utf8'));
      if (Array.isArray(existing)) rows = existing;
    } catch {
      rows = [];
    }
    const done = new Set(rows.map((r) => r.sourceUrl).filter(Boolean));

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
          rows.push(p);
          done.add(url);
          parsed++;
          await log(`${name} ok ${p.brand} (nozzle ${p.nozzleTemp}°C / bed ${p.bedTemp}°C) ${url}`);
        }
      } catch (e) {
        await log(`ERROR ${name} ${url}: ${e.message}`);
      }
      if (rows.length % FLUSH_EVERY === 0) {
        await writeFile(outFile, JSON.stringify(rows, null, 2));
      }
    }
    await writeFile(outFile, JSON.stringify(rows, null, 2));
    summary.push({ name, listed: urls.length, parsed, total: rows.length });
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
