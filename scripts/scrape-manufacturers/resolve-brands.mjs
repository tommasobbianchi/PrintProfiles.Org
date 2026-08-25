#!/usr/bin/env node
// Probes every brand in brand-registry.mjs and prints what platform its store actually runs.
// Print-only: it writes no files, and it never edits the registry. When the table disagrees
// with brand-registry.mjs, update the registry by hand from this output.
//
//   node scripts/scrape-manufacturers/resolve-brands.mjs
//   node scripts/scrape-manufacturers/resolve-brands.mjs shopify     # only rows whose baked platform is 'shopify'
//   node scripts/scrape-manufacturers/resolve-brands.mjs SUNLU eSUN  # only these manufacturers
//   CONCURRENCY=8 node scripts/scrape-manufacturers/resolve-brands.mjs
//
// Every request goes through fetch.mjs: robots gate, >=1.5 s per-domain floor, disk cache.
// Concurrency is across DIFFERENT hosts only, so the per-domain floor is never shortened.

import { BRANDS, probeHost } from './brand-registry.mjs';

const CONCURRENCY = Number(process.env.CONCURRENCY) || 6;
const PLATFORMS = new Set(['shopify', 'woocommerce', 'other', 'blocked', 'unresolved']);

function select(argv) {
  const args = argv.filter((a) => !a.startsWith('-'));
  if (!args.length) return BRANDS;
  const wantPlatform = args.filter((a) => PLATFORMS.has(a.toLowerCase())).map((a) => a.toLowerCase());
  const wantName = args.filter((a) => !PLATFORMS.has(a.toLowerCase())).map((a) => a.toLowerCase());
  return BRANDS.filter(
    (b) => wantPlatform.includes(b.platform) || wantName.includes(b.manufacturer.toLowerCase()),
  );
}

async function mapLimit(items, limit, fn) {
  const out = new Array(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      for (;;) {
        const i = next++;
        if (i >= items.length) return;
        out[i] = await fn(items[i], i);
      }
    }),
  );
  return out;
}

const pad = (s, n) => String(s ?? '').padEnd(n).slice(0, n);

async function main() {
  const rows = select(process.argv.slice(2));
  if (!rows.length) {
    process.stderr.write('no brands matched\n');
    process.exitCode = 1;
    return;
  }

  const results = await mapLimit(rows, CONCURRENCY, async (b) => {
    try {
      return { b, r: await probeHost(b.host) };
    } catch (e) {
      return { b, r: { platform: 'other', robots: '?', products: null, detail: `probe error: ${e.message}` } };
    }
  });

  const head =
    `${pad('brand', 24)}| ${pad('host', 28)}| ${pad('platform', 12)}| ${pad('robots', 24)}| ${pad('products', 8)}| detail`;
  process.stdout.write(`${head}\n${'-'.repeat(head.length)}\n`);

  const tally = {};
  for (const { b, r } of results) {
    tally[r.platform] = (tally[r.platform] || 0) + 1;
    const drift = r.platform !== b.platform ? `  <-- registry says '${b.platform}'` : '';
    process.stdout.write(
      `${pad(b.manufacturer, 24)}| ${pad(b.host ?? '-', 28)}| ${pad(r.platform, 12)}| ${pad(r.robots, 24)}| ${pad(r.products ?? '-', 8)}| ${r.detail}${drift}\n`,
    );
  }

  process.stdout.write(`\n${results.length} brands probed\n`);
  for (const [k, v] of Object.entries(tally).sort((a, b) => b[1] - a[1])) {
    process.stdout.write(`  ${pad(k, 12)} ${v}\n`);
  }
}

main().catch((e) => {
  process.stderr.write(`FATAL ${e.stack}\n`);
  process.exitCode = 1;
});
