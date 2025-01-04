import { useEffect, useRef, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useDebouncedCallback } from "@/lib/giphy";
import type { GiphyResponse } from "@/types/giphy";
import GifGrid from "@/components/GifGrid";
import SearchInput from "@/components/SearchInput";
import FilterBar from "@/components/FilterBar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Home() {
  const [search, setSearch] = useState("");
  const [rating, setRating] = useState("g");
  const [activeTab, setActiveTab] = useState("search");
  const { toast } = useToast();
  const observerTarget = useRef<HTMLDivElement>(null);

  const searchQuery = useInfiniteQuery({
    queryKey: ['/api/gifs', search, rating],
    queryFn: async ({ pageParam = 0 }) => {
      const params = new URLSearchParams({
        q: search,
        offset: String(pageParam),
        rating
      });
      const response = await fetch(`/api/gifs?${params}`);
      if (!response.ok) throw new Error('Failed to fetch gifs');
      return response.json() as Promise<GiphyResponse>;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage: GiphyResponse) => {
      if (lastPage.pagination.total_count > lastPage.pagination.offset + lastPage.pagination.count) {
        return lastPage.pagination.offset + lastPage.pagination.count;
      }
      return undefined;
    },
    enabled: search.length > 0 && activeTab === "search"
  });

  const trendingQuery = useInfiniteQuery({
    queryKey: ['/api/gifs/trending', rating],
    queryFn: async ({ pageParam = 0 }) => {
      const params = new URLSearchParams({
        offset: String(pageParam),
        rating
      });
      const response = await fetch(`/api/gifs/trending?${params}`);
      if (!response.ok) throw new Error('Failed to fetch trending gifs');
      return response.json() as Promise<GiphyResponse>;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage: GiphyResponse) => {
      if (lastPage.pagination.total_count > lastPage.pagination.offset + lastPage.pagination.count) {
        return lastPage.pagination.offset + lastPage.pagination.count;
      }
      return undefined;
    },
    enabled: activeTab === "trending"
  });

  const currentQuery = activeTab === "search" ? searchQuery : trendingQuery;

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && currentQuery.hasNextPage) {
          currentQuery.fetchNextPage();
        }
      },
      { threshold: 1.0 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [currentQuery.fetchNextPage, currentQuery.hasNextPage]);

  const debouncedSearch = useDebouncedCallback((value: string) => {
    setSearch(value);
  }, 500);

  const allGifs = currentQuery.data?.pages.flatMap(page => page.data) ?? [];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto mb-8">
          <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            GIF Search Engine
          </h1>

          <Tabs defaultValue="search" onValueChange={setActiveTab} className="mb-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="search">Search</TabsTrigger>
              <TabsTrigger value="trending">Trending</TabsTrigger>
            </TabsList>
            <TabsContent value="search">
              <SearchInput 
                onChange={(e) => debouncedSearch(e.target.value)}
                placeholder="Search for GIFs..."
              />
            </TabsContent>
          </Tabs>

          <FilterBar
            rating={rating}
            onRatingChange={setRating}
            className="mt-4"
          />
        </div>

        {currentQuery.isError && (
          <div className="text-destructive text-center mb-4">
            {currentQuery.error instanceof Error ? currentQuery.error.message : 'An error occurred'}
          </div>
        )}

        <GifGrid 
          gifs={allGifs} 
          isLoading={currentQuery.isLoading}
          search={activeTab === "search" ? search : "Trending GIFs"}
        />

        <div ref={observerTarget} className="h-4" />
      </div>
    </div>
  );
}