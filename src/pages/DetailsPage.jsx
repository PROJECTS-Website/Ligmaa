import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import useFetch from '../hooks/useFetch';
import { fetchDetails, getImageUrl } from '../services/tmdbApi';
import VideoPlayerModal from '../components/VideoPlayerModal';
import Spinner from '../components/Spinner';
import MediaHeader from '../components/details/MediaHeader';
import MediaInfo from '../components/details/MediaInfo';
import MediaActions from '../components/details/MediaActions';
import StreamPlayer from '../components/details/StreamPlayer';
import CastSection from '../components/details/CastSection';
import VideosSection from '../components/details/VideosSection';
import RecommendationsSection from '../components/details/RecommendationsSection';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';

const DetailsPage = () => {
  const { mediaType, id } = useParams();
  const navigate = useNavigate();
  const { loadingConfig } = useAppContext();
  const [selectedVideoKey, setSelectedVideoKey] = useState(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const [showStreamPlayer, setShowStreamPlayer] = useState(false);

  const {
    data: details,
    loading: detailsLoading,
    error: detailsError,
  } = useFetch(fetchDetails, mediaType, id);

  // Process item details
  const itemDetails = useMemo(() => {
    if (!details) return null;
    return {
      computedTitle: details.title || details.name,
      computedReleaseDate: details.release_date || details.first_air_date,
      computedRuntime: details.runtime || 
        (details.episode_run_time?.[0] || 0),
      ...details,
    };
  }, [details]);

  // Handle image errors
  const handleImageError = (e, fallbackSrc) => {
    e.target.onerror = null;
    if (fallbackSrc) {
      e.target.src = fallbackSrc;
    }
  };

  // Handle stream URL
  const streamEmbedUrl = useMemo(() => {
    if (mediaType === "movie" && id) {
      return `https://vidsrc.cc/v2/embed/movie/${id}`;
    } else if (mediaType === "tv" && id && selectedSeason > 0 && selectedEpisode > 0) {
      return `https://vidsrc.cc/v2/embed/tv/${id}/${selectedSeason}/${selectedEpisode}`;
    }
    return null;
  }, [mediaType, id, selectedSeason, selectedEpisode]);

  // Handle episodes for selected season
  const episodesForSelectedSeason = useMemo(() => {
    if (mediaType === "tv" && itemDetails?.seasons?.length) {
      const season = itemDetails.seasons.find(s => s.season_number === selectedSeason);
      return season?.episode_count ? 
        Array.from({ length: season.episode_count }, (_, i) => i + 1) : 
        [];
    }
    return [];
  }, [mediaType, itemDetails, selectedSeason]);

  // Reset state when mediaType or id changes
  useEffect(() => {
    window.scrollTo(0, 0);
    setShowStreamPlayer(false);
    setSelectedSeason(1);
    setSelectedEpisode(1);
  }, [mediaType, id]);

  // Navigation handlers
  const handleGoBack = () => navigate(-1);
  
  const playTrailer = (key) => {
    setSelectedVideoKey(key);
    setShowVideoModal(true);
  };

  const handlePlayStream = () => {
    if ((mediaType === "movie" && id) || 
        (mediaType === "tv" && id && selectedSeason > 0 && selectedEpisode > 0)) {
      setShowStreamPlayer(true);
    }
  };

  // Loading and error states
  if (loadingConfig || detailsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-bg text-white">
        <Spinner />
        <p className="ml-4 text-xl">Loading Details...</p>
      </div>
    );
  }

  if (detailsError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-bg text-red-500 text-xl p-8 text-center">
        Error loading details: {detailsError.message}
      </div>
    );
  }

  if (!itemDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-bg text-white text-xl">
        No details available to display.
      </div>
    );
  }

  // Destructure item details
  const {
    computedTitle: itemTitle,
    backdrop_path,
    poster_path,
    overview,
    genres = [],
    computedReleaseDate: itemReleaseDate,
    vote_average = 0,
    tagline,
    computedRuntime: itemRuntime,
    number_of_seasons,
    seasons = [],
    videos = { results: [] },
    credits = { cast: [] },
    recommendations = { results: [] },
  } = itemDetails;

  // Process videos and recommendations
  const officialTrailers = videos.results
    ?.filter(video => video.site === "YouTube" && 
      (video.type === "Trailer" || video.type === "Teaser"))
    .slice(0, 10) || [];

  const topCast = credits.cast?.slice(0, 15) || [];
  const similarItems = recommendations.results
    ?.filter(item => item.poster_path)
    .slice(0, 15) || [];

  return (
    <div className="bg-brand-bg text-white min-h-screen pb-16 md:pb-8 overflow-x-hidden">
      {/* Back Button */}
      <div className="container mx-auto px-4 md:px-8 lg:px-12 fixed z-30 top-4">
        <button
          onClick={handleGoBack}
          className="mb-3 md:mb-0 inline-flex items-center space-x-1.5 text-muted-foreground hover:text-brand-yellow transition-colors text-sm sm:text-sm rounded-full px-3 py-2 bg-zinc-800/25 hover:bg-zinc-800/60 backdrop-blur-sm cursor-pointer border border-zinc-800"
          aria-label="Go back to previous page"
        >
          <ArrowLeftIcon className="size-4 sm:size-5" />
          <span>Back</span>
        </button>
      </div>

      {/* Media Header */}
      <MediaHeader
        backdropPath={getImageUrl(backdrop_path, "original")}
        title={itemTitle}
        onImageError={(e) => handleImageError(e, getImageUrl(null, "original"))}
      />

      {/* Main Content */}
      <div className="container mx-auto px-4 md:px-8 lg:px-12 -mt-24 md:-mt-48 relative z-10">
        <MediaInfo
          posterPath={getImageUrl(poster_path, "w500")}
          title={itemTitle}
          tagline={tagline}
          genres={genres}
          mediaType={mediaType}
          voteAverage={vote_average}
          releaseDate={itemReleaseDate}
          runtime={itemRuntime}
          numberOfSeasons={number_of_seasons}
          overview={overview}
          onImageError={(e) => handleImageError(e, getImageUrl(null, "w500"))}
        />

        <MediaActions
          onPlayStream={handlePlayStream}
          onPlayTrailer={officialTrailers[0] ? () => playTrailer(officialTrailers[0].key) : null}
          hasStreamUrl={!!streamEmbedUrl}
        />
      </div>

      {/* Stream Player */}
      {showStreamPlayer && streamEmbedUrl && (
        <StreamPlayer
          mediaType={mediaType}
          title={itemTitle}
          streamEmbedUrl={streamEmbedUrl}
          seasons={seasons}
          selectedSeason={selectedSeason}
          selectedEpisode={selectedEpisode}
          onSeasonChange={setSelectedSeason}
          onEpisodeChange={setSelectedEpisode}
          episodesForSelectedSeason={episodesForSelectedSeason}
          onClose={() => setShowStreamPlayer(false)}
        />
      )}

      {/* Cast Section */}
      {topCast.length > 0 && <CastSection cast={topCast} />}

      {/* Videos Section */}
      {!showStreamPlayer && officialTrailers.length > 0 && (
        <VideosSection
          videos={officialTrailers}
          onVideoSelect={playTrailer}
        />
      )}

      {/* Recommendations Section */}
      {similarItems.length > 0 && (
        <RecommendationsSection
          items={similarItems}
          mediaType={mediaType}
          title={mediaType === "movie" ? "Similar Movies" : "Similar Shows"}
        />
      )}

      <VideoPlayerModal
        videoKey={selectedVideoKey}
        isOpen={showVideoModal}
        onClose={() => setShowVideoModal(false)}
      />
    </div>
  );
};

export default DetailsPage;