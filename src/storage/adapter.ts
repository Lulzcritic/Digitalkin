import type { Agent, Conversation, Message } from "../models/types.js";

export interface StorageAdapter {
  // Agents
  listAgents(): Promise<Agent[]>;
  createAgent(data: Omit<Agent, "id"|"createdAt"|"updatedAt">): Promise<Agent>;
  getAgent(id: string): Promise<Agent | null>;
  updateAgent(id: string, patch: Partial<Agent>): Promise<Agent | null>;
  deleteAgent(id: string): Promise<boolean>;

  // Conversations/ Messages
  createConversation(agentId: string): Promise<Conversation>;
  getConversation(id: string): Promise<Conversation | null>;
  addMessage(data: Omit<Message, "id"|"timestamp">): Promise<Message>;
  listMessages(conversationId: string): Promise<Message[]>;
}
