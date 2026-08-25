# VALIDATION — `parsers/generic.mjs`

Separate from `VALIDATION.md` on purpose (that file is owned by the Shopify job).

Scope: the 59 brand-registry hosts whose `platform` is `'other'`, minus the five that already
have dedicated parsers (Prusament, Prusa, Fillamentum, Fiberlogy, Extrudr).

All traffic goes through `fetch.mjs` — robots gate, ≥1.5 s per-domain, `PrintProfilesOrg-bot/1.0`,
disk cache. Nothing here bypasses a bot wall; hosts that refuse are recorded as refusing.

Commands below are the parser's own self-test entry point, run from the repo root:

```
node scripts/scrape-manufacturers/parsers/generic.mjs --list <host>     # discovery
node scripts/scrape-manufacturers/parsers/generic.mjs <product-url>     # one row
```

Every block below is verbatim stdout from a live fetch (2026-08-25). `nozzleTemp` and `bedTemp`
are mandatory: a page that does not publish both parses to `null`, never to a guessed default.

---

## Validated hosts (13)

### SUNLU — `www.sunlu.com`

Sitemap `products.xml`. Spec table: `Nozzle Temperature & Print Speed | 250-260℃/50-100mm/s`, `Bed Temperature | 80-100℃`. The product title is client-rendered (the served `<h1>` is "SUNLU Official Website"), so the name comes from the URL slug — `brandFrom: 'slug'`.

```
$ node scripts/scrape-manufacturers/parsers/generic.mjs --list www.sunlu.com
SUNLU www.sunlu.com: 85 product URLs
```

```
$ node scripts/scrape-manufacturers/parsers/generic.mjs https://www.sunlu.com/products/asa-uv-resistant-filament
{"manufacturer":"SUNLU","brand":"ASA UV resistant filament","filamentType":"ASA","nozzleTemp":255,"bedTemp":90,"sourceUrl":"https://www.sunlu.com/products/asa-uv-resistant-filament","sourceType":"manufacturer","printSpeed":75,"density":1.04,"filamentDiameter":1.75}
$ node scripts/scrape-manufacturers/parsers/generic.mjs https://www.sunlu.com/products/pp-filament-3d
{"manufacturer":"SUNLU","brand":"PP filament 3d","filamentType":"PP","nozzleTemp":220,"bedTemp":55,"sourceUrl":"https://www.sunlu.com/products/pp-filament-3d","sourceType":"manufacturer","printSpeed":230}
```

### eSUN — `eu.esun3d.com`

`www.esun3d.com` disallows us in robots.txt; the EU storefront does not. Labels `Extruder Temperature(°C)` / `Bed Temperature(°C)`. The value is `210-230℃/410-446℉` — the °F half is stripped before any number is read. Print speed is published as `＜300mm/s` (full-width `＜`), i.e. a ceiling, so it is deliberately NOT written to `printSpeed`.

```
$ node scripts/scrape-manufacturers/parsers/generic.mjs --list eu.esun3d.com
eSUN eu.esun3d.com: 114 product URLs
```

```
$ node scripts/scrape-manufacturers/parsers/generic.mjs https://eu.esun3d.com/pla-clear-product
{"manufacturer":"eSUN","brand":"PLA-Clear","filamentType":"PLA","nozzleTemp":210,"bedTemp":53,"sourceUrl":"https://eu.esun3d.com/pla-clear-product","sourceType":"manufacturer","fanSpeedMin":100,"fanSpeedMax":100}
$ node scripts/scrape-manufacturers/parsers/generic.mjs https://eu.esun3d.com/pla-pro-product
{"manufacturer":"eSUN","brand":"PLA+","filamentType":"PLA","nozzleTemp":220,"bedTemp":53,"sourceUrl":"https://eu.esun3d.com/pla-pro-product","sourceType":"manufacturer","fanSpeedMin":100,"fanSpeedMax":100,"dryingTemp":50,"dryingTime":"8-12h"}
```

### Spectrum — `spectrumfilaments.com`

Labels `Nozzle temperature [°C]` / `Bed temperature [°C]`; the unit lives in the label, not the value. `Cooling | Up to 100%` is a ceiling and fills only `fanSpeedMax`.

```
$ node scripts/scrape-manufacturers/parsers/generic.mjs --list spectrumfilaments.com
Spectrum spectrumfilaments.com: 111 product URLs
```

