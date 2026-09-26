import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAiAnalysis } from '../hooks/useAiAnalysis';
import { useTests } from '../hooks/useTests';
import { AiAnalysisPanel } from '../components/organisms/AiAnalysisPanel/AiAnalysisPanel';
import { tokens } from '../styles/tokens';

/**
 * Página Asistente IA (Ruta /ai-assistant)
 * Fundamentos IHC:
 * - Ciclo APE 1: Observación → Hallazgo → Acción de Diseño.
 * - Elimina la manipulación indirecta y la copia manual de datos.
 */
export const AiAssistantPage: React.FC = () => {
  const location = useLocation();
  const routeState = (location.state as { selectedTestId?: string; observations?: string }) || {};

  const { tests } = useTests();
  const { analyze, isAnalyzing, result } = useAiAnalysis();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: tokens.colors.gray900 }}>
          Asistente IA para Análisis de Usabilidad
        </h1>
        <p style={{ fontSize: '14px', color: tokens.colors.gray600, margin: '4px 0 0 0' }}>
          Procesamiento automatizado de observaciones para generar Historias de Usuario ágiles y recomendaciones de diseño
        </p>
      </div>

      <AiAnalysisPanel
        tests={tests}
        initialTestId={routeState.selectedTestId}
        initialObservations={routeState.observations}
        onAnalyze={analyze}
        result={result}
        isAnalyzing={isAnalyzing}
      />
    </div>
  );
};
