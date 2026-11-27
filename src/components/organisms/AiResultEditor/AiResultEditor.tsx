import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Badge } from '../../atoms/Badge/Badge';
import { AiAnalysisResult, AiFinding, AiRecommendation, AiUserStory, NIELSEN_HEURISTICS, Priority, SEVERITY_LABELS, Severity, UX_CATEGORIES } from '../../../types';

export interface Selection {
  findings: boolean[];
  stories: boolean[];
  /** índice del hallazgo que originó cada historia (-1 = ninguno) */
  storyFinding: number[];
}

const PRIORITIES: Priority[] = ['Alta', 'Media', 'Baja'];

/**
 * Organismo AiResultEditor — co-creación: el investigador revisa y edita cada campo
 * generado por la IA antes de llevarlo al sistema o exportarlo (la IA complementa, no reemplaza).
 * - Contenido IA diferenciado visualmente (acento violeta + etiqueta "IA").
 * - Casillas para elegir qué hallazgos e historias se registran (control del usuario, Nielsen #3).
 */
export const AiResultEditor: React.FC<{
  result: AiAnalysisResult;
  onChange: (r: AiAnalysisResult) => void;
  selection: Selection;
  onSelectionChange: (s: Selection) => void;
}> = ({ result, onChange, selection, onSelectionChange }) => {
  const setFinding = (i: number, patch: Partial<AiFinding>) =>
    onChange({ ...result, hallazgos: result.hallazgos.map((h, idx) => (idx === i ? { ...h, ...patch } : h)) });
  const setRec = (i: number, patch: Partial<AiRecommendation>) =>
    onChange({ ...result, recomendaciones: result.recomendaciones.map((r, idx) => (idx === i ? { ...r, ...patch } : r)) });
  const setStory = (i: number, patch: Partial<AiUserStory>) =>
    onChange({ ...result, historias_usuario: result.historias_usuario.map((h, idx) => (idx === i ? { ...h, ...patch } : h)) });

  const toggle = (key: 'findings' | 'stories', i: number) =>
    onSelectionChange({ ...selection, [key]: selection[key].map((v, idx) => (idx === i ? !v : v)) });

  return (
    <div className="stack" style={{ gap: 20 }}>
      <section className="card ai-surface stack-sm" aria-labelledby="ai-sum">
        <div className="row-between">
          <h3 id="ai-sum" className="card-title">
            Resumen de la sesión <span className="ai-chip">IA</span>
          </h3>
        </div>
        <label htmlFor="ai-resumen" className="sr-only">
          Resumen
        </label>
        <textarea id="ai-resumen" className="control" rows={4} value={result.resumen} onChange={(e) => onChange({ ...result, resumen: e.target.value })} />
      </section>

      <section aria-labelledby="ai-find" className="stack">
        <div className="row-between">
          <h3 id="ai-find" className="card-title">
            Hallazgos clasificados ({result.hallazgos.length}) <span className="ai-chip">IA</span>
          </h3>
          <span className="muted">Marca los que quieres registrar en la matriz de hallazgos</span>
        </div>
        {result.hallazgos.length === 0 && <p className="empty card">La IA no identificó hallazgos con la evidencia enviada.</p>}
        {result.hallazgos.map((h, i) => (
          <article key={i} className="card ai-surface stack-sm">
            <div className="row-between">
              <label className="check strong">
                <input type="checkbox" checked={selection.findings[i] ?? false} onChange={() => toggle('findings', i)} />
                Registrar hallazgo {i + 1}
              </label>
              <Badge severity={h.severidad}>
                {h.severidad} · {SEVERITY_LABELS[h.severidad]}
              </Badge>
            </div>
            <div className="field">
              <label htmlFor={`h-${i}-t`}>Título</label>
              <input id={`h-${i}-t`} className="control" value={h.titulo} onChange={(e) => setFinding(i, { titulo: e.target.value })} />
            </div>
            <div className="field">
              <label htmlFor={`h-${i}-d`}>Descripción</label>
              <textarea id={`h-${i}-d`} className="control" rows={2} value={h.descripcion} onChange={(e) => setFinding(i, { descripcion: e.target.value })} />
            </div>
            <div className="grid grid-4">
              <div className="field">
                <label htmlFor={`h-${i}-s`}>Severidad</label>
                <select id={`h-${i}-s`} className="control" value={h.severidad} onChange={(e) => setFinding(i, { severidad: Number(e.target.value) as Severity })}>
                  {([4, 3, 2, 1] as Severity[]).map((s) => (
                    <option key={s} value={s}>
                      {s} · {SEVERITY_LABELS[s]}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor={`h-${i}-c`}>Categoría</label>
                <select id={`h-${i}-c`} className="control" value={h.categoria} onChange={(e) => setFinding(i, { categoria: e.target.value })}>
                  {UX_CATEGORIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor={`h-${i}-p`}>Pantalla</label>
                <input id={`h-${i}-p`} className="control" value={h.pantalla} onChange={(e) => setFinding(i, { pantalla: e.target.value })} />
              </div>
              <div className="field">
                <label htmlFor={`h-${i}-f`}>Frecuencia</label>
                <input id={`h-${i}-f`} className="control" value={h.frecuencia ?? ''} onChange={(e) => setFinding(i, { frecuencia: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-2">
              <div className="field">
                <label htmlFor={`h-${i}-h`}>Heurística</label>
                <select id={`h-${i}-h`} className="control" value={h.heuristica} onChange={(e) => setFinding(i, { heuristica: e.target.value })}>
                  {!NIELSEN_HEURISTICS.includes(h.heuristica) && <option>{h.heuristica}</option>}
                  {NIELSEN_HEURISTICS.map((n) => (
                    <option key={n}>{n}</option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor={`h-${i}-e`}>Evidencia</label>
                <input id={`h-${i}-e`} className="control" value={h.evidencia} onChange={(e) => setFinding(i, { evidencia: e.target.value })} />
              </div>
            </div>
          </article>
        ))}
      </section>

      <section aria-labelledby="ai-rec" className="card ai-surface stack">
        <div className="row-between">
          <h3 id="ai-rec" className="card-title">
            Recomendaciones por pantalla <span className="ai-chip">IA</span>
          </h3>
          <button
            type="button"
            className="icon-btn"
            aria-label="Agregar recomendación"
            title="Agregar recomendación"
            onClick={() => onChange({ ...result, recomendaciones: [...result.recomendaciones, { pantalla: '', recomendacion: '', fundamento: '', prioridad: 'Media' }] })}
          >
            <Plus size={16} />
          </button>
        </div>
        {result.recomendaciones.map((r, i) => (
          <div key={i} className="grid" style={{ gridTemplateColumns: 'minmax(120px,1fr) minmax(200px,3fr) minmax(90px,110px) 36px', alignItems: 'start' }}>
            <input aria-label={`Pantalla de la recomendación ${i + 1}`} className="control control-sm" value={r.pantalla} placeholder="Pantalla" onChange={(e) => setRec(i, { pantalla: e.target.value })} />
            <div className="stack-sm">
              <textarea aria-label={`Recomendación ${i + 1}`} className="control control-sm" rows={2} value={r.recomendacion} onChange={(e) => setRec(i, { recomendacion: e.target.value })} />
              <input aria-label={`Fundamento de la recomendación ${i + 1}`} className="control control-sm" value={r.fundamento} placeholder="Fundamento IHC" onChange={(e) => setRec(i, { fundamento: e.target.value })} />
            </div>
            <select aria-label={`Prioridad de la recomendación ${i + 1}`} className="control control-sm" value={r.prioridad} onChange={(e) => setRec(i, { prioridad: e.target.value as Priority })}>
              {PRIORITIES.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
            <button
              type="button"
              className="icon-btn"
              aria-label={`Quitar recomendación ${i + 1}`}
              onClick={() => onChange({ ...result, recomendaciones: result.recomendaciones.filter((_, idx) => idx !== i) })}
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </section>

      <section aria-labelledby="ai-hu" className="stack">
        <div className="row-between">
          <h3 id="ai-hu" className="card-title">
            Historias de usuario sugeridas ({result.historias_usuario.length}) <span className="ai-chip">IA</span>
          </h3>
          <span className="muted">Las marcadas se envían al Product Backlog</span>
        </div>
        {result.historias_usuario.map((h, i) => (
          <article key={i} className="card ai-surface stack-sm">
            <div className="row-between">
              <label className="check strong">
                <input type="checkbox" checked={selection.stories[i] ?? false} onChange={() => toggle('stories', i)} />
                Enviar historia {i + 1} al backlog
              </label>
              <Badge variant={h.prioridad === 'Alta' ? 'danger' : h.prioridad === 'Media' ? 'warning' : 'default'}>Prioridad {h.prioridad}</Badge>
            </div>
            <div className="field">
              <label htmlFor={`s-${i}-t`}>Historia (Como…, quiero…, para…)</label>
              <textarea id={`s-${i}-t`} className="control" rows={2} value={h.titulo} onChange={(e) => setStory(i, { titulo: e.target.value })} />
            </div>
            <div className="field">
              <label htmlFor={`s-${i}-c`}>Criterio de aceptación</label>
              <textarea id={`s-${i}-c`} className="control" rows={2} value={h.criterio_aceptacion} onChange={(e) => setStory(i, { criterio_aceptacion: e.target.value })} />
            </div>
            <div className="grid grid-4">
              <div className="field">
                <label htmlFor={`s-${i}-p`}>Prioridad</label>
                <select id={`s-${i}-p`} className="control" value={h.prioridad} onChange={(e) => setStory(i, { prioridad: e.target.value as Priority })}>
                  {PRIORITIES.map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor={`s-${i}-m`}>Módulo</label>
                <select id={`s-${i}-m`} className="control" value={h.modulo} onChange={(e) => setStory(i, { modulo: e.target.value })}>
                  {['Eval.', 'Dash.', 'IA', 'SCRUM', 'UI'].includes(h.modulo) ? null : <option>{h.modulo}</option>}
                  {['Eval.', 'Dash.', 'IA', 'SCRUM', 'UI'].map((m) => (
                    <option key={m}>{m}</option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor={`s-${i}-bv`}>Valor de negocio</label>
                <input id={`s-${i}-bv`} type="number" min={1} max={10} className="control" value={h.valor_negocio} onChange={(e) => setStory(i, { valor_negocio: Math.min(10, Math.max(1, parseInt(e.target.value, 10) || 1)) })} />
              </div>
              <div className="field">
                <label htmlFor={`s-${i}-sp`}>Story points</label>
                <select id={`s-${i}-sp`} className="control" value={h.story_points} onChange={(e) => setStory(i, { story_points: Number(e.target.value) })}>
                  {[1, 2, 3, 5, 8, 13].map((n) => (
                    <option key={n}>{n}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-2">
              <div className="field">
                <label htmlFor={`s-${i}-tk`}>Tareas sugeridas (una por línea)</label>
                <textarea
                  id={`s-${i}-tk`}
                  className="control"
                  rows={3}
                  value={h.tareas.join('\n')}
                  onChange={(e) => setStory(i, { tareas: e.target.value.split('\n') })}
                />
              </div>
              <div className="field">
                <label htmlFor={`s-${i}-f`}>Hallazgo de origen (trazabilidad)</label>
                <select
                  id={`s-${i}-f`}
                  className="control"
                  value={selection.storyFinding[i] ?? -1}
                  onChange={(e) => onSelectionChange({ ...selection, storyFinding: selection.storyFinding.map((v, idx) => (idx === i ? Number(e.target.value) : v)) })}
                >
                  <option value={-1}>Sin vínculo</option>
                  {result.hallazgos.map((f, fi) => (
                    <option key={fi} value={fi} disabled={!selection.findings[fi]}>
                      Hallazgo {fi + 1}: {f.titulo.slice(0, 60)}
                      {!selection.findings[fi] ? ' (no marcado)' : ''}
                    </option>
                  ))}
                </select>
                <span className="field-help">Al terminar las tareas de la historia, el hallazgo pasa a «Resuelto»</span>
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
};
