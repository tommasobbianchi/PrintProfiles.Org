#!/usr/bin/env node
// Generic Shopify filament parser, driven by a host table.
//
// Shopify exposes a public JSON endpoint on every store:
//   GET https://<host>/products.json?limit=250&page=N
//   -> { products: [ { id, title, handle, body_html, product_type, tags, variants:[{title}] } ] }
//
// One parser covers all stores: listProducts() paginates /products.json for every host in
// BRANDS and returns canonical product URLs; parseProduct() extracts specs from body_html
// (fast, already cached) and, when that has no nozzle/bed pair, FALLS BACK to the rendered
// product page — where several of these stores (Jayo, Elegoo, …) put the spec table even
// though they publish nothing in the JSON.
//
// Non-filament products (printers, resin, nozzles, dryers, spares, gift cards) have no
// nozzle/bed temp and simply parse to null.

import { get, decodeEntities } from '../fetch.mjs';
import { canonManufacturer } from '../manufacturer-aliases.mjs';

export const MANUFACTURER = 'Shopify'; // multi-brand; the real brand is per-BRAND below
export const ORIGIN = null;

export const BRANDS = [
  // NOTE: this list is the parser's own, NOT brand-registry.mjs. A brand can be marked
  // 'shopify' in the registry and still never be crawled if it is missing here — which is
  // exactly what kept Tinmorry and Inslogic out of the catalogue until 2026-08-26.
  { manufacturer: 'Elegoo',      host: 'elegoo.com' },
  // Both were long recorded unreachable for the wrong reason: the registry probed the apex
  // tinmorry.com (404s on /products.json) and inslogic.com (robots-disallowed), while the
  // real storefronts are on www and serve a plain Shopify feed that robots permits.
  { manufacturer: 'Tinmorry',    host: 'www.tinmorry.com' },
  { manufacturer: 'Inslogic',    host: 'www.inslogic3d.com' },
  { manufacturer: 'Overture',    host: 'overture3d.com' },
  { manufacturer: 'Jayo',        host: 'jayo3d.com' },
  { manufacturer: 'Protopasta',  host: 'proto-pasta.com' },
  { manufacturer: 'Amolen',      host: 'amolen.com' },
  { manufacturer: 'Siraya Tech', host: 'siraya.tech' },
  { manufacturer: 'Kexcelled',   host: 'kexcelled3d.com' },
  // Eryone WAS omitted here on the grounds that it "has its own parser". That bespoke parser
  // saw 60 of the 207 products the store actually publishes, so the entire ASA line — including
  // ASA Fiberglass, a real spool you can buy — was invisible. A hand-written parser is only a
  // reason to skip the generic path when it collects MORE, and this one collected less.
  { manufacturer: 'Eryone',      host: 'eryone3d.com' },
  // kexcelled.com serves a catalogue byte-identical to kexcelled3d.com (107 products, same
  // first title, measured 2026-08-27). It is crawled anyway by operator decision so that the
  // coverage audit has no silently-excluded host; the importer's settings-based dedupe absorbs
  // the overlap, which is why the duplicate costs rows in data/ but not presets in constants.ts.
  { manufacturer: 'Kexcelled',   host: 'kexcelled.com' },
  { manufacturer: 'Geeetech',        host: 'geeetech.com' },
  { manufacturer: 'FlashForge',      host: 'flashforge.com' },
  { manufacturer: 'Kingroon',        host: 'kingroon.com' },
  { manufacturer: 'Ziro',            host: 'ziro3d.com' },
  { manufacturer: 'TecBears',        host: 'tecbears.com' },
  { manufacturer: '3DHoJor',         host: '3dhojor.com' },
  { manufacturer: 'MarsWork',        host: 'marswork3d.com' },
  { manufacturer: 'Duramic 3D',      host: 'duramic3d.com' },
  { manufacturer: 'VoxelPLA',        host: 'voxelpla.com' },
  { manufacturer: 'LANDU',           host: 'landu3d.com' },
  { manufacturer: '3D-Fuel',         host: '3dfuel.com' },
  { manufacturer: 'Sovol',           host: 'sovol3d.com' },
  { manufacturer: 'SainSmart',       host: 'sainsmart.com' },
  { manufacturer: 'Voxelab',         host: 'voxelab3dp.com' },
  { manufacturer: 'Atomic Filament', host: 'atomicfilament.com' },
  { manufacturer: 'QIDI Tech',       host: 'qidi3d.com' },
  { manufacturer: 'Numakers',        host: 'numakers.com' },
  { manufacturer: 'PrimaCreator',    host: 'primacreator.com' },
  { manufacturer: 'Recreus',         host: 'recreus.com' },
  { manufacturer: '3DXTech',         host: '3dxtech.com' },
  { manufacturer: 'Polar Filament',  host: 'polarfilament.com' },
  { manufacturer: 'COEX',            host: 'coex3d.com' },
  { manufacturer: 'Push Plastic',    host: 'pushplastic.com' },
  { manufacturer: 'Filaments.CA',    host: 'filaments.ca' },
  { manufacturer: 'GreenGate3D',     host: 'greengate3d.com' },
  { manufacturer: 'X3D',             host: 'x3d.com.au' },
  { manufacturer: 'Copymaster3D',    host: 'copymaster3d.com' },
  // R3D's registry host was r3d.store, which 404s. The real storefront is www.r3dprint.com —
  // the fourth time a wrong host, not an unreachable brand, is what kept a vendor out.
  { manufacturer: 'R3D',             host: 'www.r3dprint.com' },
  { manufacturer: 'Anycubic',        host: 'store.anycubic.com' },
  // A multi-brand retailer, not a maker. `vendorField` takes the manufacturer from each
  // product's Shopify `vendor` rather than the host, because filamentor.it carries two house
  // lines nobody else sells (Prof. Lab 195 products, Smart Print 171) alongside eSUN and
  // Polymaker spools it merely resells. Attributing the whole catalogue to one name would both
  // invent a manufacturer and hide the two real ones. The importer's existing resold-brand test
  // is what drops the eSUN/Polymaker rows.
  // `localePrefix` because this store's default locale is Italian ("Ugello: 230-260 °C",
  // "Piano: 90-110 °C") and every spec label here is English. Fetching /en/ is a per-host fix;
  // teaching the shared label list Italian would change matching for ~40 other stores to serve
  // one, which is exactly the loosening that has corrupted rows here before.
  { manufacturer: 'Filamentor',      host: 'filamentor.it', vendorField: true, localePrefix: '/en' },
];

