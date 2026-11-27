import axios, { AxiosError } from 'axios';
import type {
  AiAnalysis,
  AiAnalysisResult,
  AiStatus,
  AnalyzeRequest,
  Comparison,
  CreateTestDto,
  DailyInput,
  DailyLog,
  DashboardSummary,
  FindingInput,
  MatrixEvaluation,
  MatrixScores,
  AppVersion,
  Paginated,
  PlanInput,
  PlanResults,
  Sprint,
  SprintInput,
  SprintSummary,
  SprintTask,
  StoryInput,
  TaskInput,
  TeamMember,
  TestPlan,
  UpdateTestDto,
  UsabilityFinding,
  UsabilityTest,
  UserStory,
} from '../types';

/**
 * Cliente HTTP del backend NestJS. El backend es la única fuente de verdad:
 * si no responde, la UI lo indica explícitamente (Nielsen #1) en lugar de simular datos.
 */
const API_URL = import.meta.env.VITE_API_URL || '/api';

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

/** Convierte errores HTTP/validación en un mensaje legible en español (Nielsen #9) */
export function getErrorMessage(error: unknown): string {
  const err = error as AxiosError<{ message?: string | string[] | { message?: string | string[] } }>;
  if (err?.code === 'ECONNABORTED') return 'El servidor tardó demasiado en responder. Intenta nuevamente.';
  if (err?.response) {
    const data = err.response.data;
    let message: unknown = data?.message;
    if (message && typeof message === 'object' && !Array.isArray(message)) message = (message as { message?: unknown }).message;
    if (Array.isArray(message)) return message.join(' · ');
    if (typeof message === 'string') return message;
    return `Error del servidor (HTTP ${err.response.status})`;
  }
  if (err?.request) return 'No hay conexión con el backend (http://localhost:3000). Ejecuta "npm run dev" en la raíz del proyecto.';
  return (error as Error)?.message || 'Error desconocido';
}

const get = <T>(url: string, params?: object) => apiClient.get<T>(url, { params }).then((r) => r.data);
const post = <T>(url: string, body?: unknown, timeout?: number) =>
  apiClient.post<T>(url, body, timeout ? { timeout } : undefined).then((r) => r.data);
const patch = <T>(url: string, body: unknown) => apiClient.patch<T>(url, body).then((r) => r.data);
const del = (url: string) => apiClient.delete(url).then((r) => r.data);

export const api = {
  health: () => get<{ status: string }>('/health'),
  resetData: () => post<{ success: boolean }>('/admin/reset'),

  // Pruebas
  listTests: (params: { appVersion?: AppVersion; taskResult?: string; planId?: string } = {}) =>
    get<Paginated<UsabilityTest>>('/tests', { page: 1, limit: 1000, ...params }).then((r) => r.data),
  createTest: (dto: CreateTestDto) => post<UsabilityTest>('/tests', dto),
  createTestsBulk: (dtos: CreateTestDto[]) => post<UsabilityTest[]>('/tests/bulk', dtos),
  updateTest: (id: string, dto: UpdateTestDto) => patch<UsabilityTest>(`/tests/${id}`, dto),
  deleteTest: (id: string) => del(`/tests/${id}`),

  // Dashboard y comparativa
  dashboard: (params: { appVersion?: AppVersion; from?: string; to?: string } = {}) =>
    get<DashboardSummary>('/dashboard/summary', params),
  comparison: () => get<Comparison>('/comparison'),
  listMatrix: () => get<MatrixEvaluation[]>('/comparison/matrix'),
  createMatrix: (dto: MatrixScores & { appVersion: AppVersion; evaluator: string; notes?: string }) =>
    post<MatrixEvaluation>('/comparison/matrix', dto),
  deleteMatrix: (id: string) => del(`/comparison/matrix/${id}`),

  // Hallazgos
  listFindings: () => get<UsabilityFinding[]>('/findings'),
  createFinding: (dto: FindingInput) => post<UsabilityFinding>('/findings', dto),
  updateFinding: (id: string, dto: Partial<FindingInput>) => patch<UsabilityFinding>(`/findings/${id}`, dto),
  deleteFinding: (id: string) => del(`/findings/${id}`),

  // Planes
  listPlans: () => get<TestPlan[]>('/plans'),
  getPlan: (id: string) => get<TestPlan>(`/plans/${id}`),
  planResults: (id: string) => get<PlanResults>(`/plans/${id}/results`),
  createPlan: (dto: PlanInput) => post<TestPlan>('/plans', dto),
  updatePlan: (id: string, dto: Partial<PlanInput>) => patch<TestPlan>(`/plans/${id}`, dto),
  deletePlan: (id: string) => del(`/plans/${id}`),

  // IA
  aiStatus: () => get<AiStatus>('/ai/status'),
  analyze: (req: AnalyzeRequest) => post<AiAnalysis>('/ai/analyze', req, 90000),
  listAnalyses: () => get<AiAnalysis[]>('/ai/analyses'),
  updateAnalysis: (id: string, body: { title?: string; result: AiAnalysisResult }) => patch<AiAnalysis>(`/ai/analyses/${id}`, body),
  deleteAnalysis: (id: string) => del(`/ai/analyses/${id}`),
  applyAnalysis: (body: {
    findings?: (AiAnalysisResult['hallazgos'][number] & { recomendacion?: string; fundamento?: string })[];
    stories?: (AiAnalysisResult['historias_usuario'][number] & { findingIndex?: number })[];
  }) => post<{ findings: UsabilityFinding[]; stories: UserStory[] }>('/ai/apply', body),

  // SCRUM
  listMembers: () => get<TeamMember[]>('/scrum/members'),
  createMember: (dto: Omit<TeamMember, 'id'>) => post<TeamMember>('/scrum/members', dto),
  updateMember: (id: string, dto: Partial<TeamMember>) => patch<TeamMember>(`/scrum/members/${id}`, dto),
  deleteMember: (id: string) => del(`/scrum/members/${id}`),

  listStories: () => get<UserStory[]>('/scrum/stories'),
  createStory: (dto: StoryInput) => post<UserStory>('/scrum/stories', dto),
  updateStory: (id: string, dto: StoryInput) => patch<UserStory>(`/scrum/stories/${id}`, dto),
  deleteStory: (id: string) => del(`/scrum/stories/${id}`),

  listSprints: () => get<Sprint[]>('/scrum/sprints'),
  sprintSummary: (id: string) => get<SprintSummary>(`/scrum/sprints/${id}/summary`),
  createSprint: (dto: SprintInput) => post<Sprint>('/scrum/sprints', dto),
  updateSprint: (id: string, dto: SprintInput) => patch<Sprint>(`/scrum/sprints/${id}`, dto),
  deleteSprint: (id: string) => del(`/scrum/sprints/${id}`),

  listTasks: (sprintId?: string) => get<SprintTask[]>('/scrum/tasks', sprintId ? { sprintId } : undefined),
  createTask: (dto: TaskInput) => post<SprintTask>('/scrum/tasks', dto),
  updateTask: (id: string, dto: TaskInput) => patch<SprintTask>(`/scrum/tasks/${id}`, dto),
  deleteTask: (id: string) => del(`/scrum/tasks/${id}`),

  listDaily: (sprintId?: string) => get<DailyLog[]>('/scrum/daily', sprintId ? { sprintId } : undefined),
  createDaily: (dto: DailyInput) => post<DailyLog>('/scrum/daily', dto),
  deleteDaily: (id: string) => del(`/scrum/daily/${id}`),
};
