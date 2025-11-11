import express from "express";
import morgan from "morgan";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import yaml from "yamljs";
import dotenv from "dotenv";
import { errorHandler } from "./utils/errors.js";
import { apiKeyMiddleware } from "./utils/auth.js";
import type { StorageAdapter } from "./storage/adapter.js";
import makeAgentsRouter from "./routes/agents.js";
import makeConversationsRouter from "./routes/conversations.js";
import { SurrealClient } from "./utils/surrealClient.js";
import { SurrealStorage } from "./storage/surreal.js";
import { MemoryStorage } from "./storage/memory.js";

dotenv.config();

const openapi = (() => {
  try { return yaml.load("openapi.yaml"); } catch { return undefined; }
})();

function buildDefaultStore(): StorageAdapter {
  /*const must = (k: string) => {
    const v = process.env[k];
    if (!v) throw new Error(`Missing env ${k}`);
    return v;
  };?*/
  
  /*const client = new SurrealClient(
    must("SURREAL_URL"),
    must("SURREAL_NS"),
    must("SURREAL_DB"),
    must("SURREAL_USER"),
    must("SURREAL_PASS")
  );*/
  return new MemoryStorage();
}

export const container = {
  store: buildDefaultStore(),
};

export function createApp(store?: StorageAdapter) {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use(morgan("dev"));

  app.use("/agents", apiKeyMiddleware, makeAgentsRouter(container.store));
  app.use("/conversations", apiKeyMiddleware, makeConversationsRouter(container.store));
  if (openapi) app.use("/docs", swaggerUi.serve, swaggerUi.setup(openapi));

  app.use(errorHandler);
  return app;
}

const app = createApp();
export default app;
