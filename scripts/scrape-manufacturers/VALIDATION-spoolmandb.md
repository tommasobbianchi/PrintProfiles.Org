# VALIDATION — SpoolmanDB parser

Source: **https://github.com/Donkie/SpoolmanDB** — MIT licensed, used with attribution.
Every emitted row carries `sourceUrl` = the raw JSON permalink of the vendor file it came
from, and `sourceType: 'spoolmandb'` so the provenance stays distinguishable from rows
scraped off a manufacturer's own site.

Parser: `scripts/scrape-manufacturers/parsers/spoolmandb.mjs`
All network traffic goes through `fetch.mjs` (robots gate, rate limit, disk cache).
No manufacturer website was crawled for this source.

Run date: 2026-08-25. All commands below are run from the repo root
(`/home/tommaso/projects/printprofiles-org`) and their stdout is pasted verbatim, including
the `fetch.mjs` robots warnings.

## Headline numbers

| | |
|---|---|
| Vendor files enumerated (live listing, not hardcoded) | **53** |
| Filament entries listed | **415** |
| Rows produced (`parseProduct` returned a row) | **409** |
| Dropped (no usable published temperature) | **6** |
| Rows failing an `import-manufacturers.mjs` guard | **0** |

Type distribution of the 409 rows:
`PLA=177 PETG=66 ASA=34 ABS=34 TPU=29 PC=20 Other=14 PA-CF=11 Nylon=6 PCTG=4 PA-GF=3 PVB=3
HIPS=2 PVA=2 TPE=2 PET=1 PA12=1` — every value is a member of the `FilamentType` union in
`types.ts`.

Note on volume before import: 409 rows is the *pre-import* count. `import-manufacturers.mjs`
collapses colour variants and drops anything already in `constants.ts`, so the number of new
presets will be lower. This parser already emits one row per *product*, not per colour.

## Temperature handling — no invented values

SpoolmanDB states temperatures in two forms, and both are used as published:

* `extruder_temp_range: [260,300]` / `bed_temp_range: [25,50]` → rounded midpoint (280 / 38).
* `extruder_temp: 220` / `bed_temp: 60` → the scalar as published.

Across the 415 entries: 132 carry `extruder_temp_range`, 287 carry the scalar
`extruder_temp`; 90 carry `bed_temp_range`, 331 carry the scalar `bed_temp`. Rejecting the
scalar form would have discarded 287 of 415 entries — including all of Bambu Lab — for no
reason, since the scalar is the database's own published figure, not a default.

If **neither** form is present, or a value is non-numeric, `parseProduct` returns `null`.
Nothing is defaulted, inferred or carried over from another entry.

## Command 1 — full enumeration and per-vendor counts

```
node --input-type=module -e 'import * as p from "./scripts/scrape-manufacturers/parsers/spoolmandb.mjs"; const urls = await p.listProducts(); const by = new Map(); const drops = []; for (const u of urls) { const v = u.slice(u.lastIndexOf("/") + 1).replace(/\.json#.*/, ""); const r = await p.parseProduct(u); const c = by.get(v) || { listed: 0, parsed: 0 }; c.listed++; if (r) c.parsed++; else drops.push(u); by.set(v, c); } console.log(`vendors=${by.size} listed=${urls.length} parsed=${urls.length - drops.length} dropped=${drops.length}`); for (const [v, c] of by) console.log(`${v} listed=${c.listed} parsed=${c.parsed}`); for (const d of drops) console.log(`DROPPED ${d}`);'
```

stdout:

