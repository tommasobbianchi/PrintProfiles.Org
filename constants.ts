
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
  '3DJake', 'Anycubic', 'Atomic Filament', 'Bambu Lab', 'BASF Ultrafuse', 'ColorFabb', 'Creality', 'DSM Novamid', 'Elegoo', 'Eryone', 'eSUN', 'Extrudr', 'Fiberlogy', 'Fillamentum', 'FiloAlfa', 'FormFutura', 'GST3D', 'Geeetech', 'GratKit', 'Hatchbox', 'IGUS', 'JAMG HE', 'JAYO', 'Kimya (Armor)', 'MatterHackers', 'NinjaTek', 'Overture', 'Polymaker', 'Priline', 'Proto-pasta', 'Prusa', 'Qidi Tech', 'Recreus', 'Sakata', 'Siraya Tech', 'Spectrum', 'Sunlu', 'Taulman3D', 'TechInit', 'Treed Filaments', 'XSTRAND (OwensCorning)', 'Other'
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
        fanSpeedMin: base.filamentType === 'ABS' || base.filamentType === 'ASA' || base.filamentType === 'PC' || base.filamentType === 'Nylon' || base.filamentType === 'PA-CF' ? 0 : 100,
        fanSpeedMax: base.filamentType === 'ABS' || base.filamentType === 'ASA' || base.filamentType === 'PC' || base.filamentType === 'Nylon' || base.filamentType === 'PA-CF' ? 20 : 100,
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
  
  // Prusa (Expanded)
  createPreset({ id: 'preset-6', profileName: 'Prusament PLA', printerBrand: 'Prusa', manufacturer: 'Prusa', brand: 'Prusament', filamentType: 'PLA', nozzleTemp: 215, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24 }),
  createPreset({ id: 'preset-7', profileName: 'Prusament PETG', printerBrand: 'Prusa', manufacturer: 'Prusa', brand: 'Prusament', filamentType: 'PETG', nozzleTemp: 240, bedTemp: 85, maxVolumetricSpeed: 12, fanSpeedMin: 30, fanSpeedMax: 50, density: 1.27, dryingTemp: 65, dryingTime: '4h' }),
  createPreset({ id: 'preset-8', profileName: 'Prusament ASA', printerBrand: 'Prusa', manufacturer: 'Prusa', brand: 'Prusament', filamentType: 'ASA', nozzleTemp: 260, bedTemp: 105, maxVolumetricSpeed: 12, fanSpeedMin: 0, fanSpeedMax: 20, density: 1.07, dryingTemp: 80, dryingTime: '4h' }),
  createPreset({ id: 'prusa-pc', profileName: 'Prusament PC Blend', printerBrand: 'Prusa', manufacturer: 'Prusa', brand: 'Prusament', filamentType: 'PC', nozzleTemp: 275, bedTemp: 110, maxVolumetricSpeed: 10, fanSpeedMin: 0, fanSpeedMax: 0, density: 1.22, dryingTemp: 90, dryingTime: '6h', notes: "Requires Glue Stick/Separator. Magigoo recommended." }),
  createPreset({ id: 'prusa-pvb', profileName: 'Prusament PVB', printerBrand: 'Prusa', manufacturer: 'Prusa', brand: 'Prusament', filamentType: 'Other', nozzleTemp: 215, bedTemp: 75, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.09, dryingTemp: 50, dryingTime: '4h', notes: "IPA Smoothable filament." }),

  // Recreus (Filaflex - Official TDS)
  createPreset({ id: 'rec-1', profileName: 'Recreus Filaflex 82A', printerBrand: 'Other', manufacturer: 'Recreus', brand: 'Filaflex', filamentType: 'TPU', nozzleTemp: 230, bedTemp: 40, maxVolumetricSpeed: 3, fanSpeedMin: 80, fanSpeedMax: 100, density: 1.20, retractionDistance: 2, retractionSpeed: 30, notes: "The original elastic filament. Slow print speed (20-40mm/s). Loosen extruder tension." }),
  createPreset({ id: 'rec-2', profileName: 'Recreus Filaflex 95A', printerBrand: 'Other', manufacturer: 'Recreus', brand: 'Filaflex', filamentType: 'TPU', nozzleTemp: 230, bedTemp: 50, maxVolumetricSpeed: 5, fanSpeedMin: 80, fanSpeedMax: 100, density: 1.21, notes: "Medium-flexibility. Easier to print than 82A. Compatible with most bowden extruders." }),
  createPreset({ id: 'rec-3', profileName: 'Recreus Filaflex 70A', printerBrand: 'Other', manufacturer: 'Recreus', brand: 'Filaflex', filamentType: 'TPU', nozzleTemp: 235, bedTemp: 40, maxVolumetricSpeed: 2, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.20, retractionDistance: 0, retractionSpeed: 0, notes: "Ultra-Soft. Direct Drive ONLY. VERY slow speed required (15-20mm/s)." }),
  createPreset({ id: 'rec-4', profileName: 'Recreus Filaflex 60A PRO', printerBrand: 'Other', manufacturer: 'Recreus', brand: 'Filaflex', filamentType: 'TPU', nozzleTemp: 240, bedTemp: 40, maxVolumetricSpeed: 1.5, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.17, retractionDistance: 0, retractionSpeed: 0, notes: "Extremely soft. For pro users. Direct Drive mandatory. Disable retraction." }),
  createPreset({ id: 'rec-5', profileName: 'Recreus PLA Purifier', printerBrand: 'Other', manufacturer: 'Recreus', brand: 'Purifier', filamentType: 'PLA', nozzleTemp: 215, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "Matte finish. Contains catalyst to mineralize gases." }),

  // TechInit (Official / Technical Specs)
  createPreset({ id: 'techinit-1', profileName: 'TechInit Carbon PA', printerBrand: 'Other', manufacturer: 'TechInit', brand: 'Carbon', filamentType: 'PA-CF', nozzleTemp: 260, bedTemp: 100, maxVolumetricSpeed: 10, fanSpeedMin: 0, fanSpeedMax: 0, density: 1.18, dryingTemp: 90, dryingTime: '8h', notes: "Nylon Carbon Fiber. Hardened Nozzle required. Keep absolutely dry." }),
  createPreset({ id: 'techinit-2', profileName: 'TechInit PC-ABS', printerBrand: 'Other', manufacturer: 'TechInit', brand: 'PC-ABS', filamentType: 'ABS', nozzleTemp: 265, bedTemp: 110, maxVolumetricSpeed: 12, fanSpeedMin: 0, fanSpeedMax: 10, density: 1.10, dryingTemp: 80, dryingTime: '6h', notes: "High impact strength. Enclosure mandatory." }),
  createPreset({ id: 'techinit-3', profileName: 'TechInit ASA Tech', printerBrand: 'Other', manufacturer: 'TechInit', brand: 'ASA', filamentType: 'ASA', nozzleTemp: 255, bedTemp: 100, maxVolumetricSpeed: 14, fanSpeedMin: 0, fanSpeedMax: 20, density: 1.07, dryingTemp: 80, dryingTime: '4h', notes: "UV Resistant. Best for outdoor parts." }),
  createPreset({ id: 'techinit-4', profileName: 'TechInit PETG Technical', printerBrand: 'Other', manufacturer: 'TechInit', brand: 'PETG', filamentType: 'PETG', nozzleTemp: 245, bedTemp: 85, maxVolumetricSpeed: 12, fanSpeedMin: 30, fanSpeedMax: 60, density: 1.27, dryingTemp: 65, dryingTime: '6h', notes: "Higher temp resistance than standard PETG." }),

  // Treed Filaments (Italian Technical)
  createPreset({ id: 'treed-1', profileName: 'Treed Carbonium (PA-CF)', printerBrand: 'Other', manufacturer: 'Treed Filaments', brand: 'Carbonium', filamentType: 'PA-CF', nozzleTemp: 260, bedTemp: 110, maxVolumetricSpeed: 8, fanSpeedMin: 0, fanSpeedMax: 0, density: 1.30, dryingTemp: 100, dryingTime: '6h', notes: "Hardened nozzle mandatory. High rigidity." }),
  createPreset({ id: 'treed-2', profileName: 'Treed Kyotoflex (TPU)', printerBrand: 'Other', manufacturer: 'Treed Filaments', brand: 'Kyotoflex', filamentType: 'TPU', nozzleTemp: 230, bedTemp: 50, maxVolumetricSpeed: 4, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.21, notes: "Bio-based flexible TPE/TPU." }),
  createPreset({ id: 'treed-3', profileName: 'Treed Architectural Sand', printerBrand: 'Other', manufacturer: 'Treed Filaments', brand: 'Architectural', filamentType: 'PLA', nozzleTemp: 215, bedTemp: 60, maxVolumetricSpeed: 12, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.40, notes: "Mineral filled PLA. Stone-like finish. 0.6mm nozzle recommended." }),
  
  // 3DJake
  createPreset({ id: '3dj-1', profileName: '3DJake ecoPLA', printerBrand: 'Other', manufacturer: '3DJake', brand: 'ecoPLA', filamentType: 'PLA', nozzleTemp: 205, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24 }),
  createPreset({ id: '3dj-2', profileName: '3DJake PETG', printerBrand: 'Other', manufacturer: '3DJake', brand: 'PETG', filamentType: 'PETG', nozzleTemp: 240, bedTemp: 75, maxVolumetricSpeed: 12, fanSpeedMin: 40, fanSpeedMax: 80, density: 1.27 }),
  createPreset({ id: '3dj-3', profileName: '3DJake PCTG', printerBrand: 'Other', manufacturer: '3DJake', brand: 'PCTG', filamentType: 'Other', nozzleTemp: 260, bedTemp: 90, maxVolumetricSpeed: 12, fanSpeedMin: 20, fanSpeedMax: 50, density: 1.23, notes: "Tougher than PETG, higher clarity." }),

  // Fillamentum
  createPreset({ id: 'fill-1', profileName: 'Fillamentum PLA Extrafill', printerBrand: 'Other', manufacturer: 'Fillamentum', brand: 'Extrafill', filamentType: 'PLA', nozzleTemp: 210, bedTemp: 55, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "High visual quality PLA." }),
  createPreset({ id: 'fill-2', profileName: 'Fillamentum CPE HG100', printerBrand: 'Other', manufacturer: 'Fillamentum', brand: 'CPE', filamentType: 'Copolyester', nozzleTemp: 265, bedTemp: 85, maxVolumetricSpeed: 10, fanSpeedMin: 20, fanSpeedMax: 50, density: 1.26, dryingTemp: 70, dryingTime: '4h', notes: "Enhanced PETG-like material." }),
  createPreset({ id: 'fill-3', profileName: 'Fillamentum Timberfill', printerBrand: 'Other', manufacturer: 'Fillamentum', brand: 'Timberfill', filamentType: 'PLA', nozzleTemp: 180, bedTemp: 55, maxVolumetricSpeed: 8, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.28, notes: "Wood composite. Print cool (170-190°C) for best wood effect. 0.5mm+ nozzle." }),

  // Fiberlogy
  createPreset({ id: 'fiber-1', profileName: 'Fiberlogy Easy PLA', printerBrand: 'Other', manufacturer: 'Fiberlogy', brand: 'Easy PLA', filamentType: 'PLA', nozzleTemp: 215, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24 }),
  createPreset({ id: 'fiber-2', profileName: 'Fiberlogy FiberSilk', printerBrand: 'Other', manufacturer: 'Fiberlogy', brand: 'FiberSilk', filamentType: 'PLA', nozzleTemp: 220, bedTemp: 60, maxVolumetricSpeed: 14, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "Metallic silk finish. High gloss." }),
  createPreset({ id: 'fiber-3', profileName: 'Fiberlogy PA12-CF15', printerBrand: 'Other', manufacturer: 'Fiberlogy', brand: 'PA12-CF', filamentType: 'PA-CF', nozzleTemp: 265, bedTemp: 100, maxVolumetricSpeed: 10, fanSpeedMin: 0, fanSpeedMax: 0, density: 1.15, dryingTemp: 100, dryingTime: '6h', notes: "Nylon + 15% Carbon Fiber. Hardened nozzle required." }),

  // GST3D
  createPreset({ id: 'gst-1', profileName: 'GST3D PLA+', printerBrand: 'Other', manufacturer: 'GST3D', brand: 'PLA+', filamentType: 'PLA', nozzleTemp: 210, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "Budget friendly PLA+." }),
  createPreset({ id: 'gst-2', profileName: 'GST3D PETG', printerBrand: 'Other', manufacturer: 'GST3D', brand: 'PETG', filamentType: 'PETG', nozzleTemp: 240, bedTemp: 80, maxVolumetricSpeed: 12, fanSpeedMin: 40, fanSpeedMax: 80, density: 1.27 }),
  createPreset({ id: 'gst-3', profileName: 'GST3D TPU', printerBrand: 'Other', manufacturer: 'GST3D', brand: 'TPU', filamentType: 'TPU', nozzleTemp: 230, bedTemp: 60, maxVolumetricSpeed: 4, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.21 }),

  // Elegoo (Official Specs)
  createPreset({ id: 'elegoo-1', profileName: 'Elegoo PLA', printerBrand: 'Elegoo', manufacturer: 'Elegoo', brand: 'PLA', filamentType: 'PLA', nozzleTemp: 210, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "Official range: 205-230°C" }),
  createPreset({ id: 'elegoo-2', profileName: 'Elegoo Rapid PLA+', printerBrand: 'Elegoo', manufacturer: 'Elegoo', brand: 'Rapid PLA+', filamentType: 'PLA', nozzleTemp: 220, bedTemp: 60, maxVolumetricSpeed: 24, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.25, notes: "Designed for high speed printing (Neptune 4 series)." }),
  createPreset({ id: 'elegoo-3', profileName: 'Elegoo PETG', printerBrand: 'Elegoo', manufacturer: 'Elegoo', brand: 'PETG', filamentType: 'PETG', nozzleTemp: 240, bedTemp: 75, maxVolumetricSpeed: 15, fanSpeedMin: 30, fanSpeedMax: 80, density: 1.27, dryingTemp: 65, dryingTime: '4h' }),
  createPreset({ id: 'elegoo-4', profileName: 'Elegoo ABS-Like', printerBrand: 'Elegoo', manufacturer: 'Elegoo', brand: 'ABS-Like', filamentType: 'ABS', nozzleTemp: 250, bedTemp: 95, maxVolumetricSpeed: 16, fanSpeedMin: 0, fanSpeedMax: 30, density: 1.06, notes: "Less odor than standard ABS." }),
  createPreset({ id: 'elegoo-5', profileName: 'Elegoo TPU 95A', printerBrand: 'Elegoo', manufacturer: 'Elegoo', brand: 'TPU', filamentType: 'TPU', nozzleTemp: 220, bedTemp: 50, maxVolumetricSpeed: 4, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.21 }),

  // Anycubic (Official Specs)
  createPreset({ id: 'any-1', profileName: 'Anycubic PLA', printerBrand: 'Anycubic', manufacturer: 'Anycubic', brand: 'PLA', filamentType: 'PLA', nozzleTemp: 200, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "Official range: 190-230°C" }),
  createPreset({ id: 'any-2', profileName: 'Anycubic High Speed PLA', printerBrand: 'Anycubic', manufacturer: 'Anycubic', brand: 'High Speed PLA', filamentType: 'PLA', nozzleTemp: 215, bedTemp: 60, maxVolumetricSpeed: 25, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "Optimized for Kobra 2/3 Series." }),
  createPreset({ id: 'any-3', profileName: 'Anycubic PETG', printerBrand: 'Anycubic', manufacturer: 'Anycubic', brand: 'PETG', filamentType: 'PETG', nozzleTemp: 230, bedTemp: 80, maxVolumetricSpeed: 12, fanSpeedMin: 40, fanSpeedMax: 80, density: 1.27, dryingTemp: 65, dryingTime: '4h' }),
  createPreset({ id: 'any-4', profileName: 'Anycubic ABS+', printerBrand: 'Anycubic', manufacturer: 'Anycubic', brand: 'ABS+', filamentType: 'ABS', nozzleTemp: 245, bedTemp: 90, maxVolumetricSpeed: 15, fanSpeedMin: 0, fanSpeedMax: 30, density: 1.04, notes: "Recommended enclosure." }),
  createPreset({ id: 'any-5', profileName: 'Anycubic TPU', printerBrand: 'Anycubic', manufacturer: 'Anycubic', brand: 'TPU', filamentType: 'TPU', nozzleTemp: 220, bedTemp: 60, maxVolumetricSpeed: 3.5, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.20 }),

  // Qidi Tech (Engineering & Standard)
  createPreset({ id: 'qidi-1', profileName: 'Qidi PLA Rapido', printerBrand: 'Other', manufacturer: 'Qidi Tech', brand: 'Rapido', filamentType: 'PLA', nozzleTemp: 220, bedTemp: 60, maxVolumetricSpeed: 22, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "High flow PLA for X-Max/Plus/Smart 3 series." }),
  createPreset({ id: 'qidi-2', profileName: 'Qidi ABS-GF25', printerBrand: 'Other', manufacturer: 'Qidi Tech', brand: 'ABS-GF25', filamentType: 'ABS', nozzleTemp: 260, bedTemp: 100, maxVolumetricSpeed: 16, fanSpeedMin: 0, fanSpeedMax: 20, density: 1.15, dryingTemp: 70, dryingTime: '8h', notes: "Glass Fiber reinforced ABS. Hardened nozzle required. 250-270°C." }),
  createPreset({ id: 'qidi-3', profileName: 'Qidi PA12-CF', printerBrand: 'Other', manufacturer: 'Qidi Tech', brand: 'PA12-CF', filamentType: 'PA-CF', nozzleTemp: 285, bedTemp: 80, maxVolumetricSpeed: 12, fanSpeedMin: 0, fanSpeedMax: 0, density: 1.20, dryingTemp: 90, dryingTime: '12h', notes: "Carbon Fiber Nylon. Hardened nozzle, drybox active printing required." }),
  createPreset({ id: 'qidi-4', profileName: 'Qidi PETG-Tough', printerBrand: 'Other', manufacturer: 'Qidi Tech', brand: 'PETG-Tough', filamentType: 'PETG', nozzleTemp: 240, bedTemp: 80, maxVolumetricSpeed: 14, fanSpeedMin: 30, fanSpeedMax: 60, density: 1.27 }),

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

  // Eryone Additions
  createPreset({ id: 'ery-1', profileName: 'Eryone PLA', printerBrand: 'Other', manufacturer: 'Eryone', brand: 'PLA', filamentType: 'PLA', nozzleTemp: 205, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "Standard PLA, easy to print." }),
  createPreset({ id: 'ery-2', profileName: 'Eryone PETG', printerBrand: 'Other', manufacturer: 'Eryone', brand: 'PETG', filamentType: 'PETG', nozzleTemp: 235, bedTemp: 75, maxVolumetricSpeed: 12, fanSpeedMin: 30, fanSpeedMax: 50, density: 1.27, dryingTemp: 65, dryingTime: '4h', notes: "Good adhesion, less warping." }),
  createPreset({ id: 'ery-3', profileName: 'Eryone Silk PLA', printerBrand: 'Other', manufacturer: 'Eryone', brand: 'Silk PLA', filamentType: 'PLA', nozzleTemp: 210, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "Shiny metallic finish, high layer bonding." }),
  createPreset({ id: 'ery-4', profileName: 'Eryone Matte PLA', printerBrand: 'Other', manufacturer: 'Eryone', brand: 'Matte PLA', filamentType: 'PLA', nozzleTemp: 205, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "Non-glossy finish, hides layer lines well." }),
  createPreset({ id: 'ery-5', profileName: 'Eryone TPU', printerBrand: 'Other', manufacturer: 'Eryone', brand: 'TPU', filamentType: 'TPU', nozzleTemp: 210, bedTemp: 50, maxVolumetricSpeed: 3, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.21, retractionDistance: 2.0, retractionSpeed: 30, notes: "Flexible filament, print slow." }),

  // GratKit Additions
  createPreset({ id: 'gk-1', profileName: 'GratKit PLA', printerBrand: 'Other', manufacturer: 'GratKit', brand: 'PLA', filamentType: 'PLA', nozzleTemp: 200, bedTemp: 55, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "Official Nozzle: 190-220°C, Bed: 50-60°C." }),
  createPreset({ id: 'gk-2', profileName: 'GratKit PLA+', printerBrand: 'Other', manufacturer: 'GratKit', brand: 'PLA+', filamentType: 'PLA', nozzleTemp: 215, bedTemp: 55, maxVolumetricSpeed: 16, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "Official Nozzle: 200-230°C, Bed: 50-60°C. High toughness." }),
  createPreset({ id: 'gk-3', profileName: 'GratKit PETG', printerBrand: 'Other', manufacturer: 'GratKit', brand: 'PETG', filamentType: 'PETG', nozzleTemp: 235, bedTemp: 75, maxVolumetricSpeed: 12, fanSpeedMin: 30, fanSpeedMax: 50, density: 1.27, dryingTemp: 65, dryingTime: '4h', notes: "Official Nozzle: 220-250°C, Bed: 70-80°C." }),
  createPreset({ id: 'gk-4', profileName: 'GratKit ABS', printerBrand: 'Other', manufacturer: 'GratKit', brand: 'ABS', filamentType: 'ABS', nozzleTemp: 250, bedTemp: 100, maxVolumetricSpeed: 15, fanSpeedMin: 0, fanSpeedMax: 20, density: 1.04, dryingTemp: 80, dryingTime: '4h', notes: "Official Nozzle: 240-260°C, Bed: 90-110°C. Low warping formula." }),
  createPreset({ id: 'gk-5', profileName: 'GratKit TPU 95A', printerBrand: 'Other', manufacturer: 'GratKit', brand: 'TPU', filamentType: 'TPU', nozzleTemp: 215, bedTemp: 55, maxVolumetricSpeed: 3.5, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.21, retractionDistance: 0, retractionSpeed: 0, notes: "Official Nozzle: 200-230°C, Bed: 50-60°C. Recommend direct drive." }),
  createPreset({ id: 'gk-6', profileName: 'GratKit Silk PLA', printerBrand: 'Other', manufacturer: 'GratKit', brand: 'Silk PLA', filamentType: 'PLA', nozzleTemp: 210, bedTemp: 55, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "Official Nozzle: 200-220°C. High luster finish." }),
  createPreset({ id: 'gk-7', profileName: 'GratKit Wood PLA', printerBrand: 'Other', manufacturer: 'GratKit', brand: 'Wood', filamentType: 'PLA', nozzleTemp: 205, bedTemp: 55, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "Official Nozzle: 190-220°C. Real wood texture." }),

  // JAYO Additions
  createPreset({ id: 'jayo-1', profileName: 'JAYO PLA', printerBrand: 'Other', manufacturer: 'JAYO', brand: 'PLA', filamentType: 'PLA', nozzleTemp: 210, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "Similar to Sunlu PLA. Easy printing." }),
  createPreset({ id: 'jayo-2', profileName: 'JAYO PLA+', printerBrand: 'Other', manufacturer: 'JAYO', brand: 'PLA+', filamentType: 'PLA', nozzleTemp: 215, bedTemp: 65, maxVolumetricSpeed: 16, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "High toughness PLA." }),
  createPreset({ id: 'jayo-3', profileName: 'JAYO PETG', printerBrand: 'Other', manufacturer: 'JAYO', brand: 'PETG', filamentType: 'PETG', nozzleTemp: 235, bedTemp: 75, maxVolumetricSpeed: 12, fanSpeedMin: 30, fanSpeedMax: 50, density: 1.27, dryingTemp: 65, dryingTime: '4h', notes: "Low warping, high temp resistance." }),
  createPreset({ id: 'jayo-4', profileName: 'JAYO ABS', printerBrand: 'Other', manufacturer: 'JAYO', brand: 'ABS', filamentType: 'ABS', nozzleTemp: 255, bedTemp: 100, maxVolumetricSpeed: 15, fanSpeedMin: 0, fanSpeedMax: 20, density: 1.04, dryingTemp: 80, dryingTime: '4h', notes: "Enclosure recommended." }),
  createPreset({ id: 'jayo-5', profileName: 'JAYO Silk PLA', printerBrand: 'Other', manufacturer: 'JAYO', brand: 'Silk', filamentType: 'PLA', nozzleTemp: 215, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "High gloss finish." }),
  createPreset({ id: 'jayo-6', profileName: 'JAYO Matte PLA', printerBrand: 'Other', manufacturer: 'JAYO', brand: 'Matte', filamentType: 'PLA', nozzleTemp: 210, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "Matte finish." }),

  // JAMG HE Additions (Official Datasheet)
  createPreset({ id: 'jam-1', profileName: 'JAMG HE PLA', printerBrand: 'Other', manufacturer: 'JAMG HE', brand: 'PLA', filamentType: 'PLA', nozzleTemp: 210, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "Official Nozzle: 200-230°C, Bed: 50-60°C. Standard PLA." }),
  createPreset({ id: 'jam-2', profileName: 'JAMG HE PLA+', printerBrand: 'Other', manufacturer: 'JAMG HE', brand: 'PLA+', filamentType: 'PLA', nozzleTemp: 215, bedTemp: 60, maxVolumetricSpeed: 16, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "Official Nozzle: 210-240°C, Bed: 50-60°C. High toughness." }),
  createPreset({ id: 'jam-3', profileName: 'JAMG HE PETG', printerBrand: 'Other', manufacturer: 'JAMG HE', brand: 'PETG', filamentType: 'PETG', nozzleTemp: 240, bedTemp: 80, maxVolumetricSpeed: 12, fanSpeedMin: 30, fanSpeedMax: 50, density: 1.27, dryingTemp: 65, dryingTime: '4h', notes: "Official Nozzle: 230-260°C, Bed: 70-80°C." }),
  createPreset({ id: 'jam-4', profileName: 'JAMG HE ABS', printerBrand: 'Other', manufacturer: 'JAMG HE', brand: 'ABS', filamentType: 'ABS', nozzleTemp: 250, bedTemp: 100, maxVolumetricSpeed: 15, fanSpeedMin: 0, fanSpeedMax: 20, density: 1.04, dryingTemp: 80, dryingTime: '4h', notes: "Official Nozzle: 240-270°C, Bed: 80-110°C." }),
  createPreset({ id: 'jam-5', profileName: 'JAMG HE ASA', printerBrand: 'Other', manufacturer: 'JAMG HE', brand: 'ASA', filamentType: 'ASA', nozzleTemp: 250, bedTemp: 100, maxVolumetricSpeed: 15, fanSpeedMin: 0, fanSpeedMax: 20, density: 1.07, dryingTemp: 80, dryingTime: '4h', notes: "Official Nozzle: 240-270°C, Bed: 90-110°C. Weather resistant." }),
  createPreset({ id: 'jam-6', profileName: 'JAMG HE TPU', printerBrand: 'Other', manufacturer: 'JAMG HE', brand: 'TPU', filamentType: 'TPU', nozzleTemp: 215, bedTemp: 55, maxVolumetricSpeed: 3.5, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.21, notes: "Official Nozzle: 200-230°C, Bed: 50-60°C. Flexible." }),
  createPreset({ id: 'jam-7', profileName: 'JAMG HE Silk PLA', printerBrand: 'Other', manufacturer: 'JAMG HE', brand: 'Silk', filamentType: 'PLA', nozzleTemp: 210, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "Official Nozzle: 200-230°C. Shiny finish." }),
  createPreset({ id: 'jam-8', profileName: 'JAMG HE Wood PLA', printerBrand: 'Other', manufacturer: 'JAMG HE', brand: 'Wood', filamentType: 'PLA', nozzleTemp: 200, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "Official Nozzle: 190-220°C. Contains wood powder." }),
  createPreset({ id: 'jam-9', profileName: 'JAMG HE Marble PLA', printerBrand: 'Other', manufacturer: 'JAMG HE', brand: 'Marble', filamentType: 'PLA', nozzleTemp: 210, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "Official Nozzle: 200-230°C. Stone texture." }),


  // Sunlu (Updated from Official Datasheet)
  createPreset({ id: 'preset-13', profileName: 'Sunlu PLA', printerBrand: 'Other', manufacturer: 'Sunlu', brand: 'PLA', filamentType: 'PLA', nozzleTemp: 205, bedTemp: 55, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "Official Nozzle: 200-210°C, Bed: 50-60°C" }),
  createPreset({ id: 'preset-14', profileName: 'Sunlu PETG', printerBrand: 'Other', manufacturer: 'Sunlu', brand: 'PETG', filamentType: 'PETG', nozzleTemp: 235, bedTemp: 80, maxVolumetricSpeed: 12, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.27, dryingTemp: 65, dryingTime: '4h', notes: "Official Nozzle: 230-240°C, Bed: 75-85°C. High fan recommended by manufacturer." }),
  createPreset({ id: 'sunlu-1', profileName: 'Sunlu ABS', printerBrand: 'Other', manufacturer: 'Sunlu', brand: 'ABS', filamentType: 'ABS', nozzleTemp: 255, bedTemp: 90, maxVolumetricSpeed: 15, fanSpeedMin: 0, fanSpeedMax: 20, density: 1.04, dryingTemp: 80, dryingTime: '4h', notes: "Official Nozzle: 250-260°C, Bed: 80-100°C. Fan off." }),
  createPreset({ id: 'sunlu-2', profileName: 'Sunlu ASA', printerBrand: 'Other', manufacturer: 'Sunlu', brand: 'ASA', filamentType: 'ASA', nozzleTemp: 260, bedTemp: 85, maxVolumetricSpeed: 15, fanSpeedMin: 0, fanSpeedMax: 20, density: 1.07, dryingTemp: 80, dryingTime: '4h', notes: "Official Nozzle: 255-265°C, Bed: 75-95°C. UV resistant." }),
  createPreset({ id: 'sunlu-3', profileName: 'Sunlu PLA+', printerBrand: 'Other', manufacturer: 'Sunlu', brand: 'PLA+', filamentType: 'PLA', nozzleTemp: 220, bedTemp: 60, maxVolumetricSpeed: 16, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "Official Nozzle: 210-235°C, Bed: 55-65°C. Stronger than PLA." }),
  createPreset({ id: 'sunlu-4', profileName: 'Sunlu PLA Meta', printerBrand: 'Other', manufacturer: 'Sunlu', brand: 'PLA Meta', filamentType: 'PLA', nozzleTemp: 190, bedTemp: 55, maxVolumetricSpeed: 18, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "Official Nozzle: 185-195°C. High flow, low temp PLA." }),
  createPreset({ id: 'sunlu-5', profileName: 'Sunlu High Speed PLA', printerBrand: 'Other', manufacturer: 'Sunlu', brand: 'High Speed PLA', filamentType: 'PLA', nozzleTemp: 220, bedTemp: 55, maxVolumetricSpeed: 24, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "Official Nozzle: 210-230°C. Designed for fast printing." }),
  createPreset({ id: 'sunlu-6', profileName: 'Sunlu Silk PLA+', printerBrand: 'Other', manufacturer: 'Sunlu', brand: 'Silk PLA+', filamentType: 'PLA', nozzleTemp: 210, bedTemp: 55, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "Official Nozzle: 205-215°C. Shiny finish." }),
  createPreset({ id: 'sunlu-7', profileName: 'Sunlu Matte PLA', printerBrand: 'Other', manufacturer: 'Sunlu', brand: 'Matte PLA', filamentType: 'PLA', nozzleTemp: 210, bedTemp: 55, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "Official Nozzle: 205-215°C. Matte finish." }),
  createPreset({ id: 'sunlu-8', profileName: 'Sunlu Wood PLA', printerBrand: 'Other', manufacturer: 'Sunlu', brand: 'Wood PLA', filamentType: 'PLA', nozzleTemp: 210, bedTemp: 55, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "Official Nozzle: 205-215°C. Contains wood fibers." }),
  createPreset({ id: 'sunlu-9', profileName: 'Sunlu PLA-CF', printerBrand: 'Other', manufacturer: 'Sunlu', brand: 'PLA-CF', filamentType: 'PLA', nozzleTemp: 210, bedTemp: 55, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "Official Nozzle: 205-215°C. Carbon Fiber reinforced. Use hardened nozzle." }),
  createPreset({ id: 'sunlu-10', profileName: 'Sunlu TPU', printerBrand: 'Other', manufacturer: 'Sunlu', brand: 'TPU', filamentType: 'TPU', nozzleTemp: 205, bedTemp: 55, maxVolumetricSpeed: 4, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.21, notes: "Official Nozzle: 200-210°C. Flexible." }),
  createPreset({ id: 'sunlu-11', profileName: 'Sunlu Easy PA (Nylon)', printerBrand: 'Other', manufacturer: 'Sunlu', brand: 'Easy PA', filamentType: 'Nylon', nozzleTemp: 260, bedTemp: 65, maxVolumetricSpeed: 10, fanSpeedMin: 0, fanSpeedMax: 0, density: 1.15, dryingTemp: 80, dryingTime: '12h', notes: "Official Nozzle: 255-265°C, Bed: 60-70°C. Requires drying." }),

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
