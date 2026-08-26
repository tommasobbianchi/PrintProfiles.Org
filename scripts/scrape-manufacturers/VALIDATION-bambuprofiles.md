# VALIDATION — `parsers/bambuprofiles.mjs`

Source: BambuStudio system filament profiles, `resources/profiles/<Vendor>/filament/*.json`
(`github.com/bambulab/BambuStudio`, AGPL-3.0). Only numeric parameter values are extracted, as
facts, with the exact source profile name and raw URL carried on every row.

BambuStudio ships the same JSON schema, `filament_list` index, `"nil"` placeholder and
`inherits` chain as OrcaSlicer, so this module is a thin wrapper over the resolver factory in
`slicerprofiles.mjs` — there is no copy of the chain logic. The hard guard (below) proves the
refactor left the Orca output byte-identical.

Everything below is real output, copied verbatim from the terminal.

---

## 0. The command used

```bash
cd /home/tommaso/projects/printprofiles-org
rm -f scripts/scrape-manufacturers/data/bambuprofiles.json
ONLY=bambuprofiles node scripts/scrape-manufacturers/run-all.mjs
```

```
2026-08-26T10:30:51.337Z bambuprofiles: 12 vendor dirs, 2445 filament files, 155 distinct filaments
bambuprofiles: listed=155 new=79 total=79
```

---

## 1. Orca regression — the refactor changed nothing

Before the refactor, `data/slicerprofiles.json` held 501 committed rows. It was copied to
`/tmp/orca-baseline.json`, the parser was refactored into a factory, and the Orca output was
regenerated with `ONLY=slicerprofiles node run-all.mjs`:

```
2026-08-26T10:30:42.508Z === run done ===
slicerprofiles: listed=1719 new=501 total=501
```

Diff of baseline vs. regenerated, keyed on `sourceKey || sourceUrl`:

```
baseline 501 now 501 | missing 0 | changed 0
```

**missing 0, changed 0, rows 501 (≥ 501).** The resolver was parameterised, not rewritten.

---

## 2. Corpus

- **3,823** files under `vendor/BambuStudio/resources/profiles/` (gitignored clone)
- **12** vendor directories: Anker, Anycubic, BBL, Creality, Elegoo, Geeetech, Prusa, Qidi,
  Tronxy, Vivedino, Voron, Voxelab — each with a `<Vendor>.json` index carrying `filament_list`
- **2,445** `filament_list` entries whose `sub_path` starts with `filament/` (the `fdm_filament_*`
  roots are shared machinery, reached only through inheritance)
- **155** distinct filaments after folding the `@<printer>/@<nozzle>` variants (and collapsing the
  shared "Generic" material groups across vendor packs — the group key is subdir + name, not vendor)

---

## 3. Result

- **79 rows**, **6 manufacturers**, **0 missing temps**, **0 dup keys**

```bash
node -e '
const r=require("./scripts/scrape-manufacturers/data/bambuprofiles.json");
const m=[...new Set(r.map(x=>x.manufacturer))];
console.log("rows",r.length,"| manufacturers",m.length,
  "| missing temps",r.filter(x=>x.nozzleTemp==null||x.bedTemp==null).length,
  "| dup keys",r.length-new Set(r.map(x=>x.sourceKey||x.sourceUrl)).size);
const filled=r.filter(x=>/-CF|CF\d|GF\d|rCF|kevlar|aramid/i.test(x.sourceProfile||""));
console.log("filled rows",filled.length,"| fill LOST from brand",
  filled.filter(x=>!/CF|GF|AF|kevlar|aramid|carbon|glass/i.test(x.brand||"")).length);
'
```

```
rows 79 | manufacturers 6 | missing temps 0 | dup keys 0
filled rows 19 | fill LOST from brand 0
```

Manufacturers and row counts:

```
Bambu Lab=41, QIDI=18, Polymaker=11, SUNLU=6, Overture=2, eSUN=1
```

By material:

```
PLA=28, PETG=11, ABS=9, ASA=6, TPU=6, PA-CF=4, Nylon=4, PA6=2, PA-GF=2, PC=2, PET=2, Other=2, PVA=1
```

---

## 4. Why 79 rows and not ≥ 150 — drop reasons, not loosened criteria

155 distinct filaments → 79 rows. All 76 drops are accounted for; no criterion was loosened:

| drop reason | count | detail |
|---|---|---|
| anonymous vendor | **31** | the resolved `filament_vendor` is `"Generic"` — all from the BBL pack ("Generic PLA", "Generic PETG", …). Attributing a parameter set to a manufacturer that does not exist would be a fabricated fact, so they drop, exactly as in the Orca parser. |
| unresolvable chain | **10** | Anker's index lists `Generic <mat> @base` members, but the files on disk are named `@Anker`, not `@base`; the `@base` representative 404s and the chain is empty. All are Generic profiles, so they would drop as anonymous even if the file existed. |
| `manufacturer + brand` dedup | **35** | Bambu Lab ships many product-line variants of one polymer (Basic / Matte / Silk / Metal / Sparkle / Aero / Tough …) that all derive to the same `vendor + material` fact and fold onto one row. |

