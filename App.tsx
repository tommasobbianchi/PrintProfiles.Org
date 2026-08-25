
import React, { useState, useEffect } from 'react';
import { FilamentProfile } from './types';
import { PRESET_PROFILES } from './constants';
import Header from './components/Header';
import CreateProfileForm from './components/CreateProfileForm';
import CommunityProfiles from './components/CommunityProfiles';

type Tab = 'community' | 'create';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('create');
  const [communityProfiles, setCommunityProfiles] = useState<FilamentProfile[]>([]);
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(true);

  // Logo State (App Branding)
  const [logoSrc, setLogoSrc] = useState<string>(() => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('custom_app_logo') || '/logo.svg';
    }
    return '/logo.svg';
  });
  // Force re-render of image when updated
  const [logoKey, setLogoKey] = useState(0);

  useEffect(() => {
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
    alert("Profile added to Download list successfully!");
    setActiveTab('community');
  };

  return (
    <div className="min-h-screen bg-[#fdfbf7]">
      <Header logoSrc={`${logoSrc}${logoSrc.startsWith('data:') ? '' : `?v=${logoKey}`}`} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Tabs */}
        <div className="flex justify-center mb-8">
            <div className="flex bg-white p-1 rounded-xl border border-stone-200 shadow-sm">
                <button
                    className={`py-2 px-6 font-medium text-sm rounded-lg transition-all duration-200 flex items-center gap-2 ${activeTab === 'create' ? 'bg-stone-800 text-white shadow-md' : 'text-stone-500 hover:text-stone-700 hover:bg-stone-50'}`}
                    onClick={() => setActiveTab('create')}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    Input Data
                </button>
                <button
                    className={`py-2 px-6 font-medium text-sm rounded-lg transition-all duration-200 ${activeTab === 'community' ? 'bg-stone-800 text-white shadow-md' : 'text-stone-500 hover:text-stone-700 hover:bg-stone-50'}`}
                    onClick={() => setActiveTab('community')}
                >
                    Repository
                </button>
            </div>
        </div>

        <div className="animate-fadeIn">
            {activeTab === 'community' ? (
                <CommunityProfiles profiles={communityProfiles} isLoading={isLoadingProfiles} />
            ) : (
                /* Create Area (Input Data) */
                <div className="max-w-4xl mx-auto">
                        <div className="space-y-8">
                            {/* The Create Form */}
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200">
                                <CreateProfileForm onShare={addProfileToCommunity} />
                            </div>
                        </div>
                </div>
            )}
        </div>

      </main>
      
      <footer className="mt-20 py-8 border-t border-stone-200/50">
          <div className="max-w-7xl mx-auto px-4 text-center text-stone-400 text-xs">
              &copy; {new Date().getFullYear()} PrintProfiles.Org. All rights reserved.
          </div>
      </footer>
    </div>
  );
};

export default App;
