
import React from 'react';

interface HeaderProps {
  logoSrc: string;
}

const Header: React.FC<HeaderProps> = ({ logoSrc }) => {
  return (
    <header className="bg-[#fdfbf7]/95 backdrop-blur-sm shadow-sm border-b border-stone-200 sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center">
            {/* Logo replaces the text and icon */}
            <img 
              src={logoSrc} 
              alt="PrintProfiles.Org" 
              className="h-12 w-auto object-contain"
            />
          </div>
          <div className="text-xs text-stone-400 font-mono hidden sm:block">
            v1.2.0
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
