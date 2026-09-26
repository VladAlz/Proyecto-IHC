import { UsabilityTest, DashboardSummary, UsabilityFinding, AiAnalysisResult } from '../types';

/**
 * 10 Registros de prueba de usabilidad iniciales (Seed Data - Sprint 1)
 * Alineados 1:1 con el modelo UsabilityTest de Pedro Acaro y la norma ISO 9241-11:
 * - timeOnTask: Eficiencia (en segundos)
 * - taskResult: Efectividad ('success' | 'failure')
 * - satisfactionScore: Satisfacción (1-5)
 * - errorsCount: Efectividad inversa
 */
export const INITIAL_TESTS: UsabilityTest[] = [
  {
    id: 'test-uuid-001',
    evaluatorName: 'Ana Morales (UX Lead)',
    taskDescription: 'Completar registro de nueva prueba de usabilidad y guardar',
    timeOnTask: 48.5,
    errorsCount: 0,
    satisfactionScore: 5,
    taskResult: 'success',
    observations: 'Flujo intuitivo con campos agrupados. Las estrellas facilitan calificar sin dudar de la escala.',
    createdAt: '2026-09-21T10:15:00.000Z',
  },
  {
    id: 'test-uuid-002',
    evaluatorName: 'Carlos Benítez (Frontend Dev)',
    taskDescription: 'Localizar botón de exportación de reporte en el dashboard',
    timeOnTask: 92.0,
    errorsCount: 2,
    satisfactionScore: 2,
    taskResult: 'failure',
    observations: 'El usuario no encontró el botón de exportación porque estaba oculto al final de la página sin contraste visual.',
    createdAt: '2026-09-21T14:30:00.000Z',
  },
  {
    id: 'test-uuid-003',
    evaluatorName: 'Sofía Herrera (Product Designer)',
    taskDescription: 'Filtrar métricas de usabilidad por severidad mayor en KPI cards',
    timeOnTask: 35.2,
    errorsCount: 0,
    satisfactionScore: 4,
    taskResult: 'success',
    observations: 'Interacción directa y clara. La agrupación por severidad sigue la Ley de Semejanza.',
    createdAt: '2026-09-22T09:00:00.000Z',
  },
  {
    id: 'test-uuid-004',
    evaluatorName: 'David Paredes (QA Engineer)',
    taskDescription: 'Copiar observaciones cualitativas al módulo de IA',
    timeOnTask: 110.4,
    errorsCount: 3,
    satisfactionScore: 2,
    taskResult: 'failure',
    observations: 'Alta fricción al tener que copiar y pegar texto manualmente entre pestañas en el mockup antiguo.',
    createdAt: '2026-09-22T16:45:00.000Z',
  },
  {
    id: 'test-uuid-005',
    evaluatorName: 'Elena Ramos (Evaluadora IHC)',
    taskDescription: 'Navegar entre las 4 secciones principales usando solo teclado (Tab / Shift+Tab)',
    timeOnTask: 55.0,
    errorsCount: 1,
    satisfactionScore: 4,
    taskResult: 'success',
    observations: 'El foco visible responde adecuadamente según WCAG 2.1 POUR. No hubo trampas de foco.',
    createdAt: '2026-09-23T11:20:00.000Z',
  },
  {
    id: 'test-uuid-006',
    evaluatorName: 'Mateo Ortiz (Desarrollador Junior)',
    taskDescription: 'Comprender la escala de satisfacción ingresando un puntaje',
    timeOnTask: 62.1,
    errorsCount: 1,
    satisfactionScore: 3,
    taskResult: 'success',
    observations: 'Con input numérico tradicional dudó si 1 era el mejor o el peor. El StarRating eliminó la duda por completo.',
    createdAt: '2026-09-23T15:10:00.000Z',
  },
  {
    id: 'test-uuid-007',
    evaluatorName: 'Valeria Castro (Investigadora UX)',
    taskDescription: 'Revisar hallazgos de severidad catastrófica (Nielsen Nivel 4)',
    timeOnTask: 28.0,
    errorsCount: 0,
    satisfactionScore: 5,
    taskResult: 'success',
    observations: 'Identificación inmediata gracias a los Badges de severidad con contraste accesible.',
    createdAt: '2026-09-24T09:40:00.000Z',
  },
  {
    id: 'test-uuid-008',
    evaluatorName: 'Jorge Salazar (Estudiante IHC)',
    taskDescription: 'Interpretar tendencia temporal de métricas en el Dashboard',
    timeOnTask: 42.0,
    errorsCount: 0,
    satisfactionScore: 4,
    taskResult: 'success',
    observations: 'Los indicadores delta (↑ +5.2%) comunican contexto temporal sin obligar a memorizar datos pasados.',
    createdAt: '2026-09-24T17:15:00.000Z',
  },
  {
    id: 'test-uuid-009',
    evaluatorName: 'Lucía Viteri (Líder Técnico)',
    taskDescription: 'Generar historias de usuario a partir del análisis con IA',
    timeOnTask: 38.6,
    errorsCount: 0,
    satisfactionScore: 5,
    taskResult: 'success',
    observations: 'La estructura en tarjetas con criterios de aceptación y prioridades ahorra horas de redacción.',
    createdAt: '2026-09-25T11:00:00.000Z',
  },
  {
    id: 'test-uuid-010',
    evaluatorName: 'Gabriel Mendoza (Tester Accesibilidad)',
    taskDescription: 'Evaluar contraste de colores en botones primarios y secundarios',
    timeOnTask: 50.3,
    errorsCount: 0,
    satisfactionScore: 5,
    taskResult: 'success',
    observations: 'Cumple el ratio mínimo 4.5:1 exigido por WCAG 2.1 AA.',
    createdAt: '2026-09-25T16:30:00.000Z',
  },
];

