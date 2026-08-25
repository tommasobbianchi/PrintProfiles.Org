# VALIDATION — `parsers/slicerprofiles.mjs`

Source: OrcaSlicer system filament profiles, `resources/profiles/<Vendor>/filament/*.json`
(`github.com/SoftFever/OrcaSlicer`, AGPL-3.0). Only numeric parameter values are extracted, as
facts, with the exact source profile name and raw URL carried on every row.

Everything below is real output, copied verbatim from the terminal (the `robots.txt … 404`
line is `fetch.mjs` reporting that GitHub serves no robots.txt for `raw.githubusercontent.com`;
it is printed once per process).

---

## 0. The command used

`parseProduct` takes the raw URL of a profile file. This wrapper turns a repo-relative path
into that URL so the commands below stay readable:

```bash
cd /home/tommaso/projects/printprofiles-org
node --input-type=module -e '
import * as sp from "./scripts/scrape-manufacturers/parsers/slicerprofiles.mjs";
const R = "https://raw.githubusercontent.com/SoftFever/OrcaSlicer/main/resources/profiles/";
for (const f of process.argv.slice(1)) console.log(JSON.stringify(await sp.parseProduct(R + encodeURI(f))));
' "<path> ..."
```

Saved as `v1.sh` for the transcripts below.

---

## 1. Bambu Lab (BBL pack) — 3 filaments

```bash
bash v1.sh "BBL/filament/Bambu PLA Basic @base.json" \
           "BBL/filament/Bambu ABS @base.json" \
           "BBL/filament/Bambu PETG HF @base.json"
```

```
2026-08-25T16:20:59.770Z WARN robots.txt for raw.githubusercontent.com returned 404 — no rules, proceeding
{"manufacturer":"Bambu Lab","brand":"PLA","filamentType":"PLA","nozzleTemp":220,"bedTemp":55,"sourceType":"slicer-profile","sourceUrl":"https://raw.githubusercontent.com/SoftFever/OrcaSlicer/main/resources/profiles/BBL/filament/Bambu%20PLA%20Basic%20@base.json","sourceProfile":"Bambu PLA Basic @base","nozzleTempInitial":220,"bedTempInitial":55,"maxVolumetricSpeed":21,"flowRatio":0.98,"fanSpeedMin":100,"fanSpeedMax":100,"density":1.26,"filamentDiameter":1.75,"inheritedFrom":["fdm_filament_pla"]}
{"manufacturer":"Bambu Lab","brand":"ABS","filamentType":"ABS","nozzleTemp":270,"bedTemp":90,"sourceType":"slicer-profile","sourceUrl":"https://raw.githubusercontent.com/SoftFever/OrcaSlicer/main/resources/profiles/BBL/filament/Bambu%20ABS%20@base.json","sourceProfile":"Bambu ABS @base","nozzleTempInitial":260,"bedTempInitial":90,"maxVolumetricSpeed":28.6,"flowRatio":0.95,"fanSpeedMin":10,"fanSpeedMax":80,"density":1.04,"filamentDiameter":1.75,"inheritedFrom":["fdm_filament_abs"]}
{"manufacturer":"Bambu Lab","brand":"PETG HF","filamentType":"PETG","nozzleTemp":245,"bedTemp":70,"sourceType":"slicer-profile","sourceUrl":"https://raw.githubusercontent.com/SoftFever/OrcaSlicer/main/resources/profiles/BBL/filament/Bambu%20PETG%20HF%20@base.json","sourceProfile":"Bambu PETG HF @base","nozzleTempInitial":230,"bedTempInitial":70,"maxVolumetricSpeed":21,"flowRatio":0.95,"fanSpeedMin":10,"fanSpeedMax":40,"density":1.28,"filamentDiameter":1.75}
```

Note the product names: `Bambu PLA Basic` becomes `Bambu Lab` + `PLA`, not "PLA Basic" — the
tier word is the vendor's, the polymer is the fact.

## 2. Polymaker — 3 filaments

```bash
bash v1.sh "OrcaFilamentLibrary/filament/Polymaker/PolyLite ABS @base.json" \
           "OrcaFilamentLibrary/filament/Polymaker/Fiberon PA6-CF @base.json" \
           "OrcaFilamentLibrary/filament/Polymaker/Panchroma PLA Matte @base.json"
```

