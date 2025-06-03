import { useState, useEffect, useCallback } from 'react';
import {
  fetchGenres,
  fetchGenreMovies,
  fetchGenreTVShows,
  fetchAnimeTV,
} from '../services/tmdbApi';

const defaultGenres = {
  movie: 28,  // Action
  tv: 10759,  // Action & Adventure
  anime: 16,  // Animation
};

// Utility to check if a genreId exists in the array
const isValidGenre = (genreId, genresList) => {
  return genresList.some((g) => g.id === genreId);
};

export const useExplore = (query = 'movie') => {
  const [page, setPage] = useState(1);
  const [activeGenre, setActiveGenre] = useState(null);
  const [genres, setGenres] = useState([]);
  const [data, setData] = useState({ results: [], total_pages: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getDefaultGenreId = (query) => {
    if (query === 'movie') return defaultGenres.movie;
    if (query === 'anime') return defaultGenres.anime;
    return defaultGenres.tv;
  };

  useEffect(() => {
    if (!query) return;
    setLoading(true);
    setError(null);
    setPage(1);
    setGenres([]);
    setData({ results: [], total_pages: 0 });
    setActiveGenre(null);

    const controller = new AbortController();
    const signal = controller.signal;

    const loadGenresAndFirstPage = async () => {
      try {
        const mediaType = query === 'anime' ? 'tv' : query;
        const res = await fetchGenres(mediaType, { signal });
        const fetchedGenres = res.data.genres || [];
        setGenres(fetchedGenres);

        if (fetchedGenres.length === 0) {
          setActiveGenre(null);
          setData({ results: [], total_pages: 0 });
          setError('No genres found.');
          setLoading(false);
          return;
        }
        const desiredDefault = getDefaultGenreId(query);
        const pick = isValidGenre(desiredDefault, fetchedGenres)
          ? desiredDefault
          : fetchedGenres[0].id;
        setActiveGenre(pick);

        let dataRes;
        if (query === 'movie') {
          dataRes = await fetchGenreMovies(pick, 1, signal);
        } else if (query === 'anime') {
          dataRes = await fetchAnimeTV(pick, 1, signal);
        } else {
          dataRes = await fetchGenreTVShows(pick, 1, signal);
        }

        setData({
          results: dataRes.data.results || [],
          total_pages: Math.min(dataRes.data.total_pages || 1, 500),
        });
      } catch (err) {
        if (!signal.aborted) {
          setError(err.response?.data?.status_message || 'Failed to load genres or data');
          setData({ results: [], total_pages: 0 });
        }
      } finally {
        if (!signal.aborted) {
          setLoading(false);
        }
      }
    };

    loadGenresAndFirstPage();

    return () => {
      controller.abort();
    };
  }, [query]);


  useEffect(() => {
    if (!activeGenre) return;

    const controller = new AbortController();
    const signal = controller.signal;

    const loadPage = async () => {
      setError(null);

      try {
        let res;
        if (query === 'movie') {
          res = await fetchGenreMovies(activeGenre, page, signal);
        } else if (query === 'anime') {
          res = await fetchAnimeTV(activeGenre, page, signal);
        } else {
          res = await fetchGenreTVShows(activeGenre, page, signal);
        }

        setData({
          results: res.data.results || [],
          total_pages: Math.min(res.data.total_pages || 1, 500),
        });
      } catch (err) {
        if (!signal.aborted) {
          // handle real er rors
          setError(err.response?.data?.status_message || 'Failed to fetch data');
          setData({ results: [], total_pages: 0 });
        }
      } finally {
        if (!signal.aborted) {
          setLoading(false);
        }
      }
    };

    loadPage();
    return () => {
      controller.abort();
    };
  }, [activeGenre, page, query]);

  const handleGenreChange = useCallback(
    (genreId) => {
      if (genreId === activeGenre) return;
      setPage(1);
      setActiveGenre(genreId);
    },
    [activeGenre]
  );

  const handlePageChange = useCallback(
    (newPage) => {
      if (newPage < 1 || newPage > (data.total_pages || 1)) return;
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [data.total_pages]
  );

  return {
    page,
    setPage: handlePageChange,
    activeGenre,
    setActiveGenre: handleGenreChange,
    genres,
    data,
    loading,
    error,
    defaultGenres,
  };
};
