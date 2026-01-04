
import React from 'react';
import { Link } from 'react-router-dom';
import { Movie } from '../types';

interface MovieCardProps {
  movie: Movie;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie }) => {
  const genreString = Array.isArray(movie.genre) ? movie.genre.join(', ') : movie.genre;
  // Cleaned up redundant 'any' cast as direct_video_url is now part of the Movie interface
  const isDirectlyStreamable = movie.direct_video_url || movie.id_archive || movie.bookId;

  return (
    <Link 
      to={`/movie/${movie.id}`}
      className="group relative block rounded-xl overflow-hidden bg-zinc-900 transition-all duration-300 hover:scale-105 hover:z-10 hover:shadow-[0_0_30px_rgba(229,9,20,0.3)]"
    >
      <div className="aspect-[2/3] overflow-hidden relative">
        <img 
          src={movie.thumbnail || movie.poster || `https://picsum.photos/seed/${movie.id}/400/600`} 
          alt={movie.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
        />
        {isDirectlyStreamable && (
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-red-600/90 backdrop-blur-md px-2 py-1 rounded-lg shadow-xl z-20 scale-90 group-hover:scale-100 transition-transform">
            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
            <span className="text-[8px] font-black text-white uppercase tracking-tighter">Ready to Play</span>
          </div>
        )}
      </div>
      
      {/* Overlay details on hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-5">
        <h3 className="text-white font-black text-lg leading-tight mb-2 italic tracking-tighter">{movie.title}</h3>
        <div className="flex items-center gap-2 text-[10px] text-zinc-300 font-bold uppercase tracking-widest">
          <span className="px-2 py-0.5 bg-white/20 backdrop-blur-md rounded">4K</span>
          <span>{movie.year || movie.release_year || '2024'}</span>
        </div>
        <p className="text-[10px] text-zinc-400 mt-3 line-clamp-2 leading-relaxed">
          {genreString}
        </p>
      </div>

      {/* Static text below */}
      <div className="p-4 group-hover:opacity-0 transition-opacity duration-300">
        <h3 className="text-xs font-black truncate text-zinc-100 uppercase tracking-wide">{movie.title}</h3>
        <p className="text-[10px] text-zinc-600 truncate mt-1 font-bold">{genreString}</p>
      </div>
    </Link>
  );
};

export default MovieCard;
