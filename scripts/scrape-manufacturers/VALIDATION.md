# Validation — scripts/scrape-manufacturers

Every output below was produced by running the parser against a **live** product page
(`node` v24, run from `scripts/scrape-manufacturers/`). Nothing was invented.

Summary:

| Parser | Site | listing | nozzle/bed | extra fields |
|---|---|---|---|---|
| `parsers/prusament.mjs` | prusament.com | 23 materials from `/materials/` | ✓ | — |
| `parsers/fiberlogy.mjs` | fiberlogy.com | 77 products (paginated shop archive) | ✓ | density |
| `parsers/extrudr.mjs` | extrudr.com | 156 products (sitemap) | ✓ | printSpeed, fan, drying, density |
| `parsers/fillamentum.mjs` | shop.fillamentum.com | 275 products (sitemap) | ✓ | — |
| `parsers/eryone.mjs` | eryone3d.com | 207 products (sitemap) | ✓ | printSpeed, filamentDiameter |

All five sites are reachable and robot-friendly; **no site is blocked**.

---

## Prusament

`listProducts()` crawls `https://prusament.com/materials/` and collects the 23 material
links. `parseProduct()` reads the "Printer requirements" table, which uses two label
generations — `<th>Nozzle</th>/<th>Heatbed</th>` (new) and `<th>Extruder</th>/<th>Bed</th>`
(older) — both in the form `Temperature: <nominal> ± <tolerance> °C`; the **nominal** is
taken (not the tolerance midpoint).

```
$ node -e 'import("./parsers/prusament.mjs").then(async m => console.log(JSON.stringify(await m.parseProduct("https://prusament.com/materials/prusament-pa11/"), null, 2)))'
{
  "manufacturer": "Prusa",
  "brand": "PA11",
  "filamentType": "Nylon",
  "nozzleTemp": 275,
  "bedTemp": 100,
  "sourceUrl": "https://prusament.com/materials/prusament-pa11/",
  "sourceType": "manufacturer"
}
```

```
$ node -e 'import("./parsers/prusament.mjs").then(async m => console.log(JSON.stringify(await m.parseProduct("https://prusament.com/materials/prusament-pla-high-speed/"), null, 2)))'
{
  "manufacturer": "Prusa",
  "brand": "PLA High Speed",
  "filamentType": "PLA",
  "nozzleTemp": 210,
  "bedTemp": 50,
  "sourceUrl": "https://prusament.com/materials/prusament-pla-high-speed/",
  "sourceType": "manufacturer"
}
```

```
$ node -e 'import("./parsers/prusament.mjs").then(async m => console.log(JSON.stringify(await m.parseProduct("https://prusament.com/materials/prusament-petg/"), null, 2)))'
{
  "manufacturer": "Prusa",
  "brand": "PETG",
  "filamentType": "PETG",
  "nozzleTemp": 250,
  "bedTemp": 80,
  "sourceUrl": "https://prusament.com/materials/prusament-petg/",
  "sourceType": "manufacturer"
}
```

Extracts: `nozzleTemp`, `bedTemp` (always), plus `manufacturer`/`brand`/`filamentType`.

---

## Fiberlogy

`listProducts()` does **not** use the sitemap. `https://fiberlogy.com/product-sitemap.xml`
is served but the robots.txt `*`-group lists specific Disallow rules for query URLs; the
robots parser matches our agent and applies those rules, and the product paths themselves
(`/en/product/…`) are not disallowed. The parser instead crawls the paginated shop archive
`https://fiberlogy.com/en/sklep/` (page 1 … 7) and collects 77 product URLs.

`parseProduct()` reads the "Technical Data" tab: `Printing temperature`, `Bed temperature`,
`Density`.

```
$ node -e 'import("./parsers/fiberlogy.mjs").then(async m => console.log(JSON.stringify(await m.parseProduct("https://fiberlogy.com/en/product/fibersilk-pla-filament-s2/"), null, 2)))'
{
  "manufacturer": "Fiberlogy",
  "brand": "FiberSilk PLA Filament",
  "filamentType": "PLA",
  "nozzleTemp": 220,
  "bedTemp": 60,
  "sourceUrl": "https://fiberlogy.com/en/product/fibersilk-pla-filament-s2/",
  "sourceType": "manufacturer",
  "density": 1.22
}
```

