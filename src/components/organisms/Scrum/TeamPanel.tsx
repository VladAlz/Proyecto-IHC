import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '../../atoms/Button/Button';
import { keys, useApiMutation, useMembers } from '../../../hooks/useApi';
import { api } from '../../../services/api';

/** Equipo SCRUM con horas disponibles por día (alimenta la capacidad del sprint) */
export const TeamPanel: React.FC = () => {
  const members = useMembers();
  const [form, setForm] = useState({ name: '', role: '', hoursPerDay: 2 });
  const [error, setError] = useState('');

  const create = useApiMutation(() => api.createMember({ ...form, name: form.name.trim(), role: form.role.trim() }), {
    invalidate: [keys.members],
    success: 'Integrante agregado',
  });
  const update = useApiMutation(({ id, hoursPerDay }: { id: string; hoursPerDay: number }) => api.updateMember(id, { hoursPerDay }), {
    invalidate: [keys.members, ['scrum']],
    success: 'Disponibilidad actualizada',
  });
  const remove = useApiMutation((id: string) => api.deleteMember(id), { invalidate: [keys.members], success: 'Integrante eliminado' });

  return (
    <div className="grid layout-main-aside">
      <div className="card">
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Integrante</th>
                <th>Rol</th>
                <th className="num">Horas por día</th>
                <th>
                  <span className="sr-only">Acciones</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {members.data?.map((m) => (
                <tr key={m.id}>
                  <td className="strong">{m.name}</td>
                  <td>{m.role}</td>
                  <td className="num">
                    <input
                      key={`${m.id}-${m.hoursPerDay}`}
                      aria-label={`Horas por día de ${m.name}`}
                      type="number"
                      min={0}
                      max={24}
                      step={0.5}
                      defaultValue={m.hoursPerDay}
                      className="control control-sm"
                      style={{ width: 80, textAlign: 'right' }}
                      onBlur={(e) => {
                        const v = Math.min(24, Math.max(0, parseFloat(e.target.value) || 0));
                        if (v !== m.hoursPerDay) update.mutate({ id: m.id, hoursPerDay: v });
                      }}
                    />
                  </td>
                  <td>
                    <button type="button" className="icon-btn" aria-label={`Eliminar a ${m.name}`} onClick={() => confirm(`¿Eliminar a ${m.name} del equipo?`) && remove.mutate(m.id)}>
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <form
        className="card stack"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          if (!form.name.trim() || !form.role.trim()) {
            setError('Nombre y rol son obligatorios');
            return;
          }
          setError('');
          create.mutate(undefined, { onSuccess: () => setForm({ name: '', role: '', hoursPerDay: 2 }) });
        }}
      >
        <h3 className="card-title">Agregar integrante</h3>
        <div className="field">
          <label htmlFor="tm-name">Nombre</label>
          <input id="tm-name" className="control" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div className="field">
          <label htmlFor="tm-role">Rol</label>
          <input id="tm-role" className="control" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="Ej. Desarrollador Frontend" />
        </div>
        <div className="field">
          <label htmlFor="tm-h">Horas por día</label>
          <input id="tm-h" type="number" min={0} max={24} step={0.5} className="control" value={form.hoursPerDay} onChange={(e) => setForm({ ...form, hoursPerDay: parseFloat(e.target.value) || 0 })} />
        </div>
        {error && <span className="field-error" role="alert">{error}</span>}
        <Button type="submit" leftIcon={<Plus size={16} />} isLoading={create.isPending}>
          Agregar
        </Button>
      </form>
    </div>
  );
};
