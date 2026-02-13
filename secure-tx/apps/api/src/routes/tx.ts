import type { FastifyPluginAsync } from "fastify";
import crypto from "node:crypto";
import {
  CryptoError,
  decryptEnvelope,
  encryptEnvelope,
  type TxSecureRecord
} from "@mirfa/crypto";

const store = new Map<string, TxSecureRecord>();

type EncryptBody = {
  partyId?: unknown;
  payload?: unknown;
};

const formatCryptoError = (error: unknown) => {
  if (error instanceof CryptoError) {
    return { status: 400, body: { error: error.code, message: error.message } };
  }
  return { status: 500, body: { error: "INTERNAL_ERROR" } };
};

export const txRoutes: FastifyPluginAsync<{ masterKeyHex: string }> = async (app, opts) => {
  app.post("/tx/encrypt", async (request, reply) => {
    const body = request.body as EncryptBody | undefined;
    if (!body || typeof body !== "object") {
      return reply.code(400).send({ error: "INVALID_BODY" });
    }

    const { partyId, payload } = body;
    if (typeof partyId !== "string" || partyId.trim().length === 0) {
      return reply.code(400).send({ error: "INVALID_PARTY_ID" });
    }
    if (payload === undefined) {
      return reply.code(400).send({ error: "MISSING_PAYLOAD" });
    }

    try {
      const envelope = encryptEnvelope(payload, opts.masterKeyHex);
      const record: TxSecureRecord = {
        id: crypto.randomUUID(),
        partyId,
        createdAt: new Date().toISOString(),
        ...envelope
      };
      store.set(record.id, record);
      return reply.send(record);
    } catch (error) {
      const formatted = formatCryptoError(error);
      return reply.code(formatted.status).send(formatted.body);
    }
  });

  app.get("/tx/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const record = store.get(id);
    if (!record) {
      return reply.code(404).send({ error: "NOT_FOUND" });
    }
    return reply.send(record);
  });

  app.post("/tx/:id/decrypt", async (request, reply) => {
    const { id } = request.params as { id: string };
    const record = store.get(id);
    if (!record) {
      return reply.code(404).send({ error: "NOT_FOUND" });
    }

    try {
      const payload = decryptEnvelope(record, opts.masterKeyHex);
      return reply.send({ id, partyId: record.partyId, payload });
    } catch (error) {
      const formatted = formatCryptoError(error);
      return reply.code(formatted.status).send(formatted.body);
    }
  });
};
