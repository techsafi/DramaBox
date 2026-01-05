
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMovieById, getStreamData } from '../services/api';
import { Movie, StreamData } from '../types';

const MovieDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
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
      const data = await getStreamData(movie);
      setStreamData(data);
      setIsPlayerLoading(false);
    };
    fetchStream();
  }, [id, movie]);

  // Unified HLS + MP4 Video Logic
  useEffect(() => {
    if (streamData?.url && videoRef.current) {
      const video = videoRef.current;
      const isHls = streamData.url.includes('.m3u8');

      if (isHls) {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = streamData.url;
        } else {
          // Dynamic HLS.js Loader
          const scriptId = 'hls-script';
          if (!document.getElementById(scriptId)) {
            const script = document.createElement('script');
            script.id = scriptId;
            script.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest';
            script.onload = () => initHls(video, streamData.url);
            document.head.appendChild(script);
          } else {
            initHls(video, streamData.url);
          }
        }
      } else {
        video.src = streamData.url;
      }
    }
  }, [streamData]);

  const initHls = (video: HTMLVideoElement, url: string) => {
    // @ts-ignore
    if (window.Hls && window.Hls.isSupported()) {
      // @ts-ignore
      const hls = new window.Hls();
      hls.loadSource(url);
      hls.attachMedia(video);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="w-16 h-16 border-4 border-zinc-800 border-t-red-600 rounded-full animate-spin"></div>
    </div>
  );

  if (!movie) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black p-10 text-center">
      <div className="w-24 h-24 bg-zinc-900 rounded-full flex items-center justify-center mb-10">
        <svg className="w-12 h-12 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h2 className="text-3xl font-black mb-4 uppercase italic tracking-tighter">Stream Unavailable</h2>
      <button onClick={() => navigate('/')} className="bg-red-600 text-white px-12 py-5 rounded-3xl font-black uppercase text-xs tracking-widest shadow-2xl">Return to Hub</button>
    </div>
  );

  return (
    <div className={`min-h-screen transition-all duration-1000 ${isTheaterMode ? 'bg-black' : 'bg-[#050505]'} pb-32`}>
      <div className={`w-full transition-all duration-700 relative bg-black shadow-2xl ${isTheaterMode ? 'max-w-full' : 'max-w-7xl mx-auto md:mt-10 md:rounded-[3rem]'} aspect-video overflow-hidden group`}>
        {isPlayerLoading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950/90 backdrop-blur-3xl z-20">
            <div className="w-20 h-20 border-2 border-red-600 border-t-transparent rounded-full animate-spin mb-8 shadow-[0_0_30px_rgba(220,38,38,0.2)]"></div>
            <p className="text-[10px] font-black text-white tracking-[0.5em] uppercase animate-pulse">Syncing Playback Engine...</p>
          </div>
        ) : streamData ? (
          <video 
            ref={videoRef}
            className="w-full h-full object-contain"
            controls
            autoPlay
            playsInline
            poster={movie.thumbnail}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-500 bg-zinc-950 p-10 text-center">
             <div className="w-20 h-20 bg-red-600/10 rounded-full flex items-center justify-center mb-8">
                <svg className="w-10 h-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
             </div>
             <h3 className="text-white font-black uppercase italic text-2xl mb-4 tracking-tighter">Connection Fault</h3>
             <button onClick={() => window.location.reload()} className="bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 px-12 py-4 rounded-full text-[10px] font-black uppercase tracking-[0.3em] transition-all shadow-xl">Reconnect Server</button>
          </div>
        )}

        {/* Floating Actions */}
        <div className="absolute top-8 left-8 flex gap-3 z-30 opacity-0 group-hover:opacity-100 transition-all duration-500">
          <button onClick={() => navigate('/')} className="bg-black/40 backdrop-blur-3xl p-5 rounded-3xl hover:bg-red-600 transition-all border border-white/5">
            <svg viewBox="0 0 24 24" className="w-6 h-6 stroke-white fill-none" strokeWidth="3"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </button>
        </div>
        
        <div className="absolute top-8 right-8 flex gap-3 z-30 opacity-0 group-hover:opacity-100 transition-all duration-500">
          <button 
            onClick={() => setIsTheaterMode(!isTheaterMode)} 
            className={`p-5 rounded-3xl backdrop-blur-3xl transition-all border border-white/10 ${isTheaterMode ? 'bg-red-600' : 'bg-black/40 hover:bg-zinc-800'}`}
          >
            <svg className="w-6 h-6 fill-white" viewBox="0 0 20 20"><path d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm11 10H5V6h10v8z" /></svg>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 md:px-16 mt-20 grid grid-cols-1 lg:grid-cols-3 gap-24">
        <div className="lg:col-span-2">
          <div className="flex flex-wrap items-center gap-8 mb-12">
            <div className="flex items-center gap-2">
               <div className="w-2.5 h-2.5 bg-red-600 rounded-full animate-pulse shadow-[0_0_10px_rgba(220,38,38,0.8)]"></div>
               <span className="text-zinc-100 text-[11px] font-black uppercase tracking-[0.4em]">
                 {movie.year === "LIVE" ? "ACTIVE HLS BROADCAST" : "VERIFIED ULTRA HD SOURCE"}
               </span>
            </div>
            <div className="h-6 w-px bg-zinc-800"></div>
            <span className="text-zinc-500 text-xs font-black uppercase tracking-[0.3em]">{movie.runtime || 'Verified'}</span>
          </div>
          
          <h1 className="text-7xl md:text-[9rem] font-black mb-12 tracking-tighter leading-none italic uppercase">
            {movie.title}
          </h1>
          
          <p className="text-zinc-400 text-3xl leading-snug italic font-medium pl-10 border-l-8 border-red-600/20 max-w-4xl">
            {movie.description}
          </p>

          <div className="mt-20 flex flex-wrap gap-4">
             {Array.isArray(movie.genre) ? movie.genre.map(g => (
               <span key={g} className="px-8 py-3 bg-zinc-900 border border-zinc-800 rounded-full text-[10px] font-black uppercase tracking-widest text-zinc-500">{g}</span>
             )) : <span className="px-8 py-3 bg-zinc-900 border border-zinc-800 rounded-full text-[10px] font-black uppercase tracking-widest text-zinc-500">{movie.genre}</span>}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-12">
           <div className="bg-gradient-to-br from-zinc-950 to-black border border-zinc-800/40 p-12 rounded-[4rem] shadow-3xl relative overflow-hidden">
              <div className="flex items-center gap-6 mb-12">
                 <div className="w-16 h-16 bg-red-600 rounded-3xl flex items-center justify-center -rotate-6 shadow-2xl shadow-red-900/40">
                    <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                    </svg>
                 </div>
                 <div>
                    <h4 className="text-[11px] font-black text-zinc-600 uppercase tracking-[0.5em]">Audio Sync</h4>
                    <p className="text-white font-black text-2xl italic tracking-tighter">True Cinema 7.1</p>
                 </div>
              </div>

              <div className="space-y-8">
                 <div className="h-2 bg-zinc-900 rounded-full overflow-hidden">
                    <div className="h-full bg-red-600 w-[100%] shadow-[0_0_20px_rgba(220,38,38,0.5)]"></div>
                 </div>
                 <button className="w-full py-6 bg-white text-black text-[11px] font-black uppercase tracking-[0.4em] rounded-[2.5rem] transition-all hover:bg-red-600 hover:text-white shadow-2xl">
                    Download Offline
                 </button>
              </div>
           </div>

           <div className="relative overflow-hidden rounded-[4rem] group shadow-3xl border border-white/5">
              <img src={movie.thumbnail} className="w-full aspect-[4/5] object-cover brightness-50 group-hover:scale-105 transition-transform duration-1000" alt="" />
              <div className="absolute inset-0 p-12 flex flex-col justify-end bg-gradient-to-t from-black via-black/20 to-transparent">
                 <h4 className="text-4xl font-black mb-10 line-clamp-2 italic uppercase tracking-tighter leading-none">{movie.title}</h4>
                 <div className="flex gap-4">
                    <button className="flex-1 py-5 bg-red-600 text-white text-[11px] font-black uppercase tracking-[0.4em] rounded-3xl shadow-2xl">Favorite</button>
                    <button className="p-5 bg-zinc-900/90 backdrop-blur-2xl rounded-3xl border border-white/10">
                       <svg className="w-6 h-6 fill-white" viewBox="0 0 20 20"><path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" /></svg>
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
