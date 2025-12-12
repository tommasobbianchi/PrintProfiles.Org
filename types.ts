
export type FilamentType = 'PLA' | 'ABS' | 'PETG' | 'TPU' | 'ASA' | 'PC' | 'PA-CF' | 'PA-GF' | 'Copolyester' | 'PETT' | 'Nylon' | 'TPE' | 'PEBA' | 'Other';
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
}