```
$ node -e 'import("./parsers/fiberlogy.mjs").then(async m => console.log(JSON.stringify(await m.parseProduct("https://fiberlogy.com/en/product/mineral-pla-filament-s2/"), null, 2)))'
{
  "manufacturer": "Fiberlogy",
  "brand": "PLA Mineral Filament",
  "filamentType": "PLA",
  "nozzleTemp": 200,
  "bedTemp": 60,
  "sourceUrl": "https://fiberlogy.com/en/product/mineral-pla-filament-s2/",
  "sourceType": "manufacturer",
  "density": 1.38
}
```

Extracts: `nozzleTemp`, `bedTemp` (always), `density`.

---

## Extrudr

`listProducts()` reads `https://extrudr.com/sitemap-0.xml` and keeps `/products/` URLs.
`parseProduct()` parses the `__NEXT_DATA__` JSON (Saleor) and reads the stable attribute
slugs `nozzle-temperature`, `build-plate-temperature`, `print-speed`, `cooling-fan`,
`drying-temperature`, `drying-time`, `density`.

```
$ node -e 'import("./parsers/extrudr.mjs").then(async m => console.log(JSON.stringify(await m.parseProduct("https://extrudr.com/de/de/products/durapro-asa/"), null, 2)))'
{
  "manufacturer": "Extrudr",
  "brand": "DuraPro ASA",
  "filamentType": "ASA",
  "nozzleTemp": 245,
  "bedTemp": 105,
  "sourceUrl": "https://extrudr.com/de/de/products/durapro-asa/",
  "sourceType": "manufacturer",
  "printSpeed": 110,
  "fanSpeedMin": 0,
  "fanSpeedMax": 30,
  "dryingTemp": 60,
  "dryingTime": "10h",
  "density": 1.1
}
```

```
$ node -e 'import("./parsers/extrudr.mjs").then(async m => console.log(JSON.stringify(await m.parseProduct("https://extrudr.com/de/de/products/biofusion/"), null, 2)))'
{
  "manufacturer": "Extrudr",
  "brand": "BioFusion",
  "filamentType": "Other",
  "nozzleTemp": 215,
  "bedTemp": 40,
  "sourceUrl": "https://extrudr.com/de/de/products/biofusion/",
  "sourceType": "manufacturer",
  "printSpeed": 30,
  "fanSpeedMin": 10,
  "fanSpeedMax": 30,
  "dryingTemp": 60,
  "dryingTime": "0–4h",
  "density": 1.25
}
```

Extracts: `nozzleTemp`, `bedTemp` (always), plus `printSpeed`, `fanSpeedMin`,
`fanSpeedMax`, `dryingTemp`, `dryingTime`, `density`.

---

## Fillamentum

Products live on the Shopify storefront `shop.fillamentum.com`. `listProducts()` follows
`sitemap.xml` → `sitemap_products_1.xml`. `parseProduct()` handles both spec templates:

- "Product information" accordion: `Working temperature` / `Heated bed` (industrial materials)
- "PRINTING SETTING" section: `Printing Temperature` / `Bed Temperature` (PLA/PETG/…)

The bed lower bound in the second template is a theme default of `0 – 55 °C`; when the lower
bound is 0 the parser takes the upper bound as the recommended bed temp.

```
$ node -e 'import("./parsers/fillamentum.mjs").then(async m => console.log(JSON.stringify(await m.parseProduct("https://shop.fillamentum.com/products/orca"), null, 2)))'
{
  "manufacturer": "Fillamentum",
  "brand": "0rCA®",
  "filamentType": "PA-CF",
  "nozzleTemp": 260,
  "bedTemp": 95,
  "sourceUrl": "https://shop.fillamentum.com/products/orca",
  "sourceType": "manufacturer"
}
```

```
$ node -e 'import("./parsers/fillamentum.mjs").then(async m => console.log(JSON.stringify(await m.parseProduct("https://shop.fillamentum.com/products/pla-extrafill-signal-red"), null, 2)))'
{
  "manufacturer": "Fillamentum",
  "brand": "PLA Extrafill",
  "filamentType": "PLA",
  "nozzleTemp": 200,
  "bedTemp": 55,
  "sourceUrl": "https://shop.fillamentum.com/products/pla-extrafill-signal-red",
  "sourceType": "manufacturer"
}
```

Extracts: `nozzleTemp`, `bedTemp` (always). Brand is normalised to the material family
(e.g. `PLA Extrafill "Signal Red" | 2.85 mm` → `PLA Extrafill`).

---

## Eryone

