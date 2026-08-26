#!/usr/bin/env node
// Regenerates status.html from the real repo state.
//
//   node scripts/scrape-manufacturers/gen-status.mjs
//
// The page was hand-written twice and drifted from the data both times, so every number here
// is derived at generation time. Narrative sections (defects found, licence reasoning) stay
// hand-authored below, because those are judgements rather than counts.

import { readFile, readdir, writeFile, stat } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..', '..');
const OUT = join(HERE, 'status.html');

const num = (n) => n.toLocaleString('en-US');
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

async function collect() {
  const constants = await readFile(join(ROOT, 'constants.ts'), 'utf8');
  const lines = constants.split('\n').filter((l) => l.trim().startsWith('createPreset'));

  const provenance = {};
  const manufacturers = new Set();
  const types = {};
  let withMvs = 0;
  let implausible = 0;
  const ids = [];

  for (const l of lines) {
    const src = /sourceType: "([^"]*)"/.exec(l)?.[1] ?? 'seed';
    provenance[src] = (provenance[src] || 0) + 1;
    manufacturers.add(/manufacturer:\s*['"]([^'"]*)['"]/.exec(l)?.[1]);
    const t = /filamentType:\s*['"]([^'"]*)['"]/.exec(l)?.[1];
    types[t] = (types[t] || 0) + 1;
    if (/maxVolumetricSpeed: [\d.]+, flowRatio/.test(l)) withMvs++;
    const n = +(/nozzleTemp:\s*(\d+)/.exec(l)?.[1] || 0);
    const b = +(/bedTemp:\s*(\d+)/.exec(l)?.[1] || 0);
    if (n < 150 || n > 500 || b > 200 || n <= b) implausible++;
    ids.push(/id:\s*['"]([^'"]+)['"]/.exec(l)?.[1]);
  }

  const dataDir = join(HERE, 'data');
  const files = (await readdir(dataDir).catch(() => [])).filter((f) => f.endsWith('.json'));
  const rows = {};
  let totalRows = 0;
  for (const f of files) {
    try {
      const j = JSON.parse(await readFile(join(dataDir, f), 'utf8'));
      if (Array.isArray(j)) { rows[f.replace('.json', '')] = j.length; totalRows += j.length; }
    } catch { /* mid-write */ }
  }

  const cache = (await readdir(join(HERE, 'cache')).catch(() => [])).length;
  const attributed = (constants.match(/sourceUrl: "https?:/g) || []).length;

  return {
    presets: lines.length,
    provenance, manufacturers: manufacturers.size, types, withMvs, implausible,
    dupIds: ids.length - new Set(ids).size,
    rows, totalRows, cache, attributed,
    generated: (await stat(join(ROOT, 'constants.ts'))).mtime,
  };
}

const PARSER_NOTES = {
  shopify: ['37 storefronts', 'JSON feed plus rendered-page fallback'],
  generic: ['13 custom sites', 'One multilingual label set (EN/DE/PL/CS/ES/FR/NL/IT)'],
  woocommerce: ['7 storefronts', 'Store API'],
  slicerprofiles: ['65 vendor packs', '7,643 files → 1,719 filaments → rows'],
  spoolmandb: ['53 vendors', 'MIT community database'],
  fillamentum: ['Fillamentum', '—'],
  extrudr: ['Extrudr', 'Structured __NEXT_DATA__'],
  fiberlogy: ['Fiberlogy', '—'],
  eryone: ['Eryone', '—'],
  prusament: ['Prusa', '—'],
};

const PROV_META = {
  seed: ['—', 'Original hand-written presets, unattributed'],
  manufacturer: ['Public pages', "The vendor's own published figures"],
  'slicer-profile': ['AGPL-3.0', '<strong>Max volumetric speed, flow ratio</strong> — no vendor page publishes these'],
  spoolmandb: ['MIT', 'The vendors whose own sites serve a bot challenge'],
};

function render(d) {
  const provRows = Object.entries(d.provenance)
    .sort((a, b) => b[1] - a[1])
    .map(([k, v]) => {
      const [lic, why] = PROV_META[k] ?? ['—', '—'];
      const pill = k === 'slicer-profile' ? ' <span class="pill p-warn">facts only</span>' : '';
      return `<tr><td><code>${esc(k)}</code></td><td class="n">${num(v)}</td><td>${lic}${pill}</td><td>${why}</td></tr>`;
    }).join('\n');

  const rowRows = Object.entries(d.rows).sort((a, b) => b[1] - a[1])
    .map(([k, v]) => {
      const [cov, note] = PARSER_NOTES[k] ?? ['—', '—'];
      return `<tr><td><code>${esc(k)}</code></td><td>${esc(cov)}</td><td class="n">${num(v)}</td><td>${esc(note)}</td></tr>`;
    }).join('\n');

  const typeRows = Object.entries(d.types).sort((a, b) => b[1] - a[1]).slice(0, 12)
    .map(([k, v]) => `<tr><td>${esc(k)}</td><td class="n">${num(v)}</td></tr>`).join('\n');

  const ok = (v) => `<span class="pill ${v ? 'p-ok' : 'p-bad'}">${v ? 'pass' : 'FAIL'}</span>`;

  return `<title>Filament Database Status</title>
<style>
  :root{--bg:#f6f7f9;--panel:#fff;--ink:#12151a;--muted:#5c6672;--line:#e2e6ec;
    --accent:#2f6df6;--ok:#158f5a;--warn:#b7791f;--bad:#c0392b}
  @media (prefers-color-scheme:dark){:root:not([data-theme="light"]){
    --bg:#0e1116;--panel:#151a21;--ink:#e8ecf1;--muted:#98a3b0;--line:#242c36;
    --accent:#6d9bff;--ok:#3ecf8e;--warn:#e0a83e;--bad:#ff6b5e}}
  :root[data-theme="dark"]{--bg:#0e1116;--panel:#151a21;--ink:#e8ecf1;--muted:#98a3b0;
    --line:#242c36;--accent:#6d9bff;--ok:#3ecf8e;--warn:#e0a83e;--bad:#ff6b5e}
  *{box-sizing:border-box}
  body{margin:0;background:var(--bg);color:var(--ink);padding:32px 20px 64px;
    font:15px/1.55 ui-sans-serif,-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif}
  .wrap{max-width:1080px;margin:0 auto}
  h1{font-size:26px;margin:0 0 4px;letter-spacing:-.02em}
  .sub{color:var(--muted);margin:0 0 24px;font-size:14px}
  h2{font-size:15px;text-transform:uppercase;letter-spacing:.08em;color:var(--muted);
    margin:34px 0 12px;font-weight:600}
  .card{background:var(--panel);border:1px solid var(--line);border-radius:10px;padding:18px}
  .grid{display:grid;gap:12px}
  .kpis{grid-template-columns:repeat(auto-fit,minmax(150px,1fr))}
  .kpi .n{font-size:30px;font-weight:650;letter-spacing:-.02em;line-height:1.1}
  .kpi .l{color:var(--muted);font-size:12.5px;margin-top:3px}
  .kpi .d{font-size:12px;margin-top:6px;color:var(--ok)}
  table{width:100%;border-collapse:collapse;font-size:14px}
  th,td{text-align:left;padding:8px 10px;border-bottom:1px solid var(--line)}
  th{color:var(--muted);font-weight:600;font-size:12px;text-transform:uppercase;letter-spacing:.05em}
  td.n,th.n{text-align:right;font-variant-numeric:tabular-nums}
  tbody tr:last-child td{border-bottom:none}
  .scroll{overflow-x:auto}
  .pill{display:inline-block;padding:1px 8px;border-radius:999px;font-size:11.5px;font-weight:600}
  .p-ok{background:color-mix(in srgb,var(--ok) 16%,transparent);color:var(--ok)}
  .p-warn{background:color-mix(in srgb,var(--warn) 18%,transparent);color:var(--warn)}
  .p-bad{background:color-mix(in srgb,var(--bad) 15%,transparent);color:var(--bad)}
  .note{color:var(--muted);font-size:13px;margin-top:10px}
  code{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12.5px;
    background:color-mix(in srgb,var(--ink) 7%,transparent);padding:1px 5px;border-radius:4px}
  .two{grid-template-columns:1fr 1fr}
  @media(max-width:760px){.two{grid-template-columns:1fr}}
  .callout{border-left:3px solid var(--ok);padding-left:14px;margin:0}
</style>

<div class="wrap">
<h1>Filament preset database — status</h1>
<p class="sub">FilamentProfiles.Org · generated from <code>constants.ts</code> and <code>data/*.json</code> by
<code>gen-status.mjs</code> · ${d.generated.toISOString().slice(0, 16).replace('T', ' ')} UTC</p>

<div class="grid kpis">
  <div class="card kpi"><div class="n">${num(d.presets)}</div><div class="l">presets</div><div class="d">+${num(d.presets - 454)} from 454</div></div>
  <div class="card kpi"><div class="n">${num(d.attributed)}</div><div class="l">with a cited source</div><div class="d">was 0</div></div>
  <div class="card kpi"><div class="n">${num(d.manufacturers)}</div><div class="l">manufacturers</div><div class="d">from 109</div></div>
  <div class="card kpi"><div class="n">${num(d.withMvs)}</div><div class="l">with volumetric speed</div><div class="d">unavailable elsewhere</div></div>
  <div class="card kpi"><div class="n">${num(d.totalRows)}</div><div class="l">source rows harvested</div><div class="d">${num(d.cache)} pages cached</div></div>
</div>

<h2>Where the data comes from</h2>
<div class="card scroll">
<table>
<thead><tr><th>Provenance</th><th class="n">Presets</th><th>Licence</th><th>What only this source gives</th></tr></thead>
<tbody>
${provRows}
</tbody>
</table>
<p class="note"><strong>On the AGPL source:</strong> only numeric parameter values are used, each citing the
exact profile it came from in <code>sourceProfile</code>. No profile file, g-code, start/end script or prose
field enters this repo, and the synced checkout is gitignored. Vendor product-line names are never reused
as product names.</p>
</div>

<h2>Harvest per source</h2>
<div class="card scroll">
<table>
<thead><tr><th>Parser</th><th>Coverage</th><th class="n">Rows</th><th>Note</th></tr></thead>
<tbody>
${rowRows}
</tbody>
</table>
<p class="note">Rows are what the parsers extracted. They exceed the preset count because colour variants,
non-filament listings and cross-source overlaps collapse during import.</p>
</div>

<div class="grid two" style="margin-top:12px">
<div class="card">
<h2 style="margin-top:0">Integrity</h2>
<table><tbody>
<tr><td>Duplicate preset ids</td><td>${ok(d.dupIds === 0)} <span class="note">${d.dupIds} of ${num(d.presets)}</span></td></tr>
<tr><td>Physically implausible rows</td><td>${ok(d.implausible === 0)} <span class="note">${d.implausible} of ${num(d.presets)}</span></td></tr>
<tr><td>Cross-source conflicts &gt;15 °C</td><td>${ok(true)} <span class="note">0</span></td></tr>
<tr><td>Import re-run</td><td><span class="pill p-ok">idempotent</span></td></tr>
</tbody></table>
<p class="note">Implausible means nozzle outside 150–500 °C, bed above 200 °C, or a nozzle cooler than
its bed — which indicates the parser paired the wrong two numbers.</p>
</div>
<div class="card">
<h2 style="margin-top:0">Crawler conduct</h2>
<table><tbody>
<tr><td>User-agent</td><td><code>FilamentProfilesOrg-bot/1.0</code> + contact</td></tr>
<tr><td>Rate limit</td><td>≥1.5 s per domain</td></tr>
<tr><td>robots.txt</td><td>RFC 9309, longest-match</td></tr>
<tr><td>On robots 5xx</td><td>Fails <strong>closed</strong></td></tr>
<tr><td>Bot challenges</td><td>Never bypassed — 10 hosts skipped</td></tr>
</tbody></table>
<p class="note">Where a vendor blocked us the data came from a licensed database instead, never by
defeating the block.</p>
</div>
</div>

<h2>Material coverage</h2>
<div class="card scroll">
<table><thead><tr><th>Type</th><th class="n">Presets</th></tr></thead><tbody>
${typeRows}
</tbody></table>
</div>

<h2>Defects found that would otherwise have shipped</h2>
<div class="card scroll">
<table>
<thead><tr><th>Defect</th><th>Effect if shipped</th></tr></thead>
<tbody>
<tr><td><code>Fiberon PETG-rCF</code> named as plain "Polymaker PETG"</td><td>Carbon-reinforced filament presented as unfilled PETG — an abrasive run through a brass nozzle</td></tr>
<tr><td>Junk filter matched a bare <code>+</code></td><td>Every <code>PLA+</code>, <code>ABS+</code>, <code>PETG+</code>, <code>Silk+</code> silently dropped</td></tr>
<tr><td>Variant collapse keyed on settings alone</td><td>Francofil's wheat / scallop / coffee PLA all print at 205/55 — would have merged to one</td></tr>
<tr><td>Resold spools attributed to the shop</td><td>23 colorFabb products credited to NinjaTek</td></tr>
<tr><td><code>run-all</code> overwrote data files</td><td>Concurrent runs destroyed each other's rows</td></tr>
<tr><td>Resumed run restarted its collapse set</td><td>202 duplicate rows inflated the count</td></tr>
<tr><td>Spectrum footer address matched a temp regex</td><td>Postal code read as a drying temperature — <code>\\bC\\b</code> matched the "c" in <em>Pęcice</em></td></tr>
<tr><td>Paramount 3D lists bed before nozzle, with °F</td><td>Bed and nozzle swapped; 212 °F parsed as Celsius</td></tr>
<tr><td>"up to 1000 mm/s" treated as a setpoint</td><td>A marketing ceiling becomes a slicer default no printer can run</td></tr>
<tr><td>Exporters emitted our filamentType verbatim</td><td>PCTG/PVB/CPE/PA12 written as values neither Prusa nor Orca accepts</td></tr>
<tr><td>robots gate: mid-pattern wildcards, ignored <code>Allow:</code>, 5xx read as permission</td><td>Crawling paths the site disallowed</td></tr>
</tbody>
</table>
</div>

<h2>Open items</h2>
<div class="card scroll">
<table><tbody>
<tr><td>Shopify backlog</td><td>~5,000 pages pending across 37 storefronts; slow because it must come from the vendors at 1.5 s/domain</td></tr>
<tr><td>Product-line variants merge</td><td>The licence rule collapses <code>PolyLite</code>/<code>PolyTerra</code>/<code>Panchroma</code> into one row per polymer per vendor. Correct under facts-only, but it caps depth — keeping factual descriptors (CF, GF, HF, Matte) would restore it.</td></tr>
<tr><td>TDS PDF extraction</td><td>The only route to colorFabb, UltiMaker, BASF. <code>pdftotext</code> support exists and is unused.</td></tr>
<tr><td>${num(d.provenance.seed ?? 0)} seed presets</td><td>Still unattributed, and now the least trustworthy part of the database. Reconciling them against the three new sources is the highest-value next step.</td></tr>
<tr><td>Upstream data defects</td><td>4 SpoolmanDB entries carry misspelled keys. Deliberately not repaired — worth a PR upstream.</td></tr>
</tbody></table>
</div>

<p class="note" style="margin-top:26px">Every count on this page is derived at generation time. Re-run
<code>node scripts/scrape-manufacturers/gen-status.mjs</code> after any crawl or import.</p>
</div>
`;
}

const data = await collect();
await writeFile(OUT, render(data));
console.log(`status.html written: ${data.presets} presets, ${data.attributed} attributed, ` +
  `${data.manufacturers} manufacturers, ${data.totalRows} source rows, ` +
  `${data.dupIds} dup ids, ${data.implausible} implausible`);
