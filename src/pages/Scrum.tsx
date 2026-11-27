import React, { useEffect, useState } from 'react';
import { CalendarDays, ClipboardCheck, KanbanSquare, ListOrdered, MessagesSquare, Plus, Trash2, Users } from 'lucide-react';
import { Button } from '../components/atoms/Button/Button';
import { Modal } from '../components/molecules/Modal/Modal';
import { ErrorState, LoadingState, PageHeader } from '../components/molecules/PageState/PageState';
import { ProductBacklog } from '../components/organisms/Scrum/ProductBacklog';
import { SprintPlanning } from '../components/organisms/Scrum/SprintPlanning';
import { SprintBoard } from '../components/organisms/Scrum/SprintBoard';
import { DailyLogPanel } from '../components/organisms/Scrum/DailyLogPanel';
import { ReviewRetro } from '../components/organisms/Scrum/ReviewRetro';
import { TeamPanel } from '../components/organisms/Scrum/TeamPanel';
import { SCRUM_DEPENDENTS, useApiMutation, useMembers, useSprints } from '../hooks/useApi';
import { api } from '../services/api';
import { Sprint, SprintInput, SprintStatus } from '../types';

type Tab = 'backlog' | 'planning' | 'board' | 'daily' | 'review' | 'team';

const TABS: { id: Tab; label: string; icon: React.ReactNode; needsSprint: boolean }[] = [
  { id: 'backlog', label: 'Product Backlog', icon: <ListOrdered size={16} />, needsSprint: false },
  { id: 'planning', label: 'Sprint Planning', icon: <CalendarDays size={16} />, needsSprint: true },
  { id: 'board', label: 'Tablero', icon: <KanbanSquare size={16} />, needsSprint: true },
  { id: 'daily', label: 'Daily', icon: <MessagesSquare size={16} />, needsSprint: true },
  { id: 'review', label: 'Review y Retro', icon: <ClipboardCheck size={16} />, needsSprint: true },
  { id: 'team', label: 'Equipo', icon: <Users size={16} />, needsSprint: false },
];

