import type { VercelRequest, VercelResponse } from "@vercel/node";

let app: any;

const getApp = async () => {
  if (!app) {
    const { buildApp } = await import("../secure-tx/apps/api/dist/app.js");
    const { loadConfig } = await import("../secure-tx/apps/api/dist/config.js");
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

