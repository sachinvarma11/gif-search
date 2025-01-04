import { useEffect, useRef, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Search } from "lucide-react";
import { useDebouncedCallback } from "@/lib/giphy";
import GifGrid from "@/components/GifGrid";
import SearchInput from "@/components/SearchInput";

export default function Home() {
  const [search, setSearch] = useState("");
  const { toast } = useToast();
  const observerTarget = useRef<HTMLDivElement>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isError,
    error
  } = useInfiniteQuery({
    queryKey: ['/api/gifs', search],
    queryFn: async ({ pageParam = 0 }) => {
      const params = new URLSearchParams({
        q: search,
        offset: pageParam.toString()
      });
      const response = await fetch(`/api/gifs?${params}`);
      if (!response.ok) throw new Error('Failed to fetch gifs');
      return response.json();
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination.total_count > lastPage.pagination.offset + lastPage.pagination.count) {
        return lastPage.pagination.offset + lastPage.pagination.count;
      }
      return undefined;
    },
    enabled: search.length > 0
  });

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 1.0 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage]);

  const debouncedSearch = useDebouncedCallback((value: string) => {
    setSearch(value);
  }, 500);

  const allGifs = data?.pages.flatMap(page => page.data) ?? [];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto mb-8">
          <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            GIF Search Engine
          </h1>
          
          <SearchInput 
            onChange={(e) => debouncedSearch(e.target.value)}
            placeholder="Search for GIFs..."
          />
        </div>

        {isError && (
          <div className="text-destructive text-center mb-4">
            {error instanceof Error ? error.message : 'An error occurred'}
          </div>
        )}

        <GifGrid 
          gifs={allGifs} 
          isLoading={isLoading}
          search={search}
        />

        <div ref={observerTarget} className="h-4" />
      </div>
    </div>
  );
}
