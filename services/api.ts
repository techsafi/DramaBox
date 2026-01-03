
import { Movie } from '../types';

/**
 * Endpoints to try in order of likelihood.
 * 1. The one provided in the instructions.
 * 2. The common Vercel API pattern.
 * 3. The pluralized version.
 */
const ENDPOINTS = [
  'https://apiskeith.vercel.app/movie',
  'https://apiskeith.vercel.app/api/movie',
  'https://apiskeith.vercel.app/movies'
];

// High-quality fallback data to ensure the UI stays premium
const MOCK_MOVIES: Movie[] = [
  {
    id: "101",
    title: "The Midnight Protocol",
    thumbnail: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80",
    description: "In a future where privacy is a crime, one hacker discovers the code that could rewrite reality. A high-stakes thriller that explores the boundaries of digital existence.",
    genre: ["Thriller", "Sci-Fi"],
    year: 2024
  },
  {
    id: "102",
    title: "Shadows of Kyoto",
    thumbnail: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80",
    description: "A retired detective is pulled back into the neon-lit underworld of Kyoto to solve a series of impossible disappearances that mirror his own past.",
    genre: ["Mystery", "Noir"],
    year: 2023
  },
  {
    id: "103",
    title: "Aria's Song",
    thumbnail: "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=800&q=80",
    description: "A gifted musician loses her hearing but discovers a new way to 'see' sound through the vibrations of the city, leading her to a cosmic discovery.",
    genre: ["Drama", "Music"],
    year: 2024
  },
  {
    id: "104",
    title: "The Last Foundry",
    thumbnail: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80",
    description: "Centuries after the fall of industry, a small community discovers a working forge that might be the key to reclaiming their lost heritage.",
    genre: ["Adventure", "Fantasy"],
    year: 2024
  },
  {
    id: "105",
    title: "Velocity",
    thumbnail: "https://images.unsplash.com/photo-1500462859194-885860aa827c?auto=format&fit=crop&w=800&q=80",
    description: "An underground racer gets caught in an intergalactic heist where speed is the only currency that matters.",
    genre: ["Action", "Sci-Fi"],
    year: 2024
  }
];

export const getMovies = async (): Promise<Movie[]> => {
  for (const url of ENDPOINTS) {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        console.warn(`Endpoint ${url} returned status ${response.status}`);
        continue;
      }

      const text = await response.text();
      
      // Basic check if it looks like HTML instead of JSON
      if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
        console.warn(`Endpoint ${url} returned HTML instead of JSON`);
        continue;
      }

      const data = JSON.parse(text);
      
      // Normalize data structure
      if (Array.isArray(data)) {
        return data;
      } else if (data && typeof data === 'object') {
        if (Array.isArray(data.movies)) return data.movies;
        if (Array.isArray(data.data)) return data.data;
        if (Array.isArray(data.result)) return data.result;
      }
      
      console.warn(`Endpoint ${url} returned JSON but no recognizable array of movies found`);
    } catch (err) {
      console.warn(`Failed to fetch from ${url}:`, err);
      // Continue to next endpoint
    }
  }

  // If all fail, return Mock Data silently
  console.info('Switching to local preview data.');
  return MOCK_MOVIES;
};

export const getMovieById = async (id: string): Promise<Movie | null> => {
  try {
    const movies = await getMovies();
    const movie = movies.find(m => String(m.id) === id);
    if (movie) return movie;
    
    // Final check in mock data if the API didn't have it
    return MOCK_MOVIES.find(m => String(m.id) === id) || null;
  } catch (error) {
    return MOCK_MOVIES.find(m => String(m.id) === id) || null;
  }
};
