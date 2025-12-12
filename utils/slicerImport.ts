
import { FilamentProfile, PrinterBrand } from '../types';
import { PRINTER_BRANDS } from '../constants';

export const parseNativeSlicerProfile = async (file: File): Promise<FilamentProfile> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        const fileName = file.name.toLowerCase();

        reader.onload = (e) => {
            try {
                const text = e.target?.result as string;
                const profile: Partial<FilamentProfile> = {
                    id: `import-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    profileName: file.name.replace(/\.(json|ini|filament)$/i, ''),
                    // Defaults
                    printerBrand: 'Other',
                    printerModel: 'Generic',
                    manufacturer: 'Imported',
                    brand: 'Generic',
                    filamentType: 'PLA',
                    filamentDiameter: 1.75,
                    nozzleDiameter: 0.4,
                    spoolWeight: 1000,
                    filamentCost: 0,
                    notes: `Imported from ${file.name}`,
                    colorHex: '#888888',
                    flowRatio: 0.98 // Default
                };

                if (fileName.endsWith('.json') || fileName.endsWith('.filament')) {
                    // Parse JSON (Bambu / Orca / IdeaMaker)
                    const data = JSON.parse(text);
                    const root = data.filament_profile || data.settings || data; // Handle different structures

                    // Bambu / Orca mapping
                    if (root.filament_type) profile.filamentType = Array.isArray(root.filament_type) ? root.filament_type[0] : root.filament_type;
                    if (root.filament_vendor) profile.manufacturer = Array.isArray(root.filament_vendor) ? root.filament_vendor[0] : root.filament_vendor;
                    
                    const getNum = (val: any) => {
                        if (Array.isArray(val)) return Number(val[0]);
                        return Number(val);
                    };

                    if (root.nozzle_temperature) profile.nozzleTemp = getNum(root.nozzle_temperature);
                    if (root.nozzle_temperature_initial_layer) profile.nozzleTempInitial = getNum(root.nozzle_temperature_initial_layer);
                    if (root.hot_plate_temp) profile.bedTemp = getNum(root.hot_plate_temp);
                    if (root.hot_plate_temp_initial_layer) profile.bedTempInitial = getNum(root.hot_plate_temp_initial_layer);
                    if (root.filament_max_volumetric_speed) profile.maxVolumetricSpeed = getNum(root.filament_max_volumetric_speed);
                    if (root.filament_flow_ratio) profile.flowRatio = getNum(root.filament_flow_ratio); // Orca support
                    if (root.fan_min_speed) profile.fanSpeedMin = getNum(root.fan_min_speed);
                    if (root.fan_max_speed) profile.fanSpeedMax = getNum(root.fan_max_speed);
                    if (root.filament_density) profile.density = getNum(root.filament_density);
                    if (root.filament_cost) profile.filamentCost = getNum(root.filament_cost);
                    if (root.filament_retraction_length) profile.retractionDistance = getNum(root.filament_retraction_length);
                    if (root.retraction_length) profile.retractionDistance = getNum(root.retraction_length); // Fallback
                    if (root.filament_retraction_speed) profile.retractionSpeed = getNum(root.filament_retraction_speed);
                    if (root.retraction_speed) profile.retractionSpeed = getNum(root.retraction_speed); // Fallback
                    
                    // Smart Detection from compatible_printers
                    if (root.compatible_printers && Array.isArray(root.compatible_printers) && root.compatible_printers.length > 0) {
                        const compatString = root.compatible_printers[0];
                        // Logic to infer Brand
                        for (const brand of PRINTER_BRANDS) {
                            if (compatString.toLowerCase().includes(brand.toLowerCase())) {
                                profile.printerBrand = brand;
                                break;
                            }
                        }
                        
                        // Logic to infer Nozzle (e.g. "0.4 nozzle")
                        const nozzleMatch = compatString.match(/(\d+\.\d+)\s*nozzle/i);
                        if (nozzleMatch) {
                            profile.nozzleDiameter = parseFloat(nozzleMatch[1]);
                        }

                        // Logic to infer Model (Basic)
                        // This is heuristic as model names vary wildly
                        if (profile.printerBrand === 'Bambu Lab') {
                            if (compatString.includes('X1C')) profile.printerModel = 'X1C';
                            else if (compatString.includes('P1S')) profile.printerModel = 'P1S';
                            else if (compatString.includes('P1P')) profile.printerModel = 'P1P';
                            else if (compatString.includes('A1 Mini')) profile.printerModel = 'A1 Mini';
                            else if (compatString.includes('A1')) profile.printerModel = 'A1';
                        } else if (profile.printerBrand === 'Prusa') {
                             if (compatString.includes('MK3')) profile.printerModel = 'MK3S+';
                             else if (compatString.includes('MK4')) profile.printerModel = 'MK4';
                             else if (compatString.includes('Mini')) profile.printerModel = 'Mini+';
                             else if (compatString.includes('XL')) profile.printerModel = 'XL';
                        }
                    }
                    
                    // IdeaMaker mapping fallback
                    if (root.extruder_temp_degree_0 && !profile.nozzleTemp) profile.nozzleTemp = Number(root.extruder_temp_degree_0);
                    if (root.platform_temp_degree_0 && !profile.bedTemp) profile.bedTemp = Number(root.platform_temp_degree_0);
                    
                } else if (fileName.endsWith('.ini')) {
                    // Parse INI (PrusaSlicer / SuperSlicer)
                    const lines = text.split('\n');
                    lines.forEach(line => {
                        const [key, val] = line.split('=').map(s => s.trim());
                        if (!key || !val) return;

                        // Clean value (remove comments)
                        const cleanVal = val.split(';')[0].trim().replace(/"/g, '');
                        const numVal = parseFloat(cleanVal);

                        if (key === 'filament_type') profile.filamentType = cleanVal as any;
                        if (key === 'filament_vendor') profile.manufacturer = cleanVal;
                        if (key === 'temperature') profile.nozzleTemp = numVal;
                        if (key === 'first_layer_temperature') profile.nozzleTempInitial = numVal;
                        if (key === 'bed_temperature') profile.bedTemp = numVal;
                        if (key === 'first_layer_bed_temperature') profile.bedTempInitial = numVal;
                        if (key === 'filament_max_volumetric_speed') profile.maxVolumetricSpeed = numVal;
                        if (key === 'min_fan_speed') profile.fanSpeedMin = numVal;
                        if (key === 'max_fan_speed') profile.fanSpeedMax = numVal;
                        if (key === 'filament_density') profile.density = numVal;
                        if (key === 'filament_cost') profile.filamentCost = numVal;
                        if (key === 'filament_colour') profile.colorHex = cleanVal;
                        if (key === 'extrusion_multiplier') profile.flowRatio = numVal;
                    });
                }

                // Final validation / defaults for missing required fields
                if (!profile.nozzleTemp) profile.nozzleTemp = 210;
                if (!profile.nozzleTempInitial) profile.nozzleTempInitial = profile.nozzleTemp;
                if (!profile.bedTemp) profile.bedTemp = 60;
                if (!profile.bedTempInitial) profile.bedTempInitial = profile.bedTemp;
                if (!profile.maxVolumetricSpeed) profile.maxVolumetricSpeed = 10;
                if (!profile.fanSpeedMin) profile.fanSpeedMin = 100;
                if (!profile.fanSpeedMax) profile.fanSpeedMax = 100;
                if (!profile.printSpeed) profile.printSpeed = 60;
                if (!profile.retractionDistance) profile.retractionDistance = 1.0;
                if (!profile.retractionSpeed) profile.retractionSpeed = 30;

                resolve(profile as FilamentProfile);

            } catch (err) {
                reject(err);
            }
        };
        reader.onerror = () => reject(new Error("File read error"));
        reader.readAsText(file);
    });
};
