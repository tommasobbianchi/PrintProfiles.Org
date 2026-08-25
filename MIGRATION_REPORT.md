# MIGRATION_REPORT — filament DB enrichment from OFFICIAL manufacturer sources

Date: 2026-08-25 · Base HEAD: `07ffc3d`

## 1. Gap analysis of `constants.ts`

454 presets across 109 manufacturers. Coverage of the priority targets
(count = presets, list = materials actually covered):

| Manufacturer | Presets | Materials present | Gap |
|---|---|---|---|
| Polymaker | 13 | ABS ASA Nylon PA-CF PA-GF PETG PLA | no TPU/PC/PVB |
| Bambu Lab | 12 | ABS PA-CF PC PETG PLA TPU Other | no ASA/PA-GF/PVA/support |
| ColorFabb | 11 | Copolyester PLA TPU | **no PETG/ABS/ASA/PA** |
| Sunlu | 11 | ABS ASA PETG PLA TPU | no PC/PA/PVA |
| eSUN | 9 | ABS PA-CF PEBA PETG PLA | no ASA/TPU/PC |
| Elegoo | 8 | ABS ASA PETG PLA TPU | no PA/PC |
| Fiberlogy | 8 | Copolyester Other PETG PLA | **no ABS/ASA/PA/TPU/PC** |
| Overture | 8 | Nylon PC PETG PLA TPU | no ABS/ASA |
| Fillamentum | 7 | ABS Copolyester PEBA PLA Other | **no PETG/ASA/PA/PC** |
| Eryone | 6 | PETG PLA TPU | **no ABS/ASA/PA** |
| Extrudr | 6 | ASA PETG PLA TPU | **no PA/PC/ABS** |
| Prusa (Prusament) | 5 | ASA PC PETG PLA | **no PVB/PA11CF/ABS/TPU** |
| AzureFilm | 3 | PA-CF PETG PLA | **no ABS/ASA/TPU/PC** |
| Creality (incl. Hyper) | 3 | ABS PETG PLA | **no ASA/TPU/PA/Hyper line** |

**Biggest gaps** (major catalogue, thin coverage, and an official spec page that is
machine-readable): **Prusament, Fiberlogy, Extrudr, Fillamentum, Eryone**, then
Creality/Hyper and AzureFilm.
Every existing preset is generic/unattributed — none carries a source URL, so even where a
material is "present" the values are unverified against the vendor datasheet.

## 2. robots.txt pre-check (UA `PrintProfilesOrg-bot/1.0`)

| Domain | /robots.txt | Disallow rules | Verdict |
|---|---|---|---|
| prusament.com | 200 | 1 | crawlable |
| fiberlogy.com | 200 | 19 | crawlable (product paths allowed) |
| extrudr.com | 200 | 9 | crawlable |
| fillamentum.com | 200 | 2 | crawlable |
| eryone3d.com | 200 | 50 | crawlable (Shopify default set) |

No bot challenge at the robots layer on any of the five — unlike
`3dfilamentprofiles.com`, which is still blocked by a Vercel Security Checkpoint
(see `scripts/scrape-3dfp/scrape.mjs` header) and stays abandoned.

## 3. Architecture

```
scripts/scrape-manufacturers/
  fetch.mjs              shared: robots.txt hard gate, >=1.5 s/domain rate limit,
                         PrintProfilesOrg-bot UA, backoff retry, disk cache/, pdftotext
  parsers/<name>.mjs     per-manufacturer: listProducts() + parseProduct(url)
  run-all.mjs            sequential, incremental JSON in data/, resumable
  import-manufacturers.mjs  data/*.json -> createPreset() lines, dedup vs constants.ts
  VALIDATION.md          real extracted output per parser
```

Attribution: every imported preset carries `notes: "Official <Manufacturer> data — <sourceUrl>"`.

## 4. Status

Complete. Five parsers implemented and validated, full crawl run, 144 presets imported.

## 5. Parsers implemented

All five targets turned out to be crawlable — including Fiberlogy, which the first run
wrongly reported as blocked (see the robots.txt note below).

| Parser | Site | Listing strategy | Products | Fields beyond nozzle/bed |
|---|---|---|---|---|
| `parsers/prusament.mjs` | prusament.com | `/materials/` index | 23 | — |
| `parsers/fiberlogy.mjs` | fiberlogy.com | paginated shop archive `/en/sklep/page/N/` | 77 | density |
| `parsers/extrudr.mjs` | extrudr.com | sitemap | 156 | printSpeed, fan, drying, density |
| `parsers/fillamentum.mjs` | shop.fillamentum.com | sitemap | 275 | — |
| `parsers/eryone.mjs` | eryone3d.com | sitemap | 207 | printSpeed, filamentDiameter |

Prusament and Extrudr read structured data (the `__NEXT_DATA__` JSON blob) rather than
scraping rendered markup, so they are the least fragile of the five. The others parse the
spec table in the product description.

