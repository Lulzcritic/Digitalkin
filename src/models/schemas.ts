import { z } from "zod";

export const AgentCreateSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  persona: z.string().optional(),
  rules: z.object({
    keywords: z.record(z.string(), z.array(z.string().min(1))).optional(),
    fallback: z.string().optional(),
    canned: z.array(z.string().min(1)).optional(),
    mode: z.enum(["echo", "keyword", "canned"]).optional()
  }).optional()
});

export const AgentUpdateSchema = AgentCreateSchema.partial();

export const StartConversationSchema = z.object({
  agentId: z.uuid(),
  message: z.string().min(1)
});

export const SendMessageSchema = z.object({
  message: z.string().min(1)
});
