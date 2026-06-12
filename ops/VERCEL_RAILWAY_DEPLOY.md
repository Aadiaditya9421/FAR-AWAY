# Far Away Vercel + Railway Deployment

This is the fastest split deployment path:

- Frontend: Vercel, root directory `frontend`
- Backend: Railway, root directory `backend`
- Database: MongoDB Atlas
- Redis: Railway Redis service in the same Railway project

No real secrets belong in the repo. Put production values only in the Vercel and
Railway dashboards.

## 1. Prepare MongoDB Atlas

Create a MongoDB Atlas cluster and database user, then copy the driver URI.
The URI must include the app database name before the query string:

```text
mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/far-away?retryWrites=true&w=majority
```

For a quick launch, allow network access from `0.0.0.0/0`. Lock this down later
if your hosting provider gives stable outbound IPs.

## 2. Deploy Backend On Railway

In Railway:

1. New Project -> Deploy from GitHub repo.
2. Select `Aadiaditya9421/FAR-AWAY`.
3. Add Redis:
   - Click `+ New` on the project canvas.
   - Choose Database or Template.
   - Add `Redis`.
   - Keep the service name as `Redis`, or adjust the backend `REDIS_URL`
     reference to match the service name.
4. Backend Service Settings:
   - Root Directory: `/backend`
   - Config File Path: `/backend/railway.toml`
5. Backend Variables -> RAW Editor:
   - Use `ops/backend.env.railway.example`
   - Replace every placeholder.
   - Keep `REDIS_ENABLED=true`.
   - Keep `REDIS_URL=${{Redis.REDIS_URL}}` if the Redis service is named `Redis`.
6. Deploy.
7. Generate a public Railway domain.

Temporary first deploy note: if you do not have the Vercel frontend URL yet, use
an HTTPS placeholder for `CLIENT_URL` and `CORS_ORIGINS`, deploy once, then come
back and replace them with the real Vercel URL after the frontend project exists.

Health check:

```bash
curl https://your-railway-backend.up.railway.app/api/health
```

Expected: `success: true`.

## 3. Deploy Frontend On Vercel

In Vercel:

1. Add New Project -> Import `Aadiaditya9421/FAR-AWAY`.
2. Project Settings:
   - Framework Preset: Vite
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
3. Environment Variables:
   - Use `frontend/.env.production.example`
   - `VITE_API_URL=https://your-railway-backend.up.railway.app/api`
   - `VITE_GOOGLE_CLIENT_ID=your-google-oauth-web-client-id.apps.googleusercontent.com`
4. Deploy.

After deployment, copy the final Vercel production URL.

## 4. Update Railway With The Final Frontend URL

In Railway backend variables, set:

```text
CLIENT_URL=https://your-vercel-project.vercel.app
CORS_ORIGINS=https://your-vercel-project.vercel.app
```

Redeploy the Railway backend.

## 5. Configure Google OAuth

In Google Cloud Console, create an OAuth Web Client ID.

Authorized JavaScript origins:

```text
https://your-vercel-project.vercel.app
```

No redirect URI is required for the current Google Identity Services ID-token
login flow.

Use the generated client ID in:

- Railway: `GOOGLE_CLIENT_ID`
- Vercel: `VITE_GOOGLE_CLIENT_ID`

Redeploy both services after adding it.

## 6. Smoke Test

Use the deployed Vercel URL:

- Register a new account; coins should start at `0`.
- Login/logout/refresh should work.
- Forgot-password should send email if SMTP is configured.
- Google sign-in button should appear and login should work.
- Dashboard should show first-run/empty states for a new account.
- Take one quiz and confirm coins/progress update.
- Browser console should show no CORS errors.
- Railway logs should show no repeated healthcheck failures.

## 7. Later Hardening

- Add a custom domain in Vercel.
- Add the custom domain to Railway `CLIENT_URL` and `CORS_ORIGINS`.
- Add the custom domain to Google OAuth Authorized JavaScript origins.
- Enable Railway Redis backups/monitoring if you keep Redis state in production.
- Rotate any secret that has appeared in chat, screenshots, logs, or shared docs.
