
import * as XLSX from 'xlsx';
import { FilamentProfile, PrinterBrand, FilamentType } from '../types';
import { PRINTER_BRANDS, FILAMENT_TYPES } from '../constants';

// Mapping of friendly column headers to internal property names
const COLUMN_MAP: Record<string, keyof Omit<FilamentProfile, 'id'>> = {
  'Profile Name (Required)': 'profileName',
  'Printer Brand (Required)': 'printerBrand',
  'Printer Model': 'printerModel',
  'Manufacturer (Required)': 'manufacturer',
  'Product Line / Brand': 'brand',
  'Filament Type (Required)': 'filamentType',
  'Diameter (mm)': 'filamentDiameter',
  'Nozzle Diameter (mm)': 'nozzleDiameter',
  'Cost ($)': 'filamentCost',
  'Spool Weight (g)': 'spoolWeight',
  'Color Name': 'colorName',
  'Color Hex': 'colorHex',
  'Nozzle Temp Initial (°C)': 'nozzleTempInitial',
  'Nozzle Temp Other (°C)': 'nozzleTemp',
  'Bed Temp Initial (°C)': 'bedTempInitial',
  'Bed Temp Other (°C)': 'bedTemp',
  'Max Flow (mm³/s)': 'maxVolumetricSpeed',
  'Print Speed (mm/s)': 'printSpeed',
  'Fan Min (%)': 'fanSpeedMin',
  'Fan Max (%)': 'fanSpeedMax',
  'Retraction Dist (mm)': 'retractionDistance',
  'Retraction Speed (mm/s)': 'retractionSpeed',
  'Density (g/cm³)': 'density',
  'Drying Temp (°C)': 'dryingTemp',
  'Drying Time': 'dryingTime',
  'Notes': 'notes'
};

const REVERSE_MAP = Object.entries(COLUMN_MAP).reduce((acc, [key, value]) => {
    acc[value] = key;
    return acc;
}, {} as Record<string, string>);

const EXAMPLE_ROW = {
    'Profile Name (Required)': 'My Batch PLA',
    'Printer Brand (Required)': 'Bambu Lab',
    'Printer Model': 'P1S',
    'Manufacturer (Required)': 'Generic',
    'Product Line / Brand': 'Basic',
    'Filament Type (Required)': 'PLA',
    'Diameter (mm)': 1.75,
    'Nozzle Diameter (mm)': 0.4,
    'Cost ($)': 19.99,
    'Spool Weight (g)': 1000,
    'Color Name': 'Blue',
    'Color Hex': '#0000FF',
    'Nozzle Temp Initial (°C)': 220,
    'Nozzle Temp Other (°C)': 215,
    'Bed Temp Initial (°C)': 60,
    'Bed Temp Other (°C)': 55,
    'Max Flow (mm³/s)': 15,
    'Print Speed (mm/s)': 60,
    'Fan Min (%)': 100,
    'Fan Max (%)': 100,
    'Retraction Dist (mm)': 0.8,
    'Retraction Speed (mm/s)': 35,
    'Density (g/cm³)': 1.24,
    'Drying Temp (°C)': 55,
    'Drying Time': '4h',
    'Notes': 'Batch import example'
};

export const downloadBulkTemplate = () => {
    const worksheet = XLSX.utils.json_to_sheet([EXAMPLE_ROW]);
    
    // Add data validation info as a separate sheet or just comments? 
    // For simplicity, we just provide a clear example row.
    // Adjust column widths
    const wscols = Object.keys(EXAMPLE_ROW).map(() => ({ wch: 20 }));
    worksheet['!cols'] = wscols;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template");
    XLSX.writeFile(workbook, "PrintProfiles_BulkImport_Template.xlsx");
};

export interface BulkImportResult {
    success: FilamentProfile[];
    errors: string[];
}

