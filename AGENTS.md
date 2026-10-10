# AGENTS.md — BSC Project

## Layout

Three independent Node projects; no workspace tooling at the root level.

| Directory | Purpose | Stack |
|-----------|---------|-------|
| `bsc-shared/` | Shared TypeScript types + Zod schemas + weighted progress calc | TS, Zod |
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
   npm run db:migrate
   npm run db:seed        # creates admin/admin123 + seed data + initial snapshot
   ```
3. **API server** — `cd bsc-api && npm run dev` (port 3000)
4. **Frontend** — `cd FRONT && npm run dev` (Vite proxies `/api` → `localhost:3000`)

## bsc-shared

- Single entry point: `src/index.ts` — types, Zod schemas and weighted progress calc (`computeWeightedProgress`, `computePerspectiveProgress`)
- Build: `npm run build` → `dist/` (CommonJS). `dist/` is gitignored — build before first dev run
- Tests: `npm test` (vitest — schemas + weighted progress)

## bsc-api

- **Entrypoint**: `src/server.ts` → `src/app.ts`
- **Prisma client**: default client — import as `import { PrismaClient } from "@prisma/client"`. Schema at `prisma/schema.prisma`, config via `.env` (no `prisma.config.ts`).
- **Routes**: `/api/health` + `/api/auth/*` (public); `/api/perspectives/**`, `/api/snapshots/**`, `/api/avances/**` (JWT; writes require `admin` role); `/api/users/**` (admin only)
- **Validation**: Zod schemas imported from `bsc-shared` via `validate()` middleware
- **Auth**: JWT + bcrypt. Tokens in `Authorization: Bearer <token>`. Refresh token endpoint at `/api/auth/refresh`. RBAC roles `admin`/`lector` via `requireRole` middleware. Login rate-limited (20/15min). `helmet` enabled.
- **Seed data**: `prisma/seed.ts` reads `src/data/bscData.json`, validates via `bsc-shared` schemas, and creates the admin user + initial snapshot "Inicial"
- **Env**: `.env` is gitignored; `.env.example` documents the required variables. JWT secrets are placeholders — change for production. Seed creates `admin`/`admin123`
- **Middleware**: `authMiddleware` (JWT) → `requireRole("admin")` (DB lookup) → `validate` (Zod) → `asyncHandler` wraps async handlers so rejections reach `errorHandler` (maps Prisma P2025→404, P2002→409)
- **Dependency notes**: `bcrypt@6` ships prebuilt binaries via `node-gyp-build` (Node ≥ 18; no `node-pre-gyp`/`tar` chain). `package.json` overrides `qs` to `^6.16.0` because `express@4.22` pins `~6.14.0`, which falls inside the vulnerable range of recent qs advisories.
- **Tests**: vitest + supertest (`npm test`) — integration tests hit the real database (PostgreSQL + seed required). No linter.

### bsc-api scripts

```bash
npm run dev               # tsx watch src/server.ts (hot reload)
npm run build             # builds bsc-shared + prisma generate + tsc → dist/
npm run start             # prisma migrate deploy + node dist/server.js (production)
npm run db:migrate        # prisma migrate dev
npm run db:migrate:deploy # prisma migrate deploy
npm run db:seed           # tsx prisma/seed.ts
npm run db:studio         # prisma studio (GUI)
npm run db:reset          # prisma migrate reset (destroys data!)
npm test                  # vitest run (requires PostgreSQL + seed)
```

## FRONT

See `FRONT/AGENTS.md` for full details. Key cross-project facts:

- Uses TanStack Query (`usePerspectives`, `useStructureCrud`, `useUsers`, `useSnapshots`, `useAvances`, `useCreateAvance` hooks) — not `DataContext`
- Communicates with `bsc-api` via axios (`src/services/api.ts`)
- Auth via `AuthProvider` + `localStorage` (JWT + refresh token with auto-retry on 401)
- Role-gated routes via `RequireRole` component (`/ingreso-datos`, `/admin/**` are admin-only)
- Admin UI at `/admin/estructura` (CRUD of perspectives/projects/activities) and `/admin/usuarios` (user management)
- Types re-exported from `bsc-shared` through `src/types/bsc.ts`
- Vite dev server proxies `/api` requests to `localhost:3000` (configured in `vite.config.ts`)
- `xlsx` is installed from the SheetJS CDN tarball, not the npm registry — see "Pending work" in `FRONT/AGENTS.md`; do not reinstall from npm

## Common pitfalls

- **bsc-api tests hit the real database** (integration): start PostgreSQL and run the seed before `npm test`.
- **Changing `bsc-shared`**: Must `cd bsc-shared && npm run build` before `bsc-api` or `FRONT` will pick up changes.
- **Database not running**: API will crash on startup. Start Docker first.
- **Port 3000 must be free**: Both API and Vite proxy expect this port.
- **No root `package.json`**: Each project has its own `node_modules`. Run `npm install` in each directory independently.