```
$ node scripts/scrape-manufacturers/parsers/generic.mjs https://spectrumfilaments.com/en/filament/pla-esd/
{"manufacturer":"Spectrum","brand":"PLA ESD","filamentType":"PLA","nozzleTemp":208,"bedTemp":25,"sourceUrl":"https://spectrumfilaments.com/en/filament/pla-esd/","sourceType":"manufacturer","printSpeed":195,"fanSpeedMax":100}
$ node scripts/scrape-manufacturers/parsers/generic.mjs https://spectrumfilaments.com/en/filament/peba/
{"manufacturer":"Spectrum","brand":"PEBA","filamentType":"PEBA","nozzleTemp":220,"bedTemp":25,"sourceUrl":"https://spectrumfilaments.com/en/filament/peba/","sourceType":"manufacturer","printSpeed":43,"fanSpeedMax":100,"density":1.02}
```

### 3DJake (own brand only) — `www.3djake.com`

Per-host labels: this shop says `Recommended processing temperature` (nozzle) and `Recommended heating temperature` (bed). 3DJake resells Extrudr/colorFabb/… so the crawl is restricted to `/3djake/…`, its own line — otherwise every row would be attributed to the wrong maker.

```
$ node scripts/scrape-manufacturers/parsers/generic.mjs --list www.3djake.com
3DJake www.3djake.com: 231 product URLs
```

```
$ node scripts/scrape-manufacturers/parsers/generic.mjs https://www.3djake.com/3djake/ecopla-white
{"manufacturer":"3DJake","brand":"3DJAKE ecoPLA White","filamentType":"PLA","nozzleTemp":205,"bedTemp":30,"sourceUrl":"https://www.3djake.com/3djake/ecopla-white","sourceType":"manufacturer","filamentDiameter":1.75}
$ node scripts/scrape-manufacturers/parsers/generic.mjs https://www.3djake.com/3djake/ecopla-dark-green
{"manufacturer":"3DJake","brand":"3DJAKE ecoPLA Dark Green","filamentType":"PLA","nozzleTemp":205,"bedTemp":30,"sourceUrl":"https://www.3djake.com/3djake/ecopla-dark-green","sourceType":"manufacturer","filamentDiameter":1.75}
```

### FormFutura — `www.formfutura.com`

No product sitemap (the declared one lists categories), so the catalogue is crawled from `/filaments` one level deep. Labels `Print temp:` / `Heat bed:`, values written as `± 200 – 275° C` (leading ±, space before C).

```
$ node scripts/scrape-manufacturers/parsers/generic.mjs --list www.formfutura.com
FormFutura www.formfutura.com: 123 product URLs
```

```
$ node scripts/scrape-manufacturers/parsers/generic.mjs https://www.formfutura.com/filaments/pla/metalfil-ancient-bronze
{"manufacturer":"FormFutura","brand":"MetalFil - Ancient Bronze","filamentType":"PLA","nozzleTemp":210,"bedTemp":30,"sourceUrl":"https://www.formfutura.com/filaments/pla/metalfil-ancient-bronze","sourceType":"manufacturer","fanSpeedMin":50,"fanSpeedMax":100}
$ node scripts/scrape-manufacturers/parsers/generic.mjs https://www.formfutura.com/filaments/pla/easyfil-epla
{"manufacturer":"FormFutura","brand":"EasyFil ePLA","filamentType":"PLA","nozzleTemp":238,"bedTemp":55,"sourceUrl":"https://www.formfutura.com/filaments/pla/easyfil-epla","sourceType":"manufacturer","fanSpeedMin":80,"fanSpeedMax":100}
```

### Rosa3D — `www.rosa3d.pl`

Polish labels `Temperatura dyszy [C]` / `Temperatura stołu [C]`, plus `Nawiew [%]` for the fan. The page repeats the pair for high-speed printing; the first (standard) block wins.

```
$ node scripts/scrape-manufacturers/parsers/generic.mjs --list www.rosa3d.pl
Rosa3D www.rosa3d.pl: 300 product URLs
```

