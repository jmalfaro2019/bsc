# BSC Shared

Tipos TypeScript y schemas Zod compartidos entre el frontend y el backend del BSC.

## Uso

```bash
npm install bsc-shared
```

```typescript
import { 
  Activity, 
  Project, 
  Perspective, 
  BSCData,
  createActivitySchema,
  progressUpdateSchema,
  loginSchema
} from "bsc-shared";
```

## Tipos exportados

- `Activity`, `Project`, `Perspective`, `BSCData` — Tipos inferidos desde Zod
- `createActivitySchema`, `createProjectSchema`, `createPerspectiveSchema` — Para crear entidades (sin `id`)
- `updateActivitySchema`, `updateProjectSchema`, `updatePerspectiveSchema` — Para actualizar (parcial)
- `progressUpdateSchema` — Para actualizar solo el campo `progress`
- `loginSchema` — Para validar credenciales de login

## Build

```bash
npm run build
```