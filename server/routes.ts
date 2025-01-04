import type { Express } from "express";
import { createServer, type Server } from "http";

export function registerRoutes(app: Express): Server {
  // Using a public API key for development/testing
  const GIPHY_API_KEY = process.env.GIPHY_API_KEY || "CdRKiCMbTnt9CkZTZ0lGukSczk6iT4Z6"; 

  app.get("/api/gifs", async (req, res) => {
    try {
      const { q = "", offset = "0", limit = "20" } = req.query;

      const params = new URLSearchParams({
        api_key: GIPHY_API_KEY,
        q: q as string,
        offset: offset as string,
        limit: limit as string,
        rating: 'g' // Adding rating parameter for safe content
      });

      const url = `https://api.giphy.com/v1/gifs/search?${params}`;
      console.log(`Fetching GIFs from: ${url}`);

      const response = await fetch(url);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Giphy API error: ${response.status} - ${errorText}`);
        throw new Error(`Giphy API error: ${response.status}`);
      }

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error('Error fetching GIFs:', error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Internal server error" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}