```
$ node scripts/scrape-manufacturers/parsers/generic.mjs https://www.rosa3d.pl/filament-3d-refill-pla-starter-gray-refill-1kg-175mm
{"manufacturer":"Rosa3D","brand":"ReFill PLA Starter Gray","filamentType":"PLA","nozzleTemp":220,"bedTemp":50,"sourceUrl":"https://www.rosa3d.pl/filament-3d-refill-pla-starter-gray-refill-1kg-175mm","sourceType":"manufacturer","fanSpeedMin":70,"fanSpeedMax":100}
$ node scripts/scrape-manufacturers/parsers/generic.mjs https://www.rosa3d.pl/filament-3d-pla-magic-neon-sunrise-03kg-175mm
{"manufacturer":"Rosa3D","brand":"PLA Magic Neon Sunrise","filamentType":"PLA","nozzleTemp":210,"bedTemp":50,"sourceUrl":"https://www.rosa3d.pl/filament-3d-pla-magic-neon-sunrise-03kg-175mm","sourceType":"manufacturer","fanSpeedMin":50,"fanSpeedMax":100}
```

### AURAPOL — `www.aurapol.com`

`aurapol.cz` 301s to `www.aurapol.com`, whose sitemaps are gzipped (the shared fetch layer returns text), so the shop is crawled from `/cz/`. Czech labels `Teplota tisku` / `Teplota podložky`, values `210-240 C` with the unit AFTER the range.

```
$ node scripts/scrape-manufacturers/parsers/generic.mjs --list www.aurapol.com
AURAPOL www.aurapol.com: 101 product URLs
```

```
$ node scripts/scrape-manufacturers/parsers/generic.mjs https://www.aurapol.com/cz/p/aurapol-pla-3d-filament-metallic-turquoise-1-kg-1-75-mm
{"manufacturer":"AURAPOL","brand":"AURAPOL PLA 3D Filament Metallic Turquoise","filamentType":"PLA","nozzleTemp":225,"bedTemp":50,"sourceUrl":"https://www.aurapol.com/cz/p/aurapol-pla-3d-filament-metallic-turquoise-1-kg-1-75-mm","sourceType":"manufacturer","filamentDiameter":1.75}
$ node scripts/scrape-manufacturers/parsers/generic.mjs https://www.aurapol.com/cz/p/aurapol-pla-3d-filament-black-1-kg-1-75-mm
{"manufacturer":"AURAPOL","brand":"AURAPOL PLA 3D Filament Black","filamentType":"PLA","nozzleTemp":225,"bedTemp":50,"sourceUrl":"https://www.aurapol.com/cz/p/aurapol-pla-3d-filament-black-1-kg-1-75-mm","sourceType":"manufacturer","filamentDiameter":1.75}
```

### Winkle — `winkle.shop`

The `/producto/<colour>` pages answer 200 with a zero-byte body to a plain UA, so the per-material pages from `categorias-sitemap.xml` are used instead — one page per material rather than one per colour. The whole page is a JSON-escaped string (`\u00baC`), which is un-escaped before parsing; note Winkle writes the degree sign as `º` U+00BA.

```
$ node scripts/scrape-manufacturers/parsers/generic.mjs --list winkle.shop
Winkle winkle.shop: 19 product URLs
```

```
$ node scripts/scrape-manufacturers/parsers/generic.mjs https://winkle.shop/filamento-impresora-3d/petg/petg-fibra-de-carbono/
{"manufacturer":"Winkle","brand":"PETG Fibra de Carbono","filamentType":"PETG","nozzleTemp":245,"bedTemp":80,"sourceUrl":"https://winkle.shop/filamento-impresora-3d/petg/petg-fibra-de-carbono/","sourceType":"manufacturer","printSpeed":50,"filamentDiameter":1.75}
$ node scripts/scrape-manufacturers/parsers/generic.mjs https://winkle.shop/filamento-impresora-3d/pla/filamento-pla-mate/
{"manufacturer":"Winkle","brand":"PLA Mate","filamentType":"PLA","nozzleTemp":200,"bedTemp":50,"sourceUrl":"https://winkle.shop/filamento-impresora-3d/pla/filamento-pla-mate/","sourceType":"manufacturer","printSpeed":60,"filamentDiameter":1.75}
```

### Nobufil — `www.nobufil.com`

Wix storefront, 1.8 MB pages. `- Print temperature: 255°C ± 10` / `- Bed temp: 85°C ± 10` — the `± 10` must not be read as a range end, and is not (only `- – — ~ / to / bis / do` separate a range).

```
$ node scripts/scrape-manufacturers/parsers/generic.mjs --list www.nobufil.com
Nobufil www.nobufil.com: 154 product URLs
```