`listProducts()` follows `sitemap.xml` → `sitemap_products_1.xml`. `parseProduct()` reads the
description spec block (`Printing Temperature`, `Heated Bed Temperature`, `Printing Speed`,
`Filament Diameter`). Accessory products have no such block and return `null`. Brand decodes
HTML entities and strips the diameter/weight tail and the `3D Printer Filament` suffix.

```
$ node -e 'import("./parsers/eryone.mjs").then(async m => console.log(JSON.stringify(await m.parseProduct("https://eryone3d.com/products/petg"), null, 2)))'
{
  "manufacturer": "Eryone",
  "brand": "PETG & Carbon Fiber PETG",
  "filamentType": "PETG",
  "nozzleTemp": 240,
  "bedTemp": 78,
  "sourceUrl": "https://eryone3d.com/products/petg",
  "sourceType": "manufacturer",
  "printSpeed": 55,
  "filamentDiameter": 1.75
}
```

```
$ node -e 'import("./parsers/eryone.mjs").then(async m => console.log(JSON.stringify(await m.parseProduct("https://eryone3d.com/products/wood-pla"), null, 2)))'
{
  "manufacturer": "Eryone",
  "brand": "PLA Wood",
  "filamentType": "PLA",
  "nozzleTemp": 205,
  "bedTemp": 63,
  "sourceUrl": "https://eryone3d.com/products/wood-pla",
  "sourceType": "manufacturer",
  "filamentDiameter": 1.75
}
```

Extracts: `nozzleTemp`, `bedTemp` (always), plus `printSpeed`, `filamentDiameter`.

---

## Skipped / blocked

None. All five target sites were fetched and parsed successfully (HTTP 200).

Notes:

- **Fiberlogy**: the product sitemap is not used. robots.txt scopes `Disallow: /` to named
  AI crawlers (Amazonbot, Bytespider, GPTBot, ClaudeBot, …); our agent is matched against the
  `*` group, whose Disallow rules (uploads, admin, query filters) do not cover `/en/product/`
  or `/en/sklep/`. Listing therefore crawls the paginated shop archive.
- No bot-challenge, 403, or 429 wall was hit on any site during validation.

## WooCommerce (multi-brand)

`parsers/woocommerce.mjs` covers every brand that `brand-registry.mjs` probed as
`platform: 'woocommerce'`. Source is the public WooCommerce Store API
(`/wp-json/wc/store/v1/products?per_page=100&page=N`), which returns `name`, `permalink`,
`description` and `short_description` as structured JSON — no rendered-HTML scraping needed on
these hosts. All requests go through `fetch.mjs` (robots gate, >=1.5 s/domain, disk cache).

Below: 2 real products from each of 4 live WooCommerce hosts, with the exact command and its
exact stdout. Each row genuinely carries `nozzleTemp` and `bedTemp` read off the live page.

### azurefilm.com (AzureFilm)

Source text: `Nozzle temperature: 250 °C  Bed Temperature: 60 °C  Max Printing Speed: ≤ 100 mm/s`

```
$ WOO_HOSTS=azurefilm.com WOO_MAX_PAGES=1 node --input-type=module -e '
const m = await import("./scripts/scrape-manufacturers/parsers/woocommerce.mjs");
const urls = await m.listProducts();
let n = 0;
for (const u of urls) { const r = await m.parseProduct(u); if (r) { console.log(JSON.stringify(r, null, 2)); if (++n >= 2) break; } }
'
2026-08-25T13:37:20.821Z woocommerce AzureFilm (azurefilm.com): 100 product URLs
{
  "manufacturer": "AzureFilm",
  "brand": "PETG CF Onyx Black",
  "filamentType": "PETG",
  "nozzleTemp": 250,
  "bedTemp": 60,
  "printSpeed": 100,
  "filamentDiameter": 1.75,
  "sourceUrl": "https://azurefilm.com/product/petg-cf-onyx-black/",
  "sourceType": "manufacturer"
}
{
  "manufacturer": "AzureFilm",
  "brand": "PETG CF Olive Green",
  "filamentType": "PETG",
  "nozzleTemp": 250,
  "bedTemp": 60,
  "printSpeed": 100,
  "filamentDiameter": 1.75,
  "sourceUrl": "https://azurefilm.com/product/petg-cf-olive-green/",
  "sourceType": "manufacturer"
}
```

### print-me.pl (Print-Me)

Source text (Polish spec table):
`Zalecana temperatura druku: 210 - 230 [°C]` / `Podgrzewany stół: 60-80 [°C]` /
`Chłodzenie wydruku: 0-30 [%]` -> midpoints 220 / 70, fan 0-30.

