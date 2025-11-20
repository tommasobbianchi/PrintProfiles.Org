import { PrinterBrand, FilamentType, FilamentProfile } from './types';

export const PRINTER_BRANDS: PrinterBrand[] = [
  'Bambu Lab', 'Anycubic', 'Creality', 'Prusa', 'Ultimaker', 'Elegoo', 'Other'
];

export const FILAMENT_MANUFACTURERS: string[] = [
  'Atomic Filament', 'Bambu Lab', 'BASF Ultrafuse', 'ColorFabb', 'Creality', 'DSM Novamid', 'eSUN', 'Extrudr', 'Fiberlogy', 'Fillamentum', 'FormFutura', 'Geeetech', 'Hatchbox', 'IGUS', 'Kimya (Armor)', 'MatterHackers', 'NinjaTek', 'Overture', 'Polymaker', 'Priline', 'Proto-pasta', 'Prusa', 'Sakata', 'Spectrum', 'Sunlu', 'Taulman3D', 'XSTRAND (OwensCorning)', 'Other'
].sort();


export const FILAMENT_TYPES: FilamentType[] = [
  'PLA', 'ABS', 'PETG', 'TPU', 'ASA', 'PC', 'PA-CF', 'PA-GF', 'Copolyester', 'PETT', 'Nylon', 'TPE', 'Other'
];

const GENERIC_NOTE = "Default volumetric speed and retraction are generic; please tune for your printer.";

// Helper to create full profile with defaults for new fields
const createPreset = (base: Partial<FilamentProfile> & { id: string, profileName: string, printerBrand: PrinterBrand, manufacturer: string, filamentType: FilamentType, nozzleTemp: number, bedTemp: number }): FilamentProfile => {
    return {
        filamentDiameter: 1.75,
        printSpeed: 60,
        retractionDistance: 0.8,
        retractionSpeed: 35,
        spoolWeight: 1000,
        filamentCost: 20,
        notes: GENERIC_NOTE,
        // Defaults for new fields if not provided
        nozzleTempInitial: base.nozzleTemp + 5,
        bedTempInitial: base.bedTemp,
        maxVolumetricSpeed: base.filamentType === 'TPU' ? 3 : (base.filamentType === 'PLA' ? 15 : 10),
        fanSpeedMin: base.filamentType === 'ABS' || base.filamentType === 'ASA' ? 0 : 100,
        fanSpeedMax: base.filamentType === 'ABS' || base.filamentType === 'ASA' ? 20 : 100,
        ...base
    } as FilamentProfile;
};

