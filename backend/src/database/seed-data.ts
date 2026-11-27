/**
 * Datos semilla.
 * - tests v1: las 10 sesiones registradas en el Sprint 1 (versión inicial del aplicativo).
 * - tests v2 "Demo": sesiones de DEMOSTRACIÓN para que la comparativa antes/después tenga datos.
 *   Deben reemplazarse por las sesiones reales de la evaluación final (Sprint 3-4).
 * - findings: matriz de hallazgos heurísticos del Sprint 1.
 * - SCRUM: equipo, backlog HU-01..HU-10 del documento del proyecto integrador y plan de 4 sprints.
 *   Fechas, estimaciones (BV/SP/horas) y responsables son una propuesta inicial editable.
 */

export const SEED_TESTS = [
  // ---------------- v1: Sprint 1 ----------------
  { id: 'ae28eeff-5a60-434f-b4ec-e8b84507d6ca', appVersion: 'v1', evaluatorName: 'Ana Morales (UX Lead)', taskDescription: 'Completar registro de nueva prueba de usabilidad y guardar', timeOnTask: 48.5, errorsCount: 0, satisfactionScore: 5, taskResult: 'success', observations: 'Flujo intuitivo con campos agrupados. Las estrellas facilitan calificar sin dudar de la escala.', createdAt: '2026-09-21T10:15:00.000Z' },
  { id: '57c5cb8a-b1a2-48fe-a292-7fe480d77970', appVersion: 'v1', evaluatorName: 'Carlos Benítez (Frontend Dev)', taskDescription: 'Localizar botón de exportación de reporte en el dashboard', timeOnTask: 92, errorsCount: 2, satisfactionScore: 2, taskResult: 'failure', observations: 'El usuario no encontró el botón de exportación porque estaba oculto al final de la página sin contraste visual.', createdAt: '2026-09-21T14:30:00.000Z' },
  { id: '556d8ae1-fa29-4a5b-a03d-93108cbea09c', appVersion: 'v1', evaluatorName: 'Sofía Herrera (Product Designer)', taskDescription: 'Filtrar métricas de usabilidad por severidad mayor en KPI cards', timeOnTask: 35.2, errorsCount: 0, satisfactionScore: 4, taskResult: 'success', observations: 'Interacción directa y clara. La agrupación por severidad sigue la Ley de Semejanza.', createdAt: '2026-09-22T09:00:00.000Z' },
  { id: 'a42b08e0-c155-429d-b8a9-ce719d5a51d2', appVersion: 'v1', evaluatorName: 'David Paredes (QA Engineer)', taskDescription: 'Copiar observaciones cualitativas al módulo de IA', timeOnTask: 110.4, errorsCount: 3, satisfactionScore: 2, taskResult: 'failure', observations: 'Alta fricción al tener que copiar y pegar texto manualmente entre pestañas en el mockup antiguo.', createdAt: '2026-09-22T16:45:00.000Z' },
  { id: 'd146a207-d7e7-4337-8e6b-7ad2da2e5e82', appVersion: 'v1', evaluatorName: 'Elena Ramos (Evaluadora IHC)', taskDescription: 'Navegar entre las secciones principales usando solo teclado (Tab / Shift+Tab)', timeOnTask: 55, errorsCount: 1, satisfactionScore: 4, taskResult: 'success', observations: 'El foco visible responde adecuadamente según WCAG 2.1 POUR. No hubo trampas de foco.', createdAt: '2026-09-23T11:20:00.000Z' },
  { id: '206da7c1-f237-4abe-bd34-f32de0aafb60', appVersion: 'v1', evaluatorName: 'Mateo Ortiz (Desarrollador Junior)', taskDescription: 'Comprender la escala de satisfacción ingresando un puntaje', timeOnTask: 62.1, errorsCount: 1, satisfactionScore: 3, taskResult: 'success', observations: 'Con input numérico tradicional dudó si 1 era el mejor o el peor. El StarRating eliminó la duda por completo.', createdAt: '2026-09-23T15:10:00.000Z' },
  { id: '0a48ff6d-236d-4eac-b3db-ffd800860a35', appVersion: 'v1', evaluatorName: 'Valeria Castro (Investigadora UX)', taskDescription: 'Revisar hallazgos de severidad catastrófica (Nielsen Nivel 4)', timeOnTask: 28, errorsCount: 0, satisfactionScore: 5, taskResult: 'success', observations: 'Identificación inmediata gracias a los Badges de severidad con contraste accesible.', createdAt: '2026-09-24T10:00:00.000Z' },
  { id: '32603373-2cb5-42cf-aced-b281f798b4bc', appVersion: 'v1', evaluatorName: 'Andrés Villacís (Analista)', taskDescription: 'Interpretar tendencia temporal de métricas en el Dashboard', timeOnTask: 42, errorsCount: 0, satisfactionScore: 4, taskResult: 'success', observations: 'Los indicadores delta (+5.2%) comunican contexto temporal sin obligar a memorizar datos pasados.', createdAt: '2026-09-24T14:00:00.000Z' },
  { id: 'bb83443c-78cf-450c-bd6b-df6662683b06', appVersion: 'v1', evaluatorName: 'Lucía Guerrero (Scrum Team)', taskDescription: 'Generar historias de usuario a partir del análisis con IA', timeOnTask: 38.6, errorsCount: 0, satisfactionScore: 5, taskResult: 'success', observations: 'La estructura en tarjetas con criterios de aceptación y prioridades ahorra horas de redacción.', createdAt: '2026-09-25T09:30:00.000Z' },
  { id: 'cb11ad3d-ea0c-491e-af14-0e9a0aada5ab', appVersion: 'v1', evaluatorName: 'Jorge Salazar (Auditor WCAG)', taskDescription: 'Evaluar contraste de colores en botones primarios y secundarios', timeOnTask: 50.3, errorsCount: 0, satisfactionScore: 5, taskResult: 'success', observations: 'Cumple el ratio mínimo 4.5:1 exigido por WCAG 2.1 AA.', createdAt: '2026-09-25T16:00:00.000Z' },

  // ---------------- v2: DEMO (reemplazar por la evaluación final) ----------------
  { appVersion: 'v2', evaluatorName: 'Demo · P1', participantProfile: 'Estudiante 5to nivel', taskDescription: 'Localizar botón de exportación de reporte en el dashboard', timeOnTask: 24, errorsCount: 0, satisfactionScore: 4, taskResult: 'success', observations: 'Encontró la exportación en la cabecera del Asistente IA al primer intento.', createdAt: '2026-10-14T10:00:00.000Z' },
  { appVersion: 'v2', evaluatorName: 'Demo · P2', participantProfile: 'Estudiante 5to nivel', taskDescription: 'Copiar observaciones cualitativas al módulo de IA', timeOnTask: 18, errorsCount: 0, satisfactionScore: 5, taskResult: 'success', observations: 'Con "Analizar con IA" desde la tabla, las observaciones se precargaron sin copiar y pegar.', createdAt: '2026-10-14T10:30:00.000Z' },
  { appVersion: 'v2', evaluatorName: 'Demo · P3', participantProfile: 'Docente', taskDescription: 'Comprender la escala de satisfacción ingresando un puntaje', timeOnTask: 20, errorsCount: 0, satisfactionScore: 5, taskResult: 'success', observations: 'Las estrellas con etiqueta descriptiva no generaron dudas.', createdAt: '2026-10-14T11:00:00.000Z' },
  { appVersion: 'v2', evaluatorName: 'Demo · P1', participantProfile: 'Estudiante 5to nivel', taskDescription: 'Completar registro de nueva prueba de usabilidad y guardar', timeOnTask: 41, errorsCount: 0, satisfactionScore: 5, taskResult: 'success', observations: 'La validación en línea le avisó del tiempo vacío antes de guardar.', createdAt: '2026-10-15T09:00:00.000Z' },
  { appVersion: 'v2', evaluatorName: 'Demo · P2', participantProfile: 'Estudiante 5to nivel', taskDescription: 'Navegar entre las secciones principales usando solo teclado (Tab / Shift+Tab)', timeOnTask: 70, errorsCount: 2, satisfactionScore: 3, taskResult: 'assisted', observations: 'Con más pestañas tardó en llegar a SCRUM usando teclado; preguntó si existían atajos y necesitó una pista.', createdAt: '2026-10-15T09:40:00.000Z' },
  { appVersion: 'v2', evaluatorName: 'Demo · P3', participantProfile: 'Docente', taskDescription: 'Generar historias de usuario a partir del análisis con IA', timeOnTask: 30, errorsCount: 1, satisfactionScore: 4, taskResult: 'success', observations: 'Enviar historias al backlog fue directo, pero no vio el mensaje de confirmación y volvió a pulsar el botón.', createdAt: '2026-10-15T10:20:00.000Z' },
];

