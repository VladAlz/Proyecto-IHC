import React, { useState } from 'react';
import { FileSpreadsheet, Pencil, Plus, Trash2 } from 'lucide-react';
import { Button } from '../../atoms/Button/Button';
import { Badge } from '../../atoms/Badge/Badge';
import { LoadingState } from '../../molecules/PageState/PageState';
import { SCRUM_DEPENDENTS, useApiMutation, useMembers, useSprintSummary, useStories, useTasks } from '../../../hooks/useApi';
import { api } from '../../../services/api';
import { downloadText, toCsv } from '../../../utils/report';
import { Sprint, SprintTask, TASK_STATUS_LABELS, TaskStatus } from '../../../types';
import { TaskModal } from './TaskModal';

/** Días hábiles (lunes a viernes) entre dos fechas ISO, inclusive */
export function workingDays(start: string, end: string): number {
  const d = new Date(`${start}T00:00:00`);
  const e = new Date(`${end}T00:00:00`);
  let n = 0;
  while (d <= e) {
    const day = d.getDay();
    if (day !== 0 && day !== 6) n += 1;
    d.setDate(d.getDate() + 1);
  }
  return n;
}

/**
 * Sprint Planning (hoja "Sprint.N" + "Tareas no Planificadas" de la matriz):
 * capacidad del equipo, tareas con horas estimadas vs reales, estado y TNP.
 */
