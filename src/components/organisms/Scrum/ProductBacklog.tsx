import React, { useMemo, useState } from 'react';
import { FileSpreadsheet, Pencil, Plus, Trash2 } from 'lucide-react';
import { Button } from '../../atoms/Button/Button';
import { Badge } from '../../atoms/Badge/Badge';
import { Modal } from '../../molecules/Modal/Modal';
import { LoadingState } from '../../molecules/PageState/PageState';
import { SCRUM_DEPENDENTS, useApiMutation, useSprints, useStories } from '../../../hooks/useApi';
import { api } from '../../../services/api';
import { downloadText, toCsv } from '../../../utils/report';
import { Priority, StoryInput, StoryStatus, UserStory } from '../../../types';

const MODULES = ['Eval.', 'Dash.', 'IA', 'SCRUM', 'UI'];
const STATUS_LABEL: Record<StoryStatus, string> = { backlog: 'En backlog', sprint: 'En sprint', hecha: 'Hecha' };
const SOURCE_LABEL = { manual: 'Manual', ia: 'IA', hallazgo: 'Hallazgo' } as const;

const EMPTY: StoryInput = {
  title: '',
  acceptanceCriteria: '',
  priority: 'Media',
  module: 'UI',
  businessValue: 5,
  storyPoints: 3,
  status: 'backlog',
  sprintId: null,
};

const ratio = (s: Pick<UserStory, 'businessValue' | 'storyPoints'>) => Math.round((s.businessValue / Math.max(1, s.storyPoints)) * 100) / 100;

/**
 * Product Backlog (HU-06) — hoja "Backlog" de la matriz de planificación:
 * Business Value, Story Points y Cociente de Decisión (BV/SP) para ordenar la prioridad.
 */