export const SEED_FINDINGS = [
  { severity: 4, category: 'Visibilidad y feedback', heuristicViolated: 'Nielsen #1: Visibilidad del estado del sistema', location: 'Pestaña Asistente IA', description: 'El textarea es de solo lectura y no existe ningún indicador visual de procesamiento o carga mientras la IA analiza.', recommendation: 'Incorporar estados explícitos de carga (Spinner, barra de progreso y mensajes informativos). Reemplazar textarea por tarjetas legibles.', theoreticalBasis: 'Shneiderman #3 (Ofrecer retroalimentación informativa) y Principio POUR: Perceptible', source: 'heuristica', status: 'resuelto', frequency: 'Evaluación heurística' },
  { severity: 3, category: 'Formularios y prevención de errores', heuristicViolated: 'Nielsen #2: Correspondencia entre el sistema y el mundo real', location: 'Pestaña Registro de Prueba (Campo Satisfacción)', description: 'El input numérico (1-5) carece de affordance visual: el evaluador no sabe si 1 es excelente o deficiente.', recommendation: 'Reemplazar el campo numérico por un componente interactivo StarRating con etiquetas explícitas y affordance natural.', theoreticalBasis: 'Don Norman: Affordance y Manipulación Directa (Semana 4)', source: 'heuristica', status: 'resuelto', frequency: '1/10 sesiones' },
  { severity: 3, category: 'Navegación', heuristicViolated: 'Nielsen #6: Reconocimiento antes que recuerdo', location: 'Pestaña Dashboard', description: 'Las tarjetas de KPI muestran números aislados sin contexto temporal ni porcentaje de variación vs semana anterior.', recommendation: 'Agregar indicadores de tendencia y métricas comparativas para reducir la carga de memoria operativa (Miller 3-7 ítems).', theoreticalBasis: 'Semana 6: Memoria Humana y Carga Cognitiva', source: 'heuristica', status: 'resuelto', frequency: 'Evaluación heurística' },
  { severity: 2, category: 'Accesibilidad', heuristicViolated: 'Nielsen #4: Consistencia y estándares', location: 'Barra de navegación de pestañas', description: 'La pestaña activa solo cambia levemente de tono sin soporte de accesibilidad por teclado ni clara relación Figura-Fondo.', recommendation: 'Implementar patrón accesible WAI-ARIA (role="tablist", aria-selected) y contraste alto de Figura-Fondo.', theoreticalBasis: 'Leyes Gestalt: Figura-Fondo (Semana 6) y WCAG 2.1 Operable', source: 'heuristica', status: 'resuelto', frequency: 'Evaluación heurística' },
  { severity: 2, category: 'Jerarquía visual', heuristicViolated: 'Nielsen #8: Diseño estético y minimalista', location: 'Formulario de Registro', description: 'Los campos del formulario estaban dispersos sin delimitación semántica.', recommendation: "Agrupar en contenedores lógicos: 'Datos del Evaluador', 'Métricas ISO' y 'Observaciones'.", theoreticalBasis: 'Leyes Gestalt: Proximidad y Cierre (Semana 6)', source: 'heuristica', status: 'resuelto', frequency: 'Evaluación heurística' },
  { severity: 4, category: 'Jerarquía visual', heuristicViolated: 'Nielsen #8: Diseño estético y minimalista', location: 'Dashboard - Exportación de reportes', description: 'El botón de exportación estaba al final de la página y sin contraste; el participante no completó la tarea.', evidence: 'Carlos Benítez: fracaso, 92 s, 2 errores, satisfacción 2/5.', recommendation: 'Ubicar la exportación en la cabecera del reporte con estilo de acción primaria.', theoreticalBasis: 'Ley de Figura-Fondo y Ley de Fitts.', source: 'manual', status: 'pendiente', frequency: '1/10 sesiones' },
  { severity: 3, category: 'Eficiencia', heuristicViolated: 'Nielsen #7: Flexibilidad y eficiencia de uso', location: 'Asistente IA', description: 'Las observaciones debían copiarse y pegarse manualmente entre pestañas para analizarlas.', evidence: 'David Paredes: fracaso, 110 s, 3 errores, satisfacción 2/5.', recommendation: 'Permitir seleccionar sesiones registradas y enviarlas directamente al Asistente IA.', theoreticalBasis: 'Nielsen #7 y reducción de carga cognitiva.', source: 'manual', status: 'pendiente', frequency: '1/10 sesiones' },
];

