// src/pages/DetailsPage/DetailsPage.jsx

import React, { useState, useEffect, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, FreeMode } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/free-mode";

import { useAppContext } from "../context/AppContext";
import useFetch from "../hooks/useFetch";
import { fetchDetails } from "../services/tmdbApi";
import MovieCard from "../components/MovieCard";
import CastCard from "../components/CastCard";
import RatingCircle from "../components/RatingCircle";
import VideoPlayerModal from "../components/VideoPlayerModal";
import Spinner from "../components/Spinner";
import {
  PlayIcon,
  PlusIcon,
  // FilmIcon, // Not used
  CalendarDaysIcon,
  ClockIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { ArrowLeftIcon } from "@heroicons/react/24/solid";
// import placeholderBackdrop from '../../assets/placeholder-backdrop.png'; //
const DetailsPage = () => {
  const { mediaType, id } = useParams();
  const navigate = useNavigate();
  const { getImageUrl, loadingConfig } = useAppContext();
  const {
    data: details,
    loading: detailsLoading,
    error: detailsError,
  } = useFetch(fetchDetails, mediaType, id);

  const [selectedVideoKey, setSelectedVideoKey] = useState(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const [showStreamPlayer, setShowStreamPlayer] = useState(false);

  const itemDetails = useMemo(() => {
    if (!details) return null;
    return {
      computedTitle: details.title || details.name,
      computedReleaseDate: details.release_date || details.first_air_date,
      computedRuntime:
        details.runtime ||
        (details.episode_run_time && details.episode_run_time[0]),
      ...details, // Spread original details
    };
  }, [details]);

  const streamEmbedUrl = useMemo(() => {
    if (mediaType === "movie") {
      console.log(id);
      return `https://vidsrc.cc/v2/embed/movie/${id}`;
    } else if (mediaType === "tv") {
      // Ensure id, selectedSeason, selectedEpisode are valid before constructing
      if (id && selectedSeason > 0 && selectedEpisode > 0) {
        return `https://vidsrc.cc/v2/embed/tv/${id}/${selectedSeason}/${selectedEpisode}`;
      }
    }
    return ""; // Fallback to empty string
  }, [mediaType, id, selectedSeason, selectedEpisode]);
  console.log(streamEmbedUrl);
  // This useMemo depends on mediaType, itemDetails, selectedSeason
  // itemDetails itself is memoized and depends on `details`
  const episodesForSelectedSeason = useMemo(() => {
    // Ensure itemDetails and itemDetails.seasons are available before proceeding
    if (
      mediaType === "tv" &&
      itemDetails?.seasons &&
      Array.isArray(itemDetails.seasons)
    ) {
      const currentSeasonData = itemDetails.seasons.find(
        (s) => s.season_number === selectedSeason
      );
      if (currentSeasonData && currentSeasonData.episode_count > 0) {
        return Array.from(
          { length: currentSeasonData.episode_count },
          (_, i) => i + 1
        );
      }
    }
    return [];
  }, [mediaType, itemDetails, selectedSeason]);

  // === ALL SIDE EFFECTS (useEffect) NEXT ===
  useEffect(() => {
    window.scrollTo(0, 0);
    setShowStreamPlayer(false);
    setSelectedSeason(1);
    setSelectedEpisode(1);
  }, [mediaType, id]);

  // === HELPER FUNCTIONS (Not Hooks) ===
  const handleImageError = (e, placeholderSrc = placeholderBackdrop) => {
    // Added default placeholder
    e.target.onerror = null;
    e.target.src = placeholderSrc; // Use the provided placeholder
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const playTrailer = (key) => {
    setSelectedVideoKey(key);
    setShowVideoModal(true);
  };

  const handlePlayStream = () => {
    // Basic validation, can be enhanced
    if (mediaType === "movie" && id) {
      setShowStreamPlayer(true);
    } else if (
      mediaType === "tv" &&
      id &&
      selectedSeason > 0 &&
      selectedEpisode > 0
    ) {
      setShowStreamPlayer(true);
    } else {
      console.warn("Cannot play stream: Invalid media type or parameters.");
      // Optionally show a user-facing error/notification
    }
  };

  // === EARLY RETURNS FOR LOADING/ERROR STATES (AFTER ALL HOOKS) ===
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
        Error loading details: {detailsError}
      </div>
    );
  }

  // Now, if itemDetails is null (because details was null), we handle it.
  // This check is AFTER all hooks have been called.
  if (!itemDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-bg text-white text-xl">
        No details available to display.
      </div>
    );
  }

  // === DESTRUCTURE FROM itemDetails (NOW SAFE, AS itemDetails IS GUARANTEED TO BE POPULATED OR THE COMPONENT HAS RETURNED) ===
  // Using the computed property names for clarity, or use original names if you didn't rename them
  const {
    computedTitle: itemTitle, // Use the renamed computed properties
    backdrop_path,
    poster_path,
    overview,
    genres,
    computedReleaseDate: itemReleaseDate,
    vote_average,
    tagline,
    computedRuntime: itemRuntime,
    number_of_seasons,
    seasons, // This comes directly from 'details' spread into 'itemDetails'
    videos,
    credits,
    recommendations,
  } = itemDetails;

  // === DERIVED DATA (Not Hooks, using already defined variables) ===
  const officialTrailers =
    videos?.results
      ?.filter(
        (video) =>
          video.site === "YouTube" &&
          (video.type === "Trailer" || video.type === "Teaser")
      )
      .slice(0, 10) || [];
  const topCast = credits?.cast?.slice(0, 15) || [];
  const similarItems =
    recommendations?.results?.filter((item) => item.poster_path).slice(0, 15) ||
    [];

  return (
    <div className="bg-brand-bg text-white min-h-screen pb-16 md:pb-8 overflow-x-hidden">
      <div className="container mx-auto px-4 md:px-8 lg:px-12 pt-4 md:pt-6 relative z-30">
        <button
          onClick={handleGoBack}
          className="mb-3 md:mb-0 inline-flex items-center space-x-1.5 text-muted-foreground hover:text-brand-yellow transition-colors text-sm sm:text-sm rounded-full px-3 py-1.5 bg-zinc-800/25 hover:bg-zinc-800/60 backdrop-blur-sm cursor-pointer"
          aria-label="Go back to previous page"
        >
          <ArrowLeftIcon className="size-4 sm:size-5" />
          <span>Back</span>
        </button>
      </div>

      <div className="relative h-[50vh] md:h-[70vh] w-full -mt-12 md:-mt-16">
        <img
          src={getImageUrl(backdrop_path, "original")}
          alt={itemTitle ? `${itemTitle} backdrop` : "Backdrop"}
          className="w-full h-full object-cover object-center"
          onError={(e) => handleImageError(e, placeholderBackdrop)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-bg via-brand-bg/70 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-brand-bg/70 via-brand-bg/30 to-transparent md:w-2/3"></div>
      </div>

      <div className="container mx-auto px-4 md:px-8 lg:px-12 -mt-24 md:-mt-48 relative z-10">
        <div className="flex flex-col md:flex-row gap-6 md:gap-10">
          <div className="w-full md:w-1/3 lg:w-1/4 flex-shrink-0">
            <img
              src={getImageUrl(poster_path, "w500")}
              alt={itemTitle ? `${itemTitle} poster` : "Poster"}
              className="rounded-xl shadow-2xl w-2/3 md:w-full mx-auto md:mx-0 object-cover aspect-[2/3]"
              onError={(e) => handleImageError(e, getImageUrl(null))}
            />
          </div>

          <div className="md:w-2/3 lg:w-3/4 pt-0 md:pt-10">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-1 md:mb-2">
              {itemTitle || "Loading title..."}
            </h1>
            {tagline && (
              <p className="text-md md:text-lg text-brand-text-secondary italic mb-3 md:mb-4">
                {tagline}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-4 md:mb-5">
              {genres?.map((genre) => (
                <Link
                  key={genre.id}
                  to={`/explore/${mediaType}?genre=${genre.id}`}
                  className="bg-zinc-700 text-xs md:text-sm px-3 py-1 rounded-full hover:bg-brand-yellow hover:text-black transition-colors"
                >
                  {genre.name}
                </Link>
              ))}
            </div>

            <div className="flex items-center space-x-4 md:space-x-6 mb-4 md:mb-6">
              {vote_average > 0 && (
                <RatingCircle rating={vote_average} size={60} />
              )}
              <div className="flex flex-col space-y-1">
                {itemReleaseDate && (
                  <span className="text-sm text-brand-text-secondary flex items-center">
                    <CalendarDaysIcon className="w-4 h-4 mr-1.5" />
                    {new Date(itemReleaseDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                )}
                {itemRuntime != null && ( // Check for null or undefined explicitly for runtime
                  <span className="text-sm text-brand-text-secondary flex items-center">
                    <ClockIcon className="w-4 h-4 mr-1.5" /> {itemRuntime} min
                    {mediaType === "tv" &&
                      number_of_seasons &&
                      ` • ${number_of_seasons} Season${
                        number_of_seasons > 1 ? "s" : ""
                      }`}
                  </span>
                )}
              </div>
            </div>

            {overview && (
              <>
                <h3 className="text-xl font-semibold mb-2">Overview</h3>
                <p className="text-sm md:text-base text-brand-text-secondary leading-relaxed mb-6 md:mb-8">
                  {overview}
                </p>
              </>
            )}

            <div className="flex items-center flex-wrap gap-3 md:gap-4">
              <a
                // href={streamEmbedUrl}
                onClick={handlePlayStream}
                // target="_blank"
                className="bg-brand-orange text-white px-4 py-2 md:px-6 md:py-2.5 rounded-md font-semibold flex items-center space-x-2 hover:opacity-90 transition-opacity text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                disabled={!streamEmbedUrl} // Disable if no valid stream URL
              >
                <PlayIcon className="w-5 h-5" />
                <span>Watch Now</span>
              </a>
              {officialTrailers.length > 0 && (
                <button
                  onClick={() => playTrailer(officialTrailers[0].key)}
                  className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 md:px-6 md:py-2.5 rounded-md font-semibold flex items-center space-x-2 hover:bg-white/30 transition-colors text-sm md:text-base"
                >
                  <PlayIcon className="w-5 h-5" />
                  <span>Trailer</span>
                </button>
              )}
              <button
                className="bg-white/10 backdrop-blur-sm text-white px-4 py-2 md:px-6 md:py-2.5 rounded-md font-semibold flex items-center space-x-2 hover:bg-white/20 transition-colors text-sm md:text-base"
                onClick={() => alert(`Add to watchlist (not implemented)`)}
              >
                <PlusIcon className="w-5 h-5" />
                <span>Watchlist</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {showStreamPlayer &&
        streamEmbedUrl && ( // Also check if streamEmbedUrl is valid
          <section className="container mx-auto px-4 md:px-8 lg:px-12 py-8 md:py-12">
            {/* ... (rest of stream player section, looks okay) ... */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg md:text-3xl font-semibold">
                Now Streaming: {itemTitle}
                {mediaType === "tv" &&
                  ` - S${selectedSeason} E${selectedEpisode}`}
              </h2>
              <button
                onClick={() => setShowStreamPlayer(false)}
                className="text-sm text-brand-text-secondary hover:text-white inline-flex items-center"
              >
               <XMarkIcon className="w-5 h-5" /> Close
              </button>
            </div>

            {mediaType === "tv" && seasons && seasons.length > 0 && (
              <div className="flex flex-wrap gap-4 mb-6 p-4 bg-brand-card rounded-lg">
                <div>
                  <label
                    htmlFor="season-select"
                    className="block text-sm font-medium text-brand-text-secondary mb-1"
                  >
                    Season:
                  </label>
                  <select
                    id="season-select"
                    value={selectedSeason}
                    onChange={(e) => {
                      setSelectedSeason(Number(e.target.value));
                      setSelectedEpisode(1);
                    }}
                    className="bg-zinc-700 border border-zinc-600 text-white text-sm rounded-lg focus:ring-brand-yellow focus:border-brand-yellow block w-full p-2.5"
                  >
                    {seasons
                      .filter((s) => s.season_number > 0 && s.episode_count > 0)
                      .map((season) => (
                        <option key={season.id} value={season.season_number}>
                          {season.name || `Season ${season.season_number}`} (
                          {season.episode_count} ep.)
                        </option>
                      ))}
                  </select>
                </div>
                {episodesForSelectedSeason.length > 0 && (
                  <div>
                    <label
                      htmlFor="episode-select"
                      className="block text-sm font-medium text-brand-text-secondary mb-1"
                    >
                      Episode:
                    </label>
                    <select
                      id="episode-select"
                      value={selectedEpisode}
                      onChange={(e) =>
                        setSelectedEpisode(Number(e.target.value))
                      }
                      className="bg-zinc-700 border border-zinc-600 text-white text-sm rounded-lg focus:ring-brand-yellow focus:border-brand-yellow block w-full p-2.5"
                    >
                      {episodesForSelectedSeason.map((epNum) => (
                        <option key={epNum} value={epNum}>
                          Episode {epNum}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}
            <div className="aspect-video bg-black rounded-lg overflow-hidden shadow-2xl">
              <iframe
                src={streamEmbedUrl}
                title={`Streaming ${itemTitle || "Content"}`}
                allowFullScreen
                allow="autoplay; encrypted-media; picture-in-picture"
                className="w-full h-full border-0"
              ></iframe>
            </div>
          </section>
        )}

      {/* ... (Cast, Official Videos, Recommendations sections - should be okay if data is handled) ... */}
      {topCast.length > 0 && (
        <section className="container mx-auto px-2 md:px-8 lg:px-12 py-8 md:py-12 ">
          <div className="flex justify-between items-center mt-4">
            <h2 className="text-2xl md:text-3xl font-semibold mb-4 md:mb-6">
              Top Cast
            </h2>
            <div className="items-center gap-2 hidden md:flex lg:flex">
            <button className="cast-prev bg-brand-card rounded-full p-2" aria-label="Previous cast">
              <ChevronLeftIcon className="w-6 h-6" />
            </button>
            <button className="cast-next bg-brand-card rounded-full p-2" aria-label="Next cast">
              <ChevronRightIcon className="w-6 h-6" />
            </button>
            </div>
          </div>
          <Swiper
            modules={[Navigation, FreeMode]}
            navigation={{ prevEl: ".cast-prev", nextEl: ".cast-next" }}
            freeMode={true}
            spaceBetween={16}
            slidesPerView={"auto"}
            className="!-mx-4 px-4 cast-swiper"
          >
            {topCast.map((actor) => (
              <SwiperSlide
                key={actor.cast_id || actor.id}
                className="!w-[120px] md:!w-[150px]"
              >
                <CastCard actor={actor} />
              </SwiperSlide>
            ))}
          </Swiper>
        </section>
      )}

      {officialTrailers.length > 0 && !showStreamPlayer && (
        <section className="container mx-2 px-4 md:px-8 lg:px-12 py-8 md:py-12">
          <div className="flex justify-between items-center mt-4">
            <h2 className="text-2xl md:text-3xl -ml-4 font-semibold mb-4 md:mb-6">
              Official Videos
            </h2>
            <div className="items-center gap-2 hidden md:flex lg:flex">
            <button className="videos-prev bg-brand-card rounded-full p-2 cursor-pointer" aria-label="Previous videos">
              <ChevronLeftIcon className="w-6 h-6" />
            </button>
            <button className="videos-next bg-brand-card rounded-full p-2 cursor-pointer" aria-label="Next videos">
              <ChevronRightIcon className="w-6 h-6" />
            </button>
            </div>
          </div>
          {/* ... Swiper for videos ... */}
          <Swiper
            modules={[Navigation, FreeMode]}
            navigation={{ prevEl: ".videos-prev", nextEl: ".videos-next" }}
            freeMode={true}
            spaceBetween={16}
            slidesPerView={"auto"}
            className="!-mx-4 px-4 videos-swiper"
          >
            {officialTrailers.map((video) => (
              <SwiperSlide
                key={video.id}
                className="!w-[280px] md:!w-[320px] group"
              >
                <div
                  className="relative aspect-video rounded-lg overflow-hidden cursor-pointer shadow-lg"
                  onClick={() => playTrailer(video.key)}
                >
                  <img
                    src={`https://img.youtube.com/vi/${video.key}/mqdefault.jpg`}
                    alt={video.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <PlayIcon className="w-12 h-12 text-white" />
                  </div>
                  <p className="absolute bottom-2 left-2 right-2 text-xs text-white bg-black/50 px-2 py-1 rounded truncate">
                    {video.name}
                  </p>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </section>
      )}

      {similarItems.length > 0 && (
        <section className="container mx-2 px-4 md:px-8 lg:px-12 py-8 md:py-12">
          <div className="flex justify-between items-center mt-4">
            <h2 className="text-2xl md:text-3xl -ml-4 font-semibold mb-4 md:mb-6">
              {mediaType === "movie" ? "Similar Movies" : "Similar Shows"}
            </h2>
            <div className="items-center gap-2 hidden md:flex lg:flex">
            <button className="recommendations-prev bg-brand-card rounded-full p-2 cursor-pointer" aria-label="Previous recommendations">
              <ChevronLeftIcon className="w-6 h-6" />
            </button>
            <button className="recommendations-next bg-brand-card rounded-full p-2 cursor-pointer" aria-label="Next recommendations">
              <ChevronRightIcon className="w-6 h-6" />
            </button>
            </div>
          </div>
          {/* ... Swiper for recommendations ... */}
          <Swiper
            modules={[Navigation, FreeMode]}
            navigation={{ prevEl: ".recommendations-prev", nextEl: ".recommendations-next" }}   
            freeMode={true}
            spaceBetween={16}
            slidesPerView={"auto"}
            className="!-mx-4 px-4 recommendations-swiper"
          >
            {similarItems.map((item) => (
              <SwiperSlide
                key={item.id}
                className="!w-[150px] sm:!w-[160px] md:!w-[180px]"
              >
                <MovieCard
                  item={item}
                  mediaType={item.media_type || mediaType}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </section>
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
