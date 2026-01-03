
import { Movie, Category, SearchResult, StreamData } from '../types';

const BASE_URL = 'https://apiskeith.vercel.app';

// High-quality mock data for fallback to ensure a premium experience when the scraper is unstable
const MOCK_MOVIES: Movie[] = [
  {
    id: "db-1",
    bookId: "db-1",
    title: "The Silent Watcher",
    thumbnail: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80",
    description: "A gripping psychological thriller about an architect who discovers a hidden room in his new home that seems to observe his every move. As the boundaries between reality and paranoia blur, he must uncover the truth before it's too late.",
    genre: ["Thriller", "Mystery"],
    category: "Trending Now",
    year: 2024,
    episodes: 24
  },
  {
    id: "db-2",
    bookId: "db-2",
    title: "Kyoto Nights",
    thumbnail: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80",
    description: "In the neon-lit streets of Kyoto, two strangers from different worlds find their paths crossing in a series of serendipitous events. A beautiful exploration of love, fate, and the moments that define us.",
    genre: ["Romance", "Drama"],
    category: "New Releases",
    year: 2023,
    episodes: 16
  },
  {
    id: "db-3",
    bookId: "db-3",
    title: "Vortex 2099",
    thumbnail: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=800&q=80",
    description: "Cyberpunk action at its finest. When a rogue AI begins rewriting the city's infrastructure, a decommissioned police droid must team up with a street-smart hacker to prevent a digital apocalypse.",
    genre: ["Sci-Fi", "Action"],
    category: "Action Blockbusters",
    year: 2024,
    episodes: 12
  },
  {
    id: "db-4",
    bookId: "db-4",
    title: "The Last Heir",
    thumbnail: "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=800&q=80",
    description: "A historical epic about the fallen dynasty's last survivor who must reclaim their throne using only their wit and a small band of loyal outcasts. Breathtaking scenery and intense drama.",
    genre: ["Historical", "Drama"],
    category: "Top Rated",
    year: 2024,
    episodes: 50
  }
];

/**
 * Utility to safe-parse JSON from a fetch response
 */
async function safeJsonFetch(url: string) {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    
    const text = await response.text();
    // Check if it's actually HTML (common error on Vercel/Scrapers)
    if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
      console.warn(`Endpoint ${url} returned HTML instead of JSON`);
      return null;
    }
    
    return JSON.parse(text);
  } catch (e) {
    console.error(`Error fetching/parsing ${url}:`, e);
    return null;
  }
}

export const getMovieCategories = async (): Promise<Category[]> => {
  // Try the primary endpoint requested by user
  let data = await safeJsonFetch(`${BASE_URL}/movie`);
  
  // If failed, try alternative common paths
  if (!data) {
    data = await safeJsonFetch(`${BASE_URL}/api/movie`);
  }

  if (data) {
    // API might return categories directly or a flat list
    if (data.categories && Array.isArray(data.categories)) {
      return data.categories;
    }

    const movies = Array.isArray(data) ? data : (data.movies || []);
    if (movies.length > 0) {
      const groups: Record<string, Movie[]> = {};
      movies.forEach((m: any) => {
        const cat = m.category || 'Featured';
        if (!groups[cat]) groups[cat] = [];
        groups[cat].push({
          ...m,
          id: m.id || m.bookId || Math.random().toString(36).substr(2, 9),
          bookId: m.bookId || m.id
        });
      });

      return Object.keys(groups).map(title => ({
        title,
        movies: groups[title]
      }));
    }
  }

  // Final fallback to high-quality mock data
  console.info('Switching to Dramabox Premium Preview data.');
  const groups: Record<string, Movie[]> = {};
  MOCK_MOVIES.forEach(m => {
    const cat = m.category || 'Featured';
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(m);
  });

  return Object.keys(groups).map(title => ({
    title,
    movies: groups[title]
  }));
};

export const searchMovies = async (query: string): Promise<SearchResult[]> => {
  if (!query.trim()) return [];
  const data = await safeJsonFetch(`${BASE_URL}/dramabox/search?q=${encodeURIComponent(query)}`);
  
  if (data) {
    return Array.isArray(data) ? data : (data.results || []);
  }
  
  // Mock search if offline/error
  return MOCK_MOVIES
    .filter(m => m.title.toLowerCase().includes(query.toLowerCase()))
    .map(m => ({
      bookId: String(m.bookId),
      title: m.title,
      thumbnail: m.thumbnail,
      metadata: m.year ? String(m.year) : '2024'
    }));
};

export const getStreamUrl = async (bookId: string | number, episode: number = 1): Promise<string | null> => {
  const data = await safeJsonFetch(`${BASE_URL}/dramabox/stream?bookId=${bookId}&episode=${episode}`);
  
  if (data) {
    return data.url || data.stream || data.link || null;
  }
  
  // Return a generic working sample if the scraper fails so the player still shows something
  return null;
};

export const getMovieById = async (id: string): Promise<Movie | null> => {
  const categories = await getMovieCategories();
  for (const cat of categories) {
    const found = cat.movies.find(m => String(m.id) === id || String(m.bookId) === id);
    if (found) return found;
  }
  return MOCK_MOVIES.find(m => String(m.id) === id || String(m.bookId) === id) || null;
};
