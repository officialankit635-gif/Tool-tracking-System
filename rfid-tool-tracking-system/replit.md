# RFID Tool Tracking System

A full-stack tool inventory management system that simulates RFID-based tracking for warehouses and industrial environments.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/rfid-tracker run dev` — run the frontend (port 23643)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Default Credentials (seeded)

- `admin@rfid.com` / `password123`
- `john@rfid.com` / `password123`
- `sarah@rfid.com` / `password123`

## Seeded Tools

T001–T008 across categories: Power Tools, Hand Tools, Measuring Tools, Electronic Tools

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, Wouter routing, TanStack Query, shadcn/ui, Tailwind CSS
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Auth: JWT (stored in localStorage as `rfid_token`)
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — source of truth for all API contracts
- `lib/db/src/schema/` — Drizzle ORM tables (users, tools, transactions)
- `artifacts/api-server/src/routes/` — Express route handlers
- `artifacts/api-server/src/middlewares/auth.ts` — JWT auth middleware
- `artifacts/api-server/src/lib/jwt.ts` — JWT sign/verify
- `artifacts/rfid-tracker/src/` — React frontend
- `artifacts/rfid-tracker/src/hooks/use-auth.tsx` — auth context + JWT storage

## Architecture decisions

- JWT secret defaults to a hardcoded fallback; set `JWT_SECRET` env var in production
- Inventory scan compares scanned RFID tag IDs against all tools in DB (not just available ones)
- Issue endpoint validates tool must be `available`; return endpoint validates tool must be `issued`
- The `orval.config.ts` uses `mode: "single"` for Zod output to avoid duplicate export conflicts
- `custom-fetch.ts` uses `setAuthTokenGetter` so all generated hooks automatically send the JWT token

## Product

- **Dashboard** — real-time stats (total, available, issued, missing), recent activity feed, category breakdown
- **Tool Master** — full CRUD for tools with search/filter by status and category
- **Issue/Return Flow** — form-based workflows with business logic validation
- **Inventory Scan** — RFID simulation with correct/missing/extra tool detection
- **Transaction History** — full audit log with filters
- **JWT Auth** — register/login with protected routes

## Gotchas

- Always run `pnpm --filter @workspace/api-spec run codegen` after changing `openapi.yaml`
- The `orval.config.ts` `schemas` option was removed to prevent duplicate export conflicts between Zod schemas and TypeScript types
- `lib/api-zod/src/index.ts` must only export from `./generated/api` (not `./generated/types`)
- DB password hash uses bcrypt rounds=10; seeded users have password `password123`

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
