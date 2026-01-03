
export interface Movie {
  id: string | number;
  bookId?: string | number; // Used for streaming
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
}
