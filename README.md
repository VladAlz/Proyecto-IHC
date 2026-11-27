# Usability Test Dashboard — Asistente IA para Pruebas de Usabilidad (IHC AI 1.0)

> **Asignatura:** Interacción Humano-Computador (IHC) · UTA · Docente: Ing. José Caiza, Mg.
> **Grupo 4:** Vladimir González (Líder · Scrum Master · QA) · Santiago Mora (UX/UI · Tester) · Pedro Acaro (Backend · IA) · Boris Vinces (Frontend)

> **v1.1:** rediseño visual con color por módulo y mayor contraste (ver `docs/CAMBIOS_Y_DECISIONES.md`, sección 5).

> ## 👥 ¿Eres del grupo y quieres ejecutarlo? → lee **[GUIA_EQUIPO.md](GUIA_EQUIPO.md)**
> Resumen: `git clone -b feature/ihc-ai-1.1 https://github.com/VladAlz/Proyecto-IHC.git` → `npm run setup` →
> copia `backend/.env.example` a **`backend/.env`** y pega ahí tu API key de Gemini → `npm run dev` → http://localhost:5173

Plataforma web para **planificar, ejecutar, registrar y analizar pruebas de usabilidad**, con un **Asistente IA**
que convierte observaciones en hallazgos, recomendaciones e historias de usuario, y un **módulo SCRUM** para
organizar el rediseño por sprints. Implementa los 5 módulos del documento *Proyecto integrador — Usability Test
Dashboard 2.0* y el enfoque de la guía *Asistente IA para Pruebas de Usabilidad*.

---

## 🚀 Puesta en marcha (3 comandos)

Requisitos: **Node.js 18+** (probado con Node 22) y npm 9+. **No necesitas Docker ni PostgreSQL**: el backend usa
SQLite embebido en un archivo (`backend/data/usability.sqlite`).

```bash
npm run setup
```

```bash
npm run dev
```

- Frontend: http://localhost:5173
- API REST: http://localhost:3000/api · Swagger: http://localhost:3000/api/docs

La primera vez se siembran los datos del Sprint 1 (10 sesiones v1, 7 hallazgos, backlog HU-01…HU-12, 4 sprints,
equipo y un plan de prueba). El botón **Restaurar datos** de la cabecera vuelve a ese estado.

### Activar la IA (gratis, opcional)

Sin API key el asistente funciona con un **motor heurístico local**. Para usar un LLM real:

1. Crea una key gratuita en **Google AI Studio**: https://aistudio.google.com/app/apikey (sin tarjeta).
2. Copia `backend/.env.example` a `backend/.env` y pega la key en `GEMINI_API_KEY=`.
3. (Opcional, respaldo) crea una key gratuita en **Groq**: https://console.groq.com/keys → `GROQ_API_KEY=`.
4. Reinicia `npm run dev`. La cabecera mostrará **IA: Gemini**.

Detalles y justificación de la elección: [`docs/IA_GRATUITA.md`](docs/IA_GRATUITA.md).

---

## 🧭 Módulos (orden = flujo metodológico del proyecto)

| Pestaña | Módulo del proyecto integrador | Qué permite | HU |
|---|---|---|---|
| **Dashboard** | 2. Dashboard de resultados | KPIs ISO 9241-11 con tendencia, filtros por versión y fechas, tareas con más dificultad, problemas por categoría/severidad, tabla de sesiones | HU-02 |
| **Planes de prueba** | 1. Evaluaciones de usabilidad | Wizard en **2 fases**: *configuración* (contexto, tareas T1…Tn, roles, checklist) y *ejecución* (guion de moderación, cronómetro, éxito/con ayuda/fracaso, errores, satisfacción, comentarios). Resultados por tarea | HU-01, HU-11 |
| **Registrar prueba** | 1. Evaluaciones de usabilidad | Registro rápido de una sesión con validación en línea | HU-01, HU-09 |
| **Hallazgos** | 2/3. Hallazgos y mejoras | Matriz editable (severidad Nielsen, categoría UX, heurística, evidencia, frecuencia, recomendación, estado) → **convertir en historia** | HU-02 |
| **Asistente IA** | 3. IA para análisis UX | Entradas: sesiones, plan completo y/o texto libre. Salidas: **resumen, hallazgos clasificados por categoría y severidad, recomendaciones por pantalla e historias de usuario** editables. Envío al backlog, historial, exportación **Markdown** y **PDF** | HU-04, HU-05, HU-12 |
| **SCRUM** | 5. Planificación ágil | **Product Backlog** (Business Value, Story Points, Cociente de decisión), **Sprint Planning** (capacidad, horas estimadas vs reales, TNP, export CSV en formato de la matriz), **Tablero Kanban**, **Daily**, **Review y Retro**, **Equipo** | HU-06, HU-07, HU-08 |
| **Antes / Después** | 4. Rediseño y evidencia | Métricas v1 vs v2, desempeño por tarea, **matriz de usability test** (claridad, aprendizaje, eficiencia, eficacia, prevención de errores, satisfacción) y slider de evidencia visual | HU-03 |

