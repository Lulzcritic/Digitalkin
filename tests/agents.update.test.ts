import request from "supertest";
import app from "../src/app.js";

const keyHeader = { "x-api-key": process.env.API_KEY || "dev-local-key" };

describe("Agents - update (PUT /agents/:id)", () => {
  let agentId: string;
  let initialUpdatedAt: string;

  beforeAll(async () => {
    const res = await request(app)
      .post("/agents")
      .set(keyHeader)
      .send({
        name: "Luna",
        description: "Agent initial",
        rules: {
          mode: "keyword",
          keywords: {
            bonjour: ["Salut !", "Bonjour !"],
            prix: ["Nos tarifs démarrent à 99€"],
          },
          fallback: "Je vous écoute.",
        },
      })
      .expect(201);

    agentId = res.body.id;
    expect(agentId).toBeDefined();
    initialUpdatedAt = res.body.updatedAt;
    expect(initialUpdatedAt).toBeDefined();
  });

  it("met à jour des champs simples (name, description) et rafraîchit updatedAt", async () => {
    const patch = {
      name: "Luna v2",
      description: "Agent mis à jour",
    };

    const upd = await request(app)
      .put(`/agents/${agentId}`)
      .set(keyHeader)
      .send(patch)
      .expect(200);

    // id stable, champs modifiés, updatedAt modifié
    expect(upd.body.id).toBe(agentId);
    expect(upd.body.name).toBe("Luna v2");
    expect(upd.body.description).toBe("Agent mis à jour");
    expect(upd.body.updatedAt).toBeDefined();
    expect(upd.body.updatedAt).not.toBe(initialUpdatedAt);

    // Persistance : GET derrière
    const got = await request(app)
      .get(`/agents/${agentId}`)
      .set(keyHeader)
      .expect(200);

    expect(got.body.name).toBe("Luna v2");
    expect(got.body.description).toBe("Agent mis à jour");
  });

  it("met à jour les règles (keywords/fallback/mode) et la logique répond selon la nouvelle config", async () => {
    const patchRules = {
      rules: {
        mode: "keyword" as const,
        keywords: {
          bonjour: ["Salut !", "Bonjour !"],
          prix: ["99 euros", "À partir de 99€"],  // modifie
          promo: ["-20% aujourd'hui"],
        },
        fallback: "Dites-m'en plus.",
      },
    };

    const upd = await request(app)
      .put(`/agents/${agentId}`)
      .set(keyHeader)
      .send(patchRules)
      .expect(200);

    expect(upd.body.rules.fallback).toBe("Dites-m'en plus.");
    expect(Object.keys(upd.body.rules.keywords)).toEqual(
      expect.arrayContaining(["bonjour", "prix", "promo"])
    );

    const start = await request(app)
      .post("/conversations")
      .set(keyHeader)
      .send({ agentId, message: "Avez-vous une promo ?" })
      .expect(201);

    expect(start.body.agentReply).toBe("-20% aujourd'hui");

    const fb = await request(app)
      .post("/conversations")
      .set(keyHeader)
      .send({ agentId, message: "rien à voir ici" })
      .expect(201);

    expect(fb.body.agentReply).toBe("Dites-m'en plus.");
  });

  it("retourne 404 si l'agent n'existe pas", async () => {
    await request(app)
      .put(`/agents/00000000-0000-0000-0000-000000000000`)
      .set(keyHeader)
      .send({ name: "Nobody" })
      .expect(404);
  });

  it("retourne 400 si le payload est invalide (ex: name vide)", async () => {
    const bad = await request(app)
      .put(`/agents/${agentId}`)
      .set(keyHeader)
      .send({ name: "" })
      .expect(400);

    expect(bad.body.error).toBeDefined();
  });
});