// ---------- shared helpers (same heuristics as eryone.mjs) ----------
export const detectType = (name) => {
  // Negative tags ("not-tpu", "not-pla") are explicit non-matches, not material hints. A
  // "not-tpu" tag on an ABS product was mis-classifying it as TPU (SainSmart), so strip them
  // before any pattern runs. Confined to the detector, not the shared temperature regexes.
  const s = String(name || '').replace(/\bnot-[a-z0-9-]+\b/gi, ' ').toUpperCase();
  if (/PA[ -]?CF|NYLON.*CF|CF.*NYLON|CARBON.*NYLON|NYLON.*CARBON/.test(s)) return 'PA-CF';
  if (/PA[ -]?GF|NYLON.*GLASS|GLASS.*NYLON/.test(s)) return 'PA-GF';
  // \b guards so short codes don't match inside longer words (TPE inside HTPETG, PC inside PCTG).
  if (/\bTPE\b/.test(s)) return 'TPE';
  if (/\bTPU\b/.test(s)) return 'TPU';
  if (/\bPEBA\b/.test(s)) return 'PEBA';
  if (/PETG|PET-G/.test(s)) return 'PETG';
  if (/\bABS\b/.test(s)) return 'ABS';
  if (/\bASA\b/.test(s)) return 'ASA';
  if (/\bPC\b|POLYCARBON/.test(s)) return 'PC';
  if (/\bCPE\b|COPOLYESTER|PETT/.test(s)) return 'Copolyester';
  if (/NYLON|PA6|PA11|PA12|POLYAMIDE/.test(s)) return 'Nylon';
  if (/WOOD/.test(s)) return 'PLA';
  // "PLA" must not match inside "PLATINUM" or "PLASTIC". Siraya's "Platinum Silicone" is a
  // two-part mould rubber and MarsWork's "Plastic Reusable Spool S1" is an empty spool; the
  // bare /PLA/ typed both as PLA, and the coverage audit then read them as the store selling
  // PLA — inventing gaps that never existed. PLA+, PLA-CF, Silk PLA and HTPLA still match.
  // (PLATINUM found by the DeepSeek worker.)
  if (/PLA(?!TIN|STIC)/.test(s)) return 'PLA';
  return 'Other';
};

