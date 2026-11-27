import React, { useState } from 'react';
import { ArrowDownRight, ArrowUpRight, FileSpreadsheet, Minus, Save, Trash2 } from 'lucide-react';
import { Button } from '../components/atoms/Button/Button';
import { Badge } from '../components/atoms/Badge/Badge';
import { PairBarList } from '../components/molecules/BarList/BarList';
import { ErrorState, LoadingState, PageHeader } from '../components/molecules/PageState/PageState';
import { RedesignEvidence } from '../components/organisms/RedesignEvidence/RedesignEvidence';
import { keys, useApiMutation, useComparison, useMatrix } from '../hooks/useApi';
import { api } from '../services/api';
import { downloadText, toCsv } from '../utils/report';
import { AppVersion, MATRIX_CRITERIA, MatrixScores } from '../types';
import { tokens } from '../styles/tokens';

const DeltaTile: React.FC<{ label: string; iso: string; before: number; after: number; unit: string; higherIsBetter: boolean; hasData: boolean }> = ({
  label,
  iso,
  before,
  after,
  unit,
  higherIsBetter,
  hasData,
}) => {
  const diff = Math.round((after - before) * 10) / 10;
  const improved = diff === 0 ? null : higherIsBetter ? diff > 0 : diff < 0;
  const color = improved === null ? tokens.colors.gray600 : improved ? '#166534' : '#b91c1c';
  const Icon = diff === 0 ? Minus : diff > 0 ? ArrowUpRight : ArrowDownRight;
  return (
    <div className="card stack-sm">
      <span className="muted">
        {label} · <em>{iso}</em>
      </span>
      <div className="row" style={{ gap: 8, alignItems: 'baseline' }}>
        <span style={{ fontSize: 16, color: 'var(--chart-v1)', fontWeight: 600 }} title="Antes (v1)">
          {before}
          {unit}
        </span>
        <span aria-hidden="true">→</span>
        <strong style={{ fontSize: 26, color: 'var(--chart-v2)' }} title="Después (v2)">
          {after}
          {unit}
        </strong>
      </div>
      {hasData ? (
        <span style={{ color, fontWeight: 600, fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <Icon size={16} aria-hidden="true" />
          {diff > 0 ? '+' : ''}
          {diff}
          {unit} · {improved === null ? 'sin cambio' : improved ? 'mejoró' : 'empeoró'}
        </span>
      ) : (
        <span className="muted">Faltan sesiones de alguna versión</span>
      )}
    </div>
  );
};

const EMPTY_SCORES: MatrixScores = { clarity: 3, learnability: 3, efficiency: 3, effectiveness: 3, errorPrevention: 3, satisfaction: 3 };

/**
 * Página Comparativa antes / después (HU-03)
 * Evidencia cuantitativa (ISO 9241-11 por versión y por tarea), matriz de usability test
 * (claridad, aprendizaje, eficiencia, eficacia, prevención de errores y satisfacción) y evidencia visual del rediseño.
 */
export const ComparisonPage: React.FC = () => {
  const comparison = useComparison();
  const matrix = useMatrix();
  const [form, setForm] = useState<{ appVersion: AppVersion; evaluator: string; notes: string } & MatrixScores>({
    appVersion: 'v2',
    evaluator: '',
    notes: '',
    ...EMPTY_SCORES,
  });
  const [formError, setFormError] = useState('');

  const create = useApiMutation(() => api.createMatrix({ ...form, evaluator: form.evaluator.trim(), notes: form.notes.trim() || undefined }), {
    invalidate: [keys.matrix, keys.comparison],
    success: 'Evaluación de la matriz registrada',
  });
  const remove = useApiMutation((id: string) => api.deleteMatrix(id), { invalidate: [keys.matrix, keys.comparison], success: 'Evaluación eliminada' });

  if (comparison.isLoading) return <LoadingState text="Comparando versiones…" />;
  if (comparison.isError) return <ErrorState error={comparison.error} onRetry={() => comparison.refetch()} />;
  const c = comparison.data!;
  const both = c.v1.totalTests > 0 && c.v2.totalTests > 0;

  const exportCsv = () =>
    downloadText(
      'comparativa-antes-despues.csv',
      toCsv([
        ['Indicador', 'Antes (v1)', 'Después (v2)', 'Diferencia'],
        ['Sesiones', c.v1.totalTests, c.v2.totalTests, c.v2.totalTests - c.v1.totalTests],
        ['Tasa de éxito (%)', c.v1.successRate, c.v2.successRate, c.deltas.successRate],
        ['Tiempo promedio (s)', c.v1.avgTime, c.v2.avgTime, c.deltas.avgTime],
        ['Errores promedio', c.v1.avgErrors, c.v2.avgErrors, c.deltas.avgErrors],
        ['Satisfacción (1-5)', c.v1.avgSatisfaction, c.v2.avgSatisfaction, c.deltas.avgSatisfaction],
        [],
        ['Criterio de la matriz (1-5)', 'Antes (v1)', 'Después (v2)'],
        ...MATRIX_CRITERIA.map((m) => [m.label, c.matrix.v1[m.key], c.matrix.v2[m.key]]),
        ['Promedio general', c.matrix.v1.overall, c.matrix.v2.overall],
        [],
        ['Tarea', 'Éxito v1 (%)', 'Éxito v2 (%)', 'Tiempo v1 (s)', 'Tiempo v2 (s)', 'Satisf. v1', 'Satisf. v2'],
        ...c.tasks.map((t) => [t.task, t.v1.successRate, t.v2.successRate, t.v1.avgTime, t.v2.avgTime, t.v1.avgSatisfaction, t.v2.avgSatisfaction]),
      ]),
      'text/csv;charset=utf-8',
    );

  return (
    <div className="page">
      <PageHeader
        module="comparison"
        title="Comparativa antes / después"
        description="Qué mejoró de la versión inicial (v1) al rediseño (v2)."
        actions={
          <Button variant="secondary" leftIcon={<FileSpreadsheet size={16} />} onClick={exportCsv}>
            Exportar CSV
          </Button>
        }
      />

      {!both && (
        <div className="alert alert-info" role="note">
          Para comparar necesitas sesiones de ambas versiones. Registra pruebas marcando la versión «v1» o «v2» (o crea un plan con la versión correspondiente).
        </div>
      )}

      <section className="grid grid-4" aria-label="Indicadores antes y después">
        <DeltaTile label="Tasa de éxito" iso="Efectividad" before={c.v1.successRate} after={c.v2.successRate} unit="%" higherIsBetter hasData={both} />
        <DeltaTile label="Tiempo promedio" iso="Eficiencia" before={c.v1.avgTime} after={c.v2.avgTime} unit=" s" higherIsBetter={false} hasData={both} />
        <DeltaTile label="Errores promedio" iso="Efectividad" before={c.v1.avgErrors} after={c.v2.avgErrors} unit="" higherIsBetter={false} hasData={both} />
        <DeltaTile label="Satisfacción" iso="Satisfacción" before={c.v1.avgSatisfaction} after={c.v2.avgSatisfaction} unit="" higherIsBetter hasData={both} />
      </section>
      <p className="muted">
        Base: {c.v1.totalTests} sesión(es) v1 y {c.v2.totalTests} sesión(es) v2.
        {both && c.deltas.timeImprovementPct !== 0 && ` El tiempo en tarea ${c.deltas.timeImprovementPct > 0 ? 'se redujo' : 'aumentó'} un ${Math.abs(c.deltas.timeImprovementPct)}%.`}
      </p>

      {c.tasks.length > 0 && (
        <section className="grid grid-2">
          <div className="card">
            <h2 className="card-title" style={{ marginBottom: 12 }}>
              Tiempo promedio por tarea (segundos)
            </h2>
            <PairBarList ariaLabel="Tiempo por tarea antes y después" items={c.tasks.map((t) => ({ label: t.task, before: t.v1.avgTime, after: t.v2.avgTime, format: (n) => `${n} s` }))} />
          </div>
          <div className="card">
            <h2 className="card-title" style={{ marginBottom: 12 }}>
              Tasa de éxito por tarea (%)
            </h2>
            <PairBarList ariaLabel="Éxito por tarea antes y después" max={100} items={c.tasks.map((t) => ({ label: t.task, before: t.v1.successRate, after: t.v2.successRate, format: (n) => `${n}%` }))} />
          </div>
        </section>
      )}

      <section className="grid layout-main-aside" aria-labelledby="mx-title">
        <div className="card stack">
          <div className="row-between">
            <div>
              <h2 id="mx-title" className="card-title">
                Matriz de usability test
              </h2>
              <p className="card-subtitle">
                Promedio por criterio (1 a 5) · v1: {c.matrix.v1.evaluations} evaluación(es) · v2: {c.matrix.v2.evaluations} evaluación(es)
              </p>
            </div>
            <div className="row">
              <Badge variant="default">v1: {c.matrix.v1.overall || '—'}</Badge>
              <Badge variant="info">v2: {c.matrix.v2.overall || '—'}</Badge>
            </div>
          </div>
          {c.matrix.v1.evaluations + c.matrix.v2.evaluations === 0 ? (
            <p className="empty">Registra la primera evaluación con el formulario para ver la comparación por criterio.</p>
          ) : (
            <PairBarList ariaLabel="Criterios de la matriz antes y después" max={5} items={MATRIX_CRITERIA.map((m) => ({ label: m.label, before: c.matrix.v1[m.key], after: c.matrix.v2[m.key] }))} />
          )}
          {matrix.data && matrix.data.length > 0 && (
            <details>
              <summary className="strong small" style={{ cursor: 'pointer' }}>
                Ver evaluaciones registradas ({matrix.data.length})
              </summary>
              <div className="table-wrap" style={{ marginTop: 8 }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Versión</th>
                      <th>Evaluador</th>
                      {MATRIX_CRITERIA.map((m) => (
                        <th key={m.key} className="num">
                          {m.label}
                        </th>
                      ))}
                      <th>Notas</th>
                      <th>
                        <span className="sr-only">Acciones</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {matrix.data.map((e) => (
                      <tr key={e.id}>
                        <td>{e.appVersion}</td>
                        <td>{e.evaluator}</td>
                        {MATRIX_CRITERIA.map((m) => (
                          <td key={m.key} className="num">
                            {e[m.key]}
                          </td>
                        ))}
                        <td className="muted">{e.notes}</td>
                        <td>
                          <button type="button" className="icon-btn" aria-label={`Eliminar evaluación de ${e.evaluator}`} onClick={() => confirm('¿Eliminar esta evaluación?') && remove.mutate(e.id)}>
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          )}
        </div>

        <form
          className="card stack"
          noValidate
          aria-label="Nueva evaluación de la matriz"
          onSubmit={(e) => {
            e.preventDefault();
            if (form.evaluator.trim().length < 2) {
              setFormError('Indica quién realiza la evaluación');
              return;
            }
            setFormError('');
            create.mutate(undefined, { onSuccess: () => setForm((f) => ({ ...f, evaluator: '', notes: '', ...EMPTY_SCORES })) });
          }}
        >
          <h3 className="card-title">Evaluar con la matriz</h3>
          <div className="grid grid-2">
            <div className="field">
              <label htmlFor="mx-v">Versión</label>
              <select id="mx-v" className="control" value={form.appVersion} onChange={(e) => setForm({ ...form, appVersion: e.target.value as AppVersion })}>
                <option value="v1">v1 · Inicial</option>
                <option value="v2">v2 · Rediseño</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="mx-ev">Evaluador</label>
              <input id="mx-ev" className="control" value={form.evaluator} onChange={(e) => setForm({ ...form, evaluator: e.target.value })} aria-invalid={Boolean(formError)} />
            </div>
          </div>
          {MATRIX_CRITERIA.map((m) => (
            <div key={m.key} className="field">
              <label htmlFor={`mx-${m.key}`} className="row-between">
                <span>{m.label}</span>
                <strong aria-hidden="true">{form[m.key]}/5</strong>
              </label>
              <input
                id={`mx-${m.key}`}
                type="range"
                min={1}
                max={5}
                step={1}
                value={form[m.key]}
                aria-valuetext={`${form[m.key]} de 5`}
                onChange={(e) => setForm({ ...form, [m.key]: Number(e.target.value) })}
                style={{ accentColor: tokens.colors.primary, minHeight: 32 }}
              />
            </div>
          ))}
          <div className="field">
            <label htmlFor="mx-notes">Notas</label>
            <textarea id="mx-notes" className="control" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
          {formError && (
            <span className="field-error" role="alert">
              {formError}
            </span>
          )}
          <Button type="submit" leftIcon={<Save size={16} />} isLoading={create.isPending}>
            Guardar evaluación
          </Button>
        </form>
      </section>

      <RedesignEvidence />
    </div>
  );
};
