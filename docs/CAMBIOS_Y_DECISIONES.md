# Cambios respecto al repositorio y decisiones (beta local IHC_AI_1.0V)

Base tomada: rama **`feature/incio-backend`** de https://github.com/VladAlz/Proyecto-IHC (la más avanzada:
frontend Atomic Design del Sprint 1 + backend NestJS). Esta carpeta **no es un repositorio git**; está pensada para
revisarse en equipo y luego llevarse a una rama `feature/...` con PR hacia `develop`.

## 1. Qué faltaba según la guía del docente

| Requisito (Proyecto integrador / guía IA) | Estado en el repo | Ahora |
|---|---|---|
| Módulo 1 · Evaluaciones: tareas, tiempo, éxito/fracaso, errores, satisfacción | Registro simple, éxito/fracaso | + resultado **con ayuda**, versión v1/v2, perfil, código de tarea, alta masiva |
| Wizard en dos fases (configuración y ejecución) que reemplaza las matrices de Excel | No existía | **Planes de prueba** con wizard de 4 pasos + ejecución con guion y cronómetro |
| Módulo 2 · Dashboard claro y **filtrable**, hallazgos frecuentes, severidad, tendencias | KPIs y hallazgos fijos | Filtros por versión/fechas/resultado, categorías UX, severidad, estado, tareas más difíciles |
| Módulo 3 · IA: resumen, clasificación por categorías UX, severidad, recomendaciones **por pantalla**, historias para el backlog | Gemini 1.5 (retirado) con fallback fijo; sin clasificación ni pantalla | Multi-proveedor gratuito, contrato JSON ampliado, normalizador, historial, edición, envío al backlog |
| Exportación Markdown y PDF (guía IA) | No existía | Copiar/descargar `.md` y vista imprimible → "Guardar como PDF" |
| Módulo 4 · Rediseño y evidencia antes/después **con métricas** | Slider estático | + métricas v1 vs v2, por tarea, **matriz de usability test** |
| Módulo 5 · SCRUM: backlog, sprint planning, tablero, daily, review, retro | No existía | Completo, con BV/SP/Cociente y TNP como en la *Matriz de planificación* |
| Hallazgo → historia → tarea → mejora → validación | No existía | Automático (estados enlazados) |
| Formularios con validación y prevención de errores | Parcial | Validación en línea en todos los formularios + DTOs `class-validator` en el backend |

## 2. Decisiones técnicas

1. **Mismo stack** (React 18 + Vite + TS, NestJS 10 + TypeORM) para no romper lo ya presentado en el Sprint 1.
2. **SQLite embebido (`sql.js`) por defecto** en vez de PostgreSQL obligatorio: el proyecto arranca con
   `npm run setup && npm run dev` en cualquier PC del laboratorio. PostgreSQL sigue soportado con `DB_TYPE=postgres`
   (el `docker-compose.yml` se mantiene).
