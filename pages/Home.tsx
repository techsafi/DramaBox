
import React, { useState, useEffect } from 'react';
import { getMovieCategories } from '../services/api';
import { Category } from '../types';
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
        <div className="w-20 h-20 border-4 border-zinc-800 border-t-red-600 rounded-full animate-spin"></div>
        <p className="mt-10 text-zinc-600 font-black uppercase tracking-[0.5em] text-[10px] animate-pulse">Establishing Playback Nodes...</p>
      </div>
    );
  }

  const featured = categories[0]?.movies[0];

  return (
    <div className="bg-[#0a0a0a] min-h-screen">
      {/* Dynamic Hero */}
      {featured && (
        <div className="relative h-[95vh] w-full overflow-hidden">
          <img 
            src={featured.thumbnail} 
            alt={featured.title} 
            className="w-full h-full object-cover brightness-[0.25] scale-110 animate-ken-burns"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent"></div>
          
          <div className="absolute bottom-32 left-8 md:left-20 max-w-5xl">
            <div className="flex items-center gap-6 mb-10">
              <span className="bg-red-600 text-[11px] font-black px-5 py-2 rounded-full uppercase tracking-[0.3em] shadow-2xl shadow-red-900/50">
                Top Rated Premiere
              </span>
              <div className="flex items-center gap-2">
                 <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.8)]"></div>
                 <span className="text-zinc-400 text-[10px] font-black uppercase tracking-[0.3em]">Direct-Play Verified</span>
              </div>
            </div>
            
            <h1 className="text-7xl md:text-[11rem] font-black mb-10 tracking-tighter leading-[0.85] italic uppercase">
              {featured.title}
            </h1>
            
            <p className="text-zinc-400 text-lg md:text-3xl mb-14 line-clamp-2 max-w-3xl font-medium italic border-l-4 border-red-600 pl-10 opacity-80">
              {featured.description}
            </p>
            
            <div className="flex flex-wrap gap-6">
              <button 
                onClick={() => window.location.href = `#/movie/${featured.id}`}
                className="group px-14 py-6 bg-white text-black font-black rounded-3xl hover:bg-red-600 hover:text-white transition-all duration-700 flex items-center gap-4 shadow-3xl"
              >
                <svg viewBox="0 0 24 24" className="w-8 h-8 fill-current group-hover:scale-125 transition-transform"><path d="M8 5v14l11-7z"/></svg>
                <span className="uppercase tracking-[0.3em] text-xs">Watch Premium</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Categorized Rows */}
      <div className="relative -mt-40 z-20 space-y-32 pb-40">
        {categories.map((cat, idx) => (
          <section key={idx} className="pl-8 md:pl-20">
            <div className="flex items-center gap-8 pr-8 md:pr-20 mb-12">
              <h2 className="text-3xl md:text-5xl font-black tracking-tighter italic uppercase whitespace-nowrap">
                {cat.title}
              </h2>
              <div className="w-full h-px bg-zinc-900"></div>
              <button className="text-[10px] font-black text-zinc-700 hover:text-white uppercase tracking-[0.5em] transition-colors">
                Explore
              </button>
            </div>
            
            <div className="flex gap-10 overflow-x-auto pb-16 scrollbar-hide snap-x no-scrollbar pr-20">
              {cat.movies.map((movie) => (
                <div key={movie.id} className="flex-shrink-0 w-60 md:w-80 snap-start">
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
        @keyframes ken-burns {
          0% { transform: scale(1.1) translate(0, 0); }
          100% { transform: scale(1.0) translate(-2%, -1%); }
        }
        .animate-ken-burns { animation: ken-burns 30s ease-out infinite alternate; }
      `}</style>
    </div>
  );
};

export default Home;
