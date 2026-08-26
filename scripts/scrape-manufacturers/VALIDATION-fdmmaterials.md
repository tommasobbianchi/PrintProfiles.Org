# VALIDATION — `parsers/fdmmaterials.mjs`

Source: Ultimaker/fdm_materials material definitions, `vendor/fdm_materials/*.xml.fdm_material`
(`github.com/Ultimaker/fdm_materials`, CC0-1.0 — public domain dedication), read from the local
gitignored clone (override with `FDM_MATERIALS`). Only numeric parameter values are extracted,
as facts, with the exact source file and raw URL carried on every row. Colour and label are
discarded; descriptions, adhesion_info and other prose never leave the source.

Everything below is real output, measured from
`rm -f data/fdmmaterials.json && ONLY=fdmmaterials node scripts/scrape-manufacturers/run-all.mjs`.

---

## 1. Corpus size

| measure | count |
|---|---|
| `.xml.fdm_material` files | 281 |
| … of which `<brand>Generic</brand>` (dropped, see §3) | 33 |
| non-Generic files parsed | 248 |
| distinct non-Generic `brand|material` pairs (before any temperature filter) | 129 |

## 2. Rows extracted

`fdmmaterials: listed=281 new=122 total=122` → **122 rows**, **27 distinct manufacturers**,
**10 rows via the machine fallback**.

The 129 non-Generic `brand|material` pairs collapse further because many pairs have no usable
temperature (see §3).

## 3. Rows dropped, and why

281 files → 122 rows means 159 dropped:

| reason | count |
|---|---|
| `<brand>Generic</brand>` (ANON_VENDOR — a manufacturer that does not exist) | 33 |
| `heated bed temperature` absent at top level **and** no `<machine>` states it | 15 |
| `heated bed temperature` absent at top level **and** `<machine>` blocks disagree (40/50/55 — never averaged, never first-picked) | 1 |
| duplicate `brand|material` (colour/material variant already emitted) | 110 |

The 15 "no machine bed" files are the brands whose definition omits a bed temperature entirely:
`Chromatik`, `eMotionTech` (BVOH / HIPS / PVA-M / PVA-S), `Fiberlogy HD`, `Filo3D` (×3),
`Innofill`, `OctoFiber`, `Polymaker` (PolyMax PLA / PolyPlus / PolyWood — the PolyFlex/PolyMax
PLA variants, distinct from the recovered PolyMax PC), `Fiberlogy`. The single disagreeing file
is `ultimaker_tough_pla_175.xml` (its `<machine>` blocks state bed temperatures 40, 50 and 55).

**Zero is a value, not "unset".** 13 rows carry a genuine `0`°C temperature and are emitted as
such — never dropped, never defaulted:

* `Eazao Clay` and `Structur3d Silicone` — cold extrusion, `nozzleTemp: 0` and `bedTemp: 0`;
* `Velleman` (Vertex Delta, an unheated-bed printer — 8 materials) — `bedTemp: 0`;
* `Ultimaker TPU 95A`, `ZYYX` PLA and TPU — `bedTemp: 0`.

This is why the acceptance script's `r.filter(x => !x.nozzleTemp || !x.bedTemp)` reports
**13 "incomplete"**, not 0: that check uses JS truthiness, so a real `0` reads as falsy. These
rows are complete — every required field is present — the temperature is legitimately zero.

## 4. Machine fallback

When a required setting is absent among the direct children of `<settings>`, the `<machine>`
blocks are consulted. If every `<machine>` that states the setting agrees on one value, that
value is used and `machineFallback: true` is set on the row; none or disagreement drops the row.

10 rows used it (recovering the brands **BASF**, **Polymaker** and **Verbatim**, plus several
`_175` 1.75 mm Ultimaker engineering materials whose bed temperature is only stated per-machine):

`BASF Ultrafuse 316L (60°C)`, `Polymaker PolyMax PC (95°C)`, `Verbatim BVOH (60°C)`,
`Ultimaker ABS-CF / ABS-R / Nylon CF / Nylon12 CF / PC-ABS / PC-ABS-FR / SR-30 (95°C)`.

A twelfth candidate, `ultimaker_pva_175.xml`, folds onto `ultimaker_pva.xml` (same
`brand|material`, which already states a direct bed temperature), so it is deduplicated rather
than emitted as a fallback row — hence 10, not 11.

## 5. Manufacturers (27)

