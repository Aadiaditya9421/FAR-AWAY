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

Copy the production example and fill real values:

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

For the self-contained Docker stack, Compose overrides `MONGO_URI`, `REDIS_URL`,
and `REDIS_ENABLED` to use the internal `mongo` and `redis` services.

If Google sign-in is enabled, set the same public OAuth client ID as
`VITE_GOOGLE_CLIENT_ID` in the shell or root `.env` before building the frontend
image. Also add the deployed frontend origin in Google Cloud OAuth settings.

## 3. Deploy On One VPS With Docker

From the project root:

```bash
docker compose -f docker-compose.prod.yml config
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml ps
```

Health check:

```bash
curl http://YOUR_SERVER/api/health
```

Expected: `"success": true`, with MongoDB and Redis connected.

Seed demo data only for a demo database:

```bash
docker compose -f docker-compose.prod.yml exec backend npm run seed
```

`npm run seed` clears and recreates demo data. The internal Docker MongoDB host
is allowed by default. To seed a managed/remote database intentionally:

```bash
docker compose -f docker-compose.prod.yml exec -e ALLOW_DESTRUCTIVE_SEED=true backend npm run seed
```

## 4. Managed MongoDB/Redis With Compose

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

## 5. PaaS Deployment

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

## 6. Final Launch Checklist

- [ ] `docker compose -f docker-compose.prod.yml config` succeeds.
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

## 7. Verification Commands

Local pre-deploy checks:

```bash
cd backend && npm run check
cd ../frontend && npm run lint && npm run build
cd .. && docker compose -f docker-compose.prod.yml config
```

Running local dev stack check:

```bash
docker compose up -d backend
docker compose exec -T backend npm run smoke
```
