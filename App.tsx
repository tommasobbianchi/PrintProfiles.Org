
import React, { useState, useEffect } from 'react';
import { FilamentProfile } from './types';
import { PRESET_PROFILES } from './constants';
import Header from './components/Header';
import CreateProfileForm from './components/CreateProfileForm';
import CommunityProfiles from './components/CommunityProfiles';

type Tab = 'create' | 'community';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('create');
  const [communityProfiles, setCommunityProfiles] = useState<FilamentProfile[]>([]);
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(true);

  useEffect(() => {
    // Simulate fetching community profiles
    const timer = setTimeout(() => {
        setCommunityProfiles(PRESET_PROFILES);
        setIsLoadingProfiles(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);


  const addProfileToCommunity = (profile: FilamentProfile) => {
    setCommunityProfiles(prevProfiles => [profile, ...prevProfiles]);
    setActiveTab('community');
  };

  const TabButton: React.FC<{ tabName: Tab; label: string }> = ({ tabName, label }) => (
    <button
      onClick={() => setActiveTab(tabName)}
      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
        activeTab === tabName
          ? 'bg-blue-600 text-white'
          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans">
      <Header />
      <main className="max-w-4xl mx-auto p-4 md:p-6">
        <div className="mb-6 flex justify-center space-x-4">
          <TabButton tabName="create" label="Create New Profile" />
          <TabButton tabName="community" label="Community Profiles" />
        </div>

        <div className="bg-gray-800 rounded-lg shadow-xl p-6">
          {activeTab === 'create' && <CreateProfileForm onShare={addProfileToCommunity} />}
          {activeTab === 'community' && <CommunityProfiles profiles={communityProfiles} isLoading={isLoadingProfiles} />}
        </div>
        <footer className="text-center mt-8 text-gray-500 text-sm">
          <p>Slicer Profile Generator &copy; 2024. Happy Printing!</p>
        </footer>
      </main>
    </div>
  );
};

export default App;
