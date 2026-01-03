
import React, { useState, useEffect } from 'react';
import { getMovies } from '../services/api';
import { Movie } from '../types';
import MovieCard from '../components/MovieCard';

const Home: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        const data = await getMovies();
        setMovies(data);
        setError(null);
      } catch (err) {
        setError('Failed to load movies. Please check your connection or try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-zinc-400 font-medium animate-pulse">Setting the stage...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center">
        <div className="text-red-600 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Oops! Something went wrong</h2>
        <p className="text-zinc-400 max-w-md mb-6">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors font-bold"
        >
          Try Again
        </button>
      </div>
    );
  }

  const featuredMovie = movies[0];

  return (
    <div className="pb-20">
      {/* Hero Section */}
      {featuredMovie && (
        <div className="relative h-[70vh] w-full overflow-hidden mb-12">
          <img 
            src={featuredMovie.thumbnail || featuredMovie.poster || 'https://picsum.photos/1920/1080?grayscale'} 
            className="w-full h-full object-cover brightness-[0.4]"
            alt="Featured Content"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
          
          <div className="absolute bottom-16 left-4 md:left-12 max-w-2xl px-4">
            <span className="text-red-600 font-extrabold tracking-widest text-xs uppercase mb-4 block">Recommended for you</span>
            <h1 className="text-4xl md:text-7xl font-extrabold mb-4 leading-tight">{featuredMovie.title}</h1>
            <p className="text-zinc-300 text-sm md:text-lg mb-8 line-clamp-3">
              {featuredMovie.description || featuredMovie.overview || "Discover an epic journey through time and space in this latest cinematic masterpiece exclusively on Dramabox."}
            </p>
            <div className="flex flex-wrap gap-4">
              <button className="px-8 py-3 bg-white text-black font-bold rounded flex items-center gap-2 hover:bg-zinc-200 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 fill-current" viewBox="0 0 20 20">
                  <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.841z" />
                </svg>
                Watch Now
              </button>
              <button className="px-8 py-3 bg-zinc-600/50 backdrop-blur-md text-white font-bold rounded flex items-center gap-2 hover:bg-zinc-600 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                More Info
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Movie Grid */}
      <section className="px-4 md:px-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold tracking-tight">Popular on Dramabox</h2>
          <div className="flex gap-2">
             <button className="w-8 h-8 rounded-full border border-zinc-700 flex items-center justify-center hover:bg-white hover:text-black transition-colors">
                &larr;
             </button>
             <button className="w-8 h-8 rounded-full border border-zinc-700 flex items-center justify-center hover:bg-white hover:text-black transition-colors">
                &rarr;
             </button>
          </div>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      </section>

      {/* Category Section (Simulated) */}
      <section className="px-4 md:px-12 mt-20">
        <h2 className="text-2xl font-bold tracking-tight mb-8">New Releases</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {movies.slice().reverse().slice(0, 6).map((movie) => (
            <MovieCard key={`rev-${movie.id}`} movie={movie} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
