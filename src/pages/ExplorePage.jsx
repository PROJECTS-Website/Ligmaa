import { useState } from "react";
import MovieCard from "../components/MovieCard";
import useFetch from "../hooks/useFetch";
import {
  fetchGenres,
  fetchGenreMovies,
  fetchGenreTVShows,
} from "../services/tmdbApi";
import { useParams } from "react-router-dom";
import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import Spinner from "../components/Spinner";

const ExplorePage = () => {
  const { query } = useParams();
  const [activeGenre, setActiveGenre] = useState(
    query === "movie" ? 12 : 10751
  );
  const [page, setPage] = useState(1);
  const { data: genre } = useFetch(fetchGenres, query);
  const { data, loading, error } = useFetch(
    query === "movie" ? fetchGenreMovies : fetchGenreTVShows,
    activeGenre,
    page
  );
  return (
    <div className="container mx-auto p-4 py-6 min-h-screen text-white">
      <h1 className="text-2xl font-bold mb-4 text-left text-gray-200">
        Explore {query === "show" ? "TV Shows" : "Movies"}
      </h1>
      <div className="flex gap-2 overflow-x-auto scrollbar-hide">
        {genre?.genres?.map((genre) => (
          <div key={genre.id}>
            <h2
              className={`text-sm bg-zinc-800 border border-zinc-700 px-4 py-2 rounded-md font-semibold mb-2 w-fit text-left text-gray-200 transition-colors whitespace-nowrap overflow-hidden text-ellipsis max-w-xs cursor-pointer ${
                activeGenre === genre.id
                  ? "bg-zinc-900/50 box-border !border-yellow-600"
                  : ""
              }`}
              onClick={() => setActiveGenre(genre.id)}
            >
              {genre.name}
            </h2>
          </div>
        ))}
      </div>
      {activeGenre && (
        <div>
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-left text-gray-200 my-4">
              {genre?.genres?.find((g) => g.id === activeGenre)?.name}
            </h2>
            <div className="flex justify-center items-center">
              <span className="text-sm font-semibold text-[#8f8f8f] mr-2">{page} - {data?.total_pages}</span>
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1 || data?.total_pages === page}
                className="text-white px-2 py-2 rounded-md mr-1 disabled:opacity-50 cursor-pointer"
              >
                <ArrowLeftIcon className="size-5 stroke-2" />
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={data?.total_pages === page}
                className="text-white px-2 py-2 rounded-md disabled:opacity-50 cursor-pointer"
              >
                <ArrowRightIcon className="size-5 stroke-2" />
              </button>
            </div>
          </div>
          {loading && (
             <div className="text-center min-h-[550px] flex items-center justify-center w-full">
             <p className="text-lg animate-pulse m-4 flex items-center gap-2">
               <Spinner />
               Loading results...</p>
           </div>
            )}
            {error && (
              <div className="text-center min-h-[250px] flex items-center justify-center w-full">
                <p className="text-lg text-red-500">
                  Error loading results: {error}
                </p>
              </div>
            )}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {data?.results?.map((result) => (
              <MovieCard key={result.id} item={result} mediaType={query} />
            ))}
            
          </div>
        </div>
      )}
    </div>
  );
};

export default ExplorePage;
