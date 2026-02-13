"use client";

import { useMemo, useState } from "react";

const API_DEFAULT = "http://localhost:3001";

export default function HomePage() {
  const apiBase = useMemo(() => {
    return process.env.NEXT_PUBLIC_API_URL ?? API_DEFAULT;
  }, []);

  const [partyId, setPartyId] = useState("party_123");
  const [payloadText, setPayloadText] = useState("{\n  \"amount\": 100,\n  \"currency\": \"AED\"\n}");
  const [recordId, setRecordId] = useState("");
  const [encryptedRecord, setEncryptedRecord] = useState<string>("");
  const [decryptedPayload, setDecryptedPayload] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleEncrypt = async () => {
    setError("");
    setDecryptedPayload("");
    setEncryptedRecord("");

    let payload: unknown;
    try {
      payload = JSON.parse(payloadText);
    } catch (err) {
      setError("Payload must be valid JSON.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/tx/encrypt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ partyId, payload })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error ?? "Encrypt failed");
      }
      setRecordId(data.id);
      setEncryptedRecord(JSON.stringify(data, null, 2));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Encrypt failed");
    } finally {
      setLoading(false);
    }
  };

  const handleFetch = async () => {
    if (!recordId) {
      setError("Enter a record id first.");
      return;
    }
    setError("");
    setDecryptedPayload("");
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/tx/${recordId}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error ?? "Fetch failed");
      }
      setEncryptedRecord(JSON.stringify(data, null, 2));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fetch failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDecrypt = async () => {
    if (!recordId) {
      setError("Enter a record id first.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/tx/${recordId}/decrypt`, {
        method: "POST"
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error ?? "Decrypt failed");
      }
      setDecryptedPayload(JSON.stringify(data.payload, null, 2));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Decrypt failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page">
      <section className="hero">
        <p className="eyebrow">Secure Transactions</p>
        <h1>Envelope Encryption Playground</h1>
        <p className="subtitle">Encrypt a JSON payload, store it, fetch it, and decrypt it back.</p>
      </section>

      <section className="card">
        <div className="field">
          <label htmlFor="partyId">Party ID</label>
          <input
            id="partyId"
            value={partyId}
            onChange={(event) => setPartyId(event.target.value)}
            placeholder="party_123"
          />
        </div>

        <div className="field">
          <label htmlFor="payload">JSON payload</label>
          <textarea
            id="payload"
            value={payloadText}
            onChange={(event) => setPayloadText(event.target.value)}
            rows={6}
          />
        </div>

        <div className="actions">
          <button onClick={handleEncrypt} disabled={loading}>
            Encrypt &amp; Save
          </button>
          <button onClick={handleFetch} disabled={loading} className="ghost">
            Fetch
          </button>
          <button onClick={handleDecrypt} disabled={loading} className="ghost">
            Decrypt
          </button>
        </div>

        <div className="field">
          <label htmlFor="recordId">Record ID</label>
          <input
            id="recordId"
            value={recordId}
            onChange={(event) => setRecordId(event.target.value)}
            placeholder="tx id from encrypt"
          />
        </div>

        {error ? <p className="error">{error}</p> : null}
      </section>

      <section className="grid">
        <div className="panel">
          <h2>Encrypted record</h2>
          <pre>{encryptedRecord || "Run encrypt or fetch to see the stored record."}</pre>
        </div>
        <div className="panel">
          <h2>Decrypted payload</h2>
          <pre>{decryptedPayload || "Run decrypt to see the original payload."}</pre>
        </div>
      </section>
    </main>
  );
}
