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
      // Create an img element to load the GIF
      const img = document.createElement('img');
      img.src = gif.images.original.url;

      // Wait for the image to load
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      // Create a canvas to draw the image
      const canvas = document.createElement('canvas');
      canvas.width = parseInt(gif.images.original.width);
      canvas.height = parseInt(gif.images.original.height);

      // Draw the image to canvas
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Failed to get canvas context');
      }
      ctx.drawImage(img, 0, 0);

      // Convert to blob
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Failed to create blob'));
        }, 'image/png');
      });

      // Try to copy as blob
      try {
        await navigator.clipboard.write([
          new ClipboardItem({
            'image/png': blob
          })
        ]);
        toast({
          description: "GIF copied! You can now paste it directly.",
          duration: 2000,
        });
      } catch (writeError) {
        console.error('Clipboard write error:', writeError);
        // Try alternative method for copying
        try {
          await navigator.clipboard.writeText(gif.images.original.url);
          toast({
            description: "Copied GIF URL (Your browser doesn't support direct GIF copy)",
            duration: 3000,
          });
        } catch (textError) {
          throw new Error('Failed to copy both as image and URL');
        }
      }
    } catch (err) {
      console.error('Copy error:', err);
      toast({
        variant: "destructive",
        description: "Failed to copy GIF. Try again or right-click to copy.",
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