export const SEED_MEMBERS = [
  { name: 'Vladimir González', role: 'Líder de proyecto · Scrum Master · QA', hoursPerDay: 2 },
  { name: 'Santiago Mora', role: 'Diseñador UX/UI · Tester de usabilidad', hoursPerDay: 2 },
  { name: 'Pedro Acaro', role: 'Desarrollador Backend · IA', hoursPerDay: 2 },
  { name: 'Boris Vinces', role: 'Desarrollador Frontend', hoursPerDay: 2 },
];

export const SEED_SPRINTS = [
  {
    number: 1, weeksLabel: 'Sem. 10–11', startDate: '2026-09-14', endDate: '2026-09-27', status: 'cerrado',
    goal: 'Diagnóstico, backlog y prototipos iniciales',
    deliverables: 'Matriz de problemas, user flow, wireframes, prototipo Figma, backlog priorizado y base frontend/backend.',
    scrumMaster: 'Vladimir González', productOwner: 'Por definir',
  },
  {
    number: 2, weeksLabel: 'Sem. 12–13', startDate: '2026-09-28', endDate: '2026-10-18', status: 'activo',
    goal: 'Prototipo de alta fidelidad e implementación base de los 5 módulos',
    deliverables: 'Mockups Hi-Fi, sistema visual y vistas principales funcionales (evaluaciones, dashboard, IA, rediseño, SCRUM).',
    scrumMaster: 'Vladimir González', productOwner: 'Por definir',
  },
  {
    number: 3, weeksLabel: 'Sem. 14–15', startDate: '2026-10-19', endDate: '2026-11-01', status: 'planificado',
    goal: 'Integración de feedback, accesibilidad e IA; pruebas de tarea',
    deliverables: 'Interfaz mejorada, validaciones, módulo IA y pruebas de tarea con compañeros.',
    scrumMaster: 'Vladimir González', productOwner: 'Por definir',
  },
  {
    number: 4, weeksLabel: 'Sem. 16', startDate: '2026-11-02', endDate: '2026-11-08', status: 'planificado',
    goal: 'Cierre, retrospectiva y presentación final',
    deliverables: 'Comparación antes/después, sprint review, retrospectiva y exposición.',
    scrumMaster: 'Vladimir González', productOwner: 'Por definir',
  },
];

