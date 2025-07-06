import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCalendarSessionSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Get visit types
  app.get("/api/visit-types", async (req, res) => {
    try {
      const visitTypes = await storage.getVisitTypes();
      res.json(visitTypes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch visit types" });
    }
  });

  // Get calendar session
  app.get("/api/calendar-session/:userName", async (req, res) => {
    try {
      const { userName } = req.params;
      const session = await storage.getCalendarSession(userName);
      if (!session) {
        return res.status(404).json({ error: "Calendar session not found" });
      }
      res.json(session);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch calendar session" });
    }
  });

  // Save calendar session
  app.post("/api/calendar-session", async (req, res) => {
    try {
      const validatedData = insertCalendarSessionSchema.parse(req.body);
      const session = await storage.saveCalendarSession(validatedData);
      res.json(session);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to save calendar session" });
    }
  });

  // Update calendar session
  app.put("/api/calendar-session/:userName", async (req, res) => {
    try {
      const { userName } = req.params;
      const updateData = req.body;
      const session = await storage.updateCalendarSession(userName, updateData);
      res.json(session);
    } catch (error) {
      res.status(500).json({ error: "Failed to update calendar session" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
