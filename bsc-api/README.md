# BSC API

Backend REST API para el Balanced Scorecard (BSC).

## Stack

- **Node.js + Express** — Servidor HTTP
- **Prisma** — ORM con PostgreSQL
- **Zod** — Validación (schemas desde `bsc-shared`)
- **JWT + bcrypt** — Autenticación
- **Docker** — PostgreSQL para desarrollo

## Configuración

### 1. Levantar PostgreSQL

```bash
docker compose up -d
```

Esto levanta PostgreSQL en `localhost:5432` con:
- Usuario: `bsc_user`
- Password: `bsc_password`
- Base de datos: `bsc_db`

### 2. Configurar variables de entorno

Copiar `.env` (ya incluido con valores por defecto para desarrollo).

### 3. Instalar dependencias

```bash
npm install
```

### 4. Ejecutar migraciones

```bash
npx prisma migrate dev --name init
```

### 5. Poblar la base de datos (seed)

```bash
npm run db:seed
```

Esto crea un usuario admin (`admin` / `admin123`) y carga los datos desde `src/data/bscData.json`.

### 6. Iniciar el servidor

```bash
npm run dev
```

El servidor arranca en `http://localhost:3000`.

## API Endpoints

### Autenticación

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/api/auth/login` | Login (username + password) → JWT |
| `POST` | `/api/auth/refresh` | Refrescar token |

### Perspectivas

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/perspectives` | Listar todas (con proyectos y actividades) |
| `GET` | `/api/perspectives/:pid` | Detalle de perspectiva |
| `POST` | `/api/perspectives` | Crear perspectiva |
| `PATCH` | `/api/perspectives/:pid` | Actualizar perspectiva |
| `DELETE` | `/api/perspectives/:pid` | Eliminar perspectiva |

### Proyectos (anidados bajo perspectivas)

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/perspectives/:pid/projects` | Listar proyectos de perspectiva |
| `POST` | `/api/perspectives/:pid/projects` | Crear proyecto |
| `PATCH` | `/api/perspectives/:pid/projects/:prid` | Actualizar proyecto |
| `DELETE` | `/api/perspectives/:pid/projects/:prid` | Eliminar proyecto |

### Actividades (anidadas bajo proyectos)

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/perspectives/:pid/projects/:prid/activities` | Listar actividades |
| `POST` | `/api/perspectives/:pid/projects/:prid/activities` | Crear actividad |
| `PATCH` | `/api/perspectives/:pid/projects/:prid/activities/:aid` | Actualizar actividad |
| `PATCH` | `/api/perspectives/:pid/projects/:prid/activities/:aid/progress` | Actualizar solo progreso |
| `DELETE` | `/api/perspectives/:pid/projects/:prid/activities/:aid` | Eliminar actividad |

Todos los endpoints (excepto `/api/auth/*`) requieren header `Authorization: Bearer <token>`.

## Scripts

```bash
npm run dev          # Servidor en modo desarrollo (hot reload)
npm run build        # Compilar TypeScript
npm run start        # Servidor en producción
npm run db:migrate   # Ejecutar migraciones
npm run db:seed      # Poblar base de datos
npm run db:studio    # Prisma Studio (GUI para la BD)
npm run db:reset     # Resetear base de datos
```