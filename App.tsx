
import React, { useState, useEffect, useRef } from 'react';
import { FilamentProfile } from './types';
import { PRESET_PROFILES } from './constants';
import Header from './components/Header';
import CreateProfileForm from './components/CreateProfileForm';
import CommunityProfiles from './components/CommunityProfiles';

type Tab = 'community' | 'create';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('community');
  const [communityProfiles, setCommunityProfiles] = useState<FilamentProfile[]>([]);
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(true);

  // Authentication State (For Creating Profiles & Admin Tasks)
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');

  // Logo State (App Branding)
  const [logoSrc, setLogoSrc] = useState<string>(() => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('custom_app_logo') || '/logo.svg';
    }
    return '/logo.svg';
  });
  // Force re-render of image when updated
  const [logoKey, setLogoKey] = useState(0);
  const logoInputRef = useRef<HTMLInputElement>(null);

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

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === 'PrintProfiles.Org') {
        setIsAuthenticated(true);
        setAuthError('');
        setPasswordInput('');
    } else {
        setAuthError('Incorrect password.');
    }
  };

  const handleLogout = () => {
      setIsAuthenticated(false);
      setActiveTab('community');
  };

  const handleAppLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // Reset input

    if (file) {
        if (file.size > 2 * 1024 * 1024) {
            alert("File is too large. Max 2MB.");
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const buffer = event.target?.result;
            if (buffer instanceof ArrayBuffer) {
                let binary = '';
                const bytes = new Uint8Array(buffer);
                const len = bytes.byteLength;
                for (let i = 0; i < len; i++) {
                    binary += String.fromCharCode(bytes[i]);
                }
                const base64 = window.btoa(binary);

                const ext = file.name.split('.').pop()?.toLowerCase();
                let mimeType = 'image/png'; 
                if (ext === 'svg') mimeType = 'image/svg+xml';
                else if (ext === 'jpg' || ext === 'jpeg') mimeType = 'image/jpeg';

                const finalResult = `data:${mimeType};base64,${base64}`;

                try {
                     localStorage.removeItem('custom_app_logo');
                } catch (e) { /* ignore */ }

                setLogoSrc(finalResult);
                setLogoKey(prev => prev + 1);
                
                try {
                    localStorage.setItem('custom_app_logo', finalResult);
                } catch (error) {
                    alert("Could not save logo permanently (storage full?), but it will display for this session.");
                }
            }
        };
        reader.readAsArrayBuffer(file);
    }
  };

  const handleResetLogo = () => {
      if(confirm("Reset app logo to default?")) {
        localStorage.removeItem('custom_app_logo');
        setLogoSrc('/logo.svg');
        setLogoKey(prev => prev + 1);
      }
  };

  return (
    <div className="min-h-screen bg-[#fdfbf7]">
      <Header logoSrc={`${logoSrc}${logoSrc.startsWith('data:') ? '' : `?v=${logoKey}`}`} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Tabs */}
        <div className="flex justify-center mb-8">
            <div className="flex bg-white p-1 rounded-xl border border-stone-200 shadow-sm">
                <button
                    className={`py-2 px-6 font-medium text-sm rounded-lg transition-all duration-200 ${activeTab === 'community' ? 'bg-stone-800 text-white shadow-md' : 'text-stone-500 hover:text-stone-700 hover:bg-stone-50'}`}
                    onClick={() => setActiveTab('community')}
                >
                    Download Profiles
                </button>
                <button
                    className={`py-2 px-6 font-medium text-sm rounded-lg transition-all duration-200 flex items-center gap-2 ${activeTab === 'create' ? 'bg-stone-800 text-white shadow-md' : 'text-stone-500 hover:text-stone-700 hover:bg-stone-50'}`}
                    onClick={() => setActiveTab('create')}
                >
                    {!isAuthenticated && <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>}
                    Producer Area
                </button>
            </div>
        </div>

        <div className="animate-fadeIn">
            {activeTab === 'community' ? (
                <CommunityProfiles profiles={communityProfiles} isLoading={isLoadingProfiles} />
            ) : (
                /* Protected Create / Admin Area */
                <div className="max-w-4xl mx-auto">
                    {!isAuthenticated ? (
                         <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-sm border border-stone-200 mt-10 text-center">
                            <div className="mb-6">
                                <div className="h-12 w-12 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-stone-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                </div>
                                <h2 className="text-xl font-bold text-stone-800">Restricted Access</h2>
                                <p className="text-stone-500 text-sm mt-2">Please enter the password to access the Producer and Admin settings.</p>
                            </div>
                            <form onSubmit={handleLogin} className="space-y-4">
                                <input 
                                    type="password" 
                                    value={passwordInput}
                                    onChange={(e) => setPasswordInput(e.target.value)}
                                    placeholder="Enter Password"
                                    className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-stone-500 outline-none transition-all"
                                />
                                {authError && <p className="text-red-500 text-xs">{authError}</p>}
                                <button type="submit" className="w-full bg-stone-800 text-white py-2.5 rounded-lg font-medium hover:bg-stone-700 transition-colors">
                                    Unlock Access
                                </button>
                            </form>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {/* Admin Toolbar */}
                            <div className="bg-stone-800 text-stone-200 p-4 rounded-lg flex flex-wrap items-center justify-between gap-4 shadow-md">
                                <div className="flex items-center gap-2">
                                    <span className="bg-green-500 h-2 w-2 rounded-full animate-pulse"></span>
                                    <span className="text-sm font-semibold tracking-wide text-white">ADMIN MODE ACTIVE</span>
                                </div>
                                <div className="flex gap-3">
                                    <input 
                                        type="file" 
                                        accept=".svg, .png, .jpg" 
                                        ref={logoInputRef}
                                        className="hidden"
                                        onChange={handleAppLogoUpload}
                                    />
                                    <button 
                                        onClick={() => logoInputRef.current?.click()}
                                        className="text-xs bg-stone-700 hover:bg-stone-600 text-white px-3 py-1.5 rounded border border-stone-600 transition-colors"
                                    >
                                        Change App Logo
                                    </button>
                                     <button 
                                        onClick={handleResetLogo}
                                        className="text-xs bg-stone-700 hover:bg-stone-600 text-white px-3 py-1.5 rounded border border-stone-600 transition-colors"
                                    >
                                        Reset Logo
                                    </button>
                                    <button 
                                        onClick={handleLogout}
                                        className="text-xs bg-red-900/50 hover:bg-red-900 text-red-100 px-3 py-1.5 rounded border border-red-900 transition-colors"
                                    >
                                        Logout
                                    </button>
                                </div>
                            </div>

                            {/* The Create Form */}
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200">
                                <CreateProfileForm onShare={addProfileToCommunity} />
                            </div>
                        </div>
                    )}
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
