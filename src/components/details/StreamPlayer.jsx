import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const StreamPlayer = ({
  mediaType,
  title,
  streamEmbedUrl,
  seasons,
  selectedSeason,
  selectedEpisode,
  onSeasonChange,
  onEpisodeChange,
  episodesForSelectedSeason,
  onClose,
}) => {
  return (
    <section className="container mx-auto px-4 md:px-8 lg:px-12 py-8 md:py-12">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg md:text-3xl font-semibold">
          Now Streaming: {title}
          {mediaType === "tv" && ` - S${selectedSeason} E${selectedEpisode}`}
        </h2>
        <button
          onClick={onClose}
          className="text-sm text-brand-text-secondary hover:text-white inline-flex items-center"
        >
          <XMarkIcon className="w-5 h-5 mr-1" /> Close
        </button>
      </div>

      {mediaType === "tv" && seasons?.length > 0 && (
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
                onSeasonChange(Number(e.target.value));
                onEpisodeChange(1);
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
                onChange={(e) => onEpisodeChange(Number(e.target.value))}
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
          title={`Streaming ${title || "Content"}`}
          allowFullScreen
          allow="autoplay; encrypted-media; picture-in-picture"
          className="w-full h-full border-0"
        ></iframe>
      </div>
    </section>
  );
};

export default StreamPlayer;