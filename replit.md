# Keeta Training Team

An internal source of truth for training activities, sessions, agent coverage, head count, updates, trainer workload, and reports.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/keeta-training-team` — React/Vite web application and visual system
- `artifacts/api-server/src/routes/keeta.ts` — Keeta API routes and aggregation logic
- `lib/db/src/schema/keeta.ts` — PostgreSQL/Drizzle tables for the training domain
- `lib/api-spec/openapi.yaml` — API source of truth
- `lib/api-client-react/src/generated` — generated React Query client

## Architecture decisions

- The app intentionally has no login, authentication, or role gates; it is a shared internal workspace.
- Trainers are a fixed five-person roster, all modeled as full-knowledge trainers without permanent LOB ownership.
- Coverage is derived from required-agent assignments plus completed-session attendance, so an agent is counted once per activity while attendance history remains intact.
- Agent profile changes update the current roster only; attendance and session records retain their historical references.
- Initial operational data is empty; fixed configuration such as the trainer roster is initialized idempotently.

## Product

The dashboard gives the team an at-a-glance view of coverage and workload. The app supports activity planning, session scheduling, attendance capture, agent records, coverage follow-up, LOB head count, operational updates, trainer workload, reports, and shared settings. Empty states guide the first real records without seeded demo data.

## User preferences

- Keep the interface professional, clear, and management-friendly.
- Do not introduce authentication, roles, or demo records unless explicitly requested.

## Gotchas

- Regenerate the API client after changing `lib/api-spec/openapi.yaml`.
- The generated Zod client targets Zod 4; keep the workspace catalog and API packages aligned with `zod/v4`.
- Restart both managed API and web workflows after server or package changes before checking the preview.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
