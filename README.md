# Keeta Training Team

GitHub-ready copy of the original Replit source code. Application source and UI logic have not been changed; only generated build/cache metadata was removed and repository documentation was added.

## Stack

- React 19 + Vite + TypeScript
- Express 5 API
- PostgreSQL
- Drizzle ORM
- pnpm workspaces

## Main project folders

- `artifacts/keeta-training-team` — website frontend
- `artifacts/api-server` — Express backend/API
- `lib/db` — PostgreSQL + Drizzle database schema
- `lib/api-spec` — OpenAPI specification
- `lib/api-client-react` — generated frontend API client
- `lib/api-zod` — API validation schemas

## Database

The current application is already written for PostgreSQL. It expects a `DATABASE_URL` environment variable.

The database does **not** need to run on your own computer. A managed PostgreSQL provider can host it online. Put its connection string in `DATABASE_URL` on whichever service hosts the backend.

After configuring `DATABASE_URL`, push the existing schema to an empty PostgreSQL database with:

```bash
pnpm --filter @workspace/db run push
```

Existing schema is defined at:

`lib/db/src/schema/keeta.ts`

It contains the application's tables for trainers, agents, training activities, required agents, sessions, attendance, updates, head-count snapshots, and activity logs.

## Local prerequisites

- Node.js (the original project documents Node 24)
- pnpm
- PostgreSQL connection string

Install pnpm if needed:

```bash
npm install -g pnpm
```

Install project dependencies:

```bash
pnpm install
```

## Important environment variables

Copy `.env.example` to your local environment/configuration and supply real values outside GitHub.

Never commit a real `.env` file or `DATABASE_URL` password.

Backend requires:

- `DATABASE_URL`
- `PORT`

Frontend Vite configuration requires:

- `PORT`
- `BASE_PATH`

## GitHub upload

Create an empty GitHub repository, then from this folder:

```bash
git init
git add .
git commit -m "Initial Keeta Training Team source"
git branch -M main
git remote add origin YOUR_GITHUB_REPOSITORY_URL
git push -u origin main
```

## Important: GitHub is source control, not the full application host

A GitHub repository stores the source code. GitHub Pages alone cannot run this project's Express backend and PostgreSQL database.

For a live version, deploy:

1. the frontend,
2. the Express API,
3. a PostgreSQL database.

The PostgreSQL database may be hosted by a managed provider, so nothing has to stay running on your own PC.
