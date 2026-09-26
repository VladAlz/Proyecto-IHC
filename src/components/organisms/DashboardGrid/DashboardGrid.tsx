import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  CheckCircle,
  Clock,
  Star,
  Filter,
  Plus,
  Sparkles,
  Search,
  Trash2,
  FileCheck,
} from 'lucide-react';
import { DashboardSummary, UsabilityFinding, UsabilityTest } from '../../../types';
import { KpiCard } from '../../molecules/KpiCard/KpiCard';
import { FindingRow } from '../../molecules/FindingRow/FindingRow';
import { Button } from '../../atoms/Button/Button';
import { Badge } from '../../atoms/Badge/Badge';
import { tokens } from '../../../styles/tokens';

export interface DashboardGridProps {
  summary: DashboardSummary;
  findings: UsabilityFinding[];
  tests: UsabilityTest[];
  onDeleteTest?: (id: string) => void;
  isLoading?: boolean;
}

/**
 * Organismo DashboardGrid
 * Fundamentos IHC:
 * - Ley de Continuidad (Gestalt - Semana 6): Flujo de lectura de arriba a abajo:
 *   KPIs ejecutivos arriba → Tendencias & Hallazgos intermedios → Tabla de detalle operativo abajo.
 * - Ley de Semejanza (Gestalt): 4 KPI cards con exactamente la misma estructura y peso visual.
 * - Reconocimiento vs Recuerdo (Nielsen #6): Información consolidada siempre visible en pantalla.
 * - Visibilidad del estado del sistema (Nielsen #1): Estados vacíos descriptivos y feedback inmediato.
 */
