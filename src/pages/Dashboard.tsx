import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Clock, FilterX, Sparkles, Star, Trash2, Users } from 'lucide-react';
import { KpiCard } from '../components/molecules/KpiCard/KpiCard';
import { BarList } from '../components/molecules/BarList/BarList';
import { ResultBadge } from '../components/molecules/ResultSelector/ResultSelector';
import { ErrorState, LoadingState, PageHeader } from '../components/molecules/PageState/PageState';
import { Button } from '../components/atoms/Button/Button';
import { Badge } from '../components/atoms/Badge/Badge';
import { TEST_DEPENDENTS, useApiMutation, useDashboard, useTests } from '../hooks/useApi';
import { api } from '../services/api';
import { tokens } from '../styles/tokens';
import { KPI_ACCENTS } from '../styles/theme';
import { AppVersion, FINDING_STATUS_LABELS, FindingStatus, SEVERITY_LABELS, Severity, TaskResult, VERSION_LABELS } from '../types';

const SEVERITY_COLORS: Record<Severity, string> = {
  1: tokens.colors.gray500,
  2: '#1d4ed8',
  3: '#b45309',
  4: '#b91c1c',
};

const trend = (diff: number | undefined, suffix: string, positiveWhenUp: boolean) => {
  if (!diff) return { trendText: `sin cambio`, trendDirection: 'neutral' as const, isPositive: true };
  const up = diff > 0;
  return {
    trendText: `${up ? '+' : ''}${diff}${suffix}`,
    trendDirection: up ? ('up' as const) : ('down' as const),
    isPositive: up === positiveWhenUp,
  };
};

/**
 * Página Dashboard (HU-02)
 * - Filtros en una sola fila sobre los gráficos (versión y rango de fechas).
 * - Continuidad (Gestalt): KPIs → problemas frecuentes → detalle de sesiones.
 * - Nielsen #6: tendencias visibles; Nielsen #1: estados de carga/error explícitos.
 */
