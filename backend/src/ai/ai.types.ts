/**
 * Contrato de salida del Asistente IA (compartido con el frontend en src/types/index.ts).
 * Responde a las "salidas esperadas de la IA" del documento del proyecto integrador:
 * resumen de hallazgos, clasificación por categorías UX, priorización por severidad,
 * recomendaciones por pantalla y sugerencias de historias de usuario para el backlog.
 */
export type Severity = 1 | 2 | 3 | 4;
export type Priority = 'Alta' | 'Media' | 'Baja';

export interface AiFinding {
  titulo: string;
  descripcion: string;
  categoria: string;
  heuristica: string;
  severidad: Severity;
  pantalla: string;
  evidencia: string;
  frecuencia?: string;
}

export interface AiRecommendation {
  pantalla: string;
  recomendacion: string;
  fundamento: string;
  prioridad: Priority;
}

export interface AiUserStory {
  titulo: string;
  criterio_aceptacion: string;
  prioridad: Priority;
  modulo: string;
  valor_negocio: number;
  story_points: number;
  tareas: string[];
}

export interface AiAnalysisResult {
  resumen: string;
  hallazgos: AiFinding[];
  recomendaciones: AiRecommendation[];
  historias_usuario: AiUserStory[];
}

export interface AiAnalysisMeta {
  provider: string;   // gemini | groq | openrouter | local
  model: string;
  fallback: boolean;  // true si se usó un proveedor distinto al principal
  durationMs: number;
  sessions: number;   // sesiones de prueba usadas como entrada
  warnings: string[];
}

export interface AiSessionInput {
  evaluatorName: string;
  taskDescription: string;
  taskCode?: string;
  taskResult: 'success' | 'assisted' | 'failure';
  timeOnTask: number;
  errorsCount: number;
  satisfactionScore: number;
  observations?: string;
  appVersion?: string;
}

export interface AiAnalysisInput {
  sessions: AiSessionInput[];
  freeText?: string;
  context?: string; // producto/pantalla evaluada
}

export const UX_CATEGORIES = [
  'Navegación',
  'Visibilidad y feedback',
  'Jerarquía visual',
  'Formularios y prevención de errores',
  'Contenido y lenguaje',
  'Accesibilidad',
  'Eficiencia',
  'Consistencia',
  'General',
];

export const NIELSEN_HEURISTICS = [
  'Nielsen #1: Visibilidad del estado del sistema',
  'Nielsen #2: Correspondencia entre el sistema y el mundo real',
  'Nielsen #3: Control y libertad del usuario',
  'Nielsen #4: Consistencia y estándares',
  'Nielsen #5: Prevención de errores',
  'Nielsen #6: Reconocimiento antes que recuerdo',
  'Nielsen #7: Flexibilidad y eficiencia de uso',
  'Nielsen #8: Diseño estético y minimalista',
  'Nielsen #9: Ayudar a reconocer, diagnosticar y recuperarse de errores',
  'Nielsen #10: Ayuda y documentación',
];
