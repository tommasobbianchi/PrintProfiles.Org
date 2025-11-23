
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
  '3DJake', '3DQF', '3DTrček', '3DXTech', 'AddNorth', 'Amolen', 'Anycubic', 'Arianeplast', 'Atomic Filament', 'AzureFilm', 'Bambu Lab', 'BASF Forward AM', 'BIQU', 'CC3D', 'Cliever', 'Conjure', 'ColorFabb', 'Creality', 'Deeplee', 'Devil Design', 'Dikale', 'DSM Novamid', 'Duramic 3D', 'EUMAKERS', 'Elegoo', 'Eryone', 'eSUN', 'Extrudr', 'FiberForce', 'Fiberlogy', 'FilaCube', 'Filamentive', 'Filamentum', 'Fillamentum', 'FiloAlfa', 'FlashForge', 'FormFutura', 'Francofil', 'GST3D', 'Geeetech', 'GiantArm', 'GratKit', 'HZST3D', 'Hatchbox', 'IGUS', 'IIID MAX', 'Innofil3D', 'JAMG HE', 'JAYO', 'Kaige', 'Kexcelled', 'Kimya (Armor)', 'Kingroon', 'MakeShaper', 'MatterHackers', 'Microzey', 'NEVSBYE', 'Nanovia', 'NinjaTek', 'Numakers', 'Overture', 'Polymaker', 'Porima', 'Priline', 'PrintaMent', 'Printologist', 'Proto-pasta', 'Prusa', 'Qidi Tech', 'R3D', 'Recreus', 'Rosa3D', 'SainSmart', 'Sakata 3D', 'Siraya Tech', 'Smart Materials 3D', 'Spectrum Filaments', 'Stratasys', 'Sunlu', 'TECBears', 'Taulman3D', 'TechInit', 'Tianse', 'Tinmorry', 'Torupy', 'Treed Filaments', 'Tronxy', 'Ultimaker', 'Verbatim', 'VoxelPLA', 'Voxelab', 'Winkle', 'XSTRAND (OwensCorning)', 'XYZprinting', 'Yousu', 'Ziro', 'Other'
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

  // BASF Forward AM
  createPreset({ id: 'basf-1', profileName: 'BASF Ultrafuse PLA', printerBrand: 'Other', manufacturer: 'BASF Forward AM', brand: 'Ultrafuse', filamentType: 'PLA', nozzleTemp: 210, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24 }),
  createPreset({ id: 'basf-2', profileName: 'BASF Ultrafuse 316L', printerBrand: 'Other', manufacturer: 'BASF Forward AM', brand: 'Ultrafuse', filamentType: 'Other', nozzleTemp: 240, bedTemp: 100, maxVolumetricSpeed: 5, printSpeed: 20, fanSpeedMin: 0, fanSpeedMax: 0, density: 7.85, notes: "Metal filament. Requires sintering. Nozzle >= 0.4mm hardened. NO FAN." }),
  createPreset({ id: 'basf-3', profileName: 'BASF Ultrafuse TPU 85A', printerBrand: 'Other', manufacturer: 'BASF Forward AM', brand: 'Ultrafuse', filamentType: 'TPU', nozzleTemp: 220, bedTemp: 40, maxVolumetricSpeed: 3, fanSpeedMin: 80, fanSpeedMax: 100, density: 1.22 }),
  createPreset({ id: 'basf-4', profileName: 'BASF Ultrafuse rPET', printerBrand: 'Other', manufacturer: 'BASF Forward AM', brand: 'Ultrafuse', filamentType: 'PETG', nozzleTemp: 240, bedTemp: 70, maxVolumetricSpeed: 12, fanSpeedMin: 30, fanSpeedMax: 70, density: 1.27, notes: "Recycled PET." }),
  
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

  // Eryone (China)
  createPreset({ id: 'ery-1', profileName: 'Eryone PLA', printerBrand: 'Other', manufacturer: 'Eryone', brand: 'PLA', filamentType: 'PLA', nozzleTemp: 200, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24 }),
  createPreset({ id: 'ery-2', profileName: 'Eryone Matte PLA', printerBrand: 'Other', manufacturer: 'Eryone', brand: 'Matte', filamentType: 'PLA', nozzleTemp: 205, bedTemp: 60, maxVolumetricSpeed: 12, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.25, notes: "Matte finish. Reduce flow slightly." }),
  createPreset({ id: 'ery-3', profileName: 'Eryone Silk PLA', printerBrand: 'Other', manufacturer: 'Eryone', brand: 'Silk', filamentType: 'PLA', nozzleTemp: 210, bedTemp: 60, maxVolumetricSpeed: 12, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "High gloss. Slow down outer walls." }),
  createPreset({ id: 'ery-4', profileName: 'Eryone Galaxy PLA', printerBrand: 'Other', manufacturer: 'Eryone', brand: 'Galaxy', filamentType: 'PLA', nozzleTemp: 210, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "Glitter effect." }),
  createPreset({ id: 'ery-5', profileName: 'Eryone PETG', printerBrand: 'Other', manufacturer: 'Eryone', brand: 'PETG', filamentType: 'PETG', nozzleTemp: 235, bedTemp: 75, maxVolumetricSpeed: 12, fanSpeedMin: 30, fanSpeedMax: 70, density: 1.27 }),
  createPreset({ id: 'ery-6', profileName: 'Eryone TPU 95A', printerBrand: 'Other', manufacturer: 'Eryone', brand: 'TPU', filamentType: 'TPU', nozzleTemp: 220, bedTemp: 50, maxVolumetricSpeed: 4, fanSpeedMin: 80, fanSpeedMax: 100, density: 1.21 }),
  
  // eSUN
  createPreset({ id: 'esun-1', profileName: 'eSUN PLA+', printerBrand: 'Other', manufacturer: 'eSUN', brand: 'PLA+', filamentType: 'PLA', nozzleTemp: 215, bedTemp: 60, maxVolumetricSpeed: 18, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "Industry standard PLA+." }),
  createPreset({ id: 'esun-2', profileName: 'eSUN PETG', printerBrand: 'Other', manufacturer: 'eSUN', brand: 'PETG', filamentType: 'PETG', nozzleTemp: 240, bedTemp: 80, maxVolumetricSpeed: 12, fanSpeedMin: 40, fanSpeedMax: 80, density: 1.27 }),
  createPreset({ id: 'esun-3', profileName: 'eSUN ePA-CF', printerBrand: 'Other', manufacturer: 'eSUN', brand: 'ePA-CF', filamentType: 'PA-CF', nozzleTemp: 260, bedTemp: 80, maxVolumetricSpeed: 8, fanSpeedMin: 0, fanSpeedMax: 0, density: 1.22, dryingTemp: 80, dryingTime: '6h', notes: "Nylon Carbon Fiber." }),
  createPreset({ id: 'esun-4', profileName: 'eSUN ePEBA-90A', printerBrand: 'Other', manufacturer: 'eSUN', brand: 'ePEBA', filamentType: 'PEBA', nozzleTemp: 230, bedTemp: 50, maxVolumetricSpeed: 4, fanSpeedMin: 80, fanSpeedMax: 100, density: 1.05, notes: "High rebound elastomer." }),

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

  // Francofil (France)
  createPreset({ id: 'fr-1', profileName: 'Francofil PLA Blé (Wheat)', printerBrand: 'Other', manufacturer: 'Francofil', brand: 'Bio-Composite', filamentType: 'PLA', nozzleTemp: 205, bedTemp: 55, maxVolumetricSpeed: 10, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "Wheat shell filled. Use 0.5/0.6 nozzle." }),
  createPreset({ id: 'fr-2', profileName: 'Francofil PLA Coquille St Jacques', printerBrand: 'Other', manufacturer: 'Francofil', brand: 'Bio-Composite', filamentType: 'PLA', nozzleTemp: 205, bedTemp: 55, maxVolumetricSpeed: 10, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "Scallop shell filled. Creamy texture. 0.5mm nozzle min." }),
  createPreset({ id: 'fr-3', profileName: 'Francofil PLA Café', printerBrand: 'Other', manufacturer: 'Francofil', brand: 'Bio-Composite', filamentType: 'PLA', nozzleTemp: 205, bedTemp: 55, maxVolumetricSpeed: 10, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "Coffee grounds filled. Dark brown texture." }),

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

  // Innofil3D
  createPreset({ id: 'inno-1', profileName: 'Innofil3D PLA', printerBrand: 'Other', manufacturer: 'Innofil3D', brand: 'PLA', filamentType: 'PLA', nozzleTemp: 210, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24 }),
  createPreset({ id: 'inno-2', profileName: 'Innofil3D EPR InnoPET', printerBrand: 'Other', manufacturer: 'Innofil3D', brand: 'EPR InnoPET', filamentType: 'PETG', nozzleTemp: 220, bedTemp: 60, maxVolumetricSpeed: 12, fanSpeedMin: 30, fanSpeedMax: 70, density: 1.27, notes: "Low temp PET." }),
  createPreset({ id: 'inno-3', profileName: 'Innofil3D ABS', printerBrand: 'Other', manufacturer: 'Innofil3D', brand: 'ABS', filamentType: 'ABS', nozzleTemp: 245, bedTemp: 95, maxVolumetricSpeed: 12, fanSpeedMin: 0, fanSpeedMax: 10, density: 1.04 }),

  // JAMG HE
  createPreset({ id: 'jamg-1', profileName: 'JAMG HE Hi-Speed PLA+', printerBrand: 'Other', manufacturer: 'JAMG HE', brand: 'Hi-Speed', filamentType: 'PLA', nozzleTemp: 210, bedTemp: 60, maxVolumetricSpeed: 20, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24 }),
  createPreset({ id: 'jamg-2', profileName: 'JAMG HE Silk PLA', printerBrand: 'Other', manufacturer: 'JAMG HE', brand: 'Silk', filamentType: 'PLA', nozzleTemp: 205, bedTemp: 60, maxVolumetricSpeed: 12, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24 }),

  // NinjaTek
  createPreset({ id: 'nt-1', profileName: 'NinjaTek NinjaFlex 85A', printerBrand: 'Other', manufacturer: 'NinjaTek', brand: 'NinjaFlex', filamentType: 'TPU', nozzleTemp: 230, bedTemp: 40, maxVolumetricSpeed: 3, fanSpeedMin: 60, fanSpeedMax: 100, density: 1.19 }),
  createPreset({ id: 'nt-2', profileName: 'NinjaTek Armadillo', printerBrand: 'Other', manufacturer: 'NinjaTek', brand: 'Armadillo', filamentType: 'TPU', nozzleTemp: 230, bedTemp: 50, maxVolumetricSpeed: 5, fanSpeedMin: 80, fanSpeedMax: 100, density: 1.18, notes: "Rigid TPU (75D). Tough as Nylon." }),

  // Overture
  createPreset({ id: 'ov-1', profileName: 'Overture PLA', printerBrand: 'Other', manufacturer: 'Overture', brand: 'PLA', filamentType: 'PLA', nozzleTemp: 205, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24 }),
  createPreset({ id: 'ov-2', profileName: 'Overture PETG', printerBrand: 'Other', manufacturer: 'Overture', brand: 'PETG', filamentType: 'PETG', nozzleTemp: 240, bedTemp: 80, maxVolumetricSpeed: 12, fanSpeedMin: 30, fanSpeedMax: 70, density: 1.27 }),
  createPreset({ id: 'ov-3', profileName: 'Overture TPU 95A', printerBrand: 'Other', manufacturer: 'Overture', brand: 'TPU', filamentType: 'TPU', nozzleTemp: 220, bedTemp: 55, maxVolumetricSpeed: 4, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.21 }),

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

  // Prusa (Prusament)
  createPreset({ id: 'pru-1', profileName: 'Prusament PLA', printerBrand: 'Prusa', manufacturer: 'Prusa', brand: 'Prusament', filamentType: 'PLA', nozzleTemp: 215, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24 }),
  createPreset({ id: 'pru-2', profileName: 'Prusament PETG', printerBrand: 'Prusa', manufacturer: 'Prusa', brand: 'Prusament', filamentType: 'PETG', nozzleTemp: 250, bedTemp: 85, maxVolumetricSpeed: 13, fanSpeedMin: 30, fanSpeedMax: 50, density: 1.27 }),
  createPreset({ id: 'pru-3', profileName: 'Prusament ASA', printerBrand: 'Prusa', manufacturer: 'Prusa', brand: 'Prusament', filamentType: 'ASA', nozzleTemp: 260, bedTemp: 105, maxVolumetricSpeed: 12, fanSpeedMin: 0, fanSpeedMax: 20, density: 1.07 }),
  createPreset({ id: 'pru-4', profileName: 'Prusament PC Blend', printerBrand: 'Prusa', manufacturer: 'Prusa', brand: 'Prusament', filamentType: 'PC', nozzleTemp: 275, bedTemp: 110, maxVolumetricSpeed: 12, fanSpeedMin: 0, fanSpeedMax: 10, density: 1.20, notes: "Easy print PC." }),
  createPreset({ id: 'pru-5', profileName: 'Prusament PETG Magnetite', printerBrand: 'Prusa', manufacturer: 'Prusa', brand: 'Prusament', filamentType: 'PETG', nozzleTemp: 250, bedTemp: 90, maxVolumetricSpeed: 10, fanSpeedMin: 30, fanSpeedMax: 60, density: 2.30, notes: "Magnetic PETG. 0.6mm nozzle recommended." }),

  // SainSmart
  createPreset({ id: 'ss-1', profileName: 'SainSmart TPU 95A', printerBrand: 'Other', manufacturer: 'SainSmart', brand: 'TPU', filamentType: 'TPU', nozzleTemp: 220, bedTemp: 60, maxVolumetricSpeed: 3.5, fanSpeedMin: 80, fanSpeedMax: 100, density: 1.21 }),

  // Siraya Tech
  createPreset({ id: 'sir-1', profileName: 'Siraya Tech ABS-GF', printerBrand: 'Other', manufacturer: 'Siraya Tech', brand: 'ABS-GF', filamentType: 'ABS', nozzleTemp: 250, bedTemp: 100, maxVolumetricSpeed: 12, fanSpeedMin: 0, fanSpeedMax: 0, density: 1.10, notes: "Glass Fiber ABS." }),
  createPreset({ id: 'sir-2', profileName: 'Siraya Tech PEBA', printerBrand: 'Other', manufacturer: 'Siraya Tech', brand: 'PEBA', filamentType: 'PEBA', nozzleTemp: 235, bedTemp: 50, maxVolumetricSpeed: 4, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.05 }),

  // Sunlu
  createPreset({ id: 'sun-1', profileName: 'Sunlu PLA', printerBrand: 'Other', manufacturer: 'Sunlu', brand: 'PLA', filamentType: 'PLA', nozzleTemp: 205, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24 }),
  createPreset({ id: 'sun-2', profileName: 'Sunlu PETG', printerBrand: 'Other', manufacturer: 'Sunlu', brand: 'PETG', filamentType: 'PETG', nozzleTemp: 235, bedTemp: 70, maxVolumetricSpeed: 12, fanSpeedMin: 40, fanSpeedMax: 80, density: 1.27 }),
  createPreset({ id: 'sun-3', profileName: 'Sunlu ABS', printerBrand: 'Other', manufacturer: 'Sunlu', brand: 'ABS', filamentType: 'ABS', nozzleTemp: 245, bedTemp: 95, maxVolumetricSpeed: 15, fanSpeedMin: 0, fanSpeedMax: 20, density: 1.04 }),

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
  createPreset({ id: 'vlb-8', profileName: 'Voxelab Marble PLA', printerBrand: 'Other', manufacturer: 'Voxelab', brand: 'Marble', filamentType: 'PLA', nozzleTemp: 200, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24 })
];
