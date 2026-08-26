import { FilamentProfile, FilamentType } from '../types';
import { BAMBU_PRINTER_MAP } from '../constants';

// Each slicer accepts filament_type only from its own fixed vocabulary, which is narrower than
// our FilamentType union. Emitting an unknown value there makes the profile import badly, so
// map to the nearest accepted term and fall back to the closest generic rather than inventing.
const PRUSA_TYPE: Partial<Record<FilamentType, string>> = {
    PETG: 'PETG', PET: 'PET', PCTG: 'PETG', PETT: 'PET', CPE: 'PET', Copolyester: 'PET',
    TPU: 'FLEX', TPE: 'FLEX', PEBA: 'FLEX',
    Nylon: 'NYLON', 'PA-CF': 'NYLON', 'PA-GF': 'NYLON', PA6: 'NYLON', PA12: 'NYLON',
    BVOH: 'PVA', PHA: 'PLA', PVB: 'PVB', HIPS: 'HIPS', PP: 'PP', PEI: 'PEI', PVA: 'PVA',
    PLA: 'PLA', ABS: 'ABS', ASA: 'ASA', PC: 'PC',
};

// Orca/Bambu vocabulary. It has no PCTG/PVB/CPE entry, so those ride as their base polymer.
const BAMBU_TYPE: Partial<Record<FilamentType, string>> = {
    PETG: 'PETG', PET: 'PETG', PCTG: 'PETG', PETT: 'PETG', CPE: 'PETG', Copolyester: 'PETG',
    TPU: 'TPU', TPE: 'TPU', PEBA: 'TPU',
    Nylon: 'PA', 'PA-CF': 'PA-CF', 'PA-GF': 'PA', PA6: 'PA', PA12: 'PA',
    BVOH: 'PVA', PVA: 'PVA', PHA: 'PLA', PVB: 'PLA', HIPS: 'HIPS', PP: 'PP', PEI: 'PEI',
    PLA: 'PLA', ABS: 'ABS', ASA: 'ASA', PC: 'PC',
};

const slicerType = (map: Partial<Record<FilamentType, string>>, t: FilamentType, fallback: string) =>
    map[t] ?? fallback;

