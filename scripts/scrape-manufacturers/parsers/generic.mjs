#!/usr/bin/env node
// Generic manufacturer product-page parser — for the brand-registry hosts whose platform is
// 'other' (neither Shopify nor WooCommerce, so neither of the platform parsers applies).
//
// One shared extraction path serves every host: flatten the page to text, then look for a
// multilingual set of spec labels (EN/DE/PL/CS/ES/FR/NL/IT) and read the number that follows.
// A host only gets its own entry in BRANDS when its markup genuinely forces it — a different
// label wording (3DJake), or a combined "Bed / Print Temperature" field (Paramount 3D).
//
// Self-test (does not need run-all.mjs):
//   node scripts/scrape-manufacturers/parsers/generic.mjs --list sunlu.com
//   node scripts/scrape-manufacturers/parsers/generic.mjs <product-url> [<product-url> …]
//
// Hosts inspected during development that yield NOTHING parseable are listed in
// UNPARSEABLE below with the reason; see VALIDATION-generic.md for the evidence.

import { get, log, decodeEntities } from '../fetch.mjs';

export const MANUFACTURER = 'Generic';
export const ORIGIN = null;

// Hard cap so a stray sitemap cannot turn into a multi-thousand-page crawl.
const MAX_PER_HOST = Number(process.env.GENERIC_MAX_PER_HOST) || 300;

