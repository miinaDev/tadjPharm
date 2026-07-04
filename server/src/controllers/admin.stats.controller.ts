import type { Request, Response } from "express";
import * as statsService from "../services/stats.service";

export async function getStats(_req: Request, res: Response) {
  const stats = await statsService.getDashboardStats();
  res.json(stats);
}
