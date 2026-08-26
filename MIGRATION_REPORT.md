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


## 8. Second wave — platform-generic parsers (2026-08-25)

Rather than one parser per brand, two generic parsers now cover many brands each, because
storefronts on the same e-commerce platform expose the same machine-readable feed.

| Parser | Feed | Brands | Products listed | Rows parsed |
|---|---|---|---|---|
| `parsers/shopify.mjs` | `/products.json` | Elegoo, Overture, Jayo, Protopasta, Amolen, Siraya Tech, Kexcelled | 777 | 85 |
| `parsers/woocommerce.mjs` | `/wp-json/wc/store/v1/products` | AzureFilm, Print-Me, Francofil, IC3D, iSanmate, das Filament, NinjaTek | 2358 | 510 |

`brand-registry.mjs` holds 114 brands with DNS-verified hosts and detected platform:
**58 other, 37 Shopify, 7 WooCommerce, 10 blocked, 2 unresolved.**

### Why the Shopify yield is low

85 of 777 is a data-availability limit, not a parsing bug. Only ~110 of those products state a
temperature in `body_html` at all — Jayo states none, Elegoo's feed is mostly resin printers
and accessories. The parser captures 77% of what is actually published. Fetching the rendered
product page for the rest is the obvious next step and is not done yet.

### Blocked, no bypass attempted

- 403 bot challenge on every path: bambulab.com, polymaker.com, panchroma.com, hatchbox3d.com,
  filoalfa3d.com, microcenter.com, 3dsolutech.com
- `robots.txt` disallows `/` for `*`: aceaddity.com
- inslogic.com: `robots.txt` returns 522, so the gate fails closed per RFC 9309
- Unresolved (reseller-only, no own domain): OVV3D, Polyalchemy

## 9. Data-quality guards in the importer

510 parsed WooCommerce rows produced only 32 presets. Each guard below was written after
finding the defect in real output, not anticipated:

| Guard | Dropped | Why |
|---|---|---|
| variant collapse | 411 | Colour and weight do not change print settings. AzureFilm: 103 rows / 7 distinct settings; Print-Me: 273 / 18; Francofil: 74 / 3. |
| resold spools | 23 | Every "NinjaTek" row was a colorFabb product — ninjatek.com resells them. Attributing them to NinjaTek would be false. |
| physical sanity | 1 | iSanmate PEI1010 parsed as nozzle 100 / bed 120; a nozzle cooler than the bed means two wrong numbers were paired. |
| non-filament / promo | 56 | Samples, gift cards, spool holders, "MOQ:", "Be the first…". |
| speed ceiling | 6 | "up to 1000 mm/s" is a capability claim, not a setpoint. |

The import is **idempotent**: it dedups on manufacturer|brand *and* on
manufacturer|type|nozzle|bed, because the variant collapse picks a representative name that is
not stable between runs. Preset ids continue from the highest existing `mfr-*-N` rather than
restarting at 1 — that bug had already produced two colliding `mfr-eryone` ids.

## 10. Current state

**716 presets** (from 454), **243 carrying an official source URL**.
`npx tsc --noEmit`, `npm run build` and `scripts/scrape-manufacturers/robots.test.mjs` all pass.
Zero duplicate ids, zero physically implausible rows across the whole database.

### Next, in value order

1. Fetch rendered product pages where the JSON feed omits specs — recovers most of the ~690
   Shopify products currently yielding nothing.
2. The 58 brands on neither platform need per-site parsers or a generic
   sitemap+spec-table fallback; that group holds the largest remaining brands
   (SUNLU, eSUN, Creality, Anycubic, Inland, Jayo).
3. The 3dfilamentprofiles.com brand list has ~1150 brands; work has been top-down by community
   usage. The long tail is mostly 1-3 users per brand and many are Amazon-only resellers with
   no datasheet to cite.
4. 23 pre-existing normalised manufacturer|brand collisions in constants.ts remain untouched.

---

## 11. Three slicer corpora (2026-08-26)

