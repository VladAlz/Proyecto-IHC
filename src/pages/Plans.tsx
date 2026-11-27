import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, ClipboardList, Pencil, PlayCircle, Plus, Sparkles, Trash2 } from 'lucide-react';
import { Button } from '../components/atoms/Button/Button';
import { Badge } from '../components/atoms/Badge/Badge';
import { ErrorState, LoadingState, PageHeader } from '../components/molecules/PageState/PageState';
import { PlanWizard, emptyPlan, planToInput } from '../components/organisms/PlanWizard/PlanWizard';
import { PlanExecution } from '../components/organisms/PlanExecution/PlanExecution';
import { TEST_DEPENDENTS, keys, useApiMutation, usePlanResults, usePlans } from '../hooks/useApi';
import { api } from '../services/api';
import { CreateTestDto, PlanInput, PlanStatus, TestPlan, VERSION_LABELS } from '../types';
import { tokens } from '../styles/tokens';

const STATUS: Record<PlanStatus, { label: string; variant: 'default' | 'info' | 'warning' | 'success' }> = {
  borrador: { label: 'Borrador', variant: 'default' },
  listo: { label: 'Listo para ejecutar', variant: 'info' },
  en_ejecucion: { label: 'En ejecución', variant: 'warning' },
  cerrado: { label: 'Cerrado', variant: 'success' },
};

type View = { mode: 'list' } | { mode: 'edit'; plan?: TestPlan } | { mode: 'execute'; plan: TestPlan } | { mode: 'results'; plan: TestPlan };

