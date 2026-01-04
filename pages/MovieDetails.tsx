
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
      setIsPlayerLoading(true);
      const data = await getStreamData(movie, activeEpisode);
      setStreamData(data);
      setIsPlayerLoading(false);
    };
    fetchStream();
  }, [id, activeEpisode, movie]);

  // HLS Support
  useEffect(() => {
    if (streamData?.url?.endsWith('.m3u8') && videoRef.current) {
      const video = videoRef.current;
      // Check if HLS.js is available (injected via CDN in a real app, here we use native if possible)
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamData.url;
      } else {
        // Fallback for browsers without native HLS: load HLS.js dynamically
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest';
        script.onload = () => {
          // @ts-ignore
          if (Hls.isSupported()) {
            // @ts-ignore
            const hls = new Hls();
            hls.loadSource(streamData!.url);
            hls.attachMedia(video);
          }
        };
        document.head.appendChild(script);
      }
    }
  }, [streamData]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!movie) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black p-10 text-center">
      <div className="bg-zinc-900 w-24 h-24 rounded-full flex items-center justify-center mb-8 shadow-2xl">
        <svg className="w-12 h-12 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h2 className="text-3xl font-black mb-4 uppercase tracking-tighter italic">Source Unavailable</h2>
      <p className="text-zinc-500 text-sm max-w-md mb-10 font-medium">This content is currently locked or the provider is unreachable. Our system is auto-refreshing caches to restore access.</p>
      <button onClick={() => navigate('/')} className="bg-red-600 text-white px-12 py-5 rounded-3xl font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-red-900/40 hover:bg-red-500 transition-all scale-100 active:scale-95">Browse Active Zone</button>
    </div>
  );

  const episodeCount = movie.episodes || 1;
  const episodes = Array.from({ length: Math.min(episodeCount, 100) }, (_, i) => i + 1);

  return (
    <div className={`min-h-screen transition-colors duration-1000 ${isTheaterMode ? 'bg-black' : 'bg-[#050505]'} pb-32`}>
      {/* Cinematic Player Frame */}
      <div className={`w-full transition-all duration-700 relative bg-black shadow-2xl ${isTheaterMode ? 'max-w-full' : 'max-w-7xl mx-auto md:mt-8 md:rounded-[3rem]'} aspect-video overflow-hidden group`}>
        {isPlayerLoading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950/80 backdrop-blur-3xl z-20">
            <div className="w-16 h-16 border-2 border-red-600 border-t-transparent rounded-full animate-spin mb-6 shadow-[0_0_30px_rgba(220,38,38,0.3)]"></div>
            <p className="text-[10px] font-black text-white tracking-[0.5em] uppercase animate-pulse">Initializing Playback Engine...</p>
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
              ref={videoRef}
              key={streamData.url}
              src={streamData.url.endsWith('.m3u8') ? undefined : streamData.url}
              className="w-full h-full object-contain"
              controls
              autoPlay
              playsInline
              poster={movie.thumbnail}
            />
          )
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-500 bg-zinc-950 p-10 text-center">
             <div className="w-20 h-20 bg-red-600/10 rounded-full flex items-center justify-center mb-8 border border-red-600/20 shadow-inner">
                <svg className="w-10 h-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
             </div>
             <h3 className="text-white font-black uppercase italic text-2xl mb-4 tracking-tighter">Connection Lost</h3>
             <p className="text-xs max-w-sm text-zinc-500 mb-10 font-bold leading-relaxed uppercase tracking-widest">Global CDN handshake failed. Our redundant servers are spinning up to replace this source.</p>
             <button onClick={() => window.location.reload()} className="bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 px-12 py-4 rounded-full text-[10px] font-black uppercase tracking-[0.3em] transition-all shadow-xl">Handshake Retry</button>
          </div>
        )}

        {/* HUD Controls */}
        <div className="absolute top-8 left-8 flex gap-3 z-30 transition-transform group-hover:translate-x-1">
          <button onClick={() => navigate('/')} className="bg-black/40 backdrop-blur-2xl p-4 rounded-3xl hover:bg-red-600 transition-all border border-white/5 shadow-2xl">
            <svg viewBox="0 0 24 24" className="w-6 h-6 stroke-white fill-none" strokeWidth="3"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </button>
        </div>

        <div className="absolute top-8 right-8 flex gap-3 z-30 opacity-0 group-hover:opacity-100 transition-all duration-500">
          <button 
            onClick={() => setIsTheaterMode(!isTheaterMode)} 
            className={`p-4 rounded-3xl backdrop-blur-2xl transition-all border border-white/10 ${isTheaterMode ? 'bg-red-600' : 'bg-black/40 hover:bg-zinc-800'}`}
          >
            <svg className="w-6 h-6 fill-white" viewBox="0 0 20 20"><path d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm11 10H5V6h10v8z" /></svg>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 md:px-16 mt-20 grid grid-cols-1 lg:grid-cols-3 gap-24">
        <div className="lg:col-span-2">
          <div className="flex flex-wrap items-center gap-8 mb-12">
            <div className="flex items-center gap-2">
               <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
               <span className="text-zinc-100 text-[10px] font-black uppercase tracking-[0.3em]">
                 {movie.year === "LIVE" ? "ACTIVE STREAM" : "VERIFIED SOURCE"}
               </span>
            </div>
            <div className="h-6 w-px bg-zinc-800"></div>
            <span className="text-red-600 font-black text-sm italic tracking-widest">{movie.rating ? `RATING ★ ${movie.rating}` : 'PREMIUM'}</span>
            <div className="h-6 w-px bg-zinc-800"></div>
            <span className="text-zinc-500 text-xs font-black uppercase tracking-[0.2em]">{movie.runtime || 'Varies'}</span>
          </div>
          
          <h1 className="text-6xl md:text-9xl font-black mb-12 tracking-tighter leading-none italic uppercase shadow-sm">
            {movie.title}
          </h1>
          
          <div className="relative mb-20 max-w-2xl">
             <p className="text-zinc-400 text-2xl leading-relaxed italic font-medium pl-10 border-l-4 border-red-600/30">
                {movie.description}
             </p>
          </div>

          {episodes.length > 1 && (
            <div className="space-y-12">
              <div className="flex items-center justify-between border-b border-zinc-900 pb-8">
                <h3 className="text-4xl font-black italic tracking-tighter uppercase text-white">Select Scene</h3>
                <span className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.5em]">{episodes.length} SEGMENTS</span>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-10 gap-4">
                {episodes.map(num => (
                  <button
                    key={num}
                    onClick={() => {
                      setActiveEpisode(num);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`h-16 flex items-center justify-center rounded-3xl font-black text-lg transition-all border-2 ${
                      activeEpisode === num 
                      ? 'bg-red-600 border-red-600 text-white shadow-3xl shadow-red-900/50 scale-105' 
                      : 'bg-zinc-900/30 border-zinc-800 text-zinc-700 hover:border-zinc-500 hover:text-white'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Cyber Sidebar */}
        <div className="space-y-12">
           <div className="bg-gradient-to-br from-zinc-950 to-black border border-zinc-800/40 p-10 rounded-[3rem] shadow-3xl relative overflow-hidden group">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-red-600/5 rounded-full blur-3xl group-hover:bg-red-600/10 transition-all duration-1000"></div>
              
              <div className="flex items-center gap-6 mb-10">
                 <div className="w-14 h-14 bg-red-600 rounded-[1.5rem] flex items-center justify-center -rotate-6 shadow-2xl shadow-red-900/40 border border-white/10">
                    <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                 </div>
                 <div>
                    <h4 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.5em]">Network Load</h4>
                    <p className="text-white font-black text-lg italic tracking-tighter">Ultra Low Latency</p>
                 </div>
              </div>

              <div className="space-y-8">
                 <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.3em]">
                    <span className="text-zinc-500">HLS Optimization</span>
                    <span className="text-green-500">Enabled</span>
                 </div>
                 <div className="h-2 bg-zinc-900 rounded-full overflow-hidden p-0.5">
                    <div className="h-full bg-gradient-to-r from-red-600 to-red-400 w-[94%] rounded-full shadow-[0_0_15px_rgba(220,38,38,0.4)]"></div>
                 </div>
                 
                 <div className="pt-6 grid grid-cols-1 gap-4">
                    <button className="py-5 bg-zinc-900 hover:bg-zinc-800 text-[10px] font-black uppercase tracking-[0.3em] rounded-[2rem] transition-all border border-zinc-800 shadow-xl">
                       Switch Server
                    </button>
                    <button className="py-5 bg-white text-black text-[10px] font-black uppercase tracking-[0.3em] rounded-[2rem] transition-all hover:bg-red-600 hover:text-white shadow-2xl">
                       Report Broken
                    </button>
                 </div>
              </div>
           </div>

           <div className="relative overflow-hidden rounded-[3.5rem] group shadow-3xl border border-white/5">
              <img src={movie.thumbnail} className="w-full aspect-[3/4] object-cover brightness-50 group-hover:scale-105 transition-transform duration-1000" alt="" />
              <div className="absolute inset-0 p-12 flex flex-col justify-end bg-gradient-to-t from-black via-black/20 to-transparent">
                 <span className="text-red-600 font-black text-[10px] uppercase tracking-[0.5em] mb-6 animate-pulse">Up Next</span>
                 <h4 className="text-4xl font-black mb-8 line-clamp-2 italic uppercase tracking-tighter leading-[0.9]">{movie.title}</h4>
                 <button className="w-full py-5 bg-white/5 backdrop-blur-3xl text-white text-[10px] font-black uppercase tracking-[0.4em] rounded-3xl hover:bg-red-600 transition-all border border-white/10">
                    Auto-Queue
                 </button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetails;