/** sprint: número de sprint al que se asigna (o null = backlog); status final de la historia */
export const SEED_STORIES = [
  { code: 'HU-01', module: 'Eval.', priority: 'Alta', businessValue: 9, storyPoints: 3, sprint: 1, status: 'hecha', title: 'Como evaluador, quiero registrar una prueba de usabilidad con tareas, tiempos y observaciones para analizar el desempeño de una interfaz.', acceptanceCriteria: 'La prueba se guarda y puede consultarse desde el dashboard.' },
  { code: 'HU-02', module: 'Dash.', priority: 'Alta', businessValue: 8, storyPoints: 5, sprint: 2, status: 'sprint', title: 'Como usuario del dashboard, quiero visualizar los problemas más frecuentes para identificar rápidamente las principales oportunidades de mejora.', acceptanceCriteria: 'El panel muestra conteos, categorías y filtros básicos.' },
  { code: 'HU-03', module: 'Dash.', priority: 'Alta', businessValue: 8, storyPoints: 5, sprint: 4, status: 'sprint', title: 'Como docente, quiero comparar el antes y el después del aplicativo para verificar si el rediseño mejoró la experiencia.', acceptanceCriteria: 'Existen evidencias visuales y métricas comparativas.' },
  { code: 'HU-04', module: 'IA', priority: 'Alta', businessValue: 9, storyPoints: 5, sprint: 2, status: 'sprint', title: 'Como equipo UX, queremos que la IA resuma las observaciones textuales para acelerar la interpretación de hallazgos.', acceptanceCriteria: 'El sistema genera un resumen legible y útil.' },
  { code: 'HU-05', module: 'IA', priority: 'Media', businessValue: 7, storyPoints: 3, sprint: 3, status: 'sprint', title: 'Como equipo de proyecto, queremos que la IA sugiera recomendaciones UX basadas en problemas detectados.', acceptanceCriteria: 'Se muestran sugerencias asociadas a cada hallazgo.' },
  { code: 'HU-06', module: 'SCRUM', priority: 'Alta', businessValue: 8, storyPoints: 3, sprint: 2, status: 'sprint', title: 'Como líder del equipo, quiero registrar historias de usuario en un Product Backlog para planificar el proyecto por sprints.', acceptanceCriteria: 'Se pueden crear, editar y priorizar historias.' },
  { code: 'HU-07', module: 'SCRUM', priority: 'Alta', businessValue: 8, storyPoints: 5, sprint: 2, status: 'sprint', title: 'Como integrante, quiero visualizar mis tareas en un tablero para saber qué debo hacer y en qué estado se encuentran.', acceptanceCriteria: 'El tablero muestra tareas por estado y responsable.' },
  { code: 'HU-08', module: 'SCRUM', priority: 'Media', businessValue: 6, storyPoints: 2, sprint: 3, status: 'sprint', title: 'Como equipo, queremos registrar retrospectivas para mejorar el siguiente sprint.', acceptanceCriteria: 'Cada sprint guarda acuerdos y lecciones aprendidas.' },
  { code: 'HU-09', module: 'UI', priority: 'Alta', businessValue: 8, storyPoints: 3, sprint: 1, status: 'hecha', title: 'Como usuario final, quiero un formulario más claro y con validación para evitar errores al registrar resultados.', acceptanceCriteria: 'Los campos son comprensibles y muestran mensajes de ayuda.' },
  { code: 'HU-10', module: 'UI', priority: 'Alta', businessValue: 7, storyPoints: 3, sprint: 3, status: 'sprint', title: 'Como usuario nuevo, quiero navegar por el dashboard sin confusión para aprender el sistema rápidamente.', acceptanceCriteria: 'La navegación es consistente y las etiquetas son claras.' },
  { code: 'HU-11', module: 'Eval.', priority: 'Media', businessValue: 7, storyPoints: 5, sprint: null, status: 'backlog', title: 'Como moderador, quiero configurar un plan de prueba (objetivo, tareas, roles y checklist) y ejecutarlo registrando cada observación, para reemplazar la matriz estática de Excel.', acceptanceCriteria: 'El plan se crea en un wizard de dos fases y las observaciones registradas quedan vinculadas a sus tareas.' },
  { code: 'HU-12', module: 'IA', priority: 'Media', businessValue: 6, storyPoints: 3, sprint: null, status: 'backlog', title: 'Como investigador, quiero exportar el análisis de la IA a Markdown y PDF, para integrarlo en GitHub Issues y en el informe final.', acceptanceCriteria: 'El análisis editado se descarga como .md y se imprime/guarda como PDF con formato de reporte.' },
];