const PlanResultsView: React.FC<{ plan: TestPlan; onBack: () => void; onExecute: () => void }> = ({ plan, onBack, onExecute }) => {
  const navigate = useNavigate();
  const results = usePlanResults(plan.id);
  const close = useApiMutation((status: PlanStatus) => api.updatePlan(plan.id, { status }), {
    invalidate: [keys.plans],
    success: 'Estado del plan actualizado',
  });

  if (results.isLoading) return <LoadingState />;
  if (results.isError) return <ErrorState error={results.error} onRetry={() => results.refetch()} />;
  const r = results.data!;

  return (
    <div className="stack">
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Resultados por tarea</h2>
            <p className="card-subtitle">
              {r.participants} participante(s) · {VERSION_LABELS[plan.appVersion]}
            </p>
          </div>
          <div className="row">
            <Button variant="secondary" leftIcon={<PlayCircle size={16} />} onClick={onExecute}>
              Registrar otro participante
            </Button>
            <Button leftIcon={<Sparkles size={16} />} disabled={!r.participants} onClick={() => navigate('/ai-assistant', { state: { planId: plan.id } })}>
              Analizar plan con IA
            </Button>
          </div>
        </div>
        {r.participants === 0 ? (
          <p className="empty">Aún no hay sesiones registradas para este plan.</p>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tarea</th>
                  <th className="num">Sesiones</th>
                  <th className="num">Éxito</th>
                  <th className="num">Con ayuda</th>
                  <th className="num">Tiempo prom.</th>
                  <th className="num">Errores prom.</th>
                  <th className="num">Satisf.</th>
                </tr>
              </thead>
              <tbody>
                {r.tasks.map((t) => {
                  const target = plan.tasks.find((pt) => pt.code === t.code)?.maxTimeSeconds;
                  return (
                    <tr key={t.code}>
                      <td className="strong">{t.code}</td>
                      <td>{t.scenario}</td>
                      <td className="num">{t.sessions}</td>
                      <td className="num" style={{ color: t.sessions && t.successRate < 70 ? tokens.colors.danger : undefined, fontWeight: 600 }}>
                        {t.sessions ? `${t.successRate}%` : '—'}
                      </td>
                      <td className="num">{t.sessions ? `${t.assistedRate}%` : '—'}</td>
                      <td className="num" style={{ color: target && t.avgTime > target ? tokens.colors.danger : undefined }}>
                        {t.sessions ? `${t.avgTime} s` : '—'}
                        {target ? <div className="muted">obj. {target} s</div> : null}
                      </td>
                      <td className="num">{t.sessions ? t.avgErrors : '—'}</td>
                      <td className="num">{t.sessions ? t.avgSatisfaction : '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <div className="row-between">
        <Button variant="ghost" onClick={onBack}>
          Volver a planes
        </Button>
        {plan.status !== 'cerrado' ? (
          <Button variant="secondary" isLoading={close.isPending} onClick={() => close.mutate('cerrado', { onSuccess: onBack })}>
            Cerrar plan
          </Button>
        ) : (
          <Button variant="secondary" isLoading={close.isPending} onClick={() => close.mutate('en_ejecucion', { onSuccess: onBack })}>
            Reabrir plan
          </Button>
        )}
      </div>
    </div>
  );
};

/**
 * Página Planes de prueba
 * Wizard en dos fases (guía del docente): configuración → ejecución, reemplazando la matriz estática de Excel.
 */
export const PlansPage: React.FC = () => {
  const [view, setView] = useState<View>({ mode: 'list' });
  const plans = usePlans();

  const save = useApiMutation(
    ({ id, data }: { id?: string; data: PlanInput }) => (id ? api.updatePlan(id, data) : api.createPlan(data)),
    { invalidate: [keys.plans], success: (_r, v) => (v.id ? 'Plan actualizado' : 'Plan creado') },
  );
  const remove = useApiMutation((id: string) => api.deletePlan(id), { invalidate: [keys.plans], success: 'Plan eliminado' });
  const saveSessions = useApiMutation(
    async ({ plan, rows }: { plan: TestPlan; rows: CreateTestDto[] }) => {
      const saved = await api.createTestsBulk(rows);
      if (plan.status === 'listo' || plan.status === 'borrador') await api.updatePlan(plan.id, { status: 'en_ejecucion' });
      return saved;
    },
    { invalidate: TEST_DEPENDENTS, success: (r) => `Se guardaron ${r.length} observación(es) del participante` },
  );

  const titles: Record<View['mode'], string> = {
    list: 'Planes de prueba',
    edit: 'Configurar plan de prueba',
    execute: 'Ejecutar plan de prueba',
    results: 'Resultados del plan',
  };

  return (
    <div className="page">
      <PageHeader
        module="plans"
        title={titles[view.mode]}
        description={
          view.mode === 'list'
            ? 'Configura el plan y ejecútalo con cada participante.'
            : 'plan' in view && view.plan
              ? `${view.plan.product} · ${view.plan.module}`
              : 'Completa los pasos del asistente'
        }
        actions={
          view.mode === 'list' && (
            <Button leftIcon={<Plus size={16} />} onClick={() => setView({ mode: 'edit' })}>
              Nuevo plan
            </Button>
          )
        }
      />

      {view.mode === 'edit' && (
        <PlanWizard
          initial={view.plan ? planToInput(view.plan) : emptyPlan()}
          isSaving={save.isPending}
          onCancel={() => setView({ mode: 'list' })}
          onSave={(data) => save.mutate({ id: view.plan?.id, data }, { onSuccess: () => setView({ mode: 'list' }) })}
        />
      )}

      {view.mode === 'execute' && (
        <PlanExecution
          plan={view.plan}
          isSaving={saveSessions.isPending}
          onCancel={() => setView({ mode: 'list' })}
          onSave={(rows) => saveSessions.mutateAsync({ plan: view.plan, rows })}
        />
      )}

      {view.mode === 'results' && (
        <PlanResultsView plan={view.plan} onBack={() => setView({ mode: 'list' })} onExecute={() => setView({ mode: 'execute', plan: view.plan })} />
      )}

      {view.mode === 'list' &&
        (plans.isLoading ? (
          <LoadingState />
        ) : plans.isError ? (
          <ErrorState error={plans.error} onRetry={() => plans.refetch()} />
        ) : !plans.data?.length ? (
          <div className="card empty stack" style={{ alignItems: 'center' }}>
            <ClipboardList size={36} aria-hidden="true" />
            <p>Todavía no hay planes. Crea el primero para guiar tus sesiones de usabilidad.</p>
            <Button leftIcon={<Plus size={16} />} onClick={() => setView({ mode: 'edit' })}>
              Nuevo plan
            </Button>
          </div>
        ) : (
          <div className="grid grid-2">
            {plans.data.map((plan) => (
              <article key={plan.id} className="card stack">
                <div className="row-between" style={{ alignItems: 'flex-start' }}>
                  <div>
                    <h2 className="card-title">{plan.module}</h2>
                    <p className="card-subtitle">
                      {plan.product} · {VERSION_LABELS[plan.appVersion]} · {plan.date || 'sin fecha'}
                    </p>
                  </div>
                  <Badge variant={STATUS[plan.status].variant}>{STATUS[plan.status].label}</Badge>
                </div>
                <p className="small">{plan.objective}</p>
                <div className="row" style={{ gap: 6 }}>
                  {plan.tasks.map((t) => (
                    <Badge key={t.code} size="sm" variant="default">
                      {t.code}
                    </Badge>
                  ))}
                  <span className="muted">
                    {plan.tasks.length} tarea(s) · Moderador: {plan.moderator || '—'}
                  </span>
                </div>
                <div className="row" style={{ marginTop: 'auto' }}>
                  <Button size="sm" leftIcon={<PlayCircle size={14} />} disabled={plan.status === 'cerrado'} onClick={() => setView({ mode: 'execute', plan })}>
                    Ejecutar
                  </Button>
                  <Button size="sm" variant="secondary" leftIcon={<BarChart3 size={14} />} onClick={() => setView({ mode: 'results', plan })}>
                    Resultados
                  </Button>
                  <Button size="sm" variant="ghost" leftIcon={<Pencil size={14} />} onClick={() => setView({ mode: 'edit', plan })}>
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    leftIcon={<Trash2 size={14} />}
                    aria-label={`Eliminar plan ${plan.module}`}
                    onClick={() => {
                      if (confirm('¿Eliminar este plan? Las sesiones ya registradas se conservan en el dashboard.')) remove.mutate(plan.id);
                    }}
                  >
                    Eliminar
                  </Button>
                </div>
              </article>
            ))}
          </div>
        ))}
    </div>
  );
};
