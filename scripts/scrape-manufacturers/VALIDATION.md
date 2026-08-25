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
