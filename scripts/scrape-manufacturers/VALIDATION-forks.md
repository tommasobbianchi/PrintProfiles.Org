# VALIDATION — `parsers/qidiprofiles.mjs` and `parsers/anycubicprofiles.mjs`

Two OrcaSlicer forks, both AGPL-3.0, both driven by `createSlicerResolver` from
`slicerprofiles.mjs` — no chain logic is duplicated in either wrapper.

| | QIDIStudio | AnycubicSlicerNext |
|---|---|---|
| repo | `QIDITECH/QIDIStudio` | `ANYCUBIC-3D/AnycubicSlicerNext` |
| profile files | 2,378 (2,341 JSON) | 8,524 (7,786 JSON) |
| distinct `filament_vendor` | **6** (one is `Generic`) | **37** (two are `Generic`/`Other`) |
| rows extracted | 45 | 302 |
| **presets actually added** | **0** | **1** (Elegoo PET) |

## The yield is one preset

Measured before building, as with BambuStudio. QIDIStudio names only five real vendors — QIDI,
Bambu Lab, HATCHBOX, Polymaker, Overture — every one of which the database already held.
AnycubicSlicerNext names 35, of which only **Aliz** and **DeltaMaker** were absent, and neither
produced an extractable row.

After the importer's own dedup (manufacturer|brand plus the settings key) the two forks together
contributed **one** preset. Anycubic was worth trying because `store.anycubic.com` answered 172
consecutive 429s during the storefront crawl and was left alone; its own slicer fork turns out
to carry 16 Anycubic-vendored profiles, all already covered from OrcaSlicer.

Both parsers are kept: they cost one 40-line wrapper each, they cannot drift from the shared
resolver, and they will pick up future additions to either fork for free. They are not kept for
the data they added today.

## What they did surface

`AnycubicSlicerNext` ships filament profiles that are renamed PLA. `Artillery PC @Artillery M1
Pro 0.4 nozzle` declares `"inherits": "Artillery Generic PLA"`, `"filament_type": ["PC"]` and
`"nozzle_temperature": ["210"]` — polycarbonate at PLA's temperature, which will not extrude.
`Artillery PA` is the same shape at 210/50.

Neither reached `constants.ts`: OrcaSlicer's own Artillery pack had already supplied the correct
values (PA 240/100, PC 295/110) under the same `manufacturer|brand` key, so the importer's dedup
kept the good rows. That was ordering luck rather than a guard, so `audit-presets.mjs` now
separates the two directions:

```
83 outside their material envelope
42 run COLD for their polymer (check these first — likely another polymer's settings)
41 run hot (usually a filled or engineering grade)
```

Running hot is normal for filled and engineering grades — PET-CF at 300 °C is correct. Running
cold is the signature of a profile carrying a different polymer's settings, so those are listed
first and are the ones worth reading.

Nothing is auto-corrected: an envelope is a prompt to check the source, not proof of error.