export const PRESET_PROFILES: FilamentProfile[] = [
  createPreset({ id: 'preset-1', profileName: 'Bambu Lab PLA Basic', printerBrand: 'Bambu Lab', manufacturer: 'Bambu Lab', brand: 'PLA Basic', filamentType: 'PLA', nozzleTemp: 220, bedTemp: 55, maxVolumetricSpeed: 21, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24 }),
  createPreset({ id: 'preset-2', profileName: 'Bambu Lab PLA Tough', printerBrand: 'Bambu Lab', manufacturer: 'Bambu Lab', brand: 'PLA Tough', filamentType: 'PLA', nozzleTemp: 220, bedTemp: 55, maxVolumetricSpeed: 22, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.25 }),
  createPreset({ id: 'preset-3', profileName: 'Bambu Lab PETG', printerBrand: 'Bambu Lab', manufacturer: 'Bambu Lab', brand: 'PETG Basic', filamentType: 'PETG', nozzleTemp: 255, bedTemp: 70, maxVolumetricSpeed: 13, fanSpeedMin: 40, fanSpeedMax: 90, density: 1.27, dryingTemp: 65, dryingTime: '8h' }),
  createPreset({ id: 'preset-4', profileName: 'Bambu Lab ABS', printerBrand: 'Bambu Lab', manufacturer: 'Bambu Lab', brand: 'ABS', filamentType: 'ABS', nozzleTemp: 260, bedTemp: 90, maxVolumetricSpeed: 18, fanSpeedMin: 0, fanSpeedMax: 40, density: 1.04 }),
  createPreset({ id: 'preset-5', profileName: 'Bambu Lab TPU (Flex 95A)', printerBrand: 'Bambu Lab', manufacturer: 'Bambu Lab', brand: 'TPU 95A', filamentType: 'TPU', nozzleTemp: 230, bedTemp: 35, maxVolumetricSpeed: 3.5, fanSpeedMin: 80, fanSpeedMax: 100, density: 1.21, dryingTemp: 70, dryingTime: '12h' }),
  
  createPreset({ id: 'preset-6', profileName: 'Prusament PLA', printerBrand: 'Prusa', manufacturer: 'Prusa', brand: 'Prusament', filamentType: 'PLA', nozzleTemp: 215, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24 }),
  createPreset({ id: 'preset-7', profileName: 'Prusament PETG', printerBrand: 'Prusa', manufacturer: 'Prusa', brand: 'Prusament', filamentType: 'PETG', nozzleTemp: 240, bedTemp: 85, maxVolumetricSpeed: 12, fanSpeedMin: 30, fanSpeedMax: 50, density: 1.27, dryingTemp: 65, dryingTime: '4h' }),
  createPreset({ id: 'preset-8', profileName: 'Prusament ASA', printerBrand: 'Prusa', manufacturer: 'Prusa', brand: 'Prusament', filamentType: 'ASA', nozzleTemp: 260, bedTemp: 105, maxVolumetricSpeed: 12, fanSpeedMin: 0, fanSpeedMax: 20, density: 1.07, dryingTemp: 80, dryingTime: '4h' }),
  
  createPreset({ id: 'preset-9', profileName: 'eSUN PLA+', printerBrand: 'Other', manufacturer: 'eSUN', brand: 'PLA+', filamentType: 'PLA', nozzleTemp: 210, bedTemp: 60, maxVolumetricSpeed: 18, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24 }),
  createPreset({ id: 'preset-10', profileName: 'eSUN PETG', printerBrand: 'Other', manufacturer: 'eSUN', brand: 'PETG', filamentType: 'PETG', nozzleTemp: 235, bedTemp: 75, maxVolumetricSpeed: 12, fanSpeedMin: 50, fanSpeedMax: 100, density: 1.27, dryingTemp: 65, dryingTime: '6h' }),
  createPreset({ id: 'preset-11', profileName: 'eSUN ABS+', printerBrand: 'Other', manufacturer: 'eSUN', brand: 'ABS+', filamentType: 'ABS', nozzleTemp: 240, bedTemp: 95, maxVolumetricSpeed: 15, fanSpeedMin: 0, fanSpeedMax: 30, density: 1.05 }),
  createPreset({ id: 'preset-12', profileName: 'eSUN TPU-95A', printerBrand: 'Other', manufacturer: 'eSUN', brand: 'eFlex', filamentType: 'TPU', nozzleTemp: 225, bedTemp: 50, maxVolumetricSpeed: 3, fanSpeedMin: 80, fanSpeedMax: 100, density: 1.2, dryingTemp: 50, dryingTime: '6h' }),
  
  createPreset({ id: 'preset-13', profileName: 'Sunlu PLA', printerBrand: 'Other', manufacturer: 'Sunlu', brand: 'PLA', filamentType: 'PLA', nozzleTemp: 205, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24 }),
  createPreset({ id: 'preset-14', profileName: 'Sunlu PETG', printerBrand: 'Other', manufacturer: 'Sunlu', brand: 'PETG', filamentType: 'PETG', nozzleTemp: 235, bedTemp: 70, maxVolumetricSpeed: 12, fanSpeedMin: 50, fanSpeedMax: 100, density: 1.27, dryingTemp: 65, dryingTime: '4h' }),
  
  createPreset({ id: 'preset-16', profileName: 'Polymaker PolyLite PLA', printerBrand: 'Other', manufacturer: 'Polymaker', brand: 'PolyLite', filamentType: 'PLA', nozzleTemp: 205, bedTemp: 55, maxVolumetricSpeed: 16, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.23 }),
  createPreset({ id: 'preset-20', profileName: 'Polymaker PolyMax PC', printerBrand: 'Other', manufacturer: 'Polymaker', brand: 'PolyMax', filamentType: 'PC', nozzleTemp: 260, bedTemp: 100, maxVolumetricSpeed: 14, fanSpeedMin: 0, fanSpeedMax: 0, density: 1.2, dryingTemp: 100, dryingTime: '12h' }),
  createPreset({ id: 'preset-21', profileName: 'Polymaker PolyMide PA6-CF', printerBrand: 'Other', manufacturer: 'Polymaker', brand: 'PolyMide', filamentType: 'PA-CF', nozzleTemp: 290, bedTemp: 45, maxVolumetricSpeed: 10, fanSpeedMin: 0, fanSpeedMax: 0, spoolWeight: 500, density: 1.24, dryingTemp: 80, dryingTime: '12h', notes: "Hardened nozzle required." }),
];