const nums = (s) => [...String(s).matchAll(/\d+(?:\.\d+)?/g)].map((m) => parseFloat(m[0]));
const mid = (v) => {
  const n = nums(v);
  if (!n.length) return undefined;
  return Math.round(n.length >= 2 ? (n[0] + n[1]) / 2 : n[0]);
};

// Strip tags, decode entities, normalise the celsius sign, collapse whitespace.
const strip = (html) => decodeEntities(String(html || ''))
  .replace(/<script[\s\S]*?<\/script>/gi, '')
  .replace(/<style[\s\S]*?<\/style>/gi, '')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&deg;|℃|º/g, '°')
  .replace(/\s+/g, ' ')
  .trim();

// A temperature value: a digit, then a run of digits/dots/commas/spaces/°/C/~ and dashes.
// This accepts both "200-230°C" and the interleaved "200°C-230°C", and "270 ~ 310 ℃".
const TEMP_VAL = `[0-9][0-9.,\\s°C~–—-]*`;
// Labels are followed by an optional connector.
// JSON path (body_html) tolerates prose connectors ("from"/"up to") because Protopasta
// publishes its temps that way. The rendered-page fallback is stricter: "up to N" is a
// ceiling, not a setpoint, so the fallback must not read it as the value.
const CONN_LOOSE = `(?:of|at|is|from|up\\s+to|=|:)?`;
const CONN_STRICT = `(?:of|at|is|=|:)?`;
const NOZZLE_RE = new RegExp(`(?:nozzle|print(?:ing)?|extruder|hot\\s*end|hotend)\\s*(?:temp(?:erature)?s?)?\\s*${CONN_LOOSE}\\s*(${TEMP_VAL})`, 'i');
const BED_RE = new RegExp(`(?:heated\\s*bed|build\\s*plate|print\\s*bed|heat\\s*bed|bed)\\s*(?:temp(?:erature)?s?)?\\s*${CONN_LOOSE}\\s*(${TEMP_VAL})`, 'i');
// Strict (rendered page) regexes: the value holds only digits/ranges (no unit inside), and a
// lookahead requires a real temperature unit ("°C"/"°"/"C") right after — this is what keeps
// "Printing 3D Printers" (nav/footer noise) from yielding nozzleTemp 3.
const TEMP_VAL_STRICT = `[0-9][0-9.,\\s~–—-]*`;
const UNIT = `(?=\\s*(?:°\\s*C?|℃|C\\b))`;
const NOZZLE_RE_STRICT = new RegExp(`(?:nozzle|print(?:ing)?|extruder|hot\\s*end|hotend)\\s*(?:temp(?:erature)?s?)?\\s*${CONN_STRICT}\\s*(${TEMP_VAL_STRICT})${UNIT}`, 'i');
const BED_RE_STRICT = new RegExp(`(?:heated\\s*bed|build\\s*plate|print\\s*bed|heat\\s*bed|bed)\\s*(?:temp(?:erature)?s?)?\\s*${CONN_STRICT}\\s*(${TEMP_VAL_STRICT})${UNIT}`, 'i');

