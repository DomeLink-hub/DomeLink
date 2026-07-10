# DomeLink Deployment Readiness Checklist

This checklist is the bridge from "code complete" to "actually hosted".

## 1. Choose hosting
- Pick one server for the backend, such as a small VPS or container host.
- Pick one place for the frontend, such as a static CDN host or the same VM behind Nginx.

## 2. Set DNS and domain
- Point your frontend domain to the frontend host.
- Point your API domain or subdomain to the backend host.
- Decide the final production URLs before setting environment variables.

## 3. Set production environment variables
Set these on the backend server or in your container platform:
- `DATABASE_URL`
- `DIRECT_URL` if your Prisma setup needs it
- `MONGO_URI`
- `JWT_SECRET`
- `FRONTEND_URL`
- `GROQ_API_KEY`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `RAZORPAY_WEBHOOK_SECRET` for production
- `RESEND_API_KEY`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `EMAIL_FROM`
- `SENTRY_DSN` if you want error reporting
- `NODE_ENV=production`
- `PORT=5000`

Set this on the frontend build host:
- `VITE_API_BASE_URL` pointing at the live backend URL

## 4. Deploy the backend
Run these commands on the backend server in order:
```bash
cd backend
npm ci
npx prisma migrate deploy
npx prisma generate
npm run build
pm2 start pm2.ecosystem.config.js --env production
pm2 save
```

If you want demo data for a one-time local or staging setup, run `npm run seed` manually after the build. Do not include it in the normal production deploy path.

## 5. Deploy the frontend
Run these commands on the frontend build host in order:
```bash
cd frontend
npm ci
npm run build
```

Then upload or publish the `frontend/dist` folder to your static host or CDN.

## 6. Set up HTTPS
- Install an SSL certificate through your hosting provider, reverse proxy, or CDN.
- Force HTTPS redirects after the certificate is active.
- Confirm the frontend and API domains both load over HTTPS.

## 7. Verify the deployment
- Open the backend health endpoint and confirm it returns OK.
- Open the frontend in a browser and confirm login works.
- Confirm Socket.io, email links, password reset, and payments use the production URLs.
- Confirm the admin dashboard shows real production data.

## 8. Operational checks
- Keep backups of the production database.
- Keep the backend `.env` out of git.
- Rotate secrets before going live if any were used in local development.
- Review logs after the first deployment for Prisma, Sentry, email, and payment errors.
