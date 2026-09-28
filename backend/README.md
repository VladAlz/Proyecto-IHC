# Usability Test Dashboard 2.0 — Backend NestJS

> **Asignatura:** Interacción Humano-Computador (IHC)  
> **Equipo:** Grupo 4 IHC  
> **Responsable Backend:** Pedro Acaro (EDT 1.3)

---

## Descripción

Backend REST API desarrollado con NestJS, TypeORM y PostgreSQL para la plataforma de gestión y análisis de pruebas de usabilidad (ISO 9241-11). Incluye integración con Google Gemini para análisis cualitativo asistido por IA.

---

## Requisitos Previos

- Node.js 18+
- npm 9+
- PostgreSQL 14+ (o Docker para levantar el contenedor)

---

## Instalación

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales
```

---

## Configuración de Variables de Entorno

Crea un archivo `.env` en la carpeta `backend/` con las siguientes variables:

```env
# Server
PORT=3000

# PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=tu_password
DB_DATABASE=usability_db

# Google Gemini API Key
# Obtén tu key en: https://aistudio.google.com/app/apikey
GEMINI_API_KEY=

# CORS (orígenes separados por coma)
CORS_ORIGIN=http://localhost:5173
```

---

## Comandos Disponibles

### Desarrollo

```bash
# Levantar el backend en modo desarrollo (hot-reload)
npm run start:dev

# Levantar PostgreSQL con Docker
npm run db:up          # desde la raíz del proyecto

# Ejecutar seed manual de datos
npm run db:seed
```

### Producción

```bash
# Compilar
npm run build

# Ejecutar en producción
npm run start:prod
```

### Migraciones

```bash
# Generar migración (detecta cambios en entidades)
npm run migration:generate -- src/database/migrations/NombreMigracion

# Ejecutar migraciones pendientes
npm run migration:run

# Revertir última migración
npm run migration:revert

# Ver migraciones ejecutadas
npm run migration:show
```

### Tests

```bash
# Ejecutar todos los tests
npm test

# Modo watch
npm run test:watch

# Con cobertura
npm run test:cov
```

---

## Estructura del Proyecto

```
backend/
├── src/
│   ├── ai/                      # Módulo de Inteligencia Artificial
│   │   ├── dto/                 # DTOs de validación
│   │   ├── prompts/             # Prompts para Gemini
│   │   ├── ai.controller.ts
│   │   ├── ai.module.ts
│   │   └── ai.service.ts
│   ├── common/
│   │   └── filters/             # Filtros globales de excepciones
│   ├── dashboard/               # Métricas y hallazgos
│   │   ├── entities/
│   │   ├── dashboard.controller.ts
│   │   ├── dashboard.module.ts
│   │   └── dashboard.service.ts
│   ├── database/                # Configuración y seed
│   │   ├── migrations/          # Migraciones TypeORM
│   │   ├── seed-cli.ts          # Script de seed manual
│   │   ├── seed-data.json       # Datos semilla
│   │   └── database.module.ts
│   ├── health/                  # Endpoint de health check
│   ├── tests/                   # CRUD de pruebas de usabilidad
│   │   ├── dto/                 # DTOs con validaciones
│   │   ├── entities/
│   │   ├── interfaces/
│   │   ├── tests.controller.ts
│   │   ├── tests.module.ts
│   │   └── tests.service.ts
│   ├── app.module.ts            # Módulo raíz
│   └── main.ts                  # Punto de entrada
├── jest.config.js               # Configuración de tests
├── nest-cli.json
├── package.json
└── tsconfig.json
```

---

## API Endpoints

### Health Check

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/health` | Estado del backend |

### Pruebas de Usabilidad

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/tests` | Listar pruebas (con paginación: `?page=1&limit=10`) |
| GET | `/api/tests/:id` | Obtener prueba por ID (UUID) |
| POST | `/api/tests` | Crear nueva prueba |
| PATCH | `/api/tests/:id` | Actualizar prueba parcialmente |
| DELETE | `/api/tests/:id` | Eliminar prueba |

### Dashboard

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/dashboard/summary` | Métricas agregadas con tendencias |
| GET | `/api/dashboard/findings` | Hallazgos heurísticos priorizados |

### Asistente IA

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/ai/analyze` | Análisis cualitativo con Gemini |

---

## Documentación Interactiva (Swagger)

Una vez levantado el backend, accede a:

**http://localhost:3000/api/docs**

---

## Módulo de IA — Google Gemini

### Configuración

1. Obtén una API key en [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Agrega la key en tu archivo `.env`:
   ```env
   GEMINI_API_KEY=tu_api_key_aqui
   ```

### Fallback Heurístico

Si no se configura la API key o la llamada falla, el sistema automáticamente usa un motor de análisis heurístico local basado en las 10 heurísticas de Nielsen, principos de IHC y WCAG 2.1.

---

## Frontend

El frontend React se encuentra en la carpeta raíz del proyecto. Para levantarlo:

```bash
# Desde la raíz del proyecto
npm run dev
```

El frontend detecta automáticamente si el backend está disponible en `http://localhost:3000`. Si no, opera en modo mock local con persistencia en localStorage.

---

## Licencia

MIT License — Ver [LICENSE](../LICENSE) para más detalles.
