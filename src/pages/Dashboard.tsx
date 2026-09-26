import React from 'react';
import { useDashboard } from '../hooks/useDashboard';
import { useTests } from '../hooks/useTests';
import { DashboardGrid } from '../components/organisms/DashboardGrid/DashboardGrid';
import { Spinner } from '../components/atoms/Spinner/Spinner';
import { tokens } from '../styles/tokens';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from '../components/atoms/Button/Button';

/**
 * Página Dashboard (Ruta /dashboard)
 * Fundamentos IHC:
 * - Visibilidad del estado del sistema (Nielsen #1): Estados de carga y error explícitos.
 * - Reconocimiento antes que Recuerdo (Nielsen #6): Vista consolidada de métricas y hallazgos.
 */
export const DashboardPage: React.FC = () => {
  const { summary, findings, isLoading: isLoadingDashboard, isError, refetchSummary, refetchFindings } = useDashboard();
  const { tests, isLoading: isLoadingTests, deleteTest } = useTests();

  const isLoading = isLoadingDashboard || isLoadingTests;

  if (isLoading) {
    return (
      <div
        role="status"
        aria-live="polite"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '400px',
          gap: '16px',
        }}
      >
        <Spinner size="lg" />
        <p style={{ color: tokens.colors.gray600, fontSize: '15px' }}>
          Cargando indicadores de usabilidad y hallazgos...
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div
        role="alert"
        style={{
          backgroundColor: tokens.colors.dangerLight,
          border: `1px solid ${tokens.colors.dangerBorder}`,
          borderRadius: tokens.radii.lg,
          padding: '32px',
          textAlign: 'center',
          maxWidth: '500px',
          margin: '40px auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
        }}
      >
        <AlertCircle size={40} color={tokens.colors.danger} />
        <div>
          <h2 style={{ fontSize: '18px', color: tokens.colors.danger, margin: 0 }}>
            Error al sincronizar datos del Dashboard
          </h2>
          <p style={{ fontSize: '13px', color: tokens.colors.gray700, margin: '6px 0 0 0' }}>
            No se pudo obtener la información actualizada. Verifica la conexión o el servidor local.
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={() => {
            refetchSummary();
            refetchFindings();
          }}
          leftIcon={<RotateCcw size={16} />}
        >
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: tokens.colors.gray900 }}>
          Dashboard de Usabilidad UX
        </h1>
        <p style={{ fontSize: '14px', color: tokens.colors.gray600, margin: '4px 0 0 0' }}>
          Monitoreo en tiempo real de los 3 pilares de Calidad de Uso (ISO 9241-11) e inspección heurística
        </p>
      </div>

      <DashboardGrid
        summary={summary}
        findings={findings}
        tests={tests}
        onDeleteTest={deleteTest}
      />
    </div>
  );
};
