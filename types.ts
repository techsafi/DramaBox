
export interface Movie {
  id: string | number;
  bookId?: string | number; // Used for Dramabox streaming
  imdbId?: string; // Used for Global catalog streaming
  id_archive?: string; // Used for Archive.org public domain streaming
  title: string;
  thumbnail: string;
  poster?: string;
  description?: string;
  overview?: string;
  genre?: string | string[];
  year?: string | number;
  release_year?: string | number;
  category?: string;
  episodes?: number;
  type?: 'movie' | 'show' | 'classic';
  rating?: string | number;
  runtime?: string;
}

export interface Category {
  title: string;
  movies: Movie[];
}

export interface SearchResult {
  bookId: string;
  title: string;
  thumbnail: string;
  metadata?: string;
}

export interface StreamData {
  url: string;
  title?: string;
  quality?: string;
  isEmbed?: boolean;
}