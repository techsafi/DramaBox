
import React from 'react';
import { Link } from 'react-router-dom';
import { Movie } from '../types';

interface MovieCardProps {
  movie: Movie;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie }) => {
  const genreString = Array.isArray(movie.genre) ? movie.genre.join(', ') : movie.genre;

  return (
    <Link 
      to={`/movie/${movie.id}`}
      className="group relative block rounded-lg overflow-hidden bg-zinc-900 transition-all duration-300 hover:scale-105 hover:z-10 hover:shadow-[0_0_20px_rgba(229,9,20,0.4)]"
    >
      <div className="aspect-[2/3] overflow-hidden">
        <img 
          src={movie.thumbnail || movie.poster || `https://picsum.photos/seed/${movie.id}/400/600`} 
          alt={movie.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
      </div>
      
      {/* Overlay details on hover or small screen */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
        <h3 className="text-white font-bold text-lg leading-tight mb-1">{movie.title}</h3>
        <div className="flex items-center gap-2 text-xs text-zinc-300">
          <span className="px-1.5 py-0.5 border border-zinc-500 rounded text-[10px] uppercase font-bold">HD</span>
          <span>{movie.year || movie.release_year || '2024'}</span>
        </div>
        <p className="text-[10px] text-zinc-400 mt-2 line-clamp-2">
          {genreString}
        </p>
      </div>

      {/* Static text below for better accessibility/visibility on mobile */}
      <div className="p-3 group-hover:opacity-0 transition-opacity">
        <h3 className="text-sm font-semibold truncate text-zinc-100">{movie.title}</h3>
        <p className="text-xs text-zinc-500 truncate">{genreString}</p>
      </div>
    </Link>
  );
};

export default MovieCard;
