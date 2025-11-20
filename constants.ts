
import { PrinterBrand, FilamentType, FilamentProfile } from './types';

export const PRINTER_BRANDS: PrinterBrand[] = [
  'Bambu Lab', 'Anycubic', 'Creality', 'Prusa', 'Ultimaker', 'Elegoo', 'Other'
];

export const PRINTER_MODELS: Record<PrinterBrand, string[]> = {
    'Bambu Lab': ['Generic', 'X1C', 'X1E', 'P1S', 'P1P', 'A1', 'A1 Mini'],
    'Prusa': ['Generic', 'MK4', 'MK3S+', 'XL', 'Mini+'],
    'Creality': ['Generic', 'K1', 'K1 Max', 'Ender 3 V3', 'Ender 3 S1', 'CR-10'],
    'Anycubic': ['Generic', 'Kobra 2', 'Kobra 3', 'Vyper'],
    'Elegoo': ['Generic', 'Neptune 4', 'Neptune 3'],
    'Ultimaker': ['Generic', 'S5', 'S3', '2+ Connect'],
    'Other': ['Generic']
};

export const NOZZLE_DIAMETERS = [0.2, 0.4, 0.6, 0.8];

export const FILAMENT_MANUFACTURERS: string[] = [
  'Atomic Filament', 'Bambu Lab', 'BASF Ultrafuse', 'ColorFabb', 'Creality', 'DSM Novamid', 'eSUN', 'Extrudr', 'Fiberlogy', 'Fillamentum', 'FiloAlfa', 'FormFutura', 'Geeetech', 'Hatchbox', 'IGUS', 'Kimya (Armor)', 'MatterHackers', 'NinjaTek', 'Overture', 'Polymaker', 'Priline', 'Proto-pasta', 'Prusa', 'Sakata', 'Siraya Tech', 'Spectrum', 'Sunlu', 'Taulman3D', 'XSTRAND (OwensCorning)', 'Other'
].sort();


export const FILAMENT_TYPES: FilamentType[] = [
  'PLA', 'ABS', 'PETG', 'TPU', 'ASA', 'PC', 'PA-CF', 'PA-GF', 'Copolyester', 'PETT', 'Nylon', 'TPE', 'Other'
];

const GENERIC_NOTE = "Default volumetric speed and retraction are generic; please tune for your printer.";

// Helper to create full profile with defaults for new fields
const createPreset = (base: Partial<FilamentProfile> & { id: string, profileName: string, printerBrand: PrinterBrand, manufacturer: string, filamentType: FilamentType, nozzleTemp: number, bedTemp: number }): FilamentProfile => {
    return {
        filamentDiameter: 1.75,
        printerModel: 'Generic',
        nozzleDiameter: 0.4,
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
        fanSpeedMin: base.filamentType === 'ABS' || base.filamentType === 'ASA' || base.filamentType === 'PC' ? 0 : 100,
        fanSpeedMax: base.filamentType === 'ABS' || base.filamentType === 'ASA' || base.filamentType === 'PC' ? 20 : 100,
        ...base
    } as FilamentProfile;
};

