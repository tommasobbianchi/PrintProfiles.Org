#!/usr/bin/env node
// Generic WooCommerce parser, shared by every brand that brand-registry.mjs probed as
// platform === 'woocommerce'.
//
// Primary source is the WooCommerce Store API, which every one of these hosts exposes:
//
//   GET /wp-json/wc/store/v1/products?per_page=100&page=N
//     -> [ { id, name, slug, permalink, description, short_description,
//            categories:[{name}], attributes:[{name, terms:[{name}]}], ... }, ... ]
//
// It is public, unauthenticated, paginated and carries the full rendered description HTML —
// which is where these shops actually put the print temperatures. Verified live against
// azurefilm.com, print-me.pl, francofil.fr, ic3dprinters.com, isanmate.com, ninjatek.com and
// dasfilament.de before this file was written.
//
// Some shops (dasfilament.de) return an EMPTY description over the API even though the product
// page renders one, so parseProduct() falls back to the permalink HTML and runs the same
// extractor over it. Hosts with no Store API at all are listed with api:false and are listed
// from the WordPress product sitemap instead.
//
// Everything goes through fetch.mjs: robots gate, >=1.5 s per-domain floor, disk cache.

import { get, decodeEntities, log } from '../fetch.mjs';
import { BRANDS as REGISTRY } from '../brand-registry.mjs';

export const MANUFACTURER = 'WooCommerce'; // multi-brand; the real brand is per-BRAND below
export const ORIGIN = null;

// Only the hosts the probe confirmed. `api:false` means "no Store API, use the sitemap".
export const BRANDS = REGISTRY.filter((b) => b.platform === 'woocommerce').map((b) => ({
  manufacturer: b.manufacturer,
  host: b.host,
  api: true,
}));

