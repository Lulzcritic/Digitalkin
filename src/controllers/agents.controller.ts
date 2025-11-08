import type { Request, Response, NextFunction } from "express";
import { HttpError } from "../utils/errors.js";
import type { StorageAdapter } from "../storage/adapter.js";

export const agentsController = (store: StorageAdapter) => ({
  list: async (_req: Request, res: Response, next: NextFunction) => {
    try { res.json(await store.listAgents()); } catch (e) { next(e); }
  },
  create: async (req: any, res: Response, next: NextFunction) => {
    try { const created = await store.createAgent(req.parsed); res.status(201).json(created); }
    catch (e) { next(e); }
  },
  get: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const a = await store.getAgent(req.params.id!);
      if (!a) throw new HttpError(404, "Agent not found");
      res.json(a);
    } catch (e) { next(e); }
  },
  update: async (req: any, res: Response, next: NextFunction) => {
    try {
      const u = await store.updateAgent(req.params.id, req.parsed);
      if (!u) throw new HttpError(404, "Agent not found");
      res.json(u);
    } catch (e) { next(e); }
  },
  remove: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ok = await store.deleteAgent(req.params.id!);
      if (!ok) throw new HttpError(404, "Agent not found");
      res.status(204).send();
    } catch (e) { next(e); }
  }
});
