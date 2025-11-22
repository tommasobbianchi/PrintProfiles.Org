
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
  '3DJake', '3DQF', '3DTrček', '3DXTech', 'AddNorth', 'Amolen', 'Anycubic', 'Arianeplast', 'Atomic Filament', 'AzureFilm', 'Bambu Lab', 'BASF Forward AM', 'CC3D', 'Cliever', 'Conjure', 'ColorFabb', 'Creality', 'Deeplee', 'Devil Design', 'Dikale', 'DSM Novamid', 'Duramic 3D', 'EUMAKERS', 'Elegoo', 'Eryone', 'eSUN', 'Extrudr', 'FiberForce', 'Fiberlogy', 'FilaCube', 'Filamentive', 'Filamentum', 'Fillamentum', 'FiloAlfa', 'FlashForge', 'FormFutura', 'Francofil', 'GST3D', 'Geeetech', 'GiantArm', 'GratKit', 'HZST3D', 'Hatchbox', 'IGUS', 'IIID MAX', 'Innofil3D', 'JAMG HE', 'JAYO', 'Kaige', 'Kexcelled', 'Kimya (Armor)', 'Kingroon', 'MakeShaper', 'MatterHackers', 'Microzey', 'NEVSBYE', 'Nanovia', 'NinjaTek', 'Numakers', 'Overture', 'Polymaker', 'Porima', 'Priline', 'PrintaMent', 'Printologist', 'Proto-pasta', 'Prusa', 'Qidi Tech', 'R3D', 'Recreus', 'Rosa3D', 'SainSmart', 'Sakata 3D', 'Siraya Tech', 'Smart Materials 3D', 'Spectrum Filaments', 'Stratasys', 'Sunlu', 'TECBears', 'Taulman3D', 'TechInit', 'Tianse', 'Tinmorry', 'Torupy', 'Treed Filaments', 'Tronxy', 'Ultimaker', 'Verbatim', 'Voxelab', 'Winkle', 'XSTRAND (OwensCorning)', 'XYZprinting', 'Yousu', 'Ziro', 'Other'
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
        fanSpeedMin: base.filamentType === 'ABS' || base.filamentType === 'ASA' || base.filamentType === 'PC' || base.filamentType === 'Nylon' || base.filamentType === 'PA-CF' ? 0 : 100,
        fanSpeedMax: base.filamentType === 'ABS' || base.filamentType === 'ASA' || base.filamentType === 'PC' || base.filamentType === 'Nylon' || base.filamentType === 'PA-CF' ? 20 : 100,
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
  createPreset({ id: 'elegoo-3', profileName: 'Elegoo PETG', printerBrand: 'Elegoo', manufacturer: 'Elegoo', brand: 'PETG', filamentType: 'PETG', nozzleTemp: 240, bedTemp: 75, maxVolumetricSpeed: 15, fanSpeedMin: 30, fanSpeedMax: 80, density: 1.27, dryingTemp: 65, dryingTime: '4h' }),
  createPreset({ id: 'elegoo-4', profileName: 'Elegoo ABS-Like', printerBrand: 'Elegoo', manufacturer: 'Elegoo', brand: 'ABS-Like', filamentType: 'ABS', nozzleTemp: 250, bedTemp: 95, maxVolumetricSpeed: 16, fanSpeedMin: 0, fanSpeedMax: 30, density: 1.06, notes: "Less odor than standard ABS." }),
  createPreset({ id: 'elegoo-5', profileName: 'Elegoo TPU 95A', printerBrand: 'Elegoo', manufacturer: 'Elegoo', brand: 'TPU', filamentType: 'TPU', nozzleTemp: 220, bedTemp: 50, maxVolumetricSpeed: 4, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.21 }),

  // Eryone
  createPreset({ id: 'ery-1', profileName: 'Eryone PLA', printerBrand: 'Other', manufacturer: 'Eryone', brand: 'PLA', filamentType: 'PLA', nozzleTemp: 205, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "Standard PLA, easy to print." }),
  createPreset({ id: 'ery-2', profileName: 'Eryone PETG', printerBrand: 'Other', manufacturer: 'Eryone', brand: 'PETG', filamentType: 'PETG', nozzleTemp: 235, bedTemp: 75, maxVolumetricSpeed: 12, fanSpeedMin: 30, fanSpeedMax: 50, density: 1.27, dryingTemp: 65, dryingTime: '4h', notes: "Good adhesion, less warping." }),
  createPreset({ id: 'ery-3', profileName: 'Eryone Silk PLA', printerBrand: 'Other', manufacturer: 'Eryone', brand: 'Silk PLA', filamentType: 'PLA', nozzleTemp: 210, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "Shiny metallic finish, high layer bonding." }),

  // eSUN
  createPreset({ id: 'preset-9', profileName: 'eSUN PLA+', printerBrand: 'Other', manufacturer: 'eSUN', brand: 'PLA+', filamentType: 'PLA', nozzleTemp: 210, bedTemp: 60, maxVolumetricSpeed: 18, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24 }),
  createPreset({ id: 'preset-10', profileName: 'eSUN PETG', printerBrand: 'Other', manufacturer: 'eSUN', brand: 'PETG', filamentType: 'PETG', nozzleTemp: 235, bedTemp: 75, maxVolumetricSpeed: 12, fanSpeedMin: 50, fanSpeedMax: 100, density: 1.27, dryingTemp: 65, dryingTime: '6h' }),
  createPreset({ id: 'preset-11', profileName: 'eSUN ABS+', printerBrand: 'Other', manufacturer: 'eSUN', brand: 'ABS+', filamentType: 'ABS', nozzleTemp: 240, bedTemp: 95, maxVolumetricSpeed: 15, fanSpeedMin: 0, fanSpeedMax: 30, density: 1.05 }),
  createPreset({ id: 'preset-12', profileName: 'eSUN TPU-95A', printerBrand: 'Other', manufacturer: 'eSUN', brand: 'eFlex', filamentType: 'TPU', nozzleTemp: 225, bedTemp: 50, maxVolumetricSpeed: 3, fanSpeedMin: 80, fanSpeedMax: 100, density: 1.2, dryingTemp: 50, dryingTime: '6h' }),
  createPreset({ id: 'esun-1', profileName: 'eSUN ePA-CF', printerBrand: 'Other', manufacturer: 'eSUN', brand: 'ePA-CF', filamentType: 'PA-CF', nozzleTemp: 250, bedTemp: 80, maxVolumetricSpeed: 8, fanSpeedMin: 0, fanSpeedMax: 0, density: 1.24, dryingTemp: 70, dryingTime: '12h', notes: "Nylon Carbon Fiber. Hardened nozzle required. Keep dry." }),
  createPreset({ id: 'esun-2', profileName: 'eSUN eASA', printerBrand: 'Other', manufacturer: 'eSUN', brand: 'eASA', filamentType: 'ASA', nozzleTemp: 250, bedTemp: 100, maxVolumetricSpeed: 12, fanSpeedMin: 0, fanSpeedMax: 20, density: 1.07, dryingTemp: 80, dryingTime: '4h', notes: "UV resistant. Enclosure recommended." }),
  createPreset({ id: 'esun-3', profileName: 'eSUN PLA-LW', printerBrand: 'Other', manufacturer: 'eSUN', brand: 'PLA-LW', filamentType: 'PLA', nozzleTemp: 210, bedTemp: 50, maxVolumetricSpeed: 8, fanSpeedMin: 100, fanSpeedMax: 100, density: 0.54, notes: "Lightweight foaming PLA. Flow rate needs calibration (~50-60% flow usually)." }),
  createPreset({ id: 'esun-4', profileName: 'eSUN PLA-Matte', printerBrand: 'Other', manufacturer: 'eSUN', brand: 'PLA-Matte', filamentType: 'PLA', nozzleTemp: 210, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "Matte surface finish." }),
  createPreset({ id: 'esun-5', profileName: 'eSUN eSilk-PLA', printerBrand: 'Other', manufacturer: 'eSUN', brand: 'eSilk', filamentType: 'PLA', nozzleTemp: 215, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "Silky shiny surface." }),
  createPreset({ id: 'esun-6', profileName: 'eSUN ePEBA-90A', printerBrand: 'Other', manufacturer: 'eSUN', brand: 'ePEBA', filamentType: 'PEBA', nozzleTemp: 250, bedTemp: 70, maxVolumetricSpeed: 4, fanSpeedMin: 50, fanSpeedMax: 100, density: 1.03, notes: "Polyether Block Amide. High resilience, low temp flexible. Print slow." }),

  // EUMAKERS
  createPreset({ id: 'eum-1', profileName: 'EUMAKERS PLA', printerBrand: 'Other', manufacturer: 'EUMAKERS', brand: 'PLA', filamentType: 'PLA', nozzleTemp: 210, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24 }),

  // Extrudr
  createPreset({ id: 'ext-1', profileName: 'Extrudr NX2 PLA', printerBrand: 'Other', manufacturer: 'Extrudr', brand: 'NX2', filamentType: 'PLA', nozzleTemp: 215, bedTemp: 60, maxVolumetricSpeed: 16, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "Matte finish, high mechanical strength." }),
  createPreset({ id: 'ext-2', profileName: 'Extrudr XPETG Matte', printerBrand: 'Other', manufacturer: 'Extrudr', brand: 'XPETG', filamentType: 'PETG', nozzleTemp: 230, bedTemp: 80, maxVolumetricSpeed: 13, fanSpeedMin: 30, fanSpeedMax: 70, density: 1.27, dryingTemp: 65, dryingTime: '4h' }),
  createPreset({ id: 'ext-xpetg-0.8', profileName: 'Extrudr XPETG Matt @Bambu Lab P1S 0.8 nozzle', printerBrand: 'Bambu Lab', printerModel: 'P1S', manufacturer: 'Extrudr', brand: 'XPETG Matt', filamentType: 'PETG', nozzleDiameter: 0.8, nozzleTemp: 225, nozzleTempInitial: 220, bedTemp: 80, bedTempInitial: 80, maxVolumetricSpeed: 12, fanSpeedMin: 40, fanSpeedMax: 70, density: 1.41, retractionDistance: 0.8, retractionSpeed: 35, filamentCost: 29.99, notes: "Specific profile for 0.8mm nozzle on Bambu Lab P1S." }),
  createPreset({ id: 'ext-3', profileName: 'Extrudr BioFusion', printerBrand: 'Other', manufacturer: 'Extrudr', brand: 'BioFusion', filamentType: 'PLA', nozzleTemp: 225, bedTemp: 65, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.22, notes: "Intense metallic shine, treat like PLA." }),
  createPreset({ id: 'ext-4', profileName: 'Extrudr GreenTEC Pro', printerBrand: 'Other', manufacturer: 'Extrudr', brand: 'GreenTEC', filamentType: 'PLA', nozzleTemp: 220, bedTemp: 60, maxVolumetricSpeed: 14, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.29, notes: "High heat resistance (160°C), biodegradable." }),
  createPreset({ id: 'ext-5', profileName: 'Extrudr DuraPro ASA', printerBrand: 'Other', manufacturer: 'Extrudr', brand: 'DuraPro', filamentType: 'ASA', nozzleTemp: 255, bedTemp: 100, maxVolumetricSpeed: 15, fanSpeedMin: 0, fanSpeedMax: 30, density: 1.07, dryingTemp: 80, dryingTime: '4h' }),

  // FiberForce (Italy)
  createPreset({ id: 'ffo-1', profileName: 'FiberForce Nylforce 550', printerBrand: 'Other', manufacturer: 'FiberForce', brand: 'Nylforce', filamentType: 'Nylon', nozzleTemp: 250, bedTemp: 70, maxVolumetricSpeed: 10, fanSpeedMin: 0, fanSpeedMax: 0, density: 1.15, notes: "Nylon. High toughness." }),
  createPreset({ id: 'ffo-2', profileName: 'FiberForce Nylforce Carbon', printerBrand: 'Other', manufacturer: 'FiberForce', brand: 'Nylforce', filamentType: 'PA-CF', nozzleTemp: 260, bedTemp: 75, maxVolumetricSpeed: 9, fanSpeedMin: 0, fanSpeedMax: 0, density: 1.24, notes: "Carbon Fiber Nylon. Hardened Nozzle." }),

  // Fiberlogy
  createPreset({ id: 'fiber-1', profileName: 'Fiberlogy Easy PLA', printerBrand: 'Other', manufacturer: 'Fiberlogy', brand: 'Easy PLA', filamentType: 'PLA', nozzleTemp: 215, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24 }),
  createPreset({ id: 'fiber-2', profileName: 'Fiberlogy FiberSilk', printerBrand: 'Other', manufacturer: 'Fiberlogy', brand: 'FiberSilk', filamentType: 'PLA', nozzleTemp: 220, bedTemp: 60, maxVolumetricSpeed: 14, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "Metallic silk finish. High gloss." }),
  createPreset({ id: 'fiber-3', profileName: 'Fiberlogy PA12-CF15', printerBrand: 'Other', manufacturer: 'Fiberlogy', brand: 'PA12-CF', filamentType: 'PA-CF', nozzleTemp: 265, bedTemp: 100, maxVolumetricSpeed: 10, fanSpeedMin: 0, fanSpeedMax: 0, density: 1.15, dryingTemp: 100, dryingTime: '6h', notes: "Nylon + 15% Carbon Fiber. Hardened nozzle required." }),
  createPreset({ id: 'fiber-4', profileName: 'Fiberlogy Impact PLA', printerBrand: 'Other', manufacturer: 'Fiberlogy', brand: 'Impact PLA', filamentType: 'PLA', nozzleTemp: 230, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "Higher impact resistance than ABS, prints like PLA." }),
  createPreset({ id: 'fiber-5', profileName: 'Fiberlogy FiberSatin', printerBrand: 'Other', manufacturer: 'Fiberlogy', brand: 'FiberSatin', filamentType: 'PLA', nozzleTemp: 210, bedTemp: 50, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "Matte-satin finish. Hides layer lines." }),

  // FilaCube (Marketplace)
  createPreset({ id: 'fila-1', profileName: 'FilaCube PLA 2', printerBrand: 'Other', manufacturer: 'FilaCube', brand: 'PLA 2', filamentType: 'PLA', nozzleTemp: 210, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "High strength budget PLA." }),

  // Filamentive (UK)
  createPreset({ id: 'film-1', profileName: 'Filamentive rPLA', printerBrand: 'Other', manufacturer: 'Filamentive', brand: 'rPLA', filamentType: 'PLA', nozzleTemp: 205, bedTemp: 55, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "Recycled content PLA." }),

  // Fillamentum
  createPreset({ id: 'fill-1', profileName: 'Fillamentum PLA Extrafill', printerBrand: 'Other', manufacturer: 'Fillamentum', brand: 'Extrafill', filamentType: 'PLA', nozzleTemp: 210, bedTemp: 55, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "High visual quality PLA." }),
  createPreset({ id: 'fill-2', profileName: 'Fillamentum CPE HG100', printerBrand: 'Other', manufacturer: 'Fillamentum', brand: 'CPE', filamentType: 'Copolyester', nozzleTemp: 265, bedTemp: 85, maxVolumetricSpeed: 10, fanSpeedMin: 20, fanSpeedMax: 50, density: 1.26, dryingTemp: 70, dryingTime: '4h', notes: "Enhanced PETG-like material." }),
  createPreset({ id: 'fill-3', profileName: 'Fillamentum Timberfill', printerBrand: 'Other', manufacturer: 'Fillamentum', brand: 'Timberfill', filamentType: 'PLA', nozzleTemp: 180, bedTemp: 55, maxVolumetricSpeed: 8, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.28, notes: "Wood composite. Print cool (170-190°C) for best wood effect. 0.5mm+ nozzle." }),
  createPreset({ id: 'fill-4', profileName: 'Fillamentum Flexfill 98A', printerBrand: 'Other', manufacturer: 'Fillamentum', brand: 'Flexfill', filamentType: 'TPU', nozzleTemp: 230, bedTemp: 50, maxVolumetricSpeed: 5, fanSpeedMin: 80, fanSpeedMax: 100, density: 1.23 }),
  createPreset({ id: 'fill-5', profileName: 'Fillamentum Nylon AF80 Aramid', printerBrand: 'Other', manufacturer: 'Fillamentum', brand: 'Nylon AF80', filamentType: 'Nylon', nozzleTemp: 245, bedTemp: 100, maxVolumetricSpeed: 8, fanSpeedMin: 0, fanSpeedMax: 0, density: 1.03, notes: "Aramid Fiber (Kevlar) reinforced. Tribological." }),
  createPreset({ id: 'fill-6', profileName: 'Fillamentum NonOilen', printerBrand: 'Other', manufacturer: 'Fillamentum', brand: 'NonOilen', filamentType: 'PLA', nozzleTemp: 185, bedTemp: 50, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.28, notes: "100% Biodegradable, temp resist 110°C. Food safe." }),
  createPreset({ id: 'fill-7', profileName: 'Fillamentum Flexfill PEBA 90A', printerBrand: 'Other', manufacturer: 'Fillamentum', brand: 'Flexfill', filamentType: 'PEBA', nozzleTemp: 235, bedTemp: 80, maxVolumetricSpeed: 3, fanSpeedMin: 50, fanSpeedMax: 100, density: 1.01, notes: "PEBA. High energy return, lightweight. Print slow (20-30mm/s)." }),

  // FiloAlfa (Italy)
  createPreset({ id: 'fa-1', profileName: 'FiloAlfa PLA', printerBrand: 'Other', manufacturer: 'FiloAlfa', brand: 'PLA', filamentType: 'PLA', nozzleTemp: 205, bedTemp: 55, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "Easy to print, Italian made." }),
  createPreset({ id: 'fa-2', profileName: 'FiloAlfa Alfa+', printerBrand: 'Other', manufacturer: 'FiloAlfa', brand: 'Alfa+', filamentType: 'PLA', nozzleTemp: 220, bedTemp: 60, maxVolumetricSpeed: 16, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "High temp resistance, annealable, bio-based." }),
  createPreset({ id: 'fa-3', profileName: 'FiloAlfa PETG', printerBrand: 'Other', manufacturer: 'FiloAlfa', brand: 'PETG', filamentType: 'PETG', nozzleTemp: 240, bedTemp: 80, maxVolumetricSpeed: 12, fanSpeedMin: 30, fanSpeedMax: 70, density: 1.27, dryingTemp: 65, dryingTime: '4h' }),
  createPreset({ id: 'fa-4', profileName: 'FiloAlfa ABS', printerBrand: 'Other', manufacturer: 'FiloAlfa', brand: 'ABS', filamentType: 'ABS', nozzleTemp: 250, bedTemp: 100, maxVolumetricSpeed: 14, fanSpeedMin: 0, fanSpeedMax: 20, density: 1.04, dryingTemp: 80, dryingTime: '3h', notes: "Use enclosure." }),

  // FlashForge
  createPreset({ id: 'flash-1', profileName: 'FlashForge PLA', printerBrand: 'Other', manufacturer: 'FlashForge', brand: 'PLA', filamentType: 'PLA', nozzleTemp: 200, bedTemp: 55, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24 }),
  createPreset({ id: 'flash-2', profileName: 'FlashForge ABS Pro', printerBrand: 'Other', manufacturer: 'FlashForge', brand: 'ABS Pro', filamentType: 'ABS', nozzleTemp: 235, bedTemp: 100, maxVolumetricSpeed: 15, fanSpeedMin: 0, fanSpeedMax: 20, density: 1.05, notes: "Low odor." }),
  createPreset({ id: 'flash-3', profileName: 'FlashForge ASA', printerBrand: 'Other', manufacturer: 'FlashForge', brand: 'ASA', filamentType: 'ASA', nozzleTemp: 250, bedTemp: 100, maxVolumetricSpeed: 15, fanSpeedMin: 0, fanSpeedMax: 20, density: 1.07 }),

  // FormFutura
  createPreset({ id: 'ff-1', profileName: 'FormFutura ApolloX (ASA)', printerBrand: 'Other', manufacturer: 'FormFutura', brand: 'ApolloX', filamentType: 'ASA', nozzleTemp: 245, bedTemp: 90, maxVolumetricSpeed: 15, fanSpeedMin: 0, fanSpeedMax: 30, density: 1.05, dryingTemp: 80, dryingTime: '4h', notes: "Professional UV-resistant ASA. Warp-free technology." }),
  createPreset({ id: 'ff-2', profileName: 'FormFutura EasyFil PLA', printerBrand: 'Other', manufacturer: 'FormFutura', brand: 'EasyFil', filamentType: 'PLA', nozzleTemp: 210, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "High-end impact modified PLA." }),
  createPreset({ id: 'ff-3', profileName: 'FormFutura HDglass (PETG)', printerBrand: 'Other', manufacturer: 'FormFutura', brand: 'HDglass', filamentType: 'PETG', nozzleTemp: 215, bedTemp: 70, maxVolumetricSpeed: 14, fanSpeedMin: 30, fanSpeedMax: 80, density: 1.27, notes: "High transparency PETG." }),
  createPreset({ id: 'ff-4', profileName: 'FormFutura CarbonFil', printerBrand: 'Other', manufacturer: 'FormFutura', brand: 'CarbonFil', filamentType: 'PETG', nozzleTemp: 245, bedTemp: 75, maxVolumetricSpeed: 12, fanSpeedMin: 0, fanSpeedMax: 50, density: 1.19, dryingTemp: 65, dryingTime: '4h', notes: "PETG reinforced with 20% carbon fiber. High stiffness." }),
  createPreset({ id: 'ff-5', profileName: 'FormFutura StoneFil', printerBrand: 'Other', manufacturer: 'FormFutura', brand: 'StoneFil', filamentType: 'PLA', nozzleTemp: 205, bedTemp: 60, maxVolumetricSpeed: 10, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.70, notes: "Stone filled. Matte. 0.5mm+ nozzle recommended." }),
  createPreset({ id: 'ff-6', profileName: 'FormFutura Galaxy PLA', printerBrand: 'Other', manufacturer: 'FormFutura', brand: 'Galaxy', filamentType: 'PLA', nozzleTemp: 215, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "High glitter content." }),

  // Francofil (France)
  createPreset({ id: 'franco-1', profileName: 'Francofil PLA Wheat', printerBrand: 'Other', manufacturer: 'Francofil', brand: 'Bio', filamentType: 'PLA', nozzleTemp: 205, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "Wheat byproduct filled. Natural look." }),
  createPreset({ id: 'franco-2', profileName: 'Francofil rPETG', printerBrand: 'Other', manufacturer: 'Francofil', brand: 'rPETG', filamentType: 'PETG', nozzleTemp: 235, bedTemp: 70, maxVolumetricSpeed: 12, fanSpeedMin: 30, fanSpeedMax: 70, density: 1.27, notes: "Recycled PETG." }),

  // Geeetech
  createPreset({ id: 'ge-1', profileName: 'Geeetech PLA', printerBrand: 'Other', manufacturer: 'Geeetech', brand: 'PLA', filamentType: 'PLA', nozzleTemp: 200, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24 }),
  createPreset({ id: 'ge-2', profileName: 'Geeetech Silk PLA', printerBrand: 'Other', manufacturer: 'Geeetech', brand: 'Silk', filamentType: 'PLA', nozzleTemp: 205, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24 }),

  // GiantArm
  createPreset({ id: 'giant-1', profileName: 'GiantArm PLA', printerBrand: 'Other', manufacturer: 'GiantArm', brand: 'PLA', filamentType: 'PLA', nozzleTemp: 200, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24 }),
  createPreset({ id: 'giant-2', profileName: 'GiantArm PETG', printerBrand: 'Other', manufacturer: 'GiantArm', brand: 'PETG', filamentType: 'PETG', nozzleTemp: 235, bedTemp: 80, maxVolumetricSpeed: 12, fanSpeedMin: 40, fanSpeedMax: 80, density: 1.27 }),

  // GratKit
  createPreset({ id: 'gk-1', profileName: 'GratKit PLA', printerBrand: 'Other', manufacturer: 'GratKit', brand: 'PLA', filamentType: 'PLA', nozzleTemp: 200, bedTemp: 55, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "Official Nozzle: 190-220°C, Bed: 50-60°C." }),
  createPreset({ id: 'gk-2', profileName: 'GratKit PLA+', printerBrand: 'Other', manufacturer: 'GratKit', brand: 'PLA+', filamentType: 'PLA', nozzleTemp: 215, bedTemp: 55, maxVolumetricSpeed: 16, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "Official Nozzle: 200-230°C, Bed: 50-60°C. High toughness." }),

  // GST3D
  createPreset({ id: 'gst-1', profileName: 'GST3D PLA+', printerBrand: 'Other', manufacturer: 'GST3D', brand: 'PLA+', filamentType: 'PLA', nozzleTemp: 210, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "Budget friendly PLA+." }),
  createPreset({ id: 'gst-2', profileName: 'GST3D PETG', printerBrand: 'Other', manufacturer: 'GST3D', brand: 'PETG', filamentType: 'PETG', nozzleTemp: 240, bedTemp: 80, maxVolumetricSpeed: 12, fanSpeedMin: 40, fanSpeedMax: 80, density: 1.27 }),
  createPreset({ id: 'gst-3', profileName: 'GST3D TPU', printerBrand: 'Other', manufacturer: 'GST3D', brand: 'TPU', filamentType: 'TPU', nozzleTemp: 230, bedTemp: 60, maxVolumetricSpeed: 4, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.21 }),
  createPreset({ id: 'gst-4', profileName: 'GST3D ABS', printerBrand: 'Other', manufacturer: 'GST3D', brand: 'ABS', filamentType: 'ABS', nozzleTemp: 240, bedTemp: 90, maxVolumetricSpeed: 15, fanSpeedMin: 0, fanSpeedMax: 20, density: 1.04 }),

  // Hatchbox
  createPreset({ id: 'hb-1', profileName: 'Hatchbox PLA', printerBrand: 'Other', manufacturer: 'Hatchbox', brand: 'PLA', filamentType: 'PLA', nozzleTemp: 200, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24 }),
  createPreset({ id: 'hb-2', profileName: 'Hatchbox ABS', printerBrand: 'Other', manufacturer: 'Hatchbox', brand: 'ABS', filamentType: 'ABS', nozzleTemp: 235, bedTemp: 90, maxVolumetricSpeed: 15, fanSpeedMin: 0, fanSpeedMax: 20, density: 1.04 }),
  createPreset({ id: 'hb-3', profileName: 'Hatchbox PETG', printerBrand: 'Other', manufacturer: 'Hatchbox', brand: 'PETG', filamentType: 'PETG', nozzleTemp: 240, bedTemp: 75, maxVolumetricSpeed: 12, fanSpeedMin: 40, fanSpeedMax: 80, density: 1.27 }),

  // HZST3D (Marketplace)
  createPreset({ id: 'hzst-1', profileName: 'HZST3D Chameleon PLA', printerBrand: 'Other', manufacturer: 'HZST3D', brand: 'Chameleon', filamentType: 'PLA', nozzleTemp: 210, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "Color changing." }),

  // Igus (Specialist)
  createPreset({ id: 'igus-1', profileName: 'Igus iglidur I150-PF', printerBrand: 'Other', manufacturer: 'IGUS', brand: 'iglidur', filamentType: 'Other', nozzleTemp: 250, bedTemp: 65, maxVolumetricSpeed: 8, fanSpeedMin: 50, fanSpeedMax: 100, density: 1.30, notes: "Tribological filament. Wear resistant. Easy to print." }),
  createPreset({ id: 'igus-2', profileName: 'Igus iglidur I180-PF', printerBrand: 'Other', manufacturer: 'IGUS', brand: 'iglidur', filamentType: 'Other', nozzleTemp: 260, bedTemp: 90, maxVolumetricSpeed: 8, fanSpeedMin: 20, fanSpeedMax: 50, density: 1.25, notes: "High wear resistance. Enclosure recommended." }),

  // IIID MAX (USA Budget Bulk)
  createPreset({ id: 'iiid-1', profileName: 'IIID MAX PLA+', printerBrand: 'Other', manufacturer: 'IIID MAX', brand: 'PLA+', filamentType: 'PLA', nozzleTemp: 215, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "Bulk budget PLA+. Consistent results." }),

  // Innofil3D (Legacy - now BASF)
  createPreset({ id: 'inno-1', profileName: 'Innofil3D PLA', printerBrand: 'Other', manufacturer: 'Innofil3D', brand: 'PLA', filamentType: 'PLA', nozzleTemp: 210, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24 }),
  createPreset({ id: 'inno-2', profileName: 'Innofil3D EPR PET', printerBrand: 'Other', manufacturer: 'Innofil3D', brand: 'EPR', filamentType: 'PETG', nozzleTemp: 220, bedTemp: 60, maxVolumetricSpeed: 12, fanSpeedMin: 40, fanSpeedMax: 80, density: 1.27 }),

  // JAMG HE
  createPreset({ id: 'jam-1', profileName: 'JAMG HE PLA', printerBrand: 'Other', manufacturer: 'JAMG HE', brand: 'PLA', filamentType: 'PLA', nozzleTemp: 210, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24 }),

  // JAYO
  createPreset({ id: 'jayo-1', profileName: 'JAYO PLA', printerBrand: 'Other', manufacturer: 'JAYO', brand: 'PLA', filamentType: 'PLA', nozzleTemp: 210, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "Similar to Sunlu PLA. Easy printing." }),

  // Kaige (AliExpress Bulk)
  createPreset({ id: 'kai-1', profileName: 'Kaige PLA', printerBrand: 'Other', manufacturer: 'Kaige', brand: 'PLA', filamentType: 'PLA', nozzleTemp: 200, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24 }),

  // Kexcelled
  createPreset({ id: 'kex-1', profileName: 'Kexcelled PLA K5', printerBrand: 'Other', manufacturer: 'Kexcelled', brand: 'K5', filamentType: 'PLA', nozzleTemp: 200, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "Standard high-quality PLA." }),
  createPreset({ id: 'kex-2', profileName: 'Kexcelled PLA K5M', printerBrand: 'Other', manufacturer: 'Kexcelled', brand: 'K5M', filamentType: 'PLA', nozzleTemp: 210, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "Matte finish PLA. Hides layer lines." }),
  createPreset({ id: 'kex-3', profileName: 'Kexcelled PLA K5 Silk', printerBrand: 'Other', manufacturer: 'Kexcelled', brand: 'K5 Silk', filamentType: 'PLA', nozzleTemp: 215, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "High gloss silk finish." }),
  createPreset({ id: 'kex-4', profileName: 'Kexcelled PETG K7', printerBrand: 'Other', manufacturer: 'Kexcelled', brand: 'K7', filamentType: 'PETG', nozzleTemp: 235, bedTemp: 75, maxVolumetricSpeed: 12, fanSpeedMin: 40, fanSpeedMax: 80, density: 1.27 }),
  createPreset({ id: 'kex-5', profileName: 'Kexcelled ABS K5', printerBrand: 'Other', manufacturer: 'Kexcelled', brand: 'K5', filamentType: 'ABS', nozzleTemp: 245, bedTemp: 100, maxVolumetricSpeed: 15, fanSpeedMin: 0, fanSpeedMax: 20, density: 1.04 }),
  createPreset({ id: 'kex-6', profileName: 'Kexcelled ASA K5', printerBrand: 'Other', manufacturer: 'Kexcelled', brand: 'K5', filamentType: 'ASA', nozzleTemp: 250, bedTemp: 100, maxVolumetricSpeed: 15, fanSpeedMin: 0, fanSpeedMax: 20, density: 1.07, notes: "UV Resistant." }),
  createPreset({ id: 'kex-7', profileName: 'Kexcelled PA6 K7', printerBrand: 'Other', manufacturer: 'Kexcelled', brand: 'K7', filamentType: 'Nylon', nozzleTemp: 260, bedTemp: 80, maxVolumetricSpeed: 10, fanSpeedMin: 0, fanSpeedMax: 0, density: 1.14, dryingTemp: 80, dryingTime: '12h', notes: "Nylon 6. Requires drying." }),
  createPreset({ id: 'kex-8', profileName: 'Kexcelled PEEK K10', printerBrand: 'Other', manufacturer: 'Kexcelled', brand: 'K10', filamentType: 'Other', nozzleTemp: 380, bedTemp: 120, maxVolumetricSpeed: 5, fanSpeedMin: 0, fanSpeedMax: 0, density: 1.30, dryingTemp: 120, dryingTime: '12h', notes: "High Temp PEEK. Chamber heater required." }),

  // Kimya (Armor Group - France)
  createPreset({ id: 'kim-1', profileName: 'Kimya ABS Kevlar', printerBrand: 'Other', manufacturer: 'Kimya (Armor)', brand: 'ABS Kevlar', filamentType: 'ABS', nozzleTemp: 260, bedTemp: 100, maxVolumetricSpeed: 10, fanSpeedMin: 0, fanSpeedMax: 0, density: 1.08, dryingTemp: 80, dryingTime: '4h', notes: "Aramid fiber reinforced ABS. High impact." }),
  createPreset({ id: 'kim-2', profileName: 'Kimya PETG Carbon', printerBrand: 'Other', manufacturer: 'Kimya (Armor)', brand: 'PETG Carbon', filamentType: 'PETG', nozzleTemp: 245, bedTemp: 75, maxVolumetricSpeed: 10, fanSpeedMin: 20, fanSpeedMax: 50, density: 1.29, notes: "Carbon fiber reinforced PETG." }),

  // Kingroon (AliExpress / Temu Staple)
  createPreset({ id: 'king-1', profileName: 'Kingroon PLA', printerBrand: 'Other', manufacturer: 'Kingroon', brand: 'PLA', filamentType: 'PLA', nozzleTemp: 205, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "Popular budget PLA. Print standard." }),
  createPreset({ id: 'king-2', profileName: 'Kingroon PETG', printerBrand: 'Other', manufacturer: 'Kingroon', brand: 'PETG', filamentType: 'PETG', nozzleTemp: 235, bedTemp: 75, maxVolumetricSpeed: 12, fanSpeedMin: 30, fanSpeedMax: 70, density: 1.27 }),
  createPreset({ id: 'king-3', profileName: 'Kingroon TPU', printerBrand: 'Other', manufacturer: 'Kingroon', brand: 'TPU', filamentType: 'TPU', nozzleTemp: 210, bedTemp: 50, maxVolumetricSpeed: 4, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.21 }),
  createPreset({ id: 'king-4', profileName: 'Kingroon ABS', printerBrand: 'Other', manufacturer: 'Kingroon', brand: 'ABS', filamentType: 'ABS', nozzleTemp: 245, bedTemp: 100, maxVolumetricSpeed: 15, fanSpeedMin: 0, fanSpeedMax: 20, density: 1.04 }),

  // MakeShaper
  createPreset({ id: 'make-1', profileName: 'MakeShaper PLA', printerBrand: 'Other', manufacturer: 'MakeShaper', brand: 'PLA', filamentType: 'PLA', nozzleTemp: 210, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24 }),

  // MatterHackers
  createPreset({ id: 'mh-1', profileName: 'MatterHackers PRO PLA', printerBrand: 'Other', manufacturer: 'MatterHackers', brand: 'PRO Series', filamentType: 'PLA', nozzleTemp: 205, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "High precision diameter." }),
  createPreset({ id: 'mh-2', profileName: 'MatterHackers Nylon X', printerBrand: 'Other', manufacturer: 'MatterHackers', brand: 'Nylon X', filamentType: 'PA-CF', nozzleTemp: 260, bedTemp: 65, maxVolumetricSpeed: 8, fanSpeedMin: 0, fanSpeedMax: 0, density: 1.01, dryingTemp: 90, dryingTime: '8h', notes: "Micro-carbon fiber filled nylon. Engineering grade." }),
  createPreset({ id: 'mh-3', profileName: 'MatterHackers Build PLA', printerBrand: 'Other', manufacturer: 'MatterHackers', brand: 'Build Series', filamentType: 'PLA', nozzleTemp: 200, bedTemp: 55, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24 }),
  createPreset({ id: 'mh-4', profileName: 'MatterHackers Nylon G', printerBrand: 'Other', manufacturer: 'MatterHackers', brand: 'Nylon G', filamentType: 'PA-GF', nozzleTemp: 255, bedTemp: 65, maxVolumetricSpeed: 8, fanSpeedMin: 0, fanSpeedMax: 0, density: 1.12, notes: "Glass Fiber reinforced Nylon. Tough." }),
  createPreset({ id: 'mh-5', profileName: 'MatterHackers Quantum PLA', printerBrand: 'Other', manufacturer: 'MatterHackers', brand: 'Quantum', filamentType: 'PLA', nozzleTemp: 215, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "Dichromatic color shift." }),

  // Microzey (Turkish)
  createPreset({ id: 'mic-1', profileName: 'Microzey PLA', printerBrand: 'Other', manufacturer: 'Microzey', brand: 'PLA', filamentType: 'PLA', nozzleTemp: 210, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24 }),
  createPreset({ id: 'mic-2', profileName: 'Microzey PETG', printerBrand: 'Other', manufacturer: 'Microzey', brand: 'PETG', filamentType: 'PETG', nozzleTemp: 240, bedTemp: 80, maxVolumetricSpeed: 12, fanSpeedMin: 40, fanSpeedMax: 80, density: 1.27 }),
  createPreset({ id: 'mic-3', profileName: 'Microzey ABS', printerBrand: 'Other', manufacturer: 'Microzey', brand: 'ABS', filamentType: 'ABS', nozzleTemp: 250, bedTemp: 100, maxVolumetricSpeed: 15, fanSpeedMin: 0, fanSpeedMax: 20, density: 1.04 }),

  // NEVSBYE
  createPreset({ id: 'nevs-1', profileName: 'NEVSBYE PLA', printerBrand: 'Other', manufacturer: 'NEVSBYE', brand: 'PLA', filamentType: 'PLA', nozzleTemp: 200, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24 }),
  createPreset({ id: 'nevs-2', profileName: 'NEVSBYE ABS', printerBrand: 'Other', manufacturer: 'NEVSBYE', brand: 'ABS', filamentType: 'ABS', nozzleTemp: 240, bedTemp: 95, maxVolumetricSpeed: 15, fanSpeedMin: 0, fanSpeedMax: 20, density: 1.04 }),

  // Nanovia (France)
  createPreset({ id: 'nano-1', profileName: 'Nanovia PA6-CF', printerBrand: 'Other', manufacturer: 'Nanovia', brand: 'PA6-CF', filamentType: 'PA-CF', nozzleTemp: 270, bedTemp: 90, maxVolumetricSpeed: 10, fanSpeedMin: 0, fanSpeedMax: 0, density: 1.20, dryingTemp: 90, dryingTime: '6h', notes: "Nylon 6 Carbon Fiber. Engineering." }),

  // NinjaTek
  createPreset({ id: 'nt-1', profileName: 'NinjaTek NinjaFlex 85A', printerBrand: 'Other', manufacturer: 'NinjaTek', brand: 'NinjaFlex', filamentType: 'TPU', nozzleTemp: 230, bedTemp: 40, maxVolumetricSpeed: 2.5, printSpeed: 30, fanSpeedMin: 80, fanSpeedMax: 100, density: 1.19, retractionDistance: 0, retractionSpeed: 0, notes: "Industry standard soft TPU. 0.4mm nozzle minimum recommended." }),
  createPreset({ id: 'nt-2', profileName: 'NinjaTek Cheetah 95A', printerBrand: 'Other', manufacturer: 'NinjaTek', brand: 'Cheetah', filamentType: 'TPU', nozzleTemp: 240, bedTemp: 40, maxVolumetricSpeed: 6, printSpeed: 60, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.22, notes: "High speed flexible filament." }),
  createPreset({ id: 'nt-3', profileName: 'NinjaTek Armadillo', printerBrand: 'Other', manufacturer: 'NinjaTek', brand: 'Armadillo', filamentType: 'TPU', nozzleTemp: 230, bedTemp: 40, maxVolumetricSpeed: 8, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.18, notes: "Rigid TPU (75D). Extreme abrasion resistance." }),
  createPreset({ id: 'nt-4', profileName: 'NinjaTek Eel', printerBrand: 'Other', manufacturer: 'NinjaTek', brand: 'Eel', filamentType: 'TPU', nozzleTemp: 230, bedTemp: 45, maxVolumetricSpeed: 3, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.12, notes: "Conductive Flexible Filament. 90A." }),

  // Numakers (Marketplace / Direct)
  createPreset({ id: 'num-1', profileName: 'Numakers PLA+', printerBrand: 'Other', manufacturer: 'Numakers', brand: 'PLA+', filamentType: 'PLA', nozzleTemp: 215, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24 }),
  createPreset({ id: 'num-2', profileName: 'Numakers PETG', printerBrand: 'Other', manufacturer: 'Numakers', brand: 'PETG', filamentType: 'PETG', nozzleTemp: 240, bedTemp: 80, maxVolumetricSpeed: 12, fanSpeedMin: 40, fanSpeedMax: 80, density: 1.27 }),

  // Overture
  createPreset({ id: 'ove-1', profileName: 'Overture PLA', printerBrand: 'Other', manufacturer: 'Overture', brand: 'PLA', filamentType: 'PLA', nozzleTemp: 205, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24 }),
  createPreset({ id: 'ove-2', profileName: 'Overture PETG', printerBrand: 'Other', manufacturer: 'Overture', brand: 'PETG', filamentType: 'PETG', nozzleTemp: 240, bedTemp: 80, maxVolumetricSpeed: 12, fanSpeedMin: 40, fanSpeedMax: 80, density: 1.27 }),
  createPreset({ id: 'ove-3', profileName: 'Overture TPU 95A', printerBrand: 'Other', manufacturer: 'Overture', brand: 'TPU', filamentType: 'TPU', nozzleTemp: 220, bedTemp: 55, maxVolumetricSpeed: 3.5, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.21 }),
  createPreset({ id: 'ove-4', profileName: 'Overture Rock PLA', printerBrand: 'Other', manufacturer: 'Overture', brand: 'Rock', filamentType: 'PLA', nozzleTemp: 210, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.28, notes: "Matte stone texture." }),

  // Polymaker
  createPreset({ id: 'preset-16', profileName: 'Polymaker PolyLite PLA', printerBrand: 'Other', manufacturer: 'Polymaker', brand: 'PolyLite', filamentType: 'PLA', nozzleTemp: 205, bedTemp: 55, maxVolumetricSpeed: 16, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.23 }),
  createPreset({ id: 'preset-20', profileName: 'Polymaker PolyMax PC', printerBrand: 'Other', manufacturer: 'Polymaker', brand: 'PolyMax', filamentType: 'PC', nozzleTemp: 260, bedTemp: 100, maxVolumetricSpeed: 14, fanSpeedMin: 0, fanSpeedMax: 0, density: 1.2, dryingTemp: 100, dryingTime: '12h' }),
  createPreset({ id: 'preset-21', profileName: 'Polymaker PolyMide PA6-CF', printerBrand: 'Other', manufacturer: 'Polymaker', brand: 'PolyMide', filamentType: 'PA-CF', nozzleTemp: 290, bedTemp: 45, maxVolumetricSpeed: 10, fanSpeedMin: 0, fanSpeedMax: 0, spoolWeight: 500, density: 1.24, dryingTemp: 80, dryingTime: '12h', notes: "Hardened nozzle required." }),
  createPreset({ id: 'pm-1', profileName: 'Polymaker PolyTerra PLA', printerBrand: 'Other', manufacturer: 'Polymaker', brand: 'PolyTerra', filamentType: 'PLA', nozzleTemp: 200, bedTemp: 50, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.20, notes: "Matte finish, eco-friendly PLA." }),
  createPreset({ id: 'pm-2', profileName: 'Polymaker PolyLite PETG', printerBrand: 'Other', manufacturer: 'Polymaker', brand: 'PolyLite', filamentType: 'PETG', nozzleTemp: 235, bedTemp: 75, maxVolumetricSpeed: 12, fanSpeedMin: 20, fanSpeedMax: 60, density: 1.25, dryingTemp: 65, dryingTime: '6h' }),
  createPreset({ id: 'pm-3', profileName: 'Polymaker PolyLite ABS', printerBrand: 'Other', manufacturer: 'Polymaker', brand: 'PolyLite', filamentType: 'ABS', nozzleTemp: 250, bedTemp: 95, maxVolumetricSpeed: 15, fanSpeedMin: 0, fanSpeedMax: 30, density: 1.08, dryingTemp: 80, dryingTime: '4h', notes: "Enclosure recommended." }),
  createPreset({ id: 'pm-4', profileName: 'Polymaker PolyLite ASA', printerBrand: 'Other', manufacturer: 'Polymaker', brand: 'PolyLite', filamentType: 'ASA', nozzleTemp: 255, bedTemp: 95, maxVolumetricSpeed: 15, fanSpeedMin: 0, fanSpeedMax: 20, density: 1.07, dryingTemp: 80, dryingTime: '4h', notes: "UV resistant, enclosure recommended." }),
  createPreset({ id: 'pm-5', profileName: 'Polymaker PolyMax PLA', printerBrand: 'Other', manufacturer: 'Polymaker', brand: 'PolyMax', filamentType: 'PLA', nozzleTemp: 210, bedTemp: 60, maxVolumetricSpeed: 16, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.22, notes: "High impact resistance." }),
  createPreset({ id: 'pm-6', profileName: 'Polymaker PolyFlex TPU95', printerBrand: 'Other', manufacturer: 'Polymaker', brand: 'PolyFlex', filamentType: 'TPU', nozzleTemp: 220, bedTemp: 40, maxVolumetricSpeed: 3, fanSpeedMin: 80, fanSpeedMax: 100, density: 1.22, printSpeed: 30, retractionDistance: 3.0, retractionSpeed: 40, dryingTemp: 65, dryingTime: '6h' }),
  createPreset({ id: 'pm-7', profileName: 'Polymaker PolySmooth (PVB)', printerBrand: 'Other', manufacturer: 'Polymaker', brand: 'PolySmooth', filamentType: 'Other', nozzleTemp: 220, bedTemp: 60, maxVolumetricSpeed: 10, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.10, notes: "Smoothable with IPA." }),
  createPreset({ id: 'pm-pan-1', profileName: 'Polymaker Panchroma Silk', printerBrand: 'Other', manufacturer: 'Polymaker', brand: 'Panchroma', filamentType: 'PLA', nozzleTemp: 215, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "Silk PLA. Shiny finish. Print slower for better gloss." }),
  createPreset({ id: 'pm-pan-2', profileName: 'Polymaker Panchroma Matte', printerBrand: 'Other', manufacturer: 'Polymaker', brand: 'Panchroma', filamentType: 'PLA', nozzleTemp: 210, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "Matte finish. Hides layer lines." }),
  createPreset({ id: 'pm-pan-3', profileName: 'Polymaker Panchroma Glow', printerBrand: 'Other', manufacturer: 'Polymaker', brand: 'Panchroma', filamentType: 'PLA', nozzleTemp: 215, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "Glow in the dark. Abrasive - use hardened nozzle." }),
  createPreset({ id: 'pm-fib-1', profileName: 'Polymaker Fiberon PA6-CF', printerBrand: 'Other', manufacturer: 'Polymaker', brand: 'Fiberon', filamentType: 'PA-CF', nozzleTemp: 290, bedTemp: 50, maxVolumetricSpeed: 10, fanSpeedMin: 0, fanSpeedMax: 0, density: 1.20, dryingTemp: 80, dryingTime: '12h', notes: "Nylon 6 Carbon Fiber. High temp, hardened nozzle required. Keep dry." }),
  createPreset({ id: 'pm-fib-2', profileName: 'Polymaker Fiberon PA6-GF', printerBrand: 'Other', manufacturer: 'Polymaker', brand: 'Fiberon', filamentType: 'PA-GF', nozzleTemp: 285, bedTemp: 50, maxVolumetricSpeed: 10, fanSpeedMin: 0, fanSpeedMax: 0, density: 1.22, dryingTemp: 80, dryingTime: '12h', notes: "Nylon 6 Glass Fiber. High impact, hardened nozzle required." }),
  createPreset({ id: 'pm-fib-3', profileName: 'Polymaker Fiberon PET-CF', printerBrand: 'Other', manufacturer: 'Polymaker', brand: 'Fiberon', filamentType: 'Copolyester', nozzleTemp: 260, bedTemp: 80, maxVolumetricSpeed: 12, fanSpeedMin: 0, fanSpeedMax: 30, density: 1.27, dryingTemp: 70, dryingTime: '8h', notes: "PET Carbon Fiber. High stiffness, low moisture absorption compared to Nylon." }),
  createPreset({ id: 'pm-fib-4', profileName: 'Polymaker Fiberon PLA-CF', printerBrand: 'Other', manufacturer: 'Polymaker', brand: 'Fiberon', filamentType: 'PLA', nozzleTemp: 220, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "PLA Carbon Fiber. Easy to print, stiff, matte finish." }),
  createPreset({ id: 'pm-fib-5', profileName: 'Polymaker Fiberon ABS-CF', printerBrand: 'Other', manufacturer: 'Polymaker', brand: 'Fiberon', filamentType: 'ABS', nozzleTemp: 270, bedTemp: 100, maxVolumetricSpeed: 12, fanSpeedMin: 0, fanSpeedMax: 20, density: 1.12, dryingTemp: 80, dryingTime: '6h', notes: "ABS Carbon Fiber. Hardened nozzle required. Enclosure recommended." }),
  createPreset({ id: 'pm-fib-6', profileName: 'Polymaker Fiberon ABS-GF', printerBrand: 'Other', manufacturer: 'Polymaker', brand: 'Fiberon', filamentType: 'ABS', nozzleTemp: 270, bedTemp: 100, maxVolumetricSpeed: 12, fanSpeedMin: 0, fanSpeedMax: 20, density: 1.14, dryingTemp: 80, dryingTime: '6h', notes: "ABS Glass Fiber. Hardened nozzle required. Enclosure recommended." }),
  createPreset({ id: 'pm-fib-7', profileName: 'Polymaker Fiberon ASA-CF', printerBrand: 'Other', manufacturer: 'Polymaker', brand: 'Fiberon', filamentType: 'ASA', nozzleTemp: 270, bedTemp: 95, maxVolumetricSpeed: 12, fanSpeedMin: 0, fanSpeedMax: 20, density: 1.11, dryingTemp: 80, dryingTime: '6h', notes: "ASA Carbon Fiber. UV Resistant. Hardened nozzle required." }),
  createPreset({ id: 'pm-fib-8', profileName: 'Polymaker Fiberon ASA-GF', printerBrand: 'Other', manufacturer: 'Polymaker', brand: 'Fiberon', filamentType: 'ASA', nozzleTemp: 270, bedTemp: 95, maxVolumetricSpeed: 12, fanSpeedMin: 0, fanSpeedMax: 20, density: 1.13, dryingTemp: 80, dryingTime: '6h', notes: "ASA Glass Fiber. UV Resistant. Hardened nozzle required." }),

  // Porima (Turkish)
  createPreset({ id: 'por-1', profileName: 'Porima PLA', printerBrand: 'Other', manufacturer: 'Porima', brand: 'PLA', filamentType: 'PLA', nozzleTemp: 210, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24 }),
  createPreset({ id: 'por-2', profileName: 'Porima Tough PLA', printerBrand: 'Other', manufacturer: 'Porima', brand: 'Tough', filamentType: 'PLA', nozzleTemp: 215, bedTemp: 60, maxVolumetricSpeed: 16, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "High impact PLA." }),
  createPreset({ id: 'por-3', profileName: 'Porima PLA Carbon', printerBrand: 'Other', manufacturer: 'Porima', brand: 'Carbon', filamentType: 'PLA', nozzleTemp: 220, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.28, notes: "Carbon Fiber reinforced PLA." }),
  createPreset({ id: 'por-4', profileName: 'Porima ASA', printerBrand: 'Other', manufacturer: 'Porima', brand: 'ASA', filamentType: 'ASA', nozzleTemp: 255, bedTemp: 100, maxVolumetricSpeed: 14, fanSpeedMin: 0, fanSpeedMax: 20, density: 1.07 }),

  // Priline
  createPreset({ id: 'pri-1', profileName: 'Priline PC-CF', printerBrand: 'Other', manufacturer: 'Priline', brand: 'PC-CF', filamentType: 'PC', nozzleTemp: 255, bedTemp: 100, maxVolumetricSpeed: 10, fanSpeedMin: 0, fanSpeedMax: 0, density: 1.25, notes: "Budget Carbon Polycarbonate. Very stiff." }),
  createPreset({ id: 'pri-2', profileName: 'Priline TPU 98A', printerBrand: 'Other', manufacturer: 'Priline', brand: 'TPU', filamentType: 'TPU', nozzleTemp: 210, bedTemp: 60, maxVolumetricSpeed: 5, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.21 }),

  // PrintaMent (AprintaPro)
  createPreset({ id: 'prm-1', profileName: 'PrintaMent PLA', printerBrand: 'Other', manufacturer: 'PrintaMent', brand: 'PLA', filamentType: 'PLA', nozzleTemp: 210, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24 }),

  // Printologist (House Brand)
  createPreset({ id: 'prt-1', profileName: 'Printologist PLA PRO', printerBrand: 'Other', manufacturer: 'Printologist', brand: 'PRO', filamentType: 'PLA', nozzleTemp: 210, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "High quality consistent diameter." }),
  createPreset({ id: 'prt-2', profileName: 'Printologist PETG', printerBrand: 'Other', manufacturer: 'Printologist', brand: 'PETG', filamentType: 'PETG', nozzleTemp: 240, bedTemp: 80, maxVolumetricSpeed: 12, fanSpeedMin: 40, fanSpeedMax: 80, density: 1.27, dryingTemp: 65, dryingTime: '4h' }),
  createPreset({ id: 'prt-3', profileName: 'Printologist ABS Pro', printerBrand: 'Other', manufacturer: 'Printologist', brand: 'ABS', filamentType: 'ABS', nozzleTemp: 250, bedTemp: 100, maxVolumetricSpeed: 15, fanSpeedMin: 0, fanSpeedMax: 20, density: 1.05, dryingTemp: 80, dryingTime: '4h', notes: "Low odor, high strength." }),

  // Proto-pasta
  createPreset({ id: 'pp-1', profileName: 'Proto-pasta HTPLA', printerBrand: 'Other', manufacturer: 'Proto-pasta', brand: 'HTPLA', filamentType: 'PLA', nozzleTemp: 205, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "Heat treatable for high temp resistance." }),
  createPreset({ id: 'pp-2', profileName: 'Proto-pasta Carbon Fiber PLA', printerBrand: 'Other', manufacturer: 'Proto-pasta', brand: 'CF PLA', filamentType: 'PLA', nozzleTemp: 210, bedTemp: 60, maxVolumetricSpeed: 12, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.3, notes: "Abrasive. Use hardened nozzle." }),
  createPreset({ id: 'pp-3', profileName: 'Proto-pasta Conductive PLA', printerBrand: 'Other', manufacturer: 'Proto-pasta', brand: 'Conductive', filamentType: 'PLA', nozzleTemp: 215, bedTemp: 60, maxVolumetricSpeed: 10, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "Electrically conductive composite." }),

  // Prusa (Expanded)
  createPreset({ id: 'preset-6', profileName: 'Prusament PLA', printerBrand: 'Prusa', manufacturer: 'Prusa', brand: 'Prusament', filamentType: 'PLA', nozzleTemp: 215, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24 }),
  createPreset({ id: 'preset-7', profileName: 'Prusament PETG', printerBrand: 'Prusa', manufacturer: 'Prusa', brand: 'Prusament', filamentType: 'PETG', nozzleTemp: 240, bedTemp: 85, maxVolumetricSpeed: 12, fanSpeedMin: 30, fanSpeedMax: 50, density: 1.27, dryingTemp: 65, dryingTime: '4h' }),
  createPreset({ id: 'preset-8', profileName: 'Prusament ASA', printerBrand: 'Prusa', manufacturer: 'Prusa', brand: 'Prusament', filamentType: 'ASA', nozzleTemp: 260, bedTemp: 105, maxVolumetricSpeed: 12, fanSpeedMin: 0, fanSpeedMax: 20, density: 1.07, dryingTemp: 80, dryingTime: '4h' }),
  createPreset({ id: 'prusa-pc', profileName: 'Prusament PC Blend', printerBrand: 'Prusa', manufacturer: 'Prusa', brand: 'Prusament', filamentType: 'PC', nozzleTemp: 275, bedTemp: 110, maxVolumetricSpeed: 10, fanSpeedMin: 0, fanSpeedMax: 0, density: 1.22, dryingTemp: 90, dryingTime: '6h', notes: "Requires Glue Stick/Separator. Magigoo recommended." }),
  createPreset({ id: 'prusa-pvb', profileName: 'Prusament PVB', printerBrand: 'Prusa', manufacturer: 'Prusa', brand: 'Prusament', filamentType: 'Other', nozzleTemp: 215, bedTemp: 75, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.09, dryingTemp: 50, dryingTime: '4h', notes: "IPA Smoothable filament." }),
  createPreset({ id: 'prusa-pacf', profileName: 'Prusament PA11 Carbon Fiber', printerBrand: 'Prusa', manufacturer: 'Prusa', brand: 'Prusament', filamentType: 'PA-CF', nozzleTemp: 285, bedTemp: 110, maxVolumetricSpeed: 8, fanSpeedMin: 0, fanSpeedMax: 0, density: 1.05, notes: "Nylon 11 CF. Hardened nozzle. Print on powder coated sheet with glue." }),

  // Qidi Tech
  createPreset({ id: 'qidi-1', profileName: 'Qidi PLA Rapido', printerBrand: 'Other', manufacturer: 'Qidi Tech', brand: 'Rapido', filamentType: 'PLA', nozzleTemp: 220, bedTemp: 60, maxVolumetricSpeed: 22, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "High flow PLA for X-Max/Plus/Smart 3 series." }),
  createPreset({ id: 'qidi-2', profileName: 'Qidi ABS-GF25', printerBrand: 'Other', manufacturer: 'Qidi Tech', brand: 'ABS-GF25', filamentType: 'ABS', nozzleTemp: 260, bedTemp: 100, maxVolumetricSpeed: 16, fanSpeedMin: 0, fanSpeedMax: 20, density: 1.15, dryingTemp: 70, dryingTime: '8h', notes: "Glass Fiber reinforced ABS. Hardened nozzle required. 250-270°C." }),
  createPreset({ id: 'qidi-3', profileName: 'Qidi PA12-CF', printerBrand: 'Other', manufacturer: 'Qidi Tech', brand: 'PA12-CF', filamentType: 'PA-CF', nozzleTemp: 285, bedTemp: 80, maxVolumetricSpeed: 12, fanSpeedMin: 0, fanSpeedMax: 0, density: 1.20, dryingTemp: 90, dryingTime: '12h', notes: "Carbon Fiber Nylon. Hardened nozzle, drybox active printing required." }),
  createPreset({ id: 'qidi-4', profileName: 'Qidi PETG-Tough', printerBrand: 'Other', manufacturer: 'Qidi Tech', brand: 'PETG-Tough', filamentType: 'PETG', nozzleTemp: 240, bedTemp: 80, maxVolumetricSpeed: 14, fanSpeedMin: 30, fanSpeedMax: 60, density: 1.27 }),

  // R3D (AliExpress High Speed)
  createPreset({ id: 'r3d-1', profileName: 'R3D High Speed PLA', printerBrand: 'Other', manufacturer: 'R3D', brand: 'High Speed', filamentType: 'PLA', nozzleTemp: 220, bedTemp: 60, maxVolumetricSpeed: 20, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "Designed for fast printing." }),
  createPreset({ id: 'r3d-2', profileName: 'R3D PETG', printerBrand: 'Other', manufacturer: 'R3D', brand: 'PETG', filamentType: 'PETG', nozzleTemp: 235, bedTemp: 75, maxVolumetricSpeed: 14, fanSpeedMin: 30, fanSpeedMax: 70, density: 1.27 }),

  // Recreus
  createPreset({ id: 'rec-1', profileName: 'Recreus Filaflex 82A', printerBrand: 'Other', manufacturer: 'Recreus', brand: 'Filaflex', filamentType: 'TPU', nozzleTemp: 230, bedTemp: 40, maxVolumetricSpeed: 3, fanSpeedMin: 80, fanSpeedMax: 100, density: 1.20, retractionDistance: 2, retractionSpeed: 30, notes: "The original elastic filament. Slow print speed (20-40mm/s). Loosen extruder tension." }),
  createPreset({ id: 'rec-2', profileName: 'Recreus Filaflex 95A', printerBrand: 'Other', manufacturer: 'Recreus', brand: 'Filaflex', filamentType: 'TPU', nozzleTemp: 230, bedTemp: 50, maxVolumetricSpeed: 5, fanSpeedMin: 80, fanSpeedMax: 100, density: 1.21, notes: "Medium-flexibility. Easier to print than 82A. Compatible with most bowden extruders." }),
  createPreset({ id: 'rec-3', profileName: 'Recreus Filaflex 70A', printerBrand: 'Other', manufacturer: 'Recreus', brand: 'Filaflex', filamentType: 'TPU', nozzleTemp: 235, bedTemp: 40, maxVolumetricSpeed: 2, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.20, retractionDistance: 0, retractionSpeed: 0, notes: "Ultra-Soft. Direct Drive ONLY. VERY slow speed required (15-20mm/s)." }),
  createPreset({ id: 'rec-4', profileName: 'Recreus Filaflex 60A PRO', printerBrand: 'Other', manufacturer: 'Recreus', brand: 'Filaflex', filamentType: 'TPU', nozzleTemp: 240, bedTemp: 40, maxVolumetricSpeed: 1.5, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.17, retractionDistance: 0, retractionSpeed: 0, notes: "Extremely soft. For pro users. Direct Drive mandatory. Disable retraction." }),
  createPreset({ id: 'rec-5', profileName: 'Recreus PLA Purifier', printerBrand: 'Other', manufacturer: 'Recreus', brand: 'Purifier', filamentType: 'PLA', nozzleTemp: 215, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "Matte finish. Contains catalyst to mineralize gases." }),

  // Rosa3D (Poland)
  createPreset({ id: 'rosa-1', profileName: 'Rosa3D PLA Starter', printerBrand: 'Other', manufacturer: 'Rosa3D', brand: 'Starter', filamentType: 'PLA', nozzleTemp: 210, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "Easy to print, high quality basic PLA." }),
  createPreset({ id: 'rosa-2', profileName: 'Rosa3D PETG Standard', printerBrand: 'Other', manufacturer: 'Rosa3D', brand: 'Standard', filamentType: 'PETG', nozzleTemp: 240, bedTemp: 70, maxVolumetricSpeed: 12, fanSpeedMin: 30, fanSpeedMax: 70, density: 1.27 }),
  createPreset({ id: 'rosa-3', profileName: 'Rosa3D ASA', printerBrand: 'Other', manufacturer: 'Rosa3D', brand: 'ASA', filamentType: 'ASA', nozzleTemp: 250, bedTemp: 95, maxVolumetricSpeed: 14, fanSpeedMin: 0, fanSpeedMax: 20, density: 1.07, notes: "UV Resistant." }),
  createPreset({ id: 'rosa-4', profileName: 'Rosa3D BioWOOD', printerBrand: 'Other', manufacturer: 'Rosa3D', brand: 'BioWOOD', filamentType: 'PLA', nozzleTemp: 195, bedTemp: 50, maxVolumetricSpeed: 8, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.15, notes: "Wood fiber filled. Use 0.5mm+ nozzle. Print cool." }),
  createPreset({ id: 'rosa-5', profileName: 'Rosa3D PA12+CF15', printerBrand: 'Other', manufacturer: 'Rosa3D', brand: 'PA12+CF15', filamentType: 'PA-CF', nozzleTemp: 270, bedTemp: 100, maxVolumetricSpeed: 8, fanSpeedMin: 0, fanSpeedMax: 0, density: 1.15, dryingTemp: 100, dryingTime: '6h', notes: "Nylon 12 with 15% Carbon. Hardened nozzle required." }),
  createPreset({ id: 'rosa-6', profileName: 'Rosa3D Silk', printerBrand: 'Other', manufacturer: 'Rosa3D', brand: 'Silk', filamentType: 'PLA', nozzleTemp: 215, bedTemp: 60, maxVolumetricSpeed: 14, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "Shiny silk finish." }),
  createPreset({ id: 'rosa-7', profileName: 'Rosa3D PEBA', printerBrand: 'Other', manufacturer: 'Rosa3D', brand: 'PEBA', filamentType: 'PEBA', nozzleTemp: 230, bedTemp: 60, maxVolumetricSpeed: 4, fanSpeedMin: 50, fanSpeedMax: 100, density: 1.02, notes: "Flexible, low density, high energy return. Print slow." }),

  // SainSmart
  createPreset({ id: 'ss-1', profileName: 'SainSmart TPU 95A', printerBrand: 'Other', manufacturer: 'SainSmart', brand: 'TPU', filamentType: 'TPU', nozzleTemp: 220, bedTemp: 50, maxVolumetricSpeed: 4, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.21, notes: "Popular flexible filament." }),

  // Sakata 3D (Spain)
  createPreset({ id: 'sak-1', profileName: 'Sakata PLA 850', printerBrand: 'Other', manufacturer: 'Sakata 3D', brand: 'PLA 850', filamentType: 'PLA', nozzleTemp: 210, bedTemp: 55, maxVolumetricSpeed: 16, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "Based on NatureWorks Ingeo 850. Crystallizable." }),
  createPreset({ id: 'sak-2', profileName: 'Sakata PLA 870', printerBrand: 'Other', manufacturer: 'Sakata 3D', brand: 'PLA 870', filamentType: 'PLA', nozzleTemp: 220, bedTemp: 60, maxVolumetricSpeed: 18, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "High impact resistance PLA." }),

  // Siraya Tech
  createPreset({ id: 'st-1', profileName: 'Siraya Tech EzPC', printerBrand: 'Other', manufacturer: 'Siraya Tech', brand: 'EzPC', filamentType: 'PC', nozzleTemp: 260, bedTemp: 95, maxVolumetricSpeed: 12, fanSpeedMin: 0, fanSpeedMax: 0, density: 1.20, dryingTemp: 80, dryingTime: '6h', notes: "Easy to print Polycarbonate, warping resistant." }),
  createPreset({ id: 'st-2', profileName: 'Siraya Tech PLA+', printerBrand: 'Other', manufacturer: 'Siraya Tech', brand: 'PLA+', filamentType: 'PLA', nozzleTemp: 210, bedTemp: 55, maxVolumetricSpeed: 16, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "Enhanced strength PLA." }),
  createPreset({ id: 'st-3', profileName: 'Siraya Tech ABS-Like', printerBrand: 'Other', manufacturer: 'Siraya Tech', brand: 'ABS-Like', filamentType: 'ABS', nozzleTemp: 250, bedTemp: 95, maxVolumetricSpeed: 15, fanSpeedMin: 0, fanSpeedMax: 30, density: 1.05, notes: "Lower odor than standard ABS, good layer adhesion." }),
  createPreset({ id: 'st-4', profileName: 'Siraya Tech PETG', printerBrand: 'Other', manufacturer: 'Siraya Tech', brand: 'PETG', filamentType: 'PETG', nozzleTemp: 240, bedTemp: 75, maxVolumetricSpeed: 13, fanSpeedMin: 30, fanSpeedMax: 70, density: 1.27, dryingTemp: 65, dryingTime: '4h' }),
  createPreset({ id: 'st-5', profileName: 'Siraya Tech ABS-GF', printerBrand: 'Other', manufacturer: 'Siraya Tech', brand: 'ABS-GF', filamentType: 'ABS', nozzleTemp: 260, bedTemp: 100, maxVolumetricSpeed: 12, fanSpeedMin: 0, fanSpeedMax: 20, density: 1.15, dryingTemp: 80, dryingTime: '6h', notes: "Glass Fiber Reinforced ABS. Hardened nozzle required. Low warp." }),
  createPreset({ id: 'st-6', profileName: 'Siraya Tech ABS-CF', printerBrand: 'Other', manufacturer: 'Siraya Tech', brand: 'ABS-CF', filamentType: 'ABS', nozzleTemp: 265, bedTemp: 100, maxVolumetricSpeed: 12, fanSpeedMin: 0, fanSpeedMax: 20, density: 1.12, dryingTemp: 80, dryingTime: '6h', notes: "Carbon Fiber Reinforced ABS. Hardened nozzle required. High stiffness." }),

  // Smart Materials 3D
  createPreset({ id: 'smart-1', profileName: 'Smartfil PLA', printerBrand: 'Other', manufacturer: 'Smart Materials 3D', brand: 'Smartfil', filamentType: 'PLA', nozzleTemp: 210, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24 }),
  createPreset({ id: 'smart-2', profileName: 'Innovatefil PP', printerBrand: 'Other', manufacturer: 'Smart Materials 3D', brand: 'Innovatefil', filamentType: 'Other', nozzleTemp: 220, bedTemp: 60, maxVolumetricSpeed: 10, fanSpeedMin: 50, fanSpeedMax: 100, density: 0.90, notes: "Polypropylene. Very difficult adhesion. Use PP packing tape on bed." }),

  // Spectrum Filaments
  createPreset({ id: 'spec-1', profileName: 'Spectrum PLA Pro', printerBrand: 'Other', manufacturer: 'Spectrum Filaments', brand: 'Pro', filamentType: 'PLA', nozzleTemp: 215, bedTemp: 60, maxVolumetricSpeed: 16, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24 }),
  createPreset({ id: 'spec-2', profileName: 'Spectrum PETG', printerBrand: 'Other', manufacturer: 'Spectrum Filaments', brand: 'PETG', filamentType: 'PETG', nozzleTemp: 240, bedTemp: 80, maxVolumetricSpeed: 12, fanSpeedMin: 30, fanSpeedMax: 70, density: 1.27 }),

  // Stratasys (Industrial - Generic Specs for reference)
  createPreset({ id: 'str-1', profileName: 'Stratasys ABS-M30', printerBrand: 'Other', manufacturer: 'Stratasys', brand: 'M30', filamentType: 'ABS', nozzleTemp: 280, bedTemp: 110, maxVolumetricSpeed: 12, fanSpeedMin: 0, fanSpeedMax: 0, density: 1.04, notes: "Reference profile for ABS-M30 material. Industrial use." }),
  createPreset({ id: 'str-2', profileName: 'Stratasys Ultem 9085', printerBrand: 'Other', manufacturer: 'Stratasys', brand: 'Ultem', filamentType: 'Other', nozzleTemp: 360, bedTemp: 150, maxVolumetricSpeed: 8, fanSpeedMin: 0, fanSpeedMax: 0, density: 1.34, notes: "PEI Blend. Extreme heat/flame resistance. Aerospace grade." }),

  // Sunlu
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

  // Taulman3D
  createPreset({ id: 'taul-1', profileName: 'Taulman Alloy 910', printerBrand: 'Other', manufacturer: 'Taulman3D', brand: 'Alloy 910', filamentType: 'Nylon', nozzleTemp: 255, bedTemp: 45, maxVolumetricSpeed: 10, fanSpeedMin: 0, fanSpeedMax: 0, density: 1.13, dryingTemp: 70, dryingTime: '12h', notes: "High strength nylon. Use PVA glue." }),
  createPreset({ id: 'taul-2', profileName: 'Taulman T-Glase', printerBrand: 'Other', manufacturer: 'Taulman3D', brand: 'T-Glase', filamentType: 'PETT', nozzleTemp: 240, bedTemp: 60, maxVolumetricSpeed: 8, fanSpeedMin: 50, fanSpeedMax: 100, density: 1.27, notes: "High optical clarity. Print slowly." }),

  // TECBears
  createPreset({ id: 'tec-1', profileName: 'TECBears PLA', printerBrand: 'Other', manufacturer: 'TECBears', brand: 'PLA', filamentType: 'PLA', nozzleTemp: 200, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24 }),

  // TechInit
  createPreset({ id: 'techinit-1', profileName: 'TechInit Carbon PA', printerBrand: 'Other', manufacturer: 'TechInit', brand: 'Carbon', filamentType: 'PA-CF', nozzleTemp: 260, bedTemp: 100, maxVolumetricSpeed: 10, fanSpeedMin: 0, fanSpeedMax: 0, density: 1.18, dryingTemp: 90, dryingTime: '8h', notes: "Nylon Carbon Fiber. Hardened nozzle required. Keep absolutely dry." }),
  createPreset({ id: 'techinit-2', profileName: 'TechInit PC-ABS', printerBrand: 'Other', manufacturer: 'TechInit', brand: 'PC-ABS', filamentType: 'ABS', nozzleTemp: 265, bedTemp: 110, maxVolumetricSpeed: 12, fanSpeedMin: 0, fanSpeedMax: 10, density: 1.10, dryingTemp: 80, dryingTime: '6h', notes: "High impact strength. Enclosure mandatory." }),
  createPreset({ id: 'techinit-3', profileName: 'TechInit ASA Tech', printerBrand: 'Other', manufacturer: 'TechInit', brand: 'ASA', filamentType: 'ASA', nozzleTemp: 255, bedTemp: 100, maxVolumetricSpeed: 14, fanSpeedMin: 0, fanSpeedMax: 20, density: 1.07, dryingTemp: 80, dryingTime: '4h', notes: "UV Resistant. Best for outdoor parts." }),
  createPreset({ id: 'techinit-4', profileName: 'TechInit PETG Technical', printerBrand: 'Other', manufacturer: 'TechInit', brand: 'PETG', filamentType: 'PETG', nozzleTemp: 245, bedTemp: 85, maxVolumetricSpeed: 12, fanSpeedMin: 30, fanSpeedMax: 60, density: 1.27, dryingTemp: 65, dryingTime: '6h', notes: "Higher temp resistance than standard PETG." }),

  // Tianse
  createPreset({ id: 'tia-1', profileName: 'Tianse PLA', printerBrand: 'Other', manufacturer: 'Tianse', brand: 'PLA', filamentType: 'PLA', nozzleTemp: 200, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24 }),

  // Tinmorry (Amazon EU Staple)
  createPreset({ id: 'tin-1', profileName: 'Tinmorry PLA', printerBrand: 'Other', manufacturer: 'Tinmorry', brand: 'PLA', filamentType: 'PLA', nozzleTemp: 205, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24 }),
  createPreset({ id: 'tin-2', profileName: 'Tinmorry PETG', printerBrand: 'Other', manufacturer: 'Tinmorry', brand: 'PETG', filamentType: 'PETG', nozzleTemp: 235, bedTemp: 70, maxVolumetricSpeed: 12, fanSpeedMin: 40, fanSpeedMax: 80, density: 1.27 }),

  // Torupy
  createPreset({ id: 'tor-1', profileName: 'Torupy PLA', printerBrand: 'Other', manufacturer: 'Torupy', brand: 'PLA', filamentType: 'PLA', nozzleTemp: 205, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24 }),
  createPreset({ id: 'tor-2', profileName: 'Torupy PETG', printerBrand: 'Other', manufacturer: 'Torupy', brand: 'PETG', filamentType: 'PETG', nozzleTemp: 240, bedTemp: 80, maxVolumetricSpeed: 12, fanSpeedMin: 40, fanSpeedMax: 80, density: 1.27, notes: "Optimized for less stringing." }),
  createPreset({ id: 'tor-3', profileName: 'Torupy Silk PLA', printerBrand: 'Other', manufacturer: 'Torupy', brand: 'Silk', filamentType: 'PLA', nozzleTemp: 215, bedTemp: 60, maxVolumetricSpeed: 12, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "Shiny finish." }),
  createPreset({ id: 'tor-4', profileName: 'Torupy TPU', printerBrand: 'Other', manufacturer: 'Torupy', brand: 'TPU', filamentType: 'TPU', nozzleTemp: 220, bedTemp: 55, maxVolumetricSpeed: 3.5, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.21 }),

  // Treed Filaments
  createPreset({ id: 'treed-1', profileName: 'Treed Carbonium (PA-CF)', printerBrand: 'Other', manufacturer: 'Treed Filaments', brand: 'Carbonium', filamentType: 'PA-CF', nozzleTemp: 260, bedTemp: 110, maxVolumetricSpeed: 8, fanSpeedMin: 0, fanSpeedMax: 0, density: 1.30, dryingTemp: 100, dryingTime: '6h', notes: "Hardened nozzle mandatory. High rigidity." }),
  createPreset({ id: 'treed-2', profileName: 'Treed Kyotoflex (TPU)', printerBrand: 'Other', manufacturer: 'Treed Filaments', brand: 'Kyotoflex', filamentType: 'TPU', nozzleTemp: 230, bedTemp: 50, maxVolumetricSpeed: 4, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.21, notes: "Bio-based flexible TPE/TPU." }),
  createPreset({ id: 'treed-3', profileName: 'Treed Architectural Sand', printerBrand: 'Other', manufacturer: 'Treed Filaments', brand: 'Architectural', filamentType: 'PLA', nozzleTemp: 215, bedTemp: 60, maxVolumetricSpeed: 12, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.40, notes: "Mineral filled PLA. Stone-like finish. 0.6mm nozzle recommended." }),

  // Tronxy (AliExpress)
  createPreset({ id: 'tron-1', profileName: 'Tronxy PLA', printerBrand: 'Other', manufacturer: 'Tronxy', brand: 'PLA', filamentType: 'PLA', nozzleTemp: 200, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24 }),

  // Ultimaker (Genericized)
  createPreset({ id: 'ulti-1', profileName: 'Ultimaker Tough PLA', printerBrand: 'Ultimaker', manufacturer: 'Ultimaker', brand: 'Tough PLA', filamentType: 'PLA', nozzleTemp: 215, bedTemp: 60, maxVolumetricSpeed: 16, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "ABS strength with PLA printability." }),
  createPreset({ id: 'ulti-2', profileName: 'Ultimaker PC', printerBrand: 'Ultimaker', manufacturer: 'Ultimaker', brand: 'PC', filamentType: 'PC', nozzleTemp: 270, bedTemp: 110, maxVolumetricSpeed: 10, fanSpeedMin: 0, fanSpeedMax: 20, density: 1.20 }),
  createPreset({ id: 'ulti-3', profileName: 'Ultimaker CPE+', printerBrand: 'Ultimaker', manufacturer: 'Ultimaker', brand: 'CPE+', filamentType: 'Copolyester', nozzleTemp: 260, bedTemp: 110, maxVolumetricSpeed: 8, fanSpeedMin: 20, fanSpeedMax: 50, density: 1.18, notes: "High temp Co-polyester." }),

  // Verbatim
  createPreset({ id: 'verb-1', profileName: 'Verbatim PLA', printerBrand: 'Other', manufacturer: 'Verbatim', brand: 'PLA', filamentType: 'PLA', nozzleTemp: 210, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24 }),
  createPreset({ id: 'verb-2', profileName: 'Verbatim Durabio', printerBrand: 'Other', manufacturer: 'Verbatim', brand: 'Durabio', filamentType: 'Other', nozzleTemp: 235, bedTemp: 80, maxVolumetricSpeed: 12, fanSpeedMin: 30, fanSpeedMax: 70, density: 1.30, notes: "Bio-based Polycarbonate. High transparency, high durability." }),
  createPreset({ id: 'verb-3', profileName: 'Verbatim BVOH', printerBrand: 'Other', manufacturer: 'Verbatim', brand: 'BVOH', filamentType: 'Other', nozzleTemp: 210, bedTemp: 60, maxVolumetricSpeed: 10, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.14, notes: "Water soluble support material. Keep dry." }),

  // Voxelab (Flashforge budget brand)
  createPreset({ id: 'vox-1', profileName: 'Voxelab PLA', printerBrand: 'Other', manufacturer: 'Voxelab', brand: 'PLA', filamentType: 'PLA', nozzleTemp: 200, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "Budget friendly PLA." }),
  createPreset({ id: 'vox-2', profileName: 'Voxelab PLA+', printerBrand: 'Other', manufacturer: 'Voxelab', brand: 'PLA+', filamentType: 'PLA', nozzleTemp: 215, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "Tougher than standard PLA." }),

  // Winkle
  createPreset({ id: 'wink-1', profileName: 'Winkle PLA HD', printerBrand: 'Other', manufacturer: 'Winkle', brand: 'PLA HD', filamentType: 'PLA', nozzleTemp: 210, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24, notes: "High Definition PLA." }),

  // XSTRAND (OwensCorning)
  createPreset({ id: 'xst-1', profileName: 'XSTRAND GF30-PA6', printerBrand: 'Other', manufacturer: 'XSTRAND (OwensCorning)', brand: 'GF30-PA6', filamentType: 'PA-GF', nozzleTemp: 260, bedTemp: 90, maxVolumetricSpeed: 8, fanSpeedMin: 0, fanSpeedMax: 0, density: 1.28, dryingTemp: 100, dryingTime: '6h', notes: "30% Glass Fiber Nylon. Very abrasive. Hardened nozzle required." }),
  createPreset({ id: 'xst-2', profileName: 'XSTRAND GF30-PP', printerBrand: 'Other', manufacturer: 'XSTRAND (OwensCorning)', brand: 'GF30-PP', filamentType: 'Other', nozzleTemp: 260, bedTemp: 60, maxVolumetricSpeed: 10, fanSpeedMin: 0, fanSpeedMax: 0, density: 1.05, notes: "30% Glass Fiber Polypropylene. Use PP packaging tape for bed adhesion." }),

  // XYZprinting
  createPreset({ id: 'xyz-1', profileName: 'XYZprinting PLA', printerBrand: 'Other', manufacturer: 'XYZprinting', brand: 'PLA', filamentType: 'PLA', nozzleTemp: 210, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24 }),
  createPreset({ id: 'xyz-2', profileName: 'XYZprinting ABS', printerBrand: 'Other', manufacturer: 'XYZprinting', brand: 'ABS', filamentType: 'ABS', nozzleTemp: 235, bedTemp: 90, maxVolumetricSpeed: 15, fanSpeedMin: 0, fanSpeedMax: 20, density: 1.04 }),

  // Yousu (Marketplace / iForm)
  createPreset({ id: 'you-1', profileName: 'Yousu PLA', printerBrand: 'Other', manufacturer: 'Yousu', brand: 'PLA', filamentType: 'PLA', nozzleTemp: 205, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24 }),
  createPreset({ id: 'you-2', profileName: 'Yousu TPU', printerBrand: 'Other', manufacturer: 'Yousu', brand: 'TPU', filamentType: 'TPU', nozzleTemp: 220, bedTemp: 50, maxVolumetricSpeed: 3.5, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.21 }),

  // Ziro (Amazon / Specialty)
  createPreset({ id: 'ziro-1', profileName: 'Ziro PLA', printerBrand: 'Other', manufacturer: 'Ziro', brand: 'PLA', filamentType: 'PLA', nozzleTemp: 205, bedTemp: 60, maxVolumetricSpeed: 15, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.24 }),
  createPreset({ id: 'ziro-2', profileName: 'Ziro Marble PLA', printerBrand: 'Other', manufacturer: 'Ziro', brand: 'Marble', filamentType: 'PLA', nozzleTemp: 210, bedTemp: 60, maxVolumetricSpeed: 12, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.28, notes: "Marble effect. 0.5mm nozzle recommended to avoid clogs." }),
  createPreset({ id: 'ziro-3', profileName: 'Ziro Carbon Fiber PLA', printerBrand: 'Other', manufacturer: 'Ziro', brand: 'CF PLA', filamentType: 'PLA', nozzleTemp: 215, bedTemp: 60, maxVolumetricSpeed: 12, fanSpeedMin: 100, fanSpeedMax: 100, density: 1.28, notes: "Carbon Fiber reinforced. Matte finish. Abrasive." }),
];
