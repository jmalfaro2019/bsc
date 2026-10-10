# BSC — Balanced Scorecard

Sistema de gestión estratégica basado en Balanced Scorecard. Modela la jerarquía **Perspectivas → Proyectos → Actividades**, con ponderaciones, registro de avances con descripción, snapshots históricos, gráfico de tendencia y control de acceso por roles (`admin` / `lector`).

Monorepo con tres proyectos Node independientes (no hay workspace tooling en la raíz):

| Directorio   | Propósito                                                        | Stack                                              |
| ------------ | ---------------------------------------------------------------- | -------------------------------------------------- |
| `bsc-shared/` | Tipos, schemas Zod y cálculo de progreso ponderado compartidos    | TypeScript, Zod                                    |
| `bsc-api/`    | REST API backend                                                  | Express, Prisma 6, PostgreSQL, JWT                 |
| `FRONT/`      | Dashboard SPA                                                     | React 19, Vite, Tailwind CSS v4, TanStack Query    |

## Dependencias entre proyectos

```
bsc-shared  ←  bsc-api   ("file:../bsc-shared" en package.json)
bsc-shared  ←  FRONT     ("file:../bsc-shared" en package.json)
```

**Importante**: tras editar `bsc-shared/src/index.ts` hay que ejecutar `npm run build` dentro de `bsc-shared/` para que `bsc-api` y `FRONT` vean los cambios. Los scripts `build` de `bsc-api` y `vercel-build` de `FRONT` ya compilan `bsc-shared` automáticamente.

## Requisitos previos

- Node.js 18+ (recomendado 20+)
- Docker (PostgreSQL 16 vía Docker Compose)

## Puesta en marcha (desarrollo)

```bash
# 1. Levantar PostgreSQL (definido en bsc-api/docker-compose.yml)
cd bsc-api
docker compose up -d

# 2. Instalar dependencias en cada proyecto
cd ../bsc-shared && npm install && npm run build
cd ../bsc-api && npm install
cd ../FRONT && npm install

# 3. Preparar la base de datos (migraciones + seed)
cd ../bsc-api
npm run db:migrate
npm run db:seed

# 4. Arrancar la API (http://localhost:3000)
npm run dev

# 5. Arrancar el frontend, en otra terminal (http://localhost:5173)
cd ../FRONT
npm run dev
```

Credenciales del seed: **admin / admin123** (rol `admin`). Acceso en `http://localhost:5173/signin`.

## Roles y permisos

| Rol      | Lectura | Escritura                                                              | Gestión de usuarios |
| -------- | ------- | ---------------------------------------------------------------------- | ------------------- |
| `admin`  | Sí      | Sí (perspectivas, proyectos, actividades, progreso, snapshots, avances) | Sí                  |
| `lector` | Sí      | No (403)                                                                | No                  |

- En el frontend, `/ingreso-datos` y `/admin/**` requieren rol `admin`. El sidebar oculta esas secciones para los lectores.
- Los usuarios se gestionan desde la UI de administración (`/admin/usuarios`) o la API `/api/users` (solo admin). El seed crea únicamente el usuario `admin`.
- La estructura del BSC (perspectivas, proyectos, actividades) se administra en `/admin/estructura` o vía `/api/perspectives/**` (escritura solo admin).

## API

Base URL local: `http://localhost:3000`. Salvo `/api/health` y `/api/auth/*` (públicos), todos los endpoints requieren `Authorization: Bearer <token>`. Las escrituras exigen rol `admin`.

| Recurso      | Rutas principales                                  | Notas                                                          |
| ------------ | -------------------------------------------------- | -------------------------------------------------------------- |
| Auth         | `POST /api/auth/login` · `POST /api/auth/refresh`  | Devuelve `token` + `refreshToken`; login limitado (20/15 min)  |
| Perspectivas | `/api/perspectives`                                | CRUD; proyectos/actividades anidados y `batch-progress`        |
| Snapshots    | `/api/snapshots` · `/api/snapshots/progress-trend` | Capturas históricas y serie de tendencia                       |
| Avances      | `/api/avances`                                     | Ítems con descripción; filtros `?snapshotId=` / `?current=true` |
| Usuarios     | `/api/users`                                       | Solo `admin`; protege al último admin y a la propia cuenta     |

## Puertos

| Puerto | Servicio                    |
| ------ | --------------------------- |
| 3000   | API (`bsc-api`)             |
| 5173   | Frontend (Vite dev server)  |
| 5432   | PostgreSQL (Docker)         |

## Variables de entorno

`bsc-api/.env.example` documenta las variables necesarias. En local, copiarlo a `bsc-api/.env` (que **no** se versiona — está en `.gitignore`):

| Variable                 | Por defecto                                                            | Descripción                              |
| ------------------------ | ---------------------------------------------------------------------- | ---------------------------------------- |
| `DATABASE_URL`           | `postgresql://bsc_user:bsc_password@localhost:5432/bsc_db?schema=public` | Conexión a PostgreSQL                    |
| `JWT_SECRET`             | placeholder                                                            | Firma de access tokens (cambiar en prod) |
| `JWT_EXPIRES_IN`         | `8h`                                                                   | Expiración del access token              |
| `JWT_REFRESH_SECRET`     | placeholder                                                            | Firma de refresh tokens (cambiar en prod)|
| `JWT_REFRESH_EXPIRES_IN` | `7d`                                                                   | Expiración del refresh token             |
| `PORT`                   | `3000`                                                                 | Puerto de la API                         |
| `NODE_ENV`               | `development`                                                          | Entorno                                  |
| `CORS_ORIGIN`            | `http://localhost:5173` (implícito)                                    | Origen permitido por CORS                |

## Estructura del repositorio

```
bsc-shared/    Tipos + schemas Zod + cálculo ponderado (compartido)
bsc-api/       REST API (Express + Prisma + PostgreSQL) + tests de integración
FRONT/         Dashboard SPA (React + Vite)
```

## Referencia técnica

Para detalle de arquitectura, convenciones y pitfalls (pensado para agentes de código): [`AGENTS.md`](AGENTS.md) en la raíz y [`FRONT/AGENTS.md`](FRONT/AGENTS.md).

## Tests

```bash
cd bsc-shared && npm test    # vitest: schemas + cálculo ponderado
cd bsc-api && npm test       # vitest + supertest (integración; requiere PostgreSQL y seed)
```

## Despliegue

- **API → Render**: `npm run start` aplica `prisma migrate deploy` y arranca `dist/server.js`.
- **Frontend → Vercel**: el script `vercel-build` compila `bsc-shared` antes del build del SPA.

## Pendientes de limpieza

Deuda técnica conocida que no afecta el funcionamiento actual:

- **`FRONT/` — código muerto**: `src/components/charts/bar/BarChartOne.tsx` y `src/components/charts/line/LineChartOne.tsx` (sin referencias; usan ApexCharts).
- **`FRONT/` — dependencias sin uso** (heredadas de la plantilla TailAdmin): `apexcharts`, `react-apexcharts`, `@fullcalendar/*`, `react-dnd`, `react-dnd-html5-backend`, `react-dropzone`, `@react-jvectormap/*`, `zod`. Al eliminarlas se deben quitar también los imports globales de CSS de `swiper` y `flatpickr` en `src/main.tsx` y los `overrides` de `@react-jvectormap` en `package.json`. El bundle (~1.3 MB) se reduce de forma notable.
- **`bsc-api/`**: `@types/express@^5` con `express@^4` (desajuste de tipos); `@types/*` y `typescript` viven en `dependencies` como workaround del deploy en Render (revisar si sigue aplicando).
