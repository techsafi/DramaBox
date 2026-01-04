
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0a]">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-zinc-800 border-t-red-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 bg-red-600/20 rounded-full animate-pulse"></div>
          </div>
        </div>
        <p className="mt-8 text-zinc-500 font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">Initializing Streams...</p>
      </div>
    );
  }

  const featured = categories[0]?.movies[0];

  return (
    <div className="bg-[#0a0a0a] min-h-screen">
      {/* Cinematic Hero */}
      {featured && (
        <div className="relative h-[85vh] w-full overflow-hidden">
          <img 
            src={featured.thumbnail} 
            alt={featured.title} 
            className="w-full h-full object-cover brightness-[0.3] scale-110 animate-slow-zoom"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-transparent to-transparent opacity-80"></div>
          
          <div className="absolute bottom-24 left-6 md:left-16 max-w-3xl">
            <div className="flex items-center gap-4 mb-6">
              <span className="bg-red-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg shadow-red-900/40">
                Featured Cinema
              </span>
              <div className="flex items-center gap-1">
                 <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                 <span className="text-zinc-400 text-[10px] font-black uppercase tracking-widest">Active Server</span>
              </div>
            </div>
            
            <h1 className="text-6xl md:text-9xl font-black mb-6 tracking-tighter leading-none italic uppercase">
              {featured.title}
            </h1>
            
            <p className="text-zinc-400 text-sm md:text-xl mb-10 line-clamp-3 max-w-xl font-medium leading-relaxed italic border-l-2 border-red-600 pl-6">
              {featured.description}
            </p>
            
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={() => window.location.href = `#/movie/${featured.id}`}
                className="group px-10 py-4 bg-white text-black font-black rounded-2xl hover:bg-red-600 hover:text-white transition-all duration-500 flex items-center gap-3 shadow-2xl shadow-white/5"
              >
                <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current group-hover:scale-125 transition-transform"><path d="M8 5v14l11-7z"/></svg>
                <span className="uppercase tracking-widest text-xs">Play Now</span>
              </button>
              
              <button className="px-10 py-4 bg-zinc-900/60 backdrop-blur-2xl text-white font-black rounded-2xl border border-white/5 hover:bg-zinc-800 transition-all uppercase tracking-widest text-xs">
                Add to List
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rows */}
      <div className="relative -mt-32 z-20 space-y-16 pb-32">
        {categories.map((cat, idx) => (
          <section key={idx} className="pl-6 md:pl-16">
            <div className="flex items-center justify-between pr-6 md:pr-16 mb-8">
              <h2 className="text-2xl md:text-3xl font-black tracking-tighter italic uppercase flex items-center gap-4">
                {cat.title}
                <span className="w-12 h-1 bg-red-600 rounded-full"></span>
              </h2>
              <button className="text-[10px] font-black text-zinc-500 hover:text-white uppercase tracking-[0.3em] transition-colors">
                View All
              </button>
            </div>
            
            <div className="flex gap-6 overflow-x-auto pb-10 scrollbar-hide snap-x no-scrollbar pr-12">
              {cat.movies.map((movie) => (
                <div key={movie.id} className="flex-shrink-0 w-44 md:w-60 snap-start">
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
        @keyframes slow-zoom {
          0% { transform: scale(1.1); }
          100% { transform: scale(1.0); }
        }
        .animate-slow-zoom { animation: slow-zoom 20s ease-out infinite alternate; }
      `}</style>
    </div>
  );
};

export default Home;
