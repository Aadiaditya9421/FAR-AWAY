# SkillPath Frontend

React 19 + Vite 8 + Tailwind CSS v4 client for the SkillPath learning platform.

## What This App Includes

- Student dashboard, learning recommendations, coins, ranks, competitions, quizzes, assessments, and SkillSwap.
- Teacher dashboard, classroom review flows, AI feedback notes, and adaptive test creation.
- Coding practice powered by Monaco Editor with runtime language controls and backend execution APIs.
- SkillPath logo and favicon across the landing page, dashboard, browser tab, and install metadata.
- Browser-native navigation behavior. The app does not add a custom back button on every page.

Dashboard graphs are hidden in the current product version.

## Frontend Stack

- React 19
- Vite 8
- Tailwind CSS v4 with `@tailwindcss/vite`
- Monaco Editor for coding practice
- Socket.io client for realtime notifications
- Custom UI and icon components in `src/components`

## Local Setup

Run from this `frontend` directory:

```bash
npm install
npm run dev
```

Open http://localhost:5173.

The frontend expects the backend API at `VITE_API_URL`. In local Docker development, this is configured by Compose. For manual local development, create a frontend environment file if needed and point it at the backend API.

## Validation

```bash
npm run lint
npm run build
```

## Important Folders

```text
src/components/      Shared layout, UI, and icon components
src/features/        Feature modules for auth, dashboard, coding, teacher, and more
src/services/        API clients and app services
public/              SkillPath logo, favicon, and web manifest assets
```