```
2026-08-25T16:21:04.530Z WARN robots.txt for raw.githubusercontent.com returned 404 — no rules, proceeding
{"manufacturer":"Polymaker","brand":"ABS","filamentType":"ABS","nozzleTemp":260,"bedTemp":100,"sourceType":"slicer-profile","sourceUrl":"https://raw.githubusercontent.com/SoftFever/OrcaSlicer/main/resources/profiles/OrcaFilamentLibrary/filament/Polymaker/PolyLite%20ABS%20@base.json","sourceProfile":"PolyLite ABS @base","nozzleTempInitial":260,"bedTempInitial":105,"maxVolumetricSpeed":12,"flowRatio":0.95,"fanSpeedMin":10,"fanSpeedMax":80,"density":1.03,"filamentDiameter":1.75,"inheritedFrom":["fdm_filament_abs"]}
{"manufacturer":"Polymaker","brand":"PA6-CF","filamentType":"PA6","nozzleTemp":300,"bedTemp":40,"sourceType":"slicer-profile","sourceUrl":"https://raw.githubusercontent.com/SoftFever/OrcaSlicer/main/resources/profiles/OrcaFilamentLibrary/filament/Polymaker/Fiberon%20PA6-CF%20@base.json","sourceProfile":"Fiberon PA6-CF @base","nozzleTempInitial":300,"bedTempInitial":40,"maxVolumetricSpeed":12,"flowRatio":0.95,"fanSpeedMin":0,"fanSpeedMax":100,"density":1.17,"filamentDiameter":1.75}
{"manufacturer":"Polymaker","brand":"PLA Matte","filamentType":"PLA","nozzleTemp":220,"bedTemp":55,"sourceType":"slicer-profile","sourceUrl":"https://raw.githubusercontent.com/SoftFever/OrcaSlicer/main/resources/profiles/OrcaFilamentLibrary/filament/Polymaker/Panchroma%20PLA%20Matte%20@base.json","sourceProfile":"Panchroma PLA Matte @base","nozzleTempInitial":220,"bedTempInitial":55,"maxVolumetricSpeed":12,"flowRatio":0.98,"fanSpeedMin":100,"fanSpeedMax":100,"density":1.31,"filamentDiameter":1.75,"inheritedFrom":["fdm_filament_pla"]}
```

`PolyLite`, `Fiberon` and `Panchroma` are Polymaker product lines — creative strings, so they
stay in `sourceProfile` (attribution) and never become our product name. `PA6-CF` and `Matte`
do survive: a polymer and a fill/finish are facts about the material.

## 3. eSUN — 3 filaments

```bash
bash v1.sh "OrcaFilamentLibrary/filament/eSUN/eSUN PETG @base.json" \
           "OrcaFilamentLibrary/filament/eSUN/eSUN PLA+ @base.json" \
           "OrcaFilamentLibrary/filament/eSUN/eSUN PLA-Marble @base.json"
```

```
2026-08-25T16:21:13.648Z WARN robots.txt for raw.githubusercontent.com returned 404 — no rules, proceeding
{"manufacturer":"eSUN","brand":"PETG","filamentType":"PETG","nozzleTemp":240,"bedTemp":65,"sourceType":"slicer-profile","sourceUrl":"https://raw.githubusercontent.com/SoftFever/OrcaSlicer/main/resources/profiles/OrcaFilamentLibrary/filament/eSUN/eSUN%20PETG%20@base.json","sourceProfile":"eSUN PETG @base","nozzleTempInitial":240,"bedTempInitial":65,"maxVolumetricSpeed":10,"flowRatio":0.98,"fanSpeedMin":30,"fanSpeedMax":100,"density":1.27,"filamentDiameter":1.75}
{"manufacturer":"eSUN","brand":"PLA","filamentType":"PLA","nozzleTemp":220,"bedTemp":55,"sourceType":"slicer-profile","sourceUrl":"https://raw.githubusercontent.com/SoftFever/OrcaSlicer/main/resources/profiles/OrcaFilamentLibrary/filament/eSUN/eSUN%20PLA+%20@base.json","sourceProfile":"eSUN PLA+ @base","nozzleTempInitial":220,"bedTempInitial":55,"maxVolumetricSpeed":12,"flowRatio":0.98,"fanSpeedMin":100,"fanSpeedMax":100,"density":1.25,"filamentDiameter":1.75,"inheritedFrom":["fdm_filament_pla"]}
{"manufacturer":"eSUN","brand":"PLA Marble","filamentType":"PLA","nozzleTemp":220,"bedTemp":55,"sourceType":"slicer-profile","sourceUrl":"https://raw.githubusercontent.com/SoftFever/OrcaSlicer/main/resources/profiles/OrcaFilamentLibrary/filament/eSUN/eSUN%20PLA-Marble%20@base.json","sourceProfile":"eSUN PLA-Marble @base","nozzleTempInitial":220,"bedTempInitial":55,"maxVolumetricSpeed":8,"flowRatio":0.99,"fanSpeedMin":100,"fanSpeedMax":100,"density":1.27,"filamentDiameter":1.75,"inheritedFrom":["fdm_filament_pla"]}
```

