
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

// Mapping from UI model names to Official Slicer Internal Names
export const BAMBU_PRINTER_MAP: Record<string, string> = {
    'Generic': 'Bambu Lab P1P', // Fallback
    'X1C': 'Bambu Lab X1 Carbon',
    'X1E': 'Bambu Lab X1E',
    'P1S': 'Bambu Lab P1S',
    'P1P': 'Bambu Lab P1P',
    'A1': 'Bambu Lab A1',
    'A1 Mini': 'Bambu Lab A1 Mini'
};

export const NOZZLE_DIAMETERS = [0.2, 0.4, 0.6, 0.8];

export const FILAMENT_MANUFACTURERS: string[] = [
  '3DJake', '3DQF', '3DTrček', '3DXTech', 'AddNorth', 'Amolen', 'Anycubic', 'Arianeplast', 'Atomic Filament', 'AzureFilm', 'Bambu Lab', 'BASF Forward AM', 'BCN3D', 'BIQU', 'CC3D', 'Cliever', 'Conjure', 'ColorFabb', 'Creality', 'Deeplee', 'Devil Design', 'Dikale', 'DSM Novamid', 'Duramic 3D', 'Essentium', 'EUMAKERS', 'Elegoo', 'Eryone', 'eSUN', 'Extrudr', 'FiberForce', 'Fiberlogy', 'FilaCube', 'Filamentive', 'Filamentum', 'Fillamentum', 'FiloAlfa', 'FlashForge', 'FormFutura', 'Francofil', 'Fusion Filaments', 'GST3D', 'Geeetech', 'GiantArm', 'GratKit', 'HZST3D', 'Hatchbox', 'IGUS', 'IIID MAX', 'Inland', 'Innofil3D', 'JAMG HE', 'JAYO', 'Jessie', 'Kaige', 'Kexcelled', 'Kimya (Armor)', 'Kingroon', 'MakeShaper', 'MatterHackers', 'Microzey', 'NEVSBYE', 'Nanovia', 'NinjaTek', 'Numakers', 'Overture', 'Paramount 3D', 'Polymaker', 'Porima', 'Priline', 'PrintaMent', 'Printologist', 'Proto-pasta', 'Prusa', 'Qidi Tech', 'R3D', 'Raise3D', 'Real Filament', 'Recreus', 'Rosa3D', 'SainSmart', 'Sakata 3D', 'Siraya Tech', 'Smart Materials 3D', 'Soleiyn', 'Sovol', 'Spectrum Filaments', 'SpiderMaker', 'Stratasys', 'Sunlu', 'TECBears', 'Taulman3D', 'TechInit', 'Tianse', 'Tinmorry', 'Torupy', 'Treed Filaments', 'Tronxy', 'Ultimaker', 'Verbatim', 'VoxelPLA', 'Voxelab', 'Winkle', 'XSTRAND (OwensCorning)', 'XYZprinting', 'Yousu', 'Ziro', 'Zortrax', 'Other'
].sort();


export const FILAMENT_TYPES: FilamentType[] = [
  'PLA', 'ABS', 'PETG', 'TPU', 'ASA', 'PC', 'PA-CF', 'PA-GF', 'Copolyester', 'PETT', 'Nylon', 'TPE', 'PEBA', 'Other'
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
        filamentCost: 25,
        notes: GENERIC_NOTE,
        // Defaults for new fields if not provided
        nozzleTempInitial: base.nozzleTemp + 5,
        bedTempInitial: base.bedTemp,
        maxVolumetricSpeed: base.filamentType === 'TPU' || base.filamentType === 'TPE' || base.filamentType === 'PEBA' ? 3 : (base.filamentType === 'PLA' ? 15 : 10),
        fanSpeedMin: base.filamentType === 'ABS' || base.filamentType === 'ASA' || base.filamentType === 'PC' || base.filamentType === 'Nylon' || base.filamentType === 'PA-CF' || base.filamentType === 'PA-GF' ? 0 : 100,
        fanSpeedMax: base.filamentType === 'ABS' || base.filamentType === 'ASA' || base.filamentType === 'PC' || base.filamentType === 'Nylon' || base.filamentType === 'PA-CF' || base.filamentType === 'PA-GF' ? 20 : 100,
        ...base
    } as FilamentProfile;
};

