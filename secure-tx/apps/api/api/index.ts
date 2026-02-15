import type { VercelRequest, VercelResponse } from "@vercel/node";

let app: any;

const getApp = async () => {
  if (!app) {
    const { buildApp } = await import("../dist/src/app.js");
    const { loadConfig } = await import("../dist/src/config.js");
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