Sections 1–10 describe the storefront-scraping phase and their numbers are superseded here.
Two claims in section 10 are also withdrawn: the database is not at 716 presets, and the "23
pre-existing normalised collisions" were an artefact of the normalisation used to look for
them, not real collisions in `constants.ts`.

### Why this phase happened

The site had 2,133 presets against 3dfilamentprofiles.com's 32,071, which looked like a
2,000% coverage gap. It is not one. That site counts **one row per colour SKU**; this database
collapses colour variants deliberately, so the same catalogue is counted an order of magnitude
differently. Confirmed as the intended behaviour — the count stays in the low thousands.

The real gap was *brands*, and it was closed from three open corpora rather than from more
storefronts.

| Corpus | Licence | Corpus size | Rows | New manufacturers |
|---|---|---|---|---|
| `prusa3d/PrusaSlicer` `resources/profiles/*.ini` | AGPL-3.0 | 35 bundles, 7,528 sections | **342** | 85 seen, ~60 new |
| `Ultimaker/fdm_materials` | **CC0-1.0** | 281 XML | **122** | 27 seen, ~20 new |
| `bambulab/BambuStudio` | AGPL-3.0 | 3,823 files | 79 | **1 net new row** |

Net: **2,133 → 2,441 presets**, **186 → 236 manufacturers**.

ColorFabb, BASF/Forward AM and UltiMaker had been recorded in section 9 as reachable only
through TDS PDFs. All three are in these repos with full parameters, so the PDF-extraction
work that was queued is no longer needed for them.

### What each corpus actually taught

**File count is never material count.** Every estimate made before measuring was wrong in the
same direction: 281 XML files are 129 brand+material pairs and only 112 with both temperatures;
6,069 `.ini` sections are 264 branded products; 3,823 BambuStudio files declare **7** distinct
`filament_vendor` values in total, one of them "Generic". Thresholds were re-derived from the
source each time rather than relaxed until they passed.

**BambuStudio is not worth mining again.** 79 rows, of which exactly one was not already
covered by Orca, Prusa, fdm_materials or SpoolmanDB. Its parser was kept because it forced a
worthwhile refactor — `createSlicerResolver` now drives both it and the Orca parser from one
implementation — not for the data.

**`<machine>` blocks nest inside `<settings>`.** A naive reader of `fdm_materials` gives
Ultimaker PLA the Ultimaker 2+ override of 210 °C instead of its stated 200 °C. Where a
required temperature exists *only* in machine blocks, it is used **only if every machine block
agrees**; that recovers BASF, Polymaker and Verbatim without inventing a number, and the one
file whose machines disagree stays dropped. Those rows say so in their attribution.

### Safety: fibre fill is not marketing

`deriveBrand` had been discarding carbon/glass/aramid tokens along with product-line names, so
`ColorFabb XT-CF20` shipped as "ColorFabb PETG" and `Ultrafuse PA6 GF30` as "PA6" — an abrasive
presented as unfilled. Nine new rows and four existing ones carried it, `Fiberon PETG-rCF08`
among them. That row had already caused a hardened-nozzle correction in an earlier session:
the fix went into `constants.ts` but not into the generator, so a re-import would have restored
it. Fixing the artefact without fixing the generator is not a fix.

CF/GF/AF/Kevlar tokens are now material identity, preserved with their percentage
(`CF20`, `GF30`, `rCF08`), and **51 imported presets carry "Abrasive — hardened nozzle
required."** in their notes.

### Attribution

`sourceType: 'slicer-profile'` now spans four repos, so the note names the right one and its
licence: 218 rows cite PrusaSlicer, 85 Ultimaker fdm_materials, 3 BambuStudio, 2 OrcaSlicer.
The facts-only posture is unchanged — numeric parameter values and the material identifier,
never profile files, creative product names, g-code or prose.

### Current state

**2,441 presets**, **1,987 attributed**, **236 manufacturers**, 4,965 source rows across 13
data files. Provenance: 1,006 manufacturer, 755 slicer-profile, 226 SpoolmanDB, 455 seed.
`npx tsc --noEmit`, `npm run build` and `robots.test.mjs` pass; zero duplicate ids, zero
physically implausible rows.

### Known-bad, deliberately not corrected