// ---------------------------------------------------------------------------
// Per-host registry. `product` selects product URLs; everything else is optional
// and only present where the generic path is not enough.
//
//   sitemap      explicit sitemap URL(s); omitted => discovered from robots.txt, then
//                /sitemap_index.xml, then /sitemap.xml
//   listing      seed pages to crawl when the site publishes no product sitemap
//   category     links on a listing seed that are worth opening one level deeper
//   labels       { nozzle, bed } extra label alternatives for this host only
//   extract      last resort: a host-specific reader for nozzle/bed
//   brandFrom    'slug' when the page carries no usable product name (JS-rendered title)
// ---------------------------------------------------------------------------
export const BRANDS = [
  {
    manufacturer: 'SUNLU',
    host: 'www.sunlu.com',
    sitemap: ['https://www.sunlu.com/products.xml'],
    // /zh-cn/products/… is the same catalogue in Chinese; keep one language only.
    product: /^https:\/\/www\.sunlu\.com\/products\/[^/]+$/,
    // The product title is rendered client-side; the HTML <title>/<h1> are the site name.
    brandFrom: 'slug',
  },
  {
    manufacturer: 'eSUN',
    host: 'eu.esun3d.com',
    sitemap: ['https://eu.esun3d.com/media/sitemap/sitemap.xml'],
    product: /^https:\/\/eu\.esun3d\.com\/[a-z0-9-]+-product$/,
  },
  {
    manufacturer: 'Spectrum',
    host: 'spectrumfilaments.com',
    sitemap: ['https://spectrumfilaments.com/en/sitemap.xml'],
    product: /^https:\/\/spectrumfilaments\.com\/en\/filament\/[^/]+\/$/,
  },
  {
    manufacturer: '3DJake',
    host: 'www.3djake.com',
    sitemap: ['https://www.3djake.com/sitemap-p.xml'],
    // 3DJake is a shop that also has its own line. Only /3djake/… is theirs; the rest is
    // resold (Extrudr, colorFabb, …) and would be attributed to the wrong maker.
    // The own-brand range also covers tape, tools and gift certificates; the sitemap has
    // 4780 entries, so filter to material slugs rather than spend the crawl budget on them.
    product: /^https:\/\/www\.3djake\.com\/3djake\/[a-z0-9-]*(?:pla|petg|pctg|abs|asa|tpu|tpe|pva|hips|nylon|pa6|pa12|pc)[a-z0-9-]*$/,
    labels: {
      nozzle: ['recommended\\s+processing\\s+temperature'],
      // On 3DJake "heating temperature" is the heated bed, not the chamber. That is only
      // true here, so it stays a per-host label instead of polluting the shared set.
      bed: ['recommended\\s+heating\\s+temperature'],
    },
  },
  {
    manufacturer: 'FormFutura',
    host: 'www.formfutura.com',
    listing: ['https://www.formfutura.com/filaments'],
    category: /^https:\/\/www\.formfutura\.com\/filaments\/[a-z0-9-]+$/,
    // …/filaments/page/2 is pagination, …/filaments/partner-materials/<brand> is someone
    // else's line — neither is a FormFutura product.
    product: /^https:\/\/www\.formfutura\.com\/filaments\/(?!partner-materials\/|page\/)[a-z0-9-]+\/[a-z0-9-]+$/,
  },
  {
    manufacturer: 'Rosa3D',
    host: 'www.rosa3d.pl',
    sitemap: ['https://www.rosa3d.pl/sitemap/render/product.xml?page=1'],
    product: /^https:\/\/www\.rosa3d\.pl\/filament-3d-[^/]+$/,
  },
  {
    manufacturer: 'AURAPOL',
    // aurapol.cz redirects to the .com storefront; the sitemaps there are gzipped, which
    // the shared fetch layer returns as text, so the catalogue is crawled from the shop.
    host: 'www.aurapol.com',
    listing: ['https://www.aurapol.com/cz/'],
    category: /^https:\/\/www\.aurapol\.com\/cz\/(?!p\/)[a-z0-9-]+$/,
    product: /^https:\/\/www\.aurapol\.com\/cz\/p\/[a-z0-9-]+$/,
  },
  {
    manufacturer: 'Winkle',
    host: 'winkle.shop',
    // The /producto/<colour> pages answer 200 with an empty body to a plain UA; the
    // material pages under categorias-sitemap.xml do carry the print settings, and they are
    // one page per material rather than one per colour.
    sitemap: ['https://winkle.shop/categorias-sitemap.xml'],
    product: /^https:\/\/winkle\.shop\/filamento-impresora-3d\/[^/]+\/[^/]+\/$/,
  },
  {
    manufacturer: 'Nobufil',
    host: 'www.nobufil.com',
    sitemap: ['https://www.nobufil.com/en_en-store-products-sitemap.xml'],
    product: /^https:\/\/www\.nobufil\.com\/en\/product-page\/[^/]+$/,
  },
  {
    manufacturer: 'Zyltech',
    host: 'www.zyltech.com',
    listing: ['https://www.zyltech.com/'],
    category: /^https:\/\/www\.zyltech\.com\/(?:pla|zyltech-abs|zyltech-filament)\/(?:[a-z0-9-]+\/)?$/,
    // Category slugs carry no size token; product slugs always do (…-1-75mm-1kg-…).
    product: /^https:\/\/www\.zyltech\.com\/[a-z0-9-]*filament[a-z0-9-]*\d[a-z0-9-]*\/$/,
  },
  {
    manufacturer: 'Gizmo Dorks',
    host: 'gizmodorks.com',
    listing: ['https://gizmodorks.com/'],
    category: /^https:\/\/gizmodorks\.com\/3d-printer-filament-[a-z0-9]+\/$/,
    product: /^https:\/\/gizmodorks\.com\/[a-z0-9-]*filament[a-z0-9-]*\/$/,
  },
  {
    manufacturer: 'Paramount 3D',
    host: 'www.paramount-3d.com',
    sitemap: ['https://www.paramount-3d.com/store-products-sitemap.xml'],
    product: /^https:\/\/www\.paramount-3d\.com\/product-page\/[^/]+$/,
    // Single combined field, bed FIRST: "Bed / Print Temperature: 100 - 110 C (212 - 230 F)
    // / 220 - 260 C (428 - 500 F)". The generic path would read the bed range as the nozzle,
    // so this host reads the two halves explicitly. (The °F noise is already stripped.)
    extract(text) {
      const m = /bed\s*\/\s*print\s*temperature\s*:?\s*([^|]{0,80})/i.exec(text);
      if (!m) return null;
      const [bedPart, nozzlePart] = m[1].split('/');
      if (!nozzlePart) return null;
      const bed = readNumeric(' ' + bedPart, { unit: UNIT_C });
      const nozzle = readNumeric(' ' + nozzlePart, { unit: UNIT_C });
      return { nozzleTemp: plausible(nozzle, 150, 500), bedTemp: plausible(bed, 0, 200) };
    },
  },
  {
    manufacturer: 'Stronghero3d',
    host: 'www.stronghero3d.com',
    sitemap: ['https://www.stronghero3d.com/sitemap-main.xml'],
    // The sitemap mixes products with news/faq/download pages; only the material slugs.
    product: /^https:\/\/www\.stronghero3d\.com\/(?:products\/)?[a-z0-9-]*(?:pla|petg|abs|asa|tpu|filament)[a-z0-9-]*\.html$/,
    // Prose, with the label AFTER the value: "…around 190°C to 220°C for the nozzle
    // temperature". The bed sentence ("Use a heated bed set between 50°C to 60°C") is
    // ordinary enough for the shared path, so only the nozzle needs a host rule.
    extract(text) {
      const m = /(\d{2,3})\s*°\s*C\s*(?:to|[-–—])\s*(\d{2,3})\s*°\s*C[^.]{0,40}?nozzle/i.exec(text);
      if (!m) return null;
      return { nozzleTemp: plausible({ value: (+m[1] + +m[2]) / 2 }, 150, 500) };
    },
  },
];

