# Deployment to Vercel

## Prerequisites
- GitHub account with this repo pushed
- Vercel account (vercel.com)
- Master key hex value (see below)

## Generate Master Key

For secure, consistent decryption across deployments, generate a 32-byte hex master key:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Save this value—you'll need it for the API deployment.

## Step 1: Deploy API (`apps/api`)

1. Go to https://vercel.com/dashboard
2. Click **Add New** → **Project**
3. Import this GitHub repository
4. **Framework**: None (other)
5. **Root Directory**: `apps/api`
6. **Build Command**: `pnpm build`
7. **Output Directory**: `dist`
8. Under **Environment Variables**, add:
   - `MASTER_KEY_HEX` = your generated master key (from Prerequisites)
9. Click **Deploy**
10. Once live, copy the API URL (e.g., `https://api-xyz.vercel.app`)

## Step 2: Deploy Web (`apps/web`)

1. Go to https://vercel.com/dashboard
2. Click **Add New** → **Project**
3. Import the same GitHub repository
4. **Framework**: Next.js
5. **Root Directory**: `apps/web`
6. **Build Command**: `pnpm build`
7. Under **Environment Variables**, add:
   - `NEXT_PUBLIC_API_URL` = the API URL from Step 1 (e.g., `https://api-xyz.vercel.app`)
8. Click **Deploy**
9. Your web app is now live!

## Usage

1. Open the web URL from Step 2
2. Enter a `partyId` and JSON payload
3. Click **Encrypt & Save** to store encrypted record
4. Copy the `id` from the response
5. Click **Fetch** to retrieve encrypted record
6. Click **Decrypt** to see original payload

## Verification

### API Health Check
```bash
curl https://api-xyz.vercel.app/health
# Should return: {"ok":true}
```

### Encrypt/Decrypt via curl

**Encrypt:**
```bash
curl -X POST https://api-xyz.vercel.app/tx/encrypt \
  -H "Content-Type: application/json" \
  -d '{
    "partyId": "party_123",
    "payload": { "amount": 100, "currency": "AED" }
  }'
```

**Decrypt:**
```bash
curl -X POST https://api-xyz.vercel.app/tx/{id}/decrypt
```

## Troubleshooting

### "Cannot find module @mirfa/crypto"
- Ensure both projects are deployed from the same repo/commit
- Check that pnpm-workspace.yaml correctly references both apps and packages

### API returns 500
- Verify `MASTER_KEY_HEX` is set and valid (64 hex characters)
- Check Vercel deployment logs

### Web cannot reach API
- Verify `NEXT_PUBLIC_API_URL` is set to correct API URL
- Check browser console for CORS errors

## Security Notes

- `MASTER_KEY_HEX` is stored securely in Vercel and never exposed to the frontend
- Payloads are encrypted with AES-256-GCM using envelope encryption
- DEK (Data Encryption Key) is wrapped with the master key before storage
- Each encryption uses a fresh random nonce
- Tampering with ciphertext or tags will cause decryption to fail
