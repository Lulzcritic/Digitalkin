import dotenv from "dotenv";
dotenv.config();

import { SurrealClient } from "../src/utils/surrealClient.js";

process.env.NODE_ENV = "test";
process.env.STORAGE = "surreal";
process.env.API_KEY = process.env.API_KEY || "dev-local-key";

const url = process.env.SURREAL_URL!;
const ns  = process.env.SURREAL_NS!;
const db  = process.env.SURREAL_DB!;
const user= process.env.SURREAL_USER!;
const pass= process.env.SURREAL_PASS!;

const client = new SurrealClient(url, ns, db, user, pass);

beforeAll(async () => {
  const start = Date.now();
  for (;;) {
    try {
      await client.sql(`SELECT * FROM agent LIMIT 1;`);
      break;
    } catch {
      if (Date.now() - start > 8000) throw new Error("Surreal not ready");
      await new Promise(r => setTimeout(r, 250));
    }
  }
});

beforeEach(async () => {
  await client.sql(`DELETE message;`);
  await client.sql(`DELETE conversation;`);
  await client.sql(`DELETE agent;`);
});
