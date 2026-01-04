
import { Movie, Category, SearchResult, StreamData } from '../types';

const BASE_URL = 'https://apiskeith.vercel.app';
const TVMAZE_URL = 'https://api.tvmaze.com';

async function safeJsonFetch(url: string) {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const text = await response.text();
    if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) return null;
    try {
      return JSON.parse(text);
    } catch {
      return null;
    }
  } catch (e) {
    return null;
  }
}

const normalizeTVMazeShow = (show: any): Movie => ({
  id: `tvm-${show.id}`,
  imdbId: show.externals?.imdb,
  title: show.name,
  thumbnail: show.image?.medium || show.image?.original || "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?auto=format&fit=crop&w=800&q=80",
  description: show.summary?.replace(/<[^>]*>?/gm, '') || "No description available.",
  genre: show.genres || [],
  year: show.premiered ? new Date(show.premiered).getFullYear() : 2024,
  episodes: show._embedded?.episodes?.length || 1,
  type: 'show',
  category: "Global Trending",
  rating: show.rating?.average || 'N/A',
  runtime: show.runtime ? `${show.runtime}m` : undefined
});

export const getMovieCategories = async (): Promise<Category[]> => {
  const categories: Category[] = [];

  // 1. Dramabox Originals (Native Scraper)
  const dbData = await safeJsonFetch(`${BASE_URL}/dramabox/home`);
  if (dbData) {
    const result = dbData.result || dbData.categories || dbData;
    if (Array.isArray(result) && result[0]?.movies) {
      result.forEach((cat: any) => {
        categories.push({
          title: cat.title || 'Dramabox Originals',
          movies: cat.movies.map((m: any) => ({ 
            ...m, 
            id: m.bookId || m.id, 
            bookId: m.bookId || m.id,
            type: 'show'
          }))
        });
      });
    }
  }

  // 2. Global TV Catalog (TVMaze API)
  const tvMazeShows = await safeJsonFetch(`${TVMAZE_URL}/shows?page=1`);
  if (tvMazeShows && Array.isArray(tvMazeShows)) {
    categories.push({
      title: "Global Trending",
      movies: tvMazeShows.slice(0, 15).map(normalizeTVMazeShow)
    });
  }

  // 3. Vintage Cinema (Archive.org Public Domain)
  // Hardcoded selection of high-quality public domain films
  categories.push({
    title: "Vintage Cinema (Public Domain)",
    movies: [
      {
        id: "classic-1",
        title: "Night of the Living Dead",
        thumbnail: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Night_of_the_Living_Dead_poster.jpg/800px-Night_of_the_Living_Dead_poster.jpg",
        description: "A group of people are trapped in a farmhouse while flesh-eating ghouls roam the countryside.",
        genre: ["Horror", "Classic"],
        year: 1968,
        type: 'classic',
        id_archive: "night_of_the_living_dead"
      },
      {
        id: "classic-2",
        title: "The Great Gatsby",
        thumbnail: "https://upload.wikimedia.org/wikipedia/commons/2/26/TheGreatGatsby_1926_FilmPoster.jpg",
        description: "The original 1926 silent film adaptation of F. Scott Fitzgerald's masterpiece.",
        genre: ["Drama", "Silent"],
        year: 1926,
        type: 'classic',
        id_archive: "TheGreatGatsby1926"
      }
    ]
  });

  return categories;
};

export const searchMovies = async (query: string): Promise<SearchResult[]> => {
  if (!query.trim()) return [];
  
  const dbSearch = await safeJsonFetch(`${BASE_URL}/dramabox/search?q=${encodeURIComponent(query)}`);
  let results: SearchResult[] = [];
  
  if (dbSearch) {
    const dbRes = dbSearch.result || dbSearch.results || dbSearch;
    if (Array.isArray(dbRes)) results = [...dbRes];
  }

  const tvmSearch = await safeJsonFetch(`${TVMAZE_URL}/search/shows?q=${encodeURIComponent(query)}`);
  if (tvmSearch && Array.isArray(tvmSearch)) {
    results = [...results, ...tvmSearch.map((item: any) => ({
      bookId: `tvm-${item.show.id}`,
      title: item.show.name,
      thumbnail: item.show.image?.medium || "",
      metadata: 'TV Show'
    }))];
  }

  return results;
};

export const getStreamData = async (movie: Movie, episode: number = 1): Promise<StreamData | null> => {
  // Source A: Native Dramabox (MP4)
  if (movie.bookId && !String(movie.id).startsWith('tvm-')) {
    const data = await safeJsonFetch(`${BASE_URL}/dramabox/stream?bookId=${movie.bookId}&episode=${episode}`);
    if (data && data.status && data.result?.video_url) {
      return { url: data.result.video_url, isEmbed: false };
    }
  }

  // Source B: Global Catalog (Embed via IMDB)
  if (movie.imdbId) {
    // Using a common public embed helper
    return { 
      url: `https://vidsrc.me/embed/tv?imdb=${movie.imdbId}&sea=1&epi=${episode}`, 
      isEmbed: true 
    };
  }

  // Source C: Archive.org (Classic Movies)
  // Fix: Removed unnecessary 'as any' casting as id_archive is now defined in the Movie interface
  if (movie.id_archive) {
    return {
      url: `https://archive.org/embed/${movie.id_archive}`,
      isEmbed: true
    };
  }

  return null;
};

export const getMovieById = async (id: string): Promise<Movie | null> => {
  if (id.startsWith('tvm-')) {
    const cleanId = id.replace('tvm-', '');
    const show = await safeJsonFetch(`${TVMAZE_URL}/shows/${cleanId}`);
    return show ? normalizeTVMazeShow(show) : null;
  }

  const categories = await getMovieCategories();
  for (const cat of categories) {
    const found = cat.movies.find(m => String(m.id) === id || String(m.bookId) === id);
    if (found) return found;
  }
  return null;
};