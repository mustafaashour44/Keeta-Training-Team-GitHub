# Database setup for Keeta Training Team

## What the current source uses

The application already uses **PostgreSQL** through **Drizzle ORM**.

Database connection code:

- `lib/db/src/index.ts`
- `lib/db/drizzle.config.ts`

Schema:

- `lib/db/src/schema/keeta.ts`

The app reads the connection string from the environment variable:

`DATABASE_URL`

## Recommended setup

Use a managed PostgreSQL database. This means the data is stored online by the database provider and does not need to be stored on your personal computer.

Typical flow:

1. Create a new PostgreSQL database at a managed provider.
2. Copy its PostgreSQL connection string.
3. Add that value as `DATABASE_URL` in the backend hosting service's environment/secrets settings.
4. Run:

```bash
pnpm --filter @workspace/db run push
```

5. Start/deploy the API server.

## Can the data be stored "inside the website"?

For this project, not safely in the frontend itself.

Browser-only storage such as `localStorage` would keep data only in one browser/device, can be cleared, and would not provide one shared database for the five trainers. It is unsuitable for a shared operational training system.

A managed database is the correct approach. It is still "online with the website" from the user's point of view, but technically it is a separate database service connected securely to the backend.