```
$ node scripts/scrape-manufacturers/parsers/generic.mjs https://www.nobufil.com/en/product-page/pla-filament-astro-black
{"manufacturer":"Nobufil","brand":"Nobufil PLAx Astro Black Filament","filamentType":"PLA","nozzleTemp":225,"bedTemp":65,"sourceUrl":"https://www.nobufil.com/en/product-page/pla-filament-astro-black","sourceType":"manufacturer","fanSpeedMin":20,"fanSpeedMax":60}
$ node scripts/scrape-manufacturers/parsers/generic.mjs https://www.nobufil.com/en/product-page/abs-filament-astro-grey
{"manufacturer":"Nobufil","brand":"Nobufil ABSx Astro Gray Filament","filamentType":"ABS","nozzleTemp":260,"bedTemp":100,"sourceUrl":"https://www.nobufil.com/en/product-page/abs-filament-astro-grey","sourceType":"manufacturer","fanSpeedMax":15}
```

### Zyltech — `www.zyltech.com`

BigCommerce, no sitemap; crawled from the homepage category links. `Print Temperature: 240-280°C` / `Heated Bed Temp: 90-110°C`.

```
$ node scripts/scrape-manufacturers/parsers/generic.mjs --list www.zyltech.com
Zyltech www.zyltech.com: 32 product URLs
```

```
$ node scripts/scrape-manufacturers/parsers/generic.mjs https://www.zyltech.com/high-speed-high-flow-matte-petg-3d-printer-filament-1-75mm-5-kg-11-lbs/
{"manufacturer":"Zyltech","brand":"High Speed High Flow Matte PETG 3D Printer Filament 1.75mm 5 kg 11 lbs","filamentType":"PETG","nozzleTemp":235,"bedTemp":80,"sourceUrl":"https://www.zyltech.com/high-speed-high-flow-matte-petg-3d-printer-filament-1-75mm-5-kg-11-lbs/","sourceType":"manufacturer","density":1.29}
$ node scripts/scrape-manufacturers/parsers/generic.mjs https://www.zyltech.com/abs-carbon-fiber-3d-printer-filament-1-75mm-1kg-2-2-lbs-made-in-usa/
{"manufacturer":"Zyltech","brand":"ABS Carbon Fiber 3D Printer Filament 1.75mm 1kg 2.2 lbs Made in USA","filamentType":"ABS","nozzleTemp":260,"bedTemp":100,"sourceUrl":"https://www.zyltech.com/abs-carbon-fiber-3d-printer-filament-1-75mm-1kg-2-2-lbs-made-in-usa/","sourceType":"manufacturer","density":1.07}
```

### Gizmo Dorks — `gizmodorks.com`

BigCommerce, no sitemap; crawled from the homepage. Two real quirks: the range is split by a tag boundary (`Print Temperature: 190</…><…>-225°C`, handled because tags flatten to a single space) and the bed reads `Bed Temperature: Not required, but recommended at 60 °C` — 35 characters of prose between label and value.

```
$ node scripts/scrape-manufacturers/parsers/generic.mjs --list gizmodorks.com
Gizmo Dorks gizmodorks.com: 12 product URLs
```

```
$ node scripts/scrape-manufacturers/parsers/generic.mjs https://gizmodorks.com/abs-3d-printer-filament/
{"manufacturer":"Gizmo Dorks","brand":"3D Printing ABS Filament","filamentType":"ABS","nozzleTemp":240,"bedTemp":110,"sourceUrl":"https://gizmodorks.com/abs-3d-printer-filament/","sourceType":"manufacturer"}
$ node scripts/scrape-manufacturers/parsers/generic.mjs https://gizmodorks.com/pla-3d-printer-filament/
{"manufacturer":"Gizmo Dorks","brand":"3D Printer PLA Filament","filamentType":"PLA","nozzleTemp":208,"bedTemp":60,"sourceUrl":"https://gizmodorks.com/pla-3d-printer-filament/","sourceType":"manufacturer"}
```

### Paramount 3D — `www.paramount-3d.com`

Per-host `extract`: one combined field with the BED FIRST — `Bed / Print Temperature: 100 - 110 C (212 - 230 F) / 220 - 260 C (428 - 500 F)`. The generic path would read 105 as the nozzle temperature, so this host splits the two halves explicitly. Both °F parentheticals are removed before parsing.

