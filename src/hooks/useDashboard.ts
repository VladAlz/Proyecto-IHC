import { useQuery } from '@tanstack/react-query';
import { fetchDashboardSummary, fetchDashboardFindings } from '../services/api';
import { DashboardSummary, UsabilityFinding } from '../types';

export function useDashboard() {
  const summaryQuery = useQuery<DashboardSummary>({
    queryKey: ['dashboard-summary'],
    queryFn: fetchDashboardSummary,
    staleTime: 1000 * 30,
  });

  const findingsQuery = useQuery<UsabilityFinding[]>({
    queryKey: ['dashboard-findings'],
    queryFn: fetchDashboardFindings,
    staleTime: 1000 * 60,
  });

  return {
    summary: summaryQuery.data ?? {
      totalTests: 0,
      successRate: 0,
      avgTime: 0,
      avgSatisfaction: 0,
    },
    findings: findingsQuery.data ?? [],
    isLoadingSummary: summaryQuery.isLoading,
    isLoadingFindings: findingsQuery.isLoading,
    isLoading: summaryQuery.isLoading || findingsQuery.isLoading,
    isError: summaryQuery.isError || findingsQuery.isError,
    refetchSummary: summaryQuery.refetch,
    refetchFindings: findingsQuery.refetch,
  };
}