// ---------- labelled spec block ----------
//
// Some stores publish a "Printing Settings" panel of `Label: value` pairs, and write labels
// the general patterns cannot read:
//
//   Nozzle Temperature & Printing Speed: 215-245 °C, 50-200mm/s
//   Bed Temperature: not heated with glue, heated 70-80 °C can not be coated with glue
//
// The first buries the value behind a compound label; the second behind a caveat. Loosening
// the page-wide patterns to cope was tried and rejected: free text gave them room to wander
// to the next number on the page, silently changing four already-correct rows (FlashForge
// PET-GF fell from 275 °C to 100 °C).
//
// So the relaxation is confined to the block instead. This finds the panel, keeps only the
// text up to the next section, and reads the labels there. A store without such a panel takes
// exactly the path it always did — which is what makes this safe to add.
const SPEC_HEAD = /(?:printing|print|recommended|suggested)\s+(?:settings|parameters)/i;
const SPEC_END = /\*\s*(?:the|all)\s|downloads|specifications|description|reviews/i;

function specBlockTemps(text) {
  // The heading occurs more than once: these pages carry a tab strip ("Description
  // Specifications Printing Settings Downloads") long before the panel itself, and slicing at
  // the first hit yields nothing but nav. So try every occurrence and keep the first that
  // actually reads as a spec block.
  for (const m of text.matchAll(new RegExp(SPEC_HEAD.source, 'gi'))) {
    const got = readSpecBlock(text.slice(m.index, m.index + 700));
    if (got) return got;
  }
  return null;
}

function readSpecBlock(slice) {
  let block = slice;
  const end = block.slice(40).search(SPEC_END);
  if (end !== -1) block = block.slice(0, end + 40);

  // Inside the block a label owns everything up to the next label, so the value may sit
  // behind words — but never behind another colon, which is where the next label starts.
  const pick = (labels) => {
    const re = new RegExp(`(?:${labels})[^:0-9°]{0,40}:[^0-9°]{0,40}?([0-9][0-9.,\\s~–—-]*)(?=\\s*(?:°\\s*C?|℃|C\\b))`, 'i');
    return mid((re.exec(block) || [])[1]);
  };
  const nozzleTemp = pick('nozzle|extruder|hot\\s*end|hotend');
  const bedTemp = pick('heated\\s*bed|build\\s*plate|print\\s*bed|heat\\s*bed|bed');
  if (!okNozzle(nozzleTemp) || !okBed(bedTemp)) return null;
  return { nozzleTemp, bedTemp };
}

// Plausibility guards: throw away obvious non-temperatures (print size, build volume, …).
const okNozzle = (n) => n !== undefined && n >= 100 && n <= 450;
const okBed = (n) => n !== undefined && n >= 0 && n <= 200;

// Drop Fahrenheit values ("400 °F", "392-410°F", "446℉") so they are never read as °C.
const stripFahrenheit = (t) => String(t || '')
  .replace(/\d[\d.,\s–—~-]*°?\s*[Ff]\b/g, ' ')
  .replace(/\d[\d.,\s–—~-]*℉/g, ' ');

function tempsFrom(text, strict) {
  const t = stripFahrenheit(strip(text));
  const n = mid(((strict ? NOZZLE_RE_STRICT : NOZZLE_RE).exec(t) || [])[1]);
  const b = mid(((strict ? BED_RE_STRICT : BED_RE).exec(t) || [])[1]);
  if (!okNozzle(n) || !okBed(b)) return null;
  return { nozzleTemp: n, bedTemp: b };
}

// ---------- per-host spec extractors ----------
//
// A store whose specs live in a page structure the shared patterns cannot read gets a bounded
// extractor keyed by host. Each runs ONLY for that host, before the shared patterns, and is
// confined to that vendor's own labels/structure (SPEC §5 G3) — a relaxation here can never leak
// into the page-wide NOZZLE_RE/BED_RE the other ~40 stores share. Extractors receive the raw
// rendered HTML plus its stripped text and return { nozzleTemp, bedTemp } | null.