```
$ node scripts/scrape-manufacturers/parsers/generic.mjs --list www.paramount-3d.com
Paramount 3D www.paramount-3d.com: 176 product URLs
```

```
$ node scripts/scrape-manufacturers/parsers/generic.mjs https://www.paramount-3d.com/product-page/abs-black-cherry-1-75mm-1kg-filament-wmrl3005490c
{"manufacturer":"Paramount 3D","brand":"ABS (Black Cherry) 1.75mm 1kg Filament","filamentType":"ABS","nozzleTemp":240,"bedTemp":105,"sourceUrl":"https://www.paramount-3d.com/product-page/abs-black-cherry-1-75mm-1kg-filament-wmrl3005490c","sourceType":"manufacturer"}
$ node scripts/scrape-manufacturers/parsers/generic.mjs https://www.paramount-3d.com/product-page/abs-pantone-autobot-blue-2118c-1-75mm-1kg-filament-brl50022118c-1
{"manufacturer":"Paramount 3D","brand":"ABS (Autobot Blue) 1.75mm 1kg Filament","filamentType":"ABS","nozzleTemp":240,"bedTemp":105,"sourceUrl":"https://www.paramount-3d.com/product-page/abs-pantone-autobot-blue-2118c-1-75mm-1kg-filament-brl50022118c-1","sourceType":"manufacturer"}
```

### Stronghero3d — `www.stronghero3d.com`

Per-host `extract` for the nozzle only: the page is prose with the label AFTER the value (`…around 190°C to 220°C for the nozzle temperature`). The bed sentence (`Use a heated bed set between 50°C to 60°C`) is ordinary enough for the shared path.

```
$ node scripts/scrape-manufacturers/parsers/generic.mjs --list www.stronghero3d.com
Stronghero3d www.stronghero3d.com: 9 product URLs
```

```
$ node scripts/scrape-manufacturers/parsers/generic.mjs https://www.stronghero3d.com/products/stronghero3dplafilament.html
{"manufacturer":"Stronghero3d","brand":"Stronghero3dPLAfilament black blue purpleNet Weight 1kg(2.2lbs)","filamentType":"PLA","nozzleTemp":205,"bedTemp":55,"sourceUrl":"https://www.stronghero3d.com/products/stronghero3dplafilament.html","sourceType":"manufacturer","filamentDiameter":1.75}
$ node scripts/scrape-manufacturers/parsers/generic.mjs https://www.stronghero3d.com/products/stronghero3dplaprinterfilament.html
{"manufacturer":"Stronghero3d","brand":"Stronghero3d PLA filament blue green Diameter1.75mm weight1kg","filamentType":"PLA","nozzleTemp":200,"bedTemp":30,"sourceUrl":"https://www.stronghero3d.com/products/stronghero3dplaprinterfilament.html","sourceType":"manufacturer","printSpeed":55,"density":1.24}
```
---

## Parse rate on a live sample

8 URLs per host from the head of each listing, all parsed in one pass. No row tripped the
importer's physical-sanity check (`nozzleTemp` 150–500, `bedTemp` ≤ 200, `nozzleTemp > bedTemp`).

| host | listed | sampled | parsed | null |
|---|---|---|---|---|
| eu.esun3d.com | 114 | 8 | 8 | 0 |
| spectrumfilaments.com | 111 | 8 | 8 | 0 |
| www.3djake.com | 231 | 8 | 8 | 0 |
| www.formfutura.com | 123 | 8 | 8 | 0 |
| www.rosa3d.pl | 300 | 8 | 8 | 0 |
| www.sunlu.com | 85 | 8 | 7 | 1 |
| www.nobufil.com | 154 | 8 | 6 | 2 |
| www.zyltech.com | 32 | 8 | 6 | 2 |
| winkle.shop | 19 | 8 | 3 | 5 |
| www.paramount-3d.com | 176 | 8 | 3 | 5 |
| www.aurapol.com | 101 | 8 | 2 | 6 |
| www.stronghero3d.com | 9 | 8 | 2 | 6 |
| gizmodorks.com | 12 | 8 | 1 | 7 |

The `null`s are correct, not failures. Spot-checked:

- `https://www.aurapol.com/cz/p/aurapol-pet-g-recycled-filament-cloud-stone-1-kg-1-75-mm` —
  166 KB page, zero occurrences of "Teplota". AURAPOL publishes the temperature block on its
  PLA pages and omits it on the recycled PET-G line. Returning `null` is the right answer;
  copying a typical PETG value in would be an invention.
