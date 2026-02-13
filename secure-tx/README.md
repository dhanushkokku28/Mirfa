# Secure Transactions Mini-App

TurboRepo monorepo with Fastify API, Next.js web, and shared AES-256-GCM envelope encryption.

## Requirements
- Node.js 20+
- pnpm

## Local dev
```
pnpm install
pnpm dev
```

## Deployment (Vercel)
Create two Vercel projects from this repo:
- Web: set root directory to secure-tx/apps/web
- API: set root directory to secure-tx

Set environment variables in Vercel:
- API project: MASTER_KEY_HEX (required), PORT is not needed
- Web project: NEXT_PUBLIC_API_URL (the API project URL)

The API project uses a serverless handler at secure-tx/api/index.ts.

## Environment
API (apps/api):
- `MASTER_KEY_HEX` (32-byte hex, required for stable decrypt across restarts)
- `PORT` (default 3001)
Example: apps/api/.env.example

Web (apps/web):
- `NEXT_PUBLIC_API_URL` (default http://localhost:3001)
Example: apps/web/.env.local.example

## Apps
- `apps/api`: Fastify API
- `apps/web`: Next.js UI
- `packages/crypto`: envelope encryption helpers + tests