```
$ WOO_HOSTS=print-me.pl WOO_MAX_PAGES=1 node --input-type=module -e '
const m = await import("./scripts/scrape-manufacturers/parsers/woocommerce.mjs");
const urls = await m.listProducts();
let n = 0;
for (const u of urls) { const r = await m.parseProduct(u); if (r) { console.log(JSON.stringify(r, null, 2)); if (++n >= 2) break; } }
'
2026-08-25T13:37:22.069Z woocommerce Print-Me (print-me.pl): 100 product URLs
{
  "manufacturer": "Print-Me",
  "brand": "Easy ASA White 200g",
  "filamentType": "ASA",
  "nozzleTemp": 220,
  "bedTemp": 70,
  "fanSpeedMin": 0,
  "fanSpeedMax": 30,
  "filamentDiameter": 1.75,
  "sourceUrl": "https://print-me.pl/sklep/produkty/industry/asa/easy-asa/easy-asa-white-200g/",
  "sourceType": "manufacturer"
}
{
  "manufacturer": "Print-Me",
  "brand": "Easy ASA Black 200g",
  "filamentType": "ASA",
  "nozzleTemp": 220,
  "bedTemp": 70,
  "fanSpeedMin": 0,
  "fanSpeedMax": 30,
  "filamentDiameter": 1.75,
  "sourceUrl": "https://print-me.pl/sklep/produkty/industry/asa/easy-asa/easy-asa-black-200g/",
  "sourceType": "manufacturer"
}
```

### francofil.fr (Francofil)

Source text (French):
`Température de buse 200 - 230°C  Température du plateau 30 - 70°C  Vitesse d'impression 50 - 100 mm/s`
-> 215 / 50 / 75.

```
$ WOO_HOSTS=francofil.fr WOO_MAX_PAGES=1 node --input-type=module -e '
const m = await import("./scripts/scrape-manufacturers/parsers/woocommerce.mjs");
const urls = await m.listProducts();
let n = 0;
for (const u of urls) { const r = await m.parseProduct(u); if (r) { console.log(JSON.stringify(r, null, 2)); if (++n >= 2) break; } }
'
2026-08-25T13:37:22.647Z woocommerce Francofil (francofil.fr): 100 product URLs
{
  "manufacturer": "Francofil",
  "brand": "PLA Vert Irisé Pailleté",
  "filamentType": "PLA",
  "nozzleTemp": 215,
  "bedTemp": 50,
  "printSpeed": 75,
  "filamentDiameter": 1.75,
  "sourceUrl": "https://francofil.fr/product/pla-vert-irise-paillete/",
  "sourceType": "manufacturer"
}
{
  "manufacturer": "Francofil",
  "brand": "PLA Orange Translucide",
  "filamentType": "PLA",
  "nozzleTemp": 215,
  "bedTemp": 50,
  "printSpeed": 75,
  "filamentDiameter": 1.75,
  "sourceUrl": "https://francofil.fr/product/pla-orange-translucide/",
  "sourceType": "manufacturer"
}
```

### ic3dprinters.com (IC3D)

The interleaved-unit case, plus Fahrenheit noise that must NOT be read as a range:
`Extrusion Temperature: Brass Nozzle, 270°C – 290°C (518°F – 554°F)` -> 280
`Print Surface Temperature: ~110°C-120°C (~230°–248°F)` -> 115
`Recommended Cooling Amount: 0% – 10%` -> fan 0-10 (percent sign between the bounds).

```
$ WOO_HOSTS=ic3dprinters.com WOO_MAX_PAGES=1 node --input-type=module -e '
const m = await import("./scripts/scrape-manufacturers/parsers/woocommerce.mjs");
const urls = await m.listProducts();
let n = 0;
for (const u of urls) { const r = await m.parseProduct(u); if (r) { console.log(JSON.stringify(r, null, 2)); if (++n >= 2) break; } }
'
2026-08-25T13:37:23.361Z woocommerce IC3D (ic3dprinters.com): 10 product URLs
{
  "manufacturer": "IC3D",
  "brand": "PolyHex™ (Hi-Temp PETG) Filament",
  "filamentType": "PETG",
  "nozzleTemp": 280,
  "bedTemp": 115,
  "dryingTemp": 65,
  "density": 1.18,
  "filamentDiameter": 2.85,
  "sourceUrl": "https://www.ic3dprinters.com/shop/polyhex/",
  "sourceType": "manufacturer"
}
{
  "manufacturer": "IC3D",
  "brand": "Carbon Fiber PETG",
  "filamentType": "PETG",
  "nozzleTemp": 268,
  "bedTemp": 90,
  "fanSpeedMin": 0,
  "fanSpeedMax": 10,
  "dryingTemp": 65,
  "filamentDiameter": 2.85,
  "sourceUrl": "https://www.ic3dprinters.com/shop/cf-petg/",
  "sourceType": "manufacturer"
}
```