// Hosts fetched and inspected, that cannot be parsed. Kept here so the next run does not
// re-litigate them. Details and page evidence: VALIDATION-generic.md.
export const UNPARSEABLE = {
  'colorfabb.com': 'product pages carry no print settings; specs only in an off-site TDS PDF folder',
  'matterhackers.com': 'product pages return the store shell (62 KB) — catalogue is client-rendered',
  'ultimaker.com': 'material pages list mechanical data only; print settings live in TDS PDFs',
  'creality.com': 'sitemap-products.xml has 4 filament entries, all collections; no spec block',
  'raise3d.com': 'product pages show marketing copy only; TDS is a separate PDF',
  'filament-pm.com': 'product pages are JS-rendered; served HTML has zero "teplota" occurrences',
  'igus.com': 'catalogue is bearings/cables; iglidur filament pages carry no FFF temperatures',
  'makerbot.com': 'sitemap has printers and stories only, no material product pages',
  'forward-am.com': 'Ultrafuse pages are portfolio copy; settings are in per-material PDFs',
  'taulman3d.com': 'sitemap exposes 3 pages (home/about/contact); shop is off-site',
  'gembird.com': 'sitemap is 4780 accessory pages, no filament products',
  'verbatim.com': 'sitemap covers storage/peripherals; no 3D filament section',
  'snapmaker.com': 'declared sitemap.xml is empty (0 <loc>)',
  'aurapol.cz': 'redirects to www.aurapol.com (crawled under that host)',
  'tinmorry.com': 'home page is a 163-byte shell; catalogue client-rendered',
  'addnorth.com': 'every /product/… URL from its own sitemap returns 404 to a plain UA',
  'smartfil.es': 'DNS/connection failure — host unreachable',
  'giantarm.com': 'DNS/connection failure — host unreachable',
  'fiberon3d.com': 'DNS/connection failure — host unreachable',
  'mika3d.com': 'DNS/connection failure — host unreachable',
  'yousu3d.com': 'DNS/connection failure — host unreachable',
  'zortrax.com': 'DNS/connection failure — host unreachable',
  'keenevillageplastics.com': 'DNS/connection failure — host unreachable',
  'realfilament.com': 'DNS/connection failure — host unreachable',
  '3de.co.uk': 'DNS/connection failure — host unreachable',
  'nature3d.net': 'robots.txt 404 and no sitemap; single-page site',
  'deeplee.net': 'sitemap is a one-page "lander" placeholder',
  'soleyin.com': 'sitemap is a one-page "lander" placeholder',
  'filaform.com': 'sitemap is a one-page "lander" placeholder',
  'cc3d.store': 'sitemap resolves to a single page',
  'anycubic.com': 'catalogue lives on store.anycubic.com, a Shopify storefront — belongs to parsers/shopify.mjs, not here',
  'esun3d.com': 'same catalogue as eu.esun3d.com, which is the host actually crawled',
  'reprapper.com': 'intermittent: robots.txt answered once, then every request returns a network error',
  'sakata3d.com': 'home page answers HTTP 200 with a zero-byte body',
  '123-3d.nl': 'sitemap index returns 401; reseller catalogue in any case',
  'devildesign.com': 'no reachable sitemap (wp-sitemap.xml and sitemap.xml both 404)',
  'smartmaterials3d.com': 'per-language sitemaps are empty (0 <loc>)',
  'rec3d.ru': 'product pages served with an empty <title> and no spec block (bot wall)',
  'comgrow.com': 'catalogue is resold Creality/Sovol goods, not an own filament line',
};

// ---------------------------------------------------------------------------
// Text preparation
// ---------------------------------------------------------------------------

