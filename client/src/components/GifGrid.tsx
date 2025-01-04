import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Copy } from "lucide-react";

interface GifGridProps {
  gifs: any[];
  isLoading: boolean;
  search: string;
}

export default function GifGrid({ gifs, isLoading, search }: GifGridProps) {
  const { toast } = useToast();

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast({
        description: "GIF URL copied to clipboard!",
        duration: 2000,
      });
    } catch (err) {
      toast({
        variant: "destructive",
        description: "Failed to copy GIF URL",
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
          onClick={() => copyToClipboard(gif.images.original.url)}
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
              <span className="text-sm font-medium">Click to copy</span>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}