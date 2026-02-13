# Vercel Deployment Guide

## ⚠️ CRITICAL: Separate Projects Required

You **must create two separate Vercel projects** from your GitHub repo. Vercel cannot deploy monorepos directly from the root.

---

## Web Deployment (Next.js)

1. **Create Vercel Project #1:**
   - Import from GitHub: `dhanushkokku28/Mirfa`
   - Framework preset: **Next.js**

2. **Configure Root Directory:**
   - Settings → General → Root Directory
   - Enter: `apps/web`
   - Save

3. **Environment Variables:**
   - `NEXT_PUBLIC_API_URL` = `https://your-api-project.vercel.app` (from API project step 4)

4. **Deploy:**
   - Click "Deploy"
   - Wait for build to complete
   - Note your Web URL

---

## API Deployment (Fastify)

1. **Create Vercel Project #2:**
   - Import from GitHub: `dhanushkokku28/Mirfa`
   - Select "Other" for framework (not auto-detected)

2. **Configure Root Directory:**
   - Settings → General → Root Directory
   - Enter: `apps/api`
   - Save

3. **Environment Variables:**
   - `MASTER_KEY_HEX` = (generate key below)

4. **Deploy:**
   - Click "Deploy"
   - Wait for build to complete
   - Note your API URL

5. **Update Web Project (back to Web Vercel Project):**
   - Go back to Web project settings
   - Add/update `NEXT_PUBLIC_API_URL` = your API project URL
   - Trigger redeploy

---

## Generate MASTER_KEY_HEX

This must be a 32-byte hex string (64 hex characters).

### Option 1: Node.js
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Option 2: PowerShell
```powershell
$bytes = New-Object byte[] 32
$rng = [System.Security.Cryptography.RNGCryptoServiceProvider]::new()
$rng.GetBytes($bytes)
[System.BitConverter]::ToString($bytes) -replace '-' | % {$_.ToLower()}
```

**Save this key!** It decrypts all stored records. If you lose it, encrypted data cannot be recovered.

---

## Verify Deployment

**Web:**
- Visit your Web URL
- Page should load with the UI

**API:**
- Visit `https://your-api.vercel.app/health`
- Should return `{"ok":true}`

---

## Troubleshooting

**"No Next.js version detected"**
- Root Directory not set to `apps/web`
- Check Vercel project settings

**API startup error**
- `MASTER_KEY_HEX` not set or invalid format
- Must be 64 hex characters (32 bytes)

**Web cannot reach API**
- `NEXT_PUBLIC_API_URL` not set correctly
- Should be full URL: `https://your-api.vercel.app`

