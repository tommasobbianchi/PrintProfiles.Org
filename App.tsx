
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

  // Authentication State
  const [isProducerAuthenticated, setIsProducerAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    // Simulate fetching community profiles
    const timer = setTimeout(() => {
        setCommunityProfiles(PRESET_PROFILES);
        setIsLoadingProfiles(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);


  const addProfileToCommunity = (profileOrProfiles: FilamentProfile | FilamentProfile[]) => {
    if (Array.isArray(profileOrProfiles)) {
        setCommunityProfiles(prevProfiles => [...profileOrProfiles, ...prevProfiles]);
    } else {
        setCommunityProfiles(prevProfiles => [profileOrProfiles, ...prevProfiles]);
    }
    setActiveTab('community');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === 'PrintProfiles.Org') {
        setIsProducerAuthenticated(true);
        setAuthError('');
    } else {
        setAuthError('Incorrect password. Access denied.');
    }
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
        
        {/* Logo Section */}
        <div className="flex justify-center mb-8">
          <img 
            src="/logo.svg" 
            alt="PrintProfiles.Org" 
            className="max-h-40 w-auto object-contain drop-shadow-lg"
          />
        </div>

        <div className="mb-2 flex justify-center space-x-4">
          <TabButton tabName="create" label="Access for Filament Producers" />
          <TabButton tabName="community" label="Download Profiles" />
        </div>

        {/* Contact Email */}
        <div className="flex justify-center mb-6">
            <a 
                href="mailto:Contact@PrintProfiles.Org" 
                className="text-sm text-gray-400 hover:text-blue-400 transition-colors font-medium"
            >
                Contact@PrintProfiles.Org
            </a>
        </div>

        <div className="bg-gray-800 rounded-lg shadow-xl p-6">
          {activeTab === 'create' && (
            isProducerAuthenticated ? (
                <CreateProfileForm onShare={addProfileToCommunity} />
            ) : (
                <div className="flex flex-col items-center justify-center py-10">
                    <div className="w-full max-w-md bg-gray-700/50 p-8 rounded-lg shadow-lg border border-gray-600">
                        <h2 className="text-xl font-bold text-white mb-4 text-center">Producer Access Required</h2>
                        <p className="text-gray-400 mb-6 text-center text-sm">
                            Please enter the password to access the profile creation tools.
                        </p>
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div>
                                <input
                                    type="password"
                                    value={passwordInput}
                                    onChange={(e) => setPasswordInput(e.target.value)}
                                    placeholder="Enter Password"
                                    className="w-full bg-gray-800 border border-gray-600 rounded-md px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                            </div>
                            {authError && (
                                <p className="text-red-400 text-sm text-center">{authError}</p>
                            )}
                            <button
                                type="submit"
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition-colors"
                            >
                                Unlock Access
                            </button>
                        </form>
                    </div>
                </div>
            )
          )}
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
