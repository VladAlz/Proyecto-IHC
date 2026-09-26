import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { analyzeObservationsWithAi } from '../services/api';
import { AiAnalysisResult } from '../types';

export function useAiAnalysis() {
  const [result, setResult] = useState<AiAnalysisResult | null>(null);

  const mutation = useMutation({
    mutationFn: (payload: { testId?: string; observations?: string }) =>
      analyzeObservationsWithAi(payload),
    onSuccess: (data) => {
      setResult(data);
    },
  });

  return {
    analyze: mutation.mutateAsync,
    isAnalyzing: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
    result,
    reset: () => {
      mutation.reset();
      setResult(null);
    },
  };
}
