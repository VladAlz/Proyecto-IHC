# Usability Test Dashboard 2.0 — Asistente IA para Pruebas de Usabilidad
> **Asignatura:** Interacción Humano-Computador (IHC)  
> **Equipo (Grupo 4):**
> - **Vladimir González** — Líder de Proyecto / QA / Scrum Master (EDT 1.1)
> - **Santiago Mora** — Diseñador UX/UI / Tester de Usabilidad (EDT 1.2)
> - **Pedro Acaro** — Desarrollador Backend / IA (EDT 1.3)
> - **Boris Vinces** — Desarrollador Frontend (EDT 1.4)

---

## 🎯 Descripción del Proyecto

**Usability Test Dashboard 2.0** es una plataforma integral orientada al registro, visualización y análisis asistido por Inteligencia Artificial de pruebas de usabilidad de software. El sistema operacionaliza los tres pilares de Calidad de Uso definidos en la norma **ISO 9241-11** (Efectividad, Eficiencia y Satisfacción) y cierra el ciclo de Diseño Centrado en el Usuario (**ISO 9241-210**) transformando observaciones cualitativas en historias de usuario ágiles con recomendaciones ergonómicas fundamentadas en IHC.

---

## 🏛️ Arquitectura Frontend: Atomic Design

El proyecto ha sido estructurado siguiendo la metodología **Atomic Design** (Brad Frost) para maximizar la escalabilidad, reutilización y consistencia perceptual (Leyes Gestalt):

```
src/
├── components/
│   ├── atoms/                     # Elementos indivisibles con affordance y WCAG
│   │   ├── Button/                # Botones (Fitts >= 44x44px, variantes y estados)
│   │   ├── Input/                 # Inputs accesibles (htmlFor, aria-invalid, inline error)
│   │   ├── Badge/                 # Badges semánticos y de severidad Nielsen (1-4)
│   │   ├── Spinner/               # Indicador accesible de carga (Nielsen #1)
│   │   └── StarRating/            # Escala visual 1-5 de satisfacción (Norman: Affordance)
│   ├── molecules/                 # Agrupaciones con significado funcional
│   │   ├── FormField/             # Contenedor Label + Input + Error (Gestalt Proximidad)
│   │   ├── KpiCard/               # Tarjeta KPI con icono, valor, estándar ISO y tendencia (↑↓)
│   │   ├── TabNavigation/         # Pestañas WAI-ARIA con contraste Figura-Fondo
│   │   └── FindingRow/            # Fila de hallazgo heurístico con severidad y acción IA
│   ├── organisms/                 # Módulos complejos de página
│   │   ├── TestForm/              # Formulario en 4 bloques semánticos (ISO 9241-11)
│   │   ├── DashboardGrid/         # Grilla de 4 KPIs + Matriz de hallazgos + Tabla de pruebas
│   │   ├── AiAnalysisPanel/       # Carga automática, visibilidad de estado y salida en tarjetas
│   │   └── RedesignEvidence/      # Slider interactivo antes/después con matriz de justificación
│   └── templates/
│       └── MainLayout/            # Header + Detector de backend + Tabs + Contenedor responsive
├── pages/                         # Vistas completas de las 4 rutas
│   ├── Dashboard.tsx              # /dashboard (Ruta por defecto)
│   ├── RegisterTest.tsx           # /register
│   ├── AiAssistant.tsx            # /ai-assistant
│   └── RedesignEvidence.tsx       # /redesign-evidence
├── hooks/                         # Gestión de estado del servidor con TanStack React Query
│   ├── useTests.ts                # Operaciones CRUD sobre pruebas
│   ├── useDashboard.ts            # KPIs agregados y hallazgos heurísticos
│   └── useAiAnalysis.ts           # Ejecución de análisis cualitativo con IA
├── services/
│   ├── api.ts                     # Instancia Axios con fallback transparente y detección automática
│   └── mockData.ts                # 10 pruebas de usabilidad semilla (Seed Data) y lógica de cálculo
├── styles/
│   ├── tokens.ts                  # Design Tokens (tipografía, escala de grises, múltiplos de 8px)
│   └── global.css                 # Reset, variables CSS y estilos de foco WCAG 2.1
├── types/
│   └── index.ts                   # Contratos TypeScript compartidos con el Backend NestJS
├── App.tsx                        # Router y QueryClientProvider
└── main.tsx                       # Montaje de la aplicación
```

---

## 🔬 Fundamentación Teórica IHC Aplicada

