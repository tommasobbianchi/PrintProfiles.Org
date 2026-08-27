#!/usr/bin/env node
// BambuStudio system filament profiles -> parameter facts.
//
//   https://github.com/bambulab/BambuStudio  (resources/profiles/<Vendor>/filament/*.json)
//
// BambuStudio ships the same JSON schema, filament_list index, "nil" placeholder and inherits
// chain as OrcaSlicer, so this module is a thin wrapper: it drives the resolver factory in
// slicerprofiles.mjs with the BambuStudio values. There is no copy of the chain logic here —
// a fix to the resolver in slicerprofiles.mjs applies to both sources.
//
// LICENCE POSTURE. BambuStudio is AGPL-3.0. Exactly as for OrcaSlicer, this parser extracts
// ONLY the numeric parameter values as facts (temperatures, volumetric speed, flow ratio, fan
// speeds, density) plus the material identifier, and cites the exact source profile name and
// its raw URL on every row. It deliberately does NOT copy profile JSON into this repo, reuse
// creative product-line names as product names, or reproduce g-code / notes / prose fields.
// Numbers and material identifiers only; anything ambiguous is left out.

import { createSlicerResolver } from './slicerprofiles.mjs';
import { join as _join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

export const MANUFACTURER = 'BambuProfiles';
export const ORIGIN = 'https://github.com/bambulab/BambuStudio';
export const LICENSE = 'AGPL-3.0 — parameter values used as facts, with attribution';

const API_DIRS = 'https://api.github.com/repos/bambulab/BambuStudio/contents/resources/profiles';
const RAW = 'https://raw.githubusercontent.com/bambulab/BambuStudio/master/resources/profiles/';

// The BambuStudio clone is used when present: 3,823 profile files on disk are read in seconds
// instead of hours behind a 1.5 s/domain rate limit. Set BAMBU_PROFILES to a
// resources/profiles directory; the clone under vendor/ is gitignored and never committed.
const LOCAL = process.env.BAMBU_PROFILES
  || _join(dirname(fileURLToPath(import.meta.url)), '..', 'vendor', 'BambuStudio', 'resources', 'profiles');

// Where run-all.mjs keeps this parser's rows; read back so a resumed run stays deduplicated.
const DATA_FILE = _join(dirname(fileURLToPath(import.meta.url)), '..', 'data', 'bambuprofiles.json');

const resolver = createSlicerResolver({
  rawBase: RAW,
  localDir: LOCAL,
  dataFile: DATA_FILE,
  origin: ORIGIN,
  apiDirs: API_DIRS,
  name: 'bambuprofiles',
  // The H series (H2C, H2D, H2DP, H2S) is a distinct printer generation with its own tuning:
  // 760 filament files in this pack carry an H-series suffix, and every one of them was being
  // folded into the base product and discarded, so the catalogue held no H-series profile at
  // all. Only these models are opted in — the P/X/A machines are the ones the base profiles
  // were already written for, so emitting those variants would duplicate rows that say the
  // same thing. A variant that re-tunes nothing still collapses: it collides with the base on
  // the importer's (manufacturer, brand, type, nozzle, bed) key and is dropped there.
  printerVariants: { match: /@BBL\s+(H2DP|H2D|H2S|H2C)\b/i, brand: 'Bambu Lab' },
});

export const listProducts = resolver.listProducts;
export const parseProduct = resolver.parseProduct;
