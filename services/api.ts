
import { Movie, Category, SearchResult, StreamData } from '../types';

const BASE_URL = 'https://apiskeith.vercel.app';
const TVMAZE_URL = 'https://api.tvmaze.com';

// High-quality mock data for fallback
const MOCK_MOVIES: Movie[] = [
  {
    id: "41000105764",
    bookId: "41000105764",
    title: "The Silent Watcher",
    thumbnail: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80",
    description: "A gripping psychological thriller about an architect who discovers a hidden room.",
    genre: ["Thriller", "Mystery"],
    category: "Trending Now",
    year: 2024,
    episodes: 24
  }
];

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

/**
 * Normalizes TVMaze show data to our Movie interface
 */
const normalizeTVMazeShow = (show: any): Movie => ({
  id: `tvm-${show.id}`,
  title: show.name,
  thumbnail: show.image?.medium || show.image?.original || "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?auto=format&fit=crop&w=800&q=80",
  description: show.summary?.replace(/<[^>]*>?/gm, '') || "No description available.",
  genre: show.genres || [],
  year: show.premiered ? new Date(show.premiered).getFullYear() : 2024,
  episodes: 1, // Default to 1 for external shows
  category: "Global Trending"
});

export const getMovieCategories = async (): Promise<Category[]> => {
  const categories: Category[] = [];

  // 1. Fetch Dramabox Home (Primary)
  const dbData = await safeJsonFetch(`${BASE_URL}/dramabox/home`);
  if (dbData) {
    const result = dbData.result || dbData.categories || dbData;
    if (Array.isArray(result) && result[0]?.movies) {
      result.forEach((cat: any) => {
        categories.push({
          title: cat.title || 'Dramabox Originals',
          movies: cat.movies.map((m: any) => ({ ...m, id: m.bookId || m.id, bookId: m.bookId || m.id }))
        });
      });
    }
  }

  // 2. Fetch Global Trending from TVMaze (Secondary)
  const tvMazeShows = await safeJsonFetch(`${TVMAZE_URL}/shows?page=1`);
  if (tvMazeShows && Array.isArray(tvMazeShows)) {
    categories.push({
      title: "Global Trending (TVMaze)",
      movies: tvMazeShows.slice(0, 15).map(normalizeTVMazeShow)
    });
  }

  // 3. Fetch US Schedule for "Just Aired" feel
  const schedule = await safeJsonFetch(`${TVMAZE_URL}/schedule?country=US`);
  if (schedule && Array.isArray(schedule)) {
    categories.push({
      title: "New Episodes Today",
      movies: schedule.slice(0, 15).map(item => ({
        ...normalizeTVMazeShow(item.show),
        id: `tvm-ep-${item.id}`,
        category: "Just Aired"
      }))
    });
  }

  // Fallback if everything fails
  if (categories.length === 0) {
    categories.push({ title: "Featured", movies: MOCK_MOVIES });
  }

  return categories;
};

export const searchMovies = async (query: string): Promise<SearchResult[]> => {
  if (!query.trim()) return [];
  
  // Search Dramabox
  const dbSearch = await safeJsonFetch(`${BASE_URL}/dramabox/search?q=${encodeURIComponent(query)}`);
  let results: SearchResult[] = [];
  
  if (dbSearch) {
    const dbRes = dbSearch.result || dbSearch.results || dbSearch;
    if (Array.isArray(dbRes)) results = [...dbRes];
  }

  // Search TVMaze for broader results
  const tvmSearch = await safeJsonFetch(`${TVMAZE_URL}/search/shows?q=${encodeURIComponent(query)}`);
  if (tvmSearch && Array.isArray(tvmSearch)) {
    const tvmRes = tvmSearch.map((item: any) => ({
      bookId: `tvm-${item.show.id}`,
      title: item.show.name,
      thumbnail: item.show.image?.medium || item.show.image?.original || "",
      metadata: item.show.genres?.[0] || 'TV Show'
    }));
    results = [...results, ...tvmRes];
  }

  return results;
};

export const getStreamUrl = async (bookId: string | number, episode: number = 1): Promise<string | null> => {
  // TVMaze doesn't provide direct MP4 streams, so we only handle Dramabox IDs here
  if (String(bookId).startsWith('tvm-')) return null;

  const data = await safeJsonFetch(`${BASE_URL}/dramabox/stream?bookId=${bookId}&episode=${episode}`);
  if (data && data.status) {
    return data.result?.video_url || data.url || null;
  }
  return null;
};

export const getMovieById = async (id: string): Promise<Movie | null> => {
  if (id.startsWith('tvm-')) {
    const cleanId = id.replace('tvm-ep-', '').replace('tvm-', '');
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
