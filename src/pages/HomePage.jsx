// src/pages/HomePage/HomePage.jsx
import React, { useState } from 'react';
import HeroBanner from '../components/HeroBanner';
import ContentRow from '../components/ContentRow';
import CategoryFilter from '../components/CategoryFilter';
import {
  fetchTrending,
  fetchPopular,
  fetchTopRated,
} from '../services/tmdbApi';

const HomePage = () => {
  const [activeCategory, setActiveCategory] = useState('all'); // 'all', 'movie', 'tv'

  // You'll use activeCategory to conditionally render or filter ContentRows later
  const handleCategoryChange = (category) => {
    setActiveCategory(category);
    // Potentially re-fetch data or update ContentRow props
  };

  return (
    <div className="pb-16 md:pb-4">
      {' '}
      {/* Padding bottom for bottom nav */}
      <HeroBanner />
      <div className="px-2 md:px-4 lg:px-6">
        {' '}
        {/* Container for content rows */}
        <CategoryFilter
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
        />
        {/* Example: Show all or filter based on activeCategory */}
        {/* This logic would become more complex with filtering */}
        {(activeCategory === 'all' || activeCategory === 'movie') && (
          <ContentRow
            title="Trending Movies"
            fetchFunction={fetchTrending}
            apiParams={['movie', 'day']}
            mediaType="movie"
          />
        )}
        {(activeCategory === 'all' || activeCategory === 'tv') && (
          <ContentRow
            title="Trending Shows"
            fetchFunction={fetchTrending}
            apiParams={['tv', 'day']}
            mediaType="tv"
          />
        )}
        {(activeCategory === 'all' || activeCategory === 'movie') && (
          <ContentRow
            title="Popular Movies"
            fetchFunction={fetchPopular}
            apiParams={['movie']}
            mediaType="movie"
          />
        )}
        {(activeCategory === 'all' || activeCategory === 'tv') && (
          <ContentRow
            title="Top Rated TV Shows"
            fetchFunction={fetchTopRated}
            apiParams={['tv']}
            mediaType="tv"
          />
        )}
        {/* Add more rows as needed (e.g., Upcoming, Top Rated Movies, etc.) */}
      </div>
    </div>
  );
};

export default HomePage;
