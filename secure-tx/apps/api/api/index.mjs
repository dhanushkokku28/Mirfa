import { buildApp } from "../src/app.js";
import { loadConfig } from "../src/config.js";

let app;

const getApp = async () => {
  if (!app) {
    const config = loadConfig();
    app = await buildApp(config.masterKeyHex);
  }
  return app;
};

export default async function handler(req, res) {
  const app = await getApp();
  await app.ready();
  app.server.emit("request", req, res);
}
