import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Copy } from "lucide-react";
import type { GiphyGif } from "@/types/giphy";

interface GifGridProps {
  gifs: GiphyGif[];
  isLoading: boolean;
  search: string;
}

export default function GifGrid({ gifs, isLoading, search }: GifGridProps) {
  const { toast } = useToast();

  const copyToClipboard = async (gif: GiphyGif) => {
    try {
      // Fetch the GIF file
      const response = await fetch(gif.images.original.url);
      const blob = await response.blob();

      // Try to copy as blob first (for modern browsers)
      try {
        await navigator.clipboard.write([
          new ClipboardItem({
            [blob.type]: blob
          })
        ]);
        toast({
          description: "GIF copied! You can now paste it directly.",
          duration: 2000,
        });
      } catch (writeError) {
        // Fallback to copying URL if blob copy fails
        await navigator.clipboard.writeText(gif.images.original.url);
        toast({
          description: "Copied GIF URL (Your browser doesn't support direct GIF copy)",
          duration: 3000,
        });
      }
    } catch (err) {
      toast({
        variant: "destructive",
        description: "Failed to copy GIF",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(12)].map((_, i) => (
          <Skeleton key={i} className="w-full h-48" />
        ))}
      </div>
    );
  }

  if (gifs.length === 0 && search) {
    return (
      <div className="text-center text-muted-foreground">
        No GIFs found for "{search}"
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {gifs.map((gif) => (
        <Card
          key={gif.id}
          className="group relative overflow-hidden cursor-pointer transition-transform hover:scale-105"
          onClick={() => copyToClipboard(gif)}
        >
          <img
            src={gif.images.fixed_height.url}
            alt={gif.title}
            loading="lazy"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="flex flex-col items-center gap-2 text-white">
              <Copy className="h-6 w-6" />
              <span className="text-sm font-medium">Click to copy GIF</span>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}