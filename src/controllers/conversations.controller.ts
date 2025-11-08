import type { Request, Response, NextFunction } from "express";
import { HttpError } from "../utils/errors.js";
import type { StorageAdapter } from "../storage/adapter.js";
import { generateReply } from "../services/reply.service.js";

export const conversationsController = (store: StorageAdapter) => ({
  start: async (req: any, res: Response, next: NextFunction) => {
    try {
      const { agentId, message } = req.parsed;
      const agent = await store.getAgent(agentId);
      if (!agent) throw new HttpError(404, "Agent not found");

      const convo = await store.createConversation(agentId);
      await store.addMessage({ conversationId: convo.id, role: "user", content: message });

      const reply = generateReply(agent, message);
      await store.addMessage({ conversationId: convo.id, role: "agent", content: reply });

      const messages = await store.listMessages(convo.id);
      res.status(201).json({ conversationId: convo.id, agentReply: reply, messages });
    } catch (e) { next(e); }
  },

  send: async (req: any, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { message } = req.parsed;

      const convo = await store.getConversation(id);
      if (!convo) throw new HttpError(404, "Conversation not found");

      const agent = await store.getAgent(convo.agentId);
      if (!agent) throw new HttpError(404, "Agent not found");

      await store.addMessage({ conversationId: convo.id, role: "user", content: message });
      const reply = generateReply(agent, message);
      await store.addMessage({ conversationId: convo.id, role: "agent", content: reply });

      const messages = await store.listMessages(convo.id);
      res.status(201).json({ agentReply: reply, messages });
    } catch (e) { next(e); }
  },
});