// Midpoint of a two-number range, refusing inverted ranges ("190 - 110C" is a vendor typo, not a
// range; averaging it shipped a 150 °C bed — same guard as the WooCommerce parser's mid()).
const rangeMid = (a, b) => {
  const lo = Number(a); const hi = Number(b);
  if (Number.isNaN(lo) || Number.isNaN(hi)) return undefined;
  if (lo > hi) return undefined;
  return Math.round((lo + hi) / 2);
};

const recreusSpecs = (html, text) => {
  // Spanish store. Nozzle: the nozzle-specs table's "Temperatura" column; the first data cell
  // holding a temperature is the 0.4 mm default row. Bed: "Temperatura de la Cama" section,
  // "Primera Capa" is the first published value.
  const n = /nozzle-specs[\s\S]{0,600}?<td[^>]*>\s*(\d{1,3})\s*°\s*C\s*<\/td>/i.exec(html);
  const b = /temperatura\s+de\s+la\s+cama[\s\S]{0,400}?primera\s+capa\s*:\s*(\d{1,3})\s*°\s*C/i.exec(html);
  const nozzleTemp = n ? Number(n[1]) : undefined;
  const bedTemp = b ? Number(b[1]) : undefined;
  if (!okNozzle(nozzleTemp) || !okBed(bedTemp)) return null;
  return { nozzleTemp, bedTemp };
};

const filamentsCaSpecs = (html, text) => {
  // Two coexisting formats: the newer Hyper lines use "Nozzle Temperature: X°C" (read by the
  // shared patterns); the older lines write "Print Settings: 200°C - 240°C" plus
  // "print bed temperature to approximately 75-85°C", and ABS writes
  // "Printing Temperature: Notes: 230°C + Heated bed: 110°C" (where "110" is split by a <span>
  // and arrives as "11 0°C" after stripping).
  let nozzleTemp;
  let bedTemp;
  const n = /print\s+settings\s*:\s*(\d{2,3})\s*(?:°\s*C)?\s*[-–]\s*(\d{2,3})\s*°\s*C/i.exec(text);
  if (n) nozzleTemp = rangeMid(n[1], n[2]);
  const b = /bed\s+temperature[^0-9]{0,30}(\d{2,3})\s*(?:°\s*C)?\s*[-–]\s*(\d{2,3})\s*°\s*C/i.exec(text);
  if (b) bedTemp = rangeMid(b[1], b[2]);
  if (nozzleTemp === undefined) {
    const n2 = /printing\s+temperature[^0-9]{0,30}(\d{2,3})\s*°\s*C/i.exec(text);
    if (n2) nozzleTemp = Number(n2[1]);
  }
  if (bedTemp === undefined) {
    const b2 = /heated\s+bed\s*:\s*(\d{1,3})\s*(\d)?\s*°\s*C/i.exec(text);
    if (b2) bedTemp = Number(b2[1] + (b2[2] || ''));
  }
  if (!okNozzle(nozzleTemp) || !okBed(bedTemp)) return null;
  return { nozzleTemp, bedTemp };
};

const qidiSpecs = (html, text) => {
  // "Nozzle Temperature 300-340 °C" and "Bed Temperature (with Glue) 70-80 °C" — the shared
  // patterns fail on the "(with Glue)" parenthetical and on the value-with-unit range.
  const n = /nozzle\s+temperature[^0-9]{0,20}(\d{2,3})\s*[-–]\s*(\d{2,3})\s*°\s*C/i.exec(text);
  const b = /bed\s+temperature[^0-9]{0,30}(\d{2,3})\s*[-–]\s*(\d{2,3})\s*°\s*C/i.exec(text);
  if (!n || !b) return null;
  const nozzleTemp = rangeMid(n[1], n[2]);
  const bedTemp = rangeMid(b[1], b[2]);
  if (!okNozzle(nozzleTemp) || !okBed(bedTemp)) return null;
  return { nozzleTemp, bedTemp };
};