/** story: código de HU; sprint: número de sprint */
export const SEED_TASKS = [
  // Sprint 1 (cerrado) - según el documento Sprint1_IHC
  { sprint: 1, story: 'HU-09', assignee: 'Santiago Mora', phase: 'Diseño', type: 'Nuevo', title: 'Wireframes y prototipo de alta fidelidad en Figma', estimatedHours: 6, status: 'terminado' },
  { sprint: 1, story: 'HU-01', assignee: 'Pedro Acaro', phase: 'Desarrollo', type: 'Nuevo', title: 'Backend NestJS + TypeORM: entidades usability_tests y usability_findings', estimatedHours: 8, status: 'terminado' },
  { sprint: 1, story: 'HU-01', assignee: 'Boris Vinces', phase: 'Desarrollo', type: 'Nuevo', title: 'Frontend Atomic Design: formulario de registro en 4 bloques', estimatedHours: 8, status: 'terminado' },
  { sprint: 1, story: 'HU-09', assignee: 'Vladimir González', phase: 'Pruebas', type: 'Nuevo', title: 'Auditoría Lighthouse y WAVE del dashboard', estimatedHours: 3, status: 'terminado' },
  { sprint: 1, story: null, assignee: 'Vladimir González', phase: 'Documentación', type: 'Nuevo', title: 'Documento Sprint 1 e integración de ramas', estimatedHours: 4, status: 'terminado' },
  // Sprint 2 (activo)
  { sprint: 2, story: 'HU-06', assignee: 'Pedro Acaro', phase: 'Desarrollo', type: 'Nuevo', title: 'API SCRUM: historias, sprints, tareas y daily', estimatedHours: 6, status: 'en_revision' },
  { sprint: 2, story: 'HU-07', assignee: 'Boris Vinces', phase: 'Desarrollo', type: 'Nuevo', title: 'Sprint Board tipo Kanban con cambio de estado', estimatedHours: 6, status: 'en_progreso' },
  { sprint: 2, story: 'HU-04', assignee: 'Pedro Acaro', phase: 'Desarrollo', type: 'Nuevo', title: 'Integrar Gemini/Groq con prompt JSON estricto y fallback local', estimatedHours: 8, status: 'en_progreso' },
  { sprint: 2, story: 'HU-02', assignee: 'Boris Vinces', phase: 'Desarrollo', type: 'Mejora', title: 'Filtros por versión y fechas + distribución de hallazgos', estimatedHours: 4, status: 'pendiente' },
  { sprint: 2, story: 'HU-04', assignee: 'Santiago Mora', phase: 'Diseño', type: 'Nuevo', title: 'Mockups Hi-Fi del Asistente IA (reposo, carga, resultado)', estimatedHours: 4, status: 'terminado' },
  { sprint: 2, story: null, assignee: 'Vladimir González', phase: 'Pruebas', type: 'Nuevo', title: 'Revisar PRs a develop y actualizar matriz de planificación', estimatedHours: 3, status: 'en_progreso' },
];

