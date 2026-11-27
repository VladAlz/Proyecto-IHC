# Backend NestJS — Usability Test Dashboard (IHC AI 1.0)

API REST con NestJS 10 + TypeORM. Base de datos SQLite embebida por defecto (`data/usability.sqlite`) o PostgreSQL.

```bash
npm install
```

```bash
npm run start:dev
```

- API: http://localhost:3000/api · Swagger: http://localhost:3000/api/docs
- Configuración: copia `.env.example` a `.env` (todas las variables están documentadas ahí).
- IA: ver [`../docs/IA_GRATUITA.md`](../docs/IA_GRATUITA.md).

| Script | Acción |
|---|---|
| `npm run start:dev` | Desarrollo con recarga |
| `npm run build` / `npm run start:prod` | Compilar y ejecutar |
| `npm test` | Pruebas Jest (45) |
| `npm run db:reset` | Borra la base SQLite local (se re-siembra al iniciar) |

Módulos: `tests`, `plans`, `findings`, `dashboard`, `comparison`, `scrum`, `ai`, `database`, `health`.
Con `DB_TYPE=postgres` se usa el contenedor de `../docker-compose.yml` (`npm run db:up` desde la raíz).
