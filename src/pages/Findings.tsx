import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ListPlus, Pencil, Plus, Trash2 } from 'lucide-react';
import { Button } from '../components/atoms/Button/Button';
import { Badge } from '../components/atoms/Badge/Badge';
import { Modal } from '../components/molecules/Modal/Modal';
import { ErrorState, LoadingState, PageHeader } from '../components/molecules/PageState/PageState';
import { SCRUM_DEPENDENTS, keys, useApiMutation, useFindings } from '../hooks/useApi';
import { api } from '../services/api';
import {
  FINDING_STATUS_LABELS,
  FindingInput,
  FindingStatus,
  NIELSEN_HEURISTICS,
  SEVERITY_LABELS,
  Severity,
  UX_CATEGORIES,
  UsabilityFinding,
} from '../types';

const EMPTY: FindingInput = {
  severity: 2,
  heuristicViolated: NIELSEN_HEURISTICS[0],
  category: 'General',
  location: '',
  description: '',
  evidence: '',
  frequency: '',
  recommendation: '',
  theoreticalBasis: '',
  status: 'pendiente',
};

const SOURCE_LABEL = { manual: 'Manual', ia: 'IA', heuristica: 'Ev. heurística' } as const;

const FindingForm: React.FC<{ value: FindingInput; onChange: (v: FindingInput) => void; errors: Record<string, string> }> = ({ value, onChange, errors }) => {
  const set = <K extends keyof FindingInput>(k: K, v: FindingInput[K]) => onChange({ ...value, [k]: v });
  return (
    <div className="stack">
      <div className="grid grid-3">
        <div className="field">
          <label htmlFor="fd-sev">Severidad (Nielsen)</label>
          <select id="fd-sev" className="control" value={value.severity} onChange={(e) => set('severity', Number(e.target.value) as Severity)}>
            {([4, 3, 2, 1] as Severity[]).map((s) => (
              <option key={s} value={s}>
                {s} · {SEVERITY_LABELS[s]}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="fd-cat">Categoría UX</label>
          <select id="fd-cat" className="control" value={value.category} onChange={(e) => set('category', e.target.value)}>
            {UX_CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="fd-status">Estado</label>
          <select id="fd-status" className="control" value={value.status} onChange={(e) => set('status', e.target.value as FindingStatus)}>
            {(Object.keys(FINDING_STATUS_LABELS) as FindingStatus[]).map((s) => (
              <option key={s} value={s}>
                {FINDING_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid grid-2">
        <div className="field">
          <label htmlFor="fd-heur">Heurística violada</label>
          <select id="fd-heur" className="control" value={value.heuristicViolated} onChange={(e) => set('heuristicViolated', e.target.value)}>
            {NIELSEN_HEURISTICS.map((h) => (
              <option key={h}>{h}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="fd-loc">
            Pantalla / elemento<span className="req">*</span>
          </label>
          <input id="fd-loc" className="control" value={value.location} onChange={(e) => set('location', e.target.value)} aria-invalid={Boolean(errors.location)} />
          {errors.location && <span className="field-error">{errors.location}</span>}
        </div>
      </div>
      <div className="field">
        <label htmlFor="fd-desc">
          Problema detectado<span className="req">*</span>
        </label>
        <textarea id="fd-desc" className="control" rows={2} value={value.description} onChange={(e) => set('description', e.target.value)} aria-invalid={Boolean(errors.description)} />
        {errors.description && <span className="field-error">{errors.description}</span>}
      </div>
      <div className="grid grid-2">
        <div className="field">
          <label htmlFor="fd-ev">Evidencia observada</label>
          <input id="fd-ev" className="control" value={value.evidence ?? ''} onChange={(e) => set('evidence', e.target.value)} placeholder="Ej. 4 de 5 usuarios dudaron" />
        </div>
        <div className="field">
          <label htmlFor="fd-freq">Frecuencia</label>
          <input id="fd-freq" className="control" value={value.frequency ?? ''} onChange={(e) => set('frequency', e.target.value)} placeholder="Ej. 4/5" />
        </div>
      </div>
      <div className="field">
        <label htmlFor="fd-rec">
          Recomendación / mejora<span className="req">*</span>
        </label>
        <textarea id="fd-rec" className="control" rows={2} value={value.recommendation} onChange={(e) => set('recommendation', e.target.value)} aria-invalid={Boolean(errors.recommendation)} />
        {errors.recommendation && <span className="field-error">{errors.recommendation}</span>}
      </div>
      <div className="field">
        <label htmlFor="fd-basis">Fundamento IHC</label>
        <input id="fd-basis" className="control" value={value.theoreticalBasis ?? ''} onChange={(e) => set('theoreticalBasis', e.target.value)} placeholder="Ej. Ley de Fitts, Figura-Fondo, WCAG 1.4.3" />
      </div>
    </div>
  );
};

/**
 * Página Hallazgos y mejoras (hoja "Hallazgos y mejoras" de la plantilla)
 * Trazabilidad UX → SCRUM: cada hallazgo puede convertirse en historia del Product Backlog.
 */
export const FindingsPage: React.FC = () => {
  const navigate = useNavigate();
  const findings = useFindings();
  const [sev, setSev] = useState('');
  const [cat, setCat] = useState('');
  const [status, setStatus] = useState('');
  const [editing, setEditing] = useState<{ id?: string; value: FindingInput } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const save = useApiMutation(
    ({ id, value }: { id?: string; value: FindingInput }) => (id ? api.updateFinding(id, value) : api.createFinding(value)),
    { invalidate: [keys.findings, ['dashboard']], success: (_r, v) => (v.id ? 'Hallazgo actualizado' : 'Hallazgo registrado') },
  );
  const remove = useApiMutation((id: string) => api.deleteFinding(id), { invalidate: [keys.findings, ['dashboard']], success: 'Hallazgo eliminado' });
  const toStory = useApiMutation(
    (f: UsabilityFinding) =>
      api.createStory({
        title: `Como usuario, quiero que se corrija «${f.description.slice(0, 120)}» en ${f.location}, para completar mis tareas sin fricción.`,
        acceptanceCriteria: `Dado que uso ${f.location}, cuando realizo la tarea, entonces ${f.recommendation.charAt(0).toLowerCase()}${f.recommendation.slice(1)}`,
        priority: f.severity >= 3 ? 'Alta' : f.severity === 2 ? 'Media' : 'Baja',
        module: 'UI',
        businessValue: Math.min(10, 4 + f.severity * 1.5) | 0,
        storyPoints: f.severity >= 4 ? 5 : 3,
        source: 'hallazgo',
        findingId: f.id,
      }),
    { invalidate: SCRUM_DEPENDENTS, success: (s) => `Historia ${s.code} creada en el Product Backlog (puedes refinarla en SCRUM)` },
  );

  const rows = useMemo(
    () =>
      (findings.data ?? []).filter(
        (f) => (!sev || String(f.severity) === sev) && (!cat || f.category === cat) && (!status || f.status === status),
      ),
    [findings.data, sev, cat, status],
  );

  const submit = () => {
    if (!editing) return;
    const e: Record<string, string> = {};
    if (!editing.value.location.trim()) e.location = 'Indica dónde ocurre el problema';
    if (!editing.value.description.trim()) e.description = 'Describe el problema';
    if (!editing.value.recommendation.trim()) e.recommendation = 'Propón una mejora';
    setErrors(e);
    if (Object.keys(e).length) return;
    save.mutate(editing, { onSuccess: () => setEditing(null) });
  };

  return (
    <div className="page">
      <PageHeader
        module="findings"
        title="Hallazgos y mejoras"
        description="Problemas priorizados por severidad, listos para el backlog."
        actions={
          <Button
            leftIcon={<Plus size={16} />}
            onClick={() => {
              setErrors({});
              setEditing({ value: { ...EMPTY } });
            }}
          >
            Nuevo hallazgo
          </Button>
        }
      />

      <section className="card" style={{ padding: 14 }} aria-label="Filtros de hallazgos">
        <div className="row" style={{ alignItems: 'flex-end' }}>
          <div className="field" style={{ width: 180 }}>
            <label htmlFor="ff-sev">Severidad</label>
            <select id="ff-sev" className="control" value={sev} onChange={(e) => setSev(e.target.value)}>
              <option value="">Todas</option>
              {([4, 3, 2, 1] as Severity[]).map((s) => (
                <option key={s} value={s}>
                  {s} · {SEVERITY_LABELS[s]}
                </option>
              ))}
            </select>
          </div>
          <div className="field" style={{ width: 240 }}>
            <label htmlFor="ff-cat">Categoría</label>
            <select id="ff-cat" className="control" value={cat} onChange={(e) => setCat(e.target.value)}>
              <option value="">Todas</option>
              {UX_CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="field" style={{ width: 180 }}>
            <label htmlFor="ff-status">Estado</label>
            <select id="ff-status" className="control" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">Todos</option>
              {(Object.keys(FINDING_STATUS_LABELS) as FindingStatus[]).map((s) => (
                <option key={s} value={s}>
                  {FINDING_STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </div>
          <span className="muted" role="status">
            {rows.length} de {findings.data?.length ?? 0} hallazgos
          </span>
        </div>
      </section>

      {findings.isLoading ? (
        <LoadingState />
      ) : findings.isError ? (
        <ErrorState error={findings.error} onRetry={() => findings.refetch()} />
      ) : rows.length === 0 ? (
        <div className="card empty">
          No hay hallazgos con estos filtros.{' '}
          <Button size="sm" variant="secondary" onClick={() => navigate('/ai-assistant')}>
            Generarlos con el Asistente IA
          </Button>
        </div>
      ) : (
        <div className="table-wrap card" style={{ padding: 0 }}>
          <table className="table">
            <thead>
              <tr>
                <th>Severidad</th>
                <th>Problema</th>
                <th>Categoría · heurística</th>
                <th>Recomendación</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((f) => (
                <tr key={f.id}>
                  <td>
                    <Badge severity={f.severity}>
                      {f.severity} · {SEVERITY_LABELS[f.severity]}
                    </Badge>
                  </td>
                  <td style={{ minWidth: 240 }}>
                    <strong>{f.location}</strong>
                    <div>{f.description}</div>
                    {(f.evidence || f.frequency) && (
                      <div className="muted" style={{ marginTop: 4 }}>
                        {f.evidence} {f.frequency && `· Frecuencia: ${f.frequency}`}
                      </div>
                    )}
                  </td>
                  <td style={{ minWidth: 180 }}>
                    <div>{f.category}</div>
                    <div className="muted">{f.heuristicViolated}</div>
                    <Badge size="sm" variant={f.source === 'ia' ? 'info' : 'default'}>
                      {SOURCE_LABEL[f.source]}
                    </Badge>
                  </td>
                  <td style={{ minWidth: 220 }}>
                    {f.recommendation}
                    {f.theoreticalBasis && <div className="muted">{f.theoreticalBasis}</div>}
                  </td>
                  <td>
                    <Badge variant={f.status === 'resuelto' ? 'success' : f.status === 'en_backlog' ? 'info' : 'warning'}>
                      {FINDING_STATUS_LABELS[f.status]}
                    </Badge>
                  </td>
                  <td>
                    <div className="row" style={{ gap: 6, flexWrap: 'nowrap' }}>
                      <button
                        type="button"
                        className="icon-btn"
                        title="Crear historia de usuario"
                        aria-label={`Crear historia de usuario desde el hallazgo en ${f.location}`}
                        disabled={f.status !== 'pendiente' || toStory.isPending}
                        onClick={() => toStory.mutate(f)}
                      >
                        <ListPlus size={16} />
                      </button>
                      <button
                        type="button"
                        className="icon-btn"
                        title="Editar"
                        aria-label={`Editar hallazgo en ${f.location}`}
                        onClick={() => {
                          setErrors({});
                          const { id, createdAt: _c, source, ...value } = f;
                          setEditing({ id, value: { ...value, source } });
                        }}
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        type="button"
                        className="icon-btn"
                        title="Eliminar"
                        aria-label={`Eliminar hallazgo en ${f.location}`}
                        onClick={() => confirm('¿Eliminar este hallazgo?') && remove.mutate(f.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={Boolean(editing)}
        title={editing?.id ? 'Editar hallazgo' : 'Nuevo hallazgo'}
        description="Registra el problema, su evidencia y la mejora propuesta."
        onClose={() => setEditing(null)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditing(null)}>
              Cancelar
            </Button>
            <Button onClick={submit} isLoading={save.isPending}>
              Guardar hallazgo
            </Button>
          </>
        }
      >
        {editing && <FindingForm value={editing.value} onChange={(value) => setEditing({ ...editing, value })} errors={errors} />}
      </Modal>
    </div>
  );
};