### Brand / platform resolution

`resolve-brands.mjs` probes every host in `brand-registry.mjs` through `fetch.mjs` and prints
what each one actually runs. Subset run over the WooCommerce and blocked brands:

```
$ node scripts/scrape-manufacturers/resolve-brands.mjs woocommerce blocked
brand                   | host                        | platform    | robots                  | products| detail
----------------------------------------------------------------------------------------------------------------
Bambu Lab               | bambulab.com                | blocked     | allowed                 | -       | HTTP 403 on /products.json
Polymaker               | polymaker.com               | blocked     | allowed                 | -       | HTTP 403 on /products.json
Inland                  | www.microcenter.com         | blocked     | allowed                 | -       | HTTP 403 on /products.json
PanChroma               | panchroma.com               | blocked     | allowed                 | -       | HTTP 403 on /products.json
Hatchbox                | hatchbox3d.com              | blocked     | allowed                 | -       | HTTP 403 on /products.json
iSanmate                | isanmate.com                | woocommerce | allowed                 | 1       | store-api
Inslogic                | inslogic.com                | blocked     | disallow /              | -       | robots.txt disallows the home page
AzureFilm               | azurefilm.com               | woocommerce | allowed                 | 1       | store-api
Aceaddity               | aceaddity.com               | blocked     | disallow /              | -       | robots.txt disallows the home page
RepRapper               | reprapper.com               | other       | allowed                 | -       | reachable, neither platform detected  <-- registry says 'blocked'
3D Solutech             | 3dsolutech.com              | blocked     | allowed                 | -       | HTTP 403 on /wp-json
Das Filament            | dasfilament.de              | woocommerce | allowed                 | 1       | store-api
NinjaTek                | ninjatek.com                | woocommerce | allowed                 | 1       | store-api
Filoalfa                | filoalfa3d.com              | blocked     | allowed                 | -       | HTTP 403 on /products.json
Print-Me                | print-me.pl                 | woocommerce | allowed                 | 1       | store-api
Francofil               | francofil.fr                | woocommerce | allowed                 | 1       | store-api
IC3D                    | ic3dprinters.com            | woocommerce | allowed                 | 1       | store-api

17 brands probed
  blocked      9
  woocommerce  7
  other        1
```

(The RepRapper drift line is the registry being corrected in place afterwards: the first
full probe hit a transient `robots.txt` 5xx on reprapper.com and `fetch.mjs` correctly failed
CLOSED; the re-probe found it reachable, so the registry now says `other`.)

Full-registry probe, 114 brands:

```
$ CONCURRENCY=10 node scripts/scrape-manufacturers/resolve-brands.mjs
...
114 brands probed
  other        58
  shopify      37
  blocked      10
  woocommerce  7
  unresolved   2
```

### Hosts that block us, and why (no bypass attempted)

| host | reason |
|---|---|
| bambulab.com, polymaker.com, panchroma.com, hatchbox3d.com, filoalfa3d.com, www.microcenter.com | HTTP 403 bot challenge on every path incl. the home page |
| 3dsolutech.com | HTTP 403 on `/wp-json` and `/` |
| inslogic.com | `robots.txt` returns 522; `fetch.mjs` fails CLOSED per RFC 9309 §2.3.1.3 |
| aceaddity.com | `robots.txt` disallows `/` for `*` |

### Brands with no resolvable storefront

`OVV3D` and `Polyalchemy` — no candidate domain resolves in DNS; both are sold through Amazon
and resellers only. Recorded as `platform: 'unresolved'`, `host: null`.

### Known limits

- A product whose Store API description is non-empty but carries no temperature labels is
  skipped without fetching its rendered page (one request per catalogue accessory saved). Only
  an empty/near-empty description triggers the HTML fallback.
- `filamentType` falls back to `'Other'` only when the product name contains "filament";
  otherwise the row is dropped, which is what keeps printers, dryers and spool holders — whose
  listings quote nozzle temperatures of their own — out of the dataset.
- `nozzleTemp`/`bedTemp` are hard requirements. No default, typical or inferred value is ever
  substituted: a product missing either one returns `null`.
