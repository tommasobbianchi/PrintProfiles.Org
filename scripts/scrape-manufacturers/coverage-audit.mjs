#!/usr/bin/env node
// Does every store we CAN enumerate actually get enumerated?
//
//   node scripts/scrape-manufacturers/coverage-audit.mjs           audit every enumerable host
//   node scripts/scrape-manufacturers/coverage-audit.mjs --json    machine-readable report
//   HOSTS=eryone3d.com node .../coverage-audit.mjs                 audit one host
//
// Three times now a hand-maintained list has decided what the crawler is ALLOWED to see, and
// three times nobody noticed until a human went looking for a spool that was missing:
//
//   Tinmorry, Inslogic   in brand-registry as 'shopify', absent from shopify.mjs BRANDS
//   Eryone               excluded from shopify.mjs because it "has its own parser" — and that
//                        bespoke parser saw 60 of 207 products, hiding the whole ASA line
//
// Every one of those was measurable the day it happened: the store publishes its own catalogue
// size, and we could count what we captured. Nothing compared the two numbers. This does.
//
// The anti-recurrence property is that this file keeps NO host list of its own. It reads the
// registry and the parsers' own BRANDS arrays, so a host added to one and forgotten in the
// other shows up here as a finding rather than as silence.

import { readFile, readdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { get } from './fetch.mjs';
import { BRANDS as REGISTRY } from './brand-registry.mjs';
import { BRANDS as SHOPIFY_BRANDS, isFilamentLike, detectType } from './parsers/shopify.mjs';
import { BRANDS as WOO_BRANDS } from './parsers/woocommerce.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const DATA = join(HERE, 'data');

// Counting PRODUCTS is the wrong denominator and the first version of this file got it wrong.
// Atomic Filament publishes 462 filament-like products that are one PCTG PRO line in 100 colours
// plus sample coils; collapsing those to 53 presets is the project's deliberate policy, not a
// bug. A raw product ratio calls that a 11% failure and would send someone to "fix" it by
// inflating the catalogue with colour duplicates.
//
// The colour-blind signal is MATERIAL COVERAGE: which filament types does the store sell, and do
// we hold at least one row for each? That is precisely what both historical bugs looked like —
// Eryone's store sold ASA and we had zero Eryone ASA rows; Tinmorry's sold TPU-GF and we had
// none. Colour count cannot mask it and cannot fake it.
//
// A type is only expected of us if the store lists at least this many products of it. One
// oddity in a 400-product catalogue may simply have no spec table to parse.
const MIN_PRODUCTS_PER_TYPE = Number(process.env.MIN_PRODUCTS_PER_TYPE) || 2;

// stdout carries the JSON payload in --json mode, so the shared fetch logger must not write to it.
if (process.argv.includes('--json')) process.env.QUIET = '1';

const HOST_FILTER = process.env.HOSTS ? process.env.HOSTS.split(',').map((h) => h.trim()) : null;

// Bespoke parsers announce the single host they cover via ORIGIN. Discovered by reading the
// parser directory — a new bespoke parser is picked up without editing this file.
async function bespokeHosts() {
  const out = new Map(); // host -> parser name
  for (const f of await readdir(join(HERE, 'parsers'))) {
    if (!f.endsWith('.mjs')) continue;
    const mod = await import(join(HERE, 'parsers', f));
    if (mod.ORIGIN) out.set(new URL(mod.ORIGIN).hostname, f.replace(/\.mjs$/, ''));
  }
  return out;
}

// ---------------------------------------------------------------- catalogue enumeration

async function shopifyCatalogue(host) {
  const products = [];
  let stale = false;
  for (let page = 1; page <= 20; page++) {
    const res = await get(`https://${host}/products.json?limit=250&page=${page}`);
    if (res.fromCache) stale = true;
    if (!res.ok) return page === 1 ? { error: res.status ? `HTTP ${res.status}` : 'unreachable' } : { products };
    let batch;
    try { batch = JSON.parse(res.body).products; } catch { return { error: 'not JSON' }; }
    if (!batch?.length) break;
    products.push(...batch);
  }
  return { products, stale };
}

async function wooCatalogue(host) {
  const products = [];
  let stale = false;
  for (let page = 1; page <= 20; page++) {
    const res = await get(`https://${host}/wp-json/wc/store/v1/products?per_page=100&page=${page}`);
    if (res.fromCache) stale = true;
    if (!res.ok) return page === 1 ? { error: res.status ? `HTTP ${res.status}` : 'unreachable' } : { products };
    let batch;
    try { batch = JSON.parse(res.body); } catch { return { error: 'not JSON' }; }
    if (!Array.isArray(batch) || !batch.length) break;
    // Normalise to the shape isFilamentLike expects.
    products.push(...batch.map((p) => ({ title: p.name, handle: p.slug, product_type: '', tags: [] })));
  }
  return { products, stale };
}

// ---------------------------------------------------------------- what we actually captured

// Every parser records the product URL it came from, so the captured set is the set of distinct
// source URLs whose host matches. That is platform-agnostic and needs no per-parser knowledge.
async function capturedByHost() {
  const byHost = new Map();
  const typesByHost = new Map();
  for (const f of await readdir(DATA)) {
    if (!f.endsWith('.json')) continue;
    let rows;
    try { rows = JSON.parse(await readFile(join(DATA, f), 'utf8')); } catch { continue; }
    if (!Array.isArray(rows)) continue;
    for (const r of rows) {
      if (!r?.sourceUrl) continue;
      let h;
      try { h = new URL(r.sourceUrl).hostname; } catch { continue; }
      if (!byHost.has(h)) byHost.set(h, new Set());
      byHost.get(h).add(r.sourceUrl);
      if (!typesByHost.has(h)) typesByHost.set(h, new Set());
      // Match on the type the importer will store, plus the type the store's own title implies —
      // a row filed as PA-CF still proves we saw the Nylon product it came from.
      if (r.filamentType) typesByHost.get(h).add(r.filamentType);
      typesByHost.get(h).add(detectType(`${r.brand ?? ''} ${r.profileName ?? ''}`));
    }
  }
  return { byHost, typesByHost };
}

// ---------------------------------------------------------------- audit

async function main() {
  const bespoke = await bespokeHosts();
  const { byHost: captured, typesByHost: capturedTypes } = await capturedByHost();
  const claimedShopify = new Set(SHOPIFY_BRANDS.map((b) => b.host));
  const claimedWoo = new Set(WOO_BRANDS.map((b) => b.host));

  // Only platforms whose catalogue we can enumerate can be audited at all. 'other', 'blocked'
  // and 'unresolved' are reported as unauditable rather than silently passing.
  const targets = REGISTRY
    .filter((b) => b.platform === 'shopify' || b.platform === 'woocommerce')
    .filter((b) => !HOST_FILTER || HOST_FILTER.includes(b.host));

  const findings = [];
  const rows = [];

  for (const b of targets) {
    const claimed = b.platform === 'shopify' ? claimedShopify.has(b.host) : claimedWoo.has(b.host);
    const bespokeParser = bespoke.get(b.host) ?? null;
    const cat = b.platform === 'shopify' ? await shopifyCatalogue(b.host) : await wooCatalogue(b.host);

    if (cat.error) {
      rows.push({ ...b, status: 'unauditable', reason: cat.error, claimed, bespokeParser });
      continue;
    }

    const listed = cat.products.length;
    const filament = cat.products.filter(isFilamentLike);
    const got = captured.get(b.host)?.size ?? 0;

    // What the store sells, by material, ignoring colour entirely.
    const storeTypes = new Map();
    for (const p of filament) {
      const t = detectType(p.title);
      if (t === 'Other') continue;          // unclassifiable title is not evidence of a gap
      storeTypes.set(t, (storeTypes.get(t) ?? 0) + 1);
    }
    const expected = [...storeTypes].filter(([, n]) => n >= MIN_PRODUCTS_PER_TYPE).map(([t]) => t);
    const held = capturedTypes.get(b.host) ?? new Set();
    const missing = expected.filter((t) => !held.has(t));
    const coverage = expected.length ? (expected.length - missing.length) / expected.length : 1;

    // A catalogue read from cache is not evidence about the live store: dasfilament.de was
    // reported as publishing 384 products from a cache entry while the live endpoint 404s.
    // Acting on that would send someone to chase products that no longer exist.
    rows.push({ ...b, status: 'ok', listed, filamentLike: filament.length, captured: got, stale: cat.stale,
                expectedTypes: expected, missingTypes: missing, coverage, claimed, bespokeParser });

    // UNCLAIMED — the registry says this store is enumerable and no generic parser lists it.
    // A bespoke parser only excuses that if it is actually keeping up (checked next).
    if (!claimed && !bespokeParser) {
      findings.push({ level: 'FAIL', kind: 'unclaimed', host: b.host, manufacturer: b.manufacturer,
        detail: `platform '${b.platform}' in brand-registry but absent from parsers/${b.platform}.mjs BRANDS — never crawled` });
    }

    // SHADOWED — a bespoke parser is standing in front of an enumerable store. That is only
    // justified while it collects at least as much; Eryone's collected 29%.
    if (!claimed && bespokeParser && missing.length) {
      findings.push({ level: 'FAIL', kind: 'shadowed', host: b.host, manufacturer: b.manufacturer,
        detail: `bespoke parser '${bespokeParser}' holds no rows for ${missing.join(', ')} although the store sells ${missing.map((t) => `${t}\u00d7${storeTypes.get(t)}`).join(', ')} — the generic ${b.platform} parser would enumerate all ${listed}` });
    }

    // COVERAGE — claimed and crawled, but most of the catalogue never landed.
    if (claimed && missing.length) {
      findings.push({ level: 'FAIL', kind: 'material-gap', stale: cat.stale, host: b.host, manufacturer: b.manufacturer,
        detail: `no rows for ${missing.map((t) => `${t} (store lists ${storeTypes.get(t)})`).join(', ')} — ${got} rows held across ${expected.length - missing.length}/${expected.length} materials` });
    }
  }

  if (process.argv.includes('--json')) {
    console.log(JSON.stringify({ minProductsPerType: MIN_PRODUCTS_PER_TYPE, rows, findings }, null, 2));
  } else {
    console.log(`${'manufacturer'.padEnd(18)}${'host'.padEnd(26)}${'listed'.padStart(7)}${'filament'.padStart(9)}${'captured'.padStart(9)}${'cov'.padStart(6)}  claimedBy`);
    for (const r of rows.sort((a, b2) => (a.coverage ?? 9) - (b2.coverage ?? 9))) {
      if (r.status === 'unauditable') {
        console.log(`${r.manufacturer.slice(0, 17).padEnd(18)}${r.host.padEnd(26)}${'—'.padStart(7)}${'—'.padStart(9)}${'—'.padStart(9)}${'—'.padStart(6)}  unauditable: ${r.reason}`);
        continue;
      }
      const by = r.claimed ? r.platform : (r.bespokeParser ? `bespoke:${r.bespokeParser}` : 'NOBODY');
      console.log(`${r.manufacturer.slice(0, 17).padEnd(18)}${r.host.padEnd(26)}${String(r.listed).padStart(7)}${String(r.filamentLike).padStart(9)}${String(r.captured).padStart(9)}${(r.coverage * 100).toFixed(0).padStart(5)}%  ${by}`);
    }
    console.log();
    for (const f of findings) console.log(`${f.level} ${f.kind}${f.stale ? ' [catalogue read from cache — confirm the store is still live before crawling]' : ''}: ${f.manufacturer} (${f.host}) — ${f.detail}`);
    console.log(`\n${findings.length} finding(s); ${rows.filter((r) => r.status === 'unauditable').length} host(s) unauditable; a material counts as sold at >=${MIN_PRODUCTS_PER_TYPE} products`);
  }

  process.exit(findings.length ? 1 : 0);
}

main();
