
import { Movie, Category, SearchResult, StreamData } from '../types';

const BASE_URL = 'https://apiskeith.vercel.app';
const PEXELS_AUTH = '563492ad6f9170000100000185017e8840c8413b8f1067d0234a9807';

async function safeJsonFetch(url: string, options?: RequestInit) {
  try {
    const response = await fetch(url, options);
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

// 100% Reliable Open Source Movies (Blender Foundation / Google Sample)
const OPEN_CINEMA: Movie[] = [
  {
    id: 'oc-1',
    title: 'Tears of Steel',
    thumbnail: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Tears_of_Steel_poster.jpg/800px-Tears_of_Steel_poster.jpg',
    description: 'A sci-fi short film about a group of warriors and scientists, who gather at the Oude Kerk in Amsterdam in a desperate attempt to rescue the world from destructive robots.',
    genre: ['Sci-Fi', 'Action'],
    year: 2012,
    type: 'movie',
    direct_video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    rating: '8.4',
    runtime: '12m'
  },
  {
    id: 'oc-2',
    title: 'Sintel',
    thumbnail: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Sintel_poster.jpg/800px-Sintel_poster.jpg',
    description: 'A young woman named Sintel finds a baby dragon, which she nurses back to health. When the dragon is snatched by an adult dragon, Sintel sets out on a perilous quest.',
    genre: ['Fantasy', 'Adventure'],
    year: 2010,
    type: 'movie',
    direct_video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    rating: '7.9',
    runtime: '15m'
  },
  {
    id: 'oc-3',
    title: 'Big Buck Bunny',
    thumbnail: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Big_buck_bunny_poster_big.jpg/800px-Big_buck_bunny_poster_big.jpg',
    description: 'A giant rabbit with a heart of gold is harassed by three small rodents. He decides to take his revenge in the most creative way possible.',
    genre: ['Animation', 'Comedy'],
    year: 2008,
    type: 'movie',
    direct_video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    rating: '8.1',
    runtime: '10m'
  }
];

export const getMovieCategories = async (): Promise<Category[]> => {
  const categories: Category[] = [];

  // Category 1: Open Cinema (Reliable MP4s)
  categories.push({
    title: "Premium Open Cinema",
    movies: OPEN_CINEMA
  });

  // Category 2: Cinematic Shorts (Pexels)
  const pexelsData = await safeJsonFetch(`https://api.pexels.com/videos/search?query=cinematic&per_page=12&orientation=landscape`, {
    headers: { 'Authorization': PEXELS_AUTH }
  });
  
  if (pexelsData?.videos) {
    categories.push({
      title: "Visual Shorts",
      movies: pexelsData.videos.map((v: any) => ({
        id: `px-${v.id}`,
        title: `Visions by ${v.user.name}`,
        thumbnail: v.image,
        description: `Experience stunning cinematic visual sequences in 4K. Captured by professional creators globally.`,
        genre: ["Cinematic", "Visuals"],
        year: 2024,
        type: 'movie',
        direct_video_url: v.video_files.find((f: any) => f.quality === 'hd' || f.width >= 1280)?.link || v.video_files[0].link,
        runtime: `${v.duration}s`
      }))
    });
  }

  // Category 3: Live News & Science (HLS Streams)
  categories.push({
    title: "24/7 Live Channels",
    movies: [
      {
        id: "live-nasa",
        title: "NASA Public TV",
        thumbnail: "https://www.nasa.gov/wp-content/uploads/2023/10/nasa-logo-vertical-rgb.png",
        description: "Live broadcasts from the International Space Station and NASA deep space missions.",
        genre: ["Live", "Science"],
        year: "LIVE",
        type: 'movie',
        direct_video_url: "https://ntv1.akamaized.net/hls/live/2023529/NTV-Public/master.m3u8"
      },
      {
        id: "live-france24",
        title: "France 24 English",
        thumbnail: "https://static.france24.com/meta_og_tw/france24.png",
        description: "24-hour international news channel based in Paris, broadcasting to the world in English.",
        genre: ["Live", "News"],
        year: "LIVE",
        type: 'movie',
        direct_video_url: "https://static.france24.com/live/F24_EN_LO_HLS/live_tv.m3u8"
      }
    ]
  });

  // Category 4: Dramabox Originals (Try to include if available)
  const dbData = await safeJsonFetch(`${BASE_URL}/dramabox/home`);
  if (dbData) {
    const result = dbData.result || dbData.categories || dbData;
    if (Array.isArray(result) && result[0]?.movies) {
      categories.push({
        title: "Dramabox Exclusives",
        movies: result[0].movies.slice(0, 10).map((m: any) => ({ 
          ...m, 
          id: m.bookId || m.id, 
          bookId: m.bookId || m.id,
          type: 'show'
        }))
      });
    }
  }

  return categories;
};

export const searchMovies = async (query: string): Promise<SearchResult[]> => {
  if (!query.trim()) return [];
  
  // Search Dramabox first
  const dbSearch = await safeJsonFetch(`${BASE_URL}/dramabox/search?q=${encodeURIComponent(query)}`);
  let results: SearchResult[] = [];
  
  if (dbSearch && Array.isArray(dbSearch.result)) {
    results = dbSearch.result.map((r: any) => ({
      bookId: r.bookId || r.id,
      title: r.title,
      thumbnail: r.thumbnail,
      metadata: 'Dramabox Original'
    }));
  }

  // Fallback to Pexels search for "watchable" visuals
  const pexelsSearch = await safeJsonFetch(`https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&per_page=5`, {
    headers: { 'Authorization': PEXELS_AUTH }
  });
  if (pexelsSearch?.videos) {
    const pexRes = pexelsSearch.videos.map((v: any) => ({
      bookId: `px-${v.id}`,
      title: `Visual: ${query}`,
      thumbnail: v.image,
      metadata: 'HD Cinematic'
    }));
    results = [...results, ...pexRes];
  }

  return results;
};

export const getStreamData = async (movie: Movie, episode: number = 1): Promise<StreamData | null> => {
  // Source 1: Verified Direct URLs
  if (movie.direct_video_url) {
    return { url: movie.direct_video_url, isEmbed: false };
  }

  // Source 2: Dramabox API
  if (movie.bookId && !String(movie.id).startsWith('px-') && !String(movie.id).startsWith('oc-')) {
    const data = await safeJsonFetch(`${BASE_URL}/dramabox/stream?bookId=${movie.bookId}&episode=${episode}`);
    if (data?.status && data.result?.video_url) {
      return { url: data.result.video_url, isEmbed: false };
    }
  }

  // Source 3: Archive.org Fallback
  if (movie.id_archive) {
    return { url: `https://archive.org/embed/${movie.id_archive}`, isEmbed: true };
  }

  return null;
};

export const getMovieById = async (id: string): Promise<Movie | null> => {
  // Check local Open Cinema first
  const localMatch = OPEN_CINEMA.find(m => String(m.id) === id);
  if (localMatch) return localMatch;

  // Check Pexels
  if (id.startsWith('px-')) {
    const pexId = id.replace('px-', '');
    const v = await safeJsonFetch(`https://api.pexels.com/videos/videos/${pexId}`, {
      headers: { 'Authorization': PEXELS_AUTH }
    });
    if (v) {
      return {
        id: `px-${v.id}`,
        title: `Visions by ${v.user.name}`,
        thumbnail: v.image,
        description: `Atmospheric cinematography.`,
        genre: ["Cinematic"],
        year: 2024,
        type: 'movie',
        direct_video_url: v.video_files.find((f: any) => f.quality === 'hd')?.link || v.video_files[0].link,
        runtime: `${v.duration}s`
      } as Movie;
    }
  }

  // Search through categories
  const categories = await getMovieCategories();
  for (const cat of categories) {
    const found = cat.movies.find(m => String(m.id) === id || String(m.bookId) === id);
    if (found) return found;
  }
  return null;
};
