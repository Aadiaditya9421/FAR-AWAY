# SkillPath Completion Plan

Date: 2026-06-13
Source reviewed: `C:\Users\adity\Downloads\implementation_plan 12june`
Project root: current local workspace folder.

## Audit Snapshot

The codebase already contains a much larger implementation than the June 12 plan implies. Core auth, assessments, adaptive question selection, leaderboards, competitions, SkillSwap, coins, analytics, AI insights, coding practice, Socket.io notifications, Docker Compose, CI, request IDs, logging, environment validation, and responsive frontend fixes are present.

The biggest immediate issue is operational safety: the local Docker stack currently loads `backend/.env`, and that file can point at a remote MongoDB database. Because Compose did not override `MONGO_URI`, local verification scripts can mutate remote data. This must be fixed before deeper feature work.

## Deployment Sprint Status

Status: deployment path verified for self-contained Docker/VPS deployment.

Completed:
- Docker development stack now forces local MongoDB and Redis.
- Production Compose config builds backend and frontend images successfully.
- Production Compose now waits for backend health before starting frontend.
- Production config validation rejects placeholder database, Redis, and frontend origin values.
- Destructive seed/verify scripts are guarded against accidental remote database mutation.
- Socket.io notification, leaderboard, and competition namespaces require JWT auth.
- Socket.io uses the Redis adapter when Redis is connected, so realtime events are ready for multiple backend instances.
- Google sign-in/registration is wired through backend Google ID token verification.
- Forgot-password/reset-password endpoints and auth-page flows are wired; SMTP sends the reset link when credentials are present.
- Deployment runbook has been rewritten with exact commands and safety notes.

Still manual before a real public launch:
- Fill `backend/.env` with real production JWT secrets and frontend domain(s).
- Fill SMTP credentials and Google OAuth Web Client ID values in backend/frontend env files.
- Point DNS/HTTPS/reverse proxy at the server, or put the stack behind a TLS proxy.
- Run the final browser golden path on the deployed URL.

## System Design Doc Comparison

Source reviewed: `SkillPath_System_Design_POC.md`

Matches:
- Backend folder structure, route groups, models, validators, middleware, services, sockets, Docker setup, and CI are broadly aligned with the design.
- Auth, refresh tokens, assessment retrieval/submission, leaderboard, coins, competitions, SkillSwap, users, analytics, and Socket.io are implemented.
- The implementation goes beyond the original POC with adaptive question bank selection, AI insights, coding practice, integrity events, production compose, and deployment validation.

Intentional differences:
- The design doc specifies Next.js, TypeScript, Redux Toolkit, and TanStack Query. The current implementation is Vite + React + JavaScript with local context/services. A framework migration is not deployment-safe inside the current sprint window.
- The design doc lists a 500-coin default user balance. Current product behavior intentionally starts new real accounts at 0 coins, with optional daily bonus and earned rewards.

Remaining design gaps:
- Frontend does not yet have dedicated profile, coins-history, and analytics pages as routable screens.
- No OpenAPI/Postman collection has been generated yet.
- No full test harness exists beyond syntax checks, smoke tests, focused API probes, and browser viewport checks.
- Public file storage such as S3/Cloudinary is not needed by the current UI and is not configured.

## Verified Baseline

- Frontend lint: `npm.cmd run lint` passed.
- Frontend build: `npm.cmd run build` passed.
- Backend syntax check: `npm.cmd run check` passed.
- Docker services: backend, frontend, MongoDB, and Redis containers are running.
- Backend smoke: `docker compose exec -T backend npm run smoke` passed.
- Auth refresh token flow was manually verified through login and refresh.
- Google auth route returns a configuration error until `GOOGLE_CLIENT_ID` is set, and forgot/reset password API probes return the expected statuses.
- Auth page login, register, forgot-password, and reset-token screens render in the in-app browser; mobile width check at 390px has no horizontal overflow.
- Backend health endpoint responded successfully.
- Responsive Phase 1 items from the June 12 plan are already implemented in the main views.

