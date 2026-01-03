
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMovieById, getStreamUrl } from '../services/api';
import { Movie } from '../types';

const MovieDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeEpisode, setActiveEpisode] = useState(1);
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [isPlayerLoading, setIsPlayerLoading] = useState(false);

  useEffect(() => {
    const fetchMovie = async () => {
      if (!id) return;
      setLoading(true);
      const data = await getMovieById(id);
      setMovie(data);
      setLoading(false);
    };
    fetchMovie();
  }, [id]);

  useEffect(() => {
    const fetchStream = async () => {
      if (!id || !movie) return;
      setIsPlayerLoading(true);
      const url = await getStreamUrl(id, activeEpisode);
      setStreamUrl(url);
      setIsPlayerLoading(false);
    };
    fetchStream();
  }, [id, activeEpisode, movie]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!movie) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <h2 className="text-2xl font-bold">Show not found</h2>
      <button onClick={() => navigate('/')} className="bg-red-600 px-6 py-2 rounded-full font-bold">Go Home</button>
    </div>
  );

  // Generate episode numbers (default to 20 if API doesn't specify)
  const episodeCount = movie.episodes || 20;
  const episodes = Array.from({ length: episodeCount }, (_, i) => i + 1);

  return (
    <div className="min-h-screen bg-black pb-20">
      {/* Player Section */}
      <div className="w-full aspect-video bg-zinc-900 relative group">
        {isPlayerLoading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 z-20">
            <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin mb-2"></div>
            <p className="text-xs font-bold text-zinc-400">CONNECTING STREAM...</p>
          </div>
        ) : streamUrl ? (
          <iframe 
            src={streamUrl} 
            className="w-full h-full border-0" 
            allowFullScreen 
            title={`Episode ${activeEpisode}`}
            allow="autoplay; encrypted-media"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-zinc-500 font-bold p-10 text-center">
            UNABLE TO INITIALIZE STREAMING PLAYER.<br/>PLEASE TRY ANOTHER EPISODE OR REFRESH.
          </div>
        )}
        
        {/* Back Button Overlay */}
        <button 
          onClick={() => navigate('/')}
          className="absolute top-4 left-4 bg-black/50 backdrop-blur-md p-2 rounded-full hover:bg-red-600 transition-colors z-30"
        >
          <svg viewBox="0 0 24 24" className="w-6 h-6 fill-none stroke-white" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Info Column */}
        <div className="lg:col-span-2">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="text-red-600 font-black text-xs uppercase tracking-widest">Episode {activeEpisode}</span>
            <span className="text-zinc-600">•</span>
            <span className="text-zinc-400 text-sm">{movie.genre ? (Array.isArray(movie.genre) ? movie.genre[0] : movie.genre) : 'Drama'}</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black mb-6">{movie.title}</h1>
          <p className="text-zinc-400 leading-relaxed mb-10 text-lg">
            {movie.description || "The journey continues in this captivating episode. As tensions rise and secrets are revealed, the characters find themselves facing impossible choices that will change their lives forever."}
          </p>

          <div className="space-y-6">
            <h3 className="text-xl font-bold border-l-4 border-red-600 pl-4">Episodes</h3>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
              {episodes.map(num => (
                <button
                  key={num}
                  onClick={() => {
                    setActiveEpisode(num);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`aspect-square rounded-lg font-bold text-sm transition-all border ${
                    activeEpisode === num 
                    ? 'bg-red-600 border-red-600 text-white shadow-lg shadow-red-900/40 scale-110' 
                    : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-600 hover:text-white'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar / Metadata */}
        <div className="space-y-8">
           <div className="bg-zinc-900/50 rounded-2xl p-6 border border-zinc-800">
              <h4 className="text-xs font-black text-zinc-500 uppercase tracking-[0.2em] mb-4">Cast & Crew</h4>
              <div className="space-y-4">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-[10px]">DB</div>
                    <div>
                       <p className="text-sm font-bold">Dramabox Studios</p>
                       <p className="text-[10px] text-zinc-500 uppercase">Production</p>
                    </div>
                 </div>
              </div>
           </div>

           <div className="bg-gradient-to-br from-red-600/20 to-transparent p-6 rounded-2xl border border-red-600/20">
              <h4 className="font-bold mb-2">Subscribe to Premium</h4>
              <p className="text-xs text-zinc-400 mb-4">Unlock 4K streaming and offline downloads for all episodes.</p>
              <button className="w-full py-2 bg-red-600 rounded-lg font-bold text-sm hover:bg-red-700 transition-colors">Upgrade Now</button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetails;
