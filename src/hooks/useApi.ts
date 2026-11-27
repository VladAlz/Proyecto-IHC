import { QueryKey, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, getErrorMessage } from '../services/api';
import { useToast } from '../components/molecules/Toast/Toast';
import type { AppVersion } from '../types';

/**
 * Hooks de estado del servidor (TanStack React Query).
 * Cada mutación invalida las consultas afectadas y confirma con un toast (Nielsen #1).
 */

export const keys = {
  tests: (filters?: object) => ['tests', filters ?? {}] as const,
  dashboard: (filters?: object) => ['dashboard', filters ?? {}] as const,
  comparison: ['comparison'] as const,
  matrix: ['matrix'] as const,
  findings: ['findings'] as const,
  plans: ['plans'] as const,
  planResults: (id: string) => ['plans', id, 'results'] as const,
  aiStatus: ['ai-status'] as const,
  analyses: ['analyses'] as const,
  members: ['scrum', 'members'] as const,
  stories: ['scrum', 'stories'] as const,
  sprints: ['scrum', 'sprints'] as const,
  sprintSummary: (id: string) => ['scrum', 'sprints', id, 'summary'] as const,
  tasks: (sprintId?: string) => ['scrum', 'tasks', sprintId ?? 'all'] as const,
  daily: (sprintId?: string) => ['scrum', 'daily', sprintId ?? 'all'] as const,
};

export const useTests = (filters: { appVersion?: AppVersion; taskResult?: string; planId?: string } = {}) =>
  useQuery({ queryKey: keys.tests(filters), queryFn: () => api.listTests(filters) });

export const useDashboard = (filters: { appVersion?: AppVersion; from?: string; to?: string } = {}) =>
  useQuery({ queryKey: keys.dashboard(filters), queryFn: () => api.dashboard(filters) });

export const useComparison = () => useQuery({ queryKey: keys.comparison, queryFn: api.comparison });
export const useMatrix = () => useQuery({ queryKey: keys.matrix, queryFn: api.listMatrix });
export const useFindings = () => useQuery({ queryKey: keys.findings, queryFn: api.listFindings });
export const usePlans = () => useQuery({ queryKey: keys.plans, queryFn: api.listPlans });
export const usePlanResults = (id?: string) =>
  useQuery({ queryKey: keys.planResults(id || ''), queryFn: () => api.planResults(id!), enabled: Boolean(id) });
export const useAiStatus = () => useQuery({ queryKey: keys.aiStatus, queryFn: api.aiStatus, staleTime: 60_000 });
export const useAnalyses = () => useQuery({ queryKey: keys.analyses, queryFn: api.listAnalyses });
export const useMembers = () => useQuery({ queryKey: keys.members, queryFn: api.listMembers });
export const useStories = () => useQuery({ queryKey: keys.stories, queryFn: api.listStories });
export const useSprints = () => useQuery({ queryKey: keys.sprints, queryFn: api.listSprints });
export const useSprintSummary = (id?: string) =>
  useQuery({ queryKey: keys.sprintSummary(id || ''), queryFn: () => api.sprintSummary(id!), enabled: Boolean(id) });
export const useTasks = (sprintId?: string) =>
  useQuery({ queryKey: keys.tasks(sprintId), queryFn: () => api.listTasks(sprintId), enabled: Boolean(sprintId) });
export const useDaily = (sprintId?: string) =>
  useQuery({ queryKey: keys.daily(sprintId), queryFn: () => api.listDaily(sprintId), enabled: Boolean(sprintId) });

/**
 * Mutación genérica con feedback:
 *  - invalida los prefijos de consulta indicados
 *  - muestra toast de éxito (si se define) o de error con el mensaje del backend
 */
export function useApiMutation<TVars, TResult>(
  fn: (vars: TVars) => Promise<TResult>,
  options: { invalidate?: QueryKey[]; success?: string | ((r: TResult, v: TVars) => string); silent?: boolean } = {},
) {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: fn,
    onSuccess: (result, vars) => {
      for (const key of options.invalidate ?? []) qc.invalidateQueries({ queryKey: key });
      if (options.success) toast.success(typeof options.success === 'function' ? options.success(result, vars) : options.success);
    },
    onError: (error) => {
      if (!options.silent) toast.error(getErrorMessage(error));
    },
  });
}

/** Prefijos que dependen de las sesiones de prueba */
export const TEST_DEPENDENTS: QueryKey[] = [['tests'], ['dashboard'], ['comparison'], ['plans']];
/** Prefijos que dependen del módulo SCRUM y de los hallazgos (trazabilidad) */
export const SCRUM_DEPENDENTS: QueryKey[] = [['scrum'], ['findings'], ['dashboard']];