const SprintForm: React.FC<{ value: SprintInput; onChange: (v: SprintInput) => void; errors: Record<string, string>; members: string[] }> = ({ value, onChange, errors, members }) => {
  const set = <K extends keyof SprintInput>(k: K, v: SprintInput[K]) => onChange({ ...value, [k]: v });
  return (
    <div className="stack">
      <div className="grid grid-3">
        <div className="field">
          <label htmlFor="sp-n">Número</label>
          <input id="sp-n" type="number" min={1} className="control" value={value.number ?? 1} onChange={(e) => set('number', Math.max(1, parseInt(e.target.value, 10) || 1))} />
        </div>
        <div className="field">
          <label htmlFor="sp-w">Semanas</label>
          <input id="sp-w" className="control" value={value.weeksLabel ?? ''} placeholder="Ej. Sem. 14–15" onChange={(e) => set('weeksLabel', e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="sp-st">Estado</label>
          <select id="sp-st" className="control" value={value.status} onChange={(e) => set('status', e.target.value as SprintStatus)}>
            <option value="planificado">Planificado</option>
            <option value="activo">Activo</option>
            <option value="cerrado">Cerrado</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="sp-s">Inicio</label>
          <input id="sp-s" type="date" className="control" value={value.startDate ?? ''} onChange={(e) => set('startDate', e.target.value)} aria-invalid={Boolean(errors.startDate)} />
        </div>
        <div className="field">
          <label htmlFor="sp-e">Fin</label>
          <input id="sp-e" type="date" className="control" value={value.endDate ?? ''} min={value.startDate} onChange={(e) => set('endDate', e.target.value)} aria-invalid={Boolean(errors.endDate)} />
          {errors.endDate && <span className="field-error">{errors.endDate}</span>}
        </div>
      </div>
      <div className="field">
        <label htmlFor="sp-g">
          Objetivo del sprint<span className="req">*</span>
        </label>
        <textarea id="sp-g" className="control" rows={2} value={value.goal ?? ''} onChange={(e) => set('goal', e.target.value)} aria-invalid={Boolean(errors.goal)} />
        {errors.goal && <span className="field-error">{errors.goal}</span>}
      </div>
      <div className="field">
        <label htmlFor="sp-d">Entregables clave</label>
        <textarea id="sp-d" className="control" rows={2} value={value.deliverables ?? ''} onChange={(e) => set('deliverables', e.target.value)} />
      </div>
      <div className="grid grid-2">
        <div className="field">
          <label htmlFor="sp-po">Product Owner</label>
          <input id="sp-po" className="control" list="sp-members" value={value.productOwner ?? ''} onChange={(e) => set('productOwner', e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="sp-sm">Scrum Master</label>
          <input id="sp-sm" className="control" list="sp-members" value={value.scrumMaster ?? ''} onChange={(e) => set('scrumMaster', e.target.value)} />
        </div>
        <datalist id="sp-members">
          {members.map((m) => (
            <option key={m} value={m} />
          ))}
        </datalist>
      </div>
    </div>
  );
};

/**
 * Página Módulo SCRUM (HU-06, HU-07, HU-08)
 * Backlog → Sprint Planning → Tablero → Daily → Review/Retro, con el sprint seleccionado
 * persistente entre sub-pestañas (reconocimiento antes que recuerdo).
 */
export const ScrumPage: React.FC = () => {
  const sprints = useSprints();
  const members = useMembers();
  const [tab, setTab] = useState<Tab>(() => {
    try {
      return (sessionStorage.getItem('scrum-tab') as Tab) || 'board';
    } catch {
      return 'board';
    }
  });
  const [sprintId, setSprintId] = useState('');
  const [editing, setEditing] = useState<{ id?: string; value: SprintInput } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    try {
      sessionStorage.setItem('scrum-tab', tab);
    } catch {
      /* almacenamiento no disponible */
    }
  }, [tab]);

  useEffect(() => {
    if (!sprints.data?.length) return;
    if (!sprintId || !sprints.data.some((s) => s.id === sprintId)) {
      setSprintId((sprints.data.find((s) => s.status === 'activo') ?? sprints.data[sprints.data.length - 1]).id);
    }
  }, [sprints.data, sprintId]);

  const save = useApiMutation(({ id, value }: { id?: string; value: SprintInput }) => (id ? api.updateSprint(id, value) : api.createSprint(value)), {
    invalidate: SCRUM_DEPENDENTS,
    success: (s, v) => (v.id ? `Sprint ${s.number} actualizado` : `Sprint ${s.number} creado`),
  });
  const remove = useApiMutation((id: string) => api.deleteSprint(id), { invalidate: SCRUM_DEPENDENTS, success: 'Sprint eliminado; sus historias volvieron al backlog' });

  const sprint = sprints.data?.find((s) => s.id === sprintId);
  const current = TABS.find((t) => t.id === tab)!;

  const openNew = () => {
    const last = sprints.data?.[sprints.data.length - 1];
    const start = last ? new Date(new Date(`${last.endDate}T00:00:00`).getTime() + 86400000).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10);
    const end = new Date(new Date(`${start}T00:00:00`).getTime() + 13 * 86400000).toISOString().slice(0, 10);
    setErrors({});
    setEditing({
      value: { number: (last?.number ?? 0) + 1, goal: '', startDate: start, endDate: end, status: 'planificado', scrumMaster: last?.scrumMaster ?? '', productOwner: last?.productOwner ?? '' },
    });
  };

  const submit = () => {
    if (!editing) return;
    const e: Record<string, string> = {};
    if (!editing.value.goal?.trim()) e.goal = 'Define el objetivo del sprint';
    if (!editing.value.startDate || !editing.value.endDate) e.endDate = 'Indica las fechas de inicio y fin';
    else if (editing.value.endDate < editing.value.startDate) e.endDate = 'La fecha de fin debe ser posterior al inicio';
    setErrors(e);
    if (Object.keys(e).length) return;
    const { id: _i, ...value } = editing.value as Sprint;
    save.mutate(
      { id: editing.id, value: Object.fromEntries(Object.entries(value).map(([k, v]) => [k, v === null ? undefined : v])) as SprintInput },
      {
        onSuccess: (s) => {
          setEditing(null);
          setSprintId(s.id);
        },
      },
    );
  };

  if (sprints.isLoading) return <LoadingState />;
  if (sprints.isError) return <ErrorState error={sprints.error} onRetry={() => sprints.refetch()} />;

  return (
    <div className="page">
      <PageHeader
        module="scrum"
        title="Planificación ágil SCRUM"
        description="Backlog, sprints, tablero y retrospectivas del equipo."
      />

      <div className="card row-between" style={{ padding: 12 }}>
        <div className="segmented" role="tablist" aria-label="Secciones SCRUM">
          {TABS.map((t) => (
            <button key={t.id} type="button" role="tab" aria-selected={tab === t.id} id={`scrum-tab-${t.id}`} aria-controls="scrum-panel" onClick={() => setTab(t.id)}>
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>
        {current.needsSprint && (
          <div className="row" style={{ gap: 8 }}>
            <label htmlFor="sprint-select" className="strong small">
              Sprint
            </label>
            <select id="sprint-select" className="control control-sm" style={{ width: 210 }} value={sprintId} onChange={(e) => setSprintId(e.target.value)}>
              {sprints.data?.map((s) => (
                <option key={s.id} value={s.id}>
                  Sprint {s.number} · {s.status}
                </option>
              ))}
            </select>
            <Button size="sm" variant="secondary" leftIcon={<Plus size={14} />} onClick={openNew}>
              Nuevo sprint
            </Button>
            {sprint && (
              <button
                type="button"
                className="icon-btn"
                aria-label={`Eliminar sprint ${sprint.number}`}
                title="Eliminar sprint"
                onClick={() => confirm(`¿Eliminar el Sprint ${sprint.number}? Se borrarán sus tareas y registros diarios.`) && remove.mutate(sprint.id)}
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        )}
      </div>

      <div id="scrum-panel" role="tabpanel" aria-labelledby={`scrum-tab-${tab}`}>
        {current.needsSprint && !sprint ? (
          <div className="card empty stack" style={{ alignItems: 'center' }}>
            <p>No hay sprints creados todavía.</p>
            <Button leftIcon={<Plus size={16} />} onClick={openNew}>
              Crear el primer sprint
            </Button>
          </div>
        ) : (
          <>
            {tab === 'backlog' && <ProductBacklog />}
            {tab === 'planning' && sprint && (
              <SprintPlanning
                sprint={sprint}
                onEditSprint={() => {
                  setErrors({});
                  setEditing({ id: sprint.id, value: { ...sprint } });
                }}
              />
            )}
            {tab === 'board' && sprint && <SprintBoard sprint={sprint} />}
            {tab === 'daily' && sprint && <DailyLogPanel sprint={sprint} />}
            {tab === 'review' && sprint && <ReviewRetro sprint={sprint} />}
            {tab === 'team' && <TeamPanel />}
          </>
        )}
      </div>

      <Modal
        open={Boolean(editing)}
        title={editing?.id ? `Editar sprint ${editing.value.number}` : 'Nuevo sprint'}
        onClose={() => setEditing(null)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditing(null)}>
              Cancelar
            </Button>
            <Button onClick={submit} isLoading={save.isPending}>
              Guardar sprint
            </Button>
          </>
        }
      >
        {editing && <SprintForm value={editing.value} onChange={(value) => setEditing({ ...editing, value })} errors={errors} members={(members.data ?? []).map((m) => m.name)} />}
      </Modal>
    </div>
  );
};