84 presets sit outside their material envelope (73 before this phase), none from seed data.
Nearly all are engineering grades that a generic envelope cannot hold — PET-CF at 300 °C is
correct. Three are genuinely mislabelled **upstream** and are carried faithfully rather than
patched:

- `Fiberon PPS-GF20` — Snapmaker's Orca pack declares `filament_type: "ABS"` for a PPS filament
- `Polymaker CoPE` — declared PLA
- `BETA PEBA 90A` — declared TPU

A rule preferring the product name over the declared type was measured and **rejected**: 60
rows disagree, but in ~57 of them the declared type is the more specific and correct one
(`PA-CF` beats a leading-token read of `PA` → Nylon). Corrupting 57 correct rows to fix 3 is a
bad trade.

### Next, in value order

1. Manufacturer aliasing: `3D Fuel`/`3D-Fuel`, `DAS FILAMENT`/`Das Filament`,
   `Proto-pasta`/`ProtoPasta` appear as separate manufacturers; `Made for Prusa` and `VOXELPLA`
   are not manufacturers at all.
2. QIDIStudio and AnycubicSlicerNext — AGPL Orca forks with their own vendor packs, now nearly
   free to add via `createSlicerResolver`. Anycubic is the storefront that rate-limited us.
3. The 84 envelope outliers, checked against their sources one at a time.
4. FilamentColors.xyz (2,258 swatches, 329 manufacturers) — only if the site grows a colour
   layer; it carries no print settings.

---

## 12. Data quality pass (2026-08-26)

Section 11 added brands. This section is about the presets already there being *correct*.

### Manufacturer aliasing — 236 → 205

Four corpora named the same company four ways, so a reader filtering by manufacturer saw one
catalogue split across two or three rows. 199 rows renamed across 31 spellings: 20 case or
punctuation only (`eSun`→`eSUN`, `3D Fuel`→`3D-Fuel`, `Proto-pasta`→`Protopasta`), 11
corporate, each with its reason in `manufacturer-aliases.mjs` — Forward AM is BASF's AM brand,
Prusament is the brand Prusa Polymers makes, "Made for Prusa" is Prusa's own label.

Companies that only *look* alike are recorded there as explicitly **not** aliases: Duramic 3D,
IC3D, Tectonic-3D, Infinity3D, CR3D, R3D, re3D, Raise3D, IMADE3D and E3D all match each other
on a substring test and are ten different companies.

**The dedupe key is `(manufacturer, brand, filamentType, nozzleTemp, bedTemp)`.** Both shorter
keys destroy data. On `(manufacturer, brand)`, "3DXTech CarbonX" and "BASF Ultrafuse" collapse
across four polymers each. Even adding `filamentType` is unsafe: four rows read
`manufacturer: "Prusa", brand: "PETG"` and were Prusament PETG **Ultraglow, Magnetite 40, plain
and Tungsten 75**, printing at 260/85, 270/100, 250/80 and 260/80 — four products whose
distinguishing names had been stripped as if they were colours. Requiring the settings to agree
cut the drop from 76 presets to 26. A duplicate *name* is a naming defect to fix at the source;
on its own it is never a licence to delete a row.

### Abrasive filaments — 51 → 582 warned

Prusament PETG Tungsten 75 and Magnetite 40 are metal-filled, and were stored as plain "PETG"
with no warning: the colour-collapse whitelist did not know those words were fills. Third
occurrence of this defect class, so the detector is now one shared, tested module,
`abrasive.mjs`, with a 44-case self-check — run it directly.

Finding fills is easy. Not warning on look-alikes is the hard part, and every exclusion came
out of the real data: `polycarbonate` contains "carbon"; `carbonlook` and "Carbon Black" are a
finish and a pigment; `metallic`, `metal-shine` and `gun-metal-gray` are colours; `hdglass` and
`orange-glass-transparent` are clear PETG. COEX ships "Stone Gray" in PLA, ABS, ASA, PCTG and
PETG alike — **a fill does not travel across five polymers under one name, a colour does.**

