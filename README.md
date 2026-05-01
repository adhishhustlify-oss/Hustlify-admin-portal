# Hustlify Portal (Production-Ready)

## What was refactored for production scale + lower Firebase cost
- **Atomic one-time link consumption** using Firestore transactions to prevent token race conditions.
- **Mandatory link expiration (TTL-like behavior)** to reduce long-term stale reads.
- **Short-lived signed URLs** only issued after successful one-time validation.
- **Upload limits and payload limits** to control abuse and storage/network cost.
- **Limited list queries** (`GET /api/upload?limit=25`) to reduce read costs on dashboard load.
- **Hardened config management** through a central `server/config/env.js`.
- **Centralized error handling** to avoid duplicated logic and improve observability.
- **Storage cache headers** tuned for private content behavior.

## Run locally
```bash
npm install
cp .env.example .env
node server.js
```

Admin: `http://localhost:3000/admin`

## Required env vars
- `FIREBASE_STORAGE_BUCKET`
- `FIREBASE_SERVICE_ACCOUNT_PATH`

## Optional tuning env vars
- `SIGNED_URL_MINUTES` (default: 10)
- `DEFAULT_LINK_EXPIRY_MINUTES` (default: 1440)
- `MAX_UPLOAD_MB` (default: 200)

## Firebase cost optimization notes
1. Keep dashboard polling/manual refresh instead of aggressive auto-refresh.
2. Use shorter signed URL TTLs.
3. Enforce upload size caps and prune old content periodically.
4. Consider Firestore TTL policies on `links.expiresAt` and `linkLogs.openedAt` in Firebase console.
5. Add lifecycle rules on Firebase Storage bucket for old uploads if compliance allows.