Note: two phase verification scripts were run before the Docker database mismatch was identified. They use the backend `MONGO_URI`, so they should be treated as unsafe until guarded.

## Already Implemented Or Mostly Implemented

- Responsive shell and mobile behavior for quiz, assessments, auth, header, and class progress.
- Backend route protection with JWT middleware for core APIs.
- Refresh token rotation and logout flow.
- Request ID middleware, request logging, rate limiting, centralized error handling.
- Environment validation for production secrets and required URLs.
- Mongo connection retry and index setup.
- Adaptive question selection using `QuestionBank` and BKT-style `UserProgress`.
- Assessment submission scoring, review, feedback, integrity summary, analytics, coins, and leaderboard updates.
- Gemini-backed/fallback AI insights, hints, study notes, and coding reviews.
- Coding practice list, run, submit, review, and local non-production JavaScript runner.
- Competition models, team support, leaderboard and live update service.
- SkillSwap models, requests, recommendations, and frontend views.
- API client with automatic refresh-on-401.
- Socket.io client wiring for notifications, leaderboard, and competitions.
- CI workflow for backend syntax check and frontend lint/build.

## Key Gaps And Risks

- Local Docker can accidentally use a remote MongoDB if `backend/.env` contains one.
- Redis container is present but disabled when `.env` has `REDIS_ENABLED=false`.
- Verification scripts can mutate whichever database `MONGO_URI` points to.
- Socket.io namespaces and notification rooms are not authenticated.
- Socket CORS uses only `CLIENT_URL` instead of the configured CORS origin list.
- Coin debit/credit and competition join are not transaction-safe.
- Static embedded assessment questions cannot always use AI explanation because the explanation service only looks in `QuestionBank`.
- Teacher create-test flow still simulates AI generation and creates static questions instead of dynamic/adaptive configs.
- `App.jsx` is too large and mixes routing, orchestration, mapping, API calls, auth checks, and quiz timing.
- Auth initialization state exists but is not used as a UI gate.
- No real unit/integration test runner yet.
- PWA, profile, discussion/community, queue, and plagiarism service items from later phases are missing.

## 20 Smaller Chunks

### 1. Local Environment Isolation

Status: completed

Deliverables:
- Make Docker Compose force local MongoDB and Redis defaults for the development stack.
- Document that Docker overrides database URLs to local containers.
- Verify health, seed, and smoke test against local containers.

Verification:
- `docker compose config`
- `docker compose up -d backend`
- `docker compose exec -T backend npm run seed`
- `docker compose exec -T backend npm run smoke`

Completed verification:
- `docker compose config` resolves `MONGO_URI` to `mongodb://mongo:27017/skillpath`.
- Backend health reports MongoDB and Redis as connected.
- Seed script ran against local Docker MongoDB.
- Backend smoke test passed against the local seeded database.

### 2. Safe Verification Scripts

Status: completed

Deliverables:
- Add explicit test-database guardrails to phase verification scripts.
- Block scripts when `MONGO_URI` is remote unless an explicit override flag is set.
- Add a non-destructive dry-run mode where practical.

Verification:
- Scripts refuse remote MongoDB by default.
- Scripts run against local Docker MongoDB.

Completed verification:
- `verify-phase4.js` and `verify-phase4-5.js` now refuse remote-looking MongoDB URIs by default.
- `seed.js` now requires `ALLOW_DESTRUCTIVE_SEED=true` or `--allow-remote-db-mutation` for remote-looking MongoDB URIs.
- Local Docker MongoDB host `mongo` remains allowed for normal development seeding.

### 3. Static And Dynamic AI Explanation Compatibility

Status: completed

Deliverables:
- Update misconception explanation lookup to support both `QuestionBank` IDs and embedded `Assessment.questions` IDs.
- Preserve the existing fallback behavior when Gemini is unavailable.

Verification:
- Quiz result explanation works for seeded/static assessments and dynamic assessments.

