import crypto from "node:crypto";
import { assertMasterKeyHex } from "@mirfa/crypto";

export const loadConfig = () => {
  let masterKeyHex = process.env.MASTER_KEY_HEX;
  if (!masterKeyHex) {
    masterKeyHex = crypto.randomBytes(32).toString("hex");
    console.warn("MASTER_KEY_HEX not set; using ephemeral key for this process.");
  }

  assertMasterKeyHex(masterKeyHex);

  return {
    masterKeyHex,
    port: Number(process.env.PORT ?? 3001)
  };
};
