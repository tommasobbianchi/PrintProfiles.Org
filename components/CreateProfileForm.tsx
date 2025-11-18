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
  bedTemp: 60,
  printSpeed: 60,
  retractionDistance: 1,
  retractionSpeed: 40,
  fanSpeed: 100,
  notes: '',
  spoolWeight: 1000,
  colorName: '',
  colorHex: '#FFFFFF',
  dryingTemp: undefined,
  dryingTime: '',
  density: undefined,
  tensileStrength: '',
};

const isValidProfileData = (data: any): data is Omit<FilamentProfile, 'id'> => {
    return (
        data &&
        typeof data.profileName === 'string' &&
        typeof data.printerBrand === 'string' && PRINTER_BRANDS.includes(data.printerBrand as PrinterBrand) &&
        typeof data.manufacturer === 'string' &&
        typeof data.filamentType === 'string' && FILAMENT_TYPES.includes(data.filamentType as FilamentType) &&
        typeof data.filamentDiameter === 'number' &&
        typeof data.nozzleTemp === 'number' &&
        typeof data.bedTemp === 'number' &&
        typeof data.printSpeed === 'number' &&
        typeof data.retractionDistance === 'number' &&
        typeof data.retractionSpeed === 'number' &&
        typeof data.fanSpeed === 'number'
    );
};


const CreateProfileForm: React.FC<CreateProfileFormProps> = ({ onShare }) => {
  const [profile, setProfile] = useState<Omit<FilamentProfile, 'id'>>(initialProfileState);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    // A bit of a broader regex to catch all numeric fields
    setProfile(prev => ({ ...prev, [name]: name.match(/Temp|Speed|Distance|Diameter|Weight|Density/) ? parseFloat(value) || 0 : value }));
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
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify({ filament_profile: profile }, null, 2))}`;
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
        if (typeof text !== 'string') {
          throw new Error("Failed to read file content.");
        }
        const parsedJson = JSON.parse(text);
        let importedProfile = parsedJson.filament_profile;

        // Backwards compatibility for old format
        if (importedProfile && importedProfile.filamentBrand && !importedProfile.manufacturer) {
            importedProfile.manufacturer = importedProfile.filamentBrand;
            delete importedProfile.filamentBrand;
        }

        if (isValidProfileData(importedProfile)) {
          const newProfileState = { ...initialProfileState, ...importedProfile };
          setProfile(newProfileState);
          setError(null);
          alert("Profile imported successfully!");
        } else {
          setError("Invalid JSON structure. The file does not match the expected filament profile format.");
        }
      } catch (err) {
        setError("Malformed JSON. The selected file is not a valid JSON file.");
      }
    };
    reader.onerror = () => {
        setError("An error occurred while reading the file.");
    }
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

        <Section title="Print Settings">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <InputField label="Nozzle Temp (°C)" name="nozzleTemp" type="number" value={profile.nozzleTemp} />
                <InputField label="Bed Temp (°C)" name="bedTemp" type="number" value={profile.bedTemp} />
                <InputField label="Print Speed (mm/s)" name="printSpeed" type="number" value={profile.printSpeed} />
                <InputField label="Retraction Dist. (mm)" name="retractionDistance" type="number" value={profile.retractionDistance} step="0.1" />
                <InputField label="Retraction Spd. (mm/s)" name="retractionSpeed" type="number" value={profile.retractionSpeed} />
                <InputField label="Fan Speed (%)" name="fanSpeed" type="number" value={profile.fanSpeed} />
            </div>
        </Section>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
            <Section title="Drying Settings">
                <div className="grid grid-cols-2 gap-6">
                    <InputField label="Drying Temp (°C)" name="dryingTemp" type="number" value={profile.dryingTemp ?? ''} placeholder="e.g. 55"/>
                    <InputField label="Drying Time (h)" name="dryingTime" type="text" value={profile.dryingTime ?? ''} placeholder="e.g. 4-6h"/>
                </div>
            </Section>
            <Section title="Appearance">
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
                        <InputField label="" name="colorName" value={profile.colorName ?? ''} placeholder="e.g. Galaxy Black" />
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