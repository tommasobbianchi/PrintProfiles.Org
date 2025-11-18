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

  const downloadJson = (profile: FilamentProfile) => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify({ filament_profile: profile }, null, 2))}`;
    const link = document.createElement('a');
    link.href = jsonString;
    const safeName = profile.profileName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    link.download = `${safeName}_${profile.printerBrand.replace(' ','')}_${profile.filamentType}.json`;
    link.click();
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
            <Detail label="Speed" value={`${profile.printSpeed} mm/s`} />
            <Detail label="Fan" value={`${profile.fanSpeed}%`} />
            <Detail label="Retraction" value={`${profile.retractionDistance} mm`} />
            <Detail label="Retract Speed" value={`${profile.retractionSpeed} mm/s`} />
            {profile.spoolWeight && <Detail label="Weight" value={`${profile.spoolWeight}g`} />}
            {profile.density && <Detail label="Density" value={`${profile.density} g/cm³`} />}
          </div>
        </div>
        
        {profile.notes && <p className="text-xs text-gray-300 italic bg-gray-800 p-2 rounded-md mt-2">"{profile.notes}"</p>}
      </div>
      <button
        onClick={() => downloadJson(profile)}
        className="mt-4 w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition-colors"
      >
        <DownloadIcon />
        Download
      </button>
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
      <h2 className="text-2xl font-bold text-center text-white mb-2">Community Profiles</h2>
      <p className="text-center text-gray-400 mb-6">
        {isLoading
          ? "Fetching the latest profiles from the community..."
          : "Browse and download profiles shared by other users."
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