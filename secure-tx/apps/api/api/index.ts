import type { VercelRequest, VercelResponse } from "@vercel/node";
import { buildApp } from "../src/app.js";
import { loadConfig } from "../src/config.js";

let app: any;

const getApp = async () => {
  if (!app) {
    const config = loadConfig();
    app = await buildApp(config.masterKeyHex);
  }
  return app;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const app = await getApp();
  await app.ready();
  app.server.emit("request", req, res);
}
