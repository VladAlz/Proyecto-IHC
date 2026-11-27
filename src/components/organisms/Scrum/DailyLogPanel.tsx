import React, { useState } from 'react';
import { Save, Trash2 } from 'lucide-react';
import { Button } from '../../atoms/Button/Button';
import { LoadingState } from '../../molecules/PageState/PageState';
import { keys, useApiMutation, useDaily, useMembers } from '../../../hooks/useApi';
import { api } from '../../../services/api';
import { DailyInput, Sprint } from '../../../types';

const today = () => new Date().toISOString().slice(0, 10);

/** Daily Log (opcional en la guía): avance, siguiente paso e impedimentos por integrante */
export const DailyLogPanel: React.FC<{ sprint: Sprint }> = ({ sprint }) => {
  const daily = useDaily(sprint.id);
  const members = useMembers();
  const empty = (): DailyInput => ({ sprintId: sprint.id, member: '', date: today(), done: '', next: '', impediments: '' });
  const [form, setForm] = useState<DailyInput>(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const save = useApiMutation((v: DailyInput) => api.createDaily({ ...v, impediments: v.impediments?.trim() || undefined }), {
    invalidate: [keys.daily(sprint.id)],
    success: 'Registro diario guardado',
  });
  const remove = useApiMutation((id: string) => api.deleteDaily(id), { invalidate: [keys.daily(sprint.id)], success: 'Registro eliminado' });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (!form.member) er.member = 'Selecciona el integrante';
    if (!form.done.trim()) er.done = 'Indica qué avanzaste';
    if (!form.next.trim()) er.next = 'Indica tu siguiente paso';
    setErrors(er);
    if (Object.keys(er).length) return;
    save.mutate({ ...form, sprintId: sprint.id }, { onSuccess: () => setForm({ ...empty(), member: form.member }) });
  };

  const grouped = (daily.data ?? []).reduce<Record<string, typeof daily.data>>((acc, d) => {
    (acc[d.date] ||= []).push(d);
    return acc;
  }, {});

  return (
    <div className="grid layout-main-aside" style={{ gridTemplateColumns: undefined }}>
      <div className="card stack">
        <h3 className="card-title">Historial del sprint {sprint.number}</h3>
        {daily.isLoading ? (
          <LoadingState />
        ) : !daily.data?.length ? (
          <p className="empty">Aún no hay registros diarios para este sprint.</p>
        ) : (
          Object.entries(grouped).map(([date, items]) => (
            <section key={date} className="stack-sm">
              <h4 className="strong small">{new Date(`${date}T12:00:00`).toLocaleDateString('es-EC', { weekday: 'long', day: 'numeric', month: 'long' })}</h4>
              {items!.map((d) => (
                <article key={d.id} className="card" style={{ padding: 12, background: '#f8fafc' }}>
                  <div className="row-between">
                    <strong>{d.member}</strong>
                    <button type="button" className="icon-btn" aria-label={`Eliminar registro de ${d.member}`} onClick={() => confirm('¿Eliminar este registro?') && remove.mutate(d.id)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <p className="small">
                    <strong>Avance:</strong> {d.done}
                  </p>
                  <p className="small">
                    <strong>Siguiente:</strong> {d.next}
                  </p>
                  {d.impediments && (
                    <p className="small" style={{ color: '#b91c1c' }}>
                      <strong>Impedimento:</strong> {d.impediments}
                    </p>
                  )}
                </article>
              ))}
            </section>
          ))
        )}
      </div>

      <form className="card stack" onSubmit={submit} noValidate aria-label="Nuevo registro diario">
        <h3 className="card-title">Nuevo registro</h3>
        <div className="field">
          <label htmlFor="dl-member">
            Integrante<span className="req">*</span>
          </label>
          <select id="dl-member" className="control" value={form.member} onChange={(e) => setForm({ ...form, member: e.target.value })} aria-invalid={Boolean(errors.member)}>
            <option value="">Selecciona…</option>
            {members.data?.map((m) => (
              <option key={m.id} value={m.name}>
                {m.name}
              </option>
            ))}
          </select>
          {errors.member && <span className="field-error">{errors.member}</span>}
        </div>
        <div className="field">
          <label htmlFor="dl-date">Fecha</label>
          <input id="dl-date" type="date" className="control" value={form.date} min={sprint.startDate} max={sprint.endDate} onChange={(e) => setForm({ ...form, date: e.target.value })} />
        </div>
        <div className="field">
          <label htmlFor="dl-done">
            ¿Qué avancé?<span className="req">*</span>
          </label>
          <textarea id="dl-done" className="control" rows={2} value={form.done} onChange={(e) => setForm({ ...form, done: e.target.value })} aria-invalid={Boolean(errors.done)} />
          {errors.done && <span className="field-error">{errors.done}</span>}
        </div>
        <div className="field">
          <label htmlFor="dl-next">
            ¿Qué haré después?<span className="req">*</span>
          </label>
          <textarea id="dl-next" className="control" rows={2} value={form.next} onChange={(e) => setForm({ ...form, next: e.target.value })} aria-invalid={Boolean(errors.next)} />
          {errors.next && <span className="field-error">{errors.next}</span>}
        </div>
        <div className="field">
          <label htmlFor="dl-imp">Impedimentos</label>
          <textarea id="dl-imp" className="control" rows={2} value={form.impediments ?? ''} onChange={(e) => setForm({ ...form, impediments: e.target.value })} />
        </div>
        <Button type="submit" leftIcon={<Save size={16} />} isLoading={save.isPending}>
          Guardar registro
        </Button>
      </form>
    </div>
  );
};
