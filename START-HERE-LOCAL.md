# Far Away — Local Quickstart

Run the whole app on your machine. Pick one option.

## Option A — Docker (recommended: one command, nothing to install but Docker)
```bash
docker compose up --build
```
- Frontend: http://localhost:5173
- Backend health: http://localhost:5000/api/health
- MongoDB + Redis start automatically inside the stack. Docker Compose overrides
  any database values in `backend/.env` so the stack uses the local containers.

Seed demo accounts (in a second terminal):
```bash
docker compose exec backend npm run seed
```

## Option B — Manual (Node 18+ and a local MongoDB)
```bash
# 1) Backend
cd backend
cp .env.local .env        # safe local defaults (Redis disabled)
npm install
npm run seed              # optional: creates demo accounts
npm run dev               # -> http://localhost:5000

# 2) Frontend (new terminal)
cd frontend
npm install
npm run dev               # -> http://localhost:5173
```
If you don't have MongoDB locally, use Option A (Docker) instead.

## Demo accounts (after seeding) — password: `Admin1234`
`admin@faraway.local` · `teacher@faraway.local` · `student1@faraway.local` · `student2@faraway.local` · `student3@faraway.local`

## Good to know
- The UI is wired to the backend API for auth, assessments, submissions, teacher
  feedback, leaderboards, competitions, SkillSwap, coins, analytics, AI insights,
  and Socket.io notifications. Mock data remains only as a guest/offline fallback
  and for static demo defaults such as avatar colors.
- Keep `backend/.env` private. It may contain external service credentials for
  manual or hosted runs, but the Docker quickstart is pinned to local MongoDB and
  Redis.
- Lint is clean: `cd frontend && npm run lint` reports 0 problems.
- To deploy to production instead, see `DEPLOYMENT.md`.
