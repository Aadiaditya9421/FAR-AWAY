# Far Away Production Deployment Runbook

This runbook targets the fastest reliable deployment path first: one VPS or VM
running Docker Compose with internal MongoDB, Redis, backend, and nginx-served
frontend. Managed MongoDB/Redis and PaaS notes are included after that.

## 1. Production Readiness Built Into The App

- Backend refuses to boot in production with missing/default JWT secrets.
- Backend refuses placeholder MongoDB, Redis, or frontend origin values.
- Backend health checks MongoDB and Redis when Redis is enabled.
- Docker backend image uses `npm ci --omit=dev`, non-root user, and a container healthcheck.
- Docker frontend image builds static assets and serves them through nginx.
- nginx proxies `/api` and `/socket.io` to the backend for same-origin deployment.
- Socket.io now requires a valid JWT on root, leaderboard, and competition namespaces.
- Socket.io attaches the Redis adapter when Redis is connected, allowing realtime
  events to work across multiple backend instances.
- Google sign-in/registration verifies Google ID tokens on the backend.
- Forgot-password reset links use SMTP when configured.
- AI insights, hints, explanations, study notes, and code review use Gemini only
  when `GEMINI_API_KEY` is configured; otherwise deterministic fallbacks keep the
  app usable.
- Destructive scripts refuse remote-looking MongoDB URIs unless explicitly opted in.

## 2. Prepare `backend/.env`

For one VPS with bundled MongoDB/Redis, copy the single-server example:

```bash
cp ops/backend.env.single-vps.example backend/.env
```

For managed MongoDB/Redis or PaaS, copy the generic production example:

```bash
cp backend/.env.production.example backend/.env
```

Required for production:

- `JWT_ACCESS_SECRET`: unique, at least 32 chars.
- `JWT_REFRESH_SECRET`: unique, at least 32 chars.
- `CLIENT_URL`: your deployed frontend URL.
- `CORS_ORIGINS`: comma-separated frontend origins.
- `GOOGLE_CLIENT_ID`: Google OAuth Web Client ID for Google sign-in.
- `SMTP_HOST`/`SMTP_USER`/`SMTP_PASS`/`SMTP_FROM`: required for password reset emails.

Optional for production:

- `GEMINI_API_KEY`: enables Gemini-backed tutor output.
- `GEMINI_MODEL`: defaults to `gemini-2.5-flash`.

Rotate any SMTP, MongoDB Atlas, Google OAuth, JWT, Redis, or Gemini credential
that was pasted into chat, tickets, screenshots, or logs before public launch.

Generate secrets:

```bash
openssl rand -base64 48
openssl rand -base64 48
```

For the self-contained Docker stack, use `mongodb://mongo:27017/far-away` and
`redis://redis:6379` in `backend/.env`. Compose also has these defaults, but
putting them in `backend/.env` lets `npm run predeploy:strict` pass before the
containers start.

If Google sign-in is enabled, set the same public OAuth client ID as
`VITE_GOOGLE_CLIENT_ID` in the shell or root `.env` before building the frontend
image. Also add the deployed frontend origin in Google Cloud OAuth settings.

## 3. Deploy On One VPS With Docker

From the project root:

```bash
cd backend && npm run predeploy:strict
cd ../frontend && npm run predeploy:strict
cd ..
docker compose -f docker-compose.prod.yml config --quiet
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml ps
```

Health check:

```bash
curl http://YOUR_SERVER/api/health
```

Expected: `"success": true`, with MongoDB and Redis connected.

## 4. Add HTTPS With A Domain

For global production, do not expose plain HTTP directly to users. The simplest
VPS path is a host-level reverse proxy such as Caddy:

1. Point DNS `A` records for `yourdomain.com` and `www.yourdomain.com` to the VPS.
2. Copy `ops/compose.env.production.example` to root `.env`.
3. Set `FRONTEND_PORT=127.0.0.1:8080` in root `.env`.
4. Use `ops/Caddyfile.external.example` as the host Caddy template.
5. Set `CLIENT_URL` and `CORS_ORIGINS` in `backend/.env` to the final HTTPS origins.