3. **Se eliminó el "modo mock" silencioso del frontend** (`services/mockData.ts` + fallback en `api.ts`): si el backend
   fallaba, la app guardaba en `localStorage` y mostraba éxito aunque no se hubiera guardado nada, lo que viola la
   visibilidad del estado (Nielsen #1). Ahora el backend es la única fuente de verdad y la cabecera avisa si no
   responde.
4. **IA vía REST (`fetch`)** sin el SDK `@google/generative-ai`: un solo código sirve para Gemini, Groq y OpenRouter.
5. **Se retiró `backend-assets/`** (DTOs, entidad y mock-server de transición): quedó duplicado por `backend/`.
6. **Componentes del Sprint 1 reutilizados**: `Button`, `Input`, `Badge`, `Spinner`, `StarRating`, `FormField`,
   `KpiCard`, `RedesignEvidence` (con ajustes responsive). Reescritos: `TestForm`, `TabNavigation`, `MainLayout`.
7. Nuevas utilidades CSS en `src/styles/app.css` (tarjetas, tablas, formularios, kanban, modal, toasts) que reutilizan
   las variables de `global.css` para mantener la consistencia visual.
8. Paleta de gráficos antes/después validada para daltonismo y contraste (ocre `#a16207` vs azul `#2563eb`); la
   severidad usa los colores de estado existentes siempre acompañados de texto.

## 3. Endpoints nuevos (Swagger en `/api/docs`)

- `GET/POST /api/tests` (+ filtros `appVersion`, `taskResult`, `planId`), `POST /api/tests/bulk`
- `GET/POST/PATCH/DELETE /api/plans`, `GET /api/plans/:id/results`
- `GET/POST/PATCH/DELETE /api/findings`
- `GET /api/dashboard/summary?appVersion&from&to`
- `GET /api/comparison`, `GET/POST/DELETE /api/comparison/matrix`
- `GET /api/ai/status`, `POST /api/ai/analyze`, `GET/PATCH/DELETE /api/ai/analyses/:id`, `POST /api/ai/apply`
- `/api/scrum/members|stories|sprints|tasks|daily` (CRUD), `GET /api/scrum/sprints/:id/summary`
- `POST /api/admin/reset` (solo local; desactivable con `ALLOW_RESET=false`)

> Cambio de contrato: `GET /api/dashboard/findings` pasó a `GET /api/findings`.

## 4. Pendiente / a decidir con el equipo

- **Datos reales**: reemplazar las sesiones "Demo" v2 por la evaluación final y registrar la matriz de usability test.
- **Fechas, Product Owner, BV/SP y horas** de los sprints sembrados son una propuesta: ajustarlos a lo que el equipo
  realmente planificó (la matriz Excel del docente se puede regenerar con *Exportar matriz CSV*).
- La **retrospectiva del Sprint 1** quedó vacía a propósito: debe escribirla el equipo.
- Probar con una **API key real de Gemini** (las pruebas automáticas usan respuestas simuladas).
- Prototipos Lo-Fi/Mid-Fi/Hi-Fi en Figma actualizados para los módulos nuevos (Planes, SCRUM, Antes/Después).
- Auditoría Lighthouse/WAVE de la nueva versión para el informe final.

## 5. Versión 1.1 — Reconstrucción y rediseño visual (27/11/2026)

La carpeta local se perdió y se **reconstruyó íntegramente** a partir del registro de la sesión de desarrollo sobre la
rama `feature/incio-backend`. Lo único no recuperable es `backend/.env` (las API keys): se regeneró desde
`.env.example` con las keys vacías.

Rediseño visual (mismo contenido y funciones, más jerarquía y menos texto pequeño):

| Antes | Ahora |
|---|---|
| Cabecera blanca con texto de 12 px | Cabecera con degradado índigo, texto blanco de 14–20 px y estado con punto de color + texto |
| Pestañas planas iguales | Pestañas tipo píldora con **color por módulo** (el mismo color en el encabezado de cada página) |
| Título + párrafo largo | Encabezado "hero" con icono del módulo y **una sola línea** de descripción |
| KPIs con cifras de 32 px y texto de 12 px | Acento de color por pilar ISO, cifras de 38 px, texto de apoyo mínimo |
| Tablas y ayudas de 12–13 px | Mínimo 13–14 px; encabezados de tabla con contraste y filas alternas |
| Kanban gris | Columnas con color por estado (pendiente, en progreso, en revisión, terminado) |
| Primario azul `#2563eb` | Primario índigo `#4f46e5` (contraste 6.3:1) |

Todos los colores de acento tienen contraste ≥ 4.5:1 con texto blanco (WCAG 2.1 AA). Los estilos nuevos están en
`src/styles/theme.css` y `src/styles/theme.ts`; para volver al estilo anterior basta con quitar el import de
`theme.css` en `src/main.tsx` y revertir los tokens.
