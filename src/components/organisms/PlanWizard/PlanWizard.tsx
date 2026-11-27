import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Plus, Save, Trash2 } from 'lucide-react';
import { Button } from '../../atoms/Button/Button';
import { Badge } from '../../atoms/Badge/Badge';
import { PlanChecklist, PlanInput, PlanTask, TestPlan } from '../../../types';

const STEPS = ['Contexto', 'Tareas', 'Roles y checklist', 'Revisión'];

const EMPTY_TASK = (n: number): PlanTask => ({
  code: `T${n}`,
  scenario: '',
  expectedResult: '',
  metric: 'Éxito + tiempo',
  successCriteria: '',
  followUpQuestion: '',
  maxTimeSeconds: undefined,
});

const EMPTY_CHECKLIST: PlanChecklist = {
  emailParticipants: false,
  reminder1: false,
  reminder2: false,
  ethicalApproval: false,
  consentForm: false,
  usabilityChecklist: false,
};

export const emptyPlan = (): PlanInput => ({
  product: 'Usability Test Dashboard',
  module: '',
  objective: '',
  hypotheses: '',
  userProfile: '',
  method: 'Prueba moderada presencial (think aloud)',
  duration: '20 minutos por participante',
  date: new Date().toISOString().slice(0, 10),
  location: '',
  moderator: '',
  observer: '',
  tool: '',
  link: '',
  moderatorNotes: '',
  appVersion: 'v2',
  tasks: [EMPTY_TASK(1)],
  checklist: EMPTY_CHECKLIST,
  status: 'borrador',
});

export const planToInput = (p: TestPlan): PlanInput => {
  const { id: _id, createdAt: _c, updatedAt: _u, ...rest } = p;
  return { ...rest, checklist: { ...EMPTY_CHECKLIST, ...p.checklist } };
};

/** Limpia null → undefined para que el DTO del backend valide */
const clean = (p: PlanInput): PlanInput =>
  Object.fromEntries(Object.entries(p).map(([k, v]) => [k, v === null ? undefined : v])) as PlanInput;

const TextField: React.FC<{
  id: string;
  label: string;
  value?: string | null;
  onChange: (v: string) => void;
  required?: boolean;
  error?: string;
  help?: string;
  multiline?: boolean;
  type?: string;
  placeholder?: string;
}> = ({ id, label, value, onChange, required, error, help, multiline, type = 'text', placeholder }) => (
  <div className="field">
    <label htmlFor={id}>
      {label}
      {required && <span className="req" aria-hidden="true">*</span>}
    </label>
    {multiline ? (
      <textarea id={id} className="control" rows={3} value={value ?? ''} onChange={(e) => onChange(e.target.value)} aria-invalid={Boolean(error)} aria-required={required} placeholder={placeholder} />
    ) : (
      <input id={id} type={type} className="control" value={value ?? ''} onChange={(e) => onChange(e.target.value)} aria-invalid={Boolean(error)} aria-required={required} placeholder={placeholder} />
    )}
    {error ? <span className="field-error" role="alert">{error}</span> : help && <span className="field-help">{help}</span>}
  </div>
);

/**
 * Organismo PlanWizard — Fase 1 (configuración) del plan de prueba.
 * Reemplaza las hojas "Plan de prueba" y "Guion y tareas" de la plantilla Excel.
 * - Divulgación progresiva en 4 pasos (Miller / carga cognitiva) con indicador de progreso (Nielsen #1).
 * - Validación por paso antes de avanzar (Nielsen #5) y libertad para volver atrás (Nielsen #3).
 */
