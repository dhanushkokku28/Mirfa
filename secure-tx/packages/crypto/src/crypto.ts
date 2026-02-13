import crypto from "node:crypto";
import type { EnvelopeFields, TxSecureRecord } from "./types.js";

const NONCE_BYTES = 12;
const TAG_BYTES = 16;
const DEK_BYTES = 32;
const MASTER_KEY_BYTES = 32;

export class CryptoError extends Error {
  code: string;

  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

const HEX_RE = /^[0-9a-f]+$/i;

const assertHex = (value: string, label: string) => {
  if (value.length === 0 || value.length % 2 !== 0 || !HEX_RE.test(value)) {
    throw new CryptoError("INVALID_HEX", `${label} must be valid hex`);
  }
};

const assertHexLength = (value: string, bytes: number, label: string) => {
  assertHex(value, label);
  if (value.length !== bytes * 2) {
    throw new CryptoError("INVALID_LENGTH", `${label} must be ${bytes} bytes`);
  }
};

const hexToBuf = (value: string, label: string) => {
  assertHex(value, label);
  return Buffer.from(value, "hex");
};

const bufToHex = (value: Buffer) => value.toString("hex");

export const assertMasterKeyHex = (masterKeyHex: string) => {
  if (!masterKeyHex) {
    throw new CryptoError("INVALID_MASTER_KEY", "Master key is required");
  }
  assertHexLength(masterKeyHex, MASTER_KEY_BYTES, "masterKey");
  return masterKeyHex;
};

export const encryptEnvelope = (payload: unknown, masterKeyHex: string): EnvelopeFields => {
  const normalizedKey = assertMasterKeyHex(masterKeyHex);
  const masterKey = Buffer.from(normalizedKey, "hex");
  const dek = crypto.randomBytes(DEK_BYTES);
  const payloadNonce = crypto.randomBytes(NONCE_BYTES);

  const payloadBytes = Buffer.from(JSON.stringify(payload), "utf8");
  const payloadCipher = crypto.createCipheriv("aes-256-gcm", dek, payloadNonce);
  const payloadCt = Buffer.concat([payloadCipher.update(payloadBytes), payloadCipher.final()]);
  const payloadTag = payloadCipher.getAuthTag();

  const wrapNonce = crypto.randomBytes(NONCE_BYTES);
  const wrapCipher = crypto.createCipheriv("aes-256-gcm", masterKey, wrapNonce);
  const wrappedDek = Buffer.concat([wrapCipher.update(dek), wrapCipher.final()]);
  const wrapTag = wrapCipher.getAuthTag();

  return {
    payload_nonce: bufToHex(payloadNonce),
    payload_ct: bufToHex(payloadCt),
    payload_tag: bufToHex(payloadTag),
    dek_wrap_nonce: bufToHex(wrapNonce),
    dek_wrapped: bufToHex(wrappedDek),
    dek_wrap_tag: bufToHex(wrapTag),
    alg: "AES-256-GCM",
    mk_version: 1
  };
};

const unwrapDek = (record: EnvelopeFields, masterKeyHex: string) => {
  const normalizedKey = assertMasterKeyHex(masterKeyHex);
  assertHexLength(record.dek_wrap_nonce, NONCE_BYTES, "dek_wrap_nonce");
  assertHexLength(record.dek_wrap_tag, TAG_BYTES, "dek_wrap_tag");
  assertHex(record.dek_wrapped, "dek_wrapped");

  const masterKey = Buffer.from(normalizedKey, "hex");
  const wrapNonce = hexToBuf(record.dek_wrap_nonce, "dek_wrap_nonce");
  const wrapTag = hexToBuf(record.dek_wrap_tag, "dek_wrap_tag");
  const wrappedDek = hexToBuf(record.dek_wrapped, "dek_wrapped");

  try {
    const decipher = crypto.createDecipheriv("aes-256-gcm", masterKey, wrapNonce);
    decipher.setAuthTag(wrapTag);
    const dek = Buffer.concat([decipher.update(wrappedDek), decipher.final()]);
    if (dek.length !== DEK_BYTES) {
      throw new CryptoError("INVALID_DEK", "Unwrapped DEK has invalid length");
    }
    return dek;
  } catch (error) {
    if (error instanceof CryptoError) {
      throw error;
    }
    throw new CryptoError("DECRYPT_FAILED", "Failed to unwrap DEK");
  }
};

export const decryptEnvelope = (record: EnvelopeFields | TxSecureRecord, masterKeyHex: string) => {
  if (record.alg !== "AES-256-GCM") {
    throw new CryptoError("INVALID_ALG", "Unsupported algorithm");
  }

  assertHexLength(record.payload_nonce, NONCE_BYTES, "payload_nonce");
  assertHexLength(record.payload_tag, TAG_BYTES, "payload_tag");
  assertHex(record.payload_ct, "payload_ct");

  const dek = unwrapDek(record, masterKeyHex);
  const payloadNonce = hexToBuf(record.payload_nonce, "payload_nonce");
  const payloadTag = hexToBuf(record.payload_tag, "payload_tag");
  const payloadCt = hexToBuf(record.payload_ct, "payload_ct");

  try {
    const decipher = crypto.createDecipheriv("aes-256-gcm", dek, payloadNonce);
    decipher.setAuthTag(payloadTag);
    const payloadBytes = Buffer.concat([decipher.update(payloadCt), decipher.final()]);
    const payloadText = payloadBytes.toString("utf8");
    return JSON.parse(payloadText) as unknown;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new CryptoError("PAYLOAD_PARSE_FAILED", "Failed to parse payload JSON");
    }
    throw new CryptoError("DECRYPT_FAILED", "Failed to decrypt payload");
  }
};