export const SEED_PLAN = {
  product: 'Usability Test Dashboard 2.0',
  module: 'Dashboard UX, Registro de prueba, Asistente IA y SCRUM',
  objective: 'Validar si un usuario nuevo puede registrar una prueba, interpretar el dashboard, analizar observaciones con IA y llevar una historia al backlog sin ayuda.',
  hypotheses: '¿La navegación por pestañas es comprensible? ¿El envío de sesiones a la IA elimina el copiar/pegar? ¿Se entiende el tablero SCRUM?',
  userProfile: '5 estudiantes de IHC de 5to nivel; usuarios de laptop; conocen pruebas de usabilidad pero no el sistema.',
  method: 'Prueba moderada presencial (think aloud)',
  duration: '20 minutos por participante',
  date: '2026-10-22',
  location: 'Laboratorio FISEI - UTA',
  moderator: 'Santiago Mora',
  observer: 'Vladimir González',
  tool: 'Aplicativo IHC_AI 1.0 en localhost',
  appVersion: 'v2',
  status: 'listo',
  moderatorNotes: 'Explicar que se evalúa la interfaz, no a la persona. Leer una tarea a la vez. No ayudar salvo bloqueo total (registrar como "con ayuda").',
  tasks: [
    { code: 'T1', scenario: 'Registra una nueva prueba de usabilidad de un compañero que tardó 45 s y cometió 1 error.', expectedResult: 'La prueba aparece en el dashboard.', metric: 'Éxito + tiempo', successCriteria: 'Completa sin ayuda en menos de 60 s', followUpQuestion: '¿Qué campo te generó dudas?', maxTimeSeconds: 60 },
    { code: 'T2', scenario: 'Encuentra cuál es la tarea con menor tasa de éxito en el dashboard.', expectedResult: 'Identifica la tarea en la tabla de desempeño.', metric: 'Éxito + errores', successCriteria: 'Responde correctamente en menos de 30 s', followUpQuestion: '¿Qué esperabas encontrar en esta pantalla?', maxTimeSeconds: 30 },
    { code: 'T3', scenario: 'Analiza con IA las observaciones de las pruebas fallidas y envía una historia al backlog.', expectedResult: 'La historia aparece en el Product Backlog.', metric: 'Éxito + tiempo', successCriteria: 'Completa sin ayuda en menos de 90 s', followUpQuestion: '¿Confiarías en las sugerencias de la IA?', maxTimeSeconds: 90 },
    { code: 'T4', scenario: 'Mueve una tarea del sprint activo a "En revisión".', expectedResult: 'La tarjeta cambia de columna en el tablero.', metric: 'Éxito + tiempo', successCriteria: 'Completa sin ayuda en menos de 30 s', followUpQuestion: '¿Qué fue lo más confuso?', maxTimeSeconds: 30 },
  ],
  checklist: {
    emailParticipants: true, emailDate: '2026-10-17',
    reminder1: false, reminder2: false,
    ethicalApproval: false, consentForm: true, usabilityChecklist: true,
  },
};
