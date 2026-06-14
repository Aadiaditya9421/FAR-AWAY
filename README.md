# SkillPath

<p align="center">
  <img src="frontend/public/skillpath-logo.png" alt="SkillPath logo" width="420">
</p>

SkillPath is a full-stack learning platform for students, teachers, and admins. It combines assessments, coding practice, competitions, leaderboards, coins, SkillSwap peer learning, teacher review flows, AI learning insights, and realtime notifications in one workspace.

## Current Scope

- Student dashboard with progress summaries, recommended learning paths, coins, ranks, and active work.
- Coding practice with a Monaco editor, runtime language selection, server-side execution, and judged submissions.
- Competitions, quizzes, assessments, leaderboards, and SkillSwap sessions.
- Teacher tools for classroom visibility, student review, AI notes, and adaptive test generation.
- Admin and auth flows with JWT, OTP email verification, Google login support, and role-based navigation.
- SkillPath logo, favicon, and title are used across the app, dashboard, browser tab, and install metadata.

Dashboard graphs are intentionally not shown in the current UI.

## Tech Stack

- Frontend: React 19, Vite 8, Tailwind CSS v4, Monaco Editor, Socket.io client
- Backend: Node.js, Express 4, JavaScript ESM, Socket.io
- Data: MongoDB, Redis
- AI: Google Gemini integration for tutoring, insights, and adaptive support
- Code execution: backend judge service with Judge0, Piston, or optional local server sandbox
- Local environment: Docker Compose

## Project Structure

```text
.
|-- backend/                 Express API, models, controllers, services, sockets
|-- frontend/                React/Vite single-page app
|-- ops/                     Production environment templates
|-- docker-compose.yml       Local full-stack development services
|-- docker-compose.prod.yml  Production compose template
|-- DEPLOYMENT.md            Deployment guide
|-- START-HERE-LOCAL.md      Local setup quickstart
`-- SkillPath_System_Design_POC.md
```

## Start The Full Stack

Docker Desktop must be running.

```bash
docker compose up -d --build
docker compose exec backend npm run seed
docker compose exec backend npm run smoke
```

Services:

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api
- Health check: http://localhost:5000/api/health
- MongoDB: localhost:27017
- Redis: localhost:6379

The Docker development stack forces the backend to use the local MongoDB and Redis containers, even if `backend/.env` contains external database settings. Use `DEPLOYMENT.md` or the production compose file for hosted services.

Seeded accounts all use password `Admin1234`:

- `admin@skillpath.local`
- `teacher@skillpath.local`
- `student1@skillpath.local`

## Run Without Docker

Install dependencies separately:

```bash
cd backend
npm install
copy .env.example .env
npm run dev
```

```bash
cd frontend
npm install
npm run dev
```

When running outside Docker, make sure MongoDB and Redis are reachable from the values in `backend/.env`.

## Useful Commands

```bash
docker compose ps
docker compose logs -f backend
docker compose exec backend npm run seed
docker compose exec backend npm run smoke
docker compose down
```

Backend checks:

```bash
cd backend
npm run check
npm run predeploy:check
```

Frontend checks:

```bash
cd frontend
npm run lint
npm run build
```

## Code Execution

SkillPath does not compile user code in the browser. The browser sends code to the backend, and the backend routes it through the configured execution provider:

```text
Browser editor -> Backend API -> Judge service -> Sandbox/runtime -> Test cases -> Result
```

Supported execution modes:

- `JUDGE0_API_URL` and related Judge0 settings for Judge0 execution.
- `PISTON_API_URL` for Piston execution.
- `LOCAL_COMPILER_ENABLED=true` for an optional local server-side sandbox in development only.

Production deployments should use a dedicated sandboxed execution service rather than browser-side or unrestricted local execution.

## Docker Troubleshooting

MongoDB and Redis do not need to be installed directly on Windows. They run inside Docker Compose.

If `docker compose up` reports that the Docker daemon is unavailable:

```powershell
Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"
docker version
docker compose up -d --build
```

Wait until `docker version` shows both a `Client` and `Server` section. Then confirm service readiness:

```bash
docker compose ps
```

`backend`, `mongo`, and `redis` should report `healthy`. If Docker Desktop remains stuck, run `wsl --shutdown`, reopen Docker Desktop, and retry.