The app still uses same-origin `/api`, so Caddy only proxies to the frontend
container and nginx inside the frontend container proxies API and Socket.io
traffic to the backend container.

Seed demo data only for a demo database:

```bash
docker compose -f docker-compose.prod.yml exec backend npm run seed
```

`npm run seed` clears and recreates demo data. The internal Docker MongoDB host
is allowed by default. To seed a managed/remote database intentionally:

```bash
docker compose -f docker-compose.prod.yml exec -e ALLOW_DESTRUCTIVE_SEED=true backend npm run seed
```

## 5. Managed MongoDB/Redis With Compose

If using Atlas/Upstash instead of the in-stack services:

1. Delete the `mongo` and `redis` services from `docker-compose.prod.yml`.
2. Remove their `depends_on` entries from the backend service.
3. Override `MONGO_URI`, `REDIS_URL`, and `REDIS_ENABLED` via shell env or a root
   `.env` file. Compose interpolation does not read `backend/.env`.
4. Keep `backend/.env` for app secrets such as JWT and CORS values.

Example:

```bash
MONGO_URI="mongodb+srv://..." REDIS_URL="rediss://..." docker compose -f docker-compose.prod.yml up -d --build
```

Do not run `npm run seed` or phase verification scripts against Atlas unless the
database is a disposable demo database and you intentionally pass the remote DB
mutation override described in the script output.

## 6. PaaS Deployment

Backend on Render/Railway/Fly:

- Root: `backend`
- Build: `npm ci`
- Start: `npm start`
- Health path: `/api/health`
- Set `NODE_ENV=production`, `TRUST_PROXY=1`, JWT secrets, `MONGO_URI`, and
  `CLIENT_URL`/`CORS_ORIGINS`.
- Set `REDIS_ENABLED=false` if Redis is not available.

Frontend on Vercel/Netlify:

- Root: `frontend`
- Build: `npm run build`
- Output: `dist`
- Env: `VITE_API_URL=https://YOUR-BACKEND/api`
- Env: `VITE_GOOGLE_CLIENT_ID=<same Google OAuth Web Client ID as backend>`

After frontend is live, update backend `CORS_ORIGINS` to the exact frontend URL.

## 7. Final Launch Checklist

- [ ] `docker compose -f docker-compose.prod.yml config --quiet` succeeds.
- [ ] Backend starts with `NODE_ENV=production`.
- [ ] `GET /api/health` returns `success: true`.
- [ ] Frontend loads over HTTPS.
- [ ] Login works with a real or seeded account.
- [ ] Forgot-password email is delivered through SMTP.
- [ ] Google sign-in works with the deployed frontend origin in Google Cloud OAuth settings.
- [ ] Google button appears only when both backend `GOOGLE_CLIENT_ID` and frontend `VITE_GOOGLE_CLIENT_ID` are configured.
- [ ] AI tutor features show Gemini-backed output when `GEMINI_API_KEY` is set, and deterministic fallback output when it is blank.
- [ ] Browser console has no CORS errors.
- [ ] Socket.io connects after login and rejects unauthenticated clients.
- [ ] `CORS_ORIGINS` lists only real frontend origins.
- [ ] JWT secrets are unique and not committed.
- [ ] Any credentials shared in chat/logs have been rotated.
- [ ] `.env` files remain ignored/private.
- [ ] Seed command was only run against a demo database.

## 8. Verification Commands

Local pre-deploy checks:

```bash
cd backend && npm run check
npm run predeploy:check
cd ../frontend && npm run lint && npm run build
npm run predeploy:check
cd .. && docker compose -f docker-compose.prod.yml config --quiet
```

Strict production gates, after real hosting env values are present:

```bash
cd backend && npm run predeploy:strict
cd ../frontend && npm run predeploy:strict
```

The strict gates do not print secret values. They only report missing,
placeholder, local-only, or non-HTTPS production configuration.

Running local dev stack check:

```bash
docker compose up -d backend
docker compose exec -T backend npm run smoke
```
