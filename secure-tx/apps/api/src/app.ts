import Fastify from "fastify";
import cors from "@fastify/cors";
import { txRoutes } from "./routes/tx.js";

export const buildApp = async (masterKeyHex: string) => {
  const app = Fastify({ logger: true });
  await app.register(cors, { origin: true });
  await app.register(txRoutes, { masterKeyHex });
  app.get("/health", async () => ({ ok: true }));
  return app;
};
