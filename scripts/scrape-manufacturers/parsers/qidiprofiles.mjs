#!/usr/bin/env node
// QidiProfiles system filament profiles -> parameter facts.
//
//   https://github.com/QIDITECH/QIDIStudio  (resources/profiles/<Vendor>/filament/*.json)
//
// QIDI's own fork. Its packs are printer-series directories (Q Series, X 3 Series, ...) rather than vendor names, but the filament_vendor field inside each profile still names the real maker.
//
// An OrcaSlicer fork, so the schema, the filament_list index, the "nil" placeholder and the
// inherits chain are all Orca's. This module is a thin wrapper: it drives the resolver factory
// in slicerprofiles.mjs with this repo's values. No chain logic is copied here — a fix to the
// resolver applies to every fork at once.
//
// LICENCE POSTURE. AGPL-3.0, handled exactly as for OrcaSlicer: numeric parameter values as
// facts plus the material identifier, citing the source profile name and its raw URL on every
// row. No profile files are copied into this repo, no creative product-line names are reused
// as product names, no g-code, notes or other prose fields are reproduced.

import { createSlicerResolver } from './slicerprofiles.mjs';
import { join as _join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

export const MANUFACTURER = 'QidiProfiles';
export const ORIGIN = 'https://github.com/QIDITECH/QIDIStudio';
export const LICENSE = 'AGPL-3.0 — parameter values used as facts, with attribution';

const API_DIRS = 'https://api.github.com/repos/QIDITECH/QIDIStudio/contents/resources/profiles';
const RAW = 'https://raw.githubusercontent.com/QIDITECH/QIDIStudio/main/resources/profiles/';

// Read from the gitignored clone under vendor/ when present; QIDI_PROFILES overrides it.
const LOCAL = process.env.QIDI_PROFILES
  || _join(dirname(fileURLToPath(import.meta.url)), '..', 'vendor', 'QIDIStudio', 'resources', 'profiles');

// Where run-all.mjs keeps this parser's rows; read back so a resumed run stays deduplicated.
const DATA_FILE = _join(dirname(fileURLToPath(import.meta.url)), '..', 'data', 'qidiprofiles.json');

const resolver = createSlicerResolver({
  rawBase: RAW,
  localDir: LOCAL,
  dataFile: DATA_FILE,
  origin: ORIGIN,
  apiDirs: API_DIRS,
  name: 'qidiprofiles',
});

export const listProducts = resolver.listProducts;
export const parseProduct = resolver.parseProduct;