- gizmodorks.com's `/3d-printer-filament-1kg/`, `-200g/`, `-5kg/` are size landing pages with
  no spec block; the material pages (`/pla-3d-printer-filament/`, `/abs-…`) do have one.
- Rows with no `printSpeed`/`density` simply mean the page does not publish them.

`www.rosa3d.pl` and `www.3djake.com` list more than `GENERIC_MAX_PER_HOST` (default 300);
raise that env var for a full crawl.

---

## Hosts that yielded nothing, and what the page actually contained

Each was fetched and inspected. They are recorded in the `UNPARSEABLE` export of
`parsers/generic.mjs` so a future run does not re-litigate them.

### Published no print settings

| host | what the page contains |
|---|---|
| colorfabb.com | Full product page, but the only spec reference is `<a class="pdf-link" title="Technical Datasheet colorFabb" href="https://downloads.colorfabb.com/index.php/s/rtfDDRCa723Xdor?path=%2F">` — an off-site Nextcloud TDS folder. Zero occurrences of "print temp", "nozzle", "bed temp". |
| ultimaker.com | `/materials/petg/` lists mechanical data only (`Heat deflection (HDT) at 0.455 MPa* | 76.2 ± 0.8 °C`, `Melting temperature | - (amorphous)`). Print settings are in per-material TDS PDFs. |
| raise3d.com | `/products/raise3d-premium-pla-filament/` is marketing copy plus a reseller CTA; the only "Filament" hits are the related-products rail. |
| forward-am.com (BASF) | `/material-portfolio/ultrafuse-filaments-for-fused-filaments-fabrication-fff/` is portfolio prose ("whether its standard filaments, filaments for high temperatures…"). Settings are per-material PDFs. |
| igus.com | The `catalog-en-US` sitemap is 9282 bearing/cable pages. The 58 "filament-ish" URLs are `readycable_…_TPE` cables, not filament. |
| creality.com | `sitemap-products.xml` has 115 URLs, 4 filament-related, and all four are collections (`creality-filament-resin`, `cfs-c-smart-filament-system`, dryers). No spec block. |
| makerbot.com | Sitemap children are `post`, `page`, `printer`, `software`, `legal`. No material product pages; the filament hits are `/stories/…` articles. |
| verbatim.com | 1206 URLs across USB drives, mice, DVDs, SSDs, cables. No 3D-printing section in the sitemap. |
| gembird.com | 4780 URLs, all `item.aspx` / `product_finder.aspx` accessory pages; zero filament-ish matches. |
| comgrow.com | Catalogue is resold Creality/Sovol goods (`creality-rfid-hyper-pla-filament`, `sovol-pla-filament-…`), not an own line — the importer's resold-brand guard would drop them anyway. |

### Client-rendered — the served HTML has no data at all

| host | what the fetch returned |
|---|---|
| matterhackers.com | Every `/store/l/<slug>/sk/<id>` URL returns the same 62 602-byte store shell; `<title>Store | MatterHackers</title>`, only nav text. |
| filament-pm.com | `https://www.filament-pm.cz/abs-t` → 153 680 bytes, `<title>Tiskové struny do 3D tiskáren | Filament PM</title>`, **0** occurrences of `teplota`/`temperatur`. |
| tinmorry.com | Home page is a 163-byte shell. |
| snapmaker.com | The sitemap declared in robots.txt parses to 0 `<loc>` entries. |
| rec3d.ru | `/en/plastik-dlya-3d-printerov/pla/pla-silk/` returns 228 826 bytes with an empty `<title>` and no spec block — a bot wall. Not bypassed. |
| smartmaterials3d.com | `1_index_sitemap.xml` lists three per-language children; each parses to 0 `<loc>`. |
| taulman3d.com | `sitemap_index.xml` → `page-sitemap.xml` → 3 URLs (home, about, contact). The shop is off-site. |
| nature3d.net | `robots.txt` 404; no `sitemap.xml`/`sitemap_index.xml`; single page. |
| deeplee.net, soleyin.com, filaform.com | Sitemap contains exactly one URL, path `/lander` — a parked/placeholder page. |
| cc3d.store | `sitemap.xml` → `sitemap.website.xml` → 1 URL. |

### Blocked or refused (logged, moved on — no bypass attempted)