export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [version, setVersion] = useState<'' | AppVersion>('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [resultFilter, setResultFilter] = useState<'' | TaskResult>('');

  const filters = { appVersion: version || undefined, from: from || undefined, to: to || undefined };
  const dashboard = useDashboard(filters);
  const tests = useTests({ appVersion: version || undefined });
  const deleteTest = useApiMutation((id: string) => api.deleteTest(id), {
    invalidate: TEST_DEPENDENTS,
    success: 'Sesión eliminada',
  });

  const visibleTests = useMemo(() => {
    return (tests.data ?? []).filter((t) => {
      const day = t.createdAt.slice(0, 10);
      if (from && day < from) return false;
      if (to && day > to) return false;
      if (resultFilter && t.taskResult !== resultFilter) return false;
      return true;
    });
  }, [tests.data, from, to, resultFilter]);

  if (dashboard.isLoading) return <LoadingState text="Calculando indicadores de usabilidad…" />;
  if (dashboard.isError) return <ErrorState error={dashboard.error} onRetry={() => dashboard.refetch()} />;
  const s = dashboard.data!;
  const hasFilters = Boolean(version || from || to || resultFilter);

  const analyzeSelection = (ids: string[]) => navigate('/ai-assistant', { state: { testIds: ids } });
  const problemIds = visibleTests.filter((t) => t.taskResult !== 'success').map((t) => t.id);

  return (
    <div className="page">
      <PageHeader
        module="dashboard"
        title="Dashboard de usabilidad"
        description="Efectividad, eficiencia y satisfacción de todas las sesiones."
        actions={
          <Button
            leftIcon={<Sparkles size={16} />}
            disabled={!problemIds.length}
            onClick={() => analyzeSelection(problemIds)}
            title="Envía las sesiones con fracaso o ayuda al Asistente IA"
          >
            Analizar sesiones con problemas ({problemIds.length})
          </Button>
        }
      />

      {/* Filtros: una sola fila sobre los gráficos */}
      <section className="card" aria-label="Filtros del dashboard" style={{ padding: 14 }}>
        <div className="row" style={{ alignItems: 'flex-end' }}>
          <div className="field" style={{ width: 190 }}>
            <label htmlFor="f-version">Versión evaluada</label>
            <select id="f-version" className="control" value={version} onChange={(e) => setVersion(e.target.value as AppVersion | '')}>
              <option value="">Todas</option>
              <option value="v1">{VERSION_LABELS.v1}</option>
              <option value="v2">{VERSION_LABELS.v2}</option>
            </select>
          </div>
          <div className="field" style={{ width: 170 }}>
            <label htmlFor="f-from">Desde</label>
            <input id="f-from" type="date" className="control" value={from} max={to || undefined} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div className="field" style={{ width: 170 }}>
            <label htmlFor="f-to">Hasta</label>
            <input id="f-to" type="date" className="control" value={to} min={from || undefined} onChange={(e) => setTo(e.target.value)} />
          </div>
          <div className="field" style={{ width: 170 }}>
            <label htmlFor="f-result">Resultado (tabla)</label>
            <select id="f-result" className="control" value={resultFilter} onChange={(e) => setResultFilter(e.target.value as TaskResult | '')}>
              <option value="">Todos</option>
              <option value="success">Éxito</option>
              <option value="assisted">Con ayuda</option>
              <option value="failure">Fracaso</option>
            </select>
          </div>
          {hasFilters && (
            <Button
              variant="ghost"
              leftIcon={<FilterX size={16} />}
              onClick={() => {
                setVersion('');
                setFrom('');
                setTo('');
                setResultFilter('');
              }}
            >
              Limpiar filtros
            </Button>
          )}
        </div>
      </section>

      {s.totalTests === 0 ? (
        <div className="card empty">
          No hay sesiones para los filtros seleccionados.{' '}
          <Button variant="secondary" size="sm" onClick={() => navigate('/register')}>
            Registrar una prueba
          </Button>
        </div>
      ) : (
        <>
          <section className="grid grid-4" aria-label="Indicadores clave">
            <KpiCard
              title="Sesiones registradas"
              value={s.totalTests}
              unit="sesiones"
              icon={<Users size={20} />}
              isoStandard="Alcance"
              accent={KPI_ACCENTS.scope}
              {...trend(s.trends.totalTestsDiff, '', true)}
            />
            <KpiCard
              title="Tasa de éxito sin ayuda"
              value={`${s.successRate}%`}
              icon={<CheckCircle2 size={20} />}
              isoStandard="Efectividad"
              accent={KPI_ACCENTS.effectiveness}
              subtext={`${s.assistedRate}% con ayuda · ${s.failureRate}% fracaso`}
              {...trend(s.trends.successRateDiff, ' pts', true)}
            />
            <KpiCard
              title="Tiempo promedio en tarea"
              value={s.avgTime}
              unit="seg"
              icon={<Clock size={20} />}
              isoStandard="Eficiencia"
              accent={KPI_ACCENTS.efficiency}
              subtext={`${s.avgErrors} errores promedio`}
              {...trend(s.trends.avgTimeDiff, ' s', false)}
            />
            <KpiCard
              title="Satisfacción promedio"
              value={s.avgSatisfaction}
              unit="/ 5"
              icon={<Star size={20} />}
              isoStandard="Satisfacción"
              accent={KPI_ACCENTS.satisfaction}
              {...trend(s.trends.avgSatisfactionDiff, '', true)}
            />
          </section>

          <section className="grid grid-2">
            <div className="card">
              <div className="card-header">
                <div>
                  <h2 className="card-title">Tareas con mayor dificultad</h2>
                  <p className="card-subtitle">Ordenadas de menor a mayor tasa de éxito</p>
                </div>
              </div>
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th scope="col">Tarea</th>
                      <th scope="col" className="num">Ses.</th>
                      <th scope="col" className="num">Éxito</th>
                      <th scope="col" className="num">Tiempo</th>
                      <th scope="col" className="num">Errores</th>
                      <th scope="col" className="num">Satisf.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {s.tasks.slice(0, 7).map((t) => (
                      <tr key={t.task}>
                        <td>{t.task}</td>
                        <td className="num">{t.sessions}</td>
                        <td className="num" style={{ color: t.successRate < 70 ? tokens.colors.danger : undefined, fontWeight: 600 }}>
                          {t.successRate}%
                        </td>
                        <td className="num">{t.avgTime} s</td>
                        <td className="num">{t.avgErrors}</td>
                        <td className="num">{t.avgSatisfaction}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="stack">
              <div className="card">
                <div className="card-header">
                  <div>
                    <h2 className="card-title">Problemas por categoría UX</h2>
                    <p className="card-subtitle">Hallazgos registrados en la matriz</p>
                  </div>
                  <Button variant="secondary" size="sm" onClick={() => navigate('/findings')}>
                    Ver hallazgos
                  </Button>
                </div>
                <BarList
                  ariaLabel="Número de hallazgos por categoría"
                  items={s.findingsByCategory.map((c) => ({ label: c.category, value: c.count }))}
                  emptyText="Aún no hay hallazgos registrados"
                />
              </div>

              <div className="card">
                <h2 className="card-title" style={{ marginBottom: 12 }}>
                  Severidad y estado de los hallazgos
                </h2>
                <BarList
                  ariaLabel="Hallazgos por severidad"
                  items={([4, 3, 2, 1] as Severity[]).map((sev) => ({
                    label: `${sev} · ${SEVERITY_LABELS[sev]}`,
                    value: s.findingsBySeverity[String(sev)] ?? 0,
                    color: SEVERITY_COLORS[sev],
                  }))}
                />
                <div className="row" style={{ marginTop: 12 }}>
                  {(Object.keys(FINDING_STATUS_LABELS) as FindingStatus[]).map((st) => (
                    <Badge key={st} variant={st === 'resuelto' ? 'success' : st === 'en_backlog' ? 'info' : 'warning'}>
                      {FINDING_STATUS_LABELS[st]}: {s.findingsByStatus[st] ?? 0}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      <section className="card" aria-labelledby="sessions-title">
        <div className="card-header">
          <div>
            <h2 id="sessions-title" className="card-title">
              Sesiones registradas
            </h2>
            <p className="card-subtitle">{visibleTests.length} sesión(es) con los filtros actuales</p>
          </div>
          <Button variant="secondary" size="sm" onClick={() => navigate('/register')}>
            Registrar prueba
          </Button>
        </div>
        {tests.isLoading ? (
          <LoadingState />
        ) : visibleTests.length === 0 ? (
          <p className="empty">No hay sesiones con estos filtros.</p>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th scope="col">Fecha</th>
                  <th scope="col">Participante</th>
                  <th scope="col">Tarea</th>
                  <th scope="col">Versión</th>
                  <th scope="col">Resultado</th>
                  <th scope="col" className="num">Tiempo</th>
                  <th scope="col" className="num">Errores</th>
                  <th scope="col" className="num">Satisf.</th>
                  <th scope="col">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {visibleTests.map((t) => (
                  <tr key={t.id}>
                    <td style={{ whiteSpace: 'nowrap' }}>{new Date(t.createdAt).toLocaleDateString('es-EC')}</td>
                    <td>
                      {t.evaluatorName}
                      {t.participantProfile && <div className="muted">{t.participantProfile}</div>}
                    </td>
                    <td style={{ minWidth: 220 }}>
                      {t.taskCode && <strong>{t.taskCode} · </strong>}
                      {t.taskDescription}
                      {t.observations && (
                        <div className="muted" style={{ marginTop: 4 }}>
                          “{t.observations.length > 110 ? `${t.observations.slice(0, 110)}…` : t.observations}”
                        </div>
                      )}
                    </td>
                    <td>
                      <Badge variant={t.appVersion === 'v2' ? 'info' : 'default'} size="sm">
                        {t.appVersion}
                      </Badge>
                    </td>
                    <td>
                      <ResultBadge value={t.taskResult} />
                    </td>
                    <td className="num">{t.timeOnTask} s</td>
                    <td className="num">{t.errorsCount}</td>
                    <td className="num">{t.satisfactionScore}/5</td>
                    <td>
                      <div className="row" style={{ gap: 6, flexWrap: 'nowrap' }}>
                        <button
                          type="button"
                          className="icon-btn"
                          onClick={() => analyzeSelection([t.id])}
                          aria-label={`Analizar con IA la sesión de ${t.evaluatorName}`}
                          title="Analizar con IA"
                        >
                          <Sparkles size={16} />
                        </button>
                        <button
                          type="button"
                          className="icon-btn"
                          onClick={() => {
                            if (confirm(`¿Eliminar la sesión de ${t.evaluatorName}? Esta acción no se puede deshacer.`)) deleteTest.mutate(t.id);
                          }}
                          aria-label={`Eliminar la sesión de ${t.evaluatorName}`}
                          title="Eliminar"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};
