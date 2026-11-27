import React, { useEffect, useState } from 'react';
import { Button } from '../../atoms/Button/Button';
import { Modal } from '../../molecules/Modal/Modal';
import { SCRUM_DEPENDENTS, useApiMutation, useMembers, useStories } from '../../../hooks/useApi';
import { api } from '../../../services/api';
import { SprintTask, TASK_STATUS_LABELS, TaskInput, TaskStatus } from '../../../types';

export const PHASES = ['Análisis', 'Diseño', 'Desarrollo', 'Pruebas', 'Documentación'];
export const TYPES = ['Nuevo', 'Mejora', 'Error'];

/** Formulario de tarea con los campos de la hoja "Sprint.N" de la matriz de planificación */
export const TaskModal: React.FC<{
  open: boolean;
  sprintId: string;
  task?: SprintTask | null;
  defaultUnplanned?: boolean;
  onClose: () => void;
}> = ({ open, sprintId, task, defaultUnplanned, onClose }) => {
  const members = useMembers();
  const stories = useStories();
  const [value, setValue] = useState<TaskInput>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setValue(
      task
        ? { ...task }
        : {
            sprintId,
            storyId: null,
            title: '',
            assignee: members.data?.[0]?.name ?? '',
            phase: 'Desarrollo',
            type: 'Nuevo',
            estimatedHours: 2,
            realHours: 0,
            status: 'pendiente',
            comment: '',
            unplanned: Boolean(defaultUnplanned),
            unplannedDate: defaultUnplanned ? new Date().toISOString().slice(0, 10) : undefined,
          },
    );
  }, [open, task, sprintId, defaultUnplanned, members.data]);

  const save = useApiMutation(
    (v: TaskInput) => {
      const { id, createdAt: _c, ...body } = v as SprintTask;
      const clean = Object.fromEntries(Object.entries(body).map(([k, val]) => [k, val === null && k !== 'storyId' ? undefined : val])) as TaskInput;
      if (!clean.unplanned) delete clean.unplannedDate;
      return id ? api.updateTask(id, clean) : api.createTask(clean);
    },
    { invalidate: SCRUM_DEPENDENTS, success: (_r, v) => ((v as SprintTask).id ? 'Tarea actualizada' : 'Tarea agregada al sprint') },
  );

  const set = <K extends keyof TaskInput>(k: K, v: TaskInput[K]) => setValue((prev) => ({ ...prev, [k]: v }));

  const submit = () => {
    const e: Record<string, string> = {};
    if (!value.title?.trim()) e.title = 'Describe la tarea';
    if (!value.assignee?.trim()) e.assignee = 'Asigna un responsable';
    if (value.unplanned && !value.unplannedDate) e.unplannedDate = 'Indica la fecha de la tarea no planificada';
    setErrors(e);
    if (Object.keys(e).length) return;
    save.mutate(value, { onSuccess: onClose });
  };

  const sprintStories = (stories.data ?? []).filter((s) => s.sprintId === sprintId || s.id === value.storyId);
  const otherStories = (stories.data ?? []).filter((s) => !sprintStories.includes(s) && s.status === 'backlog');

  return (
    <Modal
      open={open}
      title={task ? 'Editar tarea' : value.unplanned ? 'Nueva tarea no planificada (TNP)' : 'Nueva tarea del sprint'}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={submit} isLoading={save.isPending}>
            Guardar tarea
          </Button>
        </>
      }
    >
      <div className="stack">
        <div className="field">
          <label htmlFor="tk-title">
            Tarea<span className="req">*</span>
          </label>
          <input id="tk-title" className="control" value={value.title ?? ''} onChange={(e) => set('title', e.target.value)} aria-invalid={Boolean(errors.title)} />
          {errors.title && <span className="field-error">{errors.title}</span>}
        </div>
        <div className="grid grid-2">
          <div className="field">
            <label htmlFor="tk-story">Historia de usuario</label>
            <select id="tk-story" className="control" value={value.storyId ?? ''} onChange={(e) => set('storyId', e.target.value || null)}>
              <option value="">Sin historia (tarea técnica)</option>
              <optgroup label="Historias del sprint">
                {sprintStories.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.code} · {s.title.slice(0, 70)}
                  </option>
                ))}
              </optgroup>
              {otherStories.length > 0 && (
                <optgroup label="Del backlog (se moverá a este sprint)">
                  {otherStories.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.code} · {s.title.slice(0, 70)}
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
          </div>
          <div className="field">
            <label htmlFor="tk-as">
              Desarrollador<span className="req">*</span>
            </label>
            <select id="tk-as" className="control" value={value.assignee ?? ''} onChange={(e) => set('assignee', e.target.value)} aria-invalid={Boolean(errors.assignee)}>
              <option value="">Selecciona…</option>
              {members.data?.map((m) => (
                <option key={m.id} value={m.name}>
                  {m.name}
                </option>
              ))}
              {value.assignee && !members.data?.some((m) => m.name === value.assignee) && <option>{value.assignee}</option>}
            </select>
            {errors.assignee && <span className="field-error">{errors.assignee}</span>}
          </div>
        </div>
        <div className="grid grid-4">
          <div className="field">
            <label htmlFor="tk-phase">Fase</label>
            <select id="tk-phase" className="control" value={value.phase} onChange={(e) => set('phase', e.target.value)}>
              {PHASES.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="tk-type">Tipo</label>
            <select id="tk-type" className="control" value={value.type} onChange={(e) => set('type', e.target.value)}>
              {TYPES.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="tk-est">Estimado (h)</label>
            <input id="tk-est" type="number" min={0} step={0.5} className="control" value={value.estimatedHours ?? 0} onChange={(e) => set('estimatedHours', Math.max(0, parseFloat(e.target.value) || 0))} />
          </div>
          <div className="field">
            <label htmlFor="tk-real">Real (h)</label>
            <input id="tk-real" type="number" min={0} step={0.5} className="control" value={value.realHours ?? 0} onChange={(e) => set('realHours', Math.max(0, parseFloat(e.target.value) || 0))} />
          </div>
        </div>
        <div className="grid grid-2">
          <div className="field">
            <label htmlFor="tk-status">Estado</label>
            <select id="tk-status" className="control" value={value.status} onChange={(e) => set('status', e.target.value as TaskStatus)}>
              {(Object.keys(TASK_STATUS_LABELS) as TaskStatus[]).map((s) => (
                <option key={s} value={s}>
                  {TASK_STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <span className="field-label">Planificación</span>
            <label className="check">
              <input type="checkbox" checked={Boolean(value.unplanned)} onChange={(e) => set('unplanned', e.target.checked)} />
              Tarea no planificada (TNP)
            </label>
            {value.unplanned && (
              <>
                <input aria-label="Fecha de la tarea no planificada" type="date" className="control control-sm" value={value.unplannedDate ?? ''} onChange={(e) => set('unplannedDate', e.target.value)} />
                {errors.unplannedDate && <span className="field-error">{errors.unplannedDate}</span>}
              </>
            )}
          </div>
        </div>
        <div className="field">
          <label htmlFor="tk-com">Comentario</label>
          <input id="tk-com" className="control" value={value.comment ?? ''} onChange={(e) => set('comment', e.target.value)} />
        </div>
      </div>
    </Modal>
  );
};
