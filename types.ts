export type FilamentType = 'PLA' | 'ABS' | 'PETG' | 'TPU' | 'ASA' | 'PC' | 'PA-CF' | 'PA-GF' | 'Copolyester' | 'PETT' | 'Nylon' | 'TPE' | 'Other';
export type PrinterBrand = 'Bambu Lab' | 'Anycubic' | 'Creality' | 'Prusa' | 'Ultimaker' | 'Elegoo' | 'Other';

export interface FilamentProfile {
  id: string;
  profileName: string;
  printerBrand: PrinterBrand;
  manufacturer: string;
  brand?: string;
  filamentType: FilamentType;
  filamentDiameter: number;
  spoolWeight?: number; // in grams
  colorName?: string;
  colorHex?: string;
  nozzleTemp: number;
  bedTemp: number;
  printSpeed: number;
  retractionDistance: number;
  retractionSpeed: number;
  fanSpeed: number;
  dryingTemp?: number;
  dryingTime?: string; // e.g. "4h"
  density?: number; // in g/cm³
  tensileStrength?: string; // e.g. "50 MPa"
  notes?: string;
}
