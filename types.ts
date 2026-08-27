
export type FilamentType =
  | 'PLA' | 'ABS' | 'PETG' | 'TPU' | 'ASA' | 'PC' | 'PA-CF' | 'PA-GF'
  | 'Copolyester' | 'PETT' | 'Nylon' | 'TPE' | 'PEBA'
  // Distinct polymers, not marketing grades: "PLA+" stays PLA and carries its grade in
  // `brand`, but PCTG/PVB/PP/HIPS et al. print differently enough to need their own type.
  | 'PCTG' | 'PVB' | 'PP' | 'HIPS' | 'PEI' | 'BVOH' | 'PVA'
  | 'PA6' | 'PA12' | 'PET' | 'CPE' | 'PHA'
  | 'Other';
export type PrinterBrand = 'Bambu Lab' | 'Anycubic' | 'Creality' | 'Prusa' | 'Ultimaker' | 'Elegoo' | 'Other';

export interface FilamentProfile {
  id: string;
  profileName: string;
  printerBrand: PrinterBrand;
  printerModel?: string; // e.g. "P1S", "X1C", "Generic"
  manufacturer: string;
  brand?: string;
  filamentType: FilamentType;
  filamentDiameter: number;
  nozzleDiameter?: number; // e.g. 0.4, 0.6. If undefined, assumes Generic/All
  
  spoolWeight?: number; // in grams
  filamentCost?: number; // cost per spool
  colorName?: string;
  colorHex?: string;
  
  // Temperature
  nozzleTempInitial: number;
  nozzleTemp: number;
  bedTempInitial: number;
  bedTemp: number;
  
  // Speed & Extrusion
  printSpeed: number;
  maxVolumetricSpeed: number; // mm³/s - Critical for modern slicers
  flowRatio?: number; // Extrusion multiplier (e.g. 0.98)
  retractionDistance: number;
  retractionSpeed: number;
  
  // Cooling
  fanSpeedMin: number;
  fanSpeedMax: number;
  
  // Material Properties
  dryingTemp?: number;
  dryingTime?: string; // e.g. "4h"
  density?: number; // in g/cm³
  tensileStrength?: string; // e.g. "50 MPa"
  notes?: string;

  // Provenance. Where a preset's numbers came from, kept as data rather than buried in `notes`,
  // so the UI can say which and a reader can judge how much to trust it.
  //   'manufacturer'   the vendor's own product page or datasheet
  //   'spoolmandb'     SpoolmanDB, the MIT-licensed community database
  //   'slicer-profile' parameter values from an open-source slicer's tuned profile
  //   'generic'        hand-written, unattributed — the original seed presets
  sourceType?: 'manufacturer' | 'retailer' | 'spoolmandb' | 'slicer-profile' | 'generic';
  sourceUrl?: string;
  sourceProfile?: string; // e.g. 'Bambu PETG HF @base' — names the exact profile cited
}
