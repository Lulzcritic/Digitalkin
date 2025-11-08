import { Router } from "express";
import { AgentCreateSchema, AgentUpdateSchema } from "../models/schemas.js";
import { validate } from "../utils/validate.js";
import { agentsController } from "../controllers/agents.controller.js";
import { container } from "../app.js";
import type { StorageAdapter } from "../storage/adapter.js";

export const makeAgentsRouter = (store: StorageAdapter) => {
  const router = Router();
  const ctrl = agentsController(container.store);

  router.get("/", ctrl.list);
  router.post("/", validate(AgentCreateSchema), ctrl.create);
  router.get("/:id", ctrl.get);
  router.put("/:id", validate(AgentUpdateSchema), ctrl.update);
  router.delete("/:id", ctrl.remove);

  return router;
};

export default makeAgentsRouter;