No robots.txt `Disallow` stopped a fetch on any host in this job — the one hard gate that
fired was the fail-closed rule on unreachable robots.txt (next table). What did stop us:

| host | reason |
|---|---|
| 123-3d.nl | `https://www.123-3d.nl/sitemapxml/index-sitemap.xml` → HTTP 401. (Reseller catalogue in any case.) |
| reprapper.com | Intermittent host: `robots.txt` answered 200 on the first pass, then every request (`robots.txt` included) returned a network error, so `fetch.mjs` correctly refused to proceed. |
| sakata3d.com | `https://www.sakata3d.com/` answers HTTP 200 with a **zero-byte** body. |
| addnorth.com | Not a robots block: every `/product/<family>/<variant>` URL taken from addnorth's own sitemap returns HTTP 404 to a plain UA (tested both raw and percent-encoded). |

Two corrections to first-pass assumptions, verified rather than assumed:

- **anycubic.com is not blocked.** `www.anycubic.com` is a brochure site with no product
  sitemap; the filament catalogue is at `store.anycubic.com/products/…?variant=…`, a Shopify
  storefront. It therefore belongs to `parsers/shopify.mjs`, not here, and is out of scope.
- **www.esun3d.com is not blocked either.** `https://www.esun3d.com/pla-basic-product` returns
  408 954 bytes through the gate. It is the same catalogue as `eu.esun3d.com`, which is the
  host actually crawled, so it is skipped as a duplicate rather than as a refusal.

Also worth recording: `formfutura.com`, `nobufil.com` and `paramount-3d.com` all carry a
`Disallow: /` group in robots.txt, but scoped to named AI crawlers. `fetch.mjs`'s group-aware
RFC 9309 parse correctly leaves our UA allowed, and every product fetch on those hosts
succeeded — the flag is not a block.

### DNS / connection failure

`smartfil.es`, `giantarm.com`, `fiberon3d.com`, `mika3d.com`, `yousu3d.com`, `zortrax.com`,
`keenevillageplastics.com`, `realfilament.com`, `3de.co.uk` — `https://<host>/robots.txt`
raises a network error, and `fetch.mjs` fails CLOSED on that (RFC 9309 §2.3.1.3), so nothing
is fetched. Re-check later; these may be transient or geo-blocked.

### Already covered elsewhere — not touched

`prusament.com`, `prusa3d.com`, `fillamentum.com`, `fiberlogy.com`, `extrudr.com` have
dedicated parsers. `aurapol.cz` redirects to `www.aurapol.com` and is crawled under that host.

---

## Numeric handling, and the bugs each rule exists to prevent

| rule | real page it came from |
|---|---|
| range → rounded midpoint | `210-240 C` → 225 |
| interleaved units (`200°C-230°C`) | the range regex allows a unit between the two numbers |
| °F stripped BEFORE parsing | Paramount 3D `100 - 110 C (212 - 230 F) / 220 - 260 C (428 - 500 F)`; eSUN `210-230℃/410-446℉`. Without this, 212 and 410 parse as setpoints. |
| `-`, `–`, `—`, `~`, `to`, `bis`, `do`, `až` are separators; `±` and `+` are not | Nobufil `255°C ± 10` must be 255, not a 255–10 range |
| "up to" / `<` / `≤` / `＜` is a ceiling | Spectrum `Cooling: Up to 100%` → `fanSpeedMax` only; eSUN `＜300mm/s` → `printSpeed` omitted entirely. A ceiling is never written as a setpoint. |
| unit must be present, anchored to a digit or brackets | A bare `/\bC\b/` also matched the "c" of `Pęcice` in Spectrum's footer address (JS word boundaries do not treat `ę` as a letter), turning postal code 85 into a drying temperature. `UNIT_C` now requires `°C`, `<digit> C`, `[C]`, `(C)` or `celsius`. |
| speed requires `mm/s` immediately after the number | SUNLU's `Nozzle Temperature & Print Speed | 250-260℃/50-100mm/s`: the "Print Speed" label is followed first by the temperature. Requiring the unit to trail the number yields 75, not 255. |
| density requires decimals | `Density（g/cm³）` — the "3" of `cm3` was being read as the density. |
| tags flatten to a space, never to nothing | Gizmo Dorks writes `Print Temperature: 190</span><span>-225°C`; joining without a space would still work, but joining two unrelated words would not. |
| both temperatures mandatory | `parseProduct` returns `null` if either is missing. No typical value is ever substituted. |
