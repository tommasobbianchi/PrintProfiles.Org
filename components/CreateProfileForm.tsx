
import React, { useState, useRef } from 'react';
import { FilamentProfile, PrinterBrand, FilamentType } from '../types';
import { PRINTER_BRANDS, FILAMENT_TYPES, FILAMENT_MANUFACTURERS, PRINTER_MODELS, NOZZLE_DIAMETERS, BAMBU_PRINTER_MAP } from '../constants';
import { suggestFilamentSettings } from '../services/geminiService';
import { downloadBulkTemplate, processBulkFile } from '../utils/bulkImport';
import { parseNativeSlicerProfile } from '../utils/slicerImport'; // New utility
import DownloadIcon from './icons/DownloadIcon';
import ShareIcon from './icons/ShareIcon';
import MagicIcon from './icons/MagicIcon';
import ImportIcon from './icons/ImportIcon';


interface CreateProfileFormProps {
  onShare: (profile: FilamentProfile | FilamentProfile[]) => void;
}

const initialProfileState: Omit<FilamentProfile, 'id'> = {
  profileName: '',
  printerBrand: 'Bambu Lab',
  printerModel: 'Generic',
  manufacturer: '',
  brand: '',
  filamentType: 'PLA',
  filamentDiameter: 1.75,
  nozzleDiameter: 0.4,
  nozzleTemp: 220,
  nozzleTempInitial: 225,
  bedTemp: 60,
  bedTempInitial: 60,
  printSpeed: 60,
  maxVolumetricSpeed: 15,
  retractionDistance: 1,
  retractionSpeed: 40,
  fanSpeedMin: 100,
  fanSpeedMax: 100,
  notes: '',
  spoolWeight: 1000,
  filamentCost: 20,
  colorName: '',
  colorHex: '#FFFFFF',
  dryingTemp: undefined,
  dryingTime: '',
  density: undefined,
  tensileStrength: '',
};

// --- Export Generators ---

