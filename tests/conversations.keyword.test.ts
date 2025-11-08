import request from "supertest";
import app from "../src/app.js";

const keyHeader = { "x-api-key": process.env.API_KEY || "dev-local-key" };

describe("Conversations - keyword mode", () => {
  let agentId: string;

  beforeAll(async () => {
    // Agent avec règles keyword + fallback
    const res = await request(app)
      .post("/agents")
      .set(keyHeader)
      .send({
        name: "Luna",
        rules: {
          mode: "keyword",
          keywords: {
            bonjour: ["Salut !", "Bonjour !"],
            prix: ["Nos tarifs démarrent à 99€", "Nous sommes à 100€ pour les premiers !"],
          },
          fallback: "Je vous écoute.",
        },
      })
      .expect(201);

    agentId = res.body.id;
    expect(agentId).toBeDefined();
  });

  it("répond avec la valeur associée au mot-clé (case-insensitive)", async () => {
    const start = await request(app)
      .post("/conversations")
      .set(keyHeader)
      .send({ agentId, message: "BONJour, y a quelqu'un ?" })
      .expect(201);

    expect(["Salut !", "Bonjour !"]).toContain(start.body.agentReply);
    expect(start.body.messages.length).toBeGreaterThanOrEqual(2);

    // Envoie un message qui matche 'prix'
    const reply = await request(app)
      .post(`/conversations/${start.body.conversationId}/messages`)
      .set(keyHeader)
      .send({ message: "Peux-tu me parler du PRIX ?" })
      .expect(201);

    expect(["Nos tarifs démarrent à 99€", "Nous sommes à 100€ pour les premiers !"]).toContain(reply.body.agentReply);
    expect(start.body.messages.length).toBeGreaterThanOrEqual(2);
  });

  it("utilise le fallback si aucun mot-clé ne matche", async () => {
    const start = await request(app)
      .post("/conversations")
      .set(keyHeader)
      .send({ agentId, message: "que penses-tu des licornes ?" })
      .expect(201);

    expect(start.body.agentReply).toBe("Je vous écoute.");
  });
});