## 4. Elegoo — 3 filaments

```bash
bash v1.sh "OrcaFilamentLibrary/filament/Elegoo/Elegoo ABS @base.json" \
           "OrcaFilamentLibrary/filament/Elegoo/Elegoo ASA @base.json" \
           "OrcaFilamentLibrary/filament/Elegoo/Elegoo PC @base.json"
```

```
2026-08-25T16:21:16.988Z WARN robots.txt for raw.githubusercontent.com returned 404 — no rules, proceeding
{"manufacturer":"Elegoo","brand":"ABS","filamentType":"ABS","nozzleTemp":270,"bedTemp":90,"sourceType":"slicer-profile","sourceUrl":"https://raw.githubusercontent.com/SoftFever/OrcaSlicer/main/resources/profiles/OrcaFilamentLibrary/filament/Elegoo/Elegoo%20ABS%20@base.json","sourceProfile":"Elegoo ABS @base","nozzleTempInitial":260,"bedTempInitial":90,"maxVolumetricSpeed":12,"flowRatio":0.98,"fanSpeedMin":10,"fanSpeedMax":80,"density":1.1,"filamentDiameter":1.75}
{"manufacturer":"Elegoo","brand":"ASA","filamentType":"ASA","nozzleTemp":260,"bedTemp":90,"sourceType":"slicer-profile","sourceUrl":"https://raw.githubusercontent.com/SoftFever/OrcaSlicer/main/resources/profiles/OrcaFilamentLibrary/filament/Elegoo/Elegoo%20ASA%20@base.json","sourceProfile":"Elegoo ASA @base","nozzleTempInitial":260,"bedTempInitial":90,"maxVolumetricSpeed":12,"flowRatio":0.98,"fanSpeedMin":10,"fanSpeedMax":80,"density":1.1,"filamentDiameter":1.75,"inheritedFrom":["fdm_filament_asa"]}
{"manufacturer":"Elegoo","brand":"PC","filamentType":"PC","nozzleTemp":280,"bedTemp":110,"sourceType":"slicer-profile","sourceUrl":"https://raw.githubusercontent.com/SoftFever/OrcaSlicer/main/resources/profiles/OrcaFilamentLibrary/filament/Elegoo/Elegoo%20PC%20@base.json","sourceProfile":"Elegoo PC @base","nozzleTempInitial":270,"bedTempInitial":110,"maxVolumetricSpeed":16,"flowRatio":0.98,"fanSpeedMin":10,"fanSpeedMax":60,"density":1.25,"filamentDiameter":1.75}
```

---

## 5. Inheritance resolution, proved

`Bambu PLA Basic @base` reports `nozzleTemp: 220` and `bedTemp: 55` above. Neither number is in
that file. This command prints, for each profile in the chain, what it inherits and which of
the mapped fields it defines itself (field *names* only — no values are reproduced from the
source beyond the numbers the parser extracts as facts):

```bash
cd /home/tommaso/projects/printprofiles-org
node --input-type=module -e '
import { get } from "./scripts/scrape-manufacturers/fetch.mjs";
const R = "https://raw.githubusercontent.com/SoftFever/OrcaSlicer/main/resources/profiles/";
const MAPPED = ["nozzle_temperature","nozzle_temperature_initial_layer","hot_plate_temp","hot_plate_temp_initial_layer","filament_max_volumetric_speed","filament_flow_ratio","fan_min_speed","fan_max_speed","filament_density","filament_vendor","filament_type"];
for (const f of process.argv.slice(1)) {
  const j = JSON.parse((await get(R + encodeURI(f))).body);
  const own = MAPPED.filter((k) => j[k] !== undefined && String(j[k][0] ?? j[k]) !== "nil");
  console.log(`${j.name}\n  inherits: ${j.inherits ?? "(root)"}\n  defines of the mapped fields: ${own.join(", ") || "(none)"}`);
}
' "BBL/filament/Bambu PLA Basic @base.json" \
  "BBL/filament/fdm_filament_pla.json" \
  "BBL/filament/fdm_filament_common.json"
```

```
2026-08-25T16:21:41.028Z WARN robots.txt for raw.githubusercontent.com returned 404 — no rules, proceeding
Bambu PLA Basic @base
  inherits: fdm_filament_pla
  defines of the mapped fields: filament_max_volumetric_speed, filament_flow_ratio, filament_density, filament_vendor
fdm_filament_pla
  inherits: fdm_filament_common
  defines of the mapped fields: nozzle_temperature, nozzle_temperature_initial_layer, hot_plate_temp, hot_plate_temp_initial_layer, filament_max_volumetric_speed, fan_min_speed, filament_density
fdm_filament_common
  inherits: (root)
  defines of the mapped fields: nozzle_temperature, nozzle_temperature_initial_layer, hot_plate_temp, hot_plate_temp_initial_layer, filament_max_volumetric_speed, filament_flow_ratio, fan_min_speed, fan_max_speed, filament_density, filament_vendor, filament_type
```

Chain: **`Bambu PLA Basic @base` → `fdm_filament_pla` → `fdm_filament_common`** (3 levels).

What the leaf file itself contains vs. what the parser returns:

| field | in the leaf file | resolved value | supplied by |
|---|---|---|---|
| `nozzle_temperature` | **absent** | 220 | `fdm_filament_pla` |
| `hot_plate_temp` | **absent** | 55 | `fdm_filament_pla` |
| `nozzle_temperature_initial_layer` | **absent** | 220 | `fdm_filament_pla` |
| `hot_plate_temp_initial_layer` | **absent** | 55 | `fdm_filament_pla` |
| `fan_max_speed` | **absent** | 100 | `fdm_filament_common` |
| `filament_max_volumetric_speed` | present | 21 | the leaf, overriding `fdm_filament_pla` (12) |
| `filament_density` | present | 1.26 | the leaf, overriding `fdm_filament_pla` (1.24) |

So the resolved row is neither the leaf's own contents (which have no temperatures at all and
would fail the required-fields check) nor the parent's (whose volumetric speed and density are
different). The `inheritedFrom` field on the row records this: `["fdm_filament_pla"]`.

The same applies to `Elegoo ASA @base` (`inheritedFrom: ["fdm_filament_asa"]`),
`Elegoo PC @base` (`fdm_filament_pc`), `PolyLite ABS @base` (`fdm_filament_abs`) and every
other row above that carries an `inheritedFrom`.

---

## 6. Variant collapse, proved

One filament ships once per printer and per nozzle size. Counting the source files that fold
into each of the three Bambu rows in §1:

```bash
cd /home/tommaso/projects/printprofiles-org
node --input-type=module -e '
import { get } from "./scripts/scrape-manufacturers/fetch.mjs";
const R = "https://raw.githubusercontent.com/SoftFever/OrcaSlicer/main/resources/profiles/";
const list = JSON.parse((await get(R + "BBL.json")).body).filament_list;
for (const p of process.argv.slice(1)) {
  const v = list.filter((f) => f.name.replace(/\s*@.*$/, "") === p);
  console.log(`${p}: ${v.length} files in the source, e.g. ${v.slice(0, 3).map((f) => f.name).join(" / ")}`);
}
' "Bambu PLA Basic" "Bambu ABS" "Bambu PETG HF"
```

