# Deployment & Scalability Configuration

DomeLink is designed for straightforward horizontal scaling. This document describes the environment needed to move from localhost to production securely.

## 1. Zero-Downtime Pipeline
The `pm2.ecosystem.config.js` is the primary orchestrator for Node.js workloads.

**Backend Start:**
```bash
npm run build
pm2 start pm2.ecosystem.config.js --env production
```
* **Instances:** Utilizes `max` instances in cluster mode to absorb concurrent Socket.IO traffic across all CPU threads.
* **Restart Strategy:** PM2 exponentially backs off if Prisma drops connections.

## 2. Platform Observability (Sentry)
In production, environmental errors are masked from users and routed directly to Sentry.
* Set `NODE_ENV=production`.
* Ensure `SENTRY_DSN` is populated. Look at the `Sentry.setupExpressErrorHandler` sequence in `app.ts`. Unhandled promise rejections trigger a critical Slack alert webhook on the Sentry side.

## 3. Rate Limiting Limits
The following bounds apply in production (`src/middleware/rateLimit.ts`):
* `/api/auth/*` : 5 requests / 15 minutes (Brute-force protection).
* `/api/ai/*` : 10 requests / 10 minutes (Groq API Token protection).

## 4. Frontend CDN
Deploy the `/frontend/dist` output to a Global CDN Edge (e.g., Vercel, CloudFront, Netlify).
* **Environment:** Ensure `VITE_API_BASE_URL` points exactly to the domain of your PM2 backend, enforcing `https://`.
* **Caching:** Assets in `assets/` receive a 1-year cache-control header, since Vite chunks them with content-hashes natively.
* **Code Splitting:** The heavy `@react-three` packages are forced into a `vendor-three.js` manual chunk, preventing blockages in time-to-interactive for 2G/3G clients.
