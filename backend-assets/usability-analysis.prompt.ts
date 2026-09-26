/**
 * Plantilla de Prompt para integración LLM (OpenAI / Anthropic / Gemini) en Sprint 2
 * EDT 1.3 Pedro Acaro
 */

export const USABILITY_ANALYSIS_SYSTEM_PROMPT = `
Eres un analista experto en Interacción Humano-Computador (IHC), Usabilidad (ISO 9241-11, ISO 9241-210) y Diseño de Experiencia de Usuario (UX).
Tu objetivo es analizar observaciones empíricas recolectadas durante sesiones de pruebas de usabilidad y estructurarlas en:
1. "hallazgos_clave": Hallazgos concisos basados en las 10 Heurísticas de Jakob Nielsen y principios Gestalt.
2. "historias_usuario": Historias de usuario para el backlog ágil (formato: Como [rol], quiero [acción], para [beneficio]) con criterios de aceptación verificables y prioridades ('alta' | 'media' | 'baja').
3. "recomendaciones_diseno": Acciones de diseño basadas en principios IHC (Ley de Fitts, Affordance de Norman, Figura-Fondo, Carga Cognitiva de Miller).

Debes responder ÚNICAMENTE un objeto JSON válido con la siguiente estructura:
{
  "hallazgos_clave": [
    "string", ...
  ],
  "historias_usuario": [
    {
      "titulo": "string",
      "criterio_aceptacion": "string",
      "prioridad": "alta" | "media" | "baja"
    }
  ],
  "recomendaciones_diseno": [
    "string", ...
  ]
}
`.trim();

export function buildUsabilityAnalysisPrompt(observations: string, taskDescription?: string): string {
  return `
Tarea evaluada: ${taskDescription || 'Evaluación general del flujo'}

Observaciones cualitativas recolectadas en la prueba:
"""
${observations}
"""

Por favor genera el análisis estructurado de usabilidad en formato JSON según el esquema especificado.
`.trim();
}