const geeetechSpecs = (html, text) => {
  // ASA: "nozzle temperature: 240 to 270℃" + "Heat platform temperature- 80 to 110℃".
  // PETG: "Recommended extruding temperature 220-240°C" + "heatbed temperature 80-90°C".
  // The "to" range separator and the ℃/° sign are what the shared patterns cannot read.
  const n = /(?:nozzle|extruding)\s+temperature\s*[:.-]?\s*(\d{2,3})\s*(?:to|-)\s*(\d{2,3})\s*°/i.exec(text);
  const b = /(?:(?:heat\s+)?platform|heatbed)\s+temperature\s*[:.-]?\s*(\d{2,3})\s*(?:to|-)\s*(\d{2,3})\s*°/i.exec(text);
  if (!n || !b) return null;
  const nozzleTemp = rangeMid(n[1], n[2]);
  const bedTemp = rangeMid(b[1], b[2]);
  if (!okNozzle(nozzleTemp) || !okBed(bedTemp)) return null;
  return { nozzleTemp, bedTemp };
};

const x3dSpecs = (html, text) => {
  // "Printing Temperature Range 250 – 270 °C" and "Buildplate Temperature 90 – 105 °C".
  const n = /printing\s+temperature\s+range[^0-9]{0,12}(\d{2,3})\s*[-–]\s*(\d{2,3})\s*°/i.exec(text);
  const b = /build\s*plate\s*temperature[^0-9]{0,12}(\d{2,3})\s*[-–]\s*(\d{2,3})\s*°/i.exec(text);
  if (!n || !b) return null;
  const nozzleTemp = rangeMid(n[1], n[2]);
  const bedTemp = rangeMid(b[1], b[2]);
  if (!okNozzle(nozzleTemp) || !okBed(bedTemp)) return null;
  return { nozzleTemp, bedTemp };
};

