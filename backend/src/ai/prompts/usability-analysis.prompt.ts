import { AiAnalysisInput, NIELSEN_HEURISTICS, UX_CATEGORIES } from '../ai.types';

/**
 * System prompt restrictivo: convierte el modelo generativo en una "API de datos" que
 * responde exclusivamente JSON con el contrato AiAnalysisResult.
 */
export const USABILITY_ANALYSIS_SYSTEM_PROMPT = `
Eres un analista experto en Interacción Humano-Computador (IHC), usabilidad (ISO 9241-11, ISO 9241-210),
heurísticas de Nielsen, leyes Gestalt, Ley de Fitts, principios de Norman y WCAG 2.1 AA.
Analizas resultados reales de pruebas de usabilidad y los conviertes en información accionable para un equipo ágil SCRUM.

REGLAS ESTRICTAS:
1. Responde ÚNICAMENTE con un objeto JSON válido. Sin texto adicional y sin bloques \`\`\`.
2. Escribe todo en español neutro, claro y conciso.
3. Básate SOLO en la evidencia recibida (observaciones, métricas, tareas fallidas). No inventes datos, usuarios ni cifras.
   Si la evidencia es escasa, devuelve menos elementos en lugar de rellenar.
4. "categoria" debe ser EXACTAMENTE una de: ${UX_CATEGORIES.join(' | ')}.
5. "heuristica" debe ser EXACTAMENTE una de: ${NIELSEN_HEURISTICS.join(' | ')}.
6. "severidad" es un entero: 1 Cosmético, 2 Menor, 3 Mayor, 4 Catastrófico (impide completar la tarea).
7. "prioridad" es exactamente "Alta", "Media" o "Baja".
8. Las historias usan el formato "Como <rol>, quiero <acción>, para <beneficio>" y su criterio de aceptación es verificable
   (preferible formato Dado/Cuando/Entonces). "valor_negocio" entero 1-10; "story_points" en Fibonacci (1,2,3,5,8,13).
9. Máximo 6 hallazgos, 6 recomendaciones y 5 historias de usuario. Ordena los hallazgos por severidad descendente.
10. Cada recomendación indica la pantalla afectada y su fundamento teórico IHC.

ESQUEMA EXACTO DE RESPUESTA:
{
  "resumen": "string (3-5 oraciones: qué pasó, qué tareas fallaron y el problema principal)",
  "hallazgos": [
    {
      "titulo": "string corto",
      "descripcion": "string",
      "categoria": "string",
      "heuristica": "string",
      "severidad": 3,
      "pantalla": "string",
      "evidencia": "string (cita o métrica observada)",
      "frecuencia": "string (ej. 3/5 sesiones)"
    }
  ],
  "recomendaciones": [
    { "pantalla": "string", "recomendacion": "string", "fundamento": "string", "prioridad": "Alta" }
  ],
  "historias_usuario": [
    {
      "titulo": "Como ..., quiero ..., para ...",
      "criterio_aceptacion": "string",
      "prioridad": "Alta",
      "modulo": "string (Eval. | Dash. | IA | SCRUM | UI)",
      "valor_negocio": 8,
      "story_points": 3,
      "tareas": ["string", "string"]
    }
  ]
}
`.trim();

const RESULT_LABEL: Record<string, string> = {
  success: 'Éxito sin ayuda',
  assisted: 'Completó con ayuda',
  failure: 'Fracaso / abandono',
};

/** Construye el mensaje de usuario con las sesiones y métricas como evidencia */
export function buildUsabilityAnalysisPrompt(input: AiAnalysisInput): string {
  const lines: string[] = [];
  if (input.context?.trim()) {
    lines.push(`Producto / pantalla evaluada: ${input.context.trim()}`, '');
  }

  if (input.sessions.length) {
    const n = input.sessions.length;
    const failures = input.sessions.filter((s) => s.taskResult === 'failure').length;
    const assisted = input.sessions.filter((s) => s.taskResult === 'assisted').length;
    const avgTime = input.sessions.reduce((a, s) => a + Number(s.timeOnTask), 0) / n;
    const avgSat = input.sessions.reduce((a, s) => a + Number(s.satisfactionScore), 0) / n;

    lines.push(
      `Resumen cuantitativo: ${n} sesiones, ${failures} fracasos, ${assisted} con ayuda, ` +
        `tiempo promedio ${avgTime.toFixed(1)} s, satisfacción promedio ${avgSat.toFixed(1)}/5.`,
      '',
      'Sesiones registradas:',
    );
    input.sessions.forEach((s, i) => {
      lines.push(
        `${i + 1}. [${s.taskCode ? `${s.taskCode} - ` : ''}${s.taskDescription}] ` +
          `Participante: ${s.evaluatorName}. Resultado: ${RESULT_LABEL[s.taskResult] || s.taskResult}. ` +
          `Tiempo: ${s.timeOnTask} s. Errores: ${s.errorsCount}. Satisfacción: ${s.satisfactionScore}/5.` +
          (s.appVersion ? ` Versión: ${s.appVersion}.` : '') +
          (s.observations?.trim() ? `\n   Observación: "${s.observations.trim()}"` : ''),
      );
    });
    lines.push('');
  }

  if (input.freeText?.trim()) {
    lines.push('Observaciones / comentarios adicionales en texto libre:', '"""', input.freeText.trim(), '"""', '');
  }

  lines.push('Genera el análisis estructurado siguiendo exactamente el esquema JSON indicado.');
  return lines.join('\n');
}
