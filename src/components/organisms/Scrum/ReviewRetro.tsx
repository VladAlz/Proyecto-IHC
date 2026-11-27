import React, { useEffect, useState } from 'react';
import { Save, Wand2 } from 'lucide-react';
import { Button } from '../../atoms/Button/Button';
import { Badge } from '../../atoms/Badge/Badge';
import { SCRUM_DEPENDENTS, useApiMutation, useSprintSummary } from '../../../hooks/useApi';
import { api } from '../../../services/api';
import { Sprint, SprintInput } from '../../../types';

type Fields = Pick<Sprint, 'reviewCompleted' | 'reviewPending' | 'reviewDelivered' | 'retroWentWell' | 'retroWentWrong' | 'retroAgreements'>;

const Area: React.FC<{ id: string; label: string; help: string; value?: string | null; onChange: (v: string) => void }> = ({ id, label, help, value, onChange }) => (
  <div className="field">
    <label htmlFor={id}>{label}</label>
    <textarea id={id} className="control" rows={4} value={value ?? ''} onChange={(e) => onChange(e.target.value)} />
    <span className="field-help">{help}</span>
  </div>
);

/** Sprint Review y Retrospectiva (HU-08): qué se terminó, qué quedó pendiente, qué se entregó, y acuerdos */
export const ReviewRetro: React.FC<{ sprint: Sprint }> = ({ sprint }) => {
  const summary = useSprintSummary(sprint.id);
  const [form, setForm] = useState<Fields>({});
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    setForm({
      reviewCompleted: sprint.reviewCompleted,
      reviewPending: sprint.reviewPending,
      reviewDelivered: sprint.reviewDelivered,
      retroWentWell: sprint.retroWentWell,
      retroWentWrong: sprint.retroWentWrong,
      retroAgreements: sprint.retroAgreements,
    });
    setDirty(false);
  }, [sprint]);

  const save = useApiMutation((body: SprintInput) => api.updateSprint(sprint.id, body), {
    invalidate: SCRUM_DEPENDENTS,
    success: 'Review y retrospectiva guardadas',
  });

  const set = (k: keyof Fields) => (v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setDirty(true);
  };

  const prefill = () => {
    const stories = summary.data?.stories ?? [];
    const done = stories.filter((s) => s.status === 'hecha');
    const pending = stories.filter((s) => s.status !== 'hecha');
    setForm((f) => ({
      ...f,
      reviewCompleted: done.map((s) => `• ${s.code}: ${s.title}`).join('\n') || f.reviewCompleted,
      reviewPending: pending.map((s) => `• ${s.code}: ${s.title}`).join('\n') || f.reviewPending,
      reviewDelivered: f.reviewDelivered || sprint.deliverables || '',
    }));
    setDirty(true);
  };

  // Cadena vacía (no undefined) para que borrar un campo también se guarde
  const strip = (v?: string | null) => (v ?? '').trim();

  return (
    <div className="stack">
      {summary.data && (
        <div className="row">
          <Badge variant="success">{summary.data.stories.filter((s) => s.status === 'hecha').length} historias hechas</Badge>
          <Badge variant="warning">{summary.data.stories.filter((s) => s.status !== 'hecha').length} pendientes</Badge>
          <Badge variant="info">
            {summary.data.totals.done}/{summary.data.totals.tasks} tareas · {summary.data.totals.realHours} h reales
          </Badge>
        </div>
      )}
      <section className="card stack" aria-labelledby="rv-title">
        <div className="row-between">
          <h3 id="rv-title" className="card-title">
            Sprint Review
          </h3>
          <Button variant="secondary" size="sm" leftIcon={<Wand2 size={14} />} onClick={prefill}>
            Rellenar desde las historias del sprint
          </Button>
        </div>
        <div className="grid grid-3">
          <Area id="rv-done" label="¿Qué se terminó?" help="Historias e incrementos completados" value={form.reviewCompleted} onChange={set('reviewCompleted')} />
          <Area id="rv-pend" label="¿Qué quedó pendiente?" help="Lo que vuelve al backlog o pasa al siguiente sprint" value={form.reviewPending} onChange={set('reviewPending')} />
          <Area id="rv-deliv" label="¿Qué funcionalidad se entregó?" help="Demostrado al docente / Product Owner" value={form.reviewDelivered} onChange={set('reviewDelivered')} />
        </div>
      </section>
      <section className="card stack" aria-labelledby="rt-title">
        <h3 id="rt-title" className="card-title">
          Retrospectiva
        </h3>
        <div className="grid grid-3">
          <Area id="rt-well" label="¿Qué salió bien?" help="Prácticas a mantener" value={form.retroWentWell} onChange={set('retroWentWell')} />
          <Area id="rt-wrong" label="¿Qué salió mal?" help="Problemas e impedimentos del sprint" value={form.retroWentWrong} onChange={set('retroWentWrong')} />
          <Area id="rt-agree" label="Acuerdos para el siguiente sprint" help="Acciones concretas con responsable" value={form.retroAgreements} onChange={set('retroAgreements')} />
        </div>
      </section>
      <div className="row" style={{ justifyContent: 'flex-end' }}>
        {dirty && <span className="muted">Hay cambios sin guardar</span>}
        <Button
          leftIcon={<Save size={16} />}
          isLoading={save.isPending}
          disabled={!dirty}
          onClick={() =>
            save.mutate(
              {
                reviewCompleted: strip(form.reviewCompleted),
                reviewPending: strip(form.reviewPending),
                reviewDelivered: strip(form.reviewDelivered),
                retroWentWell: strip(form.retroWentWell),
                retroWentWrong: strip(form.retroWentWrong),
                retroAgreements: strip(form.retroAgreements),
              },
              { onSuccess: () => setDirty(false) },
            )
          }
        >
          Guardar review y retrospectiva
        </Button>
      </div>
    </div>
  );
};