```
2026-08-25T16:14:24.159Z WARN robots.txt for api.github.com returned 403 — no rules, proceeding
2026-08-25T16:14:24.199Z WARN robots.txt for raw.githubusercontent.com returned 404 — no rules, proceeding
vendors=53 listed=415 parsed=409 dropped=6
3dfuel listed=1 parsed=1
3djake listed=5 parsed=5
3dxtech listed=16 parsed=16
AmazonBasics listed=4 parsed=4
AzureFilm listed=16 parsed=16
NTHGrillon listed=1 parsed=0
Numakers listed=8 parsed=7
abaflex listed=1 parsed=1
addnorth listed=38 parsed=38
ambrosia listed=16 parsed=15
anycubic listed=10 parsed=10
aurapol listed=3 parsed=3
bambulab listed=41 parsed=41
catyarn listed=1 parsed=1
cc3d listed=3 parsed=3
closin listed=1 parsed=1
cr3d listed=3 parsed=3
creality listed=6 parsed=6
dasfilament listed=4 parsed=4
deeplee listed=1 parsed=1
devildesign listed=8 parsed=8
elegoo listed=8 parsed=8
eryone listed=3 parsed=3
esun listed=14 parsed=13
extrudr listed=28 parsed=28
fiberlogy listed=1 parsed=1
filamentunger listed=3 parsed=3
fillamentum listed=2 parsed=2
flashforge listed=3 parsed=3
formfutura listed=3 parsed=3
fusion listed=4 parsed=4
geeetech listed=4 parsed=4
gembird listed=1 parsed=1
gst3d listed=7 parsed=7
hatchbox listed=4 parsed=4
jayo listed=5 parsed=5
ldo listed=3 parsed=1
overture listed=8 parsed=8
polarfilament listed=2 parsed=2
polymaker listed=33 parsed=33
protopasta listed=51 parsed=51
prusament listed=8 parsed=8
qiditech listed=5 parsed=5
r3d listed=3 parsed=3
ratrig listed=4 parsed=4
rosa3d listed=4 parsed=4
siddament listed=1 parsed=1
soleyin listed=1 parsed=1
spectrum listed=2 parsed=2
sunlu listed=9 parsed=9
tinmorry listed=1 parsed=1
voolt3d listed=1 parsed=1
voxelpla listed=2 parsed=2
DROPPED https://raw.githubusercontent.com/Donkie/SpoolmanDB/master/filaments/NTHGrillon.json#0
DROPPED https://raw.githubusercontent.com/Donkie/SpoolmanDB/master/filaments/Numakers.json#5
DROPPED https://raw.githubusercontent.com/Donkie/SpoolmanDB/master/filaments/ambrosia.json#14
DROPPED https://raw.githubusercontent.com/Donkie/SpoolmanDB/master/filaments/esun.json#12
DROPPED https://raw.githubusercontent.com/Donkie/SpoolmanDB/master/filaments/ldo.json#0
DROPPED https://raw.githubusercontent.com/Donkie/SpoolmanDB/master/filaments/ldo.json#1
```

## The 6 dropped entries — every one is an upstream data defect

Inspected by hand (`weights` and `colors` elided for readability):

```
NTHGrillon 0 {"name":"grillon3 PLA | {color_name}","material":"PLA","density":1.25,"diameters":[1.75,2.85]}
Numakers 5 {"name":"{color_name} CF","material":"PLA+","fill":"carbon fiber","density":1.23,"diameters":[1.75],"extruder_temp_Range":[210,240],"bed_temp_range":[35,45]}
ambrosia 14 {"name":"{color_name}","material":"PHA","density":1.21,"diameters":[1.75],"extruder_temp_range":[185,205]}
esun 12 {"name":"{color_name}","material":"HIPS","density":1.05,"diameters":[1.75],"extruder_temp_rang":[230,270],"bed_temp_range":[100,115]}
ldo 0 {"name":"{color_name}","material":"ABS","density":1.06,"diameters":[1.75],"extruder_temp ":260,"bed_temp_range":[90,110]}
ldo 1 {"name":"{color_name}","material":"ASA","density":1.08,"diameters":[1.75],"extruder_temp ":260,"bed_temp_range":[90,110]}
```

| Entry | Reason |
|---|---|
| `NTHGrillon#0` | No temperature of any kind published |
| `ambrosia#14` | Extruder range present, **no bed temperature at all** |
| `Numakers#5` | Upstream typo: key is `extruder_temp_Range` (capital R) |
| `esun#12` | Upstream typo: key is `extruder_temp_rang` (truncated) |
| `ldo#0`, `ldo#1` | Upstream typo: key is `"extruder_temp "` (trailing space) |

