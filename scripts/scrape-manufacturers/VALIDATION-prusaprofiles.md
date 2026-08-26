# VALIDATION — `parsers/prusaprofiles.mjs`

Source: PrusaSlicer system filament profiles, `resources/profiles/*.ini`
(`github.com/prusa3d/PrusaSlicer`, AGPL-3.0), read from the local gitignored clone at
`scripts/scrape-manufacturers/vendor/PrusaSlicer/resources/profiles/` (override with
`PRUSA_PROFILES`). Only numeric parameter values are extracted, as facts, with the exact source
profile name and raw URL carried on every row.

Everything below is real output, measured from the run
`ONLY=prusaprofiles node scripts/scrape-manufacturers/run-all.mjs`.

---

## 1. Corpus size

| measure | count |
|---|---|
| `.ini` bundles | 35 |
| `[filament:…]` sections total | 7,528 |
| … of which abstract templates (`*…*`) | 580 |
| non-template product sections | 6,948 |
| distinct filaments after folding the `@<printer>/@<nozzle>` variants | 880 |

The 6,948 product sections collapse to 880 because PrusaSlicer ships every filament once per
printer and nozzle — e.g. `[filament:ColorFabb bronzeFill]` plus `… @PG`, `… @PG 0.6`, `… @MK4S`,
`… @XL`, `… @COREONE` and their nozzle variants all fold into one row.

## 2. Rows extracted

`prusaprofiles: listed=880 new=342 total=342` → **342 rows**, **85 distinct manufacturers**.

(339 on the first run; 342 after `deriveBrand` was corrected to preserve fibre-fill tokens —
`ColorFabb XT-CF20` and `Ultrafuse PA6 GF30` had been emitted as plain `PETG` and `PA6`,
which presents an abrasive as unfilled. Preserving the fill also separates three rows that
had wrongly collapsed onto their unfilled sibling.)

## 3. Rows dropped, and why

880 distinct filaments → 342 rows means 538 dropped, broken down (measured by a temporary
counter inserted at each `return null`, then removed):

| reason | count |
|---|---|
| `filament_vendor` resolves to a non-manufacturer (`Generic`, `Unknown`, absent) | 136 |
| duplicate `vendor|brand` already emitted from an earlier bundle | 388 |
| `temperature` or `bed_temperature` never resolves through the chain | 14 |
| empty chain / no brand derived | 0 |