// 1. Bambu Studio / Orca Slicer (Standard JSON with Arrays)
const generateBambuJson = (profile: Omit<FilamentProfile, 'id'>) => {
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
            const commonBambuModels = Object.values(BAMBU_PRINTER_MAP).filter(v => v !== 'Bambu Lab P1P'); // Avoid duplicate if P1P is default
            // Add P1P explicitly or just use the whole map values
            Object.values(BAMBU_PRINTER_MAP).forEach(internalName => {
                 compatibilityList.push(`${internalName}${nozzleStr}`);
            });
        }
    } else if (profile.printerBrand !== 'Other') {
        // Other specific brand
        const modelStr = profile.printerModel !== 'Generic' ? ` ${profile.printerModel}` : '';
        compatibilityList.push(`${profile.printerBrand}${modelStr}${nozzleStr}`);
    } else {
        // Truly generic (Brand "Other")
        // Leave empty or add a generic wildcard if supported
    }

    // Bambu/Orca expect strict string arrays for most values
    // Using explicit String() conversion to prevent 0 -> "0" issues
    return {
        type: "filament",
        name: profile.profileName,
        from: "User",
        instantiation: "true",
        filament_id: "", // ID can be empty for new imports
        filament_settings_id: [profile.profileName], // Match name
        setting_id: profile.profileName,
        version: "1.6",
        compatible_printers: compatibilityList,
        
        // Arrays of Strings
        filament_type: [profile.filamentType],
        filament_vendor: [profile.manufacturer],
        filament_density: [String(profile.density || "1.24")],
        filament_cost: [String(profile.filamentCost || "0")],
        
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
const generatePrusaIni = (profile: Omit<FilamentProfile, 'id'>) => {
    // Simplified INI generation based on PrusaSlicer keys
    return `[filament:${profile.profileName}]
filament_vendor = ${profile.manufacturer}
filament_type = ${profile.filamentType}
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
filament_notes = "${profile.notes || ''} - Model: ${profile.printerModel}, Nozzle: ${profile.nozzleDiameter}"
filament_colour = ${profile.colorHex || '#FF0000'}
extrusion_multiplier = 1
fan_always_on = 1
cooling = 1
`;
};

// 3. ideaMaker (.json)
const generateIdeaMakerJson = (profile: Omit<FilamentProfile, 'id'>) => {
    return {
        header: {
            machine_type: profile.printerBrand === 'Other' ? 'Generic' : profile.printerBrand,
            filament_name: profile.profileName,
            brand: profile.manufacturer,
            material: profile.filamentType,
            created_by: "PrintProfiles.Org"
        },
        settings: {
            filament_diameter: profile.filamentDiameter,
            filament_price: profile.filamentCost,
            filament_density: profile.density,
            extruder_temp_degree_0: profile.nozzleTemp,
            platform_temp_degree_0: profile.bedTemp,
            fan_speed_min: profile.fanSpeedMin,
            fan_speed_max: profile.fanSpeedMax,
            flow_rate: 100,
            retraction_speed: profile.retractionSpeed,
            retraction_amount: profile.retractionDistance
        }
    };
};


const CreateProfileForm: React.FC<CreateProfileFormProps> = ({ onShare }) => {
  const [profile, setProfile] = useState<Omit<FilamentProfile, 'id'>>(initialProfileState);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Import Modes
  const [importMode, setImportMode] = useState<'none' | 'excel' | 'raw'>('none');
  
  // Import Overrides
  const [overrideBrand, setOverrideBrand] = useState<PrinterBrand | 'Auto'>('Auto');
  const [overrideModel, setOverrideModel] = useState<string>('Auto');
  const [overrideNozzle, setOverrideNozzle] = useState<string>('Auto');

  const [bulkErrors, setBulkErrors] = useState<string[]>([]);
  const [bulkSuccessCount, setBulkSuccessCount] = useState(0);
  const [rawFilesStatus, setRawFilesStatus] = useState<string>('');
  
  const fileInputRef = useRef<HTMLInputElement>(null); // Single file import
  const bulkInputRef = useRef<HTMLInputElement>(null); // Excel import
  const rawFolderInputRef = useRef<HTMLInputElement>(null); // Raw files import
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const isNumber = ['Temp', 'Speed', 'Distance', 'Diameter', 'Weight', 'Density', 'Cost'].some(key => name.includes(key));
    
    // Special handling for printerBrand change to reset model
    if (name === 'printerBrand') {
         setProfile(prev => ({ 
            ...prev, 
            printerBrand: value as PrinterBrand,
            printerModel: 'Generic' // Reset model on brand change
        }));
    } else if (name === 'filamentType') {
         setProfile(prev => ({ 
            ...prev, 
            filamentType: value as FilamentType
        }));
    } else {
        setProfile(prev => ({ 
            ...prev, 
            [name]: isNumber ? parseFloat(value) || 0 : value 
        } as Omit<FilamentProfile, 'id'>));
    }
  };

  const handleAISuggest = async () => {
    if (!process.env.API_KEY) {
        setError("API_KEY is not configured. AI suggestions are disabled.");
        return;
    }
     if (!profile.manufacturer || !profile.filamentType || !profile.printerBrand) {
        setError("Please select a Printer Brand, Manufacturer, and Filament Type for AI suggestions.");
        return;
    }
    setIsSuggesting(true);
    setError(null);
    try {
      const suggestions = await suggestFilamentSettings(profile.printerBrand, profile.filamentType, profile.manufacturer, profile.brand);
      setProfile(prev => ({ ...prev, ...suggestions }));
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setIsSuggesting(false);
    }
  };

  const downloadFile = (type: 'bambu' | 'prusa' | 'ideamaker') => {
    if (!profile.profileName) {
        setError("Please provide a profile name before downloading.");
        return;
    }
    setError(null);
    
    let content = '';
    let mimeType = 'text/plain';
    let extension = '';
    let prefix = '';

    if (type === 'bambu') {
        content = JSON.stringify(generateBambuJson(profile), null, 2);
        mimeType = 'text/json';
        extension = 'json';
        prefix = 'BambuOrca';
    } else if (type === 'prusa') {
        content = generatePrusaIni(profile);
        mimeType = 'text/plain'; // INI is plain text
        extension = 'ini';
        prefix = 'Prusa';
    } else if (type === 'ideamaker') {
        content = JSON.stringify(generateIdeaMakerJson(profile), null, 2);
        mimeType = 'text/json';
        extension = 'json'; // ideaMaker can import json structure or .filament
        prefix = 'IdeaMaker';
    }

    const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    const safeName = profile.profileName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    link.download = `${safeName}_${prefix}.${extension}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleShare = () => {
      if (!profile.profileName || !profile.manufacturer) {
        setError("Please provide a profile name and manufacturer before sharing.");
        return;
    }
    setError(null);
    const newProfile: FilamentProfile = {
      ...profile,
      id: `user-${new Date().getTime()}`,
    };
    onShare(newProfile);
    alert("Profile shared to the community tab!");
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleSingleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    try {
        // Use the enhanced parser that detects printer models
        const imported = await parseNativeSlicerProfile(file);
        
        // Convert to form state (Omit 'id')
        const formState: Omit<FilamentProfile, 'id'> = {
            ...imported,
        } as any;
        delete (formState as any).id;

        setProfile(formState);
        setError(null);
        alert("Profile imported successfully!");
    } catch (err) {
        console.error(err);
        setError("Failed to import file. Ensure it is a valid Slicer JSON or INI file.");
    }
    
    event.target.value = '';
  };

  // --- Excel Import Handlers ---
  const handleBulkFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;
      
      setBulkErrors([]);
      setBulkSuccessCount(0);

      try {
          const result = await processBulkFile(file);
          if (result.errors.length > 0) {
              setBulkErrors(result.errors);
          }
          if (result.success.length > 0) {
              onShare(result.success);
              setBulkSuccessCount(result.success.length);
          }
      } catch (e: any) {
          setBulkErrors(["Failed to process file. Ensure it is a valid XLSX file."]);
      }
      event.target.value = '';
  };

  // --- Raw Files Import Handlers ---
  const handleRawFilesChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (!files || files.length === 0) return;

      setRawFilesStatus('Processing files...');
      let successCount = 0;
      let failCount = 0;
      const newProfiles: FilamentProfile[] = [];

      for (let i = 0; i < files.length; i++) {
          try {
              const profile = await parseNativeSlicerProfile(files[i]);
              
              // Apply Overrides
              if (overrideBrand !== 'Auto') {
                  profile.printerBrand = overrideBrand;
              }
              
              if (overrideModel !== 'Auto') {
                  profile.printerModel = overrideModel;
                  
                  // Clean Name Logic: Remove Model string from Name if present
                  const regex = new RegExp(`\\s*@?${overrideModel}`, 'gi');
                  profile.profileName = profile.profileName.replace(regex, '').trim();
                   const simpleRegex = new RegExp(`\\b${overrideModel}\\b`, 'gi');
                   profile.profileName = profile.profileName.replace(simpleRegex, '').replace(/\s+/g, ' ').trim();
              }

              if (overrideNozzle !== 'Auto') {
                  profile.nozzleDiameter = parseFloat(overrideNozzle);
              }

              newProfiles.push(profile);
              successCount++;
          } catch (e) {
              failCount++;
              console.error(`Failed to parse ${files[i].name}`, e);
          }
      }

      if (newProfiles.length > 0) {
          onShare(newProfiles);
      }
      
      setRawFilesStatus(`Import Completed: ${successCount} successful, ${failCount} failed.`);
      event.target.value = '';
  };


  const InputField: React.FC<{label: string, name: keyof Omit<FilamentProfile, 'id'>, type?: string, value: any, step?: string, placeholder?: string, children?: React.ReactNode}> = ({ label, name, type = 'text', value, step, placeholder, children }) => (
    <div className="flex flex-col">
      <label htmlFor={name} className="mb-1 text-sm font-medium text-stone-500">{label}</label>
      {children ? children :
        <input
          type={type}
          id={name}
          name={name}
          value={value}
          onChange={handleChange}
          step={step}
          placeholder={placeholder}
          className="bg-white border border-stone-300 rounded-md px-3 py-2 text-stone-900 focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder-stone-400"
        />
      }
    </div>
  );

  const Section: React.FC<{title: string, children: React.ReactNode}> = ({title, children}) => (
      <div className="border-t border-stone-200 pt-6 mt-6">
          <h3 className="text-lg font-semibold text-stone-700 mb-4">{title}</h3>
          {children}
      </div>
  );

  return (
    <div className="space-y-6">
       <div className="flex flex-wrap justify-between items-center mb-2 gap-2">
         <h2 className="text-2xl font-bold text-stone-800">Create Filament Profile</h2>
         <div className="flex gap-2">
             <button
                 onClick={() => setImportMode(importMode === 'excel' ? 'none' : 'excel')}
                 className={`text-sm py-1 px-3 rounded-md border border-stone-300 transition-colors ${importMode === 'excel' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-blue-600 hover:bg-stone-50'}`}
             >
                 Excel Import
             </button>
             <button
                 onClick={() => setImportMode(importMode === 'raw' ? 'none' : 'raw')}
                 className={`text-sm py-1 px-3 rounded-md border border-stone-300 transition-colors ${importMode === 'raw' ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-purple-600 hover:bg-stone-50'}`}
             >
                 Mass Import (Raw Files)
             </button>
         </div>
       </div>
       
       {/* --- Excel Import UI --- */}
       {importMode === 'excel' && (
           <div className="bg-stone-50 border border-stone-200 rounded-lg p-6 animate-fadeIn shadow-sm">
               <h3 className="text-xl font-semibold text-stone-800 mb-4">Batch Import (Excel)</h3>
               <p className="text-stone-600 mb-6 text-sm">
                   Upload an Excel (.xlsx) file containing multiple filament profiles. 
                   Ensure your file matches the template format.
               </p>
               
               <div className="flex flex-col gap-4">
                   <button 
                       onClick={downloadBulkTemplate}
                       className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md transition-colors shadow-sm"
                   >
                       <DownloadIcon /> Download Excel Template
                   </button>
                   
                   <div className="border-t border-stone-300 my-2"></div>
                   
                   <div className="flex flex-col gap-2">
                       <label className="text-sm font-medium text-stone-700">Upload Completed Template:</label>
                       <input 
                           type="file" 
                           ref={bulkInputRef}
                           onChange={handleBulkFileChange}
                           accept=".xlsx, .xls"
                           className="block w-full text-sm text-stone-500
                             file:mr-4 file:py-2 file:px-4
                             file:rounded-md file:border-0
                             file:text-sm file:font-semibold
                             file:bg-white file:text-blue-600
                             file:border file:border-stone-300
                             hover:file:bg-stone-50
                           "
                       />
                   </div>

                   {bulkSuccessCount > 0 && (
                       <div className="bg-green-50 border border-green-200 text-green-800 p-3 rounded-md mt-2">
                           Successfully imported {bulkSuccessCount} profiles to the Download list!
                       </div>
                   )}

                   {bulkErrors.length > 0 && (
                       <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-md mt-2 max-h-60 overflow-y-auto">
                           <p className="font-bold mb-2">Import Errors:</p>
                           <ul className="list-disc pl-5 space-y-1 text-sm">
                               {bulkErrors.map((err, i) => <li key={i}>{err}</li>)}
                           </ul>
                       </div>
                   )}
               </div>
           </div>
       )}

       {/* --- Raw Files Import UI --- */}
       {importMode === 'raw' && (
           <div className="bg-stone-50 border border-stone-200 rounded-lg p-6 animate-fadeIn shadow-sm">
               <h3 className="text-xl font-semibold text-stone-800 mb-4">Mass Import (Raw Files)</h3>
               <p className="text-stone-600 mb-4 text-sm">
                   Select multiple files (.json, .ini) to import. Optionally force Brand/Model to clean up data.
               </p>
               
               {/* Overrides */}
               <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-white rounded-md border border-stone-200">
                   <div>
                       <label className="block text-xs text-stone-500 mb-1">Force Brand</label>
                       <select 
                           value={overrideBrand} 
                           onChange={(e) => {
                               setOverrideBrand(e.target.value as PrinterBrand | 'Auto');
                               setOverrideModel('Auto'); // Reset model on brand change
                           }}
                           className="w-full bg-white border border-stone-300 rounded-md text-sm px-2 py-1 text-stone-900 focus:outline-none focus:border-blue-500"
                       >
                           <option value="Auto">Auto-Detect</option>
                           {PRINTER_BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
                       </select>
                   </div>
                   <div>
                       <label className="block text-xs text-stone-500 mb-1">Force Model</label>
                        <select 
                           value={overrideModel} 
                           onChange={(e) => setOverrideModel(e.target.value)}
                           disabled={overrideBrand === 'Auto'}
                           className="w-full bg-white border border-stone-300 rounded-md text-sm px-2 py-1 text-stone-900 focus:outline-none focus:border-blue-500 disabled:opacity-50 disabled:bg-stone-100"
                       >
                           <option value="Auto">Auto-Detect</option>
                           {overrideBrand !== 'Auto' && (PRINTER_MODELS[overrideBrand] || []).map(m => <option key={m} value={m}>{m}</option>)}
                       </select>
                   </div>
                   <div>
                       <label className="block text-xs text-stone-500 mb-1">Force Nozzle</label>
                       <select 
                           value={overrideNozzle} 
                           onChange={(e) => setOverrideNozzle(e.target.value)}
                           className="w-full bg-white border border-stone-300 rounded-md text-sm px-2 py-1 text-stone-900 focus:outline-none focus:border-blue-500"
                       >
                           <option value="Auto">Auto-Detect</option>
                           {NOZZLE_DIAMETERS.map(d => <option key={d} value={d}>{d} mm</option>)}
                       </select>
                   </div>
               </div>
               
               <div className="flex flex-col gap-4">
                   <div className="flex flex-col gap-2">
                       <label className="text-sm font-medium text-stone-700">Select Files:</label>
                       <input 
                           type="file" 
                           ref={rawFolderInputRef}
                           onChange={handleRawFilesChange}
                           multiple
                           accept=".json,.ini,.filament"
                           className="block w-full text-sm text-stone-500
                             file:mr-4 file:py-2 file:px-4
                             file:rounded-md file:border-0
                             file:text-sm file:font-semibold
                             file:bg-white file:text-purple-600
                             file:border file:border-stone-300
                             hover:file:bg-stone-50
                           "
                       />
                   </div>

                   {rawFilesStatus && (
                       <div className={`p-3 rounded-md mt-2 border ${rawFilesStatus.includes('failed') && !rawFilesStatus.includes('0 failed') ? 'bg-yellow-50 border-yellow-300 text-yellow-800' : 'bg-green-50 border-green-200 text-green-800'}`}>
                           {rawFilesStatus}
                       </div>
                   )}
               </div>
           </div>
       )}

       {/* --- Single Editor UI (Default) --- */}
       {importMode === 'none' && (
       <>
       <p className="text-center text-stone-500 mb-6">Fill in the details below, use AI to suggest settings, or import an existing profile.</p>

        {error && <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md text-center animate-pulse">{error}</div>}

       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField label="Profile Name" name="profileName" value={profile.profileName} placeholder="e.g. My Favorite PETG"/>
            
            {/* Printer Brand & Model Selection */}
            <InputField label="Printer Brand" name="printerBrand" value={profile.printerBrand}>
                <select id="printerBrand" name="printerBrand" value={profile.printerBrand} onChange={handleChange} className="bg-white border border-stone-300 rounded-md px-3 py-2 text-stone-900 focus:ring-2 focus:ring-blue-500 focus:outline-none">
                    {PRINTER_BRANDS.map(brand => <option key={brand} value={brand}>{brand}</option>)}
                </select>
            </InputField>
             <InputField label="Printer Model" name="printerModel" value={profile.printerModel || 'Generic'}>
                <select id="printerModel" name="printerModel" value={profile.printerModel || 'Generic'} onChange={handleChange} className="bg-white border border-stone-300 rounded-md px-3 py-2 text-stone-900 focus:ring-2 focus:ring-blue-500 focus:outline-none">
                    {(PRINTER_MODELS[profile.printerBrand] || ['Generic']).map(model => <option key={model} value={model}>{model}</option>)}
                </select>
            </InputField>
            
            <InputField label="Manufacturer" name="manufacturer" value={profile.manufacturer}>
                <select id="manufacturer" name="manufacturer" value={profile.manufacturer} onChange={handleChange} className="bg-white border border-stone-300 rounded-md px-3 py-2 text-stone-900 focus:ring-2 focus:ring-blue-500 focus:outline-none">
                    <option value="">Select a manufacturer...</option>
                    {FILAMENT_MANUFACTURERS.map(brand => <option key={brand} value={brand}>{brand}</option>)}
                </select>
            </InputField>
             <InputField label="Brand / Product Line" name="brand" value={profile.brand ?? ''} placeholder="e.g. PolyLite, Prusament"/>
             <InputField label="Filament Type" name="filamentType" value={profile.filamentType}>
                <select id="filamentType" name="filamentType" value={profile.filamentType} onChange={handleChange} className="bg-white border border-stone-300 rounded-md px-3 py-2 text-stone-900 focus:ring-2 focus:ring-blue-500 focus:outline-none">
                    {FILAMENT_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                </select>
            </InputField>
            
            <div className="grid grid-cols-2 gap-4">
                <InputField label="Filament Diam. (mm)" name="filamentDiameter" type="number" value={profile.filamentDiameter} step="0.01"/>
                <InputField label="Nozzle Diam. (mm)" name="nozzleDiameter" value={profile.nozzleDiameter || 0.4}>
                     <select id="nozzleDiameter" name="nozzleDiameter" value={profile.nozzleDiameter || 0.4} onChange={handleChange} className="bg-white border border-stone-300 rounded-md px-3 py-2 text-stone-900 focus:ring-2 focus:ring-blue-500 focus:outline-none">
                        {NOZZLE_DIAMETERS.map(dia => <option key={dia} value={dia}>{dia}</option>)}
                    </select>
                </InputField>
            </div>
       </div>

        <Section title="Temperature Settings">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <InputField label="Nozzle Initial (°C)" name="nozzleTempInitial" type="number" value={profile.nozzleTempInitial} />
                <InputField label="Nozzle Other (°C)" name="nozzleTemp" type="number" value={profile.nozzleTemp} />
                <InputField label="Bed Initial (°C)" name="bedTempInitial" type="number" value={profile.bedTempInitial} />
                <InputField label="Bed Other (°C)" name="bedTemp" type="number" value={profile.bedTemp} />
            </div>
        </Section>

        <Section title="Speed & Cooling">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <InputField label="Max Flow (mm³/s)" name="maxVolumetricSpeed" type="number" value={profile.maxVolumetricSpeed} step="0.1" />
                <InputField label="Print Speed (mm/s)" name="printSpeed" type="number" value={profile.printSpeed} />
                <div className="hidden md:block"></div>
                <InputField label="Min Fan Speed (%)" name="fanSpeedMin" type="number" value={profile.fanSpeedMin} />
                <InputField label="Max Fan Speed (%)" name="fanSpeedMax" type="number" value={profile.fanSpeedMax} />
            </div>
        </Section>

        <Section title="Retraction">
            <div className="grid grid-cols-2 gap-6">
                <InputField label="Retraction Dist. (mm)" name="retractionDistance" type="number" value={profile.retractionDistance} step="0.1" />
                <InputField label="Retraction Spd. (mm/s)" name="retractionSpeed" type="number" value={profile.retractionSpeed} />
            </div>
        </Section>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
            <Section title="Drying & Material">
                <div className="grid grid-cols-2 gap-6">
                    <InputField label="Drying Temp (°C)" name="dryingTemp" type="number" value={profile.dryingTemp ?? ''} placeholder="e.g. 55"/>
                    <InputField label="Drying Time (h)" name="dryingTime" type="text" value={profile.dryingTime ?? ''} placeholder="e.g. 4-6h"/>
                </div>
            </Section>
            <Section title="Economics & Appearance">
                 <div className="grid grid-cols-2 gap-4 mb-4">
                     <InputField label="Cost/Spool ($)" name="filamentCost" type="number" value={profile.filamentCost ?? ''} />
                     <div className="flex flex-col">
                        <label htmlFor="colorHex" className="mb-1 text-sm font-medium text-stone-500">Color</label>
                        <div className="flex items-center gap-2">
                            <input
                            type="color"
                            id="colorHex"
                            name="colorHex"
                            value={profile.colorHex || '#ffffff'}
                            onChange={handleChange}
                            className="p-1 h-10 w-10 block bg-white border border-stone-300 cursor-pointer rounded-md"
                            />
                            <input 
                                name="colorName" 
                                value={profile.colorName ?? ''} 
                                onChange={handleChange}
                                placeholder="Color Name" 
                                className="w-full bg-white border border-stone-300 rounded-md px-3 py-2 text-stone-900 focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder-stone-400"
                            />
                        </div>
                    </div>
                 </div>
            </Section>
        </div>

        <Section title="Notes">
            <textarea
                id="notes"
                name="notes"
                value={profile.notes ?? ''}
                onChange={handleChange}
                rows={3}
                className="w-full bg-white border border-stone-300 rounded-md px-3 py-2 text-stone-900 focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder-stone-400"
                placeholder="e.g., Good for detailed prints, requires glue stick."
            ></textarea>
        </Section>
        
        {/* Action Buttons */}
        <div className="flex flex-col space-y-4 pt-4">
            <div className="flex flex-wrap justify-center gap-4">
                 <input type="file" ref={fileInputRef} onChange={handleSingleFileChange} accept=".json" className="hidden" />
                <button
                    onClick={handleAISuggest}
                    disabled={isSuggesting}
                    className="flex-1 min-w-[200px] flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-md transition-transform transform hover:scale-105 disabled:bg-purple-800 disabled:cursor-not-allowed shadow-md"
                >
                    {isSuggesting ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            Optimizing...
                        </>
                    ) : (
                        <>
                            <MagicIcon />
                            Suggest Settings
                        </>
                    )}
                </button>
                 <button
                    onClick={handleImportClick}
                    className="flex-1 min-w-[150px] flex items-center justify-center gap-2 bg-stone-600 hover:bg-stone-700 text-white font-bold py-2 px-4 rounded-md transition-transform transform hover:scale-105 shadow-md"
                >
                    <ImportIcon />
                    Import JSON
                </button>
                <button
                    onClick={handleShare}
                    className="flex-1 min-w-[150px] flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition-transform transform hover:scale-105 shadow-md"
                >
                    <ShareIcon />
                    Share Profile
                </button>
            </div>

            {/* Download Section */}
            <div className="border-t border-stone-200 pt-4 mt-2">
                <p className="text-sm text-stone-500 text-center mb-3">Export Profile For:</p>
                <div className="flex flex-wrap justify-center gap-3">
                    <button
                        onClick={() => downloadFile('bambu')}
                        className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors shadow-md"
                    >
                        <DownloadIcon />
                        Bambu / Orca (.json)
                    </button>
                    <button
                        onClick={() => downloadFile('prusa')}
                        className="flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded-md transition-colors shadow-md"
                    >
                        <DownloadIcon />
                        Prusa Slicer (.ini)
                    </button>
                     <button
                        onClick={() => downloadFile('ideamaker')}
                        className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-colors shadow-md"
                    >
                        <DownloadIcon />
                        ideaMaker (.json)
                    </button>
                </div>
            </div>
        </div>
        </>
       )}
    </div>
  );
};

export default CreateProfileForm;