export const ProductBacklog: React.FC = () => {
  const stories = useStories();
  const sprints = useSprints();
  const [status, setStatus] = useState('');
  const [module, setModule] = useState('');
  const [editing, setEditing] = useState<{ id?: string; value: StoryInput } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const save = useApiMutation(({ id, value }: { id?: string; value: StoryInput }) => (id ? api.updateStory(id, value) : api.createStory(value)), {
    invalidate: SCRUM_DEPENDENTS,
    success: (s, v) => (v.id ? `Historia ${s.code} actualizada` : `Historia ${s.code} agregada al backlog`),
  });
  const assign = useApiMutation(({ id, sprintId }: { id: string; sprintId: string | null }) => api.updateStory(id, { sprintId }), {
    invalidate: SCRUM_DEPENDENTS,
    success: (s) => (s.sprintId ? `${s.code} asignada al sprint` : `${s.code} devuelta al backlog`),
  });
  const remove = useApiMutation((id: string) => api.deleteStory(id), { invalidate: SCRUM_DEPENDENTS, success: 'Historia eliminada' });

  const rows = useMemo(
    () => (stories.data ?? []).filter((s) => (!status || s.status === status) && (!module || s.module === module)),
    [stories.data, status, module],
  );
  const sprintLabel = (id?: string | null) => {
    const s = sprints.data?.find((x) => x.id === id);
    return s ? `Sprint ${s.number}` : '—';
  };

  const submit = () => {
    if (!editing) return;
    const e: Record<string, string> = {};
    if ((editing.value.title ?? '').trim().length < 10) e.title = 'Escribe la historia completa (Como…, quiero…, para…)';
    if (!(editing.value.acceptanceCriteria ?? '').trim()) e.acceptanceCriteria = 'Define un criterio de aceptación verificable';
    setErrors(e);
    if (Object.keys(e).length) return;
    save.mutate(editing, { onSuccess: () => setEditing(null) });
  };

  const exportCsv = () => {
    const data = stories.data ?? [];
    downloadText(
      'product-backlog.csv',
      toCsv([
        ['#', 'HU', 'Nombre del requisito', 'Criterio de aceptación', 'Prioridad', 'Módulo', 'Business Value', 'Story Point', 'Cociente de Decisión', 'Sprint', 'Estado'],
        ...data.map((s, i) => [i + 1, s.code, s.title, s.acceptanceCriteria, s.priority, s.module, s.businessValue, s.storyPoints, ratio(s), sprintLabel(s.sprintId), STATUS_LABEL[s.status]]),
      ]),
      'text/csv;charset=utf-8',
    );
  };

  if (stories.isLoading) return <LoadingState />;

  const set = <K extends keyof StoryInput>(k: K, v: StoryInput[K]) => editing && setEditing({ ...editing, value: { ...editing.value, [k]: v } });

  return (
    <div className="stack">
      <div className="row-between">
        <div className="row" style={{ alignItems: 'flex-end' }}>
          <div className="field" style={{ width: 170 }}>
            <label htmlFor="bl-status">Estado</label>
            <select id="bl-status" className="control control-sm" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">Todos</option>
              {(Object.keys(STATUS_LABEL) as StoryStatus[]).map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABEL[s]}
                </option>
              ))}
            </select>
          </div>
          <div className="field" style={{ width: 150 }}>
            <label htmlFor="bl-mod">Módulo</label>
            <select id="bl-mod" className="control control-sm" value={module} onChange={(e) => setModule(e.target.value)}>
              <option value="">Todos</option>
              {MODULES.map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="row">
          <Button variant="secondary" size="sm" leftIcon={<FileSpreadsheet size={14} />} onClick={exportCsv}>
            Exportar CSV
          </Button>
          <Button
            size="sm"
            leftIcon={<Plus size={14} />}
            onClick={() => {
              setErrors({});
              setEditing({ value: { ...EMPTY } });
            }}
          >
            Nueva historia
          </Button>
        </div>
      </div>

      <p className="muted">Ordenado por Cociente de Decisión = Business Value ÷ Story Points (mayor primero), como en la matriz de planificación.</p>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>#</th>
              <th>HU</th>
              <th>Historia de usuario</th>
              <th>Prioridad</th>
              <th className="num">BV</th>
              <th className="num">SP</th>
              <th className="num">Cociente</th>
              <th>Sprint</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((s, i) => (
              <tr key={s.id}>
                <td className="num">{i + 1}</td>
                <td className="strong" style={{ whiteSpace: 'nowrap' }}>
                  {s.code}
                  <div>
                    <Badge size="sm" variant={s.source === 'manual' ? 'default' : 'info'}>
                      {SOURCE_LABEL[s.source]}
                    </Badge>
                  </div>
                </td>
                <td style={{ minWidth: 280 }}>
                  {s.title}
                  <details>
                    <summary className="muted" style={{ cursor: 'pointer' }}>
                      Criterio de aceptación · {s.module}
                    </summary>
                    <p className="small pre-line" style={{ marginTop: 4 }}>
                      {s.acceptanceCriteria}
                    </p>
                  </details>
                </td>
                <td>
                  <Badge variant={s.priority === 'Alta' ? 'danger' : s.priority === 'Media' ? 'warning' : 'default'}>{s.priority}</Badge>
                </td>
                <td className="num">{s.businessValue}</td>
                <td className="num">{s.storyPoints}</td>
                <td className="num strong">{s.decisionRatio ?? ratio(s)}</td>
                <td>
                  <select
                    aria-label={`Sprint de ${s.code}`}
                    className="control control-sm"
                    style={{ minWidth: 120 }}
                    value={s.sprintId ?? ''}
                    disabled={s.status === 'hecha'}
                    onChange={(e) => assign.mutate({ id: s.id, sprintId: e.target.value || null })}
                  >
                    <option value="">Backlog</option>
                    {sprints.data?.map((sp) => (
                      <option key={sp.id} value={sp.id} disabled={sp.status === 'cerrado' && sp.id !== s.sprintId}>
                        Sprint {sp.number}
                        {sp.status === 'activo' ? ' (activo)' : sp.status === 'cerrado' ? ' (cerrado)' : ''}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <Badge variant={s.status === 'hecha' ? 'success' : s.status === 'sprint' ? 'info' : 'default'}>{STATUS_LABEL[s.status]}</Badge>
                </td>
                <td>
                  <div className="row" style={{ gap: 6, flexWrap: 'nowrap' }}>
                    <button
                      type="button"
                      className="icon-btn"
                      aria-label={`Editar ${s.code}`}
                      onClick={() => {
                        setErrors({});
                        setEditing({
                          id: s.id,
                          value: {
                            code: s.code,
                            title: s.title,
                            acceptanceCriteria: s.acceptanceCriteria,
                            priority: s.priority,
                            module: s.module,
                            businessValue: s.businessValue,
                            storyPoints: s.storyPoints,
                            status: s.status,
                            sprintId: s.sprintId ?? null,
                          },
                        });
                      }}
                    >
                      <Pencil size={14} />
                    </button>
                    <button type="button" className="icon-btn" aria-label={`Eliminar ${s.code}`} onClick={() => confirm(`¿Eliminar ${s.code}? Sus tareas quedarán sin historia.`) && remove.mutate(s.id)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!rows.length && (
              <tr>
                <td colSpan={10} className="empty">
                  No hay historias con estos filtros.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal
        open={Boolean(editing)}
        title={editing?.id ? `Editar ${editing.value.code}` : 'Nueva historia de usuario'}
        onClose={() => setEditing(null)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditing(null)}>
              Cancelar
            </Button>
            <Button onClick={submit} isLoading={save.isPending}>
              Guardar historia
            </Button>
          </>
        }
      >
        {editing && (
          <div className="stack">
            <div className="field">
              <label htmlFor="st-title">
                Historia<span className="req">*</span>
              </label>
              <textarea id="st-title" className="control" rows={3} value={editing.value.title} onChange={(e) => set('title', e.target.value)} aria-invalid={Boolean(errors.title)} placeholder="Como <rol>, quiero <acción>, para <beneficio>." />
              {errors.title && <span className="field-error">{errors.title}</span>}
            </div>
            <div className="field">
              <label htmlFor="st-ac">
                Criterio de aceptación<span className="req">*</span>
              </label>
              <textarea id="st-ac" className="control" rows={3} value={editing.value.acceptanceCriteria} onChange={(e) => set('acceptanceCriteria', e.target.value)} aria-invalid={Boolean(errors.acceptanceCriteria)} placeholder="Dado…, cuando…, entonces…" />
              {errors.acceptanceCriteria && <span className="field-error">{errors.acceptanceCriteria}</span>}
            </div>
            <div className="grid grid-4">
              <div className="field">
                <label htmlFor="st-code">Código</label>
                <input id="st-code" className="control" value={editing.value.code ?? ''} placeholder="Automático" onChange={(e) => set('code', e.target.value)} />
              </div>
              <div className="field">
                <label htmlFor="st-pr">Prioridad</label>
                <select id="st-pr" className="control" value={editing.value.priority} onChange={(e) => set('priority', e.target.value as Priority)}>
                  {['Alta', 'Media', 'Baja'].map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor="st-mod">Módulo</label>
                <select id="st-mod" className="control" value={editing.value.module} onChange={(e) => set('module', e.target.value)}>
                  {MODULES.map((m) => (
                    <option key={m}>{m}</option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor="st-status">Estado</label>
                <select id="st-status" className="control" value={editing.value.status} onChange={(e) => set('status', e.target.value as StoryStatus)}>
                  {(Object.keys(STATUS_LABEL) as StoryStatus[]).map((s) => (
                    <option key={s} value={s}>
                      {STATUS_LABEL[s]}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor="st-bv">Business Value (1-10)</label>
                <input id="st-bv" type="number" min={1} max={10} className="control" value={editing.value.businessValue} onChange={(e) => set('businessValue', Math.min(10, Math.max(1, parseInt(e.target.value, 10) || 1)))} />
              </div>
              <div className="field">
                <label htmlFor="st-sp">Story Points</label>
                <select id="st-sp" className="control" value={editing.value.storyPoints} onChange={(e) => set('storyPoints', Number(e.target.value))}>
                  {[1, 2, 3, 5, 8, 13].map((n) => (
                    <option key={n}>{n}</option>
                  ))}
                </select>
              </div>
              <div className="field">
                <span className="field-label">Cociente</span>
                <strong style={{ fontSize: 20, paddingTop: 8 }}>{ratio({ businessValue: editing.value.businessValue ?? 1, storyPoints: editing.value.storyPoints ?? 1 })}</strong>
              </div>
              <div className="field">
                <label htmlFor="st-sprint">Sprint</label>
                <select id="st-sprint" className="control" value={editing.value.sprintId ?? ''} onChange={(e) => set('sprintId', e.target.value || null)}>
                  <option value="">Backlog</option>
                  {sprints.data?.map((sp) => (
                    <option key={sp.id} value={sp.id}>
                      Sprint {sp.number}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
