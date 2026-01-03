
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { searchMovies } from '../services/api';
import { SearchResult } from '../types';

const Navbar: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length > 2) {
        setIsSearching(true);
        const res = await searchMovies(query);
        setResults(res.slice(0, 5));
        setIsSearching(false);
        setShowDropdown(true);
      } else {
        setResults([]);
        setShowDropdown(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (bookId: string) => {
    setQuery('');
    setShowDropdown(false);
    navigate(`/movie/${bookId}`);
  };

  return (
    <nav className="sticky top-0 z-[100] bg-black/80 backdrop-blur-md border-b border-zinc-800 px-4 md:px-8 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <Link to="/" className="flex-shrink-0 flex items-center gap-2">
          <span className="text-xl md:text-2xl font-extrabold tracking-tighter text-red-600 uppercase">
            Drama<span className="text-white">box</span>
          </span>
        </Link>
        
        <div className="flex-grow max-w-md relative" ref={searchRef}>
          <div className="relative group">
            <input 
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search dramas, movies..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all"
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 absolute left-3 top-2.5 text-zinc-500 group-focus-within:text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {isSearching && (
              <div className="absolute right-3 top-2.5">
                <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>

          {showDropdown && results.length > 0 && (
            <div className="absolute top-full mt-2 w-full bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden z-[110]">
              {results.map((res) => (
                <button
                  key={res.bookId}
                  onClick={() => handleSelect(res.bookId)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-zinc-800 transition-colors text-left border-b border-zinc-800 last:border-0"
                >
                  <img src={res.thumbnail} alt="" className="w-10 h-14 object-cover rounded" />
                  <div>
                    <p className="text-sm font-bold text-white line-clamp-1">{res.title}</p>
                    <p className="text-xs text-zinc-500">{res.metadata || 'Drama'}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="hidden lg:flex items-center gap-6 text-xs font-bold uppercase tracking-widest text-zinc-400">
          <Link to="/" className="hover:text-white transition-colors">Movies</Link>
          <Link to="/" className="hover:text-white transition-colors">TV Shows</Link>
        </div>

        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-xs font-bold shadow-lg shadow-red-900/20 cursor-pointer">
          JD
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
