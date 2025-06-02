import { useState, useEffect, useCallback } from 'react';
import { fetchGenres, fetchGenreMovies, fetchGenreTVShows, fetchAnimeTV } from '../services/tmdbApi';

const defaultGenres = {
  movie: 28,      // Action
  tv: 10759,      // Action & Adventure
  anime: 16       // Animation
};

// Add this helper function at the top level
const isValidGenre = (genreId, genresList) => {
  return genresList.some(g => g.id === genreId);
};

const getDefaultGenreId = (query) => {
  return query === 'movie' ? defaultGenres.movie : 
         query === 'anime' ? defaultGenres.anime : 
         defaultGenres.tv;
};

export const useExplore = (query = 'movie') => {
  const [page, setPage] = useState(1);
  const [activeGenre, setActiveGenre] = useState(getDefaultGenreId(query));
  const [genres, setGenres] = useState([]);
  const [data, setData] = useState({ results: [], total_pages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  // Reset states when query changes
  useEffect(() => {
    setPage(1);
    setActiveGenre(getDefaultGenreId(query));
    setData({ results: [], total_pages: 0 });
    setGenres([]);
    setLoading(true);
    
  }, [query]);

  // Fetch genres and set initial activeGenre
  useEffect(() => {
    if (!query) return;
    
    const fetchMediaGenres = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const mediaType = query === 'anime' ? 'tv' : (query === 'movie' ? 'movie' : 'tv');
        const response = await fetchGenres(mediaType);
        
        const fetchedGenres = response.data.genres || [];
        setGenres(fetchedGenres);
        
        if (fetchedGenres.length > 0) {
          const defaultGenreId = getDefaultGenreId(query);
          const genreExists = fetchedGenres.some(g => g.id === defaultGenreId);
          const newActiveGenre = genreExists ? defaultGenreId : fetchedGenres[0]?.id;

          if (newActiveGenre) {
            setActiveGenre(newActiveGenre);
          }
        }
      } catch (err) {
        console.error('❌ Error fetching genres:', {
          error: err.message,
          query,
          response: err.response?.data
        });
        setError('Failed to load genres. Please try again later.');
        setGenres([]);
      } finally {
        setLoading(false);
      }
    };
  
    fetchMediaGenres();
  }, [query]);
  // Fetch data when activeGenre changes
  useEffect(() => {
    if (!activeGenre || !genres.length) return;
    const controller = new AbortController();
    const signal = controller.signal;
    
    const fetchData = async () => {
      try {
        const currentGenreValid = isValidGenre(activeGenre, genres);

        if (!currentGenreValid) {
          console.warn('Invalid genre, falling back to default');
          const defaultGenre = getDefaultGenreId(query);
          setActiveGenre(genres.some(g => g.id === defaultGenre) ? defaultGenre : genres[0]?.id);
          return;
        }
  
        setLoading(true);
        setError(null);
        
        let response;
        
        if (query === 'movie') {
          response = await fetchGenreMovies(activeGenre, page, signal);
        } else if (query === 'anime') {
          response = await fetchAnimeTV(activeGenre, page, signal);
        } else if (query === 'tv') {
          response = await fetchGenreTVShows(activeGenre, page, signal);
        }
        
        if (response) {
          setData({
            results: response.data.results || [],
            total_pages: Math.min(response.data.total_pages || 1, 500)
          });
        }
      } catch (err) {
        console.error('❌ Error fetching data:', {
          error: err.message,
          query,
          activeGenre,
          page
        });
        setError(err.response?.data?.status_message || 'Failed to fetch data');
        setData({ results: [], total_pages: 0 });
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();

    return () => controller.abort();
  }, [activeGenre, page, query, genres]);

  // Handle genre change
  const handleGenreChange = useCallback((genreId) => {
    setActiveGenre(genreId);
    setPage(1);
  }, []);

  // Handle page change
  const handlePageChange = useCallback((newPage) => {
    if (newPage >= 1 && newPage <= (data?.total_pages || 1)) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [data?.total_pages]);

  return {
    page,
    setPage: handlePageChange,
    activeGenre,
    setActiveGenre: handleGenreChange,
    genres,
    data,
    loading,
    error,
    defaultGenres
  };
};