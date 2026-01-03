
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getMovieById } from '../services/api';
import { Movie } from '../types';

const MovieDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchMovie = async () => {
      if (id) {
        setLoading(true);
        const data = await getMovieById(id);
        setMovie(data);
        setLoading(false);
      }
    };
    fetchMovie();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 text-center">
        <h2 className="text-3xl font-bold mb-4">Movie not found</h2>
        <p className="text-zinc-500 mb-8">The story you're looking for seems to have ended or moved.</p>
        <Link to="/" className="px-8 py-3 bg-red-600 text-white font-bold rounded-full">
          Back to Home
        </Link>
      </div>
    );
  }

  const genreString = Array.isArray(movie.genre) ? movie.genre.join(', ') : movie.genre;

  return (
    <div className="min-h-screen pb-20">
      {/* Background/Backdrop */}
      <div className="relative h-[50vh] md:h-[70vh] w-full overflow-hidden">
        <img 
          src={movie.thumbnail || movie.poster || `https://picsum.photos/seed/${movie.id}/1200/800`} 
          className="w-full h-full object-cover brightness-[0.3] scale-105 blur-sm"
          alt=""
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
        
        {/* Header content overlay */}
        <div className="absolute bottom-0 left-0 w-full p-4 md:p-12">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8 items-end md:items-center">
            {/* Poster image */}
            <div className="w-40 md:w-64 flex-shrink-0 shadow-2xl rounded-lg overflow-hidden border-2 border-zinc-800 -mb-20 md:-mb-32 relative z-10">
              <img 
                src={movie.thumbnail || movie.poster || `https://picsum.photos/seed/${movie.id}/400/600`}
                className="w-full h-auto"
                alt={movie.title}
              />
            </div>
            
            <div className="flex-grow pb-4 md:pb-0">
              <button 
                onClick={() => navigate('/')}
                className="mb-6 flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm font-medium"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Home
              </button>
              
              <h1 className="text-4xl md:text-6xl font-black mb-4">{movie.title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm md:text-base font-medium">
                <span className="text-red-600">{movie.year || movie.release_year || '2024'}</span>
                <span className="text-zinc-500">•</span>
                <span className="text-zinc-300">{genreString}</span>
                <span className="px-2 py-0.5 border border-zinc-700 rounded text-xs text-zinc-400 uppercase">Ultra HD</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-12 mt-32 md:mt-48 flex flex-col lg:flex-row gap-12">
        <div className="lg:w-2/3">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            Overview
            <span className="h-1 w-12 bg-red-600 rounded-full inline-block"></span>
          </h2>
          <p className="text-zinc-300 text-lg leading-relaxed mb-10">
            {movie.description || movie.overview || "This masterpiece brings a unique perspective to the screen, blending stellar performances with an engaging narrative that captures the essence of the human spirit. A must-watch for all cinema enthusiasts."}
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 p-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl">
            <div>
              <p className="text-zinc-500 text-xs uppercase tracking-widest mb-1">Status</p>
              <p className="text-white font-medium">Released</p>
            </div>
            <div>
              <p className="text-zinc-500 text-xs uppercase tracking-widest mb-1">Country</p>
              <p className="text-white font-medium">International</p>
            </div>
            <div>
              <p className="text-zinc-500 text-xs uppercase tracking-widest mb-1">Original Language</p>
              <p className="text-white font-medium">English</p>
            </div>
            <div>
              <p className="text-zinc-500 text-xs uppercase tracking-widest mb-1">Runtime</p>
              <p className="text-white font-medium">2h 15m</p>
            </div>
            <div>
              <p className="text-zinc-500 text-xs uppercase tracking-widest mb-1">Budget</p>
              <p className="text-white font-medium">$12.5M</p>
            </div>
            <div>
              <p className="text-zinc-500 text-xs uppercase tracking-widest mb-1">Director</p>
              <p className="text-white font-medium">Drama Box Studios</p>
            </div>
          </div>
        </div>

        <div className="lg:w-1/3 flex flex-col gap-8">
           <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col gap-4">
              <h3 className="font-bold text-xl">Streaming Options</h3>
              <button className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-3">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 fill-current" viewBox="0 0 20 20">
                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.841z" />
                 </svg>
                 Play in HD
              </button>
              <button className="w-full py-4 border border-zinc-700 hover:bg-zinc-800 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-3">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                 </svg>
                 Download Offline
              </button>
           </div>
           
           <div className="flex flex-col gap-4">
              <h3 className="font-bold text-zinc-400 text-sm uppercase tracking-widest">Share</h3>
              <div className="flex gap-4">
                 <button className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center hover:bg-red-600 transition-colors">FB</button>
                 <button className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center hover:bg-red-600 transition-colors">TW</button>
                 <button className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center hover:bg-red-600 transition-colors">IG</button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetails;