// 1. Bambu Studio / Orca Slicer (Standard JSON with Arrays)
export const generateBambuJson = (profile: Omit<FilamentProfile, 'id'>) => {
    // Construct compatibility string
    let compatibilityList: string[] = [];
    const nozzleStr = profile.nozzleDiameter ? ` ${profile.nozzleDiameter} nozzle` : '';

    if (profile.printerBrand === 'Bambu Lab') {
        if (profile.printerModel && profile.printerModel !== 'Generic') {
            // Specific model selected: map to internal name
            const internalName = BAMBU_PRINTER_MAP[profile.printerModel] || BAMBU_PRINTER_MAP['Generic'];
            compatibilityList.push(`${internalName}${nozzleStr}`);
        } else {
            // Generic Bambu selected -> Add ALL common models to ensure visibility
            Object.values(BAMBU_PRINTER_MAP).forEach(internalName => {
                 compatibilityList.push(`${internalName}${nozzleStr}`);
            });
        }
    } else if (profile.printerBrand !== 'Other') {
        // Other specific brand
        const modelStr = profile.printerModel !== 'Generic' ? ` ${profile.printerModel}` : '';
        compatibilityList.push(`${profile.printerBrand}${modelStr}${nozzleStr}`);
    }

    return {
        type: "filament",
        name: profile.profileName,
        from: "User",
        instantiation: "true",
        filament_id: "", 
        filament_settings_id: [profile.profileName],
        setting_id: profile.profileName,
        version: "1.6",
        compatible_printers: compatibilityList,
        
        // Arrays of Strings
        filament_type: [slicerType(BAMBU_TYPE, profile.filamentType, 'PLA')],
        filament_vendor: [profile.manufacturer],
        filament_density: [String(profile.density || "1.24")],
        filament_cost: [String(profile.filamentCost || "0")],
        filament_flow_ratio: [String(profile.flowRatio || "0.98")],
        
        nozzle_temperature: [String(profile.nozzleTemp)],
        nozzle_temperature_initial_layer: [String(profile.nozzleTempInitial)],
        
        hot_plate_temp: [String(profile.bedTemp)],
        hot_plate_temp_initial_layer: [String(profile.bedTempInitial)],
        // Map all plate types to bed temp for consistency
        cool_plate_temp: [String(profile.bedTemp)],
        cool_plate_temp_initial_layer: [String(profile.bedTempInitial)],
        eng_plate_temp: [String(profile.bedTemp)],
        eng_plate_temp_initial_layer: [String(profile.bedTempInitial)],
        textured_plate_temp: [String(profile.bedTemp)],
        textured_plate_temp_initial_layer: [String(profile.bedTempInitial)],

        filament_max_volumetric_speed: [String(profile.maxVolumetricSpeed)],
        
        fan_min_speed: [String(profile.fanSpeedMin)],
        fan_max_speed: [String(profile.fanSpeedMax)],
        
        // Specific key for filament override retraction
        filament_retraction_length: [String(profile.retractionDistance)],
        filament_retraction_speed: [String(profile.retractionSpeed)],
        filament_deretraction_speed: [String(profile.retractionSpeed)],
        
        filament_notes: profile.notes || "",
        
        // Metadata for this app (ignored by Slicer)
        app_metadata: {
            printer_brand: profile.printerBrand,
            printer_model: profile.printerModel,
            nozzle_diameter: profile.nozzleDiameter,
            brand_name: profile.brand,
            color_hex: profile.colorHex,
            color_name: profile.colorName,
            drying_temperature: profile.dryingTemp,
            drying_time: profile.dryingTime
        }
    };
};

// 2. PrusaSlicer (.ini)
export const generatePrusaIni = (profile: Omit<FilamentProfile, 'id'>): string => {
    // Simplified INI generation based on PrusaSlicer keys
    return `[filament:${profile.profileName}]
filament_vendor = ${profile.manufacturer}
filament_type = ${slicerType(PRUSA_TYPE, profile.filamentType, 'PLA')}
filament_density = ${profile.density || 1.24}
filament_cost = ${profile.filamentCost || 0}
filament_diameter = ${profile.filamentDiameter}
filament_max_volumetric_speed = ${profile.maxVolumetricSpeed}
first_layer_bed_temperature = ${profile.bedTempInitial}
first_layer_temperature = ${profile.nozzleTempInitial}
bed_temperature = ${profile.bedTemp}
temperature = ${profile.nozzleTemp}
min_fan_speed = ${profile.fanSpeedMin}
max_fan_speed = ${profile.fanSpeedMax}
filament_notes = "${profile.notes || ''}"
filament_colour = ${profile.colorHex || '#FF0000'}
extrusion_multiplier = ${profile.flowRatio || 1}
fan_always_on = 1
cooling = 1
`;
};

// 3. ideaMaker (.json)
export const generateIdeaMakerJson = (profile: Omit<FilamentProfile, 'id'>) => {
    return {
        header: {
            machine_type: profile.printerBrand === 'Other' ? 'Generic' : profile.printerBrand,
            filament_name: profile.profileName,
            brand: profile.manufacturer,
            material: profile.filamentType,
            created_by: "FilamentProfiles.Org"
        },
        settings: {
            filament_diameter: profile.filamentDiameter,
            filament_price: profile.filamentCost,
            filament_density: profile.density,
            extruder_temp_degree_0: profile.nozzleTemp,
            platform_temp_degree_0: profile.bedTemp,
            fan_speed_min: profile.fanSpeedMin,
            fan_speed_max: profile.fanSpeedMax,
            flow_rate: (profile.flowRatio || 0.98) * 100,
            retraction_speed: profile.retractionSpeed,
            retraction_amount: profile.retractionDistance
        }
    };
};
