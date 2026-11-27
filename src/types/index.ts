/**
 * Contratos TypeScript compartidos con el backend NestJS (backend/src/**).
 * ISO 9241-11: Efectividad (taskResult, errorsCount), Eficiencia (timeOnTask), Satisfacción (satisfactionScore).
 */

export type TaskResult = 'success' | 'assisted' | 'failure';
export type AppVersion = 'v1' | 'v2';
export type Severity = 1 | 2 | 3 | 4;
export type Priority = 'Alta' | 'Media' | 'Baja';

// ---------------- Pruebas de usabilidad ----------------
export interface UsabilityTest {
  id: string;
  evaluatorName: string;
  participantProfile?: string | null;
  taskDescription: string;
  taskCode?: string | null;
  planId?: string | null;
  appVersion: AppVersion;
  timeOnTask: number;
  errorsCount: number;
  satisfactionScore: number;
  taskResult: TaskResult;
  observations?: string | null;
  createdAt: string;
}

export interface CreateTestDto {
  evaluatorName: string;
  participantProfile?: string;
  taskDescription: string;
  taskCode?: string;
  planId?: string;
  appVersion: AppVersion;
  timeOnTask: number;
  errorsCount: number;
  satisfactionScore: number;
  taskResult: TaskResult;
  observations?: string;
}
export type UpdateTestDto = Partial<CreateTestDto>;