`3D-Fuel, BASF, Best Filament, DSM, Eazao, eMotionTech, Eryone, eSUN, Extrudr, FABtotum,
FDplast, GOOFOO, ideagen3D, IMADE3D, Jabil, Layer One, Leapfrog, Polymaker, REDD, Structur3d,
TiZYX, Ultimaker, Velleman, Verbatim, Volumic, XYZprinting, ZYYX`

Required brand checks from the acceptance script: `ultimaker, basf, polymaker, verbatim, dsm,
jabil, esun, extrudr, eazao, structur3d, velleman, zyyx` — all `true`. `generic` leaked: 0.
`Ultimaker PLA` nozzle temperature: **200** (the nested `<machine>` hotend overrides of
210/230/240 were correctly ignored).

## 6. Five real rows, pasted verbatim

Each is one line of `data/fdmmaterials.json`.

1. `Ultimaker PLA` → Ultimaker / PLA (direct values; the machine-override check row):
```json
{"manufacturer":"Ultimaker","brand":"PLA","filamentType":"PLA","nozzleTemp":200,"bedTemp":60,"sourceType":"slicer-profile","sourceUrl":"https://raw.githubusercontent.com/Ultimaker/fdm_materials/master/ultimaker_pla.xml.fdm_material","sourceProfile":"Ultimaker PLA","fanSpeedMax":100,"fanSpeedMin":100,"density":1.24,"filamentDiameter":2.85,"spoolWeight":750}
```

2. `BASF Ultrafuse 316L` → BASF / Other (bed temperature recovered by unanimous machine fallback):
```json
{"manufacturer":"BASF","brand":"Other","filamentType":"Other","nozzleTemp":245,"bedTemp":60,"sourceType":"slicer-profile","sourceUrl":"https://raw.githubusercontent.com/Ultimaker/fdm_materials/master/basf_ultrafuse_316l_175.xml.fdm_material","sourceProfile":"BASF Ultrafuse 316L","machineFallback":true,"fanSpeedMax":0,"fanSpeedMin":0,"density":4,"filamentDiameter":1.75}
```

3. `Polymaker PolyMax PC` → Polymaker / PC (machine fallback, 95°C):
```json
{"manufacturer":"Polymaker","brand":"PC","filamentType":"Other","nozzleTemp":250,"bedTemp":95,"sourceType":"slicer-profile","sourceUrl":"https://raw.githubusercontent.com/Ultimaker/fdm_materials/master/polymaker_polymax_pc_175.xml.fdm_material","sourceProfile":"Polymaker PolyMax PC","machineFallback":true,"fanSpeedMax":50,"fanSpeedMin":50,"density":1.19,"filamentDiameter":1.75,"spoolWeight":750}
```

4. `Velleman PLA-Wood` → Velleman / PLA Wood (unheated delta bed, `bedTemp: 0`):
```json
{"manufacturer":"Velleman","brand":"PLA Wood","filamentType":"PLA","nozzleTemp":210,"bedTemp":0,"sourceType":"slicer-profile","sourceUrl":"https://raw.githubusercontent.com/Ultimaker/fdm_materials/master/Vertex_Delta_PLA_Wood.xml.fdm_material","sourceProfile":"Velleman PLA-Wood","fanSpeedMax":75,"fanSpeedMin":75,"density":1.24,"filamentDiameter":1.75}
```

5. `Eazao Clay` → Eazao / Other (cold extrusion, `nozzleTemp: 0`, `bedTemp: 0`):
```json
{"manufacturer":"Eazao","brand":"Other","filamentType":"Other","nozzleTemp":0,"bedTemp":0,"sourceType":"slicer-profile","sourceUrl":"https://raw.githubusercontent.com/Ultimaker/fdm_materials/master/eazao_clay.xml.fdm_material","sourceProfile":"Eazao Clay","fanSpeedMax":100,"fanSpeedMin":100,"density":1600,"filamentDiameter":1.75,"spoolWeight":800}
```

---

## 7. What is deliberately NOT extracted

* the XML itself — the corpus lives under `vendor/` (gitignored) and the parser writes no file;
* `<color>` and `<label>` — colour variants fold onto one `brand|material` row;
* `<description>`, `<adhesion_info>`, `<instruction_link>` and every other prose field;
* `<setting>` elements inside `<machine>`/`<hotend>` as the *primary* value — they are printer
  overrides and only ever consulted as a unanimous fallback for a missing top-level temperature;
* `<cura:setting>` elements (namespace-prefixed, not part of the key mapping);
* rows whose `<brand>` is `Generic` — attributing a parameter set to a manufacturer that does
  not exist would be a fabricated fact.
