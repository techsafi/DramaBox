
export interface Movie {
  id: string | number;
  title: string;
  thumbnail: string;
  poster?: string;
  description?: string;
  overview?: string;
  genre: string | string[];
  year?: string | number;
  release_year?: string | number;
}

export interface ApiResponse {
  movies: Movie[];
}
