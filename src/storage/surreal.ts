import { randomUUID } from "crypto";
import type { StorageAdapter } from "./adapter.js";
import type { Agent, Conversation, Message } from "../models/types.js";
import { SurrealClient } from "../utils/surrealClient.js";

const now = () => new Date().toISOString();

export class SurrealStorage implements StorageAdapter {
  constructor(private client: SurrealClient) {}

  // query agents
  async listAgents(): Promise<Agent[]> {
    const q = `SELECT * FROM agent ORDER BY createdAt ASC;`;
    return await this.client.sql<Agent>(q);
  }

  async createAgent(data: Omit<Agent,"id"|"createdAt"|"updatedAt">): Promise<Agent> {
    const doc: Agent = { id: randomUUID(), createdAt: now(), updatedAt: now(), ...data };
    const q = `CREATE agent CONTENT ${JSON.stringify(doc)};`;
    await this.client.sql(q);
    return doc;
  }

  async getAgent(id: string): Promise<Agent | null> {
    const q = `SELECT * FROM agent WHERE id = "${id}" LIMIT 1;`;
    const r = await this.client.sql<Agent>(q);
    return r[0] ?? null;
  }

  async updateAgent(id: string, patch: Partial<Agent>): Promise<Agent | null> {
    const existing = await this.getAgent(id);
    if (!existing) return null;
    const merged = { ...existing, ...patch, updatedAt: now() };
    const q = `UPDATE agent SET ${Object.entries(merged).map(([k,v])=>`${k} = ${JSON.stringify(v)}`).join(", ")} WHERE id = "${id}";`;
    await this.client.sql(q);
    return merged;
  }

  async deleteAgent(id: string): Promise<boolean> {
    const q = `DELETE agent WHERE id = "${id}";`;
    await this.client.sql(q);
    return (await this.getAgent(id)) === null;
  }

  // query conversations
  async createConversation(agentId: string): Promise<Conversation> {
    const conv: Conversation = { id: randomUUID(), agentId, status: "open", createdAt: now(), updatedAt: now() };
    const q = `CREATE conversation CONTENT ${JSON.stringify(conv)};`;
    await this.client.sql(q);
    return conv;
  }

  async getConversation(id: string): Promise<Conversation | null> {
    const q = `SELECT * FROM conversation WHERE id = "${id}" LIMIT 1;`;
    const r = await this.client.sql<Conversation>(q);
    return r[0] ?? null;
  }

  async addMessage(data: Omit<Message,"id"|"timestamp">): Promise<Message> {
    const msg: Message = { id: randomUUID(), timestamp: now(), ...data };
    const q = `CREATE message CONTENT ${JSON.stringify(msg)};`;
    await this.client.sql(q);
    return msg;
  }

  async listMessages(conversationId: string): Promise<Message[]> {
    const q = `SELECT * FROM message WHERE conversationId = "${conversationId}" ORDER BY timestamp ASC;`;
    return await this.client.sql<Message>(q);
  }
}
