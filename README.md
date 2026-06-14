# SKILLPATH

Personalized learning and skill competition platform POC.

## Stack

- Frontend: React 19, Vite, Tailwind CSS
- Backend: Node.js, Express, JavaScript ESM
- Data: MongoDB and Redis
- Realtime: Socket.io
- Local environment: Docker Compose

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

The Docker development stack forces the backend to use the local MongoDB and
Redis containers, even if `backend/.env` contains external database settings.
Use `DEPLOYMENT.md` or the production compose file for hosted services.

Seeded accounts all use password `Admin1234`:

- `admin@skillpath.local`
- `teacher@skillpath.local`
- `student1@skillpath.local`

## Useful Commands

```bash
docker compose ps
docker compose logs -f backend
docker compose exec backend npm run seed
docker compose exec backend npm run smoke
docker compose down
```

Copy `backend/.env.example` to `backend/.env` when running the backend outside Docker.

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