| Concepto Teórico | Semana | Implementación Concreta en el Dashboard |
| :--- | :---: | :--- |
| **Ciclo de Acción de Norman** | Sem. 1 | Mapeo ordenado del formulario: intención evaluativa → entrada ergonómica → retroalimentación inmediata con confirmación visual. |
| **Calidad de Uso ISO 9241-11** | Sem. 2 | Modelado y captura explícita de **Eficiencia** (`timeOnTask`), **Efectividad** (`taskResult`, `errorsCount`) y **Satisfacción** (`satisfactionScore`). |
| **Ley de Fitts** | Sem. 2 | Todas las áreas de toque e interacción (botones, estrellas, pestañas) cuentan con un área mínima de **44×44px**. |
| **Diseño Inclusivo WCAG 2.1 AA** | Sem. 3 | Principio POUR: Contraste de texto ≥ 4.5:1, etiquetas persistentes asociadas mediante `id`/`htmlFor`, atributos WAI-ARIA y foco visible en todo momento. |
| **Manipulación Directa & Affordance** | Sem. 4 | Reemplazo del confuso input numérico por el componente `StarRating` (1-5 estrellas interactivas) y slider de rediseño manipulable directamente. |
| **Leyes Gestalt** | Sem. 6 | **Proximidad:** Bloques funcionales delimitados.<br>**Semejanza:** Estructura idéntica en las 4 KPI cards.<br>**Figura-Fondo:** Pestaña activa claramente contrastada.<br>**Continuidad:** Flujo de lectura KPIs → Hallazgos → Detalle de sesiones. |
| **Memoria Humana & Carga Cognitiva** | Sem. 6 | **Ley de Miller:** Limitación a 3-7 elementos principales por vista.<br>**Reconocimiento sobre Recuerdo (Nielsen #6):** Indicadores de tendencia temporal (↑↓) visibles en los KPIs. |
| **Visibilidad del Estado del Sistema** | Sem. 6 | **Nielsen #1:** Indicadores de procesamiento (Spinner accesible), estados vacíos descriptivos y feedback inmediato tras guardar o analizar. |

---

## 🚀 Cómo Ejecutar el Proyecto

### Prerrequisitos
- Node.js versión 18+ (probado en Node v23.2.0)
- npm 9+

### 1. Clonar el repositorio y posicionarse en la rama front:
```bash
git checkout front
```

### 2. Instalar dependencias:
```bash
npm install
```

### 3. Iniciar el entorno de desarrollo:
```bash
npm run dev
```
La aplicación estará disponible inmediatamente en:  
👉 **[http://localhost:5173](http://localhost:5173)**

---

## 🔗 Conectividad y Facilidades para el Backend NestJS (Pedro Acaro)

El frontend está diseñado con una arquitectura **desacoplada con detección de conectividad en tiempo real**:
1. **Detección Automática:**
   - Si el backend de NestJS está corriendo en `http://localhost:3000`, el frontend se conecta automáticamente y el indicador en el header mostrará: `🟢 NestJS Backend Conectado (:3000)`.
   - Si el backend aún no se ha levantado, el frontend conmuta de forma transparente al **Modo Mock Local Activo**, permitiendo navegar, registrar pruebas, interactuar con el Asistente IA y evaluar el rediseño con persistencia en `localStorage`.

2. **Recursos de Backend Listos (`backend-assets/`):**
   - [`usability-test.entity.ts`](file:///c:/Users/ASUS%20ROG%20G14/Documents/GitHub/Proyecto-IHC/backend-assets/usability-test.entity.ts): Entidad TypeORM lista para PostgreSQL/SQLite.
   - [`create-test.dto.ts`](file:///c:/Users/ASUS%20ROG%20G14/Documents/GitHub/Proyecto-IHC/backend-assets/dto/create-test.dto.ts): DTO con decoradores `class-validator` y Swagger.
   - [`update-test.dto.ts`](file:///c:/Users/ASUS%20ROG%20G14/Documents/GitHub/Proyecto-IHC/backend-assets/dto/update-test.dto.ts): DTO para operaciones PATCH.
   - [`seed-data.json`](file:///c:/Users/ASUS%20ROG%20G14/Documents/GitHub/Proyecto-IHC/backend-assets/seed-data.json): 10 registros de pruebas reales listos para importar.
   - [`usability-analysis.prompt.ts`](file:///c:/Users/ASUS%20ROG%20G14/Documents/GitHub/Proyecto-IHC/backend-assets/usability-analysis.prompt.ts): Prompt base estructurado para el módulo LLM del Sprint 2.
   - [`README-BACKEND.md`](file:///c:/Users/ASUS%20ROG%20G14/Documents/GitHub/Proyecto-IHC/backend-assets/README-BACKEND.md): Guía de integración de endpoints paso a paso.

3. **Simulador de Backend Standalone (Opcional):**
   Para verificar las llamadas HTTP reales en el puerto 3000 sin compilar NestJS:
   ```bash
   npm run mock-backend
   ```
