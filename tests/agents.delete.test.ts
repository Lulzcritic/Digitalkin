import request from "supertest";
import { createApp } from "../src/app.js";
import { MemoryStorage } from "../src/storage/memory.js";

const key = { "x-api-key": process.env.API_KEY || "dev-local-key" };
const app = createApp(new MemoryStorage());

describe("Agents API - delete agent", () => {
  it("creates then deletes an agent successfully", async () => {
    // Création
    const created = await request(app)
      .post("/agents")
      .set(key)
      .send({ name: "ToDelete" })
      .expect(201);

    const agentId = created.body.id;
    expect(agentId).toBeDefined();

    // Suppression
    await request(app)
      .delete(`/agents/${agentId}`)
      .set(key)
      .expect(204);


    const list = await request(app).get("/agents").set(key).expect(200);
    const found = list.body.find((a: any) => a.id === agentId);
    expect(found).toBeUndefined();

    // Suppression 404
    await request(app)
      .delete(`/agents/${agentId}`)
      .set(key)
      .expect(404);
  });
});
