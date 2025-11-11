import request from "supertest";
import { createApp } from "../src/app.js";
import { MemoryStorage } from "../src/storage/memory.js";

const key = { "x-api-key": process.env.API_KEY || "dev-local-key" };

const app = createApp(new MemoryStorage());

describe("Agents API", () => {
  it("creates and lists agents", async () => {
    const created = await request(app)
      .post("/agents")
      .set(key)
      .send({ name: "Test" })
      .expect(201);

    expect(created.body.id).toBeDefined();

    const list = await request(app).get("/agents").set(key).expect(200);
    expect(Array.isArray(list.body)).toBe(true);
    expect(list.body.length).toBeGreaterThan(0);
  });
});
