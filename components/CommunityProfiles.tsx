import React, { useState } from 'react';
import { FilamentProfile, PrinterBrand } from '../types';
import { PRINTER_BRANDS, PRINTER_MODELS, NOZZLE_DIAMETERS, FILAMENT_MANUFACTURERS, FILAMENT_TYPES } from '../constants';
import DownloadIcon from './icons/DownloadIcon';

interface CommunityProfilesProps {
  profiles: FilamentProfile[];
  isLoading: boolean;
}

const Detail: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
  <div>
    <span className="text-gray-400">{label}: </span>
    <span className="font-semibold text-white">{value}</span>
  </div>
);

const CommunityProfiles: React.FC<CommunityProfilesProps> = ({ profiles, isLoading }) => {
  const [filterBrand, setFilterBrand] = useState<string>('All');
  const [filterModel, setFilterModel] = useState<string>('All');
  const [filterNozzle, setFilterNozzle] = useState<string>('All');
  const [filterManufacturer, setFilterManufacturer] = useState<string>('All');
  const [filterMaterial, setFilterMaterial] = useState<string>('All');
  const [filterText, setFilterText] = useState('');

  // --- Filtering & Scoring Logic ---
  
  // 1. Calculate score for sorting (Specificity Score)
  const getMatchScore = (p: FilamentProfile) => {
      let score = 0;
      
      // Brand Match (Highest priority)
      if (filterBrand !== 'All') {
          if (p.printerBrand === filterBrand) score += 100;
          else if (p.printerBrand === 'Other') score += 10; // Generic brand fallback
      }

      // Model Match
      if (filterModel !== 'All') {
          if (p.printerModel === filterModel) score += 50;
          else if (p.printerModel === 'Generic' || !p.printerModel) score += 5; // Generic model fallback
      }

      // Nozzle Match
      if (filterNozzle !== 'All') {
          const targetNozzle = parseFloat(filterNozzle);
          if (p.nozzleDiameter === targetNozzle) score += 20;
          else if (!p.nozzleDiameter) score += 2; // Generic nozzle fallback
      }

      return score;
  };

  const getMatchLabel = (p: FilamentProfile): { text: string, color: string } | null => {
      if (filterBrand === 'All') return null;

      const isBrandMatch = p.printerBrand === filterBrand;
      const isModelMatch = filterModel !== 'All' && p.printerModel === filterModel;
      const isNozzleMatch = filterNozzle !== 'All' && p.nozzleDiameter === parseFloat(filterNozzle);

      if (isBrandMatch && isModelMatch && isNozzleMatch) return { text: 'Perfect Match', color: 'bg-green-900 text-green-200 border-green-700' };
      if (isBrandMatch && isModelMatch) return { text: 'Model Match', color: 'bg-blue-900 text-blue-200 border-blue-700' };
      if (isBrandMatch) return { text: 'Brand Compatible', color: 'bg-indigo-900 text-indigo-200 border-indigo-700' };
      if (p.printerBrand === 'Other') return { text: 'Generic / Universal', color: 'bg-gray-700 text-gray-300 border-gray-600' };
      
      return null;
  };

  const filteredProfiles = profiles
    .filter(p => {
        // 1. Text Search
        const search = filterText.toLowerCase();
        const matchesText = p.profileName.toLowerCase().includes(search) || 
                            p.manufacturer.toLowerCase().includes(search) ||
                            p.filamentType.toLowerCase().includes(search);
        if (!matchesText) return false;

        // 2. Brand Filter (Show Exact Brand OR 'Other' as fallback)
        const matchesBrand = filterBrand === 'All' || p.printerBrand === filterBrand || p.printerBrand === 'Other';
        
        // 3. Model Filter (Show Exact Model OR 'Generic' OR undefined)
        const matchesModel = filterModel === 'All' || 
                             (p.printerModel === filterModel) || 
                             (p.printerModel === 'Generic') || 
                             (!p.printerModel);

        // 4. Nozzle Filter (Show Exact Nozzle OR undefined)
        const matchesNozzle = filterNozzle === 'All' || 
                              (p.nozzleDiameter === parseFloat(filterNozzle)) || 
                              (!p.nozzleDiameter);

        // 5. Manufacturer Filter
        const matchesManufacturer = filterManufacturer === 'All' || p.manufacturer === filterManufacturer;

        // 6. Material Filter
        const matchesMaterial = filterMaterial === 'All' || p.filamentType === filterMaterial;
                              
        return matchesBrand && matchesModel && matchesNozzle && matchesManufacturer && matchesMaterial;
    })
    .sort((a, b) => {
        // Sort by score descending
        return getMatchScore(b) - getMatchScore(a);
    });

  // Reset dependent filters when parent changes
  const handleBrandChange = (brand: string) => {
      setFilterBrand(brand);
      setFilterModel('All'); // Reset model
      setFilterNozzle('All'); // Optional: Reset nozzle or keep it
  };

  const availableModels = filterBrand !== 'All' && filterBrand !== 'Other' 
    ? PRINTER_MODELS[filterBrand as PrinterBrand] || [] 
    : [];


  // --- Export Generators ---
  const generateBambuJson = (profile: FilamentProfile) => {
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
          printer_brand: profile.printerBrand,
          printer_model: profile.printerModel,
          nozzle_diameter: profile.nozzleDiameter,
          filament_diameter: profile.filamentDiameter,
      };
  };

  const generatePrusaIni = (profile: FilamentProfile) => {
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
filament_notes = "${profile.notes || ''}"
filament_colour = ${profile.colorHex || '#FF0000'}
extrusion_multiplier = 1
cooling = 1
`;
  };

  const generateIdeaMakerJson = (profile: FilamentProfile) => {
      return {
          header: {
              machine_type: profile.printerBrand,
              filament_name: profile.profileName,
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
              flow_rate: 100
          }
      };
  };

  const downloadFile = (profile: FilamentProfile, type: 'bambu' | 'prusa' | 'ideamaker') => {
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
        mimeType = 'text/plain';
        extension = 'ini';
        prefix = 'Prusa';
    } else if (type === 'ideamaker') {
        content = JSON.stringify(generateIdeaMakerJson(profile), null, 2);
        mimeType = 'text/json';
        extension = 'json';
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

  const ProfileCard: React.FC<{ profile: FilamentProfile }> = ({ profile }) => {
      const matchLabel = getMatchLabel(profile);

      return (
        <div className="bg-gray-700/50 rounded-lg p-4 flex flex-col justify-between transition-all duration-300 hover:bg-gray-700 hover:shadow-2xl hover:scale-[1.02] relative overflow-hidden border border-gray-600/50">
        
        {matchLabel && (
            <div className={`absolute top-0 right-0 px-3 py-1 text-xs font-bold rounded-bl-lg border-b border-l ${matchLabel.color}`}>
                {matchLabel.text}
            </div>
        )}

        <div>
            <div className="flex items-center justify-between mb-1 pr-20">
                <h3 className="text-lg font-bold text-blue-300 truncate pr-2" title={profile.profileName}>{profile.profileName}</h3>
            </div>
            <div className="flex items-center mb-2">
                 {profile.colorHex && <div className="w-4 h-4 rounded-full border border-gray-500 mr-2" title={profile.colorName} style={{ backgroundColor: profile.colorHex }}></div>}
                 <p className="text-sm text-gray-400 truncate">
                    {profile.manufacturer} {profile.brand ? `- ${profile.brand}` : ''}
                 </p>
            </div>

            {/* Hardware Specs */}
            <div className="flex gap-2 mb-3">
                 <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${profile.printerBrand === 'Other' ? 'bg-gray-600 text-gray-200' : 'bg-blue-900 text-blue-200'}`}>
                     {profile.printerBrand}
                 </span>
                 <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-800 text-gray-300 border border-gray-600">
                     {profile.printerModel || 'Generic'}
                 </span>
                 <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-800 text-gray-300 border border-gray-600">
                     {profile.nozzleDiameter ? `⌀ ${profile.nozzleDiameter}mm` : 'All Nozzles'}
                 </span>
            </div>
            
            <div className="border-t border-gray-600/50 pt-3">
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm mb-3">
                <Detail label="Nozzle" value={`${profile.nozzleTemp}°C`} />
                <Detail label="Bed" value={`${profile.bedTemp}°C`} />
                <Detail label="Max Flow" value={`${profile.maxVolumetricSpeed} mm³/s`} />
                <Detail label="Fan" value={`${profile.fanSpeedMin}-${profile.fanSpeedMax}%`} />
                {profile.density && <Detail label="Density" value={`${profile.density} g/cm³`} />}
            </div>
            </div>
            
            {profile.notes && <p className="text-xs text-gray-300 italic bg-gray-800 p-2 rounded-md mt-2">"{profile.notes}"</p>}
        </div>
        
        <div className="mt-4 pt-3 border-t border-gray-600/30">
            <p className="text-xs text-gray-500 text-center mb-2">Download For:</p>
            <div className="flex flex-col gap-2">
                <button
                    onClick={() => downloadFile(profile, 'bambu')}
                    className="w-full flex items-center justify-center gap-1 bg-green-600 hover:bg-green-700 text-white text-xs font-bold py-2 px-2 rounded-md transition-colors"
                    title="Bambu Studio / Orca Slicer"
                >
                    <DownloadIcon /> Bambu/Orca
                </button>
                <button
                    onClick={() => downloadFile(profile, 'prusa')}
                    className="w-full flex items-center justify-center gap-1 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold py-2 px-2 rounded-md transition-colors"
                    title="Prusa Slicer"
                >
                    <DownloadIcon /> Prusa
                </button>
                <button
                    onClick={() => downloadFile(profile, 'ideamaker')}
                    className="w-full flex items-center justify-center gap-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-2 px-2 rounded-md transition-colors"
                    title="ideaMaker"
                >
                    <DownloadIcon /> IdeaMaker
                </button>
            </div>
        </div>
        </div>
      );
  };

  const LoadingSpinner = () => (
    <div className="flex justify-center items-center p-10">
      <svg className="animate-spin h-8 w-8 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </div>
  );

  return (
    <div>
      <h2 className="text-2xl font-bold text-center text-white mb-2">Download Profiles</h2>
      <p className="text-center text-gray-400 mb-6">
        {isLoading
          ? "Fetching the latest profiles from the community..."
          : "Browse and download Official Brand Approved Profiles"
        }
      </p>
      
      {/* Smart Filter Bar */}
      <div className="flex flex-col gap-4 mb-6 bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-700">
          
          {/* Row 1: Printer Hardware */}
          <div className="flex flex-col md:flex-row gap-4">
              {/* 1. Printer Brand */}
              <div className="flex-1">
                  <label className="block text-xs text-gray-400 mb-1">1. Printer Brand</label>
                  <select 
                    value={filterBrand} 
                    onChange={(e) => handleBrandChange(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                      <option value="All">All Brands</option>
                      {PRINTER_BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
              </div>

              {/* 2. Printer Model (Conditional) */}
              <div className={`flex-1 transition-opacity duration-200 ${filterBrand === 'All' ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                   <label className="block text-xs text-gray-400 mb-1">2. Model (Optional)</label>
                   <select 
                    value={filterModel} 
                    onChange={(e) => setFilterModel(e.target.value)}
                    disabled={filterBrand === 'All'}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                      <option value="All">All / Generic</option>
                      {availableModels.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
              </div>

              {/* 3. Nozzle Diameter (Conditional) */}
               <div className={`w-full md:w-40 transition-opacity duration-200 ${filterBrand === 'All' ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                   <label className="block text-xs text-gray-400 mb-1">3. Nozzle (Optional)</label>
                   <select 
                    value={filterNozzle} 
                    onChange={(e) => setFilterNozzle(e.target.value)}
                    disabled={filterBrand === 'All'}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                      <option value="All">All</option>
                      {NOZZLE_DIAMETERS.map(d => <option key={d} value={d}>{d} mm</option>)}
                  </select>
              </div>
          </div>

          {/* Row 2: Material & Manufacturer */}
          <div className="flex flex-col md:flex-row gap-4">
               {/* 4. Manufacturer */}
               <div className="flex-1">
                  <label className="block text-xs text-gray-400 mb-1">4. Manufacturer</label>
                  <select 
                    value={filterManufacturer} 
                    onChange={(e) => setFilterManufacturer(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                      <option value="All">All Manufacturers</option>
                      {FILAMENT_MANUFACTURERS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
              </div>

              {/* 5. Material */}
              <div className="flex-1">
                   <label className="block text-xs text-gray-400 mb-1">5. Material Type</label>
                   <select 
                    value={filterMaterial} 
                    onChange={(e) => setFilterMaterial(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                      <option value="All">All Materials</option>
                      {FILAMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
              </div>
          </div>

          {/* Row 3: Search */}
          <div>
              <input 
                type="text" 
                placeholder="Search by profile name, manufacturer, material type..." 
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder-gray-500"
              />
          </div>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : filteredProfiles.length === 0 ? (
        <div className="text-center py-10 bg-gray-800/30 rounded-lg border border-dashed border-gray-700">
            <p className="text-gray-400 text-lg">No profiles match your specific criteria.</p>
            <p className="text-gray-500 text-sm mt-2">Try resetting the filters to see more results.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProfiles.map(p => <ProfileCard key={p.id} profile={p} />)}
        </div>
      )}
    </div>
  );
};

export default CommunityProfiles;