export const SprintPlanning: React.FC<{ sprint: Sprint; onEditSprint: () => void }> = ({ sprint, onEditSprint }) => {
  const tasks = useTasks(sprint.id);
  const summary = useSprintSummary(sprint.id);
  const members = useMembers();
  const stories = useStories();
  const [modal, setModal] = useState<{ task?: SprintTask | null; unplanned?: boolean } | null>(null);

  const quick = useApiMutation(({ id, patch }: { id: string; patch: Partial<SprintTask> }) => api.updateTask(id, patch), {
    invalidate: SCRUM_DEPENDENTS,
    silent: false,
  });
  const remove = useApiMutation((id: string) => api.deleteTask(id), { invalidate: SCRUM_DEPENDENTS, success: 'Tarea eliminada' });

  if (tasks.isLoading || summary.isLoading) return <LoadingState />;

  const planned = (tasks.data ?? []).filter((t) => !t.unplanned);
  const unplanned = (tasks.data ?? []).filter((t) => t.unplanned);
  const days = workingDays(sprint.startDate, sprint.endDate);
  const capacity = (members.data ?? []).reduce((acc, m) => acc + m.hoursPerDay * days, 0);
  const t = summary.data?.totals;
  const storyCode = (id?: string | null) => stories.data?.find((s) => s.id === id)?.code ?? '—';

  const exportCsv = () => {
    const rows: (string | number)[][] = [
      ['PLANIFICACIÓN DE TRABAJOS DE DESARROLLO'],
      ['Sprint', sprint.number, 'Objetivo', sprint.goal],
      ['Product Owner', sprint.productOwner ?? '', 'Scrum Master', sprint.scrumMaster ?? ''],
      ['Fecha inicio', sprint.startDate, 'Fecha final', sprint.endDate],
      ['Nro. desarrolladores', members.data?.length ?? 0, 'Capacidad (h)', capacity],
      [],
      ['Historia de usuario', 'Desarrollador', 'Fase', 'Tipo', 'Tarea', 'Tiempo estimado (h)', 'Tiempo real (h)', 'Estado', 'Comentario'],
      ...planned.map((x) => [storyCode(x.storyId), x.assignee, x.phase, x.type, x.title, x.estimatedHours, x.realHours, TASK_STATUS_LABELS[x.status], x.comment ?? '']),
      ['', '', '', '', 'TOTAL', t?.estimatedHours ?? 0, planned.reduce((a, x) => a + x.realHours, 0), '', ''],
      [],
      ['TAREAS NO PLANIFICADAS'],
      ['Fecha', 'Desarrollador', 'Tarea', 'Duración (h)'],
      ...unplanned.map((x) => [x.unplannedDate ?? '', x.assignee, x.title, x.realHours || x.estimatedHours]),
      ['', '', 'TOTAL', t?.unplannedHours ?? 0],
    ];
    downloadText(`sprint-${sprint.number}-planificacion.csv`, toCsv(rows), 'text/csv;charset=utf-8');
  };

  const renderTable = (rows: SprintTask[], showDate = false) => (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            {showDate && <th>Fecha</th>}
            <th>HU</th>
            <th>Desarrollador</th>
            <th>Fase · tipo</th>
            <th>Tarea</th>
            <th className="num">Estimado</th>
            <th className="num">Real</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((x) => (
            <tr key={x.id}>
              {showDate && <td>{x.unplannedDate}</td>}
              <td className="strong">{storyCode(x.storyId)}</td>
              <td>{x.assignee}</td>
              <td>
                {x.phase}
                <div className="muted">{x.type}</div>
              </td>
              <td style={{ minWidth: 220 }}>
                {x.title}
                {x.comment && <div className="muted">{x.comment}</div>}
              </td>
              <td className="num">{x.estimatedHours} h</td>
              <td className="num">
                <input
                  key={`${x.id}-${x.realHours}`}
                  aria-label={`Horas reales de ${x.title}`}
                  type="number"
                  min={0}
                  step={0.5}
                  defaultValue={x.realHours}
                  className="control control-sm"
                  style={{ width: 76, textAlign: 'right' }}
                  onBlur={(e) => {
                    const v = Math.max(0, parseFloat(e.target.value) || 0);
                    if (v !== x.realHours) quick.mutate({ id: x.id, patch: { realHours: v } });
                  }}
                />
              </td>
              <td>
                <select
                  aria-label={`Estado de ${x.title}`}
                  className="control control-sm"
                  value={x.status}
                  onChange={(e) => quick.mutate({ id: x.id, patch: { status: e.target.value as TaskStatus } })}
                >
                  {(Object.keys(TASK_STATUS_LABELS) as TaskStatus[]).map((s) => (
                    <option key={s} value={s}>
                      {TASK_STATUS_LABELS[s]}
                    </option>
                  ))}
                </select>
              </td>
              <td>
                <div className="row" style={{ gap: 6, flexWrap: 'nowrap' }}>
                  <button type="button" className="icon-btn" aria-label={`Editar ${x.title}`} onClick={() => setModal({ task: x })}>
                    <Pencil size={14} />
                  </button>
                  <button type="button" className="icon-btn" aria-label={`Eliminar ${x.title}`} onClick={() => confirm('¿Eliminar esta tarea?') && remove.mutate(x.id)}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {!rows.length && (
            <tr>
              <td colSpan={showDate ? 9 : 8} className="empty">
                Sin tareas registradas.
              </td>
            </tr>
          )}
        </tbody>
        {rows.length > 0 && (
          <tfoot>
            <tr>
              <td colSpan={showDate ? 5 : 4} style={{ textAlign: 'right' }}>
                TOTAL
              </td>
              <td className="num">{Math.round(rows.reduce((a, x) => a + x.estimatedHours, 0) * 10) / 10} h</td>
              <td className="num">{Math.round(rows.reduce((a, x) => a + x.realHours, 0) * 10) / 10} h</td>
              <td colSpan={2} />
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );

  const overCapacity = t && capacity > 0 && t.estimatedHours > capacity;

  return (
    <div className="stack">
      <div className="card stack-sm">
        <div className="row-between">
          <div>
            <h2 className="card-title">
              Sprint {sprint.number} {sprint.weeksLabel && <span className="muted">· {sprint.weeksLabel}</span>}{' '}
              <Badge variant={sprint.status === 'activo' ? 'success' : sprint.status === 'cerrado' ? 'default' : 'info'}>{sprint.status}</Badge>
            </h2>
            <p className="small" style={{ marginTop: 4 }}>
              <strong>Objetivo:</strong> {sprint.goal}
            </p>
            <p className="muted">
              {sprint.startDate} → {sprint.endDate} · {days} días hábiles · PO: {sprint.productOwner || '—'} · SM: {sprint.scrumMaster || '—'}
            </p>
            {sprint.deliverables && <p className="muted">Entregables: {sprint.deliverables}</p>}
          </div>
          <div className="row">
            <Button variant="secondary" size="sm" leftIcon={<Pencil size={14} />} onClick={onEditSprint}>
              Editar sprint
            </Button>
            <Button variant="secondary" size="sm" leftIcon={<FileSpreadsheet size={14} />} onClick={exportCsv}>
              Exportar matriz CSV
            </Button>
          </div>
        </div>
      </div>

      {t && (
        <div className="grid grid-4">
          <div className="card stack-sm">
            <span className="muted">Capacidad del equipo</span>
            <strong style={{ fontSize: 22 }}>{capacity} h</strong>
            <span className="muted">
              {members.data?.length ?? 0} integrantes × h/día × {days} días
            </span>
          </div>
          <div className="card stack-sm">
            <span className="muted">Horas estimadas vs reales</span>
            <strong style={{ fontSize: 22, color: overCapacity ? '#b91c1c' : undefined }}>
              {t.estimatedHours} h / {t.realHours} h
            </strong>
            <span className="muted">{overCapacity ? '⚠ La estimación supera la capacidad' : 'Dentro de la capacidad'}</span>
          </div>
          <div className="card stack-sm">
            <span className="muted">Avance de tareas</span>
            <strong style={{ fontSize: 22 }}>{t.progress}%</strong>
            <div className="bar-track" role="progressbar" aria-valuenow={t.progress} aria-valuemin={0} aria-valuemax={100} aria-label="Avance del sprint">
              <span className="bar-fill" style={{ width: `${t.progress}%`, background: 'var(--chart-single)' }} />
            </div>
            <span className="muted">
              {t.done} de {t.tasks} tareas terminadas
            </span>
          </div>
          <div className="card stack-sm">
            <span className="muted">Story points completados</span>
            <strong style={{ fontSize: 22 }}>
              {t.completedPoints} / {t.storyPoints}
            </strong>
            <span className="muted">TNP: {t.unplannedHours} h</span>
          </div>
        </div>
      )}

      {summary.data && summary.data.byMember.length > 0 && (
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: 12 }}>
            Carga por integrante
          </h3>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Integrante</th>
                  <th className="num">Tareas</th>
                  <th className="num">Terminadas</th>
                  <th className="num">Estimado</th>
                  <th className="num">Real</th>
                  <th className="num">Capacidad</th>
                </tr>
              </thead>
              <tbody>
                {summary.data.byMember.map((m) => {
                  const cap = (members.data?.find((x) => x.name === m.member)?.hoursPerDay ?? 0) * days;
                  return (
                    <tr key={m.member}>
                      <td>{m.member}</td>
                      <td className="num">{m.tasks}</td>
                      <td className="num">{m.done}</td>
                      <td className="num" style={{ color: cap && m.estimatedHours > cap ? '#b91c1c' : undefined }}>
                        {m.estimatedHours} h
                      </td>
                      <td className="num">{m.realHours} h</td>
                      <td className="num">{cap ? `${cap} h` : '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="card stack">
        <div className="row-between">
          <h3 className="card-title">Tareas planificadas</h3>
          <Button size="sm" leftIcon={<Plus size={14} />} onClick={() => setModal({ task: null })} disabled={sprint.status === 'cerrado'}>
            Nueva tarea
          </Button>
        </div>
        {renderTable(planned)}
      </div>

      <div className="card stack">
        <div className="row-between">
          <div>
            <h3 className="card-title">Tareas no planificadas (TNP)</h3>
            <p className="card-subtitle">Trabajo que apareció durante el sprint y no estaba en la planificación</p>
          </div>
          <Button size="sm" variant="secondary" leftIcon={<Plus size={14} />} onClick={() => setModal({ task: null, unplanned: true })}>
            Registrar TNP
          </Button>
        </div>
        {renderTable(unplanned, true)}
      </div>

      <TaskModal open={Boolean(modal)} sprintId={sprint.id} task={modal?.task} defaultUnplanned={modal?.unplanned} onClose={() => setModal(null)} />
    </div>
  );
};