export const processBulkFile = async (file: File): Promise<BulkImportResult> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet);

                const success: FilamentProfile[] = [];
                const errors: string[] = [];

                if (jsonData.length === 0) {
                     resolve({ success: [], errors: ["File appears to be empty."] });
                     return;
                }

                jsonData.forEach((row, index) => {
                    const rowNum = index + 2; // 1 for header, 0-indexed
                    const profile: any = { id: `bulk-${Date.now()}-${index}` };
                    let isValid = true;
                    const rowErrors: string[] = [];

                    // Map columns
                    Object.entries(COLUMN_MAP).forEach(([header, key]) => {
                        if (row[header] !== undefined) {
                            profile[key] = row[header];
                        }
                    });

                    // Validation
                    if (!profile.profileName) {
                        isValid = false;
                        rowErrors.push(`Row ${rowNum}: Missing 'Profile Name'.`);
                    }
                    if (!profile.manufacturer) {
                        isValid = false;
                        rowErrors.push(`Row ${rowNum}: Missing 'Manufacturer'.`);
                    }
                    
                    // Validate Printer Brand
                    const brand = profile.printerBrand as string;
                    if (!brand || !PRINTER_BRANDS.includes(brand as PrinterBrand)) {
                        // Auto-correct or fail? Let's default to 'Other' if close, or fail.
                        // Strict validation:
                        if (brand !== 'Other') {
                             // Check case insensitive
                             const match = PRINTER_BRANDS.find(b => b.toLowerCase() === brand?.toLowerCase());
                             if (match) profile.printerBrand = match;
                             else {
                                 profile.printerBrand = 'Other'; // Soft fail to 'Other' to be helpful, or error?
                                 // Let's accept it but warn? No, just default to Other.
                             }
                        }
                    }

                    // Validate Filament Type
                    const fType = profile.filamentType as string;
                    if (!fType || !FILAMENT_TYPES.includes(fType as FilamentType)) {
                         const match = FILAMENT_TYPES.find(t => t.toLowerCase() === fType?.toLowerCase());
                         if (match) profile.filamentType = match;
                         else {
                             profile.filamentType = 'Other'; 
                         }
                    }

                    // Numeric Validations (Critical fields)
                    ['nozzleTemp', 'bedTemp', 'maxVolumetricSpeed'].forEach(field => {
                        const val = profile[field];
                        if (val === undefined || isNaN(Number(val))) {
                             // If missing, we might be able to fill with defaults later, but let's strictly require core ones
                             if (field === 'nozzleTemp' || field === 'bedTemp') {
                                 isValid = false;
                                 rowErrors.push(`Row ${rowNum}: Invalid or missing '${field}'.`);
                             }
                        } else {
                            profile[field] = Number(val);
                        }
                    });
                    
                    // Defaults for optionals if missing
                    if (!profile.fanSpeedMin) profile.fanSpeedMin = 0;
                    if (!profile.fanSpeedMax) profile.fanSpeedMax = 100;
                    if (!profile.filamentDiameter) profile.filamentDiameter = 1.75;
                    if (!profile.printSpeed) profile.printSpeed = 60;
                    if (!profile.retractionDistance) profile.retractionDistance = 1;
                    if (!profile.retractionSpeed) profile.retractionSpeed = 30;
                    if (!profile.nozzleTempInitial) profile.nozzleTempInitial = profile.nozzleTemp || 200;
                    if (!profile.bedTempInitial) profile.bedTempInitial = profile.bedTemp || 60;
                    
                    // New defaults
                    if (!profile.printerModel) profile.printerModel = 'Generic';
                    if (!profile.nozzleDiameter) profile.nozzleDiameter = 0.4;


                    if (isValid) {
                        success.push(profile as FilamentProfile);
                    } else {
                        errors.push(...rowErrors);
                    }
                });

                resolve({ success, errors });

            } catch (err) {
                reject(err);
            }
        };
        reader.onerror = (err) => reject(err);
        reader.readAsArrayBuffer(file);
    });
};
