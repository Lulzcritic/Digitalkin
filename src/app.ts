import express from "express";
import morgan from "morgan";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import yaml from "yamljs";
import dotenv from "dotenv";
import { errorHandler } from "./utils/errors.js";
import agentsRouter from "./routes/agents.js";
import conversationsRouter from "./routes/conversations.js";
import { apiKeyMiddleware } from "./utils/auth.js";
import { SurrealClient } from "./utils/surrealClient.js";
import { SurrealStorage } from "./storage/surreal.js";

dotenv.config();

const openapi = (() => {
  try { return yaml.load("openapi.yaml"); } catch { return undefined; }
})();

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use(apiKeyMiddleware);

const client = new SurrealClient(
  process.env.SURREAL_URL!,
  process.env.SURREAL_NS!,
  process.env.SURREAL_DB!,
  process.env.SURREAL_USER!,
  process.env.SURREAL_PASS!
);
const store = new SurrealStorage(client);
export const container = { store };

app.use("/agents", agentsRouter);
app.use("/conversations", conversationsRouter);

if (openapi) app.use("/docs", swaggerUi.serve, swaggerUi.setup(openapi));

app.use(errorHandler);
export default app;