const elegooSpecs = (html, text) => {
  // Elegoo's newer pages carry the spec table as JSON inside a metafield script (not ld+json),
  // so strip() drops it; read the raw HTML keys directly.
  const n = /"Nozzle Temperature"\s*:\s*"([^"]+)"/.exec(html);
  const b = /"Bed Temperature[^"]*"\s*:\s*"([^"]+)"/.exec(html);
  if (!n || !b) return null;
  const nv = nums(n[1]); const bv = nums(b[1]);
  const nozzleTemp = nv.length >= 2 ? rangeMid(nv[0], nv[1]) : (nv.length ? Math.round(nv[0]) : undefined);
  const bedTemp = bv.length >= 2 ? rangeMid(bv[0], bv[1]) : (bv.length ? Math.round(bv[0]) : undefined);
  if (!okNozzle(nozzleTemp) || !okBed(bedTemp)) return null;
  return { nozzleTemp, bedTemp };
};

const protopastaSpecs = (html, text) => {
  // "Printing starting at 240 C w/ no bed heat required" — nozzle only; the bed is unheated.
  const n = /starting\s+at\s+(\d{2,3})\s*°?\s*C\b/i.exec(text);
  if (!n || !/no\s+bed\s+heat/i.test(text)) return null;
  const nozzleTemp = Number(n[1]);
  if (!okNozzle(nozzleTemp)) return null;
  return { nozzleTemp, bedTemp: 0 };
};

const hostSpecs = {
  'recreus.com': recreusSpecs,
  'filaments.ca': filamentsCaSpecs,
  'qidi3d.com': qidiSpecs,
  'geeetech.com': geeetechSpecs,
  'x3d.com.au': x3dSpecs,
  'elegoo.com': elegooSpecs,
  'proto-pasta.com': protopastaSpecs,
};

function vendorSpecs(host, html, text) {
  const fn = hostSpecs[host];
  if (!fn) return null;
  try { return fn(html, text); } catch { return null; }
}

const COLOURS = 'black|white|red|blue|green|yellow|orange|purple|pink|brown|grey|gray|silver|gold|natural|transparent|clear|turquoise|cyan|magenta';

function cleanBrand(title) {
  let s = decodeEntities(title || '')
    .replace(/，/g, ',')
    .replace(/(?:\s*[|,])?\s*\d+(?:\.\d+)?\s*mm\b.*$/i, '')   // ", 1.75mm(1kg)" / " 1.75mm 1kg"
    .replace(/\s*3D\s+Printer\s+Filament\s*$/i, '')            // trailing marketing suffix
    .replace(/\s+\d+(?:\.\d+)?\s*(?:kg|g)\b.*$/i, '')          // trailing weight tail
    .replace(new RegExp(`\\s+[-–]?\\s*(?:${COLOURS})\\s*$`, 'i'), '') // obvious trailing colour
    .replace(/\s+/g, ' ')
    // Trailing punctuation is what is left when a colour or size tail is cut off the title
    // ("Glass Fiber Reinforced PA6 Filament, Black" -> "…Filament,"). It reads as a typo on
    // the card, so it goes with the tail rather than being carried into the product name.
    .replace(/[\s,;:—–-]+$/, '')
    .trim();
  return s;
}

// ---------- per-host products.json cache ----------
const hostCache = new Map(); // host -> Map<handle, record>

async function loadHost(host) {
  if (hostCache.has(host)) return hostCache.get(host);
  const map = new Map();
  let page = 1;
  for (;;) {
    const res = await get(`https://${host}/products.json?limit=250&page=${page}`);
    if (!res.ok) break;
    let data;
    try { data = JSON.parse(res.body); } catch { break; }
    const products = Array.isArray(data.products) ? data.products : [];
    if (!products.length) break;
    for (const p of products) map.set(p.handle, p);
    if (products.length < 250) break;
    page++;
  }
  hostCache.set(host, map);
  return map;
}

// Rendered product page -> searchable text. JSON-LD blocks are kept (metafield specs often
// live there), the rest of the scripts and styles are dropped.
function renderedText(html) {
  const ld = [...String(html || '').matchAll(/<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)]
    .map((m) => m[1]).join(' ');
  const main = String(html || '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ');
  const extra = decodeEntities(ld)
    .replace(/\\u003c/g, '<').replace(/\\u003e/g, '>').replace(/\\n/g, ' ')
    .replace(/<[^>]+>/g, ' ');
  return main + ' ' + extra;
}

// Cheap gate so we do not fetch a rendered page for an obviously non-filament product
// (resin, printer, accessory). It is an optimisation only — a false positive still resolves
// to null via the nozzle/bed gate.
export function isFilamentLike(rec) {
  const t = `${rec.title || ''} ${rec.product_type || ''} ${(rec.tags || []).join(' ')}`.toLowerCase();
  if (/resin|photopolymer/.test(t)) return false;
  if (/\b(?:printer|dryer|washer|curing|clean|cure)\b/.test(t) && !/filament/.test(t)) return false;
  if (/\b(?:accessor|nozzle|hotend|extruder|build\s*plate|screen|lcd|dlp|sensor|stepper|motor|spare|gift|swatch|tool|film)\b/.test(t) && !/filament/.test(t)) return false;
  return true;
}

// HOSTS=store.anycubic.com restricts this run to those storefronts, so a single host can be
// retried at a slower rate without recrawling the other 36.
const HOST_FILTER = process.env.HOSTS ? process.env.HOSTS.split(',').map((h) => h.trim()) : null;
const activeBrands = () => (HOST_FILTER ? BRANDS.filter((b) => HOST_FILTER.includes(b.host)) : BRANDS);

export async function listProducts() {
  const urls = [];
  for (const b of activeBrands()) {
    const map = await loadHost(b.host);
    for (const handle of map.keys()) urls.push(`https://${b.host}/products/${handle}`);
  }
  return urls;
}

function optionalFields(out, text) {
  const speed = /(?:print(?:ing)?\s*speed)\s*[:~=]?\s*([0-9][0-9.,\s~–—-]*)\s*mm\/s/i.exec(text);
  if (speed) out.printSpeed = mid(speed[1]);
  const density = /density\s*[:~=]?\s*([0-9]+(?:\.[0-9]+)?)/i.exec(text);
  if (density) out.density = parseFloat(density[1]);
  // filament diameter is only ever 1.75 / 2.85 / 3.0 — anything else ("±0.02mm",
  // "0.2mm layer height") is a tolerance or layer height, not the spool diameter.
  const dia = /(1\.75|2\.85|3\.0)\s*mm/i.exec(text);
  if (dia) out.filamentDiameter = parseFloat(dia[1]);
  const fan = /(?:cooling\s*fan|fan\s*speed)\s*[:~=]?\s*([0-9][0-9.,\s~–—-]*)\s*%/i.exec(text);
  if (fan) {
    const n = nums(fan[1]);
    if (n.length) {
      out.fanSpeedMin = n[0];
      out.fanSpeedMax = n.length >= 2 ? n[1] : n[0];
    }
  }
  return out;
}

export async function parseProduct(url) {
  const u = new URL(url);
  const host = u.hostname;
  const handle = decodeURIComponent(u.pathname.split('/').filter(Boolean).pop());
  const brand = BRANDS.find((b) => b.host === host);
  if (!brand || !handle) return null;

  const map = await loadHost(host);
  const rec = map.get(handle);
  if (!rec) return null;

  // On a vendorField host an unknown/empty vendor is not attributable to anyone, and guessing
  // would file someone else's spool under the shop's name. Drop it instead.
  const vendor = brand.vendorField ? canonManufacturer(String(rec.vendor || '').trim()) : null;
  if (brand.vendorField && !vendor) return null;

  const out = {
    manufacturer: vendor ?? brand.manufacturer,
    brand: cleanBrand(rec.title),
    // The title is the product's identity; tags are the store's browse categories and are
    // routinely wrong — qidi3d.com tags its "PC/ABS-FR Filament" as ["TPU/PC"], which typed a
    // polycarbonate blend as flexible. So the title decides whenever it decides anything, and
    // tags/product_type are consulted only when the title alone is unclassifiable.
    filamentType: detectType(rec.title) !== 'Other'
      ? detectType(rec.title)
      : detectType(`${rec.title} ${rec.product_type || ''} ${(rec.tags || []).join(' ')}`),
    // The locale-prefixed URL is what we actually read, so it is what we cite.
    sourceUrl: `https://${host}${brand.localePrefix ?? ''}/products/${handle}`,
    // A vendorField host is a shop, not the maker. The numbers are still the ones it publishes,
    // but the provenance is weaker and the row says so rather than claiming to be official.
    sourceType: brand.vendorField ? 'retailer' : 'manufacturer',
  };

  // fast path — products.json body_html (already cached, no network)
  let spec = tempsFrom(rec.body_html, false);
  let specText = strip(rec.body_html);

  // fallback — rendered product page, where several stores publish the spec table
  if (!spec) {
    if (!isFilamentLike(rec)) return null;
    const page = await get(`https://${host}${brand.localePrefix ?? ''}/products/${handle}`);
    if (!page.ok) return null;
    const rendered = renderedText(page.body);
    // Per-host extractors first (a store's own spec structure), then the labelled panel, then
    // the shared strict patterns. Host extractors are confined to that vendor and return null
    // for every other host, so they cannot disturb the ~40 stores on the shared path.
    spec = vendorSpecs(host, page.body, strip(rendered))
      || specBlockTemps(strip(rendered))
      || tempsFrom(rendered, true);
    if (!spec) return null;
    specText = strip(rendered);
  }

  Object.assign(out, spec);
  return optionalFields(out, specText);
}
