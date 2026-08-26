
import React, { useState, useEffect } from 'react';
import { FilamentProfile } from './types';
import { PRESET_PROFILES } from './constants';
import Header from './components/Header';
import CreateProfileForm from './components/CreateProfileForm';
import CommunityProfiles from './components/CommunityProfiles';

type Tab = 'community' | 'create';

const App: React.FC = () => {
  // Browsing is the product: 2,433 profiles were invisible behind an empty filter state.
  const [activeTab, setActiveTab] = useState<Tab>('community');
  const [communityProfiles, setCommunityProfiles] = useState<FilamentProfile[]>([]);
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(true);

  // Logo State (App Branding)
  const [logoSrc, setLogoSrc] = useState<string>(() => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('custom_app_logo') || '/logo.png';
    }
    return '/logo.png';
  });
  // Force re-render of image when updated
  const [logoKey, setLogoKey] = useState(0);

  // The profiles are compiled into the bundle, so there is nothing to wait for. The old 1.5 s
  // timer was a cosmetic spinner in front of data that was already in memory.
  useEffect(() => {
    setCommunityProfiles(PRESET_PROFILES);
    setIsLoadingProfiles(false);
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
    <div className="min-h-screen">
      <Header logoSrc={`${logoSrc}${logoSrc.startsWith('data:') ? '' : `?v=${logoKey}`}`} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Tabs */}
        <div className="flex justify-center mb-8">
            <div className="flex bg-black/30 backdrop-blur-md p-1 rounded-xl border border-white/15">
                <button
                    className={`py-2 px-6 font-medium text-sm rounded-lg transition-all duration-200 flex items-center gap-2 ${activeTab === 'create' ? 'bg-stone-100 text-stone-900' : 'text-stone-300 hover:text-white hover:bg-white/10'}`}
                    onClick={() => setActiveTab('create')}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    Add a profile
                </button>
                <button
                    className={`py-2 px-6 font-medium text-sm rounded-lg transition-all duration-200 ${activeTab === 'community' ? 'bg-stone-100 text-stone-900' : 'text-stone-300 hover:text-white hover:bg-white/10'}`}
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
                /* Create Area (Add a profile) */
                <div className="max-w-4xl mx-auto">
                        <div className="space-y-8">
                            {/* The Create Form */}
                            {/* The form keeps a LIGHT surface. It is a dense work surface of labelled inputs, and
                                 inverting it would mean re-checking every label, helper line and select for
                                 contrast; a light panel on the photograph reads perfectly well and risks
                                 nothing. The browse view is the one that had to go dark. */}
                            <div className="bg-[#fdfbf7]/95 backdrop-blur-md p-6 rounded-xl border border-white/25 shadow-2xl text-stone-800">
                                <CreateProfileForm onShare={addProfileToCommunity} />
                            </div>
                        </div>
                </div>
            )}
        </div>

      </main>
      
      <footer className="mt-20 py-8 border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 text-center text-stone-400 text-xs">
              &copy; {new Date().getFullYear()} FilamentProfiles.Org. All rights reserved.
          </div>
      </footer>
    </div>
  );
};

export default App;
