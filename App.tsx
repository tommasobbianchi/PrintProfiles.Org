
import React, { useState, useEffect, useRef } from 'react';
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

  // Logo State
  const [logoSrc, setLogoSrc] = useState<string>(() => {
    // Load from local storage if available
    if (typeof window !== 'undefined') {
        return localStorage.getItem('custom_logo') || '/logo.svg';
    }
    return '/logo.svg';
  });
  const [logoLoadError, setLogoLoadError] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

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

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    // Reset input value to allow selecting the same file again if needed/retrying
    e.target.value = '';

    if (file) {
        // Basic validation: Check size (limit to ~2MB for localStorage safety)
        if (file.size > 2 * 1024 * 1024) {
            alert("File is too large. Please select an image under 2MB.");
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            if (typeof event.target?.result === 'string') {
                const result = event.target.result;
                setLogoSrc(result);
                setLogoLoadError(false); // Reset error state on new upload
                try {
                    localStorage.setItem('custom_logo', result);
                } catch (error) {
                    console.error("Failed to save logo to local storage", error);
                    alert("Logo updated but could not be saved permanently (storage full).");
                }
            }
        };
        reader.readAsDataURL(file);
    }
  };

  const handleResetLogo = () => {
      setLogoSrc('/logo.svg');
      setLogoLoadError(false);
      localStorage.removeItem('custom_logo');
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
        <div className="flex flex-col items-center justify-center mb-8">
          <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/50 backdrop-blur-sm shadow-lg mb-2 transition-all duration-300 hover:bg-gray-800/80">
            {logoLoadError ? (
                <div className="h-20 w-40 flex items-center justify-center text-red-400 text-xs border border-red-900/50 rounded bg-red-900/20">
                   Invalid Image
                </div>
            ) : (
                <img 
                    key={logoSrc} // Forces re-render when source changes
                    src={logoSrc} 
                    alt="PrintProfiles.Org" 
                    onError={() => setLogoLoadError(true)}
                    className="max-h-32 md:max-h-40 w-auto object-contain"
                />
            )}
          </div>

          {isProducerAuthenticated && (
            <div className="flex items-center gap-3">
                <input
                    type="file"
                    ref={logoInputRef}
                    onChange={handleLogoUpload}
                    accept=".svg,.png,.jpg,.jpeg"
                    className="hidden"
                />
                <button
                    onClick={() => logoInputRef.current?.click()}
                    className="text-xs text-gray-500 hover:text-blue-400 transition-colors flex items-center gap-1"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    Change Logo
                </button>
                {logoSrc !== '/logo.svg' && (
                    <button
                        onClick={handleResetLogo}
                        className="text-xs text-gray-500 hover:text-red-400 transition-colors flex items-center gap-1"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Reset
                    </button>
                )}
            </div>
          )}
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
