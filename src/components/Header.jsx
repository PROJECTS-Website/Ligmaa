// src/components/Header/Header.jsx (Example)
import React from 'react';
import { Link } from 'react-router-dom';
import SearchBar from './SearchBar'; // Import SearchBar

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-brand-bg/80 backdrop-blur-md shadow-md">
      <div className="container max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold text-brand-yellow">
          MovieApp
        </Link>

        {/* Desktop Search Bar */}
        <div className="hidden md:flex justify-center flex-grow px-4">
          <SearchBar />
        </div>

        {/* Mobile: You might want a different search icon that expands into the SearchBar,
            or place the SearchBar below the header on mobile in HomePage */}
        <div className="md:hidden">
          {/* Mobile menu icon or search icon could go here */}
        </div>
      </div>
      {/* Mobile Search Bar (could be conditionally rendered or always visible below header) */}
      <div className="md:hidden px-4 pb-3 pt-1 flex justify-center max-w-1/2">
        <SearchBar />
      </div>
    </header>
  );
};

export default Header;