export const PlanWizard: React.FC<{
  initial: PlanInput;
  isSaving: boolean;
  onCancel: () => void;
  onSave: (plan: PlanInput) => void;
}> = ({ initial, isSaving, onCancel, onSave }) => {
  const [step, setStep] = useState(0);
  const [plan, setPlan] = useState<PlanInput>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = <K extends keyof PlanInput>(key: K, value: PlanInput[K]) => setPlan((p) => ({ ...p, [key]: value }));
  const setTask = (index: number, patch: Partial<PlanTask>) =>
    setPlan((p) => ({ ...p, tasks: p.tasks.map((t, i) => (i === index ? { ...t, ...patch } : t)) }));
  const setCheck = (patch: Partial<PlanChecklist>) => setPlan((p) => ({ ...p, checklist: { ...p.checklist, ...patch } }));

  const validateStep = (s: number) => {
    const e: Record<string, string> = {};
    if (s === 0) {
      if (!plan.product.trim()) e.product = 'Indica el producto o servicio';
      if (!plan.module.trim()) e.module = 'Indica la pantalla o módulo evaluado';
      if (plan.objective.trim().length < 10) e.objective = 'Describe el objetivo del test (mínimo 10 caracteres)';
      if (!plan.userProfile.trim()) e.userProfile = 'Describe el perfil de los participantes';
      if (!plan.method.trim()) e.method = 'Indica el método';
    }
    if (s === 1) {
      if (!plan.tasks.length) e.tasks = 'Agrega al menos una tarea';
      plan.tasks.forEach((t, i) => {
        if (!t.scenario.trim()) e[`task-${i}-scenario`] = 'Escribe el escenario que leerás al participante';
        if (!t.expectedResult.trim()) e[`task-${i}-expected`] = 'Indica el resultado esperado';
        if (!t.successCriteria.trim()) e[`task-${i}-criteria`] = 'Define el criterio de éxito';
      });
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    if (validateStep(step)) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const save = (status: PlanInput['status']) => {
    if (!validateStep(0)) return setStep(0);
    if (!validateStep(1)) return setStep(1);
    onSave(clean({ ...plan, status, tasks: plan.tasks.map((t, i) => ({ ...t, code: t.code.trim() || `T${i + 1}` })) }));
  };

  return (
    <div className="card stack" style={{ gap: 20 }}>
      <ol className="stepper" aria-label="Pasos del plan">
        {STEPS.map((label, i) => (
          <li key={label} aria-current={i === step ? 'step' : undefined} className={i < step ? 'done' : ''}>
            <span className="step-dot">{i < step ? <Check size={14} /> : i + 1}</span>
            <span>{label}</span>
            {i < STEPS.length - 1 && <span aria-hidden="true" style={{ color: '#cbd5e1' }}>—</span>}
          </li>
        ))}
      </ol>

      {step === 0 && (
        <section className="stack" aria-label="Contexto general">
          <div className="grid grid-2">
            <TextField id="p-product" label="Producto / servicio" required value={plan.product} onChange={(v) => set('product', v)} error={errors.product} />
            <TextField id="p-module" label="Pantalla / módulo" required value={plan.module} onChange={(v) => set('module', v)} error={errors.module} placeholder="Ej. Dashboard y Registro de prueba" />
          </div>
          <TextField id="p-objective" label="Objetivo del test" required multiline value={plan.objective} onChange={(v) => set('objective', v)} error={errors.objective} help="¿Por qué haces este test? ¿Qué decisión vas a tomar con los resultados?" />
          <TextField id="p-hyp" label="Preguntas o hipótesis a validar" multiline value={plan.hypotheses} onChange={(v) => set('hypotheses', v)} help="Ej. ¿Los usuarios encuentran la exportación sin ayuda?" />
          <TextField id="p-profile" label="Perfil de usuarios" required multiline value={plan.userProfile} onChange={(v) => set('userProfile', v)} error={errors.userProfile} placeholder="Ej. 5 estudiantes de 5to nivel, usuarios de laptop" />
          <div className="grid grid-3">
            <TextField id="p-method" label="Método" required value={plan.method} onChange={(v) => set('method', v)} error={errors.method} />
            <TextField id="p-duration" label="Duración" value={plan.duration} onChange={(v) => set('duration', v)} />
            <TextField id="p-date" label="Fecha" type="date" value={plan.date} onChange={(v) => set('date', v)} />
            <TextField id="p-location" label="Lugar / canal" value={plan.location} onChange={(v) => set('location', v)} />
            <div className="field">
              <label htmlFor="p-version">Versión a evaluar</label>
              <select id="p-version" className="control" value={plan.appVersion} onChange={(e) => set('appVersion', e.target.value as 'v1' | 'v2')}>
                <option value="v1">v1 · Inicial</option>
                <option value="v2">v2 · Rediseño</option>
              </select>
              <span className="field-help">Las sesiones heredan esta versión para la comparativa</span>
            </div>
          </div>
        </section>
      )}

      {step === 1 && (
        <section className="stack" aria-label="Tareas del test">
          <p className="muted">Escribe cada tarea como un escenario realista, sin revelar la ubicación de la respuesta (evita tareas demasiado guiadas).</p>
          {errors.tasks && <p className="field-error">{errors.tasks}</p>}
          {plan.tasks.map((task, i) => (
            <fieldset key={i} className="card stack" style={{ background: '#f8fafc' }}>
              <legend className="row" style={{ gap: 8, padding: '0 6px' }}>
                <Badge variant="info">{task.code || `T${i + 1}`}</Badge>
                <span className="strong">Tarea {i + 1}</span>
              </legend>
              <div className="grid grid-3">
                <TextField id={`t-${i}-code`} label="Código" value={task.code} onChange={(v) => setTask(i, { code: v })} />
                <TextField id={`t-${i}-metric`} label="Métrica principal" value={task.metric} onChange={(v) => setTask(i, { metric: v })} />
                <TextField
                  id={`t-${i}-max`}
                  label="Tiempo objetivo (s)"
                  type="number"
                  value={task.maxTimeSeconds ? String(task.maxTimeSeconds) : ''}
                  onChange={(v) => setTask(i, { maxTimeSeconds: v ? Math.max(1, parseInt(v, 10) || 0) : undefined })}
                  help="Opcional: se resalta si se supera"
                />
              </div>
              <TextField id={`t-${i}-scenario`} label="Escenario / tarea (texto que se lee)" required multiline value={task.scenario} onChange={(v) => setTask(i, { scenario: v })} error={errors[`task-${i}-scenario`]} />
              <div className="grid grid-2">
                <TextField id={`t-${i}-expected`} label="Resultado esperado" required value={task.expectedResult} onChange={(v) => setTask(i, { expectedResult: v })} error={errors[`task-${i}-expected`]} />
                <TextField id={`t-${i}-criteria`} label="Criterio de éxito" required value={task.successCriteria} onChange={(v) => setTask(i, { successCriteria: v })} error={errors[`task-${i}-criteria`]} placeholder="Ej. Sin ayuda en menos de 30 s" />
              </div>
              <TextField id={`t-${i}-follow`} label="Pregunta de seguimiento" value={task.followUpQuestion} onChange={(v) => setTask(i, { followUpQuestion: v })} placeholder="¿Qué esperabas encontrar en esta pantalla?" />
              {plan.tasks.length > 1 && (
                <div>
                  <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<Trash2 size={14} />}
                    onClick={() => setPlan((p) => ({ ...p, tasks: p.tasks.filter((_, idx) => idx !== i) }))}
                  >
                    Quitar tarea {task.code}
                  </Button>
                </div>
              )}
            </fieldset>
          ))}
          <div>
            <Button
              variant="secondary"
              leftIcon={<Plus size={16} />}
              onClick={() => setPlan((p) => ({ ...p, tasks: [...p.tasks, EMPTY_TASK(p.tasks.length + 1)] }))}
              disabled={plan.tasks.length >= 10}
            >
              Agregar tarea
            </Button>
            <span className="muted" style={{ marginLeft: 8 }}>Recomendado: 3 a 5 tareas (12–15 min de sesión)</span>
          </div>
        </section>
      )}

      {step === 2 && (
        <section className="stack" aria-label="Roles, logística y checklist">
          <div className="grid grid-2">
            <TextField id="p-mod" label="Moderador" value={plan.moderator} onChange={(v) => set('moderator', v)} />
            <TextField id="p-obs" label="Observador / note taker" value={plan.observer} onChange={(v) => set('observer', v)} />
            <TextField id="p-tool" label="Herramienta / prototipo" value={plan.tool} onChange={(v) => set('tool', v)} />
            <TextField id="p-link" label="Enlace / archivo" value={plan.link} onChange={(v) => set('link', v)} />
          </div>
          <TextField id="p-notes" label="Notas del moderador" multiline value={plan.moderatorNotes} onChange={(v) => set('moderatorNotes', v)} help="Recordatorios, riesgos o sesgos a evitar durante la sesión" />
          <fieldset className="card stack-sm" style={{ background: '#f8fafc' }}>
            <legend className="strong" style={{ padding: '0 6px' }}>Revisión antes del test</legend>
            <div className="grid grid-2">
              <div className="stack-sm">
                <label className="check">
                  <input type="checkbox" checked={plan.checklist.emailParticipants} onChange={(e) => setCheck({ emailParticipants: e.target.checked })} />
                  Correo enviado a participantes
                </label>
                {plan.checklist.emailParticipants && (
                  <input aria-label="Fecha de envío del correo" type="date" className="control control-sm" value={plan.checklist.emailDate ?? ''} onChange={(e) => setCheck({ emailDate: e.target.value })} />
                )}
                <label className="check">
                  <input type="checkbox" checked={plan.checklist.reminder1} onChange={(e) => setCheck({ reminder1: e.target.checked })} />
                  Recordatorio #1
                </label>
                <label className="check">
                  <input type="checkbox" checked={plan.checklist.reminder2} onChange={(e) => setCheck({ reminder2: e.target.checked })} />
                  Recordatorio #2
                </label>
              </div>
              <div className="stack-sm">
                <label className="check">
                  <input type="checkbox" checked={plan.checklist.ethicalApproval} onChange={(e) => setCheck({ ethicalApproval: e.target.checked })} />
                  Aprobación ética preparada
                </label>
                <label className="check">
                  <input type="checkbox" checked={plan.checklist.consentForm} onChange={(e) => setCheck({ consentForm: e.target.checked })} />
                  Consentimiento de grabación preparado
                </label>
                <label className="check">
                  <input type="checkbox" checked={plan.checklist.usabilityChecklist} onChange={(e) => setCheck({ usabilityChecklist: e.target.checked })} />
                  Checklist de la sesión preparado
                </label>
              </div>
            </div>
          </fieldset>
        </section>
      )}

      {step === 3 && (
        <section className="stack" aria-label="Revisión del plan">
          <div className="grid grid-2">
            <div className="stack-sm">
              <span className="muted">Producto · módulo</span>
              <strong>
                {plan.product} · {plan.module}
              </strong>
              <span className="muted">Objetivo</span>
              <span>{plan.objective}</span>
              <span className="muted">Participantes</span>
              <span>{plan.userProfile}</span>
            </div>
            <div className="stack-sm">
              <span className="muted">Método · duración · fecha</span>
              <span>
                {plan.method} · {plan.duration || '—'} · {plan.date || '—'}
              </span>
              <span className="muted">Roles</span>
              <span>
                Moderador: {plan.moderator || '—'} · Observador: {plan.observer || '—'}
              </span>
              <span className="muted">Checklist</span>
              <span>
                {Object.entries(plan.checklist).filter(([k, v]) => typeof v === 'boolean' && v && !k.endsWith('Date')).length} de 6 ítems listos
              </span>
            </div>
          </div>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Escenario</th>
                  <th>Resultado esperado</th>
                  <th>Métrica</th>
                  <th>Criterio de éxito</th>
                </tr>
              </thead>
              <tbody>
                {plan.tasks.map((t) => (
                  <tr key={t.code}>
                    <td className="strong">{t.code}</td>
                    <td>{t.scenario}</td>
                    <td>{t.expectedResult}</td>
                    <td>{t.metric}</td>
                    <td>{t.successCriteria}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <div className="row-between" style={{ borderTop: '1px solid #e2e8f0', paddingTop: 16 }}>
        <Button variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <div className="row">
          {step > 0 && (
            <Button variant="secondary" leftIcon={<ArrowLeft size={16} />} onClick={() => setStep((s) => s - 1)}>
              Anterior
            </Button>
          )}
          {step < STEPS.length - 1 ? (
            <Button rightIcon={<ArrowRight size={16} />} onClick={next}>
              Siguiente
            </Button>
          ) : (
            <>
              <Button variant="secondary" isLoading={isSaving} onClick={() => save('borrador')} leftIcon={<Save size={16} />}>
                Guardar borrador
              </Button>
              <Button isLoading={isSaving} onClick={() => save(plan.status === 'borrador' ? 'listo' : plan.status)} leftIcon={<Check size={16} />}>
                Guardar plan listo
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
