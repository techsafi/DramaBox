
import React, { useState, useEffect, useRef } from 'react';
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
  const videoRef = useRef<HTMLVideoElement>(null);

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
      // Skip if it's an external TVMaze show (they don't have free MP4 streams)
      if (id.startsWith('tvm-')) {
        setStreamUrl(null);
        return;
      }
      setIsPlayerLoading(true);
      const url = await getStreamUrl(id, activeEpisode);
      setStreamUrl(url);
      setIsPlayerLoading(false);
    };
    fetchStream();
  }, [id, activeEpisode, movie]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!movie) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <h2 className="text-2xl font-bold">Show not found</h2>
      <button onClick={() => navigate('/')} className="bg-red-600 px-6 py-2 rounded-full font-bold">Go Home</button>
    </div>
  );

  const isExternal = id?.startsWith('tvm-');
  const episodeCount = movie.episodes || (isExternal ? 1 : 20);
  const episodes = Array.from({ length: Math.min(episodeCount, 50) }, (_, i) => i + 1);

  return (
    <div className="min-h-screen bg-[#050505] pb-20">
      {/* Player Section */}
      <div className="w-full aspect-video bg-black relative group shadow-2xl overflow-hidden">
        {isPlayerLoading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900 z-20">
            <div className="w-10 h-10 border-2 border-red-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-sm font-bold text-zinc-400 tracking-widest uppercase animate-pulse">Initializing Stream...</p>
          </div>
        ) : streamUrl ? (
          <video 
            ref={videoRef}
            key={streamUrl}
            src={streamUrl}
            className="w-full h-full object-contain"
            controls
            autoPlay
            playsInline
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-500 bg-zinc-900 font-bold p-10 text-center">
            <div className="max-w-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-6 mx-auto opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <h2 className="text-white text-xl mb-2">
                {isExternal ? "Available on Official Network" : "Stream Unavailable"}
              </h2>
              <p className="text-sm font-normal text-zinc-400 mb-6">
                {isExternal 
                  ? "This title is provided for metadata purposes from the Global TV Database. Direct streaming is restricted to official broadcasting partners."
                  : "We encountered an issue connecting to the secure stream. Please try selecting a different episode or check back later."}
              </p>
              <button 
                onClick={() => isExternal ? window.open(`https://www.google.com/search?q=where+to+watch+${movie.title}`, '_blank') : window.location.reload()}
                className="bg-red-600 text-white px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest hover:bg-red-500 transition-all shadow-xl shadow-red-900/40"
              >
                {isExternal ? "Find Where to Watch" : "Retry Connection"}
              </button>
            </div>
          </div>
        )}
        
        {/* Back Button Overlay */}
        <button 
          onClick={() => navigate('/')}
          className="absolute top-4 left-4 bg-black/40 backdrop-blur-xl p-3 rounded-full hover:bg-red-600 transition-all z-30 group/back"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-white transition-transform group-hover/back:-translate-x-1" strokeWidth="3">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-10 grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <span className={`text-[10px] font-black px-2 py-1 rounded uppercase tracking-widest ${isExternal ? 'bg-zinc-800' : 'bg-red-600'}`}>
              {isExternal ? 'Global Catalog' : `Ep ${activeEpisode}`}
            </span>
            <div className="h-1 w-1 bg-zinc-700 rounded-full"></div>
            <span className="text-zinc-400 text-sm font-medium">
              {Array.isArray(movie.genre) ? movie.genre.join(', ') : (movie.genre || 'Drama')}
            </span>
            <div className="h-1 w-1 bg-zinc-700 rounded-full"></div>
            <span className="text-zinc-500 text-sm">{movie.year || '2024'}</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight leading-tight">{movie.title}</h1>
          
          <div className="bg-zinc-900/30 border border-zinc-800/50 p-6 rounded-2xl mb-12">
            <p className="text-zinc-300 leading-relaxed text-lg">
              {movie.description}
            </p>
          </div>

          {!isExternal && (
            <div className="space-y-8">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                <h3 className="text-xl font-bold flex items-center gap-3">
                  <span className="w-2 h-6 bg-red-600 rounded-full"></span>
                  Select Episode
                </h3>
                <span className="text-xs text-zinc-500 font-bold uppercase tracking-widest">{episodes.length} Episodes</span>
              </div>
              
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
                {episodes.map(num => (
                  <button
                    key={num}
                    onClick={() => {
                      setActiveEpisode(num);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`aspect-square flex items-center justify-center rounded-xl font-bold text-sm transition-all border ${
                      activeEpisode === num 
                      ? 'bg-red-600 border-red-600 text-white shadow-xl shadow-red-900/20 scale-105' 
                      : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-500 hover:text-white'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
           <div className="bg-zinc-900/50 rounded-2xl p-6 border border-zinc-800/50 backdrop-blur-sm">
              <h4 className="text-xs font-black text-zinc-500 uppercase tracking-[0.25em] mb-6">Production Credits</h4>
              <div className="space-y-6">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900 flex items-center justify-center text-xs font-bold text-white shadow-inner">
                      {isExternal ? "TVM" : "DB"}
                    </div>
                    <div>
                       <p className="text-sm font-bold text-zinc-100">{isExternal ? "External Provider" : "Dramabox Originals"}</p>
                       <p className="text-[10px] text-zinc-500 font-black uppercase">Executive Studio</p>
                    </div>
                 </div>
                 <div className="h-px bg-zinc-800"></div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <p className="text-[10px] text-zinc-500 font-black uppercase mb-1">Status</p>
                       <p className={`text-xs font-bold ${isExternal ? 'text-blue-500' : 'text-green-500'}`}>
                         {isExternal ? 'Imported' : 'Exclusive'}
                       </p>
                    </div>
                    <div>
                       <p className="text-[10px] text-zinc-500 font-black uppercase mb-1">Source</p>
                       <p className="text-xs font-bold text-zinc-100">{isExternal ? "TVMaze DB" : "Cloud Native"}</p>
                    </div>
                 </div>
              </div>
           </div>

           <div className="relative group overflow-hidden rounded-2xl bg-gradient-to-br from-red-600 to-red-900 p-px">
              <div className="bg-zinc-950 p-6 rounded-[15px] h-full flex flex-col items-start gap-4">
                <div className="bg-red-600 p-2 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-black text-lg text-white mb-2">Premium Pass</h4>
                  <p className="text-xs text-zinc-400 leading-relaxed">Remove all ads, access early releases, and stream in 4K resolution.</p>
                </div>
                <button className="w-full py-3 bg-red-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-red-500 transition-all shadow-lg shadow-red-900/20 active:scale-95">
                  Unlock Access
                </button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetails;