Completed verification:
- `learningInsightService` now resolves both `QuestionBank` questions and embedded `Assessment.questions` IDs.
- `/api/analytics/explain` validates `submissionId` and `questionId`, and enforces owner/teacher/admin access.
- API probes passed for owned explanation, invalid-ID validation, and cross-student forbidden access.
- `docker compose exec -T backend npm run verify:phase4.5` passed with deterministic fallback output.

### 4. Teacher Test Creation Reliability

Status: pending

Deliverables:
- Fix async subject initialization in `CreateTestView`.
- Replace simulated AI generation with a clearer static/dynamic creation path.
- Allow teachers to create dynamic or adaptive tests using `questionConfig`.

Verification:
- Teacher can create a static test.
- Teacher can create a dynamic/adaptive test.
- Student receives appropriate questions.

### 5. Frontend App Decomposition

Status: pending

Deliverables:
- Extract data mappers and API orchestration out of `App.jsx`.
- Keep view behavior unchanged while reducing the main component size.
- Add small, focused hooks for dashboard, assessments, competitions, and quiz session state.

Verification:
- Frontend lint/build pass.
- Smoke-click main student and teacher flows.

### 6. Auth Initialization Gate

Status: completed

Deliverables:
- Use `AuthContext.initializing` to avoid auth-page flash and guest fallback during token restore.
- Add a lightweight loading shell.

Verification:
- Reload with valid tokens keeps the user in-app.
- Reload with expired tokens refreshes or logs out cleanly.

Completed verification:
- `AuthContext.initializing` is now consumed by `App.jsx`.
- The app shows a session restore shell instead of briefly rendering auth/guest data during token restore.

### 7. Socket Authentication And CORS

Status: completed

Deliverables:
- Authenticate Socket.io connections with JWT.
- Join notification rooms from authenticated user identity, not query string.
- Apply the same CORS origin list used by Express.

Verification:
- Valid users receive their own notifications.
- Invalid tokens fail connection.
- Cross-origin dev client still connects.

Completed verification:
- Socket.io now uses JWT auth middleware on root, leaderboard, and competition namespaces.
- Notification rooms are joined from the verified token user ID instead of a query string.
- Socket.io CORS uses the configured `CORS_ORIGINS` allow-list.

### 8. Multi-Instance Realtime Readiness

Status: completed

Deliverables:
- Add Redis adapter for Socket.io when Redis is enabled.
- Keep no-Redis local fallback for manual development.

Verification:
- Socket events still work with Redis enabled.
- App still starts when Redis is intentionally disabled.

Completed verification:
- Added `@socket.io/redis-adapter`.
- Socket.io attaches the Redis adapter when Redis is enabled and connected.
- Socket auth probe still passes with the Redis adapter active.
- Backend smoke test still passes.

### 9. Transaction-Safe Coins And Competition Join

Status: completed

Deliverables:
- Use MongoDB transactions or atomic updates for coin debit/credit paths.
- Prevent double join and overspend under concurrent requests.

Verification:
- Concurrent join/debit test cannot create negative balances or duplicate entries.

Completed verification:
- Coin credits/debits now use atomic MongoDB update operations.
- Competition joins atomically reject duplicate participants before charging the entry fee.
- Focused concurrency probe produced one `200`, one `409`, and exactly one fee debit.

### 10. Backend Logging Cleanup

Status: pending

Deliverables:
- Replace remaining operational `console.log/error` calls with the shared logger.
- Keep script output readable where scripts intentionally print status.

Verification:
- Backend starts cleanly and logs request IDs/errors consistently.

### 11. Test Harness Foundation

Status: pending

Deliverables:
- Add backend test runner and first integration tests for auth, assessments, coins, competitions, and problems.
- Add frontend component or smoke tests for auth restore, quiz, leaderboard, and teacher test creation.

Verification:
- `npm test` or equivalent passes locally and in CI.

### 12. Responsive QA Sweep

Status: completed

