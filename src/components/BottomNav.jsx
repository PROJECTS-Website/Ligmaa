// src/components/BottomNav/BottomNav.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { HomeIcon, SearchIcon, MovieIcon } from './icons'; // Your icon components

const navItems = [
  { path: '/', label: 'Home', icon: HomeIcon },
  { path: '/search', label: 'Search', icon: SearchIcon },
  { path: '/explore/movie', label: 'Movies', icon: MovieIcon },
];

const BottomNav = () => {
  return (
    <nav className="fixed bottom-2 left-0 right-0 bg-black/30 border-t border-zinc-700/50 shadow-t-lg z-50 md:hidden backdrop-blur-md w-[95%] mx-auto rounded-full">
      <div className="max-w-md mx-auto flex justify-around items-center h-16">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center space-y-1 p-2 w-1/3
               ${
                 isActive
                   ? 'text-brand-yellow'
                   : 'text-brand-text-secondary hover:text-brand-text-primary'
               }`
            }
          >
            <item.icon className="w-6 h-6" />
            <span className="text-xs">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
