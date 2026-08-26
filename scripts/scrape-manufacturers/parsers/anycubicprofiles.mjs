#!/usr/bin/env node
// AnycubicProfiles system filament profiles -> parameter facts.
//
//   https://github.com/ANYCUBIC-3D/AnycubicSlicerNext  (resources/profiles/<Vendor>/filament/*.json)
//
// Anycubic's own fork, and the only clean route to their filament data: store.anycubic.com answered 172 consecutive 429s during the storefront crawl and was left alone.
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

export const MANUFACTURER = 'AnycubicProfiles';
export const ORIGIN = 'https://github.com/ANYCUBIC-3D/AnycubicSlicerNext';
export const LICENSE = 'AGPL-3.0 — parameter values used as facts, with attribution';

const API_DIRS = 'https://api.github.com/repos/ANYCUBIC-3D/AnycubicSlicerNext/contents/resources/profiles';
const RAW = 'https://raw.githubusercontent.com/ANYCUBIC-3D/AnycubicSlicerNext/main/resources/profiles/';

// Read from the gitignored clone under vendor/ when present; ANYCUBIC_PROFILES overrides it.
const LOCAL = process.env.ANYCUBIC_PROFILES
  || _join(dirname(fileURLToPath(import.meta.url)), '..', 'vendor', 'AnycubicSlicerNext', 'resources', 'profiles');

// Where run-all.mjs keeps this parser's rows; read back so a resumed run stays deduplicated.
const DATA_FILE = _join(dirname(fileURLToPath(import.meta.url)), '..', 'data', 'anycubicprofiles.json');

const resolver = createSlicerResolver({
  rawBase: RAW,
  localDir: LOCAL,
  dataFile: DATA_FILE,
  origin: ORIGIN,
  apiDirs: API_DIRS,
  name: 'anycubicprofiles',
});

export const listProducts = resolver.listProducts;
export const parseProduct = resolver.parseProduct;
