import { useState, useEffect, useCallback } from 'react';
import { fetchGenres, fetchGenreMovies, fetchGenreTVShows, fetchAnimeTV } from '../services/tmdbApi';

const defaultGenres = {
  movie: 28,      // Action
  tv: 10759,      // Action & Adventure
  anime: 16       // Animation
};

const getDefaultGenreId = (query) => {
  return query === 'movie' ? defaultGenres.movie : 
         query === 'anime' ? defaultGenres.anime : 
         defaultGenres.tv;
};

export const useExplore = (query) => {
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
  }, [query]);

  // Fetch genres based on media type
  const fetchMediaGenres = useCallback(async () => {
    if (!query) return;
    
    try {
      setLoading(true);
      setError(null);
      
      if (query === 'anime') {
        // For anime, we'll use the TV show genres since anime is a type of TV show in TMDB
        const response = await fetchGenres('anime');
        setGenres(response.data.genres || []);
      } else {
        const mediaType = query === 'movie' ? 'movie' : 'tv';
        const response = await fetchGenres(mediaType);
        setGenres(response.data.genres || []);
      }
    } catch (err) {
      console.error('Error fetching genres:', err);
      setError(err.response?.data?.status_message || 'Failed to fetch genres');
      setGenres([]);
    } finally {
      setLoading(false);
    }
  }, [query]);

  // Fetch data based on current query, genre and page
  const fetchData = useCallback(async () => {
    if (!activeGenre || !query) return;
    
    try {
      setLoading(true);
      setError(null);
      
      let response;
      
      if (query === 'movie') {
        response = await fetchGenreMovies(activeGenre, page);
      } else if (query === 'anime') {
        // For anime, we'll fetch TV shows with the animation genre
        response = await fetchAnimeTV(activeGenre, page);
      } else if (query === 'tv') {
        response = await fetchGenreTVShows(activeGenre, page);
      }
      
      setData({
        results: response.data.results || [],
        total_pages: Math.min(response.data.total_pages || 1, 500) // TMDB max is 500
      });
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.response?.data?.status_message || 'Failed to fetch data');
      setData({ results: [], total_pages: 0 });
    } finally {
      setLoading(false);
    }
  }, [query, activeGenre, page]);

  // Fetch genres when component mounts or query changes
  useEffect(() => {
    fetchMediaGenres();
  }, [fetchMediaGenres]);

  useEffect(() => {
    if (!activeGenre) return;
  
    const controller = new AbortController();
  
    const loadData = async () => {
      await fetchData();
    };
  
    loadData();
  
    return () => {
      controller.abort();
    };
  }, [fetchData, activeGenre, page]);

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