The 388 "duplicate" drops are the second collapse: the same filament ships in several bundles
(PrusaSlicer's `Templates.ini` plus the printer-vendor packs), and the `emitted` Set keeps one
row per `vendor + derived material`.

## 4. Manufacturers (85)

`123-3D, 3D Fuel, 3D Warhorse, 3D-Fuel, 3DJAKE, 3Dmensionals, 3DxTech, AMOLEN, Alzament,
AmazonBasics, Anycubic, Artillery, Atomic Filament, AzureFilm, BASF, BIBO, Buddy3D, ColorFabb,
Cookiecad, Creality, DAS FILAMENT, Das Filament, Devil Design, E2D, E3D, ERYONE, EUMAKERS,
Elegoo, Eolas Prints, Essentium, Esun, Extrudr, Fiberlogy, Fiberthree, Filament PM,
Filamentworld, Filatech, Fillamentum, Floreon3D, FormFutura, Forward AM, GIANTARM, Geeetech,
HartSmart Products, Hatchbox, Infinity3D, Inland, Jabil, Janbex, KVP, Kimya, Made for Prusa,
MakerGear, MatterHackers, NinjaTek, Numakers, Overture, Polymaker, PrimaSelect,
Print With Smile, Printed Solid, Proto-pasta, ProtoPasta, Prusa, Prusa Polymers, Push Plastic,
QIDI, ROSA3D Filaments, RatRig, Real Filament, SainSmart, Smart Materials 3D, Smartfil,
Snapmaker, Solutech, Spectrum, Sunlu, Taulman, Tectonic-3D, VOXELPLA, Velleman, Verbatim,
Wax-Alike, addnorth, igus`

Required checks (from the acceptance script): `rows 339 | manufacturers 85 | incomplete 0 |
junk-names 0`, `ColorFabb true`, `BASF/Ultrafuse true`.

## 5. Five real rows, pasted verbatim

Each is one line of `data/prusaprofiles.json`. (`sourceKey` is added by `run-all.mjs`, not by
the parser, to make resumed runs skip already-fetched listing URLs.)

1. `Ultrafuse PET` → BASF / PET (the required BASF row, direct — no inheritance):
```json
{"manufacturer":"BASF","brand":"PET","filamentType":"PET","nozzleTemp":215,"bedTemp":70,"sourceType":"slicer-profile","sourceUrl":"https://raw.githubusercontent.com/prusa3d/PrusaSlicer/master/resources/profiles/Templates.ini","sourceProfile":"Ultrafuse PET","nozzleTempInitial":220,"bedTempInitial":70,"fanSpeedMin":75,"fanSpeedMax":100,"flowRatio":1,"density":1.33,"filamentDiameter":1.75,"sourceKey":"https://raw.githubusercontent.com/prusa3d/PrusaSlicer/master/resources/profiles/Templates.ini#filament:Ultrafuse%20PET"}
```

2. `ColorFabb bronzeFill` → ColorFabb / PLA (the required ColorFabb row; temps inherited from `*PLA*`):
```json
{"manufacturer":"ColorFabb","brand":"PLA","filamentType":"PLA","nozzleTemp":210,"bedTemp":60,"sourceType":"slicer-profile","sourceUrl":"https://raw.githubusercontent.com/prusa3d/PrusaSlicer/master/resources/profiles/PrusaResearch.ini","sourceProfile":"ColorFabb bronzeFill","nozzleTempInitial":215,"bedTempInitial":60,"fanSpeedMin":100,"fanSpeedMax":100,"maxVolumetricSpeed":4,"flowRatio":1.05,"density":3.9,"filamentDiameter":1.75,"filamentCost":77.28,"spoolWeight":236,"inheritedFrom":["*PLA*"],"sourceKey":"https://raw.githubusercontent.com/prusa3d/PrusaSlicer/master/resources/profiles/PrusaResearch.ini#filament:ColorFabb%20bronzeFill"}
```

3. `Fillamentum PLA @MakerGear` → Fillamentum / PLA (a vendor pack, not the vendor's own bundle):
```json
{"manufacturer":"Fillamentum","brand":"PLA","filamentType":"PLA","nozzleTemp":210,"bedTemp":60,"sourceType":"slicer-profile","sourceUrl":"https://raw.githubusercontent.com/prusa3d/PrusaSlicer/master/resources/profiles/MakerGear.ini","sourceProfile":"Fillamentum PLA @MakerGear","nozzleTempInitial":215,"bedTempInitial":60,"fanSpeedMin":100,"fanSpeedMax":100,"maxVolumetricSpeed":15,"flowRatio":0.9,"density":1.24,"filamentDiameter":1.75,"filamentCost":35.48,"spoolWeight":230,"inheritedFrom":["*PLA*"],"sourceKey":"https://raw.githubusercontent.com/prusa3d/PrusaSlicer/master/resources/profiles/MakerGear.ini#filament:Fillamentum%20PLA%20%40MakerGear"}
```

4. `Extrudr PLA NX2 @CREALITY` → Extrudr / PLA (`NX2` is a product line, dropped from the brand):
```json
{"manufacturer":"Extrudr","brand":"PLA","filamentType":"PLA","nozzleTemp":200,"bedTemp":60,"sourceType":"slicer-profile","sourceUrl":"https://raw.githubusercontent.com/prusa3d/PrusaSlicer/master/resources/profiles/Creality.ini","sourceProfile":"Extrudr PLA NX2 @CREALITY","nozzleTempInitial":205,"bedTempInitial":60,"fanSpeedMin":100,"fanSpeedMax":100,"maxVolumetricSpeed":15,"flowRatio":1,"density":1.3,"filamentDiameter":1.75,"filamentCost":23.63,"spoolWeight":256,"sourceKey":"https://raw.githubusercontent.com/prusa3d/PrusaSlicer/master/resources/profiles/Creality.ini#filament:Extrudr%20PLA%20NX2%20%40CREALITY"}
```

5. `BASF Ultrafuse ABS Fusion+ @HSP1` → BASF / ABS (`Fusion+` is a product line, dropped):
```json
{"manufacturer":"BASF","brand":"ABS","filamentType":"ABS","nozzleTemp":255,"bedTemp":100,"sourceType":"slicer-profile","sourceUrl":"https://raw.githubusercontent.com/prusa3d/PrusaSlicer/master/resources/profiles/HartSmartProducts.ini","sourceProfile":"BASF Ultrafuse ABS Fusion+ @HSP1","nozzleTempInitial":250,"bedTempInitial":100,"fanSpeedMin":15,"fanSpeedMax":15,"maxVolumetricSpeed":15,"flowRatio":0.95,"density":1.07,"filamentDiameter":1.75,"filamentCost":45,"spoolWeight":215,"sourceKey":"https://raw.githubusercontent.com/prusa3d/PrusaSlicer/master/resources/profiles/HartSmartProducts.ini#filament:BASF%20Ultrafuse%20ABS%20Fusion%2B%20%40HSP1"}
```

Note the licence posture at work in rows 4 and 5: the product name is `Extrudr` + `PLA`, not
"Extrudr PLA NX2", and `BASF` + `ABS`, not "BASF Ultrafuse ABS Fusion+" — `NX2`, `Fusion+` and
`Ultrafuse` are product-line names, kept only in `sourceProfile` as attribution.

---

## 6. What is deliberately NOT extracted

On licence grounds, none of the following leaves the source:

* the INI profiles themselves — the corpus lives under `vendor/` (gitignored) and the parser
  writes no profile file of its own;
* `start_filament_gcode`, `end_filament_gcode`, `filament_notes`, `filament_ramming_parameters`
  and every other prose/script field — expressive content, not facts;
* product-line names as product names (`Prusament`, `Ultrafuse`, `nGen`, `Fusion+`, `NX2`,
  `XT`, `bronzeFill`…). They appear only in `sourceProfile`, as attribution, next to `sourceUrl`;
* profiles whose resolved `filament_vendor` is `Generic`/`Unknown` — attributing a parameter
  set to a manufacturer that does not exist would be a fabricated fact, not a citation;
* abstract templates (`*PET*`, `*common*`, …) — resolved through, never emitted.

Inheritance is resolved within each bundle file only (PrusaSlicer does carry a few cross-file
`inherits` — e.g. `Templates.ini`'s `Ultrafuse PRO1` → `Prusament PLA` — but those parents are
self-contained copies of the same section inside `Templates.ini`, so the chain still resolves;
a cross-file parent that is genuinely absent simply fails the temperature check and the row is
dropped rather than guessed).
