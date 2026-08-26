
import React from 'react';

interface HeaderProps {
  logoSrc: string;
}

const Header: React.FC<HeaderProps> = ({ logoSrc }) => {
  return (
    <header className="bg-black/40 backdrop-blur-md border-b border-white/10 sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center gap-4">
            {/* Logo */}
            <img 
              src={logoSrc} 
              alt="FilamentProfiles.Org" 
              className="h-12 w-auto object-contain invert opacity-90"
            />
            
            <div className="flex flex-col justify-center">
                <span className="text-xl font-bold text-stone-50 tracking-tight leading-none">
                    FilamentProfiles.Org
                </span>
                <span className="text-[10px] sm:text-xs text-stone-400 font-medium mt-1 leading-tight max-w-[220px] sm:max-w-md">
                    The largest repository of FDM 3D printing filament profiles
                </span>
            </div>
          </div>
          <div className="text-xs text-stone-500 font-mono hidden md:block">
            v1.2.0
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