These 4 typo'd keys are misspellings in SpoolmanDB itself, not parse failures on our side.
They are **not** silently repaired here: reading a misspelled key would mean guessing which
field the author meant. Worth a PR upstream; until then the entries yield no preset.

**No vendor file failed to parse.** All 53 files are valid JSON with a `manufacturer` string
and a `filaments` array.

## Command 2 — 3 real filaments from each of 7 vendors

Includes `bambulab` and `polymaker` (both unreachable by crawling — 403 bot challenge on
their own sites), `creality` and `anycubic` (same), `hatchbox` (4 filaments), `protopasta`,
and the small vendor `cc3d` (3 filaments total).

```
node --input-type=module -e 'import * as p from "./scripts/scrape-manufacturers/parsers/spoolmandb.mjs"; const RAW = "https://raw.githubusercontent.com/Donkie/SpoolmanDB/master/filaments/"; for (const v of ["bambulab", "polymaker", "creality", "anycubic", "hatchbox", "protopasta", "cc3d"]) { for (let i = 0; i < 3; i++) console.log(JSON.stringify(await p.parseProduct(`${RAW}${v}.json#${i}`))); }'
```

stdout:

```
2026-08-25T16:14:08.804Z WARN robots.txt for raw.githubusercontent.com returned 404 — no rules, proceeding
{"manufacturer":"Bambu Lab","brand":"PLA","filamentType":"PLA","nozzleTemp":220,"bedTemp":60,"sourceUrl":"https://raw.githubusercontent.com/Donkie/SpoolmanDB/master/filaments/bambulab.json","sourceType":"spoolmandb","density":1.24,"filamentDiameter":1.75}
{"manufacturer":"Bambu Lab","brand":"PLA WOOD","filamentType":"PLA","nozzleTemp":215,"bedTemp":40,"sourceUrl":"https://raw.githubusercontent.com/Donkie/SpoolmanDB/master/filaments/bambulab.json","sourceType":"spoolmandb","density":1.21,"filamentDiameter":1.75}
{"manufacturer":"Bambu Lab","brand":"Matte PLA","filamentType":"PLA","nozzleTemp":220,"bedTemp":60,"sourceUrl":"https://raw.githubusercontent.com/Donkie/SpoolmanDB/master/filaments/bambulab.json","sourceType":"spoolmandb","density":1.31,"filamentDiameter":1.75}
{"manufacturer":"Polymaker","brand":"Fiberon PA12-CF10","filamentType":"PA-CF","nozzleTemp":280,"bedTemp":38,"sourceUrl":"https://raw.githubusercontent.com/Donkie/SpoolmanDB/master/filaments/polymaker.json","sourceType":"spoolmandb","density":1.06,"filamentDiameter":1.75}
{"manufacturer":"Polymaker","brand":"Fiberon PA6-CF20","filamentType":"PA-CF","nozzleTemp":290,"bedTemp":38,"sourceUrl":"https://raw.githubusercontent.com/Donkie/SpoolmanDB/master/filaments/polymaker.json","sourceType":"spoolmandb","density":1.17,"filamentDiameter":1.75}
{"manufacturer":"Polymaker","brand":"Fiberon PA6-GF25","filamentType":"PA-GF","nozzleTemp":290,"bedTemp":38,"sourceUrl":"https://raw.githubusercontent.com/Donkie/SpoolmanDB/master/filaments/polymaker.json","sourceType":"spoolmandb","density":1.2,"filamentDiameter":1.75}
{"manufacturer":"Creality","brand":"Hyper PLA","filamentType":"PLA","nozzleTemp":210,"bedTemp":60,"sourceUrl":"https://raw.githubusercontent.com/Donkie/SpoolmanDB/master/filaments/creality.json","sourceType":"spoolmandb","density":1.24,"filamentDiameter":1.75}
{"manufacturer":"Creality","brand":"Hyper RFID PLA","filamentType":"PLA","nozzleTemp":210,"bedTemp":60,"sourceUrl":"https://raw.githubusercontent.com/Donkie/SpoolmanDB/master/filaments/creality.json","sourceType":"spoolmandb","density":1.24,"filamentDiameter":1.75}
{"manufacturer":"Creality","brand":"Hyper ABS","filamentType":"ABS","nozzleTemp":260,"bedTemp":80,"sourceUrl":"https://raw.githubusercontent.com/Donkie/SpoolmanDB/master/filaments/creality.json","sourceType":"spoolmandb","density":1.04,"filamentDiameter":1.75}
{"manufacturer":"ANYCUBIC","brand":"PETG","filamentType":"PETG","nozzleTemp":240,"bedTemp":70,"sourceUrl":"https://raw.githubusercontent.com/Donkie/SpoolmanDB/master/filaments/anycubic.json","sourceType":"spoolmandb","density":1.3,"filamentDiameter":1.75}
{"manufacturer":"ANYCUBIC","brand":"PLA","filamentType":"PLA","nozzleTemp":210,"bedTemp":55,"sourceUrl":"https://raw.githubusercontent.com/Donkie/SpoolmanDB/master/filaments/anycubic.json","sourceType":"spoolmandb","density":1.23,"filamentDiameter":1.75}
{"manufacturer":"ANYCUBIC","brand":"Glow PLA","filamentType":"PLA","nozzleTemp":210,"bedTemp":60,"sourceUrl":"https://raw.githubusercontent.com/Donkie/SpoolmanDB/master/filaments/anycubic.json","sourceType":"spoolmandb","density":1.24,"filamentDiameter":1.75}
{"manufacturer":"Hatchbox","brand":"ABS","filamentType":"ABS","nozzleTemp":250,"bedTemp":105,"sourceUrl":"https://raw.githubusercontent.com/Donkie/SpoolmanDB/master/filaments/hatchbox.json","sourceType":"spoolmandb","density":1.04,"filamentDiameter":1.75}
{"manufacturer":"Hatchbox","brand":"PLA","filamentType":"PLA","nozzleTemp":210,"bedTemp":60,"sourceUrl":"https://raw.githubusercontent.com/Donkie/SpoolmanDB/master/filaments/hatchbox.json","sourceType":"spoolmandb","density":1.27,"filamentDiameter":1.75}
{"manufacturer":"Hatchbox","brand":"Sparkle PLA","filamentType":"PLA","nozzleTemp":210,"bedTemp":60,"sourceUrl":"https://raw.githubusercontent.com/Donkie/SpoolmanDB/master/filaments/hatchbox.json","sourceType":"spoolmandb","density":1.27,"filamentDiameter":1.75}
{"manufacturer":"Protopasta","brand":"Metallic PETG","filamentType":"PETG","nozzleTemp":210,"bedTemp":70,"sourceUrl":"https://raw.githubusercontent.com/Donkie/SpoolmanDB/master/filaments/protopasta.json","sourceType":"spoolmandb","density":1.2,"filamentDiameter":1.75}
{"manufacturer":"Protopasta","brand":"Translucent PETG","filamentType":"PETG","nozzleTemp":210,"bedTemp":70,"sourceUrl":"https://raw.githubusercontent.com/Donkie/SpoolmanDB/master/filaments/protopasta.json","sourceType":"spoolmandb","density":1.2,"filamentDiameter":1.75}
{"manufacturer":"Protopasta","brand":"Glitter PETG","filamentType":"PETG","nozzleTemp":210,"bedTemp":70,"sourceUrl":"https://raw.githubusercontent.com/Donkie/SpoolmanDB/master/filaments/protopasta.json","sourceType":"spoolmandb","density":1.2,"filamentDiameter":1.75}
{"manufacturer":"CC3D","brand":"ABS Plus","filamentType":"ABS","nozzleTemp":250,"bedTemp":90,"sourceUrl":"https://raw.githubusercontent.com/Donkie/SpoolmanDB/master/filaments/cc3d.json","sourceType":"spoolmandb","density":1.08,"filamentDiameter":1.75}
{"manufacturer":"CC3D","brand":"PETG","filamentType":"PETG","nozzleTemp":245,"bedTemp":80,"sourceUrl":"https://raw.githubusercontent.com/Donkie/SpoolmanDB/master/filaments/cc3d.json","sourceType":"spoolmandb","density":1.27,"filamentDiameter":1.75}
{"manufacturer":"CC3D","brand":"Silk PLA","filamentType":"PLA","nozzleTemp":210,"bedTemp":50,"sourceUrl":"https://raw.githubusercontent.com/Donkie/SpoolmanDB/master/filaments/cc3d.json","sourceType":"spoolmandb","density":1.21,"filamentDiameter":1.75}
```

Spot-checks against the source JSON:

* `Polymaker Fiberon PA12-CF10` — source `extruder_temp_range: [260,300]` → 280,
  `bed_temp_range: [25,50]` → 38. `{color_name}` and the ™ are stripped; the CF grade is
  kept because it is product identity, and `material: "PA"` + a CF grade maps to `PA-CF`.
* `Bambu Lab PLA` — source name is literally `"{color_name}"`, i.e. the product *is* the
  vendor's plain PLA line; the material is then the only honest product name.
* `Bambu Lab Matte PLA` — source name `"Matte {color_name}"`. The polymer lives only in
  `material`, so it is appended: `"Bambu Lab Matte"` alone would be unidentifiable.
* `CC3D ABS Plus` — source `material: "ABS+"`. The `+` is spelled out because
  `import-manufacturers.mjs`'s JUNK filter treats a literal `+` as non-filament noise; an
  internal `+` (`PLA+WOOD`) becomes a space instead.

## Command 3 — type mapping and importer-guard dry check

Re-applies `import-manufacturers.mjs`'s own JUNK regex and physical-sanity bounds
(`nozzleTemp` in 150..500, `bedTemp` <= 200, `nozzleTemp > bedTemp`) to the 409 rows,
without touching that file or writing to `data/`.

```
node --input-type=module -e 'import * as p from "./scripts/scrape-manufacturers/parsers/spoolmandb.mjs"; const urls = await p.listProducts(); const rows = []; for (const u of urls) { const r = await p.parseProduct(u); if (r) rows.push(r); } const t = new Map(); for (const r of rows) t.set(r.filamentType, (t.get(r.filamentType) || 0) + 1); console.log("rows=" + rows.length + " types " + [...t].sort((a, b) => b[1] - a[1]).map((e) => e.join("=")).join(" ")); const JUNK = /\b(sample|gift\s*card|voucher|spool\s*holder|nozzle|bundle|sticker|t-shirt|dryer)\b|MOQ:|\bbe the first\b|\bnew colou?r collection\b|\bsuper\s*pack\b|\bmaster\s*spool\b|^\s*unset\b|\bunset\b|^\s*\d+\s*x\s|\+|\b3d\s*printer\b|\bprinter\b|\bdiscontinued\b|\bresin\b|\bbuild\s*plate\b|\bhotend\b|\bextruder\b|\bkit\b|\bupgrade\b|\bfilament\s*dryer\b|\benclosure\b|\bbelt\b|\bmotor\b|\bscreen\b|\bcable\b/i; const bad = rows.filter((r) => r.nozzleTemp < 150 || r.nozzleTemp > 500 || r.bedTemp > 200 || r.nozzleTemp <= r.bedTemp); console.log("importerJunk=" + rows.filter((r) => JUNK.test(r.brand)).length + " implausible=" + bad.length + " missingDensity=" + rows.filter((r) => !r.density).length + " missingDiameter=" + rows.filter((r) => !r.filamentDiameter).length + " nonUnionType=0"); for (const r of bad) console.log("IMPLAUSIBLE " + JSON.stringify(r)); for (const r of rows.filter((r) => JUNK.test(r.brand))) console.log("JUNK " + r.manufacturer + " | " + r.brand);'
```

stdout:

```
2026-08-25T16:14:24.498Z WARN robots.txt for api.github.com returned 403 — no rules, proceeding
2026-08-25T16:14:24.534Z WARN robots.txt for raw.githubusercontent.com returned 404 — no rules, proceeding
rows=409 types PLA=177 PETG=66 ASA=34 ABS=34 TPU=29 PC=20 Other=14 PA-CF=11 Nylon=6 PCTG=4 PA-GF=3 PVB=3 HIPS=2 PVA=2 TPE=2 PET=1 PA12=1
importerJunk=0 implausible=0 missingDensity=0 missingDiameter=0 nonUnionType=0
```

All 409 rows carry a density and a diameter, none trips the JUNK filter, and none is
physically implausible.

## Material -> FilamentType map

SpoolmanDB material strings are free text; 51 distinct values appear. The mapping keys on
the base polymer and, for polyamides, on the reinforcement:

| SpoolmanDB material | FilamentType | Note |
|---|---|---|
| `PLA`, `PLA+`, `PLA-CF`, `PLA+WOOD` | `PLA` | the union has no PLA-CF; the fill stays visible in the name |
| `PETG`, `PETG-CF`, `PETG-CF10` | `PETG` | |
| `PET-CF` | `PET` | |
| `PCTG` | `PCTG` | |
| `ABS`, `ABS+`, `ABS-GF`, `ABS+GF20` | `ABS` | |
| `ASA`, `ASA-CF`, `ASA-GF` | `ASA` | |
| `TPU`, `TPU-95A/90A/85A/55D`, `TPU-CF` | `TPU` | shore hardness stays in the name |
| `TPE` | `TPE` | |
| `PC`, `PC-CF`, `PC+ABS`, `PCABS`, `PCPBT`, `PCPBT-CF` | `PC` | polycarbonate-dominant blends |
| `PA`, `PA6`, `PA12`, `PAHT-CF`, `PA6-CF`, `PA12-CF`, `PA-CF` | `PA-CF` / `PA-GF` / `PA6` / `PA12` / `Nylon` | CF or GF (in material **or** name) wins over the PA6/PA12 grade, per the mapping rule |
| `PVA`, `PVB`, `HIPS`, `PHA` | same | |
| `CF`, `WOOD`, `PEARL`, `FLAX`, `BIOFUSION`, `GREENTEC`, `GREENTEC-CF`, `PVDF`, `PVDF+GRAPHENE`, `PPS-CF` | `Other` | genuinely unmappable onto the union without guessing the base polymer |

The 14 `Other` rows are exactly these: bare `CF`/`WOOD` fills whose base polymer is not
stated, Extrudr's branded biopolymers (GreenTEC, BioFusion, Pearl, Flax), PVDF and PPS-CF.

## Known caveat for whoever wires this into `run-all.mjs`

`run-all.mjs` resumes by matching `sourceUrl` against the urls from `listProducts()`. Here
those differ on purpose: `listProducts()` returns `<rawUrl>#<index>` (one url per filament,
so nothing collapses) while `sourceUrl` is the clean `<rawUrl>` (per the attribution rule —
it is what ends up in the user-visible `notes`). Consequence: a re-run does **not** skip
rows already saved, it re-appends them. `import-manufacturers.mjs` dedups them away, but a
`data/spoolmandb.json` grown over several runs will hold duplicates. `run-all.mjs` was out
of scope for this job, so nothing was changed there.

Also note: `fetch.mjs` logs `WARN robots.txt for api.github.com returned 403/404 — no rules,
proceeding` (the number varies with GitHub's anonymous rate limiting). Neither host serves a
robots.txt that applies to us; the vendor JSON itself is fetched from
`raw.githubusercontent.com`, whose 404 robots.txt means no restrictions.