export const PRESET_PROFILES: FilamentProfile[] = [
  // 3DJake
  createPreset({ id: '3dj-1', profileName: '3DJake ecoPLA', printerBrand: 'Other', manufacturer: '3DJake', brand: 'ecoPLA', filamentType: 'PLA', nozzleTemp: 205, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24 }),
  createPreset({ id: '3dj-2', profileName: '3DJake PETG', printerBrand: 'Other', manufacturer: '3DJake', brand: 'PETG', filamentType: 'PETG', nozzleTemp: 240, bedTemp: 75, maxVolumetricSpeed: 12, fanSpeedMin: 40, fanSpeedMax: 80, density: 1.27 }),
  createPreset({ id: '3dj-3', profileName: '3DJake PCTG', printerBrand: 'Other', manufacturer: '3DJake', brand: 'PCTG', filamentType: 'Other', nozzleTemp: 260, bedTemp: 90, maxVolumetricSpeed: 12, fanSpeedMin: 20, fanSpeedMax: 50, density: 1.23, notes: "Tougher than PETG, higher clarity." }),
  createPreset({ id: '3dj-4', profileName: '3DJake TPU A95', printerBrand: 'Other', manufacturer: '3DJake', brand: 'TPU', filamentType: 'TPU', nozzleTemp: 225, bedTemp: 50, maxVolumetricSpeed: 4, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.21 }),
  createPreset({ id: '3dj-5', profileName: '3DJake niceABS', printerBrand: 'Other', manufacturer: '3DJake', brand: 'niceABS', filamentType: 'ABS', nozzleTemp: 245, bedTemp: 100, maxVolumetricSpeed: 14, fanSpeedMin: 0, fanSpeedMax: 15, density: 1.04 }),
  createPreset({ id: '3dj-6', profileName: '3DJake ASA', printerBrand: 'Other', manufacturer: '3DJake', brand: 'ASA', filamentType: 'ASA', nozzleTemp: 250, bedTemp: 95, maxVolumetricSpeed: 14, fanSpeedMin: 0, fanSpeedMax: 15, density: 1.07 }),

  // 3DQF (UK)
  createPreset({ id: '3dqf-1', profileName: '3DQF PLA', printerBrand: 'Other', manufacturer: '3DQF', brand: 'PLA', filamentType: 'PLA', nozzleTemp: 210, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "UK Made PLA." }),
  createPreset({ id: '3dqf-2', profileName: '3DQF PETG', printerBrand: 'Other', manufacturer: '3DQF', brand: 'PETG', filamentType: 'PETG', nozzleTemp: 235, bedTemp: 70, maxVolumetricSpeed: 12, fanSpeedMin: 40, fanSpeedMax: 80, density: 1.27 }),
  createPreset({ id: '3dqf-3', profileName: '3DQF ABS', printerBrand: 'Other', manufacturer: '3DQF', brand: 'ABS', filamentType: 'ABS', nozzleTemp: 245, bedTemp: 95, maxVolumetricSpeed: 15, fanSpeedMin: 0, fanSpeedMax: 20, density: 1.04 }),

  // 3DTrček (Slovenia)
  createPreset({ id: '3dt-1', profileName: '3DTrček PLA', printerBrand: 'Other', manufacturer: '3DTrček', brand: 'PLA', filamentType: 'PLA', nozzleTemp: 210, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24 }),
  createPreset({ id: '3dt-2', profileName: '3DTrček PETG', printerBrand: 'Other', manufacturer: '3DTrček', brand: 'PETG', filamentType: 'PETG', nozzleTemp: 240, bedTemp: 80, maxVolumetricSpeed: 12, fanSpeedMin: 30, fanSpeedMax: 70, density: 1.27 }),
  createPreset({ id: '3dt-3', profileName: '3DTrček ASA', printerBrand: 'Other', manufacturer: '3DTrček', brand: 'ASA', filamentType: 'ASA', nozzleTemp: 255, bedTemp: 100, maxVolumetricSpeed: 14, fanSpeedMin: 0, fanSpeedMax: 20, density: 1.07 }),

  // 3DXTech
  createPreset({ id: '3dx-1', profileName: '3DXTech CarbonX Nylon', printerBrand: 'Other', manufacturer: '3DXTech', brand: 'CarbonX', filamentType: 'PA-CF', nozzleTemp: 260, bedTemp: 80, maxVolumetricSpeed: 10, fanSpeedMin: 0, fanSpeedMax: 0, density: 1.18, dryingTemp: 90, dryingTime: '8h', notes: "High performance Carbon Nylon." }),
  createPreset({ id: '3dx-2', profileName: '3DXTech PEEK', printerBrand: 'Other', manufacturer: '3DXTech', brand: 'PEEK', filamentType: 'Other', nozzleTemp: 400, bedTemp: 130, maxVolumetricSpeed: 6, fanSpeedMin: 0, fanSpeedMax: 20, density: 1.30, dryingTemp: 120, dryingTime: '12h', notes: "Requires High Temp Printer & Heated Chamber > 80C." }),
  createPreset({ id: '3dx-3', profileName: '3DXTech CarbonX PETG', printerBrand: 'Other', manufacturer: '3DXTech', brand: 'CarbonX', filamentType: 'PETG', nozzleTemp: 245, bedTemp: 80, maxVolumetricSpeed: 10, fanSpeedMin: 0, fanSpeedMax: 30, density: 1.28, notes: "Carbon Fiber PETG. Stiff." }),
  createPreset({ id: '3dx-4', profileName: '3DXTech PEI (Ultem 1010)', printerBrand: 'Other', manufacturer: '3DXTech', brand: 'ThermaX', filamentType: 'Other', nozzleTemp: 370, bedTemp: 140, maxVolumetricSpeed: 5, fanSpeedMin: 0, fanSpeedMax: 0, density: 1.27, notes: "ULTEM 1010. Extreme heat resistance. Active chamber required." }),

  // AddNorth (Swedish)
  createPreset({ id: 'an-1', profileName: 'AddNorth E-PLA', printerBrand: 'Other', manufacturer: 'AddNorth', brand: 'E-PLA', filamentType: 'PLA', nozzleTemp: 210, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "Biodegradable standard PLA." }),
  createPreset({ id: 'an-2', profileName: 'AddNorth Textura (Matte)', printerBrand: 'Other', manufacturer: 'AddNorth', brand: 'Textura', filamentType: 'PLA', nozzleTemp: 205, bedTemp: 60, maxVolumetricSpeed: 12, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.40, notes: "Matte finish cellulose-based PLA. Hides layer lines." }),
  createPreset({ id: 'an-3', profileName: 'AddNorth Adura X (Nylon-CF)', printerBrand: 'Other', manufacturer: 'AddNorth', brand: 'Adura X', filamentType: 'PA-CF', nozzleTemp: 260, bedTemp: 60, maxVolumetricSpeed: 10, fanSpeedMin: 0, fanSpeedMax: 0, density: 1.18, dryingTemp: 100, dryingTime: '6h', notes: "Nylon + Carbon Fiber. Tough and stiff. PVA glue recommended." }),

  // Amolen
  createPreset({ id: 'amo-1', profileName: 'Amolen Silk PLA', printerBrand: 'Other', manufacturer: 'Amolen', brand: 'Silk', filamentType: 'PLA', nozzleTemp: 210, bedTemp: 60, maxVolumetricSpeed: 12, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "Shiny silk finish. Print slow for gloss." }),
  createPreset({ id: 'amo-2', profileName: 'Amolen Glow PLA', printerBrand: 'Other', manufacturer: 'Amolen', brand: 'Glow', filamentType: 'PLA', nozzleTemp: 210, bedTemp: 60, maxVolumetricSpeed: 12, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "Glow in the dark. Abrasive - use hardened nozzle." }),
  createPreset({ id: 'amo-3', profileName: 'Amolen Wood PLA', printerBrand: 'Other', manufacturer: 'Amolen', brand: 'Wood', filamentType: 'PLA', nozzleTemp: 200, bedTemp: 50, maxVolumetricSpeed: 10, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.20, notes: "Wood filled. 0.5mm+ nozzle recommended." }),

  // Anycubic
  createPreset({ id: 'any-1', profileName: 'Anycubic PLA', printerBrand: 'Anycubic', manufacturer: 'Anycubic', brand: 'PLA', filamentType: 'PLA', nozzleTemp: 200, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "Official range: 190-230°C" }),
  createPreset({ id: 'any-2', profileName: 'Anycubic High Speed PLA', printerBrand: 'Anycubic', manufacturer: 'Anycubic', brand: 'High Speed PLA', filamentType: 'PLA', nozzleTemp: 215, bedTemp: 60, maxVolumetricSpeed: 25, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "Optimized for Kobra 2/3 Series." }),
  createPreset({ id: 'any-3', profileName: 'Anycubic PETG', printerBrand: 'Anycubic', manufacturer: 'Anycubic', brand: 'PETG', filamentType: 'PETG', nozzleTemp: 230, bedTemp: 80, maxVolumetricSpeed: 12, fanSpeedMin: 40, fanSpeedMax: 80, density: 1.27, dryingTemp: 65, dryingTime: '4h' }),
  createPreset({ id: 'any-4', profileName: 'Anycubic ABS+', printerBrand: 'Anycubic', manufacturer: 'Anycubic', brand: 'ABS+', filamentType: 'ABS', nozzleTemp: 245, bedTemp: 90, maxVolumetricSpeed: 15, fanSpeedMin: 0, fanSpeedMax: 30, density: 1.04, notes: "Recommended enclosure." }),
  createPreset({ id: 'any-5', profileName: 'Anycubic TPU', printerBrand: 'Anycubic', manufacturer: 'Anycubic', brand: 'TPU', filamentType: 'TPU', nozzleTemp: 220, bedTemp: 60, maxVolumetricSpeed: 3.5, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.20 }),
  createPreset({ id: 'any-6', profileName: 'Anycubic Silk PLA', printerBrand: 'Anycubic', manufacturer: 'Anycubic', brand: 'Silk', filamentType: 'PLA', nozzleTemp: 205, bedTemp: 60, maxVolumetricSpeed: 12, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24 }),
  createPreset({ id: 'any-7', profileName: 'Anycubic Matte PLA', printerBrand: 'Anycubic', manufacturer: 'Anycubic', brand: 'Matte', filamentType: 'PLA', nozzleTemp: 205, bedTemp: 60, maxVolumetricSpeed: 14, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.28 }),

  // Arianeplast (France)
  createPreset({ id: 'ari-1', profileName: 'Arianeplast PLA Recycled', printerBrand: 'Other', manufacturer: 'Arianeplast', brand: 'Recycled', filamentType: 'PLA', nozzleTemp: 205, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24 }),
  createPreset({ id: 'ari-2', profileName: 'Arianeplast TPU', printerBrand: 'Other', manufacturer: 'Arianeplast', brand: 'TPU', filamentType: 'TPU', nozzleTemp: 225, bedTemp: 60, maxVolumetricSpeed: 4, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.21 }),

  // Atomic Filament (USA)
  createPreset({ id: 'atom-1', profileName: 'Atomic PLA', printerBrand: 'Other', manufacturer: 'Atomic Filament', brand: 'PLA', filamentType: 'PLA', nozzleTemp: 210, bedTemp: 60, maxVolumetricSpeed: 16, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "High tolerances." }),
  createPreset({ id: 'atom-2', profileName: 'Atomic PETG', printerBrand: 'Other', manufacturer: 'Atomic Filament', brand: 'PETG', filamentType: 'PETG', nozzleTemp: 245, bedTemp: 80, maxVolumetricSpeed: 13, fanSpeedMin: 30, fanSpeedMax: 60, density: 1.27 }),
  createPreset({ id: 'atom-3', profileName: 'Atomic CF PETG', printerBrand: 'Other', manufacturer: 'Atomic Filament', brand: 'CF-PETG', filamentType: 'PETG', nozzleTemp: 255, bedTemp: 80, maxVolumetricSpeed: 12, fanSpeedMin: 0, fanSpeedMax: 30, density: 1.29, notes: "Carbon Fiber PETG. Hardened nozzle." }),

  // AzureFilm (Slovenia)
  createPreset({ id: 'az-1', profileName: 'AzureFilm PLA', printerBrand: 'Other', manufacturer: 'AzureFilm', brand: 'PLA', filamentType: 'PLA', nozzleTemp: 205, bedTemp: 55, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24 }),
  createPreset({ id: 'az-2', profileName: 'AzureFilm PETG', printerBrand: 'Other', manufacturer: 'AzureFilm', brand: 'PETG', filamentType: 'PETG', nozzleTemp: 235, bedTemp: 75, maxVolumetricSpeed: 12, fanSpeedMin: 40, fanSpeedMax: 80, density: 1.27 }),
  createPreset({ id: 'az-3', profileName: 'AzureFilm PAHT-CF', printerBrand: 'Other', manufacturer: 'AzureFilm', brand: 'PAHT-CF', filamentType: 'PA-CF', nozzleTemp: 270, bedTemp: 80, maxVolumetricSpeed: 8, fanSpeedMin: 0, fanSpeedMax: 0, density: 1.20, notes: "High Temp Carbon Nylon." }),

  // Bambu Lab
  createPreset({ id: 'preset-1', profileName: 'Bambu Lab PLA Basic', printerBrand: 'Bambu Lab', manufacturer: 'Bambu Lab', brand: 'PLA Basic', filamentType: 'PLA', nozzleTemp: 220, bedTemp: 55, maxVolumetricSpeed: 21, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24 }),
  createPreset({ id: 'preset-2', profileName: 'Bambu Lab PLA Tough', printerBrand: 'Bambu Lab', manufacturer: 'Bambu Lab', brand: 'PLA Tough', filamentType: 'PLA', nozzleTemp: 220, bedTemp: 55, maxVolumetricSpeed: 22, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.25 }),
  createPreset({ id: 'preset-3', profileName: 'Bambu Lab PETG Basic', printerBrand: 'Bambu Lab', manufacturer: 'Bambu Lab', brand: 'PETG Basic', filamentType: 'PETG', nozzleTemp: 255, bedTemp: 70, maxVolumetricSpeed: 13, fanSpeedMin: 40, fanSpeedMax: 90, density: 1.27, dryingTemp: 65, dryingTime: '8h' }),
  createPreset({ id: 'preset-4', profileName: 'Bambu Lab ABS', printerBrand: 'Bambu Lab', manufacturer: 'Bambu Lab', brand: 'ABS', filamentType: 'ABS', nozzleTemp: 260, bedTemp: 90, maxVolumetricSpeed: 18, fanSpeedMin: 0, fanSpeedMax: 40, density: 1.04 }),
  createPreset({ id: 'preset-5', profileName: 'Bambu Lab TPU (Flex 95A)', printerBrand: 'Bambu Lab', manufacturer: 'Bambu Lab', brand: 'TPU 95A', filamentType: 'TPU', nozzleTemp: 230, bedTemp: 35, maxVolumetricSpeed: 3.5, fanSpeedMin: 80, fanSpeedMax: 100, density: 1.21, dryingTemp: 70, dryingTime: '12h' }),
  createPreset({ id: 'bam-6', profileName: 'Bambu Lab PLA-CF', printerBrand: 'Bambu Lab', manufacturer: 'Bambu Lab', brand: 'PLA-CF', filamentType: 'PLA', nozzleTemp: 230, bedTemp: 55, maxVolumetricSpeed: 18, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.26, notes: "Carbon Fiber PLA. Hardened Nozzle Recommended." }),
  createPreset({ id: 'bam-7', profileName: 'Bambu Lab PETG-CF', printerBrand: 'Bambu Lab', manufacturer: 'Bambu Lab', brand: 'PETG-CF', filamentType: 'PETG', nozzleTemp: 255, bedTemp: 70, maxVolumetricSpeed: 14, fanSpeedMin: 30, fanSpeedMax: 80, density: 1.29, notes: "Carbon Fiber PETG. Hardened Nozzle Recommended." }),
  createPreset({ id: 'bam-8', profileName: 'Bambu Lab PAHT-CF', printerBrand: 'Bambu Lab', manufacturer: 'Bambu Lab', brand: 'PAHT-CF', filamentType: 'PA-CF', nozzleTemp: 270, bedTemp: 90, maxVolumetricSpeed: 10, fanSpeedMin: 0, fanSpeedMax: 0, density: 1.22, dryingTemp: 80, dryingTime: '12h', notes: "High Temp Nylon Carbon. Engineering Grade." }),
  createPreset({ id: 'bam-9', profileName: 'Bambu Lab PC', printerBrand: 'Bambu Lab', manufacturer: 'Bambu Lab', brand: 'PC', filamentType: 'PC', nozzleTemp: 270, bedTemp: 110, maxVolumetricSpeed: 14, fanSpeedMin: 0, fanSpeedMax: 20, density: 1.20, notes: "Polycarbonate. Requires Glue Stick." }),
  createPreset({ id: 'bam-10', profileName: 'Bambu Lab Support W', printerBrand: 'Bambu Lab', manufacturer: 'Bambu Lab', brand: 'Support', filamentType: 'PLA', nozzleTemp: 220, bedTemp: 55, maxVolumetricSpeed: 16, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "Breakaway support for PLA." }),
  createPreset({ id: 'bam-11', profileName: 'Bambu Lab Support G', printerBrand: 'Bambu Lab', manufacturer: 'Bambu Lab', brand: 'Support', filamentType: 'Other', nozzleTemp: 255, bedTemp: 70, maxVolumetricSpeed: 14, fanSpeedMin: 50, fanSpeedMax: 100, density: 1.27, notes: "Breakaway support for PETG/PA/PC." }),
  createPreset({ id: 'bam-12', profileName: 'Bambu Lab PVA', printerBrand: 'Bambu Lab', manufacturer: 'Bambu Lab', brand: 'Support', filamentType: 'Other', nozzleTemp: 220, bedTemp: 55, maxVolumetricSpeed: 12, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.25, notes: "Water soluble support. KEEP DRY." }),

  // BASF Forward AM
  createPreset({ id: 'basf-1', profileName: 'BASF Ultrafuse PLA', printerBrand: 'Other', manufacturer: 'BASF Forward AM', brand: 'Ultrafuse', filamentType: 'PLA', nozzleTemp: 210, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24 }),
  createPreset({ id: 'basf-2', profileName: 'BASF Ultrafuse 316L', printerBrand: 'Other', manufacturer: 'BASF Forward AM', brand: 'Ultrafuse', filamentType: 'Other', nozzleTemp: 240, bedTemp: 100, maxVolumetricSpeed: 5, printSpeed: 20, fanSpeedMin: 0, fanSpeedMax: 0, density: 7.85, notes: "Metal filament. Requires sintering. Nozzle >= 0.4mm hardened. NO FAN." }),
  createPreset({ id: 'basf-3', profileName: 'BASF Ultrafuse TPU 85A', printerBrand: 'Other', manufacturer: 'BASF Forward AM', brand: 'Ultrafuse', filamentType: 'TPU', nozzleTemp: 220, bedTemp: 40, maxVolumetricSpeed: 3, fanSpeedMin: 80, fanSpeedMax: 100, density: 1.22 }),
  createPreset({ id: 'basf-4', profileName: 'BASF Ultrafuse rPET', printerBrand: 'Other', manufacturer: 'BASF Forward AM', brand: 'Ultrafuse', filamentType: 'PETG', nozzleTemp: 240, bedTemp: 70, maxVolumetricSpeed: 12, fanSpeedMin: 30, fanSpeedMax: 70, density: 1.27, notes: "Recycled PET." }),
  
  // BCN3D
  createPreset({ id: 'bcn-1', profileName: 'BCN3D PLA', printerBrand: 'Other', manufacturer: 'BCN3D', brand: 'BCN3D', filamentType: 'PLA', nozzleTemp: 205, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24 }),
  createPreset({ id: 'bcn-2', profileName: 'BCN3D PETG', printerBrand: 'Other', manufacturer: 'BCN3D', brand: 'BCN3D', filamentType: 'PETG', nozzleTemp: 240, bedTemp: 75, maxVolumetricSpeed: 12, fanSpeedMin: 40, fanSpeedMax: 80, density: 1.27 }),
  createPreset({ id: 'bcn-3', profileName: 'BCN3D ABS', printerBrand: 'Other', manufacturer: 'BCN3D', brand: 'BCN3D', filamentType: 'ABS', nozzleTemp: 245, bedTemp: 100, maxVolumetricSpeed: 15, fanSpeedMin: 0, fanSpeedMax: 20, density: 1.04 }),
  createPreset({ id: 'bcn-4', profileName: 'BCN3D TPU 98A', printerBrand: 'Other', manufacturer: 'BCN3D', brand: 'BCN3D', filamentType: 'TPU', nozzleTemp: 225, bedTemp: 55, maxVolumetricSpeed: 5, fanSpeedMin: 80, fanSpeedMax: 100, density: 1.22 }),

  // BIQU (BigTreeTech)
  createPreset({ id: 'biq-1', profileName: 'BIQU PLA Basic', printerBrand: 'Other', manufacturer: 'BIQU', brand: 'Basic', filamentType: 'PLA', nozzleTemp: 205, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24 }),
  createPreset({ id: 'biq-2', profileName: 'BIQU Matte PLA', printerBrand: 'Other', manufacturer: 'BIQU', brand: 'Matte', filamentType: 'PLA', nozzleTemp: 210, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24 }),
  createPreset({ id: 'biq-3', profileName: 'BIQU PETG', printerBrand: 'Other', manufacturer: 'BIQU', brand: 'PETG', filamentType: 'PETG', nozzleTemp: 235, bedTemp: 75, maxVolumetricSpeed: 13, fanSpeedMin: 40, fanSpeedMax: 80, density: 1.27 }),
  createPreset({ id: 'biq-4', profileName: 'BIQU Morphlex', printerBrand: 'Other', manufacturer: 'BIQU', brand: 'Morphlex', filamentType: 'TPU', nozzleTemp: 230, bedTemp: 60, maxVolumetricSpeed: 4, fanSpeedMin: 80, fanSpeedMax: 100, density: 1.18, notes: "High resilience TPE/TPU blend. Tough and flexible." }),

  // CC3D (Marketplace / Amazon)
  createPreset({ id: 'cc3d-1', profileName: 'CC3D Silk PLA', printerBrand: 'Other', manufacturer: 'CC3D', brand: 'Silk', filamentType: 'PLA', nozzleTemp: 205, bedTemp: 60, maxVolumetricSpeed: 12, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "Shiny silk. Print slightly cooler and slower for best gloss." }),
  createPreset({ id: 'cc3d-2', profileName: 'CC3D PLA+', printerBrand: 'Other', manufacturer: 'CC3D', brand: 'PLA+', filamentType: 'PLA', nozzleTemp: 215, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24 }),

  // Cliever (Italy)
  createPreset({ id: 'clv-1', profileName: 'Cliever PLA', printerBrand: 'Other', manufacturer: 'Cliever', brand: 'PLA', filamentType: 'PLA', nozzleTemp: 210, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24 }),
  createPreset({ id: 'clv-2', profileName: 'Cliever PETG', printerBrand: 'Other', manufacturer: 'Cliever', brand: 'PETG', filamentType: 'PETG', nozzleTemp: 240, bedTemp: 75, maxVolumetricSpeed: 12, fanSpeedMin: 40, fanSpeedMax: 80, density: 1.27 }),
  createPreset({ id: 'clv-3', profileName: 'Cliever ABS', printerBrand: 'Other', manufacturer: 'Cliever', brand: 'ABS', filamentType: 'ABS', nozzleTemp: 250, bedTemp: 100, maxVolumetricSpeed: 14, fanSpeedMin: 0, fanSpeedMax: 20, density: 1.04 }),

  // Conjure (Chitu Systems)
  createPreset({ id: 'con-1', profileName: 'Conjure Rigid PLA', printerBrand: 'Other', manufacturer: 'Conjure', brand: 'Rigid', filamentType: 'PLA', nozzleTemp: 210, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "High stiffness, low shrinkage. Engineering grade." }),
  createPreset({ id: 'con-2', profileName: 'Conjure Tough PLA', printerBrand: 'Other', manufacturer: 'Conjure', brand: 'Tough', filamentType: 'PLA', nozzleTemp: 220, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "High impact resistance. Non-brittle." }),
  createPreset({ id: 'con-3', profileName: 'Conjure Sculpt PLA', printerBrand: 'Other', manufacturer: 'Conjure', brand: 'Sculpt', filamentType: 'PLA', nozzleTemp: 205, bedTemp: 60, maxVolumetricSpeed: 12, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.25, notes: "Matte finish, easy to sand. Best for statues." }),
  createPreset({ id: 'con-4', profileName: 'Conjure PETG', printerBrand: 'Other', manufacturer: 'Conjure', brand: 'PETG', filamentType: 'PETG', nozzleTemp: 240, bedTemp: 80, maxVolumetricSpeed: 12, fanSpeedMin: 40, fanSpeedMax: 80, density: 1.27 }),
  createPreset({ id: 'con-5', profileName: 'Conjure TPU 95A', printerBrand: 'Other', manufacturer: 'Conjure', brand: 'TPU', filamentType: 'TPU', nozzleTemp: 220, bedTemp: 50, maxVolumetricSpeed: 4, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.21 }),

  // ColorFabb
  createPreset({ id: 'cf-1', profileName: 'ColorFabb PLA/PHA', printerBrand: 'Other', manufacturer: 'ColorFabb', brand: 'PLA/PHA', filamentType: 'PLA', nozzleTemp: 210, bedTemp: 55, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "Tougher than standard PLA." }),
  createPreset({ id: 'cf-2', profileName: 'ColorFabb nGen', printerBrand: 'Other', manufacturer: 'ColorFabb', brand: 'nGen', filamentType: 'Copolyester', nozzleTemp: 230, bedTemp: 80, maxVolumetricSpeed: 12, fanSpeedMin: 20, fanSpeedMax: 50, density: 1.20, notes: "Amphora based copolyester. Easy to print." }),
  createPreset({ id: 'cf-3', profileName: 'ColorFabb woodFill', printerBrand: 'Other', manufacturer: 'ColorFabb', brand: 'woodFill', filamentType: 'PLA', nozzleTemp: 195, bedTemp: 60, maxVolumetricSpeed: 8, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.15, notes: "70% PLA, 30% Wood. Use 0.6mm nozzle." }),
  createPreset({ id: 'cf-4', profileName: 'ColorFabb VarioShore TPU', printerBrand: 'Other', manufacturer: 'ColorFabb', brand: 'VarioShore', filamentType: 'TPU', nozzleTemp: 220, bedTemp: 60, maxVolumetricSpeed: 4, fanSpeedMin: 50, fanSpeedMax: 100, density: 1.2, notes: "Foaming TPU. Density varies with temp (190-250°C)." }),
  createPreset({ id: 'cf-5', profileName: 'ColorFabb XT', printerBrand: 'Other', manufacturer: 'ColorFabb', brand: 'XT', filamentType: 'Copolyester', nozzleTemp: 250, bedTemp: 70, maxVolumetricSpeed: 10, fanSpeedMin: 20, fanSpeedMax: 50, density: 1.20, notes: "High strength copolyester." }),
  createPreset({ id: 'cf-6', profileName: 'ColorFabb bronzeFill', printerBrand: 'Other', manufacturer: 'ColorFabb', brand: 'bronzeFill', filamentType: 'PLA', nozzleTemp: 200, bedTemp: 60, maxVolumetricSpeed: 8, fanSpeedMin: 100, fanSpeedMax: 100, density: 3.90, notes: "Metal filled. Heavy. Polishable. 0.6mm Nozzle." }),
  createPreset({ id: 'cf-7', profileName: 'ColorFabb copperFill', printerBrand: 'Other', manufacturer: 'ColorFabb', brand: 'copperFill', filamentType: 'PLA', nozzleTemp: 200, bedTemp: 60, maxVolumetricSpeed: 8, fanSpeedMin: 100, fanSpeedMax: 100, density: 4.00, notes: "Metal filled. Heavy. Polishable. 0.6mm Nozzle." }),
  createPreset({ id: 'cf-8', profileName: 'ColorFabb LW-PLA-HT', printerBrand: 'Other', manufacturer: 'ColorFabb', brand: 'LW-PLA-HT', filamentType: 'PLA', nozzleTemp: 205, bedTemp: 60, maxVolumetricSpeed: 6, fanSpeedMin: 100, fanSpeedMax: 100, density: 0.55, notes: "Lightweight Foaming High Temp. Calibrate Flow (40-60%)." }),
  createPreset({ id: 'cf-9', profileName: 'ColorFabb steelFill', printerBrand: 'Other', manufacturer: 'ColorFabb', brand: 'steelFill', filamentType: 'PLA', nozzleTemp: 200, bedTemp: 60, maxVolumetricSpeed: 8, fanSpeedMin: 100, fanSpeedMax: 100, density: 3.10, notes: "Steel filled. Magnetic & Polishable. Hardened 0.6mm Nozzle." }),
  createPreset({ id: 'cf-10', profileName: 'ColorFabb corkFill', printerBrand: 'Other', manufacturer: 'ColorFabb', brand: 'corkFill', filamentType: 'PLA', nozzleTemp: 210, bedTemp: 60, maxVolumetricSpeed: 8, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.18, notes: "Cork filled. Dark brown finish. 0.6mm Nozzle." }),
  createPreset({ id: 'cf-11', profileName: 'ColorFabb HT', printerBrand: 'Other', manufacturer: 'ColorFabb', brand: 'HT', filamentType: 'Copolyester', nozzleTemp: 260, bedTemp: 110, maxVolumetricSpeed: 10, fanSpeedMin: 20, fanSpeedMax: 50, density: 1.18, notes: "High Temp Copolyester (Amphora HT5300). Heat resistant to 100°C." }),

  // Creality
  createPreset({ id: 'cr-1', profileName: 'Creality Hyper PLA', printerBrand: 'Creality', manufacturer: 'Creality', brand: 'Hyper Series', filamentType: 'PLA', nozzleTemp: 220, bedTemp: 60, maxVolumetricSpeed: 24, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "High Flow for K1/Ender3 V3." }),
  createPreset({ id: 'cr-2', profileName: 'Creality CR-PETG', printerBrand: 'Creality', manufacturer: 'Creality', brand: 'CR-Series', filamentType: 'PETG', nozzleTemp: 240, bedTemp: 75, maxVolumetricSpeed: 12, fanSpeedMin: 30, fanSpeedMax: 60, density: 1.27 }),
  createPreset({ id: 'cr-3', profileName: 'Creality CR-ABS', printerBrand: 'Creality', manufacturer: 'Creality', brand: 'CR-Series', filamentType: 'ABS', nozzleTemp: 250, bedTemp: 100, maxVolumetricSpeed: 15, fanSpeedMin: 0, fanSpeedMax: 20, density: 1.04 }),

  // Deeplee
  createPreset({ id: 'deep-1', profileName: 'Deeplee PLA', printerBrand: 'Other', manufacturer: 'Deeplee', brand: 'PLA', filamentType: 'PLA', nozzleTemp: 205, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24 }),
  createPreset({ id: 'deep-2', profileName: 'Deeplee PETG', printerBrand: 'Other', manufacturer: 'Deeplee', brand: 'PETG', filamentType: 'PETG', nozzleTemp: 235, bedTemp: 75, maxVolumetricSpeed: 12, fanSpeedMin: 30, fanSpeedMax: 70, density: 1.27 }),
  createPreset({ id: 'deep-3', profileName: 'Deeplee Rapid PETG', printerBrand: 'Other', manufacturer: 'Deeplee', brand: 'Rapid PETG', filamentType: 'PETG', nozzleTemp: 245, bedTemp: 80, maxVolumetricSpeed: 20, fanSpeedMin: 40, fanSpeedMax: 90, density: 1.27, notes: "High Speed PETG. Increased flow rate." }),

  // Devil Design
  createPreset({ id: 'dev-1', profileName: 'Devil Design PLA', printerBrand: 'Other', manufacturer: 'Devil Design', brand: 'PLA', filamentType: 'PLA', nozzleTemp: 210, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24 }),
  createPreset({ id: 'dev-2', profileName: 'Devil Design PETG', printerBrand: 'Other', manufacturer: 'Devil Design', brand: 'PETG', filamentType: 'PETG', nozzleTemp: 235, bedTemp: 75, maxVolumetricSpeed: 12, fanSpeedMin: 40, fanSpeedMax: 80, density: 1.23 }),
  createPreset({ id: 'dev-3', profileName: 'Devil Design ASA', printerBrand: 'Other', manufacturer: 'Devil Design', brand: 'ASA', filamentType: 'ASA', nozzleTemp: 255, bedTemp: 95, maxVolumetricSpeed: 14, fanSpeedMin: 0, fanSpeedMax: 20, density: 1.07 }),

  // Dikale (Marketplace)
  createPreset({ id: 'dik-1', profileName: 'Dikale PLA', printerBrand: 'Other', manufacturer: 'Dikale', brand: 'PLA', filamentType: 'PLA', nozzleTemp: 205, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "Budget PLA." }),

  // DSM Novamid
  createPreset({ id: 'dsm-1', profileName: 'Novamid ID1030 (PA6/66)', printerBrand: 'Other', manufacturer: 'DSM Novamid', brand: 'ID1030', filamentType: 'Nylon', nozzleTemp: 260, bedTemp: 100, maxVolumetricSpeed: 10, fanSpeedMin: 0, fanSpeedMax: 0, density: 1.14, dryingTemp: 80, dryingTime: '4h', notes: "High quality Nylon blend." }),
  createPreset({ id: 'dsm-2', profileName: 'Novamid ID1030-CF10', printerBrand: 'Other', manufacturer: 'DSM Novamid', brand: 'ID1030-CF10', filamentType: 'PA-CF', nozzleTemp: 270, bedTemp: 110, maxVolumetricSpeed: 8, fanSpeedMin: 0, fanSpeedMax: 0, density: 1.17, notes: "10% Carbon Fiber Nylon." }),

  // Duramic 3D (Amazon/Marketplace)
  createPreset({ id: 'dur-1', profileName: 'Duramic PLA+', printerBrand: 'Other', manufacturer: 'Duramic 3D', brand: 'PLA+', filamentType: 'PLA', nozzleTemp: 220, bedTemp: 60, maxVolumetricSpeed: 16, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "High toughness. Prints hotter than standard PLA." }),
  createPreset({ id: 'dur-2', profileName: 'Duramic PETG', printerBrand: 'Other', manufacturer: 'Duramic 3D', brand: 'PETG', filamentType: 'PETG', nozzleTemp: 240, bedTemp: 80, maxVolumetricSpeed: 13, fanSpeedMin: 40, fanSpeedMax: 80, density: 1.27, notes: "Consistent diameter. Less stringing." }),
  createPreset({ id: 'dur-3', profileName: 'Duramic TPU 95A', printerBrand: 'Other', manufacturer: 'Duramic 3D', brand: 'TPU', filamentType: 'TPU', nozzleTemp: 225, bedTemp: 55, maxVolumetricSpeed: 4, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.21 }),

  // Elegoo
  createPreset({ id: 'elegoo-1', profileName: 'Elegoo PLA', printerBrand: 'Elegoo', manufacturer: 'Elegoo', brand: 'PLA', filamentType: 'PLA', nozzleTemp: 210, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "Official range: 205-230°C" }),
  createPreset({ id: 'elegoo-2', profileName: 'Elegoo Rapid PLA+', printerBrand: 'Elegoo', manufacturer: 'Elegoo', brand: 'Rapid PLA+', filamentType: 'PLA', nozzleTemp: 220, bedTemp: 60, maxVolumetricSpeed: 24, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.25, notes: "Designed for high speed printing (Neptune 4 series)." }),
  createPreset({ id: 'elegoo-3', profileName: 'Elegoo PETG', printerBrand: 'Elegoo', manufacturer: 'Elegoo', brand: 'PETG', filamentType: 'PETG', nozzleTemp: 240, bedTemp: 75, maxVolumetricSpeed: 12, fanSpeedMin: 30, fanSpeedMax: 70, density: 1.27 }),
  createPreset({ id: 'elegoo-4', profileName: 'Elegoo ABS', printerBrand: 'Elegoo', manufacturer: 'Elegoo', brand: 'ABS', filamentType: 'ABS', nozzleTemp: 250, bedTemp: 100, maxVolumetricSpeed: 15, fanSpeedMin: 0, fanSpeedMax: 20, density: 1.04 }),

  // Eryone (China)
  createPreset({ id: 'ery-1', profileName: 'Eryone PLA', printerBrand: 'Other', manufacturer: 'Eryone', brand: 'PLA', filamentType: 'PLA', nozzleTemp: 200, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24 }),
  createPreset({ id: 'ery-2', profileName: 'Eryone Matte PLA', printerBrand: 'Other', manufacturer: 'Eryone', brand: 'Matte', filamentType: 'PLA', nozzleTemp: 205, bedTemp: 60, maxVolumetricSpeed: 12, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.25, notes: "Matte finish. Reduce flow slightly." }),
  createPreset({ id: 'ery-3', profileName: 'Eryone Silk PLA', printerBrand: 'Other', manufacturer: 'Eryone', brand: 'Silk', filamentType: 'PLA', nozzleTemp: 210, bedTemp: 60, maxVolumetricSpeed: 12, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "High gloss. Slow down outer walls." }),
  createPreset({ id: 'ery-4', profileName: 'Eryone Galaxy PLA', printerBrand: 'Other', manufacturer: 'Eryone', brand: 'Galaxy', filamentType: 'PLA', nozzleTemp: 210, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "Glitter effect." }),
  createPreset({ id: 'ery-5', profileName: 'Eryone PETG', printerBrand: 'Other', manufacturer: 'Eryone', brand: 'PETG', filamentType: 'PETG', nozzleTemp: 235, bedTemp: 75, maxVolumetricSpeed: 12, fanSpeedMin: 30, fanSpeedMax: 70, density: 1.27 }),
  createPreset({ id: 'ery-6', profileName: 'Eryone TPU 95A', printerBrand: 'Other', manufacturer: 'Eryone', brand: 'TPU', filamentType: 'TPU', nozzleTemp: 220, bedTemp: 50, maxVolumetricSpeed: 4, fanSpeedMin: 80, fanSpeedMax: 100, density: 1.21 }),
  
  // Essentium
  createPreset({ id: 'ess-1', profileName: 'Essentium PCTG', printerBrand: 'Other', manufacturer: 'Essentium', brand: 'PCTG', filamentType: 'Other', nozzleTemp: 260, bedTemp: 80, maxVolumetricSpeed: 14, fanSpeedMin: 20, fanSpeedMax: 50, density: 1.23, notes: "Superior impact resistance to PETG. High clarity." }),
  createPreset({ id: 'ess-2', profileName: 'Essentium TPU 74D', printerBrand: 'Other', manufacturer: 'Essentium', brand: 'TPU 74D', filamentType: 'TPU', nozzleTemp: 240, bedTemp: 50, maxVolumetricSpeed: 8, fanSpeedMin: 80, fanSpeedMax: 100, density: 1.21, notes: "Semi-rigid TPU. High durability." }),

  // eSUN
  createPreset({ id: 'esun-1', profileName: 'eSUN PLA+', printerBrand: 'Other', manufacturer: 'eSUN', brand: 'PLA+', filamentType: 'PLA', nozzleTemp: 215, bedTemp: 60, maxVolumetricSpeed: 18, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "Industry standard PLA+." }),
  createPreset({ id: 'esun-2', profileName: 'eSUN PETG', printerBrand: 'Other', manufacturer: 'eSUN', brand: 'PETG', filamentType: 'PETG', nozzleTemp: 240, bedTemp: 80, maxVolumetricSpeed: 12, fanSpeedMin: 40, fanSpeedMax: 80, density: 1.27 }),
  createPreset({ id: 'esun-3', profileName: 'eSUN ePA-CF', printerBrand: 'Other', manufacturer: 'eSUN', brand: 'ePA-CF', filamentType: 'PA-CF', nozzleTemp: 260, bedTemp: 80, maxVolumetricSpeed: 8, fanSpeedMin: 0, fanSpeedMax: 0, density: 1.22, dryingTemp: 80, dryingTime: '6h', notes: "Nylon Carbon Fiber." }),
  createPreset({ id: 'esun-4', profileName: 'eSUN ePEBA-90A', printerBrand: 'Other', manufacturer: 'eSUN', brand: 'ePEBA', filamentType: 'PEBA', nozzleTemp: 230, bedTemp: 50, maxVolumetricSpeed: 4, fanSpeedMin: 80, fanSpeedMax: 100, density: 1.05, notes: "High rebound elastomer." }),
  createPreset({ id: 'esun-5', profileName: 'eSUN eSilk-PLA', printerBrand: 'Other', manufacturer: 'eSUN', brand: 'eSilk', filamentType: 'PLA', nozzleTemp: 215, bedTemp: 60, maxVolumetricSpeed: 12, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "High gloss silk finish." }),
  createPreset({ id: 'esun-6', profileName: 'eSUN eMarble', printerBrand: 'Other', manufacturer: 'eSUN', brand: 'eMarble', filamentType: 'PLA', nozzleTemp: 210, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "Marble effect." }),
  createPreset({ id: 'esun-7', profileName: 'eSUN eTwinkling', printerBrand: 'Other', manufacturer: 'eSUN', brand: 'eTwinkling', filamentType: 'PLA', nozzleTemp: 215, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "Glitter/Sparkle effect." }),

  // EUMAKERS
  createPreset({ id: 'eum-1', profileName: 'EUMAKERS PLA', printerBrand: 'Other', manufacturer: 'EUMAKERS', brand: 'PLA', filamentType: 'PLA', nozzleTemp: 215, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24 }),
  createPreset({ id: 'eum-2', profileName: 'EUMAKERS PETG', printerBrand: 'Other', manufacturer: 'EUMAKERS', brand: 'PETG', filamentType: 'PETG', nozzleTemp: 240, bedTemp: 70, maxVolumetricSpeed: 12, fanSpeedMin: 30, fanSpeedMax: 70, density: 1.27 }),

  // Extrudr
  createPreset({ id: 'ext-1', profileName: 'Extrudr XPETG Matt @Bambu Lab P1S 0.8 nozzle', printerBrand: 'Bambu Lab', printerModel: 'P1S', nozzleDiameter: 0.8, manufacturer: 'Extrudr', brand: 'XPETG', filamentType: 'PETG', nozzleTemp: 225, bedTemp: 80, maxVolumetricSpeed: 12, fanSpeedMin: 40, fanSpeedMax: 70, density: 1.41, notes: "Matte finish. Specific for 0.8mm nozzle." }),
  createPreset({ id: 'ext-2', profileName: 'Extrudr GreenTEC Pro', printerBrand: 'Other', manufacturer: 'Extrudr', brand: 'GreenTEC Pro', filamentType: 'PLA', nozzleTemp: 220, bedTemp: 60, maxVolumetricSpeed: 14, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.35, notes: "Bio-compound, heat resistant to 160°C (annealed). Tough." }),
  createPreset({ id: 'ext-3', profileName: 'Extrudr BioFusion', printerBrand: 'Other', manufacturer: 'Extrudr', brand: 'BioFusion', filamentType: 'PLA', nozzleTemp: 225, bedTemp: 65, maxVolumetricSpeed: 14, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.28, notes: "Glossy metallic look." }),
  createPreset({ id: 'ext-4', profileName: 'Extrudr PLA NX2', printerBrand: 'Other', manufacturer: 'Extrudr', brand: 'NX2', filamentType: 'PLA', nozzleTemp: 215, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "Matte finish PLA." }),
  createPreset({ id: 'ext-5', profileName: 'Extrudr DuraPro ASA', printerBrand: 'Other', manufacturer: 'Extrudr', brand: 'DuraPro', filamentType: 'ASA', nozzleTemp: 250, bedTemp: 100, maxVolumetricSpeed: 14, fanSpeedMin: 0, fanSpeedMax: 20, density: 1.07 }),
  createPreset({ id: 'ext-6', profileName: 'Extrudr Flex Medium (TPU 98A)', printerBrand: 'Other', manufacturer: 'Extrudr', brand: 'Flex Medium', filamentType: 'TPU', nozzleTemp: 230, bedTemp: 50, maxVolumetricSpeed: 5, fanSpeedMin: 80, fanSpeedMax: 100, density: 1.22 }),

  // FiberForce
  createPreset({ id: 'fiberf-1', profileName: 'FiberForce Nylforce 550', printerBrand: 'Other', manufacturer: 'FiberForce', brand: 'Nylforce', filamentType: 'Nylon', nozzleTemp: 255, bedTemp: 65, maxVolumetricSpeed: 8, fanSpeedMin: 0, fanSpeedMax: 0, density: 1.14, dryingTemp: 80, dryingTime: '6h', notes: "General purpose Nylon PA6." }),
  createPreset({ id: 'fiberf-2', profileName: 'FiberForce Nylforce Carbon Fiber', printerBrand: 'Other', manufacturer: 'FiberForce', brand: 'Nylforce CF', filamentType: 'PA-CF', nozzleTemp: 265, bedTemp: 70, maxVolumetricSpeed: 8, fanSpeedMin: 0, fanSpeedMax: 0, density: 1.24, notes: "Carbon Fiber Nylon. Stiff." }),
  createPreset({ id: 'fiberf-3', profileName: 'FiberForce Nylforce Glass Fiber', printerBrand: 'Other', manufacturer: 'FiberForce', brand: 'Nylforce GF', filamentType: 'PA-GF', nozzleTemp: 265, bedTemp: 70, maxVolumetricSpeed: 8, fanSpeedMin: 0, fanSpeedMax: 0, density: 1.30, notes: "Glass Fiber Nylon. Impact resistant." }),

  // Fiberlogy
  createPreset({ id: 'fib-1', profileName: 'Fiberlogy Easy PLA', printerBrand: 'Other', manufacturer: 'Fiberlogy', brand: 'Easy PLA', filamentType: 'PLA', nozzleTemp: 210, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24 }),
  createPreset({ id: 'fib-2', profileName: 'Fiberlogy FiberSatin', printerBrand: 'Other', manufacturer: 'Fiberlogy', brand: 'FiberSatin', filamentType: 'PLA', nozzleTemp: 210, bedTemp: 55, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "Satin matte finish." }),
  createPreset({ id: 'fib-3', profileName: 'Fiberlogy PETG+PTFE', printerBrand: 'Other', manufacturer: 'Fiberlogy', brand: 'PETG+PTFE', filamentType: 'PETG', nozzleTemp: 240, bedTemp: 80, maxVolumetricSpeed: 12, fanSpeedMin: 30, fanSpeedMax: 70, density: 1.27, notes: "Low friction tribological filament." }),
  createPreset({ id: 'fib-4', profileName: 'Fiberlogy CPE Antiseptic', printerBrand: 'Other', manufacturer: 'Fiberlogy', brand: 'CPE', filamentType: 'Copolyester', nozzleTemp: 260, bedTemp: 80, maxVolumetricSpeed: 12, fanSpeedMin: 20, fanSpeedMax: 50, density: 1.20 }),
  createPreset({ id: 'fib-5', profileName: 'Fiberlogy Impact PLA', printerBrand: 'Other', manufacturer: 'Fiberlogy', brand: 'Impact PLA', filamentType: 'PLA', nozzleTemp: 220, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "High impact resistance." }),
  createPreset({ id: 'fib-6', profileName: 'Fiberlogy Easy PETG', printerBrand: 'Other', manufacturer: 'Fiberlogy', brand: 'Easy PETG', filamentType: 'PETG', nozzleTemp: 235, bedTemp: 75, maxVolumetricSpeed: 12, fanSpeedMin: 40, fanSpeedMax: 80, density: 1.27 }),
  createPreset({ id: 'fib-7', profileName: 'Fiberlogy FiberSilk', printerBrand: 'Other', manufacturer: 'Fiberlogy', brand: 'FiberSilk', filamentType: 'PLA', nozzleTemp: 215, bedTemp: 60, maxVolumetricSpeed: 12, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "Metallic silk look." }),
  createPreset({ id: 'fib-8', profileName: 'Fiberlogy PCTG', printerBrand: 'Other', manufacturer: 'Fiberlogy', brand: 'PCTG', filamentType: 'Other', nozzleTemp: 260, bedTemp: 90, maxVolumetricSpeed: 12, fanSpeedMin: 20, fanSpeedMax: 50, density: 1.23, notes: "Higher impact than PETG." }),

  // FilaCube (USA)
  createPreset({ id: 'filac-1', profileName: 'FilaCube PLA 2', printerBrand: 'Other', manufacturer: 'FilaCube', brand: 'PLA 2', filamentType: 'PLA', nozzleTemp: 210, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "Low odor, high flow, easy print." }),
  createPreset({ id: 'filac-2', profileName: 'FilaCube HT-PLA+', printerBrand: 'Other', manufacturer: 'FilaCube', brand: 'HT-PLA+', filamentType: 'PLA', nozzleTemp: 220, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "Annealable for high temperature resistance." }),
  createPreset({ id: 'filac-3', profileName: 'FilaCube PETG', printerBrand: 'Other', manufacturer: 'FilaCube', brand: 'PETG', filamentType: 'PETG', nozzleTemp: 240, bedTemp: 75, maxVolumetricSpeed: 12, fanSpeedMin: 40, fanSpeedMax: 80, density: 1.27 }),

  // Filamentive (UK)
  createPreset({ id: 'filv-1', profileName: 'Filamentive rPLA', printerBrand: 'Other', manufacturer: 'Filamentive', brand: 'rPLA', filamentType: 'PLA', nozzleTemp: 205, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "Recycled PLA content." }),
  createPreset({ id: 'filv-2', profileName: 'Filamentive rPETG', printerBrand: 'Other', manufacturer: 'Filamentive', brand: 'rPETG', filamentType: 'PETG', nozzleTemp: 235, bedTemp: 70, maxVolumetricSpeed: 12, fanSpeedMin: 40, fanSpeedMax: 80, density: 1.27, notes: "Recycled PETG content." }),
  createPreset({ id: 'filv-3', profileName: 'Filamentive Carbon Fibre', printerBrand: 'Other', manufacturer: 'Filamentive', brand: 'Carbon', filamentType: 'PETG', nozzleTemp: 245, bedTemp: 70, maxVolumetricSpeed: 10, fanSpeedMin: 0, fanSpeedMax: 30, density: 1.29, notes: "PETG base with Carbon Fibre. Hardened Nozzle." }),
  createPreset({ id: 'filv-4', profileName: 'Filamentive ASA', printerBrand: 'Other', manufacturer: 'Filamentive', brand: 'ASA', filamentType: 'ASA', nozzleTemp: 250, bedTemp: 90, maxVolumetricSpeed: 14, fanSpeedMin: 0, fanSpeedMax: 20, density: 1.07 }),

  // Fillamentum
  createPreset({ id: 'film-1', profileName: 'Fillamentum PLA Extrafill', printerBrand: 'Other', manufacturer: 'Fillamentum', brand: 'Extrafill', filamentType: 'PLA', nozzleTemp: 210, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24 }),
  createPreset({ id: 'film-2', profileName: 'Fillamentum CPE HG100', printerBrand: 'Other', manufacturer: 'Fillamentum', brand: 'CPE', filamentType: 'Copolyester', nozzleTemp: 260, bedTemp: 80, maxVolumetricSpeed: 12, fanSpeedMin: 20, fanSpeedMax: 50, density: 1.20, notes: "Modified PETG. High gloss." }),
  createPreset({ id: 'film-3', profileName: 'Fillamentum Flexfill PEBA 90A', printerBrand: 'Other', manufacturer: 'Fillamentum', brand: 'Flexfill PEBA', filamentType: 'PEBA', nozzleTemp: 230, bedTemp: 50, maxVolumetricSpeed: 3, fanSpeedMin: 80, fanSpeedMax: 100, density: 1.01, notes: "High energy return foam-like TPE." }),
  createPreset({ id: 'film-4', profileName: 'Fillamentum Vinyl 303', printerBrand: 'Other', manufacturer: 'Fillamentum', brand: 'Vinyl 303', filamentType: 'Other', nozzleTemp: 220, bedTemp: 80, maxVolumetricSpeed: 10, fanSpeedMin: 50, fanSpeedMax: 100, density: 1.30, notes: "PVC based. Fire retardant. Warning: Fumes." }),
  createPreset({ id: 'film-5', profileName: 'Fillamentum Timberfill', printerBrand: 'Other', manufacturer: 'Fillamentum', brand: 'Timberfill', filamentType: 'PLA', nozzleTemp: 190, bedTemp: 55, maxVolumetricSpeed: 8, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.15, notes: "Real wood look. 0.5mm nozzle min." }),
  createPreset({ id: 'film-6', profileName: 'Fillamentum NonOilen', printerBrand: 'Other', manufacturer: 'Fillamentum', brand: 'NonOilen', filamentType: 'PLA', nozzleTemp: 185, bedTemp: 50, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.20, notes: "100% Biodegradable, high temp resist." }),
  createPreset({ id: 'film-7', profileName: 'Fillamentum ABS Extrafill', printerBrand: 'Other', manufacturer: 'Fillamentum', brand: 'Extrafill', filamentType: 'ABS', nozzleTemp: 240, bedTemp: 100, maxVolumetricSpeed: 15, fanSpeedMin: 0, fanSpeedMax: 20, density: 1.04 }),

  // FiloAlfa (Italy)
  createPreset({ id: 'filoa-1', profileName: 'FiloAlfa AlfaPlus', printerBrand: 'Other', manufacturer: 'FiloAlfa', brand: 'AlfaPlus', filamentType: 'PLA', nozzleTemp: 210, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "High temp resistance PLA (annealable)." }),
  createPreset({ id: 'filoa-2', profileName: 'FiloAlfa FiloFlex 93A', printerBrand: 'Other', manufacturer: 'FiloAlfa', brand: 'FiloFlex', filamentType: 'TPU', nozzleTemp: 225, bedTemp: 50, maxVolumetricSpeed: 4, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.22 }),
  createPreset({ id: 'filoa-3', profileName: 'FiloAlfa Thermec Zed', printerBrand: 'Other', manufacturer: 'FiloAlfa', brand: 'Thermec Zed', filamentType: 'Other', nozzleTemp: 250, bedTemp: 90, maxVolumetricSpeed: 10, fanSpeedMin: 20, fanSpeedMax: 50, density: 1.25, notes: "High performance alternative to PEEK. Chemical resistant." }),
  createPreset({ id: 'filoa-4', profileName: 'FiloAlfa Grafitene', printerBrand: 'Other', manufacturer: 'FiloAlfa', brand: 'Grafitene', filamentType: 'PLA', nozzleTemp: 200, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "Graphite filled PLA. Aesthetic matte grey finish." }),

  // FlashForge
  createPreset({ id: 'ffg-1', profileName: 'FlashForge PLA', printerBrand: 'Other', manufacturer: 'FlashForge', brand: 'PLA', filamentType: 'PLA', nozzleTemp: 210, bedTemp: 55, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24 }),
  createPreset({ id: 'ffg-2', profileName: 'FlashForge ABS Pro', printerBrand: 'Other', manufacturer: 'FlashForge', brand: 'ABS Pro', filamentType: 'ABS', nozzleTemp: 240, bedTemp: 100, maxVolumetricSpeed: 14, fanSpeedMin: 0, fanSpeedMax: 20, density: 1.04, notes: "Low warp ABS." }),
  createPreset({ id: 'ffg-3', profileName: 'FlashForge ASA', printerBrand: 'Other', manufacturer: 'FlashForge', brand: 'ASA', filamentType: 'ASA', nozzleTemp: 250, bedTemp: 95, maxVolumetricSpeed: 14, fanSpeedMin: 0, fanSpeedMax: 20, density: 1.07 }),
  createPreset({ id: 'ffg-4', profileName: 'FlashForge Elastic (TPU)', printerBrand: 'Other', manufacturer: 'FlashForge', brand: 'Elastic', filamentType: 'TPU', nozzleTemp: 220, bedTemp: 50, maxVolumetricSpeed: 4, fanSpeedMin: 80, fanSpeedMax: 100, density: 1.21 }),

  // FormFutura
  createPreset({ id: 'ff-1', profileName: 'FormFutura ApolloX (ASA)', printerBrand: 'Other', manufacturer: 'FormFutura', brand: 'ApolloX', filamentType: 'ASA', nozzleTemp: 245, bedTemp: 90, maxVolumetricSpeed: 15, fanSpeedMin: 0, fanSpeedMax: 30, density: 1.07, notes: "Engineering ASA. Low warp." }),
  createPreset({ id: 'ff-2', profileName: 'FormFutura StoneFil', printerBrand: 'Other', manufacturer: 'FormFutura', brand: 'StoneFil', filamentType: 'PLA', nozzleTemp: 210, bedTemp: 60, maxVolumetricSpeed: 10, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.70, notes: "Stone effect. 0.5mm nozzle recommended." }),
  createPreset({ id: 'ff-3', profileName: 'FormFutura TitanX', printerBrand: 'Other', manufacturer: 'FormFutura', brand: 'TitanX', filamentType: 'ABS', nozzleTemp: 245, bedTemp: 100, maxVolumetricSpeed: 14, fanSpeedMin: 10, fanSpeedMax: 30, density: 1.04, notes: "Industrial ABS. Zero warp technology." }),
  createPreset({ id: 'ff-4', profileName: 'FormFutura Galaxy PLA', printerBrand: 'Other', manufacturer: 'FormFutura', brand: 'Galaxy', filamentType: 'PLA', nozzleTemp: 210, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "High glitter content. Space look." }),
  createPreset({ id: 'ff-5', profileName: 'FormFutura ReForm rPLA', printerBrand: 'Other', manufacturer: 'FormFutura', brand: 'ReForm', filamentType: 'PLA', nozzleTemp: 205, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "100% Recycled PLA." }),
  createPreset({ id: 'ff-6', profileName: 'FormFutura Volcano PLA', printerBrand: 'Other', manufacturer: 'FormFutura', brand: 'Volcano', filamentType: 'PLA', nozzleTemp: 235, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "Heat resistant PLA. Annealable." }),
  createPreset({ id: 'ff-7', profileName: 'FormFutura EasyFil PLA', printerBrand: 'Other', manufacturer: 'FormFutura', brand: 'EasyFil', filamentType: 'PLA', nozzleTemp: 210, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "Easy printing, high quality." }),
  createPreset({ id: 'ff-8', profileName: 'FormFutura HDglass', printerBrand: 'Other', manufacturer: 'FormFutura', brand: 'HDglass', filamentType: 'PETG', nozzleTemp: 240, bedTemp: 70, maxVolumetricSpeed: 12, fanSpeedMin: 50, fanSpeedMax: 100, density: 1.27, notes: "High transparency PETG." }),
  createPreset({ id: 'ff-9', profileName: 'FormFutura CarbonFil', printerBrand: 'Other', manufacturer: 'FormFutura', brand: 'CarbonFil', filamentType: 'PETG', nozzleTemp: 245, bedTemp: 70, maxVolumetricSpeed: 12, fanSpeedMin: 20, fanSpeedMax: 50, density: 1.19, notes: "Carbon Fiber Reinforced. Light & Stiff." }),
  createPreset({ id: 'ff-10', profileName: 'FormFutura Python Flex', printerBrand: 'Other', manufacturer: 'FormFutura', brand: 'Python', filamentType: 'TPU', nozzleTemp: 230, bedTemp: 60, maxVolumetricSpeed: 4, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.20, notes: "TPU 98A. Easy to print." }),

  // Francofil (France)
  createPreset({ id: 'fr-1', profileName: 'Francofil PLA Blé (Wheat)', printerBrand: 'Other', manufacturer: 'Francofil', brand: 'Bio-Composite', filamentType: 'PLA', nozzleTemp: 205, bedTemp: 55, maxVolumetricSpeed: 10, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "Wheat shell filled. Use 0.5/0.6 nozzle." }),
  createPreset({ id: 'fr-2', profileName: 'Francofil PLA Coquille St Jacques', printerBrand: 'Other', manufacturer: 'Francofil', brand: 'Bio-Composite', filamentType: 'PLA', nozzleTemp: 205, bedTemp: 55, maxVolumetricSpeed: 10, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "Scallop shell filled. Creamy texture. 0.5mm nozzle min." }),
  createPreset({ id: 'fr-3', profileName: 'Francofil PLA Café', printerBrand: 'Other', manufacturer: 'Francofil', brand: 'Bio-Composite', filamentType: 'PLA', nozzleTemp: 205, bedTemp: 55, maxVolumetricSpeed: 10, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "Coffee grounds filled. Dark brown texture." }),

  // Fusion Filaments (USA)
  createPreset({ id: 'fus-1', profileName: 'Fusion Filaments HTPLA', printerBrand: 'Other', manufacturer: 'Fusion Filaments', brand: 'HTPLA', filamentType: 'PLA', nozzleTemp: 220, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "High Performance PLA. Annealable for strength." }),

  // Geeetech
  createPreset({ id: 'gee-1', profileName: 'Geeetech PLA', printerBrand: 'Other', manufacturer: 'Geeetech', brand: 'PLA', filamentType: 'PLA', nozzleTemp: 200, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24 }),
  createPreset({ id: 'gee-2', profileName: 'Geeetech PETG', printerBrand: 'Other', manufacturer: 'Geeetech', brand: 'PETG', filamentType: 'PETG', nozzleTemp: 240, bedTemp: 70, maxVolumetricSpeed: 12, fanSpeedMin: 40, fanSpeedMax: 80, density: 1.27 }),
  createPreset({ id: 'gee-3', profileName: 'Geeetech Wood PLA', printerBrand: 'Other', manufacturer: 'Geeetech', brand: 'Wood', filamentType: 'PLA', nozzleTemp: 200, bedTemp: 50, maxVolumetricSpeed: 10, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.20, notes: "Wood texture. 0.5mm+ nozzle." }),
  createPreset({ id: 'gee-4', profileName: 'Geeetech Silk PLA', printerBrand: 'Other', manufacturer: 'Geeetech', brand: 'Silk', filamentType: 'PLA', nozzleTemp: 205, bedTemp: 60, maxVolumetricSpeed: 12, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "Shiny finish." }),
  createPreset({ id: 'gee-5', profileName: 'Geeetech Marble PLA', printerBrand: 'Other', manufacturer: 'Geeetech', brand: 'Marble', filamentType: 'PLA', nozzleTemp: 205, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24 }),

  // GiantArm
  createPreset({ id: 'giant-1', profileName: 'GiantArm PLA', printerBrand: 'Other', manufacturer: 'GiantArm', brand: 'PLA', filamentType: 'PLA', nozzleTemp: 200, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24 }),
  createPreset({ id: 'giant-2', profileName: 'GiantArm PETG', printerBrand: 'Other', manufacturer: 'GiantArm', brand: 'PETG', filamentType: 'PETG', nozzleTemp: 240, bedTemp: 70, maxVolumetricSpeed: 12, fanSpeedMin: 40, fanSpeedMax: 80, density: 1.27 }),
  createPreset({ id: 'giant-3', profileName: 'GiantArm TPU', printerBrand: 'Other', manufacturer: 'GiantArm', brand: 'TPU', filamentType: 'TPU', nozzleTemp: 220, bedTemp: 50, maxVolumetricSpeed: 3.5, fanSpeedMin: 80, fanSpeedMax: 100, density: 1.21 }),

  // GratKit
  createPreset({ id: 'grat-1', profileName: 'GratKit PLA+', printerBrand: 'Other', manufacturer: 'GratKit', brand: 'PLA+', filamentType: 'PLA', nozzleTemp: 215, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "Industrial formula PLA+." }),
  createPreset({ id: 'grat-2', profileName: 'GratKit PETG', printerBrand: 'Other', manufacturer: 'GratKit', brand: 'PETG', filamentType: 'PETG', nozzleTemp: 240, bedTemp: 75, maxVolumetricSpeed: 12, fanSpeedMin: 30, fanSpeedMax: 70, density: 1.27 }),
  createPreset({ id: 'grat-3', profileName: 'GratKit ABS', printerBrand: 'Other', manufacturer: 'GratKit', brand: 'ABS', filamentType: 'ABS', nozzleTemp: 250, bedTemp: 100, maxVolumetricSpeed: 14, fanSpeedMin: 0, fanSpeedMax: 20, density: 1.04 }),
  createPreset({ id: 'grat-4', profileName: 'GratKit TPU 95A', printerBrand: 'Other', manufacturer: 'GratKit', brand: 'TPU', filamentType: 'TPU', nozzleTemp: 210, bedTemp: 50, maxVolumetricSpeed: 4, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.21 }),

  // GST3D
  createPreset({ id: 'gst-1', profileName: 'GST3D PLA+', printerBrand: 'Other', manufacturer: 'GST3D', brand: 'PLA+', filamentType: 'PLA', nozzleTemp: 215, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "Requires stable temp. Good layer adhesion." }),
  createPreset({ id: 'gst-2', profileName: 'GST3D PETG', printerBrand: 'Other', manufacturer: 'GST3D', brand: 'PETG', filamentType: 'PETG', nozzleTemp: 240, bedTemp: 80, maxVolumetricSpeed: 12, fanSpeedMin: 40, fanSpeedMax: 80, density: 1.27 }),
  createPreset({ id: 'gst-3', profileName: 'GST3D TPU', printerBrand: 'Other', manufacturer: 'GST3D', brand: 'TPU', filamentType: 'TPU', nozzleTemp: 230, bedTemp: 50, maxVolumetricSpeed: 4, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.21 }),
  createPreset({ id: 'gst-4', profileName: 'GST3D ABS', printerBrand: 'Other', manufacturer: 'GST3D', brand: 'ABS', filamentType: 'ABS', nozzleTemp: 245, bedTemp: 100, maxVolumetricSpeed: 14, fanSpeedMin: 0, fanSpeedMax: 20, density: 1.04 }),

  // HZST3D
  createPreset({ id: 'hzst-1', profileName: 'HZST3D PLA', printerBrand: 'Other', manufacturer: 'HZST3D', brand: 'PLA', filamentType: 'PLA', nozzleTemp: 205, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24 }),
  createPreset({ id: 'hzst-2', profileName: 'HZST3D Wood PLA', printerBrand: 'Other', manufacturer: 'HZST3D', brand: 'Wood', filamentType: 'PLA', nozzleTemp: 200, bedTemp: 50, maxVolumetricSpeed: 10, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.20, notes: "Real wood feel. 0.5mm nozzle min." }),
  createPreset({ id: 'hzst-3', profileName: 'HZST3D Marble PLA', printerBrand: 'Other', manufacturer: 'HZST3D', brand: 'Marble', filamentType: 'PLA', nozzleTemp: 205, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24 }),

  // Hatchbox
  createPreset({ id: 'hatch-1', profileName: 'Hatchbox PLA', printerBrand: 'Other', manufacturer: 'Hatchbox', brand: 'PLA', filamentType: 'PLA', nozzleTemp: 200, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24 }),
  createPreset({ id: 'hatch-2', profileName: 'Hatchbox ABS', printerBrand: 'Other', manufacturer: 'Hatchbox', brand: 'ABS', filamentType: 'ABS', nozzleTemp: 235, bedTemp: 95, maxVolumetricSpeed: 14, fanSpeedMin: 0, fanSpeedMax: 20, density: 1.04 }),
  createPreset({ id: 'hatch-3', profileName: 'Hatchbox PETG', printerBrand: 'Other', manufacturer: 'Hatchbox', brand: 'PETG', filamentType: 'PETG', nozzleTemp: 240, bedTemp: 70, maxVolumetricSpeed: 12, fanSpeedMin: 40, fanSpeedMax: 80, density: 1.27 }),
  createPreset({ id: 'hatch-4', profileName: 'Hatchbox TPU 95A', printerBrand: 'Other', manufacturer: 'Hatchbox', brand: 'TPU', filamentType: 'TPU', nozzleTemp: 225, bedTemp: 50, maxVolumetricSpeed: 4, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.21 }),
  createPreset({ id: 'hatch-5', profileName: 'Hatchbox Wood PLA', printerBrand: 'Other', manufacturer: 'Hatchbox', brand: 'Wood', filamentType: 'PLA', nozzleTemp: 200, bedTemp: 50, maxVolumetricSpeed: 10, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.20, notes: "Real wood particles. Sandable." }),
  createPreset({ id: 'hatch-6', profileName: 'Hatchbox Matte PLA', printerBrand: 'Other', manufacturer: 'Hatchbox', brand: 'Matte', filamentType: 'PLA', nozzleTemp: 205, bedTemp: 55, maxVolumetricSpeed: 12, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.30, notes: "Low gloss finish." }),

  // IGUS
  createPreset({ id: 'igus-1', profileName: 'iglidur I150-PF', printerBrand: 'Other', manufacturer: 'IGUS', brand: 'iglidur', filamentType: 'Other', nozzleTemp: 240, bedTemp: 60, maxVolumetricSpeed: 4, fanSpeedMin: 20, fanSpeedMax: 50, density: 1.30, notes: "Tribological filament. Wear resistant. Ease of print." }),
  createPreset({ id: 'igus-2', profileName: 'iglidur I180-PF', printerBrand: 'Other', manufacturer: 'IGUS', brand: 'iglidur', filamentType: 'Other', nozzleTemp: 250, bedTemp: 90, maxVolumetricSpeed: 4, fanSpeedMin: 0, fanSpeedMax: 20, density: 1.25, notes: "High wear resistance. Enclosure recommended." }),

  // IIID MAX
  createPreset({ id: 'iiid-1', profileName: 'IIID MAX PLA+', printerBrand: 'Other', manufacturer: 'IIID MAX', brand: 'PLA+', filamentType: 'PLA', nozzleTemp: 215, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24 }),
  createPreset({ id: 'iiid-2', profileName: 'IIID MAX ASA', printerBrand: 'Other', manufacturer: 'IIID MAX', brand: 'ASA', filamentType: 'ASA', nozzleTemp: 245, bedTemp: 100, maxVolumetricSpeed: 12, fanSpeedMin: 0, fanSpeedMax: 20, density: 1.07 }),
  createPreset({ id: 'iiid-3', profileName: 'IIID MAX PETG', printerBrand: 'Other', manufacturer: 'IIID MAX', brand: 'PETG', filamentType: 'PETG', nozzleTemp: 235, bedTemp: 75, maxVolumetricSpeed: 12, fanSpeedMin: 30, fanSpeedMax: 70, density: 1.27 }),

  // Inland (Micro Center)
  createPreset({ id: 'inl-1', profileName: 'Inland PLA', printerBrand: 'Other', manufacturer: 'Inland', brand: 'PLA', filamentType: 'PLA', nozzleTemp: 215, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "Reliable standard PLA." }),
  createPreset({ id: 'inl-2', profileName: 'Inland PLA+', printerBrand: 'Other', manufacturer: 'Inland', brand: 'PLA+', filamentType: 'PLA', nozzleTemp: 220, bedTemp: 60, maxVolumetricSpeed: 18, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "Tougher PLA." }),
  createPreset({ id: 'inl-3', profileName: 'Inland PETG', printerBrand: 'Other', manufacturer: 'Inland', brand: 'PETG', filamentType: 'PETG', nozzleTemp: 240, bedTemp: 80, maxVolumetricSpeed: 12, fanSpeedMin: 40, fanSpeedMax: 80, density: 1.27 }),
  createPreset({ id: 'inl-4', profileName: 'Inland ABS', printerBrand: 'Other', manufacturer: 'Inland', brand: 'ABS', filamentType: 'ABS', nozzleTemp: 245, bedTemp: 100, maxVolumetricSpeed: 14, fanSpeedMin: 0, fanSpeedMax: 20, density: 1.04 }),
  createPreset({ id: 'inl-5', profileName: 'Inland TPU', printerBrand: 'Other', manufacturer: 'Inland', brand: 'TPU', filamentType: 'TPU', nozzleTemp: 220, bedTemp: 50, maxVolumetricSpeed: 4, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.21 }),

  // Innofil3D
  createPreset({ id: 'inno-1', profileName: 'Innofil3D PLA', printerBrand: 'Other', manufacturer: 'Innofil3D', brand: 'PLA', filamentType: 'PLA', nozzleTemp: 210, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24 }),
  createPreset({ id: 'inno-2', profileName: 'Innofil3D EPR InnoPET', printerBrand: 'Other', manufacturer: 'Innofil3D', brand: 'EPR InnoPET', filamentType: 'PETG', nozzleTemp: 220, bedTemp: 60, maxVolumetricSpeed: 12, fanSpeedMin: 30, fanSpeedMax: 70, density: 1.27, notes: "Low temp PET." }),
  createPreset({ id: 'inno-3', profileName: 'Innofil3D ABS', printerBrand: 'Other', manufacturer: 'Innofil3D', brand: 'ABS', filamentType: 'ABS', nozzleTemp: 245, bedTemp: 95, maxVolumetricSpeed: 12, fanSpeedMin: 0, fanSpeedMax: 10, density: 1.04 }),

  // JAMG HE
  createPreset({ id: 'jamg-1', profileName: 'JAMG HE Hi-Speed PLA+', printerBrand: 'Other', manufacturer: 'JAMG HE', brand: 'Hi-Speed', filamentType: 'PLA', nozzleTemp: 210, bedTemp: 60, maxVolumetricSpeed: 20, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24 }),
  createPreset({ id: 'jamg-2', profileName: 'JAMG HE Silk PLA', printerBrand: 'Other', manufacturer: 'JAMG HE', brand: 'Silk', filamentType: 'PLA', nozzleTemp: 205, bedTemp: 60, maxVolumetricSpeed: 12, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24 }),

  // JAYO (Sunlu Sub-brand)
  createPreset({ id: 'jayo-1', profileName: 'JAYO PLA+', printerBrand: 'Other', manufacturer: 'JAYO', brand: 'PLA+', filamentType: 'PLA', nozzleTemp: 215, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "Similar to Sunlu PLA+." }),
  createPreset({ id: 'jayo-2', profileName: 'JAYO PETG', printerBrand: 'Other', manufacturer: 'JAYO', brand: 'PETG', filamentType: 'PETG', nozzleTemp: 235, bedTemp: 70, maxVolumetricSpeed: 12, fanSpeedMin: 40, fanSpeedMax: 80, density: 1.27 }),

  // Jessie (Printed Solid)
  createPreset({ id: 'jes-1', profileName: 'Jessie PLA', printerBrand: 'Other', manufacturer: 'Jessie', brand: 'PLA', filamentType: 'PLA', nozzleTemp: 205, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "Made in USA." }),
  createPreset({ id: 'jes-2', profileName: 'Jessie PETG', printerBrand: 'Other', manufacturer: 'Jessie', brand: 'PETG', filamentType: 'PETG', nozzleTemp: 240, bedTemp: 80, maxVolumetricSpeed: 12, fanSpeedMin: 30, fanSpeedMax: 70, density: 1.27 }),

  // Kaige (China)
  createPreset({ id: 'kg-1', profileName: 'Kaige PLA', printerBrand: 'Other', manufacturer: 'Kaige', brand: 'PLA', filamentType: 'PLA', nozzleTemp: 200, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24 }),
  createPreset({ id: 'kg-2', profileName: 'Kaige PETG', printerBrand: 'Other', manufacturer: 'Kaige', brand: 'PETG', filamentType: 'PETG', nozzleTemp: 230, bedTemp: 70, maxVolumetricSpeed: 12, fanSpeedMin: 30, fanSpeedMax: 70, density: 1.27 }),

  // Kexcelled (High Quality China)
  createPreset({ id: 'kex-1', profileName: 'Kexcelled PLA K5', printerBrand: 'Other', manufacturer: 'Kexcelled', brand: 'K5', filamentType: 'PLA', nozzleTemp: 215, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "High dimensional accuracy." }),
  createPreset({ id: 'kex-2', profileName: 'Kexcelled PLA K5 Silk', printerBrand: 'Other', manufacturer: 'Kexcelled', brand: 'K5 Silk', filamentType: 'PLA', nozzleTemp: 215, bedTemp: 60, maxVolumetricSpeed: 12, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24 }),
  createPreset({ id: 'kex-3', profileName: 'Kexcelled PETG K7', printerBrand: 'Other', manufacturer: 'Kexcelled', brand: 'K7', filamentType: 'PETG', nozzleTemp: 235, bedTemp: 75, maxVolumetricSpeed: 12, fanSpeedMin: 40, fanSpeedMax: 80, density: 1.27 }),
  createPreset({ id: 'kex-4', profileName: 'Kexcelled ABS K5', printerBrand: 'Other', manufacturer: 'Kexcelled', brand: 'K5', filamentType: 'ABS', nozzleTemp: 245, bedTemp: 100, maxVolumetricSpeed: 14, fanSpeedMin: 0, fanSpeedMax: 20, density: 1.04 }),

  // Kimya (Armor Group)
  createPreset({ id: 'kim-1', profileName: 'Kimya PLA-HI', printerBrand: 'Other', manufacturer: 'Kimya (Armor)', brand: 'PLA-HI', filamentType: 'PLA', nozzleTemp: 205, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "High Impact PLA." }),
  createPreset({ id: 'kim-2', profileName: 'Kimya PETG-S', printerBrand: 'Other', manufacturer: 'Kimya (Armor)', brand: 'PETG-S', filamentType: 'PETG', nozzleTemp: 235, bedTemp: 70, maxVolumetricSpeed: 12, fanSpeedMin: 40, fanSpeedMax: 80, density: 1.27, notes: "Standard Industrial PETG." }),
  createPreset({ id: 'kim-3', profileName: 'Kimya ABS-S', printerBrand: 'Other', manufacturer: 'Kimya (Armor)', brand: 'ABS-S', filamentType: 'ABS', nozzleTemp: 260, bedTemp: 100, maxVolumetricSpeed: 15, fanSpeedMin: 0, fanSpeedMax: 20, density: 1.04, notes: "Shock resistant ABS." }),
  createPreset({ id: 'kim-4', profileName: 'Kimya TPU-92A', printerBrand: 'Other', manufacturer: 'Kimya (Armor)', brand: 'TPU-92A', filamentType: 'TPU', nozzleTemp: 235, bedTemp: 60, maxVolumetricSpeed: 4, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.21 }),
  createPreset({ id: 'kim-5', profileName: 'Kimya PEBA-S', printerBrand: 'Other', manufacturer: 'Kimya (Armor)', brand: 'PEBA-S', filamentType: 'PEBA', nozzleTemp: 235, bedTemp: 45, maxVolumetricSpeed: 4, fanSpeedMin: 80, fanSpeedMax: 100, density: 1.01, notes: "Polyether Block Amide. High flexibility." }),

  // Kingroon
  createPreset({ id: 'kr-1', profileName: 'Kingroon PLA', printerBrand: 'Other', manufacturer: 'Kingroon', brand: 'PLA', filamentType: 'PLA', nozzleTemp: 200, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24 }),
  createPreset({ id: 'kr-2', profileName: 'Kingroon PETG', printerBrand: 'Other', manufacturer: 'Kingroon', brand: 'PETG', filamentType: 'PETG', nozzleTemp: 235, bedTemp: 75, maxVolumetricSpeed: 12, fanSpeedMin: 40, fanSpeedMax: 80, density: 1.27 }),
  createPreset({ id: 'kr-3', profileName: 'Kingroon TPU', printerBrand: 'Other', manufacturer: 'Kingroon', brand: 'TPU', filamentType: 'TPU', nozzleTemp: 210, bedTemp: 50, maxVolumetricSpeed: 3.5, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.21 }),

  // MakeShaper (USA)
  createPreset({ id: 'mks-1', profileName: 'MakeShaper PLA', printerBrand: 'Other', manufacturer: 'MakeShaper', brand: 'PLA', filamentType: 'PLA', nozzleTemp: 210, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24 }),
  createPreset({ id: 'mks-2', profileName: 'MakeShaper PETG', printerBrand: 'Other', manufacturer: 'MakeShaper', brand: 'PETG', filamentType: 'PETG', nozzleTemp: 240, bedTemp: 75, maxVolumetricSpeed: 12, fanSpeedMin: 40, fanSpeedMax: 80, density: 1.27 }),
  createPreset({ id: 'mks-3', profileName: 'MakeShaper ABS', printerBrand: 'Other', manufacturer: 'MakeShaper', brand: 'ABS', filamentType: 'ABS', nozzleTemp: 235, bedTemp: 95, maxVolumetricSpeed: 14, fanSpeedMin: 0, fanSpeedMax: 20, density: 1.04 }),

  // MatterHackers (USA - Huge Catalog)
  createPreset({ id: 'mh-1', profileName: 'MatterHackers Build Series PLA', printerBrand: 'Other', manufacturer: 'MatterHackers', brand: 'Build Series', filamentType: 'PLA', nozzleTemp: 205, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "Budget friendly PLA." }),
  createPreset({ id: 'mh-2', profileName: 'MatterHackers Build Series PETG', printerBrand: 'Other', manufacturer: 'MatterHackers', brand: 'Build Series', filamentType: 'PETG', nozzleTemp: 240, bedTemp: 70, maxVolumetricSpeed: 12, fanSpeedMin: 40, fanSpeedMax: 80, density: 1.27 }),
  createPreset({ id: 'mh-3', profileName: 'MatterHackers Build Series TPU', printerBrand: 'Other', manufacturer: 'MatterHackers', brand: 'Build Series', filamentType: 'TPU', nozzleTemp: 230, bedTemp: 50, maxVolumetricSpeed: 4, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.21 }),
  createPreset({ id: 'mh-4', profileName: 'MatterHackers PRO Series PLA', printerBrand: 'Other', manufacturer: 'MatterHackers', brand: 'PRO Series', filamentType: 'PLA', nozzleTemp: 210, bedTemp: 60, maxVolumetricSpeed: 16, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "Higher tolerance professional PLA." }),
  createPreset({ id: 'mh-5', profileName: 'MatterHackers PRO Series Nylon', printerBrand: 'Other', manufacturer: 'MatterHackers', brand: 'PRO Series', filamentType: 'Nylon', nozzleTemp: 250, bedTemp: 65, maxVolumetricSpeed: 10, fanSpeedMin: 0, fanSpeedMax: 0, density: 1.14, dryingTemp: 80, dryingTime: '12h', notes: "PVA Glue Recommended." }),
  createPreset({ id: 'mh-6', profileName: 'MatterHackers NylonX', printerBrand: 'Other', manufacturer: 'MatterHackers', brand: 'NylonX', filamentType: 'PA-CF', nozzleTemp: 260, bedTemp: 65, maxVolumetricSpeed: 10, fanSpeedMin: 0, fanSpeedMax: 0, density: 1.01, notes: "Carbon Fiber Nylon. Light and stiff. Hardened nozzle required." }),
  createPreset({ id: 'mh-7', profileName: 'MatterHackers NylonG', printerBrand: 'Other', manufacturer: 'MatterHackers', brand: 'NylonG', filamentType: 'PA-GF', nozzleTemp: 255, bedTemp: 65, maxVolumetricSpeed: 10, fanSpeedMin: 0, fanSpeedMax: 0, density: 1.05, notes: "Glass Fiber Nylon. Impact resistant. Hardened nozzle required." }),
  createPreset({ id: 'mh-8', profileName: 'MatterHackers Quantum PLA', printerBrand: 'Other', manufacturer: 'MatterHackers', brand: 'Quantum', filamentType: 'PLA', nozzleTemp: 215, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "Dual color filament. Align seam for effect." }),

  // Microzey (Turkey)
  createPreset({ id: 'mzy-1', profileName: 'Microzey PLA', printerBrand: 'Other', manufacturer: 'Microzey', brand: 'PLA', filamentType: 'PLA', nozzleTemp: 210, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24 }),
  createPreset({ id: 'mzy-2', profileName: 'Microzey ABS', printerBrand: 'Other', manufacturer: 'Microzey', brand: 'ABS', filamentType: 'ABS', nozzleTemp: 245, bedTemp: 100, maxVolumetricSpeed: 14, fanSpeedMin: 0, fanSpeedMax: 20, density: 1.04 }),
  createPreset({ id: 'mzy-3', profileName: 'Microzey PETG', printerBrand: 'Other', manufacturer: 'Microzey', brand: 'PETG', filamentType: 'PETG', nozzleTemp: 235, bedTemp: 75, maxVolumetricSpeed: 12, fanSpeedMin: 40, fanSpeedMax: 80, density: 1.27 }),

  // Nanovia (France - Technical)
  createPreset({ id: 'nano-1', profileName: 'Nanovia PLA EF', printerBrand: 'Other', manufacturer: 'Nanovia', brand: 'PLA EF', filamentType: 'PLA', nozzleTemp: 210, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "Bio-sourced, easy print." }),
  createPreset({ id: 'nano-2', profileName: 'Nanovia PETG CF', printerBrand: 'Other', manufacturer: 'Nanovia', brand: 'CF', filamentType: 'PETG', nozzleTemp: 245, bedTemp: 80, maxVolumetricSpeed: 10, fanSpeedMin: 20, fanSpeedMax: 50, density: 1.29, notes: "Carbon fiber reinforced PETG. Hardened nozzle." }),
  createPreset({ id: 'nano-3', profileName: 'Nanovia PA-6 CF', printerBrand: 'Other', manufacturer: 'Nanovia', brand: 'PA-6 CF', filamentType: 'PA-CF', nozzleTemp: 260, bedTemp: 90, maxVolumetricSpeed: 8, fanSpeedMin: 0, fanSpeedMax: 0, density: 1.19, dryingTemp: 80, dryingTime: '6h', notes: "Nylon 6 Carbon Fiber. Engineering grade." }),
  createPreset({ id: 'nano-4', profileName: 'Nanovia Mt (Basalt)', printerBrand: 'Other', manufacturer: 'Nanovia', brand: 'Mt', filamentType: 'Other', nozzleTemp: 220, bedTemp: 60, maxVolumetricSpeed: 8, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.40, notes: "Basalt reinforced. Highly rigid and ceramic touch." }),
  createPreset({ id: 'nano-5', profileName: 'Nanovia PC-V0', printerBrand: 'Other', manufacturer: 'Nanovia', brand: 'PC-V0', filamentType: 'PC', nozzleTemp: 270, bedTemp: 110, maxVolumetricSpeed: 12, fanSpeedMin: 0, fanSpeedMax: 20, density: 1.20, notes: "Fire resistant UL94 V0." }),

  // NinjaTek (Expanded)
  createPreset({ id: 'nt-1', profileName: 'NinjaTek NinjaFlex 85A', printerBrand: 'Other', manufacturer: 'NinjaTek', brand: 'NinjaFlex', filamentType: 'TPU', nozzleTemp: 230, bedTemp: 40, maxVolumetricSpeed: 3, fanSpeedMin: 60, fanSpeedMax: 100, density: 1.19 }),
  createPreset({ id: 'nt-2', profileName: 'NinjaTek Armadillo', printerBrand: 'Other', manufacturer: 'NinjaTek', brand: 'Armadillo', filamentType: 'TPU', nozzleTemp: 230, bedTemp: 50, maxVolumetricSpeed: 5, fanSpeedMin: 80, fanSpeedMax: 100, density: 1.18, notes: "Rigid TPU (75D). Tough as Nylon." }),
  createPreset({ id: 'nt-3', profileName: 'NinjaTek Cheetah 95A', printerBrand: 'Other', manufacturer: 'NinjaTek', brand: 'Cheetah', filamentType: 'TPU', nozzleTemp: 235, bedTemp: 40, maxVolumetricSpeed: 8, fanSpeedMin: 80, fanSpeedMax: 100, density: 1.22, notes: "High speed flexible filament." }),
  createPreset({ id: 'nt-4', profileName: 'NinjaTek Chinchilla 75A', printerBrand: 'Other', manufacturer: 'NinjaTek', brand: 'Chinchilla', filamentType: 'TPU', nozzleTemp: 230, bedTemp: 40, maxVolumetricSpeed: 2.5, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.15, notes: "Skin safe, very soft touch." }),
  createPreset({ id: 'nt-5', profileName: 'NinjaTek Eel (Conductive)', printerBrand: 'Other', manufacturer: 'NinjaTek', brand: 'Eel', filamentType: 'TPU', nozzleTemp: 230, bedTemp: 45, maxVolumetricSpeed: 3, fanSpeedMin: 80, fanSpeedMax: 100, density: 1.20, notes: "Conductive TPU." }),

  // Numakers (USA)
  createPreset({ id: 'num-1', profileName: 'Numakers PLA+', printerBrand: 'Other', manufacturer: 'Numakers', brand: 'PLA+', filamentType: 'PLA', nozzleTemp: 215, bedTemp: 60, maxVolumetricSpeed: 16, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "High flow, good layer adhesion." }),
  createPreset({ id: 'num-2', profileName: 'Numakers PETG', printerBrand: 'Other', manufacturer: 'Numakers', brand: 'PETG', filamentType: 'PETG', nozzleTemp: 240, bedTemp: 75, maxVolumetricSpeed: 12, fanSpeedMin: 40, fanSpeedMax: 80, density: 1.27 }),
  createPreset({ id: 'num-3', profileName: 'Numakers ASA', printerBrand: 'Other', manufacturer: 'Numakers', brand: 'ASA', filamentType: 'ASA', nozzleTemp: 250, bedTemp: 95, maxVolumetricSpeed: 14, fanSpeedMin: 0, fanSpeedMax: 20, density: 1.07 }),
  createPreset({ id: 'num-4', profileName: 'Numakers TPU', printerBrand: 'Other', manufacturer: 'Numakers', brand: 'TPU', filamentType: 'TPU', nozzleTemp: 225, bedTemp: 50, maxVolumetricSpeed: 4, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.21 }),

  // Overture (Expanded)
  createPreset({ id: 'ov-1', profileName: 'Overture PLA', printerBrand: 'Other', manufacturer: 'Overture', brand: 'PLA', filamentType: 'PLA', nozzleTemp: 205, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24 }),
  createPreset({ id: 'ov-2', profileName: 'Overture PETG', printerBrand: 'Other', manufacturer: 'Overture', brand: 'PETG', filamentType: 'PETG', nozzleTemp: 240, bedTemp: 80, maxVolumetricSpeed: 12, fanSpeedMin: 30, fanSpeedMax: 70, density: 1.27 }),
  createPreset({ id: 'ov-3', profileName: 'Overture TPU 95A', printerBrand: 'Other', manufacturer: 'Overture', brand: 'TPU', filamentType: 'TPU', nozzleTemp: 220, bedTemp: 55, maxVolumetricSpeed: 4, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.21 }),
  createPreset({ id: 'ov-4', profileName: 'Overture Matte PLA', printerBrand: 'Other', manufacturer: 'Overture', brand: 'Matte', filamentType: 'PLA', nozzleTemp: 200, bedTemp: 55, maxVolumetricSpeed: 12, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.30, notes: "Matte finish. Can be brittle." }),
  createPreset({ id: 'ov-5', profileName: 'Overture Rock PLA', printerBrand: 'Other', manufacturer: 'Overture', brand: 'Rock', filamentType: 'PLA', nozzleTemp: 205, bedTemp: 60, maxVolumetricSpeed: 12, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.28, notes: "Stone/Marble texture." }),
  createPreset({ id: 'ov-6', profileName: 'Overture Easy Nylon', printerBrand: 'Other', manufacturer: 'Overture', brand: 'Easy Nylon', filamentType: 'Nylon', nozzleTemp: 255, bedTemp: 55, maxVolumetricSpeed: 6, fanSpeedMin: 0, fanSpeedMax: 0, density: 1.12, dryingTemp: 75, dryingTime: '12h', notes: "PA6 based. Low warp." }),
  createPreset({ id: 'ov-7', profileName: 'Overture PC', printerBrand: 'Other', manufacturer: 'Overture', brand: 'PC', filamentType: 'PC', nozzleTemp: 260, bedTemp: 100, maxVolumetricSpeed: 12, fanSpeedMin: 0, fanSpeedMax: 20, density: 1.19, notes: "Polycarbonate. BuildTak recommended." }),
  createPreset({ id: 'ov-8', profileName: 'Overture High Speed TPU', printerBrand: 'Other', manufacturer: 'Overture', brand: 'HS-TPU', filamentType: 'TPU', nozzleTemp: 225, bedTemp: 55, maxVolumetricSpeed: 10, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.21, notes: "Can print faster than standard TPU." }),

  // Paramount 3D
  createPreset({ id: 'param-1', profileName: 'Paramount 3D PLA', printerBrand: 'Other', manufacturer: 'Paramount 3D', brand: 'PLA', filamentType: 'PLA', nozzleTemp: 210, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "Known for Pantone colors." }),
  createPreset({ id: 'param-2', profileName: 'Paramount 3D ABS', printerBrand: 'Other', manufacturer: 'Paramount 3D', brand: 'ABS', filamentType: 'ABS', nozzleTemp: 240, bedTemp: 100, maxVolumetricSpeed: 14, fanSpeedMin: 0, fanSpeedMax: 20, density: 1.04 }),
  createPreset({ id: 'param-3', profileName: 'Paramount 3D PETG', printerBrand: 'Other', manufacturer: 'Paramount 3D', brand: 'PETG', filamentType: 'PETG', nozzleTemp: 240, bedTemp: 80, maxVolumetricSpeed: 12, fanSpeedMin: 40, fanSpeedMax: 80, density: 1.27 }),

  // Polymaker
  createPreset({ id: 'poly-1', profileName: 'Polymaker PolyLite PLA', printerBrand: 'Other', manufacturer: 'Polymaker', brand: 'PolyLite', filamentType: 'PLA', nozzleTemp: 210, bedTemp: 55, maxVolumetricSpeed: 18, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.20 }),
  createPreset({ id: 'poly-2', profileName: 'Polymaker PolyTerra PLA', printerBrand: 'Other', manufacturer: 'Polymaker', brand: 'PolyTerra', filamentType: 'PLA', nozzleTemp: 200, bedTemp: 55, maxVolumetricSpeed: 16, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.30, notes: "Matte finish. Bioplastic." }),
  createPreset({ id: 'poly-3', profileName: 'Polymaker PolyLite PETG', printerBrand: 'Other', manufacturer: 'Polymaker', brand: 'PolyLite', filamentType: 'PETG', nozzleTemp: 235, bedTemp: 70, maxVolumetricSpeed: 12, fanSpeedMin: 40, fanSpeedMax: 80, density: 1.25 }),
  createPreset({ id: 'poly-4', profileName: 'Polymaker PolyLite ASA', printerBrand: 'Other', manufacturer: 'Polymaker', brand: 'PolyLite', filamentType: 'ASA', nozzleTemp: 250, bedTemp: 90, maxVolumetricSpeed: 14, fanSpeedMin: 10, fanSpeedMax: 30, density: 1.07 }),
  createPreset({ id: 'poly-5', profileName: 'Polymaker PolyMide CoPA', printerBrand: 'Other', manufacturer: 'Polymaker', brand: 'PolyMide', filamentType: 'Nylon', nozzleTemp: 260, bedTemp: 80, maxVolumetricSpeed: 10, fanSpeedMin: 0, fanSpeedMax: 0, density: 1.14, dryingTemp: 80, dryingTime: '12h', notes: "Warp-free Nylon. Keep dry." }),
  createPreset({ id: 'poly-6', profileName: 'Polymaker PolyMide PA6-CF', printerBrand: 'Other', manufacturer: 'Polymaker', brand: 'PolyMide', filamentType: 'PA-CF', nozzleTemp: 290, bedTemp: 50, maxVolumetricSpeed: 10, fanSpeedMin: 0, fanSpeedMax: 0, density: 1.20, dryingTemp: 100, dryingTime: '8h', notes: "High Temp Nylon Carbon. Hardened nozzle." }),
  createPreset({ id: 'poly-pan-1', profileName: 'Polymaker Panchroma Silk', printerBrand: 'Other', manufacturer: 'Polymaker', brand: 'Panchroma', filamentType: 'PLA', nozzleTemp: 215, bedTemp: 60, maxVolumetricSpeed: 12, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.22, notes: "Silk Glossy Finish." }),
  createPreset({ id: 'poly-pan-2', profileName: 'Polymaker Panchroma Matte', printerBrand: 'Other', manufacturer: 'Polymaker', brand: 'Panchroma', filamentType: 'PLA', nozzleTemp: 205, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.30, notes: "Matte Finish." }),
  createPreset({ id: 'poly-fib-1', profileName: 'Polymaker Fiberon PA6-CF', printerBrand: 'Other', manufacturer: 'Polymaker', brand: 'Fiberon', filamentType: 'PA-CF', nozzleTemp: 290, bedTemp: 50, maxVolumetricSpeed: 10, fanSpeedMin: 0, fanSpeedMax: 0, density: 1.20, notes: "Industrial Carbon Fiber Nylon." }),
  createPreset({ id: 'poly-fib-2', profileName: 'Polymaker Fiberon PA6-GF', printerBrand: 'Other', manufacturer: 'Polymaker', brand: 'Fiberon', filamentType: 'PA-GF', nozzleTemp: 285, bedTemp: 50, maxVolumetricSpeed: 10, fanSpeedMin: 0, fanSpeedMax: 0, density: 1.25, notes: "Industrial Glass Fiber Nylon." }),
  createPreset({ id: 'poly-fib-3', profileName: 'Polymaker Fiberon PET-CF', printerBrand: 'Other', manufacturer: 'Polymaker', brand: 'Fiberon', filamentType: 'PETG', nozzleTemp: 260, bedTemp: 80, maxVolumetricSpeed: 12, fanSpeedMin: 0, fanSpeedMax: 30, density: 1.28, notes: "Carbon Fiber PET." }),
  createPreset({ id: 'poly-fib-4', profileName: 'Polymaker Fiberon ABS-CF', printerBrand: 'Other', manufacturer: 'Polymaker', brand: 'Fiberon', filamentType: 'ABS', nozzleTemp: 260, bedTemp: 100, maxVolumetricSpeed: 12, fanSpeedMin: 0, fanSpeedMax: 0, density: 1.08, notes: "Carbon Fiber ABS." }),
  createPreset({ id: 'poly-fib-5', profileName: 'Polymaker Fiberon ASA-CF', printerBrand: 'Other', manufacturer: 'Polymaker', brand: 'Fiberon', filamentType: 'ASA', nozzleTemp: 260, bedTemp: 100, maxVolumetricSpeed: 12, fanSpeedMin: 0, fanSpeedMax: 0, density: 1.10, notes: "Carbon Fiber ASA." }),

  // Priline (Marketplace)
  createPreset({ id: 'pril-1', profileName: 'Priline Carbon Fiber PC', printerBrand: 'Other', manufacturer: 'Priline', brand: 'CF-PC', filamentType: 'PC', nozzleTemp: 255, bedTemp: 100, maxVolumetricSpeed: 12, fanSpeedMin: 0, fanSpeedMax: 20, density: 1.25, notes: "Popular Carbon Fiber Polycarbonate. Stiff and strong." }),
  createPreset({ id: 'pril-2', profileName: 'Priline TPU', printerBrand: 'Other', manufacturer: 'Priline', brand: 'TPU', filamentType: 'TPU', nozzleTemp: 220, bedTemp: 60, maxVolumetricSpeed: 4, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.21 }),

  // PrintaMent (AprintaPro - Austria)
  createPreset({ id: 'printm-1', profileName: 'PrintaMent PLA Soft-Touch', printerBrand: 'Other', manufacturer: 'PrintaMent', brand: 'PLA', filamentType: 'PLA', nozzleTemp: 210, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "Matte finish, less brittle." }),
  createPreset({ id: 'printm-2', profileName: 'PrintaMent PETG', printerBrand: 'Other', manufacturer: 'PrintaMent', brand: 'PETG', filamentType: 'PETG', nozzleTemp: 240, bedTemp: 75, maxVolumetricSpeed: 12, fanSpeedMin: 30, fanSpeedMax: 70, density: 1.27 }),
  createPreset({ id: 'printm-3', profileName: 'PrintaMent PC-ABS', printerBrand: 'Other', manufacturer: 'PrintaMent', brand: 'PC-ABS', filamentType: 'ABS', nozzleTemp: 270, bedTemp: 110, maxVolumetricSpeed: 12, fanSpeedMin: 0, fanSpeedMax: 20, density: 1.15, notes: "Strong alloy. Enclosure required." }),

  // Proto-pasta (USA - Exotics)
  createPreset({ id: 'proto-1', profileName: 'Proto-pasta CF HTPLA', printerBrand: 'Other', manufacturer: 'Proto-pasta', brand: 'HTPLA', filamentType: 'PLA', nozzleTemp: 220, bedTemp: 60, maxVolumetricSpeed: 12, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.30, notes: "Carbon Fiber PLA. Annealable. Hardened Nozzle." }),
  createPreset({ id: 'proto-2', profileName: 'Proto-pasta Conductive PLA', printerBrand: 'Other', manufacturer: 'Proto-pasta', brand: 'Conductive', filamentType: 'PLA', nozzleTemp: 215, bedTemp: 60, maxVolumetricSpeed: 10, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.25, notes: "Electrically conductive. Low resistance." }),
  createPreset({ id: 'proto-3', profileName: 'Proto-pasta Magnetic Iron PLA', printerBrand: 'Other', manufacturer: 'Proto-pasta', brand: 'Magnetic', filamentType: 'PLA', nozzleTemp: 195, bedTemp: 60, maxVolumetricSpeed: 8, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.80, notes: "Ferromagnetic. Rustable. 0.6mm nozzle required." }),
  createPreset({ id: 'proto-4', profileName: 'Proto-pasta Stainless Steel PLA', printerBrand: 'Other', manufacturer: 'Proto-pasta', brand: 'Metal', filamentType: 'PLA', nozzleTemp: 205, bedTemp: 60, maxVolumetricSpeed: 8, fanSpeedMin: 100, fanSpeedMax: 100, density: 2.40, notes: "Heavy, polishable. 0.6mm nozzle." }),

  // Prusa (Prusament)
  createPreset({ id: 'pru-1', profileName: 'Prusament PLA', printerBrand: 'Prusa', manufacturer: 'Prusa', brand: 'Prusament', filamentType: 'PLA', nozzleTemp: 215, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24 }),
  createPreset({ id: 'pru-2', profileName: 'Prusament PETG', printerBrand: 'Prusa', manufacturer: 'Prusa', brand: 'Prusament', filamentType: 'PETG', nozzleTemp: 250, bedTemp: 85, maxVolumetricSpeed: 13, fanSpeedMin: 30, fanSpeedMax: 50, density: 1.27 }),
  createPreset({ id: 'pru-3', profileName: 'Prusament ASA', printerBrand: 'Prusa', manufacturer: 'Prusa', brand: 'Prusament', filamentType: 'ASA', nozzleTemp: 260, bedTemp: 105, maxVolumetricSpeed: 12, fanSpeedMin: 0, fanSpeedMax: 20, density: 1.07 }),
  createPreset({ id: 'pru-4', profileName: 'Prusament PC Blend', printerBrand: 'Prusa', manufacturer: 'Prusa', brand: 'Prusament', filamentType: 'PC', nozzleTemp: 275, bedTemp: 110, maxVolumetricSpeed: 12, fanSpeedMin: 0, fanSpeedMax: 10, density: 1.20, notes: "Easy print PC." }),
  createPreset({ id: 'pru-5', profileName: 'Prusament PETG Magnetite', printerBrand: 'Prusa', manufacturer: 'Prusa', brand: 'Prusament', filamentType: 'PETG', nozzleTemp: 250, bedTemp: 90, maxVolumetricSpeed: 10, fanSpeedMin: 30, fanSpeedMax: 60, density: 2.30, notes: "Magnetic PETG. 0.6mm nozzle recommended." }),

  // Qidi Tech
  createPreset({ id: 'qidi-1', profileName: 'Qidi Tech PLA Rapido', printerBrand: 'Other', manufacturer: 'Qidi Tech', brand: 'Rapido', filamentType: 'PLA', nozzleTemp: 220, bedTemp: 60, maxVolumetricSpeed: 25, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "High speed formula." }),
  createPreset({ id: 'qidi-2', profileName: 'Qidi Tech ABS-GF25', printerBrand: 'Other', manufacturer: 'Qidi Tech', brand: 'ABS-GF', filamentType: 'ABS', nozzleTemp: 260, bedTemp: 100, maxVolumetricSpeed: 14, fanSpeedMin: 0, fanSpeedMax: 0, density: 1.15, notes: "Glass Fiber reinforced ABS. High strength." }),
  createPreset({ id: 'qidi-3', profileName: 'Qidi Tech PA12-CF', printerBrand: 'Other', manufacturer: 'Qidi Tech', brand: 'PA12-CF', filamentType: 'PA-CF', nozzleTemp: 290, bedTemp: 80, maxVolumetricSpeed: 10, fanSpeedMin: 0, fanSpeedMax: 0, density: 1.05, dryingTemp: 100, dryingTime: '8h', notes: "Nylon 12 Carbon Fiber. Low moisture absorption." }),
  createPreset({ id: 'qidi-4', profileName: 'Qidi Tech PETG-Tough', printerBrand: 'Other', manufacturer: 'Qidi Tech', brand: 'PETG', filamentType: 'PETG', nozzleTemp: 240, bedTemp: 80, maxVolumetricSpeed: 12, fanSpeedMin: 30, fanSpeedMax: 70, density: 1.27 }),
  
  // R3D (China - Budget)
  createPreset({ id: 'r3d-1', profileName: 'R3D PLA', printerBrand: 'Other', manufacturer: 'R3D', brand: 'PLA', filamentType: 'PLA', nozzleTemp: 205, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24 }),
  createPreset({ id: 'r3d-2', profileName: 'R3D PETG', printerBrand: 'Other', manufacturer: 'R3D', brand: 'PETG', filamentType: 'PETG', nozzleTemp: 235, bedTemp: 75, maxVolumetricSpeed: 12, fanSpeedMin: 40, fanSpeedMax: 80, density: 1.27 }),
  createPreset({ id: 'r3d-3', profileName: 'R3D PLA-CF', printerBrand: 'Other', manufacturer: 'R3D', brand: 'PLA-CF', filamentType: 'PLA', nozzleTemp: 215, bedTemp: 60, maxVolumetricSpeed: 12, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.28, notes: "Carbon Fiber PLA. Budget option." }),

  // Raise3D
  createPreset({ id: 'raise-1', profileName: 'Raise3D Premium PLA', printerBrand: 'Other', manufacturer: 'Raise3D', brand: 'Premium', filamentType: 'PLA', nozzleTemp: 215, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24 }),
  createPreset({ id: 'raise-2', profileName: 'Raise3D Hyper Speed PLA', printerBrand: 'Other', manufacturer: 'Raise3D', brand: 'Hyper Speed', filamentType: 'PLA', nozzleTemp: 220, bedTemp: 60, maxVolumetricSpeed: 25, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "Optimized for Hyper FFF." }),
  createPreset({ id: 'raise-3', profileName: 'Raise3D Premium ABS', printerBrand: 'Other', manufacturer: 'Raise3D', brand: 'Premium', filamentType: 'ABS', nozzleTemp: 250, bedTemp: 100, maxVolumetricSpeed: 15, fanSpeedMin: 0, fanSpeedMax: 20, density: 1.04 }),
  createPreset({ id: 'raise-4', profileName: 'Raise3D Premium PETG', printerBrand: 'Other', manufacturer: 'Raise3D', brand: 'Premium', filamentType: 'PETG', nozzleTemp: 240, bedTemp: 80, maxVolumetricSpeed: 13, fanSpeedMin: 40, fanSpeedMax: 80, density: 1.27 }),

  // Real Filament
  createPreset({ id: 'real-1', profileName: 'Real Filament PLA', printerBrand: 'Other', manufacturer: 'Real Filament', brand: 'PLA', filamentType: 'PLA', nozzleTemp: 205, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24 }),
  createPreset({ id: 'real-2', profileName: 'Real Filament PETG', printerBrand: 'Other', manufacturer: 'Real Filament', brand: 'PETG', filamentType: 'PETG', nozzleTemp: 240, bedTemp: 75, maxVolumetricSpeed: 12, fanSpeedMin: 40, fanSpeedMax: 80, density: 1.27 }),

  // Recreus (Spain - FilaFlex)
  createPreset({ id: 'rec-1', profileName: 'Recreus FilaFlex 82A', printerBrand: 'Other', manufacturer: 'Recreus', brand: 'FilaFlex', filamentType: 'TPU', nozzleTemp: 230, bedTemp: 50, maxVolumetricSpeed: 2.5, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.20, notes: "Original flexible filament. Slow print speed." }),
  createPreset({ id: 'rec-2', profileName: 'Recreus FilaFlex 95A', printerBrand: 'Other', manufacturer: 'Recreus', brand: 'FilaFlex', filamentType: 'TPU', nozzleTemp: 230, bedTemp: 50, maxVolumetricSpeed: 5, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.22, notes: "Easy to print flexible." }),
  createPreset({ id: 'rec-3', profileName: 'Recreus PP3D', printerBrand: 'Other', manufacturer: 'Recreus', brand: 'PP3D', filamentType: 'Other', nozzleTemp: 230, bedTemp: 60, maxVolumetricSpeed: 8, fanSpeedMin: 50, fanSpeedMax: 100, density: 0.92, notes: "Polypropylene. Primer needed for adhesion." }),
  createPreset({ id: 'rec-4', profileName: 'Recreus Conductive FilaFlex', printerBrand: 'Other', manufacturer: 'Recreus', brand: 'Conductive', filamentType: 'TPU', nozzleTemp: 240, bedTemp: 50, maxVolumetricSpeed: 3, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.25, notes: "Electrically conductive TPU." }),

  // Rosa3D (Poland)
  createPreset({ id: 'rosa-1', profileName: 'Rosa3D PLA Starter', printerBrand: 'Other', manufacturer: 'Rosa3D', brand: 'Starter', filamentType: 'PLA', nozzleTemp: 210, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24 }),
  createPreset({ id: 'rosa-2', profileName: 'Rosa3D PC-PBT', printerBrand: 'Other', manufacturer: 'Rosa3D', brand: 'PC-PBT', filamentType: 'Other', nozzleTemp: 260, bedTemp: 100, maxVolumetricSpeed: 10, fanSpeedMin: 0, fanSpeedMax: 20, density: 1.22, notes: "Engineering blend. High impact, chemical resistance." }),
  createPreset({ id: 'rosa-3', profileName: 'Rosa3D PVB', printerBrand: 'Other', manufacturer: 'Rosa3D', brand: 'PVB', filamentType: 'Other', nozzleTemp: 215, bedTemp: 65, maxVolumetricSpeed: 12, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.10, notes: "Smoothable with Isopropyl Alcohol (IPA)." }),
  createPreset({ id: 'rosa-4', profileName: 'Rosa3D PLA-CF', printerBrand: 'Other', manufacturer: 'Rosa3D', brand: 'PLA-CF', filamentType: 'PLA', nozzleTemp: 215, bedTemp: 60, maxVolumetricSpeed: 12, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.26, notes: "Carbon Fiber PLA." }),

  // SainSmart (China/USA)
  createPreset({ id: 'ss-1', profileName: 'SainSmart TPU 95A', printerBrand: 'Other', manufacturer: 'SainSmart', brand: 'TPU', filamentType: 'TPU', nozzleTemp: 220, bedTemp: 60, maxVolumetricSpeed: 3.5, fanSpeedMin: 80, fanSpeedMax: 100, density: 1.21 }),
  createPreset({ id: 'ss-2', profileName: 'SainSmart GT-3 High Flow PLA', printerBrand: 'Other', manufacturer: 'SainSmart', brand: 'GT-3', filamentType: 'PLA', nozzleTemp: 215, bedTemp: 60, maxVolumetricSpeed: 22, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "High speed formula." }),
  createPreset({ id: 'ss-3', profileName: 'SainSmart CF-PLA', printerBrand: 'Other', manufacturer: 'SainSmart', brand: 'CF-PLA', filamentType: 'PLA', nozzleTemp: 220, bedTemp: 60, maxVolumetricSpeed: 12, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.28, notes: "Carbon Fiber PLA. Hardened Nozzle." }),
  createPreset({ id: 'ss-4', profileName: 'SainSmart PRO-3 PETG', printerBrand: 'Other', manufacturer: 'SainSmart', brand: 'PRO-3', filamentType: 'PETG', nozzleTemp: 240, bedTemp: 80, maxVolumetricSpeed: 12, fanSpeedMin: 40, fanSpeedMax: 80, density: 1.27 }),

  // Sakata 3D (Spain)
  createPreset({ id: 'saka-1', profileName: 'Sakata 3D PLA 850', printerBrand: 'Other', manufacturer: 'Sakata 3D', brand: '850', filamentType: 'PLA', nozzleTemp: 210, bedTemp: 60, maxVolumetricSpeed: 18, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "Ingeo 3D850. High performance, crystallizable." }),
  createPreset({ id: 'saka-2', profileName: 'Sakata 3D PLA 870', printerBrand: 'Other', manufacturer: 'Sakata 3D', brand: '870', filamentType: 'PLA', nozzleTemp: 220, bedTemp: 60, maxVolumetricSpeed: 18, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "Ingeo 3D870. High impact resistance, ABS alternative." }),
  createPreset({ id: 'saka-3', profileName: 'Sakata 3D ABS-E', printerBrand: 'Other', manufacturer: 'Sakata 3D', brand: 'ABS-E', filamentType: 'ABS', nozzleTemp: 245, bedTemp: 95, maxVolumetricSpeed: 14, fanSpeedMin: 0, fanSpeedMax: 20, density: 1.04, notes: "Low odor ABS." }),
  createPreset({ id: 'saka-4', profileName: 'Sakata 3D Flex X-920', printerBrand: 'Other', manufacturer: 'Sakata 3D', brand: 'Flex', filamentType: 'TPU', nozzleTemp: 230, bedTemp: 50, maxVolumetricSpeed: 4, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.22, notes: "Biodegradable flexible filament." }),
  
  // Siraya Tech
  createPreset({ id: 'sir-1', profileName: 'Siraya Tech ABS-GF', printerBrand: 'Other', manufacturer: 'Siraya Tech', brand: 'ABS-GF', filamentType: 'ABS', nozzleTemp: 250, bedTemp: 100, maxVolumetricSpeed: 12, fanSpeedMin: 0, fanSpeedMax: 0, density: 1.10, notes: "Glass Fiber ABS." }),
  createPreset({ id: 'sir-2', profileName: 'Siraya Tech PEBA', printerBrand: 'Other', manufacturer: 'Siraya Tech', brand: 'PEBA', filamentType: 'PEBA', nozzleTemp: 235, bedTemp: 50, maxVolumetricSpeed: 4, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.05 }),
  createPreset({ id: 'sir-3', profileName: 'Siraya Tech ABS-CF', printerBrand: 'Other', manufacturer: 'Siraya Tech', brand: 'ABS-CF', filamentType: 'ABS', nozzleTemp: 260, bedTemp: 100, maxVolumetricSpeed: 12, fanSpeedMin: 0, fanSpeedMax: 0, density: 1.10, notes: "Carbon Fiber ABS. High heat deflection." }),

  // Smart Materials 3D (Spain)
  createPreset({ id: 'smart-1', profileName: 'Smartfil PLA', printerBrand: 'Other', manufacturer: 'Smart Materials 3D', brand: 'Smartfil', filamentType: 'PLA', nozzleTemp: 210, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24 }),
  createPreset({ id: 'smart-2', profileName: 'Smartfil EP (Easy Print)', printerBrand: 'Other', manufacturer: 'Smart Materials 3D', brand: 'Smartfil EP', filamentType: 'PLA', nozzleTemp: 205, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "Easy sanding, satin finish. Contains chalk." }),
  createPreset({ id: 'smart-3', profileName: 'Innovatefil PEEK', printerBrand: 'Other', manufacturer: 'Smart Materials 3D', brand: 'Innovatefil', filamentType: 'Other', nozzleTemp: 390, bedTemp: 120, maxVolumetricSpeed: 6, fanSpeedMin: 0, fanSpeedMax: 20, density: 1.30, notes: "PEEK. Requires heated chamber." }),
  createPreset({ id: 'smart-4', profileName: 'Innovatefil PA FC (Nylon Carbon)', printerBrand: 'Other', manufacturer: 'Smart Materials 3D', brand: 'Innovatefil', filamentType: 'PA-CF', nozzleTemp: 260, bedTemp: 90, maxVolumetricSpeed: 8, fanSpeedMin: 0, fanSpeedMax: 0, density: 1.20, notes: "Conductive Carbon Nylon." }),

  // Soleiyn (Budget/Consumer)
  createPreset({ id: 'soleiyn-1', profileName: 'Soleiyn PLA', printerBrand: 'Other', manufacturer: 'Soleiyn', brand: 'PLA', filamentType: 'PLA', nozzleTemp: 205, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24 }),
  createPreset({ id: 'soleiyn-2', profileName: 'Soleiyn PETG', printerBrand: 'Other', manufacturer: 'Soleiyn', brand: 'PETG', filamentType: 'PETG', nozzleTemp: 235, bedTemp: 75, maxVolumetricSpeed: 12, fanSpeedMin: 30, fanSpeedMax: 70, density: 1.27 }),
  createPreset({ id: 'soleiyn-3', profileName: 'Soleiyn Silk PLA', printerBrand: 'Other', manufacturer: 'Soleiyn', brand: 'Silk', filamentType: 'PLA', nozzleTemp: 210, bedTemp: 60, maxVolumetricSpeed: 12, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "Shiny finish." }),
  createPreset({ id: 'soleiyn-4', profileName: 'Soleiyn TPU', printerBrand: 'Other', manufacturer: 'Soleiyn', brand: 'TPU', filamentType: 'TPU', nozzleTemp: 220, bedTemp: 50, maxVolumetricSpeed: 4, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.21 }),

  // Sovol
  createPreset({ id: 'sovol-1', profileName: 'Sovol PLA', printerBrand: 'Other', manufacturer: 'Sovol', brand: 'PLA', filamentType: 'PLA', nozzleTemp: 200, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24 }),
  createPreset({ id: 'sovol-2', profileName: 'Sovol PETG', printerBrand: 'Other', manufacturer: 'Sovol', brand: 'PETG', filamentType: 'PETG', nozzleTemp: 240, bedTemp: 80, maxVolumetricSpeed: 12, fanSpeedMin: 40, fanSpeedMax: 80, density: 1.27 }),
  createPreset({ id: 'sovol-3', profileName: 'Sovol TPU', printerBrand: 'Other', manufacturer: 'Sovol', brand: 'TPU', filamentType: 'TPU', nozzleTemp: 225, bedTemp: 50, maxVolumetricSpeed: 4, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.21 }),
  createPreset({ id: 'sovol-4', profileName: 'Sovol ASA', printerBrand: 'Other', manufacturer: 'Sovol', brand: 'ASA', filamentType: 'ASA', nozzleTemp: 250, bedTemp: 100, maxVolumetricSpeed: 14, fanSpeedMin: 0, fanSpeedMax: 20, density: 1.07 }),

  // Spectrum Filaments (Poland)
  createPreset({ id: 'spec-1', profileName: 'Spectrum PLA Premium', printerBrand: 'Other', manufacturer: 'Spectrum Filaments', brand: 'Premium', filamentType: 'PLA', nozzleTemp: 200, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24 }),
  createPreset({ id: 'spec-2', profileName: 'Spectrum ASA 275', printerBrand: 'Other', manufacturer: 'Spectrum Filaments', brand: 'ASA 275', filamentType: 'ASA', nozzleTemp: 240, bedTemp: 90, maxVolumetricSpeed: 14, fanSpeedMin: 0, fanSpeedMax: 20, density: 1.07, notes: "Optimized for easier printing." }),
  createPreset({ id: 'spec-3', profileName: 'Spectrum PA6 Low Warp', printerBrand: 'Other', manufacturer: 'Spectrum Filaments', brand: 'PA6', filamentType: 'Nylon', nozzleTemp: 255, bedTemp: 85, maxVolumetricSpeed: 8, fanSpeedMin: 0, fanSpeedMax: 0, density: 1.14, dryingTemp: 80, dryingTime: '8h', notes: "Low warp Nylon blend." }),
  createPreset({ id: 'spec-4', profileName: 'Spectrum Stone Age PLA', printerBrand: 'Other', manufacturer: 'Spectrum Filaments', brand: 'Stone Age', filamentType: 'PLA', nozzleTemp: 205, bedTemp: 60, maxVolumetricSpeed: 12, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.30, notes: "Stone texture effect." }),

  // SpiderMaker (Taiwan)
  createPreset({ id: 'spider-1', profileName: 'SpiderMaker Matte PLA', printerBrand: 'Other', manufacturer: 'SpiderMaker', brand: 'Matte', filamentType: 'PLA', nozzleTemp: 210, bedTemp: 50, maxVolumetricSpeed: 12, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.30, notes: "Pastel matte finish. Low stringing." }),

  // Stratasys (Generic Compatible Profiles)
  createPreset({ id: 'str-1', profileName: 'Stratasys-Compatible ABS-M30', printerBrand: 'Other', manufacturer: 'Stratasys', brand: 'ABS-M30', filamentType: 'ABS', nozzleTemp: 270, bedTemp: 110, maxVolumetricSpeed: 12, fanSpeedMin: 0, fanSpeedMax: 10, density: 1.04, notes: "High strength ABS. Requires high temp chamber." }),
  createPreset({ id: 'str-2', profileName: 'Stratasys-Compatible ASA', printerBrand: 'Other', manufacturer: 'Stratasys', brand: 'ASA', filamentType: 'ASA', nozzleTemp: 270, bedTemp: 110, maxVolumetricSpeed: 12, fanSpeedMin: 0, fanSpeedMax: 20, density: 1.07, notes: "UV stable industrial ASA." }),
  createPreset({ id: 'str-3', profileName: 'Stratasys-Compatible ULTEM 9085', printerBrand: 'Other', manufacturer: 'Stratasys', brand: 'ULTEM', filamentType: 'Other', nozzleTemp: 375, bedTemp: 160, maxVolumetricSpeed: 6, fanSpeedMin: 0, fanSpeedMax: 0, density: 1.34, notes: "PEI Aerospace grade. Extreme temp requirements." }),

  // Sunlu (Expanded)
  createPreset({ id: 'sun-1', profileName: 'Sunlu PLA', printerBrand: 'Other', manufacturer: 'Sunlu', brand: 'PLA', filamentType: 'PLA', nozzleTemp: 205, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24 }),
  createPreset({ id: 'sun-2', profileName: 'Sunlu PETG', printerBrand: 'Other', manufacturer: 'Sunlu', brand: 'PETG', filamentType: 'PETG', nozzleTemp: 235, bedTemp: 70, maxVolumetricSpeed: 12, fanSpeedMin: 40, fanSpeedMax: 80, density: 1.27 }),
  createPreset({ id: 'sun-3', profileName: 'Sunlu ABS', printerBrand: 'Other', manufacturer: 'Sunlu', brand: 'ABS', filamentType: 'ABS', nozzleTemp: 245, bedTemp: 95, maxVolumetricSpeed: 15, fanSpeedMin: 0, fanSpeedMax: 20, density: 1.04 }),
  createPreset({ id: 'sun-4', profileName: 'Sunlu PLA+', printerBrand: 'Other', manufacturer: 'Sunlu', brand: 'PLA+', filamentType: 'PLA', nozzleTemp: 215, bedTemp: 60, maxVolumetricSpeed: 16, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "Enhanced toughness." }),
  createPreset({ id: 'sun-5', profileName: 'Sunlu PLA Meta', printerBrand: 'Other', manufacturer: 'Sunlu', brand: 'Meta', filamentType: 'PLA', nozzleTemp: 190, bedTemp: 55, maxVolumetricSpeed: 18, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "High flow, low temp, high impact." }),
  createPreset({ id: 'sun-6', profileName: 'Sunlu Silk PLA', printerBrand: 'Other', manufacturer: 'Sunlu', brand: 'Silk', filamentType: 'PLA', nozzleTemp: 210, bedTemp: 60, maxVolumetricSpeed: 12, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "Shiny finish." }),
  createPreset({ id: 'sun-7', profileName: 'Sunlu Matte PLA', printerBrand: 'Other', manufacturer: 'Sunlu', brand: 'Matte', filamentType: 'PLA', nozzleTemp: 205, bedTemp: 60, maxVolumetricSpeed: 14, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.28, notes: "Matte surface." }),
  createPreset({ id: 'sun-8', profileName: 'Sunlu TPU', printerBrand: 'Other', manufacturer: 'Sunlu', brand: 'TPU', filamentType: 'TPU', nozzleTemp: 225, bedTemp: 50, maxVolumetricSpeed: 4, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.21 }),
  createPreset({ id: 'sun-9', profileName: 'Sunlu ASA', printerBrand: 'Other', manufacturer: 'Sunlu', brand: 'ASA', filamentType: 'ASA', nozzleTemp: 250, bedTemp: 90, maxVolumetricSpeed: 14, fanSpeedMin: 0, fanSpeedMax: 20, density: 1.07 }),
  createPreset({ id: 'sun-10', profileName: 'Sunlu Wood PLA', printerBrand: 'Other', manufacturer: 'Sunlu', brand: 'Wood', filamentType: 'PLA', nozzleTemp: 205, bedTemp: 55, maxVolumetricSpeed: 10, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.20 }),

  // Taulman3D (USA - Nylon Specialists)
  createPreset({ id: 'taul-1', profileName: 'Taulman Bridge Nylon', printerBrand: 'Other', manufacturer: 'Taulman3D', brand: 'Bridge', filamentType: 'Nylon', nozzleTemp: 250, bedTemp: 50, maxVolumetricSpeed: 10, fanSpeedMin: 0, fanSpeedMax: 0, density: 1.13, dryingTemp: 80, dryingTime: '12h', notes: "Easy printing Nylon PA6/66." }),
  createPreset({ id: 'taul-2', profileName: 'Taulman Alloy 910', printerBrand: 'Other', manufacturer: 'Taulman3D', brand: 'Alloy 910', filamentType: 'Nylon', nozzleTemp: 255, bedTemp: 50, maxVolumetricSpeed: 10, fanSpeedMin: 0, fanSpeedMax: 0, density: 1.14, notes: "High tensile strength. Low shrinkage." }),
  createPreset({ id: 'taul-3', profileName: 'Taulman T-Glase', printerBrand: 'Other', manufacturer: 'Taulman3D', brand: 'T-Glase', filamentType: 'PETT', nozzleTemp: 240, bedTemp: 65, maxVolumetricSpeed: 10, fanSpeedMin: 20, fanSpeedMax: 50, density: 1.27, notes: "High optical clarity PETT. Print slow for clear parts." }),
  createPreset({ id: 'taul-4', profileName: 'Taulman PCTPE', printerBrand: 'Other', manufacturer: 'Taulman3D', brand: 'PCTPE', filamentType: 'Nylon', nozzleTemp: 235, bedTemp: 45, maxVolumetricSpeed: 8, fanSpeedMin: 0, fanSpeedMax: 0, density: 1.10, notes: "Flexible Nylon. Nylon/TPE blend." }),
  createPreset({ id: 'taul-5', profileName: 'Taulman Nylon 230', printerBrand: 'Other', manufacturer: 'Taulman3D', brand: 'Nylon 230', filamentType: 'Nylon', nozzleTemp: 230, bedTemp: 50, maxVolumetricSpeed: 10, fanSpeedMin: 0, fanSpeedMax: 0, density: 1.14, notes: "Low temp Nylon. Printable on non-all-metal hotends." }),

  // TECBears
  createPreset({ id: 'tec-1', profileName: 'TECBears PLA', printerBrand: 'Other', manufacturer: 'TECBears', brand: 'PLA', filamentType: 'PLA', nozzleTemp: 205, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24 }),
  createPreset({ id: 'tec-2', profileName: 'TECBears PETG', printerBrand: 'Other', manufacturer: 'TECBears', brand: 'PETG', filamentType: 'PETG', nozzleTemp: 235, bedTemp: 75, maxVolumetricSpeed: 12, fanSpeedMin: 40, fanSpeedMax: 80, density: 1.27 }),

  // TechInit (Italy)
  createPreset({ id: 'tech-1', profileName: 'TechInit Carbon PA', printerBrand: 'Other', manufacturer: 'TechInit', brand: 'Carbon', filamentType: 'PA-CF', nozzleTemp: 260, bedTemp: 90, maxVolumetricSpeed: 8, fanSpeedMin: 0, fanSpeedMax: 0, density: 1.22, notes: "Technical Carbon Nylon." }),
  createPreset({ id: 'tech-2', profileName: 'TechInit PC-ABS', printerBrand: 'Other', manufacturer: 'TechInit', brand: 'PC-ABS', filamentType: 'ABS', nozzleTemp: 270, bedTemp: 100, maxVolumetricSpeed: 12, fanSpeedMin: 0, fanSpeedMax: 20, density: 1.15 }),
  createPreset({ id: 'tech-3', profileName: 'TechInit ASA', printerBrand: 'Other', manufacturer: 'TechInit', brand: 'ASA', filamentType: 'ASA', nozzleTemp: 250, bedTemp: 95, maxVolumetricSpeed: 14, fanSpeedMin: 0, fanSpeedMax: 20, density: 1.07 }),
  createPreset({ id: 'tech-4', profileName: 'TechInit PETG Technical', printerBrand: 'Other', manufacturer: 'TechInit', brand: 'PETG', filamentType: 'PETG', nozzleTemp: 240, bedTemp: 75, maxVolumetricSpeed: 12, fanSpeedMin: 40, fanSpeedMax: 80, density: 1.27 }),

  // Tianse
  createPreset({ id: 'tian-1', profileName: 'Tianse PLA', printerBrand: 'Other', manufacturer: 'Tianse', brand: 'PLA', filamentType: 'PLA', nozzleTemp: 200, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24 }),
  createPreset({ id: 'tian-2', profileName: 'Tianse TPU', printerBrand: 'Other', manufacturer: 'Tianse', brand: 'TPU', filamentType: 'TPU', nozzleTemp: 220, bedTemp: 50, maxVolumetricSpeed: 4, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.21 }),

  // Tinmorry
  createPreset({ id: 'tin-1', profileName: 'Tinmorry PLA', printerBrand: 'Other', manufacturer: 'Tinmorry', brand: 'PLA', filamentType: 'PLA', nozzleTemp: 205, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24 }),
  createPreset({ id: 'tin-2', profileName: 'Tinmorry Matte PLA', printerBrand: 'Other', manufacturer: 'Tinmorry', brand: 'Matte', filamentType: 'PLA', nozzleTemp: 200, bedTemp: 60, maxVolumetricSpeed: 14, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.28 }),
  createPreset({ id: 'tin-3', profileName: 'Tinmorry Silk PLA', printerBrand: 'Other', manufacturer: 'Tinmorry', brand: 'Silk', filamentType: 'PLA', nozzleTemp: 210, bedTemp: 60, maxVolumetricSpeed: 12, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24 }),
  createPreset({ id: 'tin-4', profileName: 'Tinmorry PETG', printerBrand: 'Other', manufacturer: 'Tinmorry', brand: 'PETG', filamentType: 'PETG', nozzleTemp: 235, bedTemp: 70, maxVolumetricSpeed: 12, fanSpeedMin: 40, fanSpeedMax: 80, density: 1.27 }),

  // Torupy
  createPreset({ id: 'tor-1', profileName: 'Torupy PLA', printerBrand: 'Other', manufacturer: 'Torupy', brand: 'PLA', filamentType: 'PLA', nozzleTemp: 210, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24 }),
  createPreset({ id: 'tor-2', profileName: 'Torupy PETG', printerBrand: 'Other', manufacturer: 'Torupy', brand: 'PETG', filamentType: 'PETG', nozzleTemp: 240, bedTemp: 75, maxVolumetricSpeed: 12, fanSpeedMin: 30, fanSpeedMax: 70, density: 1.27 }),
  createPreset({ id: 'tor-3', profileName: 'Torupy Silk PLA', printerBrand: 'Other', manufacturer: 'Torupy', brand: 'Silk', filamentType: 'PLA', nozzleTemp: 215, bedTemp: 60, maxVolumetricSpeed: 12, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24 }),
  createPreset({ id: 'tor-4', profileName: 'Torupy TPU', printerBrand: 'Other', manufacturer: 'Torupy', brand: 'TPU', filamentType: 'TPU', nozzleTemp: 220, bedTemp: 50, maxVolumetricSpeed: 4, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.21 }),

  // Treed Filaments (Italy - Technical/Architectural)
  createPreset({ id: 'tree-1', profileName: 'Treed Kyotoflex (Bio TPE)', printerBrand: 'Other', manufacturer: 'Treed Filaments', brand: 'Kyotoflex', filamentType: 'TPE', nozzleTemp: 230, bedTemp: 40, maxVolumetricSpeed: 4, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.15, notes: "Biodegradable flexible." }),
  createPreset({ id: 'tree-2', profileName: 'Treed Caementum (Cement)', printerBrand: 'Other', manufacturer: 'Treed Filaments', brand: 'Architectural', filamentType: 'PLA', nozzleTemp: 215, bedTemp: 60, maxVolumetricSpeed: 10, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.60, notes: "Mineral filled, cement look. 0.6mm nozzle recommended." }),
  createPreset({ id: 'tree-3', profileName: 'Treed Heritage (Brick)', printerBrand: 'Other', manufacturer: 'Treed Filaments', brand: 'Architectural', filamentType: 'PLA', nozzleTemp: 215, bedTemp: 60, maxVolumetricSpeed: 10, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.50, notes: "Brick powder filled. 0.6mm nozzle recommended." }),
  createPreset({ id: 'tree-4', profileName: 'Treed Pneumatique (Recycled Tire)', printerBrand: 'Other', manufacturer: 'Treed Filaments', brand: 'Pneumatique', filamentType: 'TPU', nozzleTemp: 230, bedTemp: 50, maxVolumetricSpeed: 4, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.20, notes: "Made from recycled tires. Matte black rubber." }),
  createPreset({ id: 'tree-5', profileName: 'Treed Carbon PA', printerBrand: 'Other', manufacturer: 'Treed Filaments', brand: 'Carbon', filamentType: 'PA-CF', nozzleTemp: 255, bedTemp: 90, maxVolumetricSpeed: 8, fanSpeedMin: 0, fanSpeedMax: 0, density: 1.20, notes: "Carbon fiber reinforced Nylon." }),

  // Tronxy (China)
  createPreset({ id: 'tron-1', profileName: 'Tronxy PLA', printerBrand: 'Other', manufacturer: 'Tronxy', brand: 'PLA', filamentType: 'PLA', nozzleTemp: 200, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24 }),
  createPreset({ id: 'tron-2', profileName: 'Tronxy PETG', printerBrand: 'Other', manufacturer: 'Tronxy', brand: 'PETG', filamentType: 'PETG', nozzleTemp: 235, bedTemp: 75, maxVolumetricSpeed: 12, fanSpeedMin: 40, fanSpeedMax: 80, density: 1.27 }),
  createPreset({ id: 'tron-3', profileName: 'Tronxy TPU', printerBrand: 'Other', manufacturer: 'Tronxy', brand: 'TPU', filamentType: 'TPU', nozzleTemp: 220, bedTemp: 50, maxVolumetricSpeed: 3.5, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.21 }),

  // Ultimaker (Official Materials)
  createPreset({ id: 'ulti-1', profileName: 'Ultimaker PLA', printerBrand: 'Ultimaker', manufacturer: 'Ultimaker', brand: 'PLA', filamentType: 'PLA', nozzleTemp: 205, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24 }),
  createPreset({ id: 'ulti-2', profileName: 'Ultimaker Tough PLA', printerBrand: 'Ultimaker', manufacturer: 'Ultimaker', brand: 'Tough PLA', filamentType: 'PLA', nozzleTemp: 215, bedTemp: 60, maxVolumetricSpeed: 16, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "ABS strength with PLA printability." }),
  createPreset({ id: 'ulti-3', profileName: 'Ultimaker ABS', printerBrand: 'Ultimaker', manufacturer: 'Ultimaker', brand: 'ABS', filamentType: 'ABS', nozzleTemp: 240, bedTemp: 85, maxVolumetricSpeed: 12, fanSpeedMin: 0, fanSpeedMax: 50, density: 1.05 }),
  createPreset({ id: 'ulti-4', profileName: 'Ultimaker CPE', printerBrand: 'Ultimaker', manufacturer: 'Ultimaker', brand: 'CPE', filamentType: 'Copolyester', nozzleTemp: 250, bedTemp: 70, maxVolumetricSpeed: 12, fanSpeedMin: 50, fanSpeedMax: 100, density: 1.20, notes: "Co-polyester. Chemical resistant." }),
  createPreset({ id: 'ulti-5', profileName: 'Ultimaker CPE+', printerBrand: 'Ultimaker', manufacturer: 'Ultimaker', brand: 'CPE+', filamentType: 'Copolyester', nozzleTemp: 260, bedTemp: 110, maxVolumetricSpeed: 12, fanSpeedMin: 50, fanSpeedMax: 100, density: 1.18, notes: "High temp co-polyester." }),
  createPreset({ id: 'ulti-6', profileName: 'Ultimaker PC', printerBrand: 'Ultimaker', manufacturer: 'Ultimaker', brand: 'PC', filamentType: 'PC', nozzleTemp: 270, bedTemp: 110, maxVolumetricSpeed: 12, fanSpeedMin: 0, fanSpeedMax: 0, density: 1.20 }),
  createPreset({ id: 'ulti-7', profileName: 'Ultimaker Nylon', printerBrand: 'Ultimaker', manufacturer: 'Ultimaker', brand: 'Nylon', filamentType: 'Nylon', nozzleTemp: 250, bedTemp: 60, maxVolumetricSpeed: 10, fanSpeedMin: 35, fanSpeedMax: 100, density: 1.14 }),
  createPreset({ id: 'ulti-8', profileName: 'Ultimaker TPU 95A', printerBrand: 'Ultimaker', manufacturer: 'Ultimaker', brand: 'TPU 95A', filamentType: 'TPU', nozzleTemp: 225, bedTemp: 60, maxVolumetricSpeed: 5, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.22 }),

  // Verbatim (Mitsubishi Chemical)
  createPreset({ id: 'verb-1', profileName: 'Verbatim PLA', printerBrand: 'Other', manufacturer: 'Verbatim', brand: 'PLA', filamentType: 'PLA', nozzleTemp: 210, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24 }),
  createPreset({ id: 'verb-2', profileName: 'Verbatim PETG', printerBrand: 'Other', manufacturer: 'Verbatim', brand: 'PETG', filamentType: 'PETG', nozzleTemp: 235, bedTemp: 70, maxVolumetricSpeed: 12, fanSpeedMin: 40, fanSpeedMax: 80, density: 1.27 }),
  createPreset({ id: 'verb-3', profileName: 'Verbatim Durabio', printerBrand: 'Other', manufacturer: 'Verbatim', brand: 'Durabio', filamentType: 'Other', nozzleTemp: 235, bedTemp: 90, maxVolumetricSpeed: 10, fanSpeedMin: 20, fanSpeedMax: 50, density: 1.20, notes: "Bio-based PC resin. High transparency & impact." }),
  createPreset({ id: 'verb-4', profileName: 'Verbatim BVOH', printerBrand: 'Other', manufacturer: 'Verbatim', brand: 'BVOH', filamentType: 'Other', nozzleTemp: 210, bedTemp: 60, maxVolumetricSpeed: 8, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.14, notes: "Water soluble support material. Keep dry." }),

  // VoxelPLA (VOXEL)
  createPreset({ id: 'vox-1', profileName: 'VoxelPLA PLA+', printerBrand: 'Other', manufacturer: 'VoxelPLA', brand: 'PLA+', filamentType: 'PLA', nozzleTemp: 220, bedTemp: 60, maxVolumetricSpeed: 20, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "High Speed optimized PLA+. Great for Bambu/K1." }),
  createPreset({ id: 'vox-2', profileName: 'VoxelPLA PETG', printerBrand: 'Other', manufacturer: 'VoxelPLA', brand: 'PETG', filamentType: 'PETG', nozzleTemp: 240, bedTemp: 80, maxVolumetricSpeed: 12, fanSpeedMin: 40, fanSpeedMax: 80, density: 1.27 }),
  createPreset({ id: 'vox-3', profileName: 'VoxelPLA ABS', printerBrand: 'Other', manufacturer: 'VoxelPLA', brand: 'ABS', filamentType: 'ABS', nozzleTemp: 250, bedTemp: 100, maxVolumetricSpeed: 15, fanSpeedMin: 0, fanSpeedMax: 20, density: 1.04 }),
  createPreset({ id: 'vox-4', profileName: 'VoxelPLA TPU', printerBrand: 'Other', manufacturer: 'VoxelPLA', brand: 'TPU', filamentType: 'TPU', nozzleTemp: 220, bedTemp: 50, maxVolumetricSpeed: 4, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.21 }),

  // Voxelab
  createPreset({ id: 'vlb-1', profileName: 'Voxelab PLA', printerBrand: 'Other', manufacturer: 'Voxelab', brand: 'PLA', filamentType: 'PLA', nozzleTemp: 200, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24 }),
  createPreset({ id: 'vlb-2', profileName: 'Voxelab PLA Pro', printerBrand: 'Other', manufacturer: 'Voxelab', brand: 'PLA Pro', filamentType: 'PLA', nozzleTemp: 210, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "Stronger toughness." }),
  createPreset({ id: 'vlb-3', profileName: 'Voxelab Silk PLA', printerBrand: 'Other', manufacturer: 'Voxelab', brand: 'Silk', filamentType: 'PLA', nozzleTemp: 205, bedTemp: 60, maxVolumetricSpeed: 12, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24 }),
  createPreset({ id: 'vlb-4', profileName: 'Voxelab PETG', printerBrand: 'Other', manufacturer: 'Voxelab', brand: 'PETG', filamentType: 'PETG', nozzleTemp: 235, bedTemp: 75, maxVolumetricSpeed: 12, fanSpeedMin: 30, fanSpeedMax: 70, density: 1.27 }),
  createPreset({ id: 'vlb-5', profileName: 'Voxelab ABS', printerBrand: 'Other', manufacturer: 'Voxelab', brand: 'ABS', filamentType: 'ABS', nozzleTemp: 250, bedTemp: 100, maxVolumetricSpeed: 14, fanSpeedMin: 0, fanSpeedMax: 20, density: 1.04 }),
  createPreset({ id: 'vlb-6', profileName: 'Voxelab TPU', printerBrand: 'Other', manufacturer: 'Voxelab', brand: 'TPU', filamentType: 'TPU', nozzleTemp: 220, bedTemp: 60, maxVolumetricSpeed: 3, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.20 }),
  createPreset({ id: 'vlb-7', profileName: 'Voxelab Wood PLA', printerBrand: 'Other', manufacturer: 'Voxelab', brand: 'Wood', filamentType: 'PLA', nozzleTemp: 200, bedTemp: 50, maxVolumetricSpeed: 10, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.20 }),
  createPreset({ id: 'vlb-8', profileName: 'Voxelab Marble PLA', printerBrand: 'Other', manufacturer: 'Voxelab', brand: 'Marble', filamentType: 'PLA', nozzleTemp: 200, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24 }),

  // Winkle (Spain)
  createPreset({ id: 'wink-1', profileName: 'Winkle PLA HD', printerBrand: 'Other', manufacturer: 'Winkle', brand: 'PLA HD', filamentType: 'PLA', nozzleTemp: 205, bedTemp: 60, maxVolumetricSpeed: 16, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "High Definition standard PLA." }),
  createPreset({ id: 'wink-2', profileName: 'Winkle PLA 870', printerBrand: 'Other', manufacturer: 'Winkle', brand: 'PLA 870', filamentType: 'PLA', nozzleTemp: 215, bedTemp: 60, maxVolumetricSpeed: 18, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "High Impact PLA (Ingeo 870)." }),
  createPreset({ id: 'wink-3', profileName: 'Winkle ASA', printerBrand: 'Other', manufacturer: 'Winkle', brand: 'ASA', filamentType: 'ASA', nozzleTemp: 250, bedTemp: 90, maxVolumetricSpeed: 14, fanSpeedMin: 0, fanSpeedMax: 20, density: 1.07 }),
  createPreset({ id: 'wink-4', profileName: 'Winkle TPU', printerBrand: 'Other', manufacturer: 'Winkle', brand: 'TPU', filamentType: 'TPU', nozzleTemp: 225, bedTemp: 50, maxVolumetricSpeed: 4, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.21 }),

  // XSTRAND (Owens Corning - Industrial)
  createPreset({ id: 'xst-1', profileName: 'XSTRAND GF30-PA6', printerBrand: 'Other', manufacturer: 'XSTRAND (OwensCorning)', brand: 'GF30-PA6', filamentType: 'PA-GF', nozzleTemp: 260, bedTemp: 90, maxVolumetricSpeed: 8, fanSpeedMin: 0, fanSpeedMax: 0, density: 1.34, dryingTemp: 100, dryingTime: '6h', notes: "30% Glass Fiber Reinforced Nylon. Very abrasive." }),
  createPreset({ id: 'xst-2', profileName: 'XSTRAND GF30-PP', printerBrand: 'Other', manufacturer: 'XSTRAND (OwensCorning)', brand: 'GF30-PP', filamentType: 'Other', nozzleTemp: 260, bedTemp: 90, maxVolumetricSpeed: 8, fanSpeedMin: 0, fanSpeedMax: 0, density: 1.05, notes: "30% Glass Fiber Reinforced Polypropylene. Abrasive." }),
  createPreset({ id: 'xst-3', profileName: 'XSTRAND GF30-PC', printerBrand: 'Other', manufacturer: 'XSTRAND (OwensCorning)', brand: 'GF30-PC', filamentType: 'PC', nozzleTemp: 310, bedTemp: 110, maxVolumetricSpeed: 8, fanSpeedMin: 0, fanSpeedMax: 0, density: 1.32, notes: "30% Glass Fiber Polycarbonate. Extreme temp." }),

  // XYZprinting (Taiwan)
  createPreset({ id: 'xyz-1', profileName: 'XYZprinting PLA', printerBrand: 'Other', manufacturer: 'XYZprinting', brand: 'PLA', filamentType: 'PLA', nozzleTemp: 210, bedTemp: 45, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24 }),
  createPreset({ id: 'xyz-2', profileName: 'XYZprinting PETG', printerBrand: 'Other', manufacturer: 'XYZprinting', brand: 'PETG', filamentType: 'PETG', nozzleTemp: 235, bedTemp: 60, maxVolumetricSpeed: 12, fanSpeedMin: 40, fanSpeedMax: 80, density: 1.27 }),
  createPreset({ id: 'xyz-3', profileName: 'XYZprinting ABS', printerBrand: 'Other', manufacturer: 'XYZprinting', brand: 'ABS', filamentType: 'ABS', nozzleTemp: 240, bedTemp: 90, maxVolumetricSpeed: 14, fanSpeedMin: 0, fanSpeedMax: 20, density: 1.04 }),

  // Yousu (China)
  createPreset({ id: 'you-1', profileName: 'Yousu PLA', printerBrand: 'Other', manufacturer: 'Yousu', brand: 'PLA', filamentType: 'PLA', nozzleTemp: 200, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24 }),
  createPreset({ id: 'you-2', profileName: 'Yousu iForm 181', printerBrand: 'Other', manufacturer: 'Yousu', brand: 'iForm 181', filamentType: 'PLA', nozzleTemp: 215, bedTemp: 60, maxVolumetricSpeed: 16, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "High toughness PLA." }),
  createPreset({ id: 'you-3', profileName: 'Yousu PETG', printerBrand: 'Other', manufacturer: 'Yousu', brand: 'PETG', filamentType: 'PETG', nozzleTemp: 240, bedTemp: 80, maxVolumetricSpeed: 12, fanSpeedMin: 30, fanSpeedMax: 70, density: 1.27 }),
  createPreset({ id: 'you-4', profileName: 'Yousu TPU', printerBrand: 'Other', manufacturer: 'Yousu', brand: 'TPU', filamentType: 'TPU', nozzleTemp: 220, bedTemp: 50, maxVolumetricSpeed: 4, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.21 }),

  // Ziro (China)
  createPreset({ id: 'ziro-1', profileName: 'Ziro PLA Pro', printerBrand: 'Other', manufacturer: 'Ziro', brand: 'Pro', filamentType: 'PLA', nozzleTemp: 210, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24 }),
  createPreset({ id: 'ziro-2', profileName: 'Ziro Silk PLA', printerBrand: 'Other', manufacturer: 'Ziro', brand: 'Silk', filamentType: 'PLA', nozzleTemp: 205, bedTemp: 60, maxVolumetricSpeed: 12, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24 }),
  createPreset({ id: 'ziro-3', profileName: 'Ziro Marble PLA', printerBrand: 'Other', manufacturer: 'Ziro', brand: 'Marble', filamentType: 'PLA', nozzleTemp: 205, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24 }),
  createPreset({ id: 'ziro-4', profileName: 'Ziro Carbon Fiber PLA', printerBrand: 'Other', manufacturer: 'Ziro', brand: 'CF-PLA', filamentType: 'PLA', nozzleTemp: 215, bedTemp: 60, maxVolumetricSpeed: 12, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.28, notes: "Carbon Fiber filled. Matte black." }),
  createPreset({ id: 'ziro-5', profileName: 'Ziro TPU', printerBrand: 'Other', manufacturer: 'Ziro', brand: 'TPU', filamentType: 'TPU', nozzleTemp: 220, bedTemp: 50, maxVolumetricSpeed: 4, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.21 }),

  // Zortrax (Poland)
  createPreset({ id: 'zor-1', profileName: 'Zortrax Z-PLA Pro', printerBrand: 'Other', manufacturer: 'Zortrax', brand: 'Z-PLA', filamentType: 'PLA', nozzleTemp: 210, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24 }),
  createPreset({ id: 'zor-2', profileName: 'Zortrax Z-ABS', printerBrand: 'Other', manufacturer: 'Zortrax', brand: 'Z-ABS', filamentType: 'ABS', nozzleTemp: 275, bedTemp: 100, maxVolumetricSpeed: 14, fanSpeedMin: 0, fanSpeedMax: 20, density: 1.05 }),
  createPreset({ id: 'zor-3', profileName: 'Zortrax Z-PETG', printerBrand: 'Other', manufacturer: 'Zortrax', brand: 'Z-PETG', filamentType: 'PETG', nozzleTemp: 240, bedTemp: 75, maxVolumetricSpeed: 12, fanSpeedMin: 30, fanSpeedMax: 70, density: 1.27 }),
  createPreset({ id: 'zor-4', profileName: 'Zortrax Z-ULTRAT', printerBrand: 'Other', manufacturer: 'Zortrax', brand: 'Z-ULTRAT', filamentType: 'ABS', nozzleTemp: 265, bedTemp: 105, maxVolumetricSpeed: 14, fanSpeedMin: 0, fanSpeedMax: 10, density: 1.07, notes: "High impact ABS blend. Requires raft usually." })

];
