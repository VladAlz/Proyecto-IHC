import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Button } from '../../atoms/Button/Button';
import { Badge } from '../../atoms/Badge/Badge';
import { LoadingState } from '../../molecules/PageState/PageState';
import { useToast } from '../../molecules/Toast/Toast';
import { SCRUM_DEPENDENTS, useApiMutation, useMembers, useStories, useTasks } from '../../../hooks/useApi';
import { api } from '../../../services/api';
import { Sprint, SprintTask, TASK_STATUS_LABELS, TaskStatus } from '../../../types';
import { TaskModal } from './TaskModal';

const COLUMNS: TaskStatus[] = ['pendiente', 'en_progreso', 'en_revision', 'terminado'];

/**
 * Sprint Board tipo Kanban (HU-07)
 * - Manipulación directa: arrastrar y soltar tarjetas entre columnas.
 * - Alternativa accesible equivalente (WCAG 2.1.1): botones ← → en cada tarjeta.
 * - Filtro por responsable para que cada integrante vea "mis tareas".
 */
export const SprintBoard: React.FC<{ sprint: Sprint }> = ({ sprint }) => {
  const tasks = useTasks(sprint.id);
  const members = useMembers();
  const stories = useStories();
  const toast = useToast();
  const [member, setMember] = useState('');
  const [dragId, setDragId] = useState<string | null>(null);
  const [over, setOver] = useState<TaskStatus | null>(null);
  const [modal, setModal] = useState<{ task?: SprintTask | null } | null>(null);

  const move = useApiMutation(({ id, status }: { id: string; status: TaskStatus }) => api.updateTask(id, { status }), {
    invalidate: SCRUM_DEPENDENTS,
  });

  if (tasks.isLoading) return <LoadingState />;
  const rows = (tasks.data ?? []).filter((t) => !member || t.assignee === member);
  const storyCode = (id?: string | null) => stories.data?.find((s) => s.id === id)?.code;

  const moveTo = (task: SprintTask, status: TaskStatus) => {
    if (task.status === status) return;
    move.mutate(
      { id: task.id, status },
      {
        onSuccess: () => toast.success(`«${task.title.slice(0, 40)}» → ${TASK_STATUS_LABELS[status]}`),
      },
    );
  };

  return (
    <div className="stack">
      <div className="row-between">
        <div className="field" style={{ width: 240 }}>
          <label htmlFor="board-member">Responsable</label>
          <select id="board-member" className="control control-sm" value={member} onChange={(e) => setMember(e.target.value)}>
            <option value="">Todo el equipo</option>
            {members.data?.map((m) => (
              <option key={m.id} value={m.name}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
        <Button size="sm" leftIcon={<Plus size={14} />} onClick={() => setModal({ task: null })} disabled={sprint.status === 'cerrado'}>
          Nueva tarea
        </Button>
      </div>
      <p className="muted">Arrastra las tarjetas entre columnas o usa los botones ‹ › de cada tarjeta.</p>

      <div className="kanban" role="list" aria-label={`Tablero del sprint ${sprint.number}`}>
        {COLUMNS.map((col, ci) => {
          const items = rows.filter((t) => t.status === col);
          return (
            <section
              key={col}
              role="listitem"
              aria-labelledby={`col-${col}`}
              data-status={col}
              className={`kanban-col ${over === col ? 'is-over' : ''}`}
              onDragOver={(e) => {
                e.preventDefault();
                setOver(col);
              }}
              onDragLeave={() => setOver((o) => (o === col ? null : o))}
              onDrop={(e) => {
                e.preventDefault();
                setOver(null);
                const task = rows.find((t) => t.id === (dragId || e.dataTransfer.getData('text/plain')));
                if (task) moveTo(task, col);
                setDragId(null);
              }}
            >
              <div className="row-between" style={{ padding: '2px 4px' }}>
                <h3 id={`col-${col}`} style={{ fontSize: 14 }}>
                  {TASK_STATUS_LABELS[col]}
                </h3>
                <Badge size="sm">{items.length}</Badge>
              </div>
              <ul className="stack-sm" style={{ listStyle: 'none' }}>
                {items.map((t) => (
                  <li
                    key={t.id}
                    className="kanban-card"
                    draggable
                    onDragStart={(e) => {
                      setDragId(t.id);
                      e.dataTransfer.setData('text/plain', t.id);
                      e.dataTransfer.effectAllowed = 'move';
                    }}
                    onDragEnd={() => setDragId(null)}
                    style={{ opacity: dragId === t.id ? 0.5 : 1 }}
                  >
                    <div className="row-between" style={{ gap: 6 }}>
                      {storyCode(t.storyId) ? <Badge size="sm" variant="info">{storyCode(t.storyId)}</Badge> : <span className="muted">Técnica</span>}
                      {t.unplanned && (
                        <Badge size="sm" variant="warning">
                          TNP
                        </Badge>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setModal({ task: t })}
                      style={{ textAlign: 'left', background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontWeight: 700, color: '#0f172a', fontSize: 15 }}
                      aria-label={`Editar tarea ${t.title}`}
                    >
                      {t.title}
                    </button>
                    <div className="muted">
                      {t.assignee} · {t.phase} · {t.estimatedHours} h est. / {t.realHours} h real
                    </div>
                    <div className="row-between">
                      <button
                        type="button"
                        className="icon-btn"
                        disabled={ci === 0 || move.isPending}
                        onClick={() => moveTo(t, COLUMNS[ci - 1])}
                        aria-label={`Mover «${t.title}» a ${ci > 0 ? TASK_STATUS_LABELS[COLUMNS[ci - 1]] : ''}`}
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <button
                        type="button"
                        className="icon-btn"
                        disabled={ci === COLUMNS.length - 1 || move.isPending}
                        onClick={() => moveTo(t, COLUMNS[ci + 1])}
                        aria-label={`Mover «${t.title}» a ${ci < COLUMNS.length - 1 ? TASK_STATUS_LABELS[COLUMNS[ci + 1]] : ''}`}
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </li>
                ))}
                {!items.length && <li className="muted" style={{ textAlign: 'center', padding: 16 }}>Sin tareas</li>}
              </ul>
            </section>
          );
        })}
      </div>
      <TaskModal open={Boolean(modal)} sprintId={sprint.id} task={modal?.task} onClose={() => setModal(null)} />
    </div>
  );
};
