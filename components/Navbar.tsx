
import React from 'react';
import { Link } from 'react-router-dom';

const Navbar: React.FC = () => {
  return (
    <nav className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-zinc-800 px-4 md:px-8 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl font-extrabold tracking-tighter text-red-600 uppercase">
            Drama<span className="text-white">box</span>
          </span>
        </Link>
        
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
          <Link to="/" className="hover:text-white transition-colors">Home</Link>
          <button className="hover:text-white transition-colors">Movies</button>
          <button className="hover:text-white transition-colors">TV Shows</button>
          <button className="hover:text-white transition-colors">New & Popular</button>
        </div>

        <div className="flex items-center gap-4">
          <button className="text-zinc-400 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
          <div className="w-8 h-8 rounded bg-red-600 flex items-center justify-center text-xs font-bold">
            JD
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