Deliverables:
- Use browser viewport checks for mobile, tablet, and desktop.
- Fix any text overflow or layout overlap found in real rendering.

Verification:
- Screenshots/checks pass at 390px, 768px, and desktop widths.

Completed verification:
- Browser overflow audit passed at 390px, 768px, and 1280px.
- Mobile navigation menu opens without horizontal overflow.

### 13. Coding Execution Queue

Status: pending

Deliverables:
- Add a queue abstraction for code execution jobs.
- Keep local JS runner as development-only fallback.
- Use Judge0 path when configured.

Verification:
- Run and submit return stable job results.
- Production refuses unsafe local execution.

### 14. Plagiarism And Integrity V2

Status: pending

Deliverables:
- Add plagiarism service skeleton and first similarity checks for coding submissions.
- Surface integrity/plagiarism summary in teacher review.

Verification:
- Similar submissions are flagged.
- Normal submissions are not over-flagged.

### 15. Leaderboard And Topic Data Cleanup

Status: pending

Deliverables:
- Make frontend topic lists derive from backend data where possible.
- Review leaderboard rank recalculation performance and update strategy.

Verification:
- New topics appear without frontend code edits.
- Existing leaderboard flows still work.

### 16. PWA Basics

Status: pending

Deliverables:
- Add `manifest.json`, icons strategy, and service worker registration.
- Cache only safe static assets and avoid stale authenticated API data.

Verification:
- Build passes.
- Browser installability checks pass where supported.

### 17. Route Deep Links

Status: pending

Deliverables:
- Introduce React Router or a minimal route layer.
- Preserve the current tab UX while enabling direct links to core pages.

Verification:
- Refreshing a deep link stays on the expected view.

### 18. Public Profile

Status: pending

Deliverables:
- Add backend profile endpoint and frontend public profile view.
- Show safe public learning stats, badges, and contribution signals.

Verification:
- Public profile hides private fields and auth tokens.

### 19. Discussion And Community

Status: pending

Deliverables:
- Add discussion model, routes, and frontend thread view.
- Support assessment/problem-linked discussions with moderation basics.

Verification:
- Users can create, view, and reply to threads.
- Unauthorized edits/deletes are blocked.

### 20. Production Hardening And Deployment Readiness

Status: partially completed

Deliverables:
- Recheck production env requirements, Docker production compose, deployment docs, health checks, and observability.
- Add final release checklist.

Verification:
- Production build succeeds.
- Deployment documentation matches the code.
- Health checks reflect MongoDB and Redis accurately.

Completed verification:
- `docker compose -f docker-compose.prod.yml config` succeeds.
- `docker compose -f docker-compose.prod.yml build` succeeds for backend and frontend.
- Local backend health reports MongoDB and Redis connected.
- Local backend smoke test passes.
- Frontend Docker production builds now include `VITE_GOOGLE_CLIENT_ID` as a build arg.
- Backend env examples document `GEMINI_API_KEY` and `GEMINI_MODEL`; Gemini remains optional.
- Deployment runbook now covers credential rotation, Google OAuth origins, SMTP reset-email checks, Gemini fallback behavior, and Atlas mutation safety.
- Browser viewport checks passed at 390px, 768px, and 1280px with no horizontal overflow.
- Backend and frontend now include `predeploy:check` and `predeploy:strict` scripts that validate production config without printing secrets.
- CI now runs on `aditya-backend`, includes predeploy reports, and validates production Compose config with example env placeholders.
- Current report-only checks flag the remaining non-secret deployment blockers: deployed HTTPS origins, Google OAuth client IDs, production `NODE_ENV`, and Redis/hosting choices.

## Immediate Execution Order

1. Complete Chunk 1 to prevent accidental remote database mutation.
2. Complete Chunk 2 so future verification is safe.
3. Fix user-visible correctness issues in Chunks 3 and 4.
4. Reduce frontend risk through Chunks 5 and 6.
5. Harden realtime, money-like state, and tests through Chunks 7 to 11.
