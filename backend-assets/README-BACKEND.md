# 🚀 Guía de Integración Backend (NestJS) — Usability Dashboard 2.0
**Rol:** Pedro Acaro (EDT 1.3 - Arquitectura Backend NestJS)  
**Proyecto:** Usability Test Dashboard 2.0 — Asistente IA para Pruebas de Usabilidad  
**Equipo:** Grupo 4 IHC (Vladimir González, Santiago Mora, Pedro Acaro, Boris Vinces)

---

## 📌 Estado de la Conexión Frontend ⇄ Backend

El Frontend desarrollado en React + TypeScript está **100% listo y desacoplado**.
- En el header del frontend hay un detector de conectividad en tiempo real:
  - 🟢 **NestJS Backend Conectado (:3000)** cuando levantes tu servidor en el puerto 3000.
  - 🟡 **Modo Mock Local Activo** mientras el backend se encuentra apagado (lo que permite probar el front sin bloquearse).
- Las llamadas a la API se realizan vía Axios a través del proxy de Vite configurado en `/api` o directamente a la variable de entorno `VITE_API_URL=http://localhost:3000/api`.

---

## 📂 Recursos Listos para Copiar y Pegar en tu Proyecto NestJS

En esta carpeta `backend-assets/` tienes los archivos exactos para tu arquitectura modular:

| Archivo en `backend-assets/` | Destino recomendado en NestJS | Descripción |
| :--- | :--- | :--- |
| `usability-test.entity.ts` | `src/common/entities/usability-test.entity.ts` | Entidad TypeORM alineada a la norma ISO 9241-11 (`timeOnTask`, `taskResult`, `satisfactionScore`, `observations`, etc.). |
| `dto/create-test.dto.ts` | `src/tests/dto/create-test.dto.ts` | DTO con validaciones de `class-validator` y documentación Swagger OpenAPI. |
| `dto/update-test.dto.ts` | `src/tests/dto/update-test.dto.ts` | DTO parcial para endpoints PATCH. |
| `usability-analysis.prompt.ts` | `src/ai/prompts/usability-analysis.prompt.ts` | Prompt base estructurado para el análisis con LLM en Sprint 2. |
| `seed-data.json` | `src/database/seed-data.json` | 10 pruebas de usabilidad y 5 hallazgos de muestra para inicializar la base de datos desde el día 1. |
| `mock-server.js` | Raíz o carpeta de pruebas | Servidor HTTP nativo en puerto 3000 para probar antes de compilar NestJS. |

---

## 🔌 Especificación de Endpoints Requeridos (Contrato de API)

### 1. Pruebas de Usabilidad (`TestsController`)
- **`GET /api/tests`**: Retorna el listado completo de pruebas registradas (`UsabilityTest[]`).
- **`POST /api/tests`**: Recibe un `CreateTestDto` en el body, guarda en base de datos y retorna el registro creado con su `id` y `createdAt`.
- **`GET /api/tests/:id`**: Retorna la prueba con el `id` especificado.
- **`PATCH /api/tests/:id`**: Actualiza parcialmente una prueba.
- **`DELETE /api/tests/:id`**: Elimina una prueba.

### 2. Dashboard (`DashboardController`)
- **`GET /api/dashboard/summary`**:
  Retorna el objeto `DashboardSummary`:
  ```json
  {
    "totalTests": 10,
    "successRate": 80.0,
    "avgTime": 56.4,
    "avgSatisfaction": 4.1,
    "trends": {
      "totalTestsDiff": 2,
      "successRateDiff": 5.5,
      "avgTimeDiff": -12.3,
      "avgSatisfactionDiff": 0.4
    }
  }
  ```
- **`GET /api/dashboard/findings`**:
  Retorna los hallazgos heurísticos priorizados (`UsabilityFinding[]`).

### 3. Asistente IA (`AiController`)
- **`POST /api/ai/analyze`**:
  Recibe `{ "testId"?: string, "observations"?: string }`.
  Retorna el objeto estructurado `AiAnalysisResult`:
  ```json
  {
    "hallazgos_clave": ["..."],
    "historias_usuario": [
      {
        "titulo": "...",
        "criterio_aceptacion": "...",
        "prioridad": "alta" | "media" | "baja"
      }
    ],
    "recomendaciones_diseno": ["..."]
  }
  ```

---

## ⚡ Cómo probar la conexión de inmediato

1. **Simulador Mock NestJS (Opcional):**
   ```bash
   npm run mock-backend
   ```
   Levanta un servidor HTTP en el puerto 3000 que responde a todos los endpoints anteriores. El frontend detectará automáticamente el estado verde.

2. **Levantar el Frontend React:**
   ```bash
   npm run dev
   ```
   Abre [http://localhost:5173](http://localhost:5173).
