import React, { useState, useRef } from 'react';
import { FilamentProfile, PrinterBrand, FilamentType } from '../types';
import { PRINTER_BRANDS, FILAMENT_TYPES, FILAMENT_MANUFACTURERS } from '../constants';
import { suggestFilamentSettings } from '../services/geminiService';
import DownloadIcon from './icons/DownloadIcon';
import ShareIcon from './icons/ShareIcon';
import MagicIcon from './icons/MagicIcon';
import ImportIcon from './icons/ImportIcon';


interface CreateProfileFormProps {
  onShare: (profile: FilamentProfile) => void;
}

const initialProfileState: Omit<FilamentProfile, 'id'> = {
  profileName: '',
  printerBrand: 'Bambu Lab',
  manufacturer: '',
  brand: '',
  filamentType: 'PLA',
  filamentDiameter: 1.75,
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

// Helper to map internal camelCase to industry standard snake_case for JSON export
const mapToStandardJson = (profile: Omit<FilamentProfile, 'id'>) => {
    return {
        profile_name: profile.profileName,
        filament_type: profile.filamentType,
        filament_vendor: profile.manufacturer,
        filament_density: profile.density,
        filament_cost: profile.filamentCost,
        nozzle_temperature: profile.nozzleTemp,
        nozzle_temperature_initial_layer: profile.nozzleTempInitial,
        hot_plate_temp: profile.bedTemp,
        hot_plate_temp_initial_layer: profile.bedTempInitial,
        filament_max_volumetric_speed: profile.maxVolumetricSpeed,
        fan_min_speed: profile.fanSpeedMin,
        fan_max_speed: profile.fanSpeedMax,
        retraction_length: profile.retractionDistance,
        retraction_speed: profile.retractionSpeed,
        filament_notes: profile.notes,
        // Extras
        printer_brand: profile.printerBrand,
        filament_diameter: profile.filamentDiameter,
        filament_brand_name: profile.brand,
        spool_weight: profile.spoolWeight,
        color_hex: profile.colorHex,
        color_name: profile.colorName,
        drying_temperature: profile.dryingTemp,
        drying_time: profile.dryingTime
    };
};

const CreateProfileForm: React.FC<CreateProfileFormProps> = ({ onShare }) => {
  const [profile, setProfile] = useState<Omit<FilamentProfile, 'id'>>(initialProfileState);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const isNumber = ['Temp', 'Speed', 'Distance', 'Diameter', 'Weight', 'Density', 'Cost'].some(key => name.includes(key));
    setProfile(prev => ({ 
        ...prev, 
        [name]: isNumber ? parseFloat(value) || 0 : value 
    }));
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

  const downloadJson = () => {
    if (!profile.profileName) {
        setError("Please provide a profile name before downloading.");
        return;
    }
    setError(null);
    // Export using standard structure
    const standardData = mapToStandardJson(profile);
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(standardData, null, 2))}`;
    const link = document.createElement('a');
    link.href = jsonString;
    const safeName = profile.profileName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    link.download = `${safeName}_${profile.printerBrand.replace(' ','')}_${profile.filamentType}.json`;
    link.click();
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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') throw new Error("Failed to read file.");
        
        const parsed = JSON.parse(text);
        const imported = parsed.filament_profile || parsed; // Support both wrapped and unwrapped

        // Map standard keys back to internal state if needed
        const mappedState: any = { ...initialProfileState };
        
        // Heuristic mapping for import
        if (imported.nozzle_temperature) mappedState.nozzleTemp = imported.nozzle_temperature;
        if (imported.nozzle_temperature_initial_layer) mappedState.nozzleTempInitial = imported.nozzle_temperature_initial_layer;
        if (imported.hot_plate_temp) mappedState.bedTemp = imported.hot_plate_temp;
        if (imported.hot_plate_temp_initial_layer) mappedState.bedTempInitial = imported.hot_plate_temp_initial_layer;
        if (imported.filament_max_volumetric_speed) mappedState.maxVolumetricSpeed = imported.filament_max_volumetric_speed;
        if (imported.fan_min_speed) mappedState.fanSpeedMin = imported.fan_min_speed;
        if (imported.fan_max_speed) mappedState.fanSpeedMax = imported.fan_max_speed;
        
        // Fallback to direct copy for matching keys
        Object.keys(imported).forEach(key => {
            if (key in mappedState) mappedState[key] = imported[key];
        });

        setProfile(mappedState);
        setError(null);
        alert("Profile imported successfully! Note: Some fields might need manual verification.");
      } catch (err) {
        setError("Invalid JSON file.");
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const InputField: React.FC<{label: string, name: keyof Omit<FilamentProfile, 'id'>, type?: string, value: any, step?: string, placeholder?: string, children?: React.ReactNode}> = ({ label, name, type = 'text', value, step, placeholder, children }) => (
    <div className="flex flex-col">
      <label htmlFor={name} className="mb-1 text-sm font-medium text-gray-400">{label}</label>
      {children ? children :
        <input
          type={type}
          id={name}
          name={name}
          value={value}
          onChange={handleChange}
          step={step}
          placeholder={placeholder}
          className="bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      }
    </div>
  );

  const Section: React.FC<{title: string, children: React.ReactNode}> = ({title, children}) => (
      <div className="border-t border-gray-700 pt-6 mt-6">
          <h3 className="text-lg font-semibold text-gray-300 mb-4">{title}</h3>
          {children}
      </div>
  );

  return (
    <div className="space-y-6">
       <h2 className="text-2xl font-bold text-center text-white mb-2">Create a New Filament Profile</h2>
       <p className="text-center text-gray-400 mb-6">Fill in the details below, use AI to suggest settings, or import an existing profile.</p>

        {error && <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-md text-center animate-pulse">{error}</div>}

       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField label="Profile Name" name="profileName" value={profile.profileName} placeholder="e.g. My Favorite PETG"/>
            <InputField label="Printer Brand" name="printerBrand" value={profile.printerBrand}>
                <select id="printerBrand" name="printerBrand" value={profile.printerBrand} onChange={handleChange} className="bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none">
                    {PRINTER_BRANDS.map(brand => <option key={brand} value={brand}>{brand}</option>)}
                </select>
            </InputField>
            <InputField label="Manufacturer" name="manufacturer" value={profile.manufacturer}>
                <select id="manufacturer" name="manufacturer" value={profile.manufacturer} onChange={handleChange} className="bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none">
                    <option value="">Select a manufacturer...</option>
                    {FILAMENT_MANUFACTURERS.map(brand => <option key={brand} value={brand}>{brand}</option>)}
                </select>
            </InputField>
             <InputField label="Brand / Product Line" name="brand" value={profile.brand ?? ''} placeholder="e.g. PolyLite, Prusament"/>
             <InputField label="Filament Type" name="filamentType" value={profile.filamentType}>
                <select id="filamentType" name="filamentType" value={profile.filamentType} onChange={handleChange} className="bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none">
                    {FILAMENT_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                </select>
            </InputField>
            <InputField label="Filament Diameter (mm)" name="filamentDiameter" type="number" value={profile.filamentDiameter} step="0.01"/>
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
                        <label htmlFor="colorHex" className="mb-1 text-sm font-medium text-gray-400">Color</label>
                        <div className="flex items-center gap-2">
                            <input
                            type="color"
                            id="colorHex"
                            name="colorHex"
                            value={profile.colorHex || '#ffffff'}
                            onChange={handleChange}
                            className="p-1 h-10 w-10 block bg-gray-700 border border-gray-600 cursor-pointer rounded-md"
                            />
                            <input 
                                name="colorName" 
                                value={profile.colorName ?? ''} 
                                onChange={handleChange}
                                placeholder="Color Name" 
                                className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>
                    </div>
                 </div>
            </Section>
        </div>

        <Section title="Physical Properties">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <InputField label="Spool Weight (g)" name="spoolWeight" type="number" value={profile.spoolWeight ?? ''} />
                <InputField label="Density (g/cm³)" name="density" type="number" step="0.01" value={profile.density ?? ''} placeholder="e.g. 1.24"/>
                <InputField label="Tensile Strength" name="tensileStrength" type="text" value={profile.tensileStrength ?? ''} placeholder="e.g. 50 MPa"/>
            </div>
        </Section>

        <Section title="Notes">
            <textarea
                id="notes"
                name="notes"
                value={profile.notes ?? ''}
                onChange={handleChange}
                rows={3}
                className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="e.g., Good for detailed prints, requires glue stick."
            ></textarea>
        </Section>
        
        <div className="flex flex-wrap justify-center items-center gap-4 pt-4">
             <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="hidden" />
            <button
                onClick={handleAISuggest}
                disabled={isSuggesting}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-md transition-transform transform hover:scale-105 disabled:bg-purple-800 disabled:cursor-not-allowed"
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
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-md transition-transform transform hover:scale-105"
            >
                <ImportIcon />
                Import JSON
            </button>
             <button
                onClick={downloadJson}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition-transform transform hover:scale-105"
            >
                <DownloadIcon />
                Download JSON
            </button>
            <button
                onClick={handleShare}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition-transform transform hover:scale-105"
            >
                <ShareIcon />
                Share
            </button>
        </div>
    </div>
  );
};

export default CreateProfileForm;