/**
 * Matriz de diagnóstico heurístico inicial (Mockup Antiguo vs Rediseño)
 * Documentada para Sprint 1 (EDT 1.1 / 1.2)
 */
export const INITIAL_FINDINGS: UsabilityFinding[] = [
  {
    id: 'find-001',
    severity: 4, // Catastrófico
    heuristicViolated: 'Nielsen #1: Visibilidad del estado del sistema',
    location: 'Pestaña Asistente IA',
    description: 'El textarea es de solo lectura y no existe ningún indicador visual de procesamiento o carga mientras la IA analiza.',
    recommendation: 'Incorporar estados explícitos de carga (Spinner, barra de progreso y mensajes informativos). Reemplazar textarea por tarjetas legibles.',
    theoreticalBasis: 'Shneiderman #3 (Ofrecer retroalimentación informativa) y Principio POUR: Perceptible',
  },
  {
    id: 'find-002',
    severity: 3, // Mayor
    heuristicViolated: 'Nielsen #2: Correspondencia con el mundo real',
    location: 'Pestaña Registro de Prueba (Campo Satisfacción)',
    description: 'El input numérico (1-5) carece de affordance visual: el evaluador no sabe si 1 es excelente o deficiente.',
    recommendation: 'Reemplazar el campo numérico por un componente interactivo StarRating con etiquetas explícitas y affordance natural.',
    theoreticalBasis: 'Don Norman: Affordance y Manipulación Directa (Semana 4)',
  },
  {
    id: 'find-003',
    severity: 3, // Mayor
    heuristicViolated: 'Nielsen #6: Reconocimiento antes que recuerdo',
    location: 'Pestaña Dashboard',
    description: 'Las tarjetas de KPI muestran números aislados sin contexto temporal ni porcentaje de variación vs semana anterior.',
    recommendation: 'Agregar indicadores de tendencia (↑↓) y métricas comparativas para reducir la carga de memoria operativa (Miller 3-7 ítems).',
    theoreticalBasis: 'Semana 6: Memoria Humana y Carga Cognitiva',
  },
  {
    id: 'find-004',
    severity: 2, // Menor
    heuristicViolated: 'Nielsen #4: Consistencia y estándares',
    location: 'Barra de navegación de pestañas',
    description: 'La pestaña activa solo cambia levemente de tono sin soporte de accesibilidad por teclado ni clara relación Figura-Fondo.',
    recommendation: 'Implementar patrón accesible WAI-ARIA (role="tablist", aria-selected) y contraste alto de Figura-Fondo.',
    theoreticalBasis: 'Leyes Gestalt: Figura-Fondo (Semana 6) y WCAG 2.1 Operable',
  },
  {
    id: 'find-005',
    severity: 2, // Menor
    heuristicViolated: 'Nielsen #8: Diseño estético y minimalista',
    location: 'Formulario de Registro',
    description: 'Los campos del formulario estaban dispersos sin delimitación semántica.',
    recommendation: 'Agrupar en contenedores lógicos: "Datos del Evaluador", "Métricas ISO" y "Observaciones".',
    theoreticalBasis: 'Leyes Gestalt: Proximidad y Cierre (Semana 6)',
  },
];

/**
 * Calcula dinámicamente el resumen del Dashboard a partir de una lista de pruebas
 */
export function calculateDashboardSummary(tests: UsabilityTest[]): DashboardSummary {
  if (tests.length === 0) {
    return {
      totalTests: 0,
      successRate: 0,
      avgTime: 0,
      avgSatisfaction: 0,
      trends: {
        totalTestsDiff: 0,
        successRateDiff: 0,
        avgTimeDiff: 0,
        avgSatisfactionDiff: 0,
      },
    };
  }

  const totalTests = tests.length;
  const successCount = tests.filter((t) => t.taskResult === 'success').length;
  const successRate = Math.round((successCount / totalTests) * 1000) / 10; // 1 decimal

  const totalTime = tests.reduce((sum, t) => sum + Number(t.timeOnTask || 0), 0);
  const avgTime = Math.round((totalTime / totalTests) * 10) / 10;

  const totalSat = tests.reduce((sum, t) => sum + Number(t.satisfactionScore || 0), 0);
  const avgSatisfaction = Math.round((totalSat / totalTests) * 10) / 10;

  return {
    totalTests,
    successRate,
    avgTime,
    avgSatisfaction,
    trends: {
      totalTestsDiff: +2,
      successRateDiff: +5.5,
      avgTimeDiff: -12.3, // Reducción de tiempo = mejora
      avgSatisfactionDiff: +0.4,
    },
  };
}

/**
 * Mock estructurado para el módulo de IA (Sprint 1)
 * Alineado 1:1 con EDT 1.3 Pedro Acaro
 */
export function generateMockAiAnalysis(observations?: string): AiAnalysisResult {
  const customNote = observations ? observations.trim() : '';

  return {
    hallazgos_clave: [
      customNote
        ? `Observación analizada: "${customNote.slice(0, 100)}${customNote.length > 100 ? '...' : ''}"`
        : 'Los usuarios tardan más de 60s en completar el flujo si los campos no tienen agrupación visual.',
      'El 70% de los evaluadores prefería estrellas interactivas en lugar de un campo de texto numérico.',
      'Existe alta fricción al copiar manualmente las observaciones del registro al análisis cualitativo.',
      'La visibilidad del estado de carga previene la frustración y la doble ejecución involuntaria de acciones.',
    ],
    historias_usuario: [
      {
        titulo: 'Mejorar affordance del puntaje de satisfacción con componente StarRating',
        criterio_aceptacion: 'El usuario puede calificar de 1 a 5 estrellas haciendo clic directo con feedback visual instantáneo.',
        prioridad: 'alta',
      },
      {
        titulo: 'Carga automática de observaciones en el Asistente IA',
        criterio_aceptacion: 'Al seleccionar una prueba registrada, sus observaciones se inyectan automáticamente sin requerir copy-paste.',
        prioridad: 'alta',
      },
      {
        titulo: 'Añadir indicadores de tendencia temporal a las métricas del Dashboard',
        criterio_aceptacion: 'Cada KPI Card muestra un badge con la variación porcentual vs el período anterior (↑/↓).',
        prioridad: 'media',
      },
    ],
    recomendaciones_diseno: [
      'Aplicar la Ley de Fitts: garantizar que los botones de acción principal tengan al menos 44×44px de área interactiva.',
      'Aplicar la Ley Gestalt de Proximidad: mantener agrupados semánticamente los campos de entrada según el modelo mental del evaluador.',
      'Cumplir Nielsen #1 (Visibilidad del sistema): mostrar siempre spinners y badges de estado activo.',
      'Asegurar contraste WCAG 2.1 AA (mínimo 4.5:1 para texto normal) en todas las tarjetas de hallazgos.',
    ],
  };
}
