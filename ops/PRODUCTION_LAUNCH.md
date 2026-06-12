# Far Away Global Production Launch

This checklist is for taking the current Docker-ready app to a public domain.
It does not contain secrets. Put real values only in ignored `.env` files or in
your hosting provider dashboard.

## 1. Pick The Deployment Shape

Use one of these paths:

- One VPS with Docker Compose: fastest path for launch. Runs frontend, backend,
  MongoDB, and Redis on one server.
- One VPS plus managed data: same Docker frontend/backend, but MongoDB Atlas and
  managed Redis are used instead of bundled containers.
- PaaS split deployment: backend on Render/Railway/Fly and frontend on
  Vercel/Netlify. Use `DEPLOYMENT.md` for that shape.

For the next three-hour launch sprint, the one-VPS Docker path is the simplest.

## 2. DNS And HTTPS

Create DNS records:

- `A yourdomain.com -> VPS_PUBLIC_IP`
- `A www.yourdomain.com -> VPS_PUBLIC_IP`

For HTTPS, run Caddy/nginx/Traefik on the host, and bind the Docker frontend to
localhost only:

```bash
cp ops/compose.env.production.example .env
```

In the root `.env`, set:

```bash
FRONTEND_PORT=127.0.0.1:8080
VITE_API_URL=/api
VITE_GOOGLE_CLIENT_ID=your-google-oauth-web-client-id.apps.googleusercontent.com
```

Then use `ops/Caddyfile.external.example` as the host Caddy template. Caddy will
terminate HTTPS and proxy traffic to `127.0.0.1:8080`.

## 3. Backend Env

For bundled MongoDB/Redis:

```bash
cp ops/backend.env.single-vps.example backend/.env
```

Replace:

- `CLIENT_URL` and `CORS_ORIGINS` with the final HTTPS domain(s).
- `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` with two different generated
  secrets.
- `GOOGLE_CLIENT_ID` with the Google OAuth Web Client ID.
- `SMTP_*` with the final mail provider credentials.
- `GEMINI_API_KEY` if Gemini-backed tutor output should be enabled.

Generate JWT secrets:

```bash
openssl rand -base64 48
openssl rand -base64 48
```

For managed MongoDB/Redis, copy `backend/.env.production.example` instead and
fill `MONGO_URI` plus `REDIS_URL`. Also put the same managed overrides in the
root `.env` so Docker Compose passes them into the backend container.

## 4. Google OAuth

In Google Cloud Console, create or update a Web OAuth client:

- Authorized JavaScript origins:
  - `https://yourdomain.com`
  - `https://www.yourdomain.com`
- Authorized redirect URIs: not required for Google Identity Services ID-token
  login, unless you later add a redirect OAuth flow.

Use the same client ID in:

- `backend/.env`: `GOOGLE_CLIENT_ID`
- root `.env`: `VITE_GOOGLE_CLIENT_ID`

The frontend Google button should appear only when the public client ID is built
into the Vite bundle.

## 5. Start The Stack

Run checks first:

```bash
cd backend
npm run check
npm run predeploy:strict
cd ../frontend
npm run lint
npm run build
npm run predeploy:strict
cd ..
docker compose -f docker-compose.prod.yml config --quiet
```

Start production:

```bash
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml ps
```

Check health:

```bash
curl https://yourdomain.com/api/health
```

Expected result: `success: true`, with MongoDB connected and Redis connected
when Redis is enabled.

## 6. Launch Verification

Verify these from a real browser:

- HTTPS loads without mixed-content errors.
- Register a new user and confirm coins start at `0`.
- Login and refresh stay authenticated.
- Google sign-in works.
- Forgot-password sends exactly one email and reset works.
- Dashboard starts empty for a brand-new account instead of using demo data.
- Quiz submission updates coins, progress, and AI insight states.
- Socket.io connects after login and rejects logged-out clients.
- Browser console has no CORS errors.
- `/api/health` is green after a container restart.

## 7. Production Safety

- Do not seed a real production database.
- Do not run phase verification scripts against Atlas unless it is a disposable
  demo database and you explicitly allow remote mutation.
- Keep `backend/.env`, root `.env`, provider dashboard variables, and OAuth
  credentials private.
- Rotate any SMTP, MongoDB, Google, Gemini, Redis, or JWT secrets that were ever
  pasted into chat, screenshots, or logs before public launch.