// Some storefronts (Winkle/PrestaShop, Wix) ship the page as a JSON-escaped string inside
// the HTML. Un-escape it so the same tag stripping and label matching work everywhere.
function deJson(s) {
  const escaped = (s.match(/\\u00[0-9a-fA-F]{2}/g) || []).length + (s.match(/\\"/g) || []).length;
  if (escaped < 20) return s;
  return s
    .replace(/\\u([0-9a-fA-F]{4})/g, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/\\\//g, '/')
    .replace(/\\"/g, '"')
    .replace(/\\[nrt]/g, ' ');
}

// °F is decoration on these pages ("200-230°C (392-446°F)"). It has to go BEFORE any number
// is read, or 392 gets picked up as a setpoint.
const F_RANGE = /\d+(?:[.,]\d+)?\s*(?:°\s*)?[CF]?\s*[-–—~]\s*\d+(?:[.,]\d+)?\s*(?:°\s*)?F(?![a-zA-Z])/g;
const F_ONE = /\d+(?:[.,]\d+)?\s*°\s*F(?![a-zA-Z])/g;

function flatten(html) {
  return deJson(html)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    // A tag becomes a single space, never nothing: "190</span><span>-225°C" must stay one
    // readable range and must not weld two unrelated words together.
    .replace(/<[^>]+>/g, ' ')
    .replace(/&deg;/gi, '°')
    .replace(/&#176;/g, '°')
    .replace(/[℃]/g, '°C')
    .replace(/[℉]/g, '°F')
    .replace(/º/g, '°') // masculine ordinal, used as a degree sign on Spanish sites
    .replace(/−/g, '-') // minus sign
    .replace(/[，、]/g, ',')
    .replace(/&(#x?[0-9a-f]+|amp|apos|quot|lt|gt|nbsp);/gi, (m) => decodeEntities(m))
    .replace(/[   ]/g, ' ')
    .replace(F_RANGE, ' ')
    .replace(F_ONE, ' ')
    .replace(/\s+/g, ' ');
}

// ---------------------------------------------------------------------------
// Numeric reading
// ---------------------------------------------------------------------------

// The bare-C alternative has to stay anchored to a degree sign, a digit or brackets:
// a plain /\bC\b/ also fires on the "c" of "Pęcice", because JS word boundaries do not
// treat "ę" as a letter — which once turned a postal address into a drying temperature.
const UNIT_C = /°\s*C\b|\d\s*C\b|\[\s*°?\s*C\s*\]|\(\s*°?\s*C\s*\)|celsius/i;
const UNIT_SPEED = /mm\s*\/\s*s/i;
const UNIT_PCT = /%/;
const UNIT_MM = /\bmm\b/i;
const UNIT_DENSITY = /g\s*\/\s*cm|g\/cm|kg\s*\/\s*m/i;

const CEILING = /\b(up\s+to|max\.?|maximum|maximal|bis\s+zu|maks|maksymalnie|hasta|jusqu|fino\s+a|do\s+max)\b|[<≤＜≦]/i;  // ＜ is the full-width form eSUN uses
const SEP = '(?:[-–—~]|\\bto\\b|\\bbis\\b|\\bdo\\b|\\baž\\b|\\baz\\b)';
const NUM = '\\d+(?:[.,]\\d+)?';
const num = (s) => parseFloat(String(s).replace(',', '.'));

// Read the value that follows a label.
//   tail    the text right after the matched label
//   unit    RegExp the unit must satisfy, either in the gap before the number
//           ("Temperatura dyszy [C] | 195-225") or right after it ("210-240 C")
//   after   true => the unit MUST follow the number (speed: "50-100mm/s", so that
//           "Print Speed | 250-260°C/50-100mm/s" does not read the temperature)
// Returns { value, min, max, ceiling } or null.
function readNumeric(tail, { unit, after = false, maxGap = 44 } = {}) {
  const re = new RegExp(`(${NUM})\\s*(?:°\\s*[CF]|%|mm(?:\\s*\\/\\s*s)?|C\\b)?\\s*(?:${SEP}\\s*(${NUM}))?`, 'i');
  // Several numbers may follow a label; take the first one that satisfies the unit rule.
  for (const m of tail.matchAll(/\d/g)) {
    if (m.index > maxGap * 2) break;
    const gap = tail.slice(0, m.index);
    // Only start scanning from a digit that begins a number (skip into-the-middle matches).
    if (/[\d.,]$/.test(gap)) continue;
    if (m.index > maxGap && !/[:|=([\s]$/.test(gap)) continue;
    const rest = tail.slice(m.index);
    const v = re.exec(rest);
    if (!v) continue;
    const trailing = rest.slice(v[0].length, v[0].length + 10);
    // Test the number together with what follows it: the unit often sits just past the
    // matched range ("210-240 C"), and UNIT_C needs the digit to anchor its bare-C form.
    const unitAfter = unit ? unit.test(v[0] + trailing) : true;
    const unitBefore = unit ? unit.test(gap.slice(-24)) : true;
    if (after ? !unitAfter : !(unitAfter || unitBefore)) continue;
    const a = num(v[1]);
    const b = v[2] === undefined ? undefined : num(v[2]);
    return {
      value: b === undefined ? a : (a + b) / 2,
      min: a,
      max: b === undefined ? a : b,
      // "up to 260°C" is a ceiling, not a setpoint — the caller decides what to do with it.
      ceiling: CEILING.test(gap.slice(-24)),
    };
  }
  return null;
}

const plausible = (r, lo, hi) => {
  if (!r || r.ceiling) return undefined;
  const v = Math.round(r.value);
  return v >= lo && v <= hi ? v : undefined;
};

// ---------------------------------------------------------------------------
// Shared multilingual label set (EN, DE, PL, CS, ES, FR, NL, IT)
// ---------------------------------------------------------------------------

const NOZZLE_LABELS = [
  'print(?:ing)?\\s*temp(?:erature)?s?',
  'nozzle\\s*temp(?:erature)?s?',
  'extrud(?:er|ing|ion)\\s*temp(?:erature)?',
  'hot[\\s-]?end\\s*temp(?:erature)?',
  'processing\\s*temp(?:erature)?',
  'druck\\s*temperatur',
  'd[üu]sen\\s*temperatur',
  'extrusions\\s*temperatur',
  'verarbeitungs\\s*temperatur',
  'temperatura\\s+druku',
  'temperatura\\s+dyszy',
  'temperatura\\s+g[łl]owicy',
  'teplota\\s+tisku',
  'teplota\\s+trysky',
  'temperatura\\s+de\\s+impresi[óo]n',
  'temperatura\\s+de\\s+extrusi[óo]n',
  'temperatura\\s+del\\s+extrusor',
  "temp[ée]rature\\s+d['’]?\\s*impression",
  "temp[ée]rature\\s+d['’]?\\s*extrusion",
  'temp[ée]rature\\s+de\\s+la\\s+buse',
  'print\\s*temperatuur',
  'extruder\\s*temperatuur',
  'temperatura\\s+di\\s+stampa',
  'temperatura\\s+(?:dell[\'’]\\s*)?ugello',
  'temperatura\\s+di\\s+estrusione',
];

const BED_LABELS = [
  'bed\\s*temp(?:erature)?s?',
  'heat(?:ed|ing)?\\s*bed(?:\\s*temp(?:erature)?)?',
  'build\\s*plate(?:\\s*temp(?:erature)?)?',
  'bett\\s*temperatur',
  'druckbett\\s*temperatur',
  'heizbett(?:\\s*temperatur)?',
  'temperatura\\s+sto[łl]u',
  'temperatura\\s+pod[łl]o[żz]a',
  'st[óo][łl]\\s+grzewczy',
  'teplota\\s+podlo[žz]ky',
  'teplota\\s+podlo[žz]ce',
  'teplota\\s+stolu',
  'vyh[řr][íi]van[ée]\\s+podlo[žz]ky',
  'temperatura\\s+de\\s+(?:la\\s+)?cama',
  'temperatura\\s+de\\s+(?:la\\s+)?base',
  'cama\\s+caliente',
  'temp[ée]rature\\s+du\\s+plateau',
  'plateau\\s+chauffant',
  'bed\\s*temperatuur',
  'verwarmd\\s+bed',
  'temperatura\\s+del\\s+piatto',
  'temperatura\\s+(?:del\\s+)?piano',
];

const SPEED_LABELS = [
  'print(?:ing)?\\s*speed',
  'druckgeschwindigkeit',
  'pr[ęe]dko[śs][ćc]\\s+druku',
  'rychlost\\s+tisku',
  'velocidad\\s+de\\s+impresi[óo]n',
  "vitesse\\s+d['’]?\\s*impression",
  'print\\s*snelheid',
  'velocit[àa]\\s+di\\s+stampa',
];

const FAN_LABELS = [
  'fan\\s*speed', 'cooling(?:\\s*fan)?', 'part\\s*cooling',
  'l[üu]fter(?:geschwindigkeit)?', 'k[üu]hlung',
  'nawiew', 'ch[łl]odzenie',
  'chlazen[íi]', 'ventil[áa]tor',
  'ventilador', 'refrigeraci[óo]n',
  'ventilateur', 'refroidissement',
  'ventilator', 'koeling',
  'ventola', 'raffreddamento',
];

const DRY_LABELS = [
  'dry(?:ing)?(?:\\s*(?:temp(?:erature)?s?|conditions?|settings))?',
  'trocknung', 'trocknen',
  'suszenie', 'su[šs]en[íi]',
  'secado', 's[ée]chage', 'droging', 'essiccazione',
];

const DENSITY_LABELS = [
  'density', 'dichte', 'g[ęe]sto[śs][ćc]', 'hustota', 'densidad', 'densit[ée]', 'densit[àa]', 'dichtheid',
];

const DIAMETER_LABELS = [
  '(?:filament\\s*)?diameter', 'durchmesser', '[śs]rednica', 'pr[ůu]m[ěe]r',
  'di[áa]metro', 'diam[èe]tre', 'diametro',
];

// \b at the front and "not another letter" at the back, so "Drybox recommended" is not
// read as the drying label and "Nozzles" is not read as a nozzle temperature.
const rx = (alts) => new RegExp(`\\b(?:${alts.join('|')})(?![A-Za-z])`, 'gi');

// Try every occurrence of every label and keep the first reading that survives the checks.
function firstPlausible(text, labels, opts, lo, hi) {
  for (const m of text.matchAll(rx(labels))) {
    const r = readNumeric(text.slice(m.index + m[0].length, m.index + m[0].length + 140), opts);
    const v = plausible(r, lo, hi);
    if (v !== undefined) return v;
  }
  return undefined;
}

// ---------------------------------------------------------------------------
// Type detection
// ---------------------------------------------------------------------------

const detectType = (name) => {
  const s = ' ' + String(name || '').toUpperCase().replace(/[^A-Z0-9+]+/g, ' ') + ' ';
  if (/PA ?CF|NYLON ?CF|CF ?NYLON|CARBON.*NYLON|NYLON.*CARBON/.test(s)) return 'PA-CF';
  if (/PA ?GF|NYLON.*GLASS|GLASS.*NYLON/.test(s)) return 'PA-GF';
  if (/ PA6 | PA66 | NYLON ?6 /.test(s)) return 'PA6';
  if (/ PA12 | PA11 | NYLON ?12 /.test(s)) return 'PA12';
  if (/ PCTG /.test(s)) return 'PCTG';
  if (/ PVB /.test(s)) return 'PVB';
  if (/ PVA /.test(s)) return 'PVA';
  if (/ BVOH /.test(s)) return 'BVOH';
  if (/ HIPS /.test(s)) return 'HIPS';
  if (/ PEI | ULTEM /.test(s)) return 'PEI';
  if (/ CPE /.test(s)) return 'CPE';
  if (/ TPE | TPC /.test(s)) return 'TPE';
  if (/ TPU |FLEX/.test(s)) return 'TPU';
  if (/ PEBA /.test(s)) return 'PEBA';
  if (/ PETG | PET G /.test(s)) return 'PETG';
  if (/ PETT /.test(s)) return 'PETT';
  if (/ PLA\+? /.test(s)) return 'PLA'; // "PLA+"/"PLA Pro" are grades, not distinct polymers
  if (/ PET /.test(s)) return 'PET';
  if (/ ABS /.test(s)) return 'ABS';
  if (/ ASA /.test(s)) return 'ASA';
  if (/ PC |POLYCARBON/.test(s)) return 'PC';
  if (/ PP |POLYPROPY/.test(s)) return 'PP';
  if (/COPOLYESTER/.test(s)) return 'Copolyester';
  if (/ PHA /.test(s)) return 'PHA';
  if (/NYLON|POLYAMID| PA /.test(s)) return 'Nylon';
  // Second pass for names that glue the polymer to a brand word ("ecoPLA", "SmartABS").
  // PLA needs the guard, or "plastic" reads as PLA.
  const c = s.replace(/ /g, '');
  if (/PETG/.test(c)) return 'PETG';
  if (/PCTG/.test(c)) return 'PCTG';
  if (/PLA(?!STIC)/.test(c)) return 'PLA';
  if (/ABS/.test(c)) return 'ABS';
  if (/ASA/.test(c)) return 'ASA';
  if (/TPU/.test(c)) return 'TPU';
  return 'Other';
};

// ---------------------------------------------------------------------------
// Product name
// ---------------------------------------------------------------------------

const SITE_H1 = /official\s+(?:web)?site|home\s?page|welcome to/i;

function slugName(url) {
  const seg = new URL(url).pathname.replace(/\/+$/, '').split('/').pop() || '';
  return decodeURIComponent(seg)
    .replace(/\.html?$/i, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b(pla|abs|asa|petg|pctg|pvb|pva|pc|pp|pa|tpu|tpe|hips|pei|cf|gf|uv)\b/gi, (w) => w.toUpperCase());
}

function productName(dom, url, entry) {
  if (entry.brandFrom === 'slug') return slugName(url);
  const grab = (re) => {
    const m = re.exec(dom);
    return m ? decodeEntities(m[1]).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : '';
  };
  const h1 = grab(/<h1[^>]*>([\s\S]{1,300}?)<\/h1>/i);
  const og = grab(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']*)["']/i)
    || grab(/<meta[^>]+content=["']([^"']*)["'][^>]+property=["']og:title["']/i);
  const ti = grab(/<title[^>]*>([\s\S]{1,300}?)<\/title>/i);

  let name = (h1 && !SITE_H1.test(h1) ? h1 : '') || og || ti || slugName(url);

  // Drop the "<sep> <site name>" tail that most shops append to <title>/og:title.
  const label = entry.host.replace(/^www\./, '').split('.')[0];
  const alts = [entry.manufacturer, entry.manufacturer.replace(/[^A-Za-z0-9]/g, ''), label]
    .map((a) => a.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|');
  name = name.replace(new RegExp(`\\s*[|:–—-]{1,2}\\s*(?:${alts})[A-Za-z0-9 .]*$`, 'i'), '');

  // "FILAMENT 3D PLA Magic Fire" — the shop's category noun, not part of the product name.
  name = name.replace(/^(?:3d\s+filament|filament\s+3d|filamento)\s+(?=\S)/i, '');

  // Spool geometry is not part of the product identity: "…, 2,85 mm / 4000 g", "… 1 kg 1,75 mm".
  name = name
    .replace(/[,\s]*\d+(?:[.,]\d+)?\s*mm\s*\/\s*\d+(?:[.,]\d+)?\s*(?:g|kg)\s*$/i, '')
    .replace(/[,\s]*\d+(?:[.,]\d+)?\s*(?:g|kg)\s+\d+(?:[.,]\d+)?\s*mm\s*$/i, '')
    .replace(/\s*\([^)]*\d[^)]*(?:kg|g|mm)[^)]*\)\s*$/i, '')
    // Trailing SKU in brackets: "ABS (Black Cherry) 1.75mm 1kg Filament [WMRL3005490A]".
    .replace(/\s*\[[A-Z0-9][A-Z0-9-]{3,}\]\s*$/, '')
    .replace(/\s+/g, ' ')
    .trim();

  return name;
}

// ---------------------------------------------------------------------------
// Listing
// ---------------------------------------------------------------------------

const entryFor = (url) => {
  let host;
  try { host = new URL(url).hostname; } catch { return null; }
  return BRANDS.find((b) => host === b.host || host === b.host.replace(/^www\./, '')) || null;
};

async function xmlLocs(url) {
  const r = await get(url);
  if (!r.ok) return { urls: [], index: false, err: r.status };
  return {
    urls: [...r.body.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) => decodeEntities(m[1])),
    index: /<sitemapindex/i.test(r.body),
    err: null,
  };
}

// (a) robots.txt, (b) /sitemap_index.xml or /sitemap.xml.
async function discoverSitemaps(host) {
  const r = await get(`https://${host}/robots.txt`);
  if (r.ok) {
    const declared = [...r.body.matchAll(/^\s*sitemap\s*:\s*(\S+)/gim)]
      .map((m) => (m[1].startsWith('http') ? m[1] : `https://${host}${m[1]}`));
    if (declared.length) return declared;
  }
  for (const cand of ['sitemap_index.xml', 'sitemap.xml']) {
    const s = await xmlLocs(`https://${host}/${cand}`);
    if (s.urls.length) return [`https://${host}/${cand}`];
  }
  return [];
}

async function fromSitemaps(entry) {
  const seeds = entry.sitemap || (await discoverSitemaps(entry.host));
  const found = new Set();
  const queue = seeds.filter((u) => !/\.gz$/i.test(u)).slice(0, 8);
  for (let depth = 0; depth < 2 && queue.length; depth++) {
    const level = queue.splice(0, queue.length);
    for (const sm of level) {
      const { urls, index } = await xmlLocs(sm);
      for (const u of urls) {
        if (entry.product.test(u)) found.add(u);
        else if (index && depth === 0 && !/\.gz$/i.test(u)) queue.push(u);
      }
      if (found.size >= MAX_PER_HOST) return [...found].slice(0, MAX_PER_HOST);
    }
    // Prefer sitemap children that look like a catalogue over blog/press children.
    queue.sort((a, b) => (/produkt|product|shop|store|filament|katalog/i.test(b) ? 1 : 0)
      - (/produkt|product|shop|store|filament|katalog/i.test(a) ? 1 : 0));
    queue.splice(8);
  }
  return [...found].slice(0, MAX_PER_HOST);
}

function hrefs(body, base) {
  const out = new Set();
  for (const m of body.matchAll(/href=["']([^"'#]+)["']/g)) {
    try { out.add(new URL(decodeEntities(m[1]), base).href.split('?')[0]); } catch { /* ignore */ }
  }
  return [...out];
}

// (c) crawl the seed pages, one optional level into category pages.
async function fromListing(entry) {
  const found = new Set();
  const pages = [...entry.listing];
  const seen = new Set();
  for (let depth = 0; depth < 2 && pages.length; depth++) {
    const level = pages.splice(0, pages.length);
    const next = [];
    for (const p of level) {
      if (seen.has(p)) continue;
      seen.add(p);
      const r = await get(p);
      if (!r.ok) continue;
      for (const u of hrefs(r.body, p)) {
        if (entry.product.test(u)) found.add(u);
        else if (depth === 0 && entry.category?.test(u)) next.push(u);
      }
      if (found.size >= MAX_PER_HOST) return [...found].slice(0, MAX_PER_HOST);
    }
    pages.push(...next.slice(0, 20));
  }
  return [...found].slice(0, MAX_PER_HOST);
}

export async function listProducts() {
  const all = [];
  for (const entry of BRANDS) {
    let urls = [];
    try {
      urls = entry.listing && !entry.sitemap ? await fromListing(entry) : await fromSitemaps(entry);
      // A sitemap that yields nothing but a listing that exists is worth the second try.
      if (!urls.length && entry.listing) urls = await fromListing(entry);
    } catch (e) {
      await log(`generic ${entry.host}: listing failed — ${e.message}`);
      continue;
    }
    await log(`generic ${entry.host} (${entry.manufacturer}): ${urls.length} product URLs`);
    all.push(...urls);
  }
  return all;
}

// ---------------------------------------------------------------------------
// Parsing
// ---------------------------------------------------------------------------

export async function parseProduct(url) {
  const entry = entryFor(url);
  if (!entry) return null;
  const res = await get(url);
  if (!res.ok) return null;

  const dom = deJson(res.body);
  const text = flatten(res.body);

  const nozzleLabels = [...(entry.labels?.nozzle || []), ...NOZZLE_LABELS];
  const bedLabels = [...(entry.labels?.bed || []), ...BED_LABELS];

  const host = entry.extract ? entry.extract(text) || {} : {};
  const nozzleTemp = host.nozzleTemp ?? firstPlausible(text, nozzleLabels, { unit: UNIT_C }, 150, 500);
  const bedTemp = host.bedTemp ?? firstPlausible(text, bedLabels, { unit: UNIT_C }, 0, 200);

  // Both are mandatory. A missing one is never filled in with a "typical" value: a preset
  // built on a guessed temperature is worse than no preset at all.
  if (nozzleTemp === undefined || bedTemp === undefined) return null;

  const brand = productName(dom, url, entry);
  if (!brand) return null;

  const out = {
    manufacturer: entry.manufacturer,
    brand,
    // The URL path is part of the evidence: FormFutura's "MetalFil - Ancient Bronze" is only
    // identifiable as PLA from /filaments/pla/….
    filamentType: detectType(brand + ' ' + new URL(url).pathname.replace(/[-_/]+/g, ' ')),
    nozzleTemp,
    bedTemp,
    sourceUrl: url,
    sourceType: 'manufacturer',
  };

  const speed = firstPlausible(text, SPEED_LABELS, { unit: UNIT_SPEED, after: true }, 5, 1000);
  if (speed !== undefined) out.printSpeed = speed;

  for (const m of text.matchAll(rx(FAN_LABELS))) {
    const r = readNumeric(text.slice(m.index + m[0].length, m.index + m[0].length + 120), { unit: UNIT_PCT });
    if (!r || r.max > 100 || r.min < 0) continue;
    // "Cooling: up to 100%" states a ceiling, so it fills only fanSpeedMax.
    if (r.ceiling) out.fanSpeedMax = Math.round(r.max);
    else { out.fanSpeedMin = Math.round(r.min); out.fanSpeedMax = Math.round(r.max); }
    break;
  }

  for (const m of text.matchAll(rx(DRY_LABELS))) {
    const tail = text.slice(m.index + m[0].length, m.index + m[0].length + 90);
    const t = plausible(readNumeric(tail, { unit: UNIT_C }), 30, 120);
    if (t === undefined) continue;
    out.dryingTemp = t;
    const h = new RegExp(`(${NUM}(?:\\s*${SEP}\\s*${NUM})?)\\s*(?:h\\b|hod|hrs?\\b|hours?|godz)`, 'i').exec(tail);
    if (h) out.dryingTime = h[1].replace(/\s+/g, '').replace(/[~–—]/g, '-') + 'h';
    break;
  }

  {
    // Read directly rather than through firstPlausible: density needs its decimals.
    for (const m of text.matchAll(rx(DENSITY_LABELS))) {
      const r = readNumeric(text.slice(m.index + m[0].length, m.index + m[0].length + 90), { unit: UNIT_DENSITY });
      // Require decimals: without it the "3" of "g/cm3" reads as the density.
      if (r && !r.ceiling && r.value % 1 !== 0 && r.value >= 0.7 && r.value <= 4) { out.density = r.value; break; }
    }
  }

  for (const m of text.matchAll(rx(DIAMETER_LABELS))) {
    const r = readNumeric(text.slice(m.index + m[0].length, m.index + m[0].length + 60), { unit: UNIT_MM });
    if (r && !r.ceiling && r.value >= 1.5 && r.value <= 3.2) { out.filamentDiameter = r.value; break; }
  }

  return out;
}

// ---------------------------------------------------------------------------
// CLI self-test
// ---------------------------------------------------------------------------
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  if (args[0] === '--list') {
    const entry = BRANDS.find((b) => b.host === args[1] || b.host.endsWith('.' + args[1]) || b.manufacturer.toLowerCase() === String(args[1]).toLowerCase());
    if (!entry) {
      console.error('unknown host; known: ' + BRANDS.map((b) => b.host).join(', '));
      process.exit(1);
    }
    const urls = entry.listing && !entry.sitemap ? await fromListing(entry) : await fromSitemaps(entry);
    console.log(`${entry.manufacturer} ${entry.host}: ${urls.length} product URLs`);
    for (const u of urls.slice(0, Number(process.env.SHOW) || 10)) console.log('  ' + u);
  } else if (args[0] === '--all') {
    const urls = await listProducts();
    console.log(`TOTAL ${urls.length}`);
  } else {
    for (const u of args) console.log(JSON.stringify(await parseProduct(u)));
  }
}
