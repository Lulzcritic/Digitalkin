import { Router } from "express";
import type { StorageAdapter } from "../storage/adapter.js";
import { conversationsController } from "../controllers/conversations.controller.js";
import { validate } from "../utils/validate.js";
import { StartConversationSchema, SendMessageSchema } from "../models/schemas.js";
import { container } from "../app.js";

export const makeConversationsRouter = (store: StorageAdapter) => {
  const router = Router();
  const ctrl = conversationsController(container.store);

  router.post("/", validate(StartConversationSchema), ctrl.start);
  router.post("/:id/messages", validate(SendMessageSchema), ctrl.send);

  return router;
};

export default makeConversationsRouter;