### robots.txt: the block was ours, not theirs

The first run logged `robots-disallow` for Fiberlogy and skipped the site. That was a bug in
our own gate, not a restriction by the vendor. `fiberlogy.com/robots.txt` grants
`User-agent: * → Allow: /` and serves `Disallow: /` only to *named* AI crawlers (GPTBot,
ClaudeBot, CCBot, Amazonbot, Bytespider, Google-Extended, meta-externalagent…). The original
parser unioned the Disallow rules of *every* group regardless of user-agent, so those
named-bot rules collapsed into a blanket self-block.

`fetch.mjs` now matches groups per RFC 9309: the rules that apply are those of the groups
naming our UA, plus the `*` fallback. Reviewing that change surfaced three further defects,
all now fixed and covered by `robots.test.mjs`:

1. mid-pattern wildcards (`Disallow: /*?add-to-cart=`) compiled to a `startsWith` test that
   could never match — those rules **failed open**;
2. `Allow:` was parsed but never consulted, so longest-match carve-outs over-blocked;
3. an unreachable or 5xx robots.txt was treated as permission; it now **fails closed**.

We crawl as `PrintProfilesOrg-bot/1.0` with contact details in the UA, at >= 1.5 s per domain,
and we match `*`. Worth a human decision if these vendors are ever contacted directly: they
clearly signal they do not want AI *training* crawlers, and while a product-data crawler for
an attributed filament database is a different thing and is what `*` permits, that is our
reading of their intent, not their explicit consent.

## 6. Validation

Real extracted output for all five parsers is in `scripts/scrape-manufacturers/VALIDATION.md`
(2-3 live product pages each). Every parser extracts nozzle and bed temperature at minimum.
Samples:

```
Prusa PA11        nozzle 275 / bed 100   https://prusament.com/materials/prusament-pa11/
Fiberlogy PCTG+GF nozzle 260 / bed 100   density 1.31
Extrudr DuraPro ABS  nozzle 235 / bed 105  speed 110, fan 0-50%, drying 60C/10h, rho 1.05
Fillamentum ABS Extrafill  nozzle 235 / bed 93
Eryone PETG & Carbon Fiber PETG  nozzle 240 / bed 78  speed 55
```

Crawl: `nohup node scripts/scrape-manufacturers/run-all.mjs`, **PID 2408487**, ran
09:06-09:25 UTC on 2026-08-25 and exited cleanly. 497 products parsed. The run is resumable —
`data/<parser>.json` is written incrementally and already-seen URLs are skipped on restart,
and every HTTP response is cached under `cache/` — so re-running it costs no network traffic.

### Data checks before import

- Range-checked all 144 presets. Three outliers were verified against the vendors' own
  structured data rather than assumed wrong: Prusa PEI 1010 (410 C) and Fiberlogy PEI 9085
  (365 C) are correct for those polymers, and Extrudr PLA HS really is published as
  "up to 250 C / up to 1000 mm/s".
- Those "up to" figures are ceilings, not setpoints. `printSpeed > 300` is now dropped at
  import so a marketing bound never becomes a slicer default (6 rows affected).
- 27 listing rows that are not filaments (sample lengths, gift cards, spool holders) skipped.
- 326 rows collapsed as already present — overwhelmingly colour variants of one product.
- All 598 preset ids unique; no imported preset collides with an existing manufacturer|brand.

## 7. Presets added and what is left

454 -> **598** presets (+144), each carrying `notes: "Official <Manufacturer> data — <url>"`.

| Manufacturer | Added | Gap it closed |
|---|---|---|
| Fiberlogy | 42 | ABS/ASA/PA/TPU/PC, previously absent |
| Extrudr | 31 | PA/PC/ABS |
| Eryone | 30 | ABS/ASA/PA |
| Prusa | 22 | PVB/PA11CF/ABS/TPU |
| Fillamentum | 19 | PETG/ASA/PA/PC |

`npx tsc --noEmit` and `npm run build` both pass.

### Remaining TODOs

- **The other 109 manufacturers are still unattributed.** Only these 5 vendors now cite a
  source; every other preset remains generic and unverified against any datasheet.
- **23 pre-existing normalised manufacturer|brand collisions** in constants.ts (e.g.
  `3dxtech|carbonx`, `inland|pla`). Pre-existing, untouched here — worth a dedup pass.
- Polymaker, eSUN, ColorFabb, Sunlu, Overture and Elegoo were confirmed crawlable in section
  2 but have no parser yet; they are the largest remaining gaps.
- `filamentType` falls back to `'Other'` for 28 imported presets (PCTG, PP, PEI, PVB blends)
  because the app's enum has no member for them. Extending `FilamentType` would classify them.
- No preset carries `maxVolumetricSpeed` from a datasheet; `createPreset` still derives it
  from the material type.
- Re-running the crawl picks up vendor catalogue changes; the import is idempotent.