const MAX_PAGES = Number(process.env.WOO_MAX_PAGES) || 10;
// Restrict a run to a subset of hosts: WOO_HOSTS=francofil.fr,print-me.pl node run-all.mjs
const HOST_FILTER = (process.env.WOO_HOSTS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const activeBrands = () => (HOST_FILTER.length ? BRANDS.filter((b) => HOST_FILTER.includes(b.host)) : BRANDS);
const brandForHost = (host) => BRANDS.find((b) => b.host === host || `www.${b.host}` === host);

// ---------------------------------------------------------------------------
// text normalisation
// ---------------------------------------------------------------------------

// Strip tags to SPACES (never to nothing: "<td>label:</td><td>210-230</td>" must not become
// "label:210-230" glued to the next cell), normalise every dash and degree variant, and drop
// Fahrenheit so "210°C - 250°C (410°F - 482°F)" cannot be read as a 410-482 range.
function normalise(html) {
  return decodeEntities(
    String(html || '')
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      // decodeEntities() covers the numeric forms and the XML five; these named ones show up
      // constantly in WordPress content ("Vitesse d&rsquo;impression", "200 &ndash; 230&deg;C")
      // and would otherwise break every label that spans an apostrophe.
      .replace(/&rsquo;|&lsquo;|&apos;/g, "'")
      .replace(/&rdquo;|&ldquo;|&quot;/g, '"')
      .replace(/&ndash;|&mdash;|&minus;/g, '-')
      .replace(/&deg;/g, '°')
      .replace(/&times;/g, 'x')
      .replace(/&hellip;/g, ' ')
      .replace(/&middot;|&bull;/g, ' '),
  )
    .replace(/[‐-―−]/g, '-') // ‐ ‑ ‒ – — ― −  ->  -
    .replace(/[º℃℉]/g, (m) => (m === '℃' ? '°C' : m === '℉' ? '°F' : '°'))
    .replace(/\(([^()]*°\s*F[^()]*)\)/g, ' ') // "(410°F - 482°F)"
    .replace(/\d+(?:\.\d+)?\s*°\s*F\b/g, ' ') // bare "482°F"
    .replace(/\s+/g, ' ')
    .trim();
}

const nums = (s) => [...String(s).matchAll(/\d+(?:\.\d+)?/g)].map((m) => parseFloat(m[0]));
const mid = (v) => {
  const n = nums(v);
  if (!n.length) return undefined;
  return Math.round(n.length >= 2 ? (n[0] + n[1]) / 2 : n[0]);
};

// A temperature value chunk. Written so BOTH shapes parse:
//   "200-230°C"        -> unit only at the end
//   "270°C - 290°C"    -> unit interleaved between the two bounds
//   "210 - 230 [°C]"   -> unit bracketed after the range
//   "~70°C"            -> single value, approximate marker
// The trailing unit stays optional in the pattern but is REQUIRED by the caller, which is what
// stops "Print at 50 mm/s" from being read as a temperature.
const SEP = '(?:-|to|bis|do|till|a|à|hasta|y|und|and|i)';
const VALUE =
  `([~≈]?\\s*\\d{2,3}(?:\\s*°\\s*C)?(?:\\s*${SEP}\\s*[~≈]?\\s*\\d{2,3})?(?:\\s*\\[?\\s*°\\s*C\\s*\\]?)?)`;
// Filler between the label and the number: "Extrusion Temperature: Brass Nozzle, 270°C".
// Digit-free by construction, so it can never swallow the value itself.
const FILL = '[^\\d]{0,45}';

function firstMatch(text, labels, { requireUnit = true } = {}) {
  for (const label of labels) {
    const re = new RegExp(label + FILL + VALUE, 'i');
    const m = re.exec(text);
    if (!m) continue;
    if (requireUnit && !/°\s*C/i.test(m[1])) continue;
    const v = mid(m[1]);
    if (v !== undefined && v >= 15 && v <= 500) return v;
  }
  return undefined;
}

// Labels are ordered most-specific first. Every one of these was copied off a live page, not
// invented: EN (ic3dprinters, ninjatek, isanmate), FR (francofil), PL (print-me),
// DE (dasfilament), ES (recreus/smartfil style), SI/EN prose (azurefilm).
const NOZZLE_LABELS = [
  'extrusion\\s+temperature',
  'printing\\s+temperature',
  'print\\s+temperature',
  'nozzle\\s+temperature',
  'hotend\\s+temperature',
  'recommended\\s+(?:printing|nozzle)\\s+temp\\S*',
  'temp\\S*\\s+(?:de\\s+)?buse',
  "temp\\S*\\s+d[’']?extrusion",
  'temperatura\\s+(?:zalecana\\s+)?druku',
  'zalecana\\s+temperatura\\s+druku',
  'temperatura\\s+(?:de\\s+)?(?:impresi[oó]n|extrusi[oó]n|boquilla)',
  'temperatura\\s+(?:dell[’\']?)?ugello',
  'druck(?:kopf)?temperatur',
  'd[üu]sentemperatur',
  'extruder\\s*[:=]',
  'nozzle\\s*[:=]',
  'print(?:ing)?\\s+at\\b', // azurefilm prose: "Print at 200-230°C temperature"
];

const BED_LABELS = [
  'heated\\s+bed\\s+temperature',
  'bed\\s+temperature',
  'build\\s+plate\\s+temperature',
  'print\\s+surface\\s+temperature',
  'platform\\s+temperature',
  'recommended\\s+bed\\s+temp\\S*',
  'temp\\S*\\s+(?:du\\s+)?plateau',
  'temp\\S*\\s+(?:du\\s+)?lit\\s+chauffant',
  'podgrzewany\\s+st[oó][lł]',
  'temperatura\\s+st[oó][lł]u',
  'temperatura\\s+(?:de\\s+la\\s+)?(?:cama|base)\\s*(?:caliente)?',
  'temperatura\\s+(?:del\\s+)?piano',
  '(?:druck)?betttemperatur',
  'heizbett\\w*',
  'heated\\s+bed\\s*[:=]',
  'printing\\s+table\\s+to', // azurefilm prose: "preheating your printing table to 50-60°C"
];

const FIRST_LAYER_NOZZLE = ['first\\s+layer\\s+(?:nozzle\\s+)?temperature', 'temperatura\\s+pierwszej\\s+warstwy'];
const FIRST_LAYER_BED = ['first\\s+layer\\s+bed\\s+temperature'];

const SPEED_LABELS = [
  'print(?:ing)?\\s+speed',
  'recommended\\s+speed',
  'vitesse\\s+d[’\']?impression',
  'pr[eę]dko[śs][ćc]\\s+druku',
  'velocidad\\s+de\\s+impresi[oó]n',
  'druckgeschwindigkeit',
];
const FAN_LABELS = ['(?:part\\s+)?cooling\\s+fan', 'cooling', 'ch[łl]odzenie(?:\\s+wydruku)?', 'ventilateur', 'ventilaci[oó]n', 'l[üu]fter'];
const DRY_TEMP_LABELS = ['drying\\s+temperature', 'dry\\w*\\s+temp\\S*', 'temp\\S*\\s+de\\s+s[ée]chage', 'temperatura\\s+suszenia', 'trocknungstemperatur'];

// ---------------------------------------------------------------------------
// filament type
// ---------------------------------------------------------------------------
// Order matters: composite/qualified names must win over the bare polymer they contain.
const detectType = (name) => {
  const s = String(name || '').toUpperCase();
  if (/PA[\s-]?6?[\s-]?CF|NYLON.*CF|CF.*NYLON|CARBON.*NYLON|NYLON.*CARBON/.test(s)) return 'PA-CF';
  if (/PA[\s-]?6?[\s-]?GF|NYLON.*GLASS|GLASS.*NYLON/.test(s)) return 'PA-GF';
  if (/PCTG/.test(s)) return 'PCTG';
  if (/PETG|PET[\s-]G/.test(s)) return 'PETG';
  if (/PETT/.test(s)) return 'PETT';
  if (/\bPET\b/.test(s)) return 'PET';
  if (/\bCPE\b/.test(s)) return 'CPE';
  if (/COPOLYESTER/.test(s)) return 'Copolyester';
  if (/\bPVB\b/.test(s)) return 'PVB';
  if (/\bPVA\b/.test(s)) return 'PVA';
  if (/\bBVOH\b/.test(s)) return 'BVOH';
  if (/\bHIPS\b/.test(s)) return 'HIPS';
  if (/\bPEI\b|ULTEM/.test(s)) return 'PEI';
  if (/\bPHA\b/.test(s)) return 'PHA';
  if (/\bPP\b|POLYPROPYLEN/.test(s)) return 'PP';
  if (/\bTPE\b/.test(s)) return 'TPE';
  if (/\bTPU\b|FLEX(?:IBLE)?\b|FILAFLEX/.test(s)) return 'TPU';
  if (/PEBA/.test(s)) return 'PEBA';
  if (/\bASA\b/.test(s)) return 'ASA';
  if (/\bABS\b/.test(s)) return 'ABS';
  if (/\bPC\b|POLYCARBON/.test(s)) return 'PC';
  if (/PA6\b|\bPA[\s-]?6\b/.test(s)) return 'PA6';
  if (/PA12\b|\bPA[\s-]?12\b/.test(s)) return 'PA12';
  if (/NYLON|\bPA11\b|POLYAMIDE|POLIAMID/.test(s)) return 'Nylon';
  if (/PLA/.test(s)) return 'PLA'; // covers PLA+, PLA Silk, Wood/Marble PLA blends
  return 'Other';
};

// Hardware, consumables and gift cards live in the same catalogue as the filament and often
// quote temperatures of their own ("max nozzle temperature 350°C" on a printer listing), so
// they are excluded by name before any extraction happens.
const NON_FILAMENT =
  /\b(?:printer|drucker|drukark|imprimante|dryer|drybox|dry\s?box|s[ée]choir|suszark|spool\s*holder|holder|adapter|masterspool|empty\s+spool|leerspule|nozzle|d[üu]se|buse|hotend|hot\s?end|extruder|hot\s?bed|build\s+plate|bauplatte|sheet|blatt|glue|kleb|spray|lack|cleaning|nettoyage|czyszcz|needle|aiguille|brush|cutter|scraper|tweezer|screwdriver|desiccant|silica|filter|bundle|combo|gift\s*card|gutschein|voucher|bon\s+cadeau|karta\s+podarunkowa|swatch|farbpl[äa]ttchen|sample\s+set|t-?shirt|sticker|3d\s+model|stl)\b/i;

// ---------------------------------------------------------------------------
// listing
// ---------------------------------------------------------------------------

const apiUrl = (host, page, perPage = 100) =>
  `https://${host}/wp-json/wc/store/v1/products?per_page=${perPage}&page=${page}`;

// url -> Store API product object, filled by listProducts() so parseProduct() need not refetch.
const productCache = new Map();

async function listViaApi(host) {
  const urls = [];
  for (let page = 1; page <= MAX_PAGES; page++) {
    const res = await get(apiUrl(host, page));
    if (!res.ok) {
      await log(`woocommerce ${host}: page ${page} -> ${res.status}, stopping`);
      break;
    }
    let items;
    try {
      items = JSON.parse(res.body);
    } catch {
      await log(`woocommerce ${host}: page ${page} is not JSON, stopping`);
      break;
    }
    if (!Array.isArray(items) || !items.length) break;
    for (const p of items) {
      if (!p?.permalink) continue;
      productCache.set(p.permalink, p);
      urls.push(p.permalink);
    }
    if (items.length < 100) break;
  }
  return urls;
}

// Fallback for a WooCommerce host with the Store API switched off: the WordPress product
// sitemap. Both the core (wp-sitemap-posts-product-N.xml) and the Yoast (product-sitemap.xml)
// layouts are tried, then any <loc> pointing at a product permalink is taken.
async function listViaSitemap(host) {
  const candidates = [
    `https://${host}/wp-sitemap-posts-product-1.xml`,
    `https://${host}/product-sitemap.xml`,
    `https://${host}/product-sitemap1.xml`,
  ];
  const urls = new Set();
  for (const sm of candidates) {
    const res = await get(sm);
    if (!res.ok) continue;
    for (const m of res.body.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)) {
      if (/\/(?:product|produkt|produit|producto|shop|sklep|store)\//i.test(m[1])) urls.add(m[1]);
    }
    if (urls.size) break;
  }
  return [...urls];
}

export async function listProducts() {
  const out = [];
  for (const b of activeBrands()) {
    let urls = [];
    try {
      urls = b.api ? await listViaApi(b.host) : await listViaSitemap(b.host);
      if (!urls.length && b.api) urls = await listViaSitemap(b.host);
    } catch (e) {
      await log(`ERROR woocommerce listProducts ${b.host}: ${e.message}`);
    }
    await log(`woocommerce ${b.manufacturer} (${b.host}): ${urls.length} product URLs`);
    out.push(...urls);
  }
  return out;
}

// ---------------------------------------------------------------------------
// parsing
// ---------------------------------------------------------------------------

// Re-fetch a single product from the Store API by slug, for a resumed run where
// listProducts() did not repopulate the cache.
async function productBySlug(host, slug) {
  const res = await get(`https://${host}/wp-json/wc/store/v1/products?slug=${encodeURIComponent(slug)}`);
  if (!res.ok) return null;
  try {
    const j = JSON.parse(res.body);
    return Array.isArray(j) && j[0] ? j[0] : null;
  } catch {
    return null;
  }
}

function attrValue(product, ...needles) {
  for (const a of product?.attributes || []) {
    const name = String(a?.name || '').toLowerCase();
    if (!needles.some((n) => name.includes(n))) continue;
    const term = (a.terms || [])[0]?.name;
    if (term) return decodeEntities(term);
  }
  return undefined;
}

function extract(text, name) {
  const nozzleTemp = firstMatch(text, NOZZLE_LABELS);
  const bedTemp = firstMatch(text, BED_LABELS);
  if (nozzleTemp === undefined || bedTemp === undefined) return null;

  const out = { nozzleTemp, bedTemp };

  const nz1 = firstMatch(text, FIRST_LAYER_NOZZLE);
  if (nz1 !== undefined) out.nozzleTempInitial = nz1;
  const bd1 = firstMatch(text, FIRST_LAYER_BED);
  if (bd1 !== undefined) out.bedTempInitial = bd1;

  for (const label of SPEED_LABELS) {
    // The unit may sit between the bounds ("50 mm/s - 100 mm/s"), exactly like the
    // interleaved-unit temperature form, so it is optional after the first number too.
    const m = new RegExp(
      label + FILL + '(\\d{1,3}(?:\\s*mm\\s*/\\s*s)?(?:\\s*(?:-|to|do|à|a)\\s*\\d{1,3})?)\\s*(?:\\[\\s*)?mm\\s*/\\s*s',
      'i',
    ).exec(text);
    if (m) {
      out.printSpeed = mid(m[1]);
      break;
    }
  }

  for (const label of FAN_LABELS) {
    // "0% - 10%" is as common as "0-30 [%]": allow the percent sign between the bounds.
    const m = new RegExp(
      label + FILL + '(\\d{1,3}(?:\\s*%)?(?:\\s*(?:-|to|do|à|a)\\s*\\d{1,3})?)\\s*(?:\\[\\s*)?%',
      'i',
    ).exec(text);
    if (m) {
      const f = nums(m[1]);
      out.fanSpeedMin = f[0];
      out.fanSpeedMax = f[1] ?? f[0];
      break;
    }
  }

  const dry = firstMatch(text, DRY_TEMP_LABELS);
  if (dry !== undefined) out.dryingTemp = dry;
  const dryTime = /dry\w*\s+(?:time|for)[^\d]{0,20}(\d{1,2})\s*(?:-\s*\d{1,2}\s*)?h(?:ours?|rs?)?\b/i.exec(text);
  if (dryTime) out.dryingTime = `${dryTime[1]}h`;

  const dens = /densit[yéà]\w*[^\d]{0,25}(\d(?:[.,]\d+)?)\s*g\s*\/\s*cm/i.exec(text);
  if (dens) out.density = parseFloat(dens[1].replace(',', '.'));

  const dia =
    /(?:filament\s+)?diamet(?:er|re|ro)[^\d]{0,20}(\d(?:[.,]\d+)?)\s*mm/i.exec(text) ||
    /(?:średnica|durchmesser)[^\d]{0,20}(\d(?:[.,]\d+)?)\s*mm/i.exec(text) ||
    /\b(1[.,]75|2[.,]85|3[.,]00)\s*mm/.exec(`${name} ${text}`);
  if (dia) {
    const d = parseFloat(dia[1].replace(',', '.'));
    if (d >= 1 && d <= 4) out.filamentDiameter = d;
  }

  return out;
}

export async function parseProduct(url) {
  let host;
  try {
    host = new URL(url).hostname;
  } catch {
    return null;
  }
  const brand = brandForHost(host);
  if (!brand) return null;

  let product = productCache.get(url) ?? null;
  if (!product && brand.api) {
    const slug = url.replace(/\/+$/, '').split('/').pop();
    product = await productBySlug(brand.host, slug);
  }

  const name = decodeEntities(product?.name || '').replace(/\s+/g, ' ').trim();
  if (name && NON_FILAMENT.test(name)) return null;

  // 1. Store API description. 2. rendered product page, for shops that leave it empty there.
  let text = normalise(`${product?.description || ''} ${product?.short_description || ''}`);
  let specs = text ? extract(text, name) : null;

  // Only pay for the rendered page when the API gave us nothing to read. A description that
  // exists but carries no temperatures is a genuine "no specs published", not a fetch problem,
  // and re-fetching every such product would cost one request per accessory in the catalogue.
  let pageTitle = '';
  if (!specs && text.length < 200) {
    const page = await get(url);
    if (!page.ok) return null;
    pageTitle = decodeEntities(
      (/property="og:title"\s+content="([^"]+)"/i.exec(page.body) || /<title[^>]*>([^<]+)<\/title>/i.exec(page.body) || [, ''])[1],
    )
      .split(/\s*[|–-]\s*/)[0]
      .trim();
    if (!name && pageTitle && NON_FILAMENT.test(pageTitle)) return null;
    text = normalise(page.body);
    specs = extract(text, name || pageTitle);
  }
  if (!specs) return null;

  const label = name || pageTitle;
  if (!label) return null;

  const filamentType = detectType(label) === 'Other' ? (/filament/i.test(label) ? 'Other' : null) : detectType(label);
  if (!filamentType) return null;

  const diaAttr = attrValue(product, 'diameter', 'diamètre', 'średnica', 'durchmesser');
  if (diaAttr) {
    const d = parseFloat(String(diaAttr).replace(',', '.'));
    if (d >= 1 && d <= 4) specs.filamentDiameter = d;
  }

  return {
    manufacturer: brand.manufacturer,
    brand: label,
    filamentType,
    ...specs,
    sourceUrl: url,
    sourceType: 'manufacturer',
  };
}
