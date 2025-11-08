import request from "supertest";
import { createApp } from "../src/app.js";
import { MemoryStorage } from "../src/storage/memory.js";

const key = { "x-api-key": process.env.API_KEY || "dev-local-key" };

// tests
const app = createApp(new MemoryStorage());

describe("Conversations API", () => {
  let agentId: string;

  beforeAll(async () => {
    // Crée un agent de type "echo"
    const res = await request(app)
      .post("/agents")
      .set(key)
      .send({ name: "Echo", rules: { mode: "echo" } })
      .expect(201);

    agentId = res.body.id;
    expect(agentId).toBeDefined();
  });

  it("starts a conversation and replies", async () => {
    // Lance une nouvelle conversation
    const start = await request(app)
      .post("/conversations")
      .set(key)
      .send({ agentId, message: "hello" })
      .expect(201);

    expect(start.body.conversationId).toBeDefined();
    expect(typeof start.body.agentReply).toBe("string");
    expect(start.body.agentReply.toLowerCase()).toContain("hello");

    // Envoie un second message dans la même conversation
    const send = await request(app)
      .post(`/conversations/${start.body.conversationId}/messages`)
      .set(key)
      .send({ message: "again" })
      .expect(201);

    expect(send.body.agentReply.toLowerCase()).toContain("again");
    expect(Array.isArray(send.body.messages)).toBe(true);
    expect(send.body.messages.length).toBeGreaterThanOrEqual(4); // user + agent * 2
  });
});
