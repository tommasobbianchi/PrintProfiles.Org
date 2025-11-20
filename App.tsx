
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
  const [logoKey, setLogoKey] = useState(0); // Use a counter to force re-render reliably
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
    
    // Reset input value to allow selecting the same file again
    e.target.value = '';

    if (file) {
        // Basic validation: Check size (limit to ~2MB for localStorage safety)
        if (file.size > 2 * 1024 * 1024) {
            alert("File is too large. Please select an image under 2MB.");
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const buffer = event.target?.result;
            if (buffer instanceof ArrayBuffer) {
                // Robust Binary-to-Base64 conversion
                // This avoids browser MIME sniffing issues which often fail for SVGs or PNGs served locally
                let binary = '';
                const bytes = new Uint8Array(buffer);
                const len = bytes.byteLength;
                for (let i = 0; i < len; i++) {
                    binary += String.fromCharCode(bytes[i]);
                }
                const base64 = window.btoa(binary);

                const ext = file.name.split('.').pop()?.toLowerCase();
                let mimeType = 'image/png'; // Default fallback
                
                if (ext === 'svg') {
                    mimeType = 'image/svg+xml';
                } else if (ext === 'png') {
                    mimeType = 'image/png';
                } else if (ext === 'jpg' || ext === 'jpeg') {
                    mimeType = 'image/jpeg';
                }

                const finalResult = `data:${mimeType};base64,${base64}`;

                // Clear previous logo to free up storage space BEFORE setting new one
                try {
                     localStorage.removeItem('custom_logo');
                } catch (e) { /* ignore */ }

                setLogoSrc(finalResult);
                setLogoLoadError(false);
                setLogoKey(prev => prev + 1); // Force fresh mount
                
                try {
                    localStorage.setItem('custom_logo', finalResult);
                } catch (error) {
                    console.error("Failed to save logo to local storage", error);
                    alert("Could not save logo permanently (storage full?), but it will display for this session.");
                }
            }
        };
        reader.readAsArrayBuffer(file);
    }
  };

  const handleResetLogo = () => {
      localStorage.removeItem('custom_logo');
      setLogoSrc('/logo.svg');
      setLogoLoadError(false);
      setLogoKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-[#fdfbf7]">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar / Logo Area */}
            <div className="w-full md:w-64 flex-shrink-0 flex flex-col items-center">
                <div className="bg-gray-800/50 p-4 rounded-xl mb-4 w-full flex justify-center items-center min-h-[200px]">
                    {/* Key prop forces re-mount on change. onError handles broken images. */}
                    <img 
                        key={logoKey}
                        src={logoSrc} 
                        alt="Producer Logo" 
                        className="h-40 w-auto object-contain transition-opacity duration-300"
                        onError={(e) => {
                            console.error("Image load error", e);
                            if (!logoLoadError) {
                                setLogoLoadError(true);
                                // If custom logo fails, maybe fall back or just show text? 
                                // Usually we don't auto-revert to prevent loops, but we can show a placeholder.
                            }
                        }}
                        style={{ display: logoLoadError ? 'none' : 'block' }}
                    />
                    {logoLoadError && (
                        <div className="text-red-400 text-center text-sm">
                            <p>Failed to load logo.</p>
                            <button onClick={handleResetLogo} className="underline mt-2">Reset to Default</button>
                        </div>
                    )}
                </div>
                
                {/* Producer Login / Logo Controls */}
                {!isProducerAuthenticated ? (
                    <form onSubmit={handleLogin} className="w-full space-y-2">
                        <input 
                            type="password" 
                            value={passwordInput}
                            onChange={(e) => setPasswordInput(e.target.value)}
                            placeholder="Producer Password"
                            className="w-full px-3 py-2 border border-stone-300 rounded-md text-sm"
                        />
                        <button type="submit" className="w-full bg-stone-800 text-white py-2 rounded-md text-sm font-medium hover:bg-stone-700 transition-colors">
                            Producer Login
                        </button>
                        {authError && <p className="text-xs text-red-600 text-center">{authError}</p>}
                    </form>
                ) : (
                    <div className="w-full space-y-2 animate-fadeIn">
                        <div className="bg-green-100 text-green-800 px-3 py-2 rounded-md text-xs text-center font-semibold border border-green-200 mb-4">
                            Producer Mode Active
                        </div>
                        
                        <input 
                            type="file" 
                            accept=".svg, .png, .jpg, .jpeg" 
                            ref={logoInputRef}
                            className="hidden"
                            onChange={handleLogoUpload}
                        />
                        <button 
                            onClick={() => logoInputRef.current?.click()}
                            className="w-full bg-blue-600 text-white py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                            Change Logo
                        </button>
                         <button 
                            onClick={handleResetLogo}
                            className="w-full bg-white text-stone-600 border border-stone-300 py-2 rounded-md text-sm font-medium hover:bg-stone-50 transition-colors"
                        >
                            Reset Default Logo
                        </button>
                    </div>
                )}
            </div>

            {/* Main Content */}
            <div className="flex-1">
                {/* Tabs */}
                <div className="flex border-b border-stone-200 mb-6">
                    <button
                        className={`py-2 px-4 font-medium text-sm focus:outline-none ${activeTab === 'create' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-stone-500 hover:text-stone-700'}`}
                        onClick={() => setActiveTab('create')}
                    >
                        Create / Import Profile
                    </button>
                    <button
                        className={`py-2 px-4 font-medium text-sm focus:outline-none ${activeTab === 'community' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-stone-500 hover:text-stone-700'}`}
                        onClick={() => setActiveTab('community')}
                    >
                        Download Profiles
                    </button>
                </div>

                {activeTab === 'create' ? (
                    <CreateProfileForm onShare={addProfileToCommunity} />
                ) : (
                    <CommunityProfiles profiles={communityProfiles} isLoading={isLoadingProfiles} />
                )}
            </div>
        </div>
      </main>
      
      <footer className="bg-white border-t border-stone-200 mt-12 py-8">
          <div className="max-w-7xl mx-auto px-4 text-center text-stone-400 text-sm">
              &copy; {new Date().getFullYear()} PrintProfiles.Org. All rights reserved.
          </div>
      </footer>
    </div>
  );
};

export default App;