export interface Paginated<T> {
  data: T[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

// ---------------- Dashboard / comparativa ----------------
export interface UsabilityMetrics {
  totalTests: number;
  successRate: number;
  assistedRate: number;
  failureRate: number;
  avgTime: number;
  avgErrors: number;
  avgSatisfaction: number;
}

export interface DashboardSummary extends UsabilityMetrics {
  trends: { totalTestsDiff: number; successRateDiff: number; avgTimeDiff: number; avgSatisfactionDiff: number };
  findingsBySeverity: Record<string, number>;
  findingsByStatus: Record<string, number>;
  findingsByCategory: { category: string; count: number }[];
  tasks: { task: string; sessions: number; successRate: number; avgTime: number; avgErrors: number; avgSatisfaction: number }[];
}

export const MATRIX_CRITERIA = [
  { key: 'clarity', label: 'Claridad' },
  { key: 'learnability', label: 'Facilidad de aprendizaje' },
  { key: 'efficiency', label: 'Eficiencia' },
  { key: 'effectiveness', label: 'Eficacia' },
  { key: 'errorPrevention', label: 'Prevención de errores' },
  { key: 'satisfaction', label: 'Satisfacción' },
] as const;
export type MatrixCriterion = (typeof MATRIX_CRITERIA)[number]['key'];

export type MatrixScores = Record<MatrixCriterion, number>;

export interface MatrixEvaluation extends MatrixScores {
  id: string;
  appVersion: AppVersion;
  evaluator: string;
  notes?: string | null;
  createdAt: string;
}

export interface Comparison {
  v1: UsabilityMetrics;
  v2: UsabilityMetrics;
  deltas: { successRate: number; avgTime: number; avgErrors: number; avgSatisfaction: number; timeImprovementPct: number };
  matrix: { v1: MatrixScores & { overall: number; evaluations: number }; v2: MatrixScores & { overall: number; evaluations: number } };
  tasks: { task: string; v1: UsabilityMetrics; v2: UsabilityMetrics }[];
}

// ---------------- Hallazgos ----------------
export type FindingStatus = 'pendiente' | 'en_backlog' | 'resuelto';

export interface UsabilityFinding {
  id: string;
  severity: Severity;
  heuristicViolated: string;
  category: string;
  location: string;
  description: string;
  evidence?: string | null;
  frequency?: string | null;
  recommendation: string;
  theoreticalBasis?: string | null;
  status: FindingStatus;
  source: 'manual' | 'ia' | 'heuristica';
  createdAt: string;
}
export type FindingInput = Omit<UsabilityFinding, 'id' | 'createdAt' | 'source'> & { source?: UsabilityFinding['source'] };

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

// ---------------- Planes de prueba ----------------
export interface PlanTask {
  code: string;
  scenario: string;
  expectedResult: string;
  metric: string;
  successCriteria: string;
  followUpQuestion?: string;
  maxTimeSeconds?: number;
}

export interface PlanChecklist {
  emailParticipants: boolean;
  emailDate?: string;
  reminder1: boolean;
  reminder1Date?: string;
  reminder2: boolean;
  reminder2Date?: string;
  ethicalApproval: boolean;
  consentForm: boolean;
  usabilityChecklist: boolean;
}

export type PlanStatus = 'borrador' | 'listo' | 'en_ejecucion' | 'cerrado';

export interface TestPlan {
  id: string;
  product: string;
  module: string;
  objective: string;
  hypotheses?: string | null;
  userProfile: string;
  method: string;
  duration?: string | null;
  date?: string | null;
  location?: string | null;
  moderator?: string | null;
  observer?: string | null;
  tool?: string | null;
  link?: string | null;
  moderatorNotes?: string | null;
  appVersion: AppVersion;
  tasks: PlanTask[];
  checklist: PlanChecklist;
  status: PlanStatus;
  createdAt: string;
  updatedAt: string;
}
export type PlanInput = Omit<TestPlan, 'id' | 'createdAt' | 'updatedAt'>;

export interface PlanResults {
  plan: TestPlan;
  participants: number;
  tasks: {
    code: string;
    scenario: string;
    sessions: number;
    successRate: number;
    assistedRate: number;
    avgTime: number;
    avgErrors: number;
    avgSatisfaction: number;
  }[];
}

// ---------------- Asistente IA ----------------
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
  provider: string;
  model: string;
  fallback: boolean;
  durationMs: number;
  sessions: number;
  warnings: string[];
}

export interface AiAnalysis {
  id: string;
  title: string;
  testIds?: string[] | null;
  planId?: string | null;
  freeText?: string | null;
  result: AiAnalysisResult;
  meta: AiAnalysisMeta;
  edited: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AiStatus {
  primary: string;
  mode: 'llm' | 'local';
  chain: { provider: string; model: string; configured: boolean }[];
}

export interface AnalyzeRequest {
  testIds?: string[];
  planId?: string;
  observations?: string;
  context?: string;
  title?: string;
}

// ---------------- SCRUM ----------------
export interface TeamMember {
  id: string;
  name: string;
  role: string;
  hoursPerDay: number;
}

export type StoryStatus = 'backlog' | 'sprint' | 'hecha';

export interface UserStory {
  id: string;
  code: string;
  title: string;
  acceptanceCriteria: string;
  priority: Priority;
  module: string;
  businessValue: number;
  storyPoints: number;
  status: StoryStatus;
  sprintId?: string | null;
  source: 'manual' | 'ia' | 'hallazgo';
  findingId?: string | null;
  decisionRatio?: number;
  createdAt: string;
}
export type StoryInput = Partial<Omit<UserStory, 'id' | 'createdAt' | 'decisionRatio'>>;

export type SprintStatus = 'planificado' | 'activo' | 'cerrado';

export interface Sprint {
  id: string;
  number: number;
  goal: string;
  weeksLabel?: string | null;
  startDate: string;
  endDate: string;
  status: SprintStatus;
  productOwner?: string | null;
  scrumMaster?: string | null;
  deliverables?: string | null;
  reviewCompleted?: string | null;
  reviewPending?: string | null;
  reviewDelivered?: string | null;
  retroWentWell?: string | null;
  retroWentWrong?: string | null;
  retroAgreements?: string | null;
}
export type SprintInput = Partial<Omit<Sprint, 'id'>>;

export type TaskStatus = 'pendiente' | 'en_progreso' | 'en_revision' | 'terminado';

export interface SprintTask {
  id: string;
  sprintId: string;
  storyId?: string | null;
  title: string;
  assignee: string;
  phase: string;
  type: string;
  estimatedHours: number;
  realHours: number;
  status: TaskStatus;
  comment?: string | null;
  unplanned: boolean;
  unplannedDate?: string | null;
  createdAt: string;
}
export type TaskInput = Partial<Omit<SprintTask, 'id' | 'createdAt'>>;

export interface SprintSummary {
  sprint: Sprint;
  stories: UserStory[];
  totals: {
    tasks: number;
    done: number;
    estimatedHours: number;
    realHours: number;
    unplannedHours: number;
    storyPoints: number;
    completedPoints: number;
    progress: number;
  };
  byStatus: Record<TaskStatus, number>;
  byMember: { member: string; estimatedHours: number; realHours: number; tasks: number; done: number }[];
}

export interface DailyLog {
  id: string;
  sprintId: string;
  member: string;
  date: string;
  done: string;
  next: string;
  impediments?: string | null;
  createdAt: string;
}
export type DailyInput = Omit<DailyLog, 'id' | 'createdAt'>;

// ---------------- Etiquetas de UI compartidas ----------------
export const RESULT_LABELS: Record<TaskResult, string> = {
  success: 'Éxito',
  assisted: 'Con ayuda',
  failure: 'Fracaso',
};

export const SEVERITY_LABELS: Record<Severity, string> = {
  1: 'Cosmético',
  2: 'Menor',
  3: 'Mayor',
  4: 'Catastrófico',
};

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  pendiente: 'Pendiente',
  en_progreso: 'En progreso',
  en_revision: 'En revisión',
  terminado: 'Terminado',
};

export const FINDING_STATUS_LABELS: Record<FindingStatus, string> = {
  pendiente: 'Pendiente',
  en_backlog: 'En backlog',
  resuelto: 'Resuelto',
};

export const VERSION_LABELS: Record<AppVersion, string> = {
  v1: 'v1 · Inicial',
  v2: 'v2 · Rediseño',
};
