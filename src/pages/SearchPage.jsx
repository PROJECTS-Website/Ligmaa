"use client";

import React, { useState, useEffect, useCallback } from "react";
import useFetch from "../hooks/useFetch";
import { searchMulti} from "../services/tmdbApi";
import MovieCard from "../components/MovieCard";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import Spinner from "../components/Spinner";

const SearchPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [inputValue, setInputValue] = useState("");
  const { data, loading, error } = useFetch(
    searchMulti,
    decodeURIComponent(searchTerm),
    1
  );

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  // Debounce function
  const debounceSearch = useCallback(() => {
    const handler = setTimeout(() => {
      setSearchTerm(inputValue.trim());
    }, 500); // 500ms delay

    return () => {
      clearTimeout(handler);
    };
  }, [inputValue]);

  useEffect(() => {
    const cleanup = debounceSearch();
    return cleanup;
  }, [debounceSearch]);
  return (
    <div className="container mx-auto p-4 py-6 min-h-screen  text-white">
      <h1 className="text-2xl font-bold mb-4 text-left text-gray-200">
        Search
      </h1>

      <form
        onSubmit={(e) => e.preventDefault()}
        className="mb-8 flex justify-center"
      >
       <div className="relative w-full max-w-xl">
       <MagnifyingGlassIcon className="size-5 stroke-2 text-gray-200 absolute left-3 top-1/2 transform -translate-y-1/2" />
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder="Search for a movie or TV series..."
          className="w-full max-w-xl p-3 rounded-lg bg-[#222] text-white focus:outline-none pl-10"
        />
       </div>
      </form>

      {loading && (
        <div className="text-center min-h-svh flex items-center justify-center">
          <p className="text-lg animate-pulse m-4 flex items-center gap-2">
            <Spinner />
            Loading results...</p>
        </div>
      )}

      {!loading && data?.results?.length === 0 && searchTerm.trim() !== "" && (
        <div className="text-center">
          <p className="text-lg">No results found for \"{searchTerm}\".</p>
        </div>  
      )}

      {
        error && (
          <div className="text-center">
            <p className="text-lg text-red-500">Error loading results: {error}</p>
          </div>
        )
      }
      {
        !loading && data?.results?.length === 0 && searchTerm.trim() === "" && (
          <div className="text-center">
            <p className="text-xl text-[#8f8f8f] ">Enter a search term to get started.</p>
          </div>
        )
      }
      {!loading && data?.results?.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {data?.results?.map((result) => (
            <MovieCard
              key={result.id}
              item={result}
              mediaType={result.media_type}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchPage;