Ordering is `STRONG > DENY > ALLOW`: an explicit CF/GF/Kevlar token outranks every exclusion,
because `ultimaker_ppscf_metallic-anthracite` is PPS-CF in a metallic colour and must not lose
its warning to the word "metallic".

`IDENTITY` gained tungsten, magnetite, kevlar, aramid, glitter, sparkle, galaxy, granite,
basalt, slate, clay, bamboo and cork, which surfaced 24 filled grades previously collapsed onto
their unfilled siblings. It deliberately did **not** gain bronze, copper, brass, steel, iron or
aluminium: 3DJake sells "Bronze" in ecoPLA, easyPETG, ABS and mattePLA, so those are colours.

### The two Orca forks — 1 preset

QIDIStudio and AnycubicSlicerNext are AGPL forks, each a 40-line wrapper around
`createSlicerResolver`. Measured before building, as with BambuStudio: QIDIStudio's 2,341
profile JSONs name five vendors, all already held; AnycubicSlicerNext's 7,786 name 35, of which
only Aliz and DeltaMaker were absent and neither yielded a row. Combined yield: **one preset**.

They are kept because they cannot drift from the shared resolver and will pick up future
additions free — not for the data.

What they surfaced is worth more: AnycubicSlicerNext ships renamed-PLA profiles. `Artillery PC`
declares `inherits: "Artillery Generic PLA"`, `filament_type: PC` and `nozzle_temperature: 210`.
It never reached `constants.ts` only because OrcaSlicer's Artillery pack had already supplied
correct values under the same key — ordering luck, not a guard.

### The 42 cold outliers, reviewed one at a time

**31 were correct and the envelope was wrong.** Verified against what the vendors publish:
Spectrum ASA 275 bed 50-80; Polymaker Fiberon PA6-CF20 bed 25-50 (SpoolmanDB's
`bed_temp_range` — `bed_temp` itself is null); PolyCast PVB bed 25-70; FormFutura AquaSolve PVA
bed 30; PrimaSelect PC-CF bed 70; BASF Ultrafuse PP-GF30 bed 40; Wax-Alike MoldLay nozzle 175,
a casting wax that ships typed PLA. A low bed on ASA or nylon is a product decision — Polymaker
prints their PA line on an adhesive-prepped bed. Envelopes moved to `envelopes.mjs`, shared by
the audit and the importer, each widened floor carrying the source that justifies it.

**10 had the wrong type**, and 67 more were `Other` when the union could now represent them.
`fix-filament-type.mjs` rewrites only when two independent signals agree: the name states
exactly one polymer, and the stored temperatures are not *cold* for it. Temperature is the
independent evidence — a mislabelled row prints at the temperature its name implies, which is
why nobody noticed. The test is cold-only for the same reason the audit is: "PET-CF at 285" is
still a PET and should be typed one.

**9 could not print and were dropped** by `prune-implausible.mjs`: ABS at bed 43, PETG at nozzle
150, ABS at bed 0 — traced to multi-roll bundle listings where the scraped number belongs to
another product, and to two `fdm_materials` entries stating no heated bed. A preset that cannot
print is worse than a missing one: the user loads it, it fails, and the database loses
credibility. `tooCold()` rejects them at import so they cannot return. Dropping Geeetech's bogus
`ABS+` (200/43) unblocked a correct Geeetech ABS (240/100) that its key had been shadowing.

**Direction matters more than distance.** The 42 remaining outliers all run hot and are left
alone; that is what filled and engineering grades do.

### Current state

**2,433 presets**, 205 manufacturers, 582 carrying a hardened-nozzle warning, 122 still typed
`Other`. `tsc`, `npm run build`, `robots.test.mjs`, `abrasive.mjs` (44 cases) all pass; zero
duplicate ids, zero implausible rows, zero cold outliers, and the import is idempotent at
`new=0`.

### Next

1. The 122 rows still typed `Other` — mostly genuine (PEEK, PPS, metal-filled, exotic blends),
   some needing new members in the `FilamentType` union.
2. FilamentColors.xyz, only if the site grows a colour layer: 2,258 swatches and 329
   manufacturers, but no print settings at all.
3. The 42 hot outliers, if ever — each needs its datasheet read, and none is suspected wrong.
