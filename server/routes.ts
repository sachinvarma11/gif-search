import type { Express } from "express";
import { createServer, type Server } from "http";

export function registerRoutes(app: Express): Server {
  const GIPHY_API_KEY = process.env.GIPHY_API_KEY || "dc6zaTOxFJmzC"; // Using public beta key as fallback

  app.get("/api/gifs", async (req, res) => {
    try {
      const { q = "", offset = "0", limit = "20" } = req.query;
      
      const params = new URLSearchParams({
        api_key: GIPHY_API_KEY,
        q: q as string,
        offset: offset as string,
        limit: limit as string,
      });

      const response = await fetch(
        `https://api.giphy.com/v1/gifs/search?${params}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch from Giphy API");
      }

      const data = await response.json();
      res.json(data);
    } catch (error) {
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Internal server error" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
