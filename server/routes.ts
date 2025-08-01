import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { dashboardStateSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Dashboard data API routes
  app.get("/api/dashboard/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const data = await storage.getDashboardData(id);
      if (!data) {
        return res.status(404).json({ error: "Dashboard not found" });
      }
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch dashboard data" });
    }
  });

  app.post("/api/dashboard/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = dashboardStateSchema.parse(req.body);
      await storage.saveDashboardData(id, validatedData);
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: "Invalid dashboard data" });
    }
  });

  app.get("/api/dashboards", async (req, res) => {
    try {
      const dashboards = await storage.getAllDashboardData();
      res.json(dashboards);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch dashboards" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
