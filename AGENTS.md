# AGENTS.md — BSC Project

## Layout

Three independent Node projects; no workspace tooling at the root level.

| Directory | Purpose | Stack |
|-----------|---------|-------|
| `bsc-shared/` | Shared TypeScript types + Zod validation schemas | TS, Zod |
| `bsc-api/` | REST API backend | Express, Prisma 6, PostgreSQL, JWT |
| `FRONT/` | Dashboard SPA | React 19, Vite, Tailwind CSS v4, TanStack Query |

## Dependency chain

```
bsc-shared  ←  bsc-api   (via "file:../bsc-shared" in package.json)
bsc-shared  ←  FRONT      (via "file:../bsc-shared" in package.json)
```

**After editing `bsc-shared/src/index.ts`, you must run `npm run build` inside `bsc-shared/` before dependent projects will see the change.**

## Startup order (local dev)

1. **PostgreSQL** — `docker compose up -d` (inside `bsc-api/`)
2. **Database setup** (first time or after reset):
   ```bash
   cd bsc-api
   npx prisma migrate dev --name init
   npm run db:seed        # creates admin/admin123 + seed data
   ```
3. **API server** — `cd bsc-api && npm run dev` (port 3000)
4. **Frontend** — `cd FRONT && npm run dev` (Vite proxies `/api` → `localhost:3000`)

## bsc-shared

- Single entry point: `src/index.ts` — types and Zod schemas
- Build: `npm run build` → `dist/` (CommonJS)
- No tests configured

## bsc-api

- **Entrypoint**: `src/server.ts` → `src/app.ts`
- **Prisma client output**: `src/generated/prisma` (not the default `node_modules/@prisma/client`). Imported as `import { PrismaClient } from "./generated/prisma"`.
- **Prisma config**: `prisma.config.ts` (Prisma 6 format, uses `dotenv/config`), **not** just `schema.prisma`.
- **Routes**: `/api/auth/*` (public) and `/api/perspectives/**` (JWT-protected, nested: perspectives → projects → activities)
- **Validation**: Zod schemas imported from `bsc-shared` via `validate()` middleware
- **Auth**: JWT + bcrypt. Tokens in `Authorization: Bearer <token>`. Refresh token endpoint at `/api/auth/refresh`.
- **Seed data**: `prisma/seed.ts` reads `src/data/bscData.json` and validates via `bsc-shared` schemas
- **`.env`** is committed with dev defaults (JWT secrets are placeholder — change for production)
- **No linter or test runner configured**

### bsc-api scripts

```bash
npm run dev          # tsx watch src/server.ts (hot reload)
npm run build        # tsc (compiles to dist/)
npm run start        # node dist/server.js (production)
npm run db:migrate   # prisma migrate dev
npm run db:seed      # tsx prisma/seed.ts
npm run db:studio    # prisma studio (GUI)
npm run db:reset     # prisma migrate reset (destroys data!)
```

## FRONT

See `FRONT/AGENTS.md` for full details. Key cross-project facts:

- Uses TanStack Query (`usePerspectives`, `useUpdateProgress` hooks) — not `DataContext`
- Communicates with `bsc-api` via axios (`src/services/api.ts`)
- Auth via `AuthProvider` + `localStorage` (JWT + refresh token with auto-retry on 401)
- Types re-exported from `bsc-shared` through `src/types/bsc.ts`
- Vite dev server proxies `/api` requests to `localhost:3000` (configured in `vite.config.ts`)

## Common pitfalls

- **Prisma client import path**: Always `from "./generated/prisma"` (or `from "../generated/prisma"`), never `from "@prisma/client"`.
- **Changing `bsc-shared`**: Must `cd bsc-shared && npm run build` before `bsc-api` or `FRONT` will pick up changes.
- **Database not running**: API will crash on startup. Start Docker first.
- **Port 3000 must be free**: Both API and Vite proxy expect this port.
- **No root `package.json`**: Each project has its own `node_modules`. Run `npm install` in each directory independently.