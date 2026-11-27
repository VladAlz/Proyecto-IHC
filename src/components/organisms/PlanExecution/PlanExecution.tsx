import React, { useEffect, useRef, useState } from 'react';
import { Pause, Play, RotateCcw, Save, Timer } from 'lucide-react';
import { Button } from '../../atoms/Button/Button';
import { Badge } from '../../atoms/Badge/Badge';
import { StarRating } from '../../atoms/StarRating/StarRating';
import { ResultSelector } from '../../molecules/ResultSelector/ResultSelector';
import { CreateTestDto, TaskResult, TestPlan } from '../../../types';
import { tokens } from '../../../styles/tokens';

interface TaskRecord {
  timeOnTask: number;
  errorsCount: number;
  taskResult: TaskResult;
  satisfactionScore: number;
  observations: string;
  skipped: boolean;
}

const emptyRecord = (): TaskRecord => ({ timeOnTask: 0, errorsCount: 0, taskResult: 'success', satisfactionScore: 0, observations: '', skipped: false });

/** Cronómetro: evita que el moderador cronometre con otra herramienta (Nielsen #7) */
const Stopwatch: React.FC<{ value: number; onChange: (s: number) => void; limit?: number; label: string }> = ({ value, onChange, limit, label }) => {
  const [running, setRunning] = useState(false);
  const startRef = useRef(0);
  const baseRef = useRef(value);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => onChange(Math.round((baseRef.current + (Date.now() - startRef.current) / 1000) * 10) / 10), 200);
    return () => clearInterval(id);
  }, [running, onChange]);

  const over = Boolean(limit && value > limit);
  return (
    <div className="row" style={{ gap: 8 }}>
      <span
        aria-live="off"
        style={{
          fontVariantNumeric: 'tabular-nums',
          fontSize: 22,
          fontWeight: 700,
          minWidth: 92,
          color: over ? tokens.colors.danger : tokens.colors.gray900,
        }}
        title={over ? `Supera el tiempo objetivo de ${limit} s` : undefined}
      >
        {value.toFixed(1)} s
      </span>
      {!running ? (
        <Button
          size="sm"
          variant="secondary"
          leftIcon={<Play size={14} />}
          aria-label={`Iniciar cronómetro de ${label}`}
          onClick={() => {
            baseRef.current = value;
            startRef.current = Date.now();
            setRunning(true);
          }}
        >
          {value ? 'Reanudar' : 'Iniciar'}
        </Button>
      ) : (
        <Button size="sm" leftIcon={<Pause size={14} />} aria-label={`Detener cronómetro de ${label}`} onClick={() => setRunning(false)}>
          Detener
        </Button>
      )}
      <button type="button" className="icon-btn" aria-label={`Reiniciar cronómetro de ${label}`} disabled={running} onClick={() => onChange(0)}>
        <RotateCcw size={14} />
      </button>
      {over && <span className="field-error">Supera {limit} s</span>}
    </div>
  );
};

/**
 * Organismo PlanExecution — Fase 2 (ejecución) del plan.
 * Equivale a la hoja "Registro observación": participante × tarea con éxito, tiempo, errores,
 * comentarios y satisfacción. Incluye el guion de moderación para leer durante la sesión.
 */
export const PlanExecution: React.FC<{
  plan: TestPlan;
  isSaving: boolean;
  onCancel: () => void;
  onSave: (rows: CreateTestDto[]) => Promise<unknown>;
}> = ({ plan, isSaving, onCancel, onSave }) => {
  const [participant, setParticipant] = useState('');
  const [profile, setProfile] = useState('');
  const [records, setRecords] = useState<TaskRecord[]>(() => plan.tasks.map(emptyRecord));
  const [error, setError] = useState('');

  const update = (i: number, patch: Partial<TaskRecord>) => setRecords((r) => r.map((rec, idx) => (idx === i ? { ...rec, ...patch } : rec)));
  const timeSetters = useRef(plan.tasks.map((_, i) => (s: number) => update(i, { timeOnTask: s })));

  const handleSave = async () => {
    if (participant.trim().length < 2) {
      setError('Escribe el código o nombre del participante antes de guardar.');
      document.getElementById('exec-participant')?.focus();
      return;
    }
    const pending = records.findIndex((r) => !r.skipped && (!r.timeOnTask || !r.satisfactionScore));
    if (pending >= 0) {
      setError(`Completa el tiempo y la satisfacción de ${plan.tasks[pending].code} o márcala como "No aplicada".`);
      document.getElementById(`exec-task-${pending}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    const rows: CreateTestDto[] = records
      .map((r, i) => ({ r, task: plan.tasks[i] }))
      .filter(({ r }) => !r.skipped)
      .map(({ r, task }) => ({
        evaluatorName: participant.trim(),
        participantProfile: profile.trim() || undefined,
        taskDescription: task.scenario,
        taskCode: task.code,
        planId: plan.id,
        appVersion: plan.appVersion,
        timeOnTask: r.timeOnTask,
        errorsCount: r.errorsCount,
        satisfactionScore: r.satisfactionScore,
        taskResult: r.taskResult,
        observations: r.observations.trim() || undefined,
      }));
    if (!rows.length) {
      setError('No hay tareas aplicadas para guardar.');
      return;
    }
    setError('');
    await onSave(rows);
    setParticipant('');
    setProfile('');
    setRecords(plan.tasks.map(emptyRecord));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="stack" style={{ gap: 16 }}>
      <details className="card" open>
        <summary className="strong" style={{ cursor: 'pointer', minHeight: 28 }}>
          Guion de moderación (leer al participante)
        </summary>
        <div className="grid grid-2" style={{ marginTop: 12 }}>
          <ol className="small stack-sm" style={{ paddingLeft: 18 }}>
            <li>Agradece la participación.</li>
            <li>Explica que se evalúa la interfaz, no a la persona.</li>
            <li>Pide que piense en voz alta.</li>
            <li>Lee una tarea a la vez.</li>
            <li>Evita ayudar salvo bloqueo total (regístralo como «Con ayuda»).</li>
          </ol>
          <div className="small stack-sm">
            <strong>Cierre</strong>
            <span>¿Qué fue lo más fácil? · ¿Qué fue lo más confuso? · ¿Qué cambiarías primero?</span>
            {plan.moderatorNotes && (
              <>
                <strong>Notas del moderador</strong>
                <span className="pre-line">{plan.moderatorNotes}</span>
              </>
            )}
          </div>
        </div>
      </details>

      <section className="card grid grid-2" aria-label="Participante">
        <div className="field">
          <label htmlFor="exec-participant">
            Participante<span className="req" aria-hidden="true">*</span>
          </label>
          <input id="exec-participant" className="control" value={participant} onChange={(e) => setParticipant(e.target.value)} placeholder="Ej. P1" aria-required />
        </div>
        <div className="field">
          <label htmlFor="exec-profile">Perfil</label>
          <input id="exec-profile" className="control" value={profile} onChange={(e) => setProfile(e.target.value)} placeholder={plan.userProfile.slice(0, 60)} />
        </div>
      </section>

      {plan.tasks.map((task, i) => {
        const r = records[i];
        return (
          <section key={task.code} id={`exec-task-${i}`} className="card stack" aria-label={`Tarea ${task.code}`} style={{ opacity: r.skipped ? 0.6 : 1 }}>
            <div className="row-between" style={{ alignItems: 'flex-start' }}>
              <div className="stack-sm" style={{ flex: 1, minWidth: 240 }}>
                <div className="row" style={{ gap: 8 }}>
                  <Badge variant="info">{task.code}</Badge>
                  <span className="muted">
                    Métrica: {task.metric} · Éxito: {task.successCriteria}
                  </span>
                </div>
                <p style={{ fontSize: 16, fontWeight: 600 }}>“{task.scenario}”</p>
                {task.followUpQuestion && <p className="muted">Pregunta de seguimiento: {task.followUpQuestion}</p>}
              </div>
              <label className="check">
                <input type="checkbox" checked={r.skipped} onChange={(e) => update(i, { skipped: e.target.checked })} />
                No aplicada
              </label>
            </div>

            {!r.skipped && (
              <>
                <div className="grid grid-2">
                  <div className="field">
                    <span className="field-label">
                      <Timer size={14} aria-hidden="true" /> Tiempo en tarea
                    </span>
                    <Stopwatch value={r.timeOnTask} onChange={timeSetters.current[i]} limit={task.maxTimeSeconds} label={task.code} />
                    <input
                      aria-label={`Tiempo manual en segundos para ${task.code}`}
                      type="number"
                      min="0"
                      step="0.5"
                      className="control control-sm"
                      style={{ maxWidth: 160 }}
                      value={r.timeOnTask || ''}
                      placeholder="o escribe los segundos"
                      onChange={(e) => update(i, { timeOnTask: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="field">
                    <label htmlFor={`exec-err-${i}`}>Errores</label>
                    <div className="row" style={{ gap: 6 }}>
                      <button type="button" className="icon-btn" aria-label="Restar un error" onClick={() => update(i, { errorsCount: Math.max(0, r.errorsCount - 1) })}>
                        −
                      </button>
                      <input
                        id={`exec-err-${i}`}
                        type="number"
                        min="0"
                        className="control control-sm"
                        style={{ width: 80, textAlign: 'center' }}
                        value={r.errorsCount}
                        onChange={(e) => update(i, { errorsCount: Math.max(0, parseInt(e.target.value, 10) || 0) })}
                      />
                      <button type="button" className="icon-btn" aria-label="Sumar un error" onClick={() => update(i, { errorsCount: r.errorsCount + 1 })}>
                        +
                      </button>
                    </div>
                  </div>
                </div>
                <div className="field">
                  <span className="field-label">Resultado</span>
                  <ResultSelector name={`exec-res-${i}`} value={r.taskResult} onChange={(v) => update(i, { taskResult: v })} />
                </div>
                <StarRating id={`exec-sat-${i}`} value={r.satisfactionScore} onChange={(v) => update(i, { satisfactionScore: v })} label="Satisfacción con esta tarea" />
                <div className="field">
                  <label htmlFor={`exec-obs-${i}`}>Comentarios clave / problema detectado</label>
                  <textarea
                    id={`exec-obs-${i}`}
                    className="control"
                    rows={2}
                    value={r.observations}
                    onChange={(e) => update(i, { observations: e.target.value })}
                    placeholder="Qué dijo, dónde dudó, qué esperaba encontrar…"
                  />
                </div>
              </>
            )}
          </section>
        );
      })}

      {error && (
        <div role="alert" className="alert alert-danger">
          {error}
        </div>
      )}
      <div className="row-between">
        <Button variant="ghost" onClick={onCancel}>
          Volver a planes
        </Button>
        <Button size="lg" leftIcon={<Save size={16} />} isLoading={isSaving} onClick={handleSave}>
          Guardar sesión del participante
        </Button>
      </div>
    </div>
  );
};