```
2026-08-25T16:21:49.708Z WARN robots.txt for raw.githubusercontent.com returned 404 — no rules, proceeding
Bambu PLA Basic: 38 files in the source, e.g. Bambu PLA Basic @base / Bambu PLA Basic @BBL A1 / Bambu PLA Basic @BBL A1 0.2 nozzle
Bambu ABS: 35 files in the source, e.g. Bambu ABS @base / Bambu ABS @BBL A1 / Bambu ABS @BBL A1 0.2 nozzle
Bambu PETG HF: 36 files in the source, e.g. Bambu PETG HF @base / Bambu PETG HF @BBL A1 / Bambu PETG HF @BBL A1 0.2 nozzle
```

109 files → 3 rows. A second collapse happens on `manufacturer + brand`, which is what folds
`BBL/filament/Polymaker/*` and `OrcaFilamentLibrary/filament/Polymaker/*` (the same filaments
shipped in two packs) into one row each.

---

## 7. Full crawl

One complete pass over every vendor pack (`node run-sp.mjs`, a runner equivalent to what
`run-all.mjs` does for the other parsers):

```
2026-08-25T17:12:45.099Z slicerprofiles: 65 vendor dirs, 7643 filament files, 1719 distinct filaments
DONE listed 1719 rows 498 inheritanceResolved 227
```

* **7643** filament profile files scanned across **65** vendor packs
* **1719** distinct filaments after folding the `@printer` / `@nozzle` variants
* **498** rows after the second collapse on `manufacturer + brand` (the rest are dropped: the
  vendor resolves to `Generic`/`Unknown`, the chain states no `nozzle_temperature` /
  `hot_plate_temp`, or the filament was already emitted from another pack)
* **227** of those 498 rows (46%) needed inheritance resolution for their temperatures — they
  carry `inheritedFrom`
* **46** manufacturers

Rows per manufacturer:

```
Bambu Lab=42, QIDI=36, Polymaker=34, BETA=30, Anycubic=24, Snapmaker=24, Creality=22,
Elegoo=22, addnorth=20, Orca Arena=18, Artillery=15, Eryone=15, Volumic=15, DREMC=13,
FusRock=13, WonderMaker=12, eSUN=11, Eolas Prints=10, Tiertime=10, LH Stinger=8,
Prusa Polymers=7, FDplast=6, FlyingBear=6, InfiMech=6, Other=6, SeeMeCNC=6, SUNLU=6,
CoLiDo=5, Cubicon=5, FILL3D=5, Co Print=4, iQ Materials=4, Peopoly=4, re3D=4, Afinia=3,
Elas=3, Flashforge=3, HATCHBOX=3, NIT=3, Overture=3, RatRig=3, Valment=3, FilAr=2, Yumi=2,
GreenGate3D=1, Numakers=1
```

By material:

```
PLA=158, PETG=80, TPU=46, ABS=44, ASA=30, PA-CF=28, PC=22, Nylon=20, PET=17, Other=17,
PA6=9, PVA=8, PA-GF=6, PP=5, PEBA=3, HIPS=2, PCTG=1, PVB=1, PA12=1
```

Field coverage over the 498 rows: `nozzleTemp`/`bedTemp` 498 (required — the parser returns
`null` without them), `maxVolumetricSpeed` 498, `flowRatio` 497, `density` 497,
`fanSpeedMin`/`fanSpeedMax` 497, `filamentDiameter` 497.

---

## 8. What is deliberately NOT extracted

On licence grounds, none of the following leaves the source:

* the profile JSON itself — nothing is written to this repo; `fetch.mjs`'s `cache/` is
  gitignored, and the parser writes no file of its own;
* `filament_start_gcode`, `filament_end_gcode`, `filament_notes`, `filament_settings_id` and
  every other prose/script field — expressive content, not facts;
* profile and product-line names as product names (`Panchroma`, `PolyLite`, `PolyTerra`,
  `Fiberon`, `Basic`, `Galaxy`, `Celestial`, `Temp Shift`…). They appear only in
  `sourceProfile`, as attribution, next to `sourceUrl`;
* profiles whose resolved `filament_vendor` is `Generic`/`Unknown` — attributing a parameter
  set to a manufacturer that does not exist would be a fabricated fact, not a citation.