The difference from the Orca parser is the source, not the logic. BambuStudio's third-party
vendor packs (Creality, Anycubic, Elegoo, Geeetech, Prusa, Tronxy, Vivedino, Voron, Voxelab)
contain only generic printer profiles — their `filament_vendor` resolves to `"Generic"` and
they all drop. OrcaSlicer, by contrast, ships real branded profiles for those vendors
(`filament_vendor` = "Elegoo", "Creality", …). The only branded data BambuStudio ships is the
BBL pack (Bambu Lab + the third-party brands it bundles: Polymaker, SUNLU, Overture, eSUN) and
the Qidi pack (QIDI). Overlap with the Orca BBL pack is expected and fine — these are separate
data files and the importer dedupes downstream.

---

## 5. The fibre-fill rule survived

`filled rows 19 | fill LOST from brand 0` — every profile whose `sourceProfile` names a
CF/GF/Kevlar/aramid fill emits a brand that still carries the fill. An abrasive is never shown
as unfilled. This is the safety property the refactor was required to preserve.

---

## 6. Five real extracted rows, verbatim

```json
{"manufacturer":"Bambu Lab","brand":"PLA","filamentType":"PLA","nozzleTemp":220,"bedTemp":55,"sourceType":"slicer-profile","sourceUrl":"https://raw.githubusercontent.com/bambulab/BambuStudio/master/resources/profiles/BBL/filament/Bambu%20PLA%20Basic%20@base.json","sourceProfile":"Bambu PLA Basic @base","nozzleTempInitial":220,"bedTempInitial":55,"maxVolumetricSpeed":21,"flowRatio":0.98,"fanSpeedMin":100,"fanSpeedMax":100,"density":1.26,"filamentDiameter":1.75,"inheritedFrom":["fdm_filament_pla"]}
{"manufacturer":"Bambu Lab","brand":"PA-CF","filamentType":"PA-CF","nozzleTemp":280,"bedTemp":100,"sourceType":"slicer-profile","sourceUrl":"https://raw.githubusercontent.com/bambulab/BambuStudio/master/resources/profiles/BBL/filament/Bambu%20PA-CF%20@base.json","sourceProfile":"Bambu PA-CF @base","nozzleTempInitial":280,"bedTempInitial":100,"maxVolumetricSpeed":8,"flowRatio":0.96,"fanSpeedMin":0,"fanSpeedMax":60,"density":1.09,"filamentDiameter":1.75,"inheritedFrom":["fdm_filament_pa"]}
{"manufacturer":"Bambu Lab","brand":"PETG HF","filamentType":"PETG","nozzleTemp":245,"bedTemp":70,"sourceType":"slicer-profile","sourceUrl":"https://raw.githubusercontent.com/bambulab/BambuStudio/master/resources/profiles/BBL/filament/Bambu%20PETG%20HF%20@base.json","sourceProfile":"Bambu PETG HF @base","nozzleTempInitial":230,"bedTempInitial":70,"maxVolumetricSpeed":21,"flowRatio":0.95,"fanSpeedMin":10,"fanSpeedMax":40,"density":1.28,"filamentDiameter":1.75}
{"manufacturer":"QIDI","brand":"PPS-CF","filamentType":"PA-CF","nozzleTemp":320,"bedTemp":110,"sourceType":"slicer-profile","sourceUrl":"https://raw.githubusercontent.com/bambulab/BambuStudio/master/resources/profiles/Qidi/filament/QIDI%20PPS-CF%20@Qidi.json","sourceProfile":"QIDI PPS-CF @Qidi","nozzleTempInitial":320,"bedTempInitial":110,"maxVolumetricSpeed":6,"flowRatio":0.97,"fanSpeedMin":0,"fanSpeedMax":30,"density":1.2,"filamentDiameter":1.75}
{"manufacturer":"Polymaker","brand":"PA6-CF","filamentType":"PA6","nozzleTemp":300,"bedTemp":40,"sourceType":"slicer-profile","sourceUrl":"https://raw.githubusercontent.com/bambulab/BambuStudio/master/resources/profiles/BBL/filament/Polymaker/Fiberon%20PA6-CF%20@base.json","sourceProfile":"Fiberon PA6-CF @base","nozzleTempInitial":300,"bedTempInitial":40,"maxVolumetricSpeed":14,"flowRatio":0.95,"fanSpeedMin":0,"fanSpeedMax":100,"density":1.17,"filamentDiameter":1.75}
```

Note the product names: `Bambu PLA Basic` → `Bambu Lab` + `PLA` (the tier word is the vendor's,
the polymer is the fact), `Fiberon PA6-CF` → `Polymaker` + `PA6-CF` (`Fiberon` is a Polymaker
product line and stays only in `sourceProfile` as attribution), `QIDI PPS-CF` → `QIDI` +
`PPS-CF` (the fill survives).

---

## 7. What is deliberately NOT extracted

On licence grounds, none of the following leaves the source, exactly as for OrcaSlicer:

* the profile JSON itself — nothing is written to this repo; `fetch.mjs`'s `cache/` is
  gitignored and the clone lives under `vendor/` (gitignored);
* `filament_start_gcode`, `filament_end_gcode`, `filament_notes`, `filament_settings_id` and
  every other prose/script field;
* profile and product-line names as product names (`PolyLite`, `Fiberon`, `Panchroma`,
  `Basic`, `Rapido`… — attribution only, via `sourceProfile`);
* profiles whose resolved `filament_vendor` is `Generic`/`Unknown` — 31 rows, as in §4.
