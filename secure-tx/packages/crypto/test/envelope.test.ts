import { describe, expect, it } from "vitest";
import { decryptEnvelope, encryptEnvelope } from "../src/index.js";

const MASTER_KEY = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

describe("envelope encryption", () => {
  it("encrypt -> decrypt roundtrip", () => {
    const payload = { amount: 100, currency: "AED" };
    const record = encryptEnvelope(payload, MASTER_KEY);
    const decrypted = decryptEnvelope(record, MASTER_KEY) as typeof payload;
    expect(decrypted).toEqual(payload);
  });

  it("fails on tampered ciphertext", () => {
    const payload = { ok: true };
    const record = encryptEnvelope(payload, MASTER_KEY);
    record.payload_ct = record.payload_ct.slice(0, -2) + "ff";
    expect(() => decryptEnvelope(record, MASTER_KEY)).toThrow();
  });

  it("fails on tampered tag", () => {
    const payload = { ok: true };
    const record = encryptEnvelope(payload, MASTER_KEY);
    record.payload_tag = record.payload_tag.slice(0, -2) + "ff";
    expect(() => decryptEnvelope(record, MASTER_KEY)).toThrow();
  });

  it("fails on wrong nonce length", () => {
    const payload = { ok: true };
    const record = encryptEnvelope(payload, MASTER_KEY);
    record.payload_nonce = "00";
    expect(() => decryptEnvelope(record, MASTER_KEY)).toThrow();
  });

  it("fails on invalid hex", () => {
    const payload = { ok: true };
    const record = encryptEnvelope(payload, MASTER_KEY);
    record.payload_ct = "zz";
    expect(() => decryptEnvelope(record, MASTER_KEY)).toThrow();
  });
});
