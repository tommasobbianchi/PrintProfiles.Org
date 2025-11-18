
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-gray-800/50 backdrop-blur-sm shadow-lg sticky top-0 z-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-400 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22.844a2.5 2.5 0 0 0 2.5-2.5v-5.688a1 1 0 0 1 .4-.8l2.6-2.6a1 1 0 0 0 0-1.414l-8-8a1 1 0 0 0-1.414 0l-8 8a1 1 0 0 0 0 1.414l2.6 2.6a1 1 0 0 1 .4.8v5.688a2.5 2.5 0 0 0 2.5 2.5h4.844Z"/><path d="m12 11.156 6 6"/><path d="m12 11.156-6 6"/><path d="M12 2.844V20.344"/></svg>
            <h1 className="text-xl font-bold text-white">Slicer Profile Generator</h1>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
