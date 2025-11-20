import React from 'react';
import { FilamentProfile } from '../types';
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

  const ProfileCard: React.FC<{ profile: FilamentProfile }> = ({ profile }) => (
    <div className="bg-gray-700/50 rounded-lg p-4 flex flex-col justify-between transition-all duration-300 hover:bg-gray-700 hover:shadow-2xl hover:scale-[1.02]">
      <div>
        <div className="flex items-center justify-between mb-1">
            <h3 className="text-lg font-bold text-blue-300 truncate pr-2" title={profile.profileName}>{profile.profileName}</h3>
            {profile.colorHex && <div className="w-6 h-6 rounded-full border-2 border-gray-500 flex-shrink-0" title={profile.colorName} style={{ backgroundColor: profile.colorHex }}></div>}
        </div>
        <p className="text-sm text-gray-400 mb-3 truncate">{profile.printerBrand} - {profile.manufacturer} {profile.brand ? `- ${profile.brand}` : ''}</p>
        
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
                className="w-full flex items-center justify-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 px-2 rounded-md transition-colors"
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
                className="w-full flex items-center justify-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2 px-2 rounded-md transition-colors"
                title="ideaMaker"
            >
                <DownloadIcon /> Idea
            </button>
          </div>
      </div>
    </div>
  );

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
      {isLoading ? (
        <LoadingSpinner />
      ) : profiles.length === 0 ? (
        <p className="text-center text-gray-500">No community profiles available yet. Be the first to share one!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {profiles.map(p => <ProfileCard key={p.id} profile={p} />)}
        </div>
      )}
    </div>
  );
};

export default CommunityProfiles;