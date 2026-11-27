# IA gratuita para el Asistente de Usabilidad

## Recomendación

| Rol | Proveedor | Modelo por defecto | Por qué |
|---|---|---|---|
| **Principal** | **Google Gemini (AI Studio)** | `gemini-2.5-flash` | Capa gratuita permanente sin tarjeta, responde JSON nativo (`responseMimeType: application/json`), ventana de contexto enorme (cabe un plan completo con todas sus sesiones) y buen español. El backend del Sprint 1 ya estaba pensado para Gemini. |
| **Respaldo** | **Groq Cloud** | `openai/gpt-oss-120b` | Gratis, la latencia más baja del mercado y API compatible con OpenAI (`response_format: json_object`). Se usa automáticamente si Gemini devuelve 429 (cuota), 5xx o JSON inválido. |
| Respaldo 2 | OpenRouter | `google/gemma-4-31b-it:free` | Agregador con modelos `:free`; útil si las dos anteriores fallan. Más latencia y caídas en horas pico. |
| Siempre disponible | Motor heurístico local | `motor-heuristico-ihc` | Sin red ni key. Clasifica observaciones por palabras clave y métricas; es determinista. Garantiza que la demo nunca falle. |

**Descartados para este proyecto:** Cohere Trial (prohíbe uso con usuarios reales), Together/Cerebras (créditos que
se agotan y suelen pedir tarjeta).

## Límites a tener en cuenta (verificar siempre en la consola del proveedor)

Las cuotas gratuitas cambian con frecuencia y las cifras publicadas en blogs no coinciden entre sí. Referencias
oficiales:

- Gemini: https://ai.google.dev/gemini-api/docs/rate-limits y la vista en vivo https://aistudio.google.com/rate-limit
  (desde abril de 2026 los modelos *Pro* ya no están en la capa gratuita; *Flash* y *Flash-Lite* sí).
- Groq: https://console.groq.com/settings/limits (los límites son por organización, no por key).

Para una clase o una demo (decenas de análisis al día) cualquiera de las dos sobra. Cada análisis consume **una sola
petición**.

> ⚠️ En la capa gratuita de Gemini, Google puede usar los datos para mejorar sus modelos. No envíes datos
> personales de participantes: usa códigos (P1, P2…) en el campo "Participante".

## Configuración (`backend/.env`)

```env
AI_PROVIDER=gemini                    # gemini | groq | openrouter | local
AI_FALLBACK_PROVIDERS=groq,openrouter # orden de respaldo
AI_TIMEOUT_MS=30000

GEMINI_API_KEY=tu_key
GEMINI_MODEL=gemini-2.5-flash         # si Google lo retira, cambia aquí (p. ej. gemini-2.5-flash-lite)

GROQ_API_KEY=tu_key
GROQ_MODEL=openai/gpt-oss-120b
```

- Las keys **nunca** van al frontend ni al repositorio (`.env` está en `.gitignore`).
- Al iniciar, la consola del backend muestra la cadena activa, p. ej.
  `🤖 IA: gemini → groq (sin key) → openrouter (sin key) → local · activo: gemini`.
- En la app, la cabecera muestra el proveedor activo y cada análisis guarda qué proveedor/modelo lo generó.

## Cómo se garantiza una salida útil y explicable

1. **Prompt restrictivo** (`backend/src/ai/prompts/usability-analysis.prompt.ts`): rol de analista IHC, listas
   cerradas de categorías UX y heurísticas de Nielsen, escala de severidad 1-4, formato de historia
   "Como…, quiero…, para…" y la orden de no inventar datos.
2. **Evidencia cuantitativa + cualitativa**: el prompt incluye resultado, tiempo, errores, satisfacción y
   observación de cada sesión, además del resumen agregado.
3. **Normalizador** (`ai-normalizer.ts`): valida y corrige la respuesta (JSON envuelto en ```json, severidades fuera
   de rango, prioridades en otro idioma, categorías aproximadas, campos faltantes). Si no hay contenido útil, pasa al
   siguiente proveedor.
4. **Co-creación**: todo el resultado es editable antes de registrarlo o exportarlo; el reporte indica si fue editado.
