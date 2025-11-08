import { randomUUID } from "crypto";
import type { StorageAdapter } from "./adapter.js";
import type { Agent, Conversation, Message } from "../models/types.js";

const now = () => new Date().toISOString();

export class MemoryStorage implements StorageAdapter {
  agents: Agent[] = [];
  conversations: Conversation[] = [];
  messages: Message[] = [];

  // ---------- AGENTS ----------
  async listAgents(): Promise<Agent[]> {
    return [...this.agents].sort((a,b)=> a.createdAt.localeCompare(b.createdAt));
  }

  async createAgent(data: Omit<Agent,"id"|"createdAt"|"updatedAt">): Promise<Agent> {
    const a: Agent = { id: randomUUID(), createdAt: now(), updatedAt: now(), ...data };
    this.agents.push(a);
    return a;
  }

  async getAgent(id: string): Promise<Agent | null> {
    return this.agents.find(a=>a.id===id) ?? null;
  }

  async updateAgent(id: string, patch: Partial<Agent>): Promise<Agent | null> {
    const idx = this.agents.findIndex(a=>a.id===id);
    if (idx === -1) return null;
    const merged = { ...this.agents[idx], ...patch, updatedAt: now() } as Agent;
    this.agents[idx] = merged;
    return merged;
  }

  async deleteAgent(id: string): Promise<boolean> {
    const n = this.agents.length;
    this.agents = this.agents.filter(a=>a.id!==id);
    return this.agents.length < n;
  }

  // ---------- CONVERSATIONS ----------
  async createConversation(agentId: string): Promise<Conversation> {
    const c: Conversation = { id: randomUUID(), agentId, status:"open", createdAt: now(), updatedAt: now() };
    this.conversations.push(c);
    return c;
  }

  async getConversation(id: string): Promise<Conversation | null> {
    return this.conversations.find(c=>c.id===id) ?? null;
  }

  // ---------- MESSAGES ----------
  async addMessage(m: Omit<Message,"id"|"timestamp">): Promise<Message> {
    const msg: Message = { id: randomUUID(), timestamp: now(), ...m };
    this.messages.push(msg);
    return msg;
  }

  async listMessages(conversationId: string): Promise<Message[]> {
    return this.messages
      .filter(m=>m.conversationId===conversationId)
      .sort((a,b)=> a.timestamp.localeCompare(b.timestamp));
  }

  // ---------- Tests helpers (optionnels) ----------
  resetAll() {
    this.agents = [];
    this.conversations = [];
    this.messages = [];
  }
}