**Trazabilidad UX → SCRUM** (requisito del documento): un hallazgo se convierte en historia (estado *En backlog*),
la historia se planifica con tareas en un sprint y, cuando todas sus tareas están *Terminado*, la historia pasa a
*Hecha* y el hallazgo a *Resuelto* automáticamente. Luego se valida con una nueva sesión v2 en *Antes / Después*.

---

## 🏛️ Arquitectura

```
IHC_AI_1.0V/
├── src/                         # Frontend React 18 + Vite + TypeScript (Atomic Design)
│   ├── components/
│   │   ├── atoms/               # Button, Input, Badge, Spinner, StarRating (Sprint 1)
│   │   ├── molecules/           # FormField, KpiCard, TabNavigation, Modal, Toast, ResultSelector, BarList, PageState
│   │   ├── organisms/           # TestForm, PlanWizard, PlanExecution, AiResultEditor, RedesignEvidence, Scrum/*
│   │   └── templates/           # MainLayout (estado del backend y del proveedor IA)
│   ├── pages/                   # Dashboard, Plans, RegisterTest, Findings, AiAssistant, Scrum, Comparison
│   ├── hooks/useApi.ts          # TanStack React Query + mutaciones con feedback (toasts)
│   ├── services/api.ts          # Cliente Axios tipado (sin datos simulados)
│   ├── utils/report.ts          # Exportación JSON → Markdown / CSV
│   └── types/index.ts           # Contrato compartido con el backend
├── backend/                     # API NestJS 10 + TypeORM
│   └── src/
│       ├── tests/               # Sesiones de prueba (CRUD, filtros, alta masiva)
│       ├── plans/               # Planes de prueba + resultados por tarea
│       ├── findings/            # Matriz de hallazgos
│       ├── dashboard/           # KPIs, tendencias, distribución de hallazgos, tareas
│       ├── comparison/          # v1 vs v2 + matriz de usability test
│       ├── scrum/               # Equipo, historias, sprints, tareas, daily (+ trazabilidad)
│       ├── ai/                  # Proveedores LLM, prompt, normalizador JSON, motor local, historial
│       └── database/            # Config SQLite/PostgreSQL, semilla y reset
└── docs/                        # Decisiones, cambios y guía de IA gratuita
```

### Asistente IA (backend/src/ai)

```
Evidencia (sesiones + plan + texto) ──► prompt con métricas y observaciones
        │
        ▼
 Cadena de proveedores:  Gemini ──(falla/429)──► Groq ──► OpenRouter ──► Motor heurístico local
        │                                  (siempre responde: el módulo nunca queda inutilizable)
        ▼
 Normalizador ("firewall"): JSON estricto, severidad 1-4, categorías y heurísticas válidas,
 prioridades, story points Fibonacci, campos faltantes rellenados
        │
        ▼
 Historial editable (co-creación) ──► Hallazgos + Product Backlog ──► Markdown / PDF
```

---

## 🧪 Calidad

```bash
npm run backend:test
```

45 pruebas (Jest): servicio IA con `fetch` simulado (sin key, éxito, campos faltantes, JSON en bloque ```json,
HTTP 500, 429, payload vacío, JSON malformado, error de red, respaldo Groq, modo local forzado, apply con
trazabilidad), motor heurístico, normalizador y servicios de pruebas.

Accesibilidad y usabilidad aplicadas: foco visible, enlace "saltar al contenido", `aria-live` en toasts y estados,
diálogos con trampa de foco y cierre con Esc, Kanban operable con teclado (botones ‹ ›), atajos **Alt+1…7** entre
módulos, áreas táctiles ≥ 44 px (Fitts), errores junto al campo (Nielsen #9), confirmación antes de borrar,
color + icono + texto en estados (WCAG 1.4.1), diseño responsive sin scroll horizontal a 375 px.

---

## 🔧 Scripts

| Comando | Acción |
|---|---|
| `npm run setup` | Instala dependencias de frontend y backend |
| `npm run dev` | Levanta API (:3000) y frontend (:5173) juntos (antes verifica que los puertos estén libres) |
| `npm run stop` | Cierra procesos de este proyecto que quedaron ocupando los puertos 3000/5173 |
| `npm run build` | Compila el frontend |
| `npm run backend:test` | Pruebas del backend |
| `npm run db:reset` | Borra la base SQLite local (se re-siembra al iniciar) |
| `npm run db:up` | (Opcional) PostgreSQL con Docker; usar `DB_TYPE=postgres` en `backend/.env` |

---

## 📌 Datos de demostración

Las sesiones **v2 marcadas "Demo · P1/P2/P3"** existen solo para que la comparativa antes/después tenga datos.
Deben reemplazarse por las sesiones reales de la evaluación final (Sprint 3-4). Las fechas, estimaciones (BV/SP/horas)
y asignaciones de los sprints son una **propuesta inicial editable** desde la app.

Más detalle: [`docs/CAMBIOS_Y_DECISIONES.md`](docs/CAMBIOS_Y_DECISIONES.md).