export const DashboardGrid: React.FC<DashboardGridProps> = ({
  summary,
  findings,
  tests,
  onDeleteTest,
}) => {
  const navigate = useNavigate();
  const [selectedSeverity, setSelectedSeverity] = useState<number | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filtrado de hallazgos heurísticos
  const filteredFindings = findings.filter((f) => {
    if (selectedSeverity === 'all') return true;
    return f.severity === selectedSeverity;
  });

  // Filtrado de pruebas operativas
  const filteredTests = tests.filter((t) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      t.evaluatorName.toLowerCase().includes(query) ||
      t.taskDescription.toLowerCase().includes(query) ||
      (t.observations && t.observations.toLowerCase().includes(query))
    );
  });

  const handleSendToAi = (test: UsabilityTest) => {
    navigate('/ai-assistant', {
      state: {
        selectedTestId: test.id,
        observations: test.observations || `Prueba de ${test.evaluatorName}: ${test.taskDescription}`,
      },
    });
  };

  const handleFindingToAi = (finding: UsabilityFinding) => {
    navigate('/ai-assistant', {
      state: {
        observations: `Hallazgo Heurístico [${finding.heuristicViolated}] en ${finding.location}: ${finding.description}. Recomendación: ${finding.recommendation}`,
      },
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing.xl }}>
      {/* 1. SECCIÓN DE KPIS: Semejanza y Continuidad (Semana 6) */}
      <section aria-labelledby="kpi-section-title">
        <h2 id="kpi-section-title" className="sr-only">
          Indicadores Clave de Rendimiento (KPIs de Usabilidad)
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: tokens.spacing.md,
          }}
        >
          <KpiCard
            title="Total de Evaluaciones"
            value={summary.totalTests}
            unit="sesiones"
            icon={<Users size={22} />}
            trendText={summary.trends?.totalTestsDiff ? `+${summary.trends.totalTestsDiff}` : undefined}
            trendDirection="up"
            isPositive={true}
            subtext="acumulado del sprint"
            isoStandard="Alcance"
          />

          <KpiCard
            title="Tasa de Éxito"
            value={`${summary.successRate}%`}
            icon={<CheckCircle size={22} />}
            trendText={summary.trends?.successRateDiff ? `+${summary.trends.successRateDiff}%` : undefined}
            trendDirection="up"
            isPositive={summary.successRate >= 70}
            subtext="vs. semana anterior"
            isoStandard="Efectividad (ISO)"
          />

          <KpiCard
            title="Tiempo Promedio"
            value={summary.avgTime}
            unit="seg"
            icon={<Clock size={22} />}
            trendText={summary.trends?.avgTimeDiff ? `${summary.trends.avgTimeDiff}s` : undefined}
            trendDirection="down"
            isPositive={true} // Menos tiempo es mejor eficiencia
            subtext="eficiencia de tarea"
            isoStandard="Eficiencia (ISO)"
          />

          <KpiCard
            title="Satisfacción Promedio"
            value={summary.avgSatisfaction}
            unit="/ 5.0"
            icon={<Star size={22} />}
            trendText={summary.trends?.avgSatisfactionDiff ? `+${summary.trends.avgSatisfactionDiff}` : undefined}
            trendDirection="up"
            isPositive={summary.avgSatisfaction >= 3.5}
            subtext="escala Likert / estrellas"
            isoStandard="Satisfacción (ISO)"
          />
        </div>
      </section>

      {/* 2. SECCIÓN DE HALLAZGOS HEURÍSTICOS PRIORIZADOS (Nielsen 1-4) */}
      <section
        style={{
          backgroundColor: tokens.colors.white,
          borderRadius: tokens.radii.lg,
          border: `1px solid ${tokens.colors.gray200}`,
          padding: '24px',
          boxShadow: tokens.shadows.sm,
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: tokens.colors.gray900 }}>
              Matriz de Hallazgos Heurísticos Priorizados
            </h2>
            <p style={{ fontSize: '13px', color: tokens.colors.gray500, margin: '2px 0 0 0' }}>
              Inspección basada en las 10 Heurísticas de Jakob Nielsen y principios Gestalt
            </p>
          </div>

          {/* Filtros por Severidad */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12px', color: tokens.colors.gray600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Filter size={14} />
              <span>Filtrar:</span>
            </span>

            <Button
              size="sm"
              variant={selectedSeverity === 'all' ? 'primary' : 'secondary'}
              onClick={() => setSelectedSeverity('all')}
            >
              Todos ({findings.length})
            </Button>
            <Button
              size="sm"
              variant={selectedSeverity === 4 ? 'danger' : 'secondary'}
              onClick={() => setSelectedSeverity(4)}
            >
              Nivel 4 (Catastrófico)
            </Button>
            <Button
              size="sm"
              variant={selectedSeverity === 3 ? 'primary' : 'secondary'}
              onClick={() => setSelectedSeverity(3)}
            >
              Nivel 3 (Mayor)
            </Button>
            <Button
              size="sm"
              variant={selectedSeverity === 2 ? 'primary' : 'secondary'}
              onClick={() => setSelectedSeverity(2)}
            >
              Nivel 2 (Menor)
            </Button>
          </div>
        </div>

        {/* Lista de Hallazgos */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filteredFindings.length === 0 ? (
            <div
              style={{
                padding: '24px',
                textAlign: 'center',
                backgroundColor: tokens.colors.gray50,
                borderRadius: tokens.radii.md,
                color: tokens.colors.gray500,
                fontSize: '14px',
              }}
            >
              No hay hallazgos con la severidad seleccionada.
            </div>
          ) : (
            filteredFindings.map((finding) => (
              <FindingRow
                key={finding.id}
                finding={finding}
                onSendToAi={handleFindingToAi}
              />
            ))
          )}
        </div>
      </section>

      {/* 3. SECCIÓN OPERATIVA: Registro de Pruebas Realizadas */}
      <section
        style={{
          backgroundColor: tokens.colors.white,
          borderRadius: tokens.radii.lg,
          border: `1px solid ${tokens.colors.gray200}`,
          padding: '24px',
          boxShadow: tokens.shadows.sm,
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: tokens.colors.gray900 }}>
              Sesiones de Pruebas de Usabilidad Registradas
            </h2>
            <p style={{ fontSize: '13px', color: tokens.colors.gray500, margin: '2px 0 0 0' }}>
              Base de datos operacionalizada (ISO 9241-11) lista para sincronización con NestJS
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '0 12px',
                minHeight: '40px',
                borderRadius: tokens.radii.md,
                border: `1px solid ${tokens.colors.gray300}`,
                backgroundColor: tokens.colors.gray50,
              }}
            >
              <Search size={16} color={tokens.colors.gray400} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por evaluador, tarea..."
                style={{
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',
                  fontSize: '13px',
                  width: '180px',
                }}
              />
            </div>

            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus size={16} />}
              onClick={() => navigate('/register')}
            >
              Nueva Prueba
            </Button>
          </div>
        </div>

        {/* Tabla Responsiva con Semántica Accesible */}
        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '13px',
              textAlign: 'left',
            }}
          >
            <thead>
              <tr style={{ borderBottom: `2px solid ${tokens.colors.gray200}`, backgroundColor: tokens.colors.gray50 }}>
                <th style={{ padding: '12px 14px', fontWeight: 600, color: tokens.colors.gray700 }}>Evaluador</th>
                <th style={{ padding: '12px 14px', fontWeight: 600, color: tokens.colors.gray700 }}>Tarea Evaluada</th>
                <th style={{ padding: '12px 14px', fontWeight: 600, color: tokens.colors.gray700 }}>Eficiencia</th>
                <th style={{ padding: '12px 14px', fontWeight: 600, color: tokens.colors.gray700 }}>Errores</th>
                <th style={{ padding: '12px 14px', fontWeight: 600, color: tokens.colors.gray700 }}>Satisfacción</th>
                <th style={{ padding: '12px 14px', fontWeight: 600, color: tokens.colors.gray700 }}>Efectividad</th>
                <th style={{ padding: '12px 14px', fontWeight: 600, color: tokens.colors.gray700, textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredTests.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '32px', textAlign: 'center', color: tokens.colors.gray500 }}>
                    {searchQuery ? (
                      'No se encontraron pruebas con el término de búsqueda.'
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                        <FileCheck size={32} color={tokens.colors.gray400} />
                        <span>Aún no hay pruebas registradas. Haz clic en "Nueva Prueba" para comenzar.</span>
                      </div>
                    )}
                  </td>
                </tr>
              ) : (
                filteredTests.map((test) => (
                  <tr
                    key={test.id}
                    style={{
                      borderBottom: `1px solid ${tokens.colors.gray200}`,
                      transition: 'background-color 100ms ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = tokens.colors.gray50)}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <td style={{ padding: '12px 14px', fontWeight: 600, color: tokens.colors.gray900 }}>
                      {test.evaluatorName}
                    </td>
                    <td style={{ padding: '12px 14px', color: tokens.colors.gray800, maxWidth: '240px' }}>
                      <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {test.taskDescription}
                      </div>
                      {test.observations && (
                        <div style={{ fontSize: '11px', color: tokens.colors.gray500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          💬 {test.observations}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '12px 14px', color: tokens.colors.gray700 }}>
                      <strong>{test.timeOnTask}</strong> s
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span
                        style={{
                          color: test.errorsCount > 0 ? tokens.colors.danger : tokens.colors.success,
                          fontWeight: 600,
                        }}
                      >
                        {test.errorsCount}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 600, color: '#d97706' }}>
                        <Star size={14} fill="#f59e0b" stroke="#d97706" />
                        <span>{test.satisfactionScore}/5</span>
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <Badge variant={test.taskResult === 'success' ? 'success' : 'danger'} size="sm">
                        {test.taskResult === 'success' ? '✓ Éxito' : '✗ Fracaso'}
                      </Badge>
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <button
                          type="button"
                          onClick={() => handleSendToAi(test)}
                          title="Analizar observaciones en el Asistente IA"
                          style={{
                            padding: '6px 10px',
                            borderRadius: tokens.radii.sm,
                            backgroundColor: tokens.colors.primaryLight,
                            color: tokens.colors.primary,
                            border: '1px solid #bfdbfe',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <Sparkles size={13} />
                          <span>IA</span>
                        </button>

                        {onDeleteTest && (
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`¿Eliminar la prueba de ${test.evaluatorName}?`)) {
                                onDeleteTest(test.id);
                              }
                            }}
                            title="Eliminar prueba"
                            style={{
                              padding: '6px',
                              borderRadius: tokens.radii.sm,
                              backgroundColor: 'transparent',
                              color: tokens.colors.gray400,
                              border: 'none',
                              cursor: 'pointer',
                            }}
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
