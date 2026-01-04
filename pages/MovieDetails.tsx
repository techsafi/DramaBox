
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMovieById, getStreamData } from '../services/api';
import { Movie, StreamData } from '../types';

const MovieDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeEpisode, setActiveEpisode] = useState(1);
  const [streamData, setStreamData] = useState<StreamData | null>(null);
  const [isPlayerLoading, setIsPlayerLoading] = useState(false);
  const [isTheaterMode, setIsTheaterMode] = useState(false);

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
      const data = await getStreamData(movie, activeEpisode);
      setStreamData(data);
      setIsPlayerLoading(false);
    };
    fetchStream();
  }, [id, activeEpisode, movie]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!movie) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black">
      <h2 className="text-2xl font-bold mb-4">Content not available</h2>
      <button onClick={() => navigate('/')} className="bg-red-600 px-8 py-3 rounded-full font-bold">Return Home</button>
    </div>
  );

  const episodeCount = movie.episodes || 1;
  const episodes = Array.from({ length: Math.min(episodeCount, 100) }, (_, i) => i + 1);

  return (
    <div className={`min-h-screen transition-colors duration-700 ${isTheaterMode ? 'bg-black' : 'bg-[#050505]'} pb-20`}>
      {/* Player Frame */}
      <div className={`w-full transition-all duration-500 relative bg-black shadow-2xl ${isTheaterMode ? 'max-w-full' : 'max-w-7xl mx-auto md:mt-4 md:rounded-2xl'} aspect-video overflow-hidden`}>
        {isPlayerLoading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900/50 backdrop-blur-xl z-20">
            <div className="w-10 h-10 border-2 border-red-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-xs font-black text-zinc-400 tracking-widest uppercase animate-pulse">Establishing Stream...</p>
          </div>
        ) : streamData ? (
          streamData.isEmbed ? (
            <iframe 
              src={streamData.url}
              className="w-full h-full border-0"
              allowFullScreen
              allow="autoplay; encrypted-media"
            />
          ) : (
            <video 
              key={streamData.url}
              src={streamData.url}
              className="w-full h-full object-contain"
              controls
              autoPlay
              playsInline
            />
          )
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-500 bg-zinc-900 p-10 text-center">
             <svg className="w-16 h-16 mb-4 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
             </svg>
             <h3 className="text-white font-bold mb-2">Stream Offline</h3>
             <p className="text-sm max-w-xs text-zinc-500 mb-6">This content is currently undergoing maintenance or is unavailable in your region.</p>
             <button onClick={() => window.location.reload()} className="bg-zinc-800 hover:bg-zinc-700 px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all">Retry Server</button>
          </div>
        )}

        {/* Floating Controls */}
        <div className="absolute top-4 left-4 flex gap-2 z-30">
          <button onClick={() => navigate('/')} className="bg-black/50 backdrop-blur-xl p-3 rounded-full hover:bg-red-600 transition-all">
            <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-white fill-none" strokeWidth="3"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </button>
        </div>

        <div className="absolute top-4 right-4 flex gap-2 z-30 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={() => setIsTheaterMode(!isTheaterMode)} 
            className={`p-3 rounded-full backdrop-blur-xl transition-all ${isTheaterMode ? 'bg-red-600' : 'bg-black/50 hover:bg-zinc-700'}`}
            title="Theater Mode"
          >
            <svg className="w-5 h-5 fill-white" viewBox="0 0 20 20"><path d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm11 10H5V6h10v8z" /></svg>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <span className="bg-red-600 text-[10px] font-black px-2 py-1 rounded uppercase tracking-widest">
              {movie.id_archive ? "Classic Cinema" : `EP ${activeEpisode}`}
            </span>
            <div className="h-4 w-px bg-zinc-800"></div>
            <span className="text-zinc-400 text-sm font-bold">{movie.rating && `★ ${movie.rating}`}</span>
            <span className="text-zinc-500 text-sm">{movie.runtime || movie.year}</span>
            <div className="h-4 w-px bg-zinc-800"></div>
            <div className="flex gap-2">
              {Array.isArray(movie.genre) ? movie.genre.slice(0, 2).map(g => (
                <span key={g} className="text-[10px] border border-zinc-800 px-2 py-0.5 rounded text-zinc-400 uppercase font-black">{g}</span>
              )) : <span className="text-[10px] border border-zinc-800 px-2 py-0.5 rounded text-zinc-400 uppercase font-black">{movie.genre}</span>}
            </div>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black mb-8 tracking-tight">{movie.title}</h1>
          <p className="text-zinc-400 text-lg leading-relaxed mb-12 border-l-4 border-red-600 pl-6 py-2 bg-zinc-900/20 rounded-r-xl">
            {movie.description}
          </p>

          {episodes.length > 1 && (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-black italic tracking-tighter">EPISODES</h3>
                <span className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em]">{episodes.length} IN SEASON</span>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-10 gap-2">
                {episodes.map(num => (
                  <button
                    key={num}
                    onClick={() => {
                      setActiveEpisode(num);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`h-12 flex items-center justify-center rounded-lg font-black text-sm transition-all border ${
                      activeEpisode === num 
                      ? 'bg-red-600 border-red-600 text-white' 
                      : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-500'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
           <div className="bg-zinc-900/40 border border-zinc-800/50 p-6 rounded-3xl backdrop-blur-xl">
              <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-6">Server Statistics</h4>
              <div className="space-y-4">
                 <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-500 font-bold uppercase">Latency</span>
                    <span className="text-green-500 font-black">24ms</span>
                 </div>
                 <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 w-[95%]"></div>
                 </div>
                 <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-500 font-bold uppercase">Bandwidth</span>
                    <span className="text-zinc-300 font-black">1080p Ultra</span>
                 </div>
                 <button className="w-full mt-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all">
                    Switch Source
                 </button>
              </div>
           </div>

           <div className="relative overflow-hidden rounded-3xl group">
              <img src={movie.thumbnail} className="w-full aspect-[4/5] object-cover brightness-50 group-hover:scale-110 transition-transform duration-700" alt="" />
              <div className="absolute inset-0 p-8 flex flex-col justify-end bg-gradient-to-t from-black via-black/20 to-transparent">
                 <h4 className="text-2xl font-black mb-2 line-clamp-2 italic">{movie.title}</h4>
                 <div className="flex gap-2">
                    <button className="flex-1 py-3 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-xl">Add to List</button>
                    <button className="p-3 bg-zinc-900/80 backdrop-blur-xl rounded-xl">
                       <svg className="w-4 h-4 fill-white" viewBox="0 0 20 20"><path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" /></svg>
                    </button>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetails;
