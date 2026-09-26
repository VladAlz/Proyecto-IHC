import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchTests,
  fetchTestById,
  createUsabilityTest,
  updateUsabilityTest,
  deleteUsabilityTest,
} from '../services/api';
import { CreateTestDto, UpdateTestDto } from '../types';

export function useTests() {
  const queryClient = useQueryClient();

  const testsQuery = useQuery({
    queryKey: ['tests'],
    queryFn: fetchTests,
    staleTime: 1000 * 30, // 30 segundos
  });

  const createMutation = useMutation({
    mutationFn: (dto: CreateTestDto) => createUsabilityTest(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tests'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateTestDto }) =>
      updateUsabilityTest(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tests'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteUsabilityTest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tests'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
    },
  });

  return {
    tests: testsQuery.data ?? [],
    isLoading: testsQuery.isLoading,
    isError: testsQuery.isError,
    error: testsQuery.error,
    refetch: testsQuery.refetch,
    createTest: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    createError: createMutation.error,
    updateTest: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteTest: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}

export function useTestDetail(id?: string) {
  return useQuery({
    queryKey: ['tests', id],
    queryFn: () => (id ? fetchTestById(id) : undefined),
    enabled: Boolean(id),
  });
}
