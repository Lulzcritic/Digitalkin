import request from "supertest";
import { createApp } from "../src/app.js";
import { MemoryStorage } from "../src/storage/memory.js";

const key = { "x-api-key": process.env.API_KEY || "dev-local-key" };
const app = createApp(new MemoryStorage());

describe("Conversations API - mode canned", () => {
  let agentId: string;
  const cannedReplies = [
    "Salut",
    "Heureuse de te revoir !",
    "Je suis prête à discuter",
    "Toujours là pour toi !",
  ];

  beforeAll(async () => {
    const res = await request(app)
      .post("/agents")
      .set(key)
      .send({
        name: "Luna",
        rules: {
          mode: "canned",
          canned: cannedReplies,
        },
      })
      .expect(201);

    agentId = res.body.id;
    expect(agentId).toBeDefined();
  });

  it("starts a conversation and replies with a canned response", async () => {
    // Démarre une conversation
    const start = await request(app)
      .post("/conversations")
      .set(key)
      .send({ agentId, message: "Bonjour Luna !" })
      .expect(201);

    expect(start.body.conversationId).toBeDefined();
    expect(typeof start.body.agentReply).toBe("string");

    // Vérifie que la réponse vient du set de réponses "canned"
    expect(cannedReplies).toContain(start.body.agentReply);

    const send = await request(app)
      .post(`/conversations/${start.body.conversationId}/messages`)
      .set(key)
      .send({ message: "Encore là ?" })
      .expect(201);

    expect(typeof send.body.agentReply).toBe("string");
    expect(cannedReplies).toContain(send.body.agentReply);
  });
});
