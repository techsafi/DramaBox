
import React, { useState, useEffect } from 'react';
import { getMovieCategories } from '../services/api';
import { Category, Movie } from '../types';
import MovieCard from '../components/MovieCard';

const Home: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const data = await getMovieCategories();
      setCategories(data);
      setLoading(false);
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-zinc-500 font-bold uppercase tracking-widest text-xs">Curating your theater...</p>
      </div>
    );
  }

  const featured = categories[0]?.movies[0];

  return (
    <div className="bg-[#0a0a0a] min-h-screen">
      {/* Hero Highlight */}
      {featured && (
        <div className="relative h-[80vh] w-full group">
          <img 
            src={featured.thumbnail} 
            alt={featured.title} 
            className="w-full h-full object-cover brightness-[0.4] transition-transform duration-1000 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/20 to-transparent"></div>
          
          <div className="absolute bottom-20 left-4 md:left-12 max-w-2xl">
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-red-600 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Dramabox Original</span>
              <span className="text-zinc-400 text-xs">Trending #1 Today</span>
            </div>
            <h1 className="text-5xl md:text-8xl font-black mb-6 tracking-tighter leading-none italic">{featured.title}</h1>
            <p className="text-zinc-300 text-sm md:text-lg mb-8 line-clamp-3 md:line-clamp-none max-w-xl">
              {featured.description || "An exclusive Dramabox production that pushes the boundaries of storytelling. Experience intense drama, breathtaking visuals, and a narrative that will keep you guessing until the very last episode."}
            </p>
            <div className="flex gap-4">
              <button className="px-8 py-3 bg-white text-black font-black rounded-lg hover:bg-zinc-200 transition-all flex items-center gap-2">
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M8 5v14l11-7z"/></svg>
                Watch Now
              </button>
              <button className="px-8 py-3 bg-zinc-800/80 backdrop-blur-md text-white font-black rounded-lg hover:bg-zinc-700 transition-all flex items-center gap-2">
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4m0-4h.01"/></svg>
                Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category Rows */}
      <div className="relative -mt-16 z-10 space-y-12 pb-20">
        {categories.map((cat, idx) => (
          <section key={idx} className="pl-4 md:pl-12">
            <h2 className="text-xl md:text-2xl font-bold mb-4 tracking-tight text-zinc-100 flex items-center gap-3">
              {cat.title}
              <span className="h-[2px] w-8 bg-red-600 rounded-full"></span>
            </h2>
            <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide snap-x no-scrollbar pr-12">
              {cat.movies.map((movie) => (
                <div key={movie.id} className="flex-shrink-0 w-36 md:w-48 snap-start">
                  <MovieCard movie={movie} />
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
      
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default Home;
