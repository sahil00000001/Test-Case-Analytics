import { type DashboardState } from "@shared/schema";
import { randomUUID } from "crypto";

// Storage interface for dashboard data
export interface IStorage {
  saveDashboardData(id: string, data: DashboardState): Promise<void>;
  getDashboardData(id: string): Promise<DashboardState | undefined>;
  getAllDashboardData(): Promise<DashboardState[]>;
}

export class MemStorage implements IStorage {
  private dashboards: Map<string, DashboardState>;

  constructor() {
    this.dashboards = new Map();
  }

  async saveDashboardData(id: string, data: DashboardState): Promise<void> {
    this.dashboards.set(id, data);
  }

  async getDashboardData(id: string): Promise<DashboardState | undefined> {
    return this.dashboards.get(id);
  }

  async getAllDashboardData(): Promise<DashboardState[]> {
    return Array.from(this.dashboards.values());
  }
}

export const storage = new MemStorage();
