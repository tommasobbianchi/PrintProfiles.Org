#!/usr/bin/env node
// One canonical spelling per manufacturer.
//
// Four corpora name the same company four ways — "eSUN"/"eSun", "3D-Fuel"/"3D Fuel",
// "Proto-pasta"/"Protopasta" — and each spelling became its own entry in the browse list, so a
// reader filtering by manufacturer saw a company's catalogue split across two or three rows.
//
// Two kinds of alias live here, and they are not equally safe:
//
//   CASE/PUNCTUATION — the same string modulo case, spaces and hyphens. Mechanical, and the
//   canonical form is simply the vendor's own styling.
//
//   CORPORATE — different names for one company, which needs judgement and is therefore
//   written out one line at a time with its reason. "Forward AM" is BASF's additive
//   manufacturing brand; "Prusament" is the filament brand made by Prusa Polymers; "Made for
//   Prusa" is Prusa's own label. Nothing is folded on a guess: near-matches that are NOT the
//   same company are listed at the bottom so a later pass does not "helpfully" merge them.
//
// Used by import-manufacturers.mjs so new rows land canonical, and by canon-manufacturers.mjs
// which rewrote the presets already in constants.ts.

export const MANUFACTURER_ALIASES = {
  // filamentor.it's Shopify vendor field abbreviates it; the brand trades as Professional Lab.
  'Prof. Lab': 'Professional Lab',
  'Prof Lab': 'Professional Lab',
  // -- case and punctuation only -------------------------------------------------
  '3DJAKE': '3DJake',
  '3DXTECH': '3DXTech',
  '3DxTech': '3DXTech',
  'AddNorth': 'add:north',
  'addnorth': 'add:north',   // the vendor styles it "add:north"
  'AMOLEN': 'Amolen',
  'ANYCUBIC': 'Anycubic',
  'ELEGOO': 'Elegoo',
  'eSun': 'eSUN',
  'Flashforge': 'FlashForge',
  'Formfutura': 'FormFutura',
  'GEEETECH': 'Geeetech',
  'IGUS': 'igus',            // the company styles itself lowercase
  'JAYO': 'Jayo',
  'Proto-pasta': 'Protopasta',
  'Sunlu': 'SUNLU',
  '3D Fuel': '3D-Fuel',
  'ROSA3D Filaments': 'Rosa3D',
  'Spectrum Filaments': 'Spectrum',
  'Taulman': 'Taulman3D',

  // -- one company, several names ------------------------------------------------
  'Solutech': '3D Solutech',            // "Solutech" is the short form of 3D Solutech
  'BASF': 'BASF Forward AM',            // Forward AM is BASF's AM brand; Ultrafuse is its line
  'Forward AM': 'BASF Forward AM',
  'DSM Novamid': 'DSM',                 // Novamid is a DSM product line, not a separate maker
  'Fusion': 'Fusion Filaments',
  'Kimya (Armor)': 'Kimya',             // Kimya is Armor Group's filament brand
  'Prusa': 'Prusa Polymers',            // Prusa Polymers is the entity that makes the filament
  'Prusament': 'Prusa Polymers',        // Prusament is its brand, kept in the `brand` field
  'Made for Prusa': 'Prusa Polymers',   // Prusa's own label, not a third party
  'Qidi Tech': 'QIDI',
  'QIDI Tech': 'QIDI',
};

// NOT aliases. Each pair below looks like a near-match to a substring check and is not one;
// they are listed so a future normalisation pass does not merge them by accident.
//   Duramic 3D / IC3D / Tectonic-3D / Infinity3D / CR3D / R3D / re3D / Raise3D /
//   GreenGate3D / IMADE3D / E3D  — all distinct companies that merely share "3D"
//   NIT / TechInit                — distinct
export function canonManufacturer(name) {
  const s = String(name || '').trim();
  return MANUFACTURER_ALIASES[s] ?? s;
}