export const PRESET_PROFILES: FilamentProfile[] = [
  // Bambu Lab
  createPreset({ id: 'preset-1', profileName: 'Bambu Lab PLA Basic', printerBrand: 'Bambu Lab', manufacturer: 'Bambu Lab', brand: 'PLA Basic', filamentType: 'PLA', nozzleTemp: 220, bedTemp: 55, maxVolumetricSpeed: 21, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24 }),
  createPreset({ id: 'preset-2', profileName: 'Bambu Lab PLA Tough', printerBrand: 'Bambu Lab', manufacturer: 'Bambu Lab', brand: 'PLA Tough', filamentType: 'PLA', nozzleTemp: 220, bedTemp: 55, maxVolumetricSpeed: 22, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.25 }),
  createPreset({ id: 'preset-3', profileName: 'Bambu Lab PETG', printerBrand: 'Bambu Lab', manufacturer: 'Bambu Lab', brand: 'PETG Basic', filamentType: 'PETG', nozzleTemp: 255, bedTemp: 70, maxVolumetricSpeed: 13, fanSpeedMin: 40, fanSpeedMax: 90, density: 1.27, dryingTemp: 65, dryingTime: '8h' }),
  createPreset({ id: 'preset-4', profileName: 'Bambu Lab ABS', printerBrand: 'Bambu Lab', manufacturer: 'Bambu Lab', brand: 'ABS', filamentType: 'ABS', nozzleTemp: 260, bedTemp: 90, maxVolumetricSpeed: 18, fanSpeedMin: 0, fanSpeedMax: 40, density: 1.04 }),
  createPreset({ id: 'preset-5', profileName: 'Bambu Lab TPU (Flex 95A)', printerBrand: 'Bambu Lab', manufacturer: 'Bambu Lab', brand: 'TPU 95A', filamentType: 'TPU', nozzleTemp: 230, bedTemp: 35, maxVolumetricSpeed: 3.5, fanSpeedMin: 80, fanSpeedMax: 100, density: 1.21, dryingTemp: 70, dryingTime: '12h' }),
  
  // Prusa
  createPreset({ id: 'preset-6', profileName: 'Prusament PLA', printerBrand: 'Prusa', manufacturer: 'Prusa', brand: 'Prusament', filamentType: 'PLA', nozzleTemp: 215, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24 }),
  createPreset({ id: 'preset-7', profileName: 'Prusament PETG', printerBrand: 'Prusa', manufacturer: 'Prusa', brand: 'Prusament', filamentType: 'PETG', nozzleTemp: 240, bedTemp: 85, maxVolumetricSpeed: 12, fanSpeedMin: 30, fanSpeedMax: 50, density: 1.27, dryingTemp: 65, dryingTime: '4h' }),
  createPreset({ id: 'preset-8', profileName: 'Prusament ASA', printerBrand: 'Prusa', manufacturer: 'Prusa', brand: 'Prusament', filamentType: 'ASA', nozzleTemp: 260, bedTemp: 105, maxVolumetricSpeed: 12, fanSpeedMin: 0, fanSpeedMax: 20, density: 1.07, dryingTemp: 80, dryingTime: '4h' }),
  
  // eSUN (Existing)
  createPreset({ id: 'preset-9', profileName: 'eSUN PLA+', printerBrand: 'Other', manufacturer: 'eSUN', brand: 'PLA+', filamentType: 'PLA', nozzleTemp: 210, bedTemp: 60, maxVolumetricSpeed: 18, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24 }),
  createPreset({ id: 'preset-10', profileName: 'eSUN PETG', printerBrand: 'Other', manufacturer: 'eSUN', brand: 'PETG', filamentType: 'PETG', nozzleTemp: 235, bedTemp: 75, maxVolumetricSpeed: 12, fanSpeedMin: 50, fanSpeedMax: 100, density: 1.27, dryingTemp: 65, dryingTime: '6h' }),
  createPreset({ id: 'preset-11', profileName: 'eSUN ABS+', printerBrand: 'Other', manufacturer: 'eSUN', brand: 'ABS+', filamentType: 'ABS', nozzleTemp: 240, bedTemp: 95, maxVolumetricSpeed: 15, fanSpeedMin: 0, fanSpeedMax: 30, density: 1.05 }),
  createPreset({ id: 'preset-12', profileName: 'eSUN TPU-95A', printerBrand: 'Other', manufacturer: 'eSUN', brand: 'eFlex', filamentType: 'TPU', nozzleTemp: 225, bedTemp: 50, maxVolumetricSpeed: 3, fanSpeedMin: 80, fanSpeedMax: 100, density: 1.2, dryingTemp: 50, dryingTime: '6h' }),
  
  // eSUN (New Additions)
  createPreset({ id: 'esun-1', profileName: 'eSUN ePA-CF', printerBrand: 'Other', manufacturer: 'eSUN', brand: 'ePA-CF', filamentType: 'PA-CF', nozzleTemp: 250, bedTemp: 80, maxVolumetricSpeed: 8, fanSpeedMin: 0, fanSpeedMax: 0, density: 1.24, dryingTemp: 70, dryingTime: '12h', notes: "Nylon Carbon Fiber. Hardened nozzle required. Keep dry." }),
  createPreset({ id: 'esun-2', profileName: 'eSUN eASA', printerBrand: 'Other', manufacturer: 'eSUN', brand: 'eASA', filamentType: 'ASA', nozzleTemp: 250, bedTemp: 100, maxVolumetricSpeed: 12, fanSpeedMin: 0, fanSpeedMax: 20, density: 1.07, dryingTemp: 80, dryingTime: '4h', notes: "UV resistant. Enclosure recommended." }),
  createPreset({ id: 'esun-3', profileName: 'eSUN PLA-LW', printerBrand: 'Other', manufacturer: 'eSUN', brand: 'PLA-LW', filamentType: 'PLA', nozzleTemp: 210, bedTemp: 50, maxVolumetricSpeed: 8, fanSpeedMin: 100, fanSpeedMax: 100, density: 0.54, notes: "Lightweight foaming PLA. Flow rate needs calibration (~50-60% flow usually)." }),
  createPreset({ id: 'esun-4', profileName: 'eSUN PLA-Matte', printerBrand: 'Other', manufacturer: 'eSUN', brand: 'PLA-Matte', filamentType: 'PLA', nozzleTemp: 210, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "Matte surface finish." }),
  createPreset({ id: 'esun-5', profileName: 'eSUN eSilk-PLA', printerBrand: 'Other', manufacturer: 'eSUN', brand: 'eSilk', filamentType: 'PLA', nozzleTemp: 215, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "Silky shiny surface." }),

  // Sunlu
  createPreset({ id: 'preset-13', profileName: 'Sunlu PLA', printerBrand: 'Other', manufacturer: 'Sunlu', brand: 'PLA', filamentType: 'PLA', nozzleTemp: 205, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24 }),
  createPreset({ id: 'preset-14', profileName: 'Sunlu PETG', printerBrand: 'Other', manufacturer: 'Sunlu', brand: 'PETG', filamentType: 'PETG', nozzleTemp: 235, bedTemp: 70, maxVolumetricSpeed: 12, fanSpeedMin: 50, fanSpeedMax: 100, density: 1.27, dryingTemp: 65, dryingTime: '4h' }),
  
  // Polymaker (Existing & New)
  createPreset({ id: 'preset-16', profileName: 'Polymaker PolyLite PLA', printerBrand: 'Other', manufacturer: 'Polymaker', brand: 'PolyLite', filamentType: 'PLA', nozzleTemp: 205, bedTemp: 55, maxVolumetricSpeed: 16, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.23 }),
  createPreset({ id: 'preset-20', profileName: 'Polymaker PolyMax PC', printerBrand: 'Other', manufacturer: 'Polymaker', brand: 'PolyMax', filamentType: 'PC', nozzleTemp: 260, bedTemp: 100, maxVolumetricSpeed: 14, fanSpeedMin: 0, fanSpeedMax: 0, density: 1.2, dryingTemp: 100, dryingTime: '12h' }),
  createPreset({ id: 'preset-21', profileName: 'Polymaker PolyMide PA6-CF', printerBrand: 'Other', manufacturer: 'Polymaker', brand: 'PolyMide', filamentType: 'PA-CF', nozzleTemp: 290, bedTemp: 45, maxVolumetricSpeed: 10, fanSpeedMin: 0, fanSpeedMax: 0, spoolWeight: 500, density: 1.24, dryingTemp: 80, dryingTime: '12h', notes: "Hardened nozzle required." }),
  
  // Polymaker New Additions
  createPreset({ id: 'pm-1', profileName: 'Polymaker PolyTerra PLA', printerBrand: 'Other', manufacturer: 'Polymaker', brand: 'PolyTerra', filamentType: 'PLA', nozzleTemp: 200, bedTemp: 50, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.20, notes: "Matte finish, eco-friendly PLA." }),
  createPreset({ id: 'pm-2', profileName: 'Polymaker PolyLite PETG', printerBrand: 'Other', manufacturer: 'Polymaker', brand: 'PolyLite', filamentType: 'PETG', nozzleTemp: 235, bedTemp: 75, maxVolumetricSpeed: 12, fanSpeedMin: 20, fanSpeedMax: 60, density: 1.25, dryingTemp: 65, dryingTime: '6h' }),
  createPreset({ id: 'pm-3', profileName: 'Polymaker PolyLite ABS', printerBrand: 'Other', manufacturer: 'Polymaker', brand: 'PolyLite', filamentType: 'ABS', nozzleTemp: 250, bedTemp: 95, maxVolumetricSpeed: 15, fanSpeedMin: 0, fanSpeedMax: 30, density: 1.08, dryingTemp: 80, dryingTime: '4h', notes: "Enclosure recommended." }),
  createPreset({ id: 'pm-4', profileName: 'Polymaker PolyLite ASA', printerBrand: 'Other', manufacturer: 'Polymaker', brand: 'PolyLite', filamentType: 'ASA', nozzleTemp: 255, bedTemp: 95, maxVolumetricSpeed: 15, fanSpeedMin: 0, fanSpeedMax: 20, density: 1.07, dryingTemp: 80, dryingTime: '4h', notes: "UV resistant, enclosure recommended." }),
  createPreset({ id: 'pm-5', profileName: 'Polymaker PolyMax PLA', printerBrand: 'Other', manufacturer: 'Polymaker', brand: 'PolyMax', filamentType: 'PLA', nozzleTemp: 210, bedTemp: 60, maxVolumetricSpeed: 16, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.22, notes: "High impact resistance." }),
  createPreset({ id: 'pm-6', profileName: 'Polymaker PolyFlex TPU95', printerBrand: 'Other', manufacturer: 'Polymaker', brand: 'PolyFlex', filamentType: 'TPU', nozzleTemp: 220, bedTemp: 40, maxVolumetricSpeed: 3, fanSpeedMin: 80, fanSpeedMax: 100, density: 1.22, printSpeed: 30, retractionDistance: 3.0, retractionSpeed: 40, dryingTemp: 65, dryingTime: '6h' }),

  // Extrudr Additions
  createPreset({ id: 'ext-1', profileName: 'Extrudr NX2 PLA', printerBrand: 'Other', manufacturer: 'Extrudr', brand: 'NX2', filamentType: 'PLA', nozzleTemp: 215, bedTemp: 60, maxVolumetricSpeed: 16, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "Matte finish, high mechanical strength." }),
  createPreset({ id: 'ext-2', profileName: 'Extrudr XPETG Matte', printerBrand: 'Other', manufacturer: 'Extrudr', brand: 'XPETG', filamentType: 'PETG', nozzleTemp: 230, bedTemp: 80, maxVolumetricSpeed: 13, fanSpeedMin: 30, fanSpeedMax: 70, density: 1.27, dryingTemp: 65, dryingTime: '4h' }),
  createPreset({ id: 'ext-3', profileName: 'Extrudr BioFusion', printerBrand: 'Other', manufacturer: 'Extrudr', brand: 'BioFusion', filamentType: 'PLA', nozzleTemp: 225, bedTemp: 65, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.22, notes: "Intense metallic shine, treat like PLA." }),
  createPreset({ id: 'ext-4', profileName: 'Extrudr GreenTEC Pro', printerBrand: 'Other', manufacturer: 'Extrudr', brand: 'GreenTEC', filamentType: 'PLA', nozzleTemp: 220, bedTemp: 60, maxVolumetricSpeed: 14, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.29, notes: "High heat resistance (160°C), biodegradable." }),
  createPreset({ id: 'ext-5', profileName: 'Extrudr DuraPro ASA', printerBrand: 'Other', manufacturer: 'Extrudr', brand: 'DuraPro', filamentType: 'ASA', nozzleTemp: 255, bedTemp: 100, maxVolumetricSpeed: 15, fanSpeedMin: 0, fanSpeedMax: 30, density: 1.07, dryingTemp: 80, dryingTime: '4h' }),
  createPreset({ id: 'ext-6', profileName: 'Extrudr Flex Hard (TPU 58D)', printerBrand: 'Other', manufacturer: 'Extrudr', brand: 'Flex Hard', filamentType: 'TPU', nozzleTemp: 235, bedTemp: 50, maxVolumetricSpeed: 6, fanSpeedMin: 80, fanSpeedMax: 100, density: 1.18, retractionDistance: 2, retractionSpeed: 30, dryingTemp: 60, dryingTime: '6h' }),

  // FiloAlfa Additions
  createPreset({ id: 'fa-1', profileName: 'FiloAlfa PLA', printerBrand: 'Other', manufacturer: 'FiloAlfa', brand: 'PLA', filamentType: 'PLA', nozzleTemp: 205, bedTemp: 55, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "Easy to print, Italian made." }),
  createPreset({ id: 'fa-2', profileName: 'FiloAlfa Alfa+', printerBrand: 'Other', manufacturer: 'FiloAlfa', brand: 'Alfa+', filamentType: 'PLA', nozzleTemp: 220, bedTemp: 60, maxVolumetricSpeed: 16, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "High temp resistance, annealable, bio-based." }),
  createPreset({ id: 'fa-3', profileName: 'FiloAlfa PETG', printerBrand: 'Other', manufacturer: 'FiloAlfa', brand: 'PETG', filamentType: 'PETG', nozzleTemp: 240, bedTemp: 80, maxVolumetricSpeed: 12, fanSpeedMin: 30, fanSpeedMax: 70, density: 1.27, dryingTemp: 65, dryingTime: '4h' }),
  createPreset({ id: 'fa-4', profileName: 'FiloAlfa ABS', printerBrand: 'Other', manufacturer: 'FiloAlfa', brand: 'ABS', filamentType: 'ABS', nozzleTemp: 250, bedTemp: 100, maxVolumetricSpeed: 14, fanSpeedMin: 0, fanSpeedMax: 20, density: 1.04, dryingTemp: 80, dryingTime: '3h', notes: "Use enclosure." }),
  createPreset({ id: 'fa-5', profileName: 'FiloAlfa TPU', printerBrand: 'Other', manufacturer: 'FiloAlfa', brand: 'TPU', filamentType: 'TPU', nozzleTemp: 225, bedTemp: 50, maxVolumetricSpeed: 3, fanSpeedMin: 80, fanSpeedMax: 100, density: 1.22, retractionDistance: 2.0, retractionSpeed: 30 }),

  // Siraya Tech Additions
  createPreset({ id: 'st-1', profileName: 'Siraya Tech EzPC', printerBrand: 'Other', manufacturer: 'Siraya Tech', brand: 'EzPC', filamentType: 'PC', nozzleTemp: 260, bedTemp: 95, maxVolumetricSpeed: 12, fanSpeedMin: 0, fanSpeedMax: 0, density: 1.20, dryingTemp: 80, dryingTime: '6h', notes: "Easy to print Polycarbonate, warping resistant." }),
  createPreset({ id: 'st-2', profileName: 'Siraya Tech PLA+', printerBrand: 'Other', manufacturer: 'Siraya Tech', brand: 'PLA+', filamentType: 'PLA', nozzleTemp: 210, bedTemp: 55, maxVolumetricSpeed: 16, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "Enhanced strength PLA." }),
  createPreset({ id: 'st-3', profileName: 'Siraya Tech ABS-Like', printerBrand: 'Other', manufacturer: 'Siraya Tech', brand: 'ABS-Like', filamentType: 'ABS', nozzleTemp: 250, bedTemp: 95, maxVolumetricSpeed: 15, fanSpeedMin: 0, fanSpeedMax: 30, density: 1.05, notes: "Lower odor than standard ABS, good layer adhesion." }),
  createPreset({ id: 'st-4', profileName: 'Siraya Tech PETG', printerBrand: 'Other', manufacturer: 'Siraya Tech', brand: 'PETG', filamentType: 'PETG', nozzleTemp: 240, bedTemp: 75, maxVolumetricSpeed: 13, fanSpeedMin: 30, fanSpeedMax: 70, density: 1.27, dryingTemp: 65, dryingTime: '4h' }),
];
