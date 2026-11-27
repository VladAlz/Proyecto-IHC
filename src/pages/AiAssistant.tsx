import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AlertTriangle, Copy, FileDown, History, Printer, Save, Send, Sparkles, Trash2 } from 'lucide-react';
import { Button } from '../components/atoms/Button/Button';
import { Badge } from '../components/atoms/Badge/Badge';
import { Spinner } from '../components/atoms/Spinner/Spinner';
import { PageHeader } from '../components/molecules/PageState/PageState';
import { ResultBadge } from '../components/molecules/ResultSelector/ResultSelector';
import { useToast } from '../components/molecules/Toast/Toast';
import { AiResultEditor, Selection } from '../components/organisms/AiResultEditor/AiResultEditor';
import { SCRUM_DEPENDENTS, keys, useAiStatus, useAnalyses, useApiMutation, usePlans, useTests } from '../hooks/useApi';
import { api } from '../services/api';
import { analysisToMarkdown, downloadText, providerLabel, slug } from '../utils/report';
import { AiAnalysis, AiAnalysisResult, AnalyzeRequest, AppVersion, SEVERITY_LABELS, TaskResult } from '../types';

const STAGES = ['Reuniendo sesiones y métricas…', 'Consultando al modelo de IA…', 'Validando el JSON de respuesta…', 'Clasificando hallazgos por severidad…'];

const defaultSelection = (r: AiAnalysisResult): Selection => ({
  findings: r.hallazgos.map((h) => h.severidad >= 2),
  stories: r.historias_usuario.map(() => true),
  storyFinding: r.historias_usuario.map((_, i) => (i < r.hallazgos.length && r.hallazgos[i].severidad >= 2 ? i : -1)),
});

/** Reporte para imprimir / guardar como PDF (pipeline JSON → PDF) */
const PrintReport: React.FC<{ analysis: AiAnalysis; result: AiAnalysisResult }> = ({ analysis, result }) => (
  <div className="print-area print-only" aria-hidden="true" style={{ fontSize: 12, color: '#0f172a' }}>
    <h1 style={{ fontSize: 22 }}>{analysis.title}</h1>
    <p style={{ color: '#475569' }}>
      Usability Test Dashboard · Grupo 4 IHC · {new Date(analysis.createdAt).toLocaleString('es-EC')} · {providerLabel(analysis.meta.provider)} ({analysis.meta.model}) ·{' '}
      {analysis.meta.sessions} sesión(es){analysis.edited ? ' · Revisado por el equipo' : ''}
    </p>
    <h2 style={{ fontSize: 16, marginTop: 16 }}>Resumen</h2>
    <p>{result.resumen}</p>
    <h2 style={{ fontSize: 16, marginTop: 16 }}>Hallazgos priorizados</h2>
    <table className="table" style={{ fontSize: 11 }}>
      <thead>
        <tr>
          <th>Sev.</th>
          <th>Hallazgo</th>
          <th>Categoría / heurística</th>
          <th>Pantalla</th>
          <th>Evidencia</th>
        </tr>
      </thead>
      <tbody>
        {result.hallazgos.map((h, i) => (
          <tr key={i}>
            <td>
              {h.severidad} · {SEVERITY_LABELS[h.severidad]}
            </td>
            <td>
              <strong>{h.titulo}</strong>
              <div>{h.descripcion}</div>
            </td>
            <td>
              {h.categoria}
              <div>{h.heuristica}</div>
            </td>
            <td>{h.pantalla}</td>
            <td>
              {h.evidencia} {h.frecuencia && `(${h.frecuencia})`}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
    <h2 style={{ fontSize: 16, marginTop: 16 }}>Recomendaciones</h2>
    <ul style={{ paddingLeft: 18 }}>
      {result.recomendaciones.map((r, i) => (
        <li key={i}>
          <strong>
            [{r.prioridad}] {r.pantalla}:
          </strong>{' '}
          {r.recomendacion} {r.fundamento && <em>({r.fundamento})</em>}
        </li>
      ))}
    </ul>
    <h2 style={{ fontSize: 16, marginTop: 16 }}>Historias de usuario sugeridas</h2>
    {result.historias_usuario.map((h, i) => (
      <div key={i} style={{ marginBottom: 10, breakInside: 'avoid' }}>
        <strong>
          HU {i + 1} · {h.prioridad} · {h.modulo} · BV {h.valor_negocio} · SP {h.story_points}
        </strong>
        <div>{h.titulo}</div>
        <div>
          <em>Criterio:</em> {h.criterio_aceptacion}
        </div>
        {h.tareas.filter((t) => t.trim()).length > 0 && (
          <ul style={{ paddingLeft: 18 }}>
            {h.tareas
              .filter((t) => t.trim())
              .map((t, ti) => (
                <li key={ti}>☐ {t}</li>
              ))}
          </ul>
        )}
      </div>
    ))}
  </div>
);

/**
 * Página Asistente IA (HU-04, HU-05, HU-12)
 * Entradas: sesiones registradas, un plan completo o comentarios en texto libre.
 * Salidas: resumen, hallazgos por categoría y severidad, recomendaciones por pantalla e historias de usuario,
 * editables antes de enviarlas al backlog o exportarlas a Markdown / PDF.
 */
export const AiAssistantPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const routeState = (location.state as { testIds?: string[]; planId?: string } | null) ?? {};

  const [version, setVersion] = useState<'' | AppVersion>('');
  const [resultFilter, setResultFilter] = useState<'' | TaskResult>('');
  const tests = useTests();
  const plans = usePlans();
  const status = useAiStatus();
  const history = useAnalyses();

  const [selected, setSelected] = useState<Set<string>>(new Set(routeState.testIds ?? []));
  const [planId, setPlanId] = useState(routeState.planId ?? '');
  const [freeText, setFreeText] = useState('');
  const [context, setContext] = useState('');
  const [stage, setStage] = useState(0);

  const [analysis, setAnalysis] = useState<AiAnalysis | null>(null);
  const [draft, setDraft] = useState<AiAnalysisResult | null>(null);
  const [title, setTitle] = useState('');
  const [selection, setSelection] = useState<Selection>({ findings: [], stories: [], storyFinding: [] });
  const [dirty, setDirty] = useState(false);
  const [appliedId, setAppliedId] = useState<string | null>(null);

  const load = (a: AiAnalysis) => {
    setAnalysis(a);
    setDraft(a.result);
    setTitle(a.title);
    setSelection(defaultSelection(a.result));
    setDirty(false);
  };

  const analyze = useApiMutation((req: AnalyzeRequest) => api.analyze(req), { invalidate: [keys.analyses] });
  const saveEdit = useApiMutation(() => api.updateAnalysis(analysis!.id, { title, result: draft! }), {
    invalidate: [keys.analyses],
    success: 'Cambios guardados en el historial',
  });
  const apply = useApiMutation(
    () => {
      const r = draft!;
      const findingIdx = r.hallazgos.map((_, i) => i).filter((i) => selection.findings[i]);
      const findings = findingIdx.map((i) => ({
        ...r.hallazgos[i],
        recomendacion: r.recomendaciones[i]?.recomendacion,
        fundamento: r.recomendaciones[i]?.fundamento,
      }));
      const stories = r.historias_usuario
        .map((h, i) => ({ h, i }))
        .filter(({ i }) => selection.stories[i])
        .map(({ h, i }) => {
          const origin = selection.storyFinding[i];
          const position = origin >= 0 ? findingIdx.indexOf(origin) : -1;
          return { ...h, tareas: h.tareas.map((t) => t.trim()).filter(Boolean), findingIndex: position >= 0 ? position : undefined };
        });
      return api.applyAnalysis({ findings, stories });
    },
    {
      invalidate: [...SCRUM_DEPENDENTS, keys.findings],
      success: (res) => `Registrados ${res.findings.length} hallazgo(s) y ${res.stories.length} historia(s) en el Product Backlog`,
    },
  );
  const removeAnalysis = useApiMutation((id: string) => api.deleteAnalysis(id), { invalidate: [keys.analyses], success: 'Análisis eliminado del historial' });

  useEffect(() => {
    if (!analyze.isPending) return;
    setStage(0);
    const id = setInterval(() => setStage((s) => Math.min(s + 1, STAGES.length - 1)), 1800);
    return () => clearInterval(id);
  }, [analyze.isPending]);

  const visibleTests = useMemo(
    () => (tests.data ?? []).filter((t) => (!version || t.appVersion === version) && (!resultFilter || t.taskResult === resultFilter)),
    [tests.data, version, resultFilter],
  );
  const planSessions = planId ? (tests.data ?? []).filter((t) => t.planId === planId).length : 0;
  const hasEvidence = selected.size > 0 || planSessions > 0 || freeText.trim().length >= 10;

  const runAnalysis = () => {
    if (!hasEvidence) {
      toast.error('Selecciona sesiones, un plan con sesiones o escribe al menos 10 caracteres de observaciones.');
      return;
    }
    const plan = plans.data?.find((p) => p.id === planId);
    analyze.mutate(
      {
        testIds: [...selected],
        planId: planId || undefined,
        observations: freeText.trim() || undefined,
        context: context.trim() || (plan ? `${plan.product} · ${plan.module}` : undefined),
        title: plan ? `Análisis del plan «${plan.module}»` : undefined,
      },
      {
        onSuccess: (a) => {
          load(a);
          if (a.meta.provider === 'local') toast.info('Análisis generado con el motor heurístico local. Configura una API key gratuita para usar un LLM.');
          else toast.success(`Análisis generado con ${providerLabel(a.meta.provider)} en ${(a.meta.durationMs / 1000).toFixed(1)} s`);
          setTimeout(() => document.getElementById('ai-result')?.scrollIntoView({ behavior: 'smooth' }), 100);
        },
      },
    );
  };

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const markdown = analysis && draft ? analysisToMarkdown({ ...analysis, title, edited: analysis.edited || dirty }, draft) : '';

  return (
    <div className="page">
      <PageHeader
        module="ai"
        title="Asistente IA de usabilidad"
        description="De observaciones a hallazgos e historias de usuario. Tú revisas antes de guardar."
        actions={
          status.data && (
            <span className="muted" title={status.data.chain.map((c) => `${providerLabel(c.provider)}: ${c.configured ? c.model : 'sin API key'}`).join('\n')}>
              Proveedor: <strong>{providerLabel(status.data.primary)}</strong>
              {status.data.mode === 'local' && ' (sin API key configurada)'}
            </span>
          )
        }
      />

      <div className="grid layout-main-aside">
        <section className="card stack" aria-labelledby="ev-title">
          <div className="card-header" style={{ marginBottom: 0 }}>
            <div>
              <h2 id="ev-title" className="card-title">
                1. Evidencia para analizar
              </h2>
              <p className="card-subtitle">Combina sesiones registradas, un plan completo y comentarios libres.</p>
            </div>
            <Badge variant={hasEvidence ? 'success' : 'default'}>
              {selected.size} sesión(es){planId ? ` + plan (${planSessions})` : ''}
              {freeText.trim() ? ' + texto' : ''}
            </Badge>
          </div>

          <div className="row" style={{ alignItems: 'flex-end' }}>
            <div className="field" style={{ width: 170 }}>
              <label htmlFor="ai-v">Versión</label>
              <select id="ai-v" className="control control-sm" value={version} onChange={(e) => setVersion(e.target.value as AppVersion | '')}>
                <option value="">Todas</option>
                <option value="v1">v1</option>
                <option value="v2">v2</option>
              </select>
            </div>
            <div className="field" style={{ width: 170 }}>
              <label htmlFor="ai-r">Resultado</label>
              <select id="ai-r" className="control control-sm" value={resultFilter} onChange={(e) => setResultFilter(e.target.value as TaskResult | '')}>
                <option value="">Todos</option>
                <option value="success">Éxito</option>
                <option value="assisted">Con ayuda</option>
                <option value="failure">Fracaso</option>
              </select>
            </div>
            <Button size="sm" variant="secondary" onClick={() => setSelected(new Set(visibleTests.filter((t) => t.taskResult !== 'success' || t.satisfactionScore <= 2).map((t) => t.id)))}>
              Seleccionar sesiones con problemas
            </Button>
            <Button size="sm" variant="secondary" onClick={() => setSelected(new Set(visibleTests.map((t) => t.id)))}>
              Seleccionar visibles
            </Button>
            {selected.size > 0 && (
              <Button size="sm" variant="ghost" onClick={() => setSelected(new Set())}>
                Quitar selección
              </Button>
            )}
          </div>

          <div className="table-wrap" style={{ maxHeight: 300, overflowY: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th scope="col">
                    <span className="sr-only">Seleccionar</span>
                  </th>
                  <th scope="col">Participante · tarea</th>
                  <th scope="col">Resultado</th>
                  <th scope="col">Observación</th>
                </tr>
              </thead>
              <tbody>
                {visibleTests.map((t) => (
                  <tr key={t.id} onClick={() => toggle(t.id)} style={{ cursor: 'pointer', background: selected.has(t.id) ? '#eff6ff' : undefined }}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selected.has(t.id)}
                        onChange={() => toggle(t.id)}
                        onClick={(e) => e.stopPropagation()}
                        aria-label={`Incluir sesión de ${t.evaluatorName}: ${t.taskDescription}`}
                        style={{ width: 18, height: 18 }}
                      />
                    </td>
                    <td>
                      <strong>{t.evaluatorName}</strong> <span className="muted">· {t.appVersion}</span>
                      <div>{t.taskDescription}</div>
                    </td>
                    <td>
                      <ResultBadge value={t.taskResult} />
                      <div className="muted">
                        {t.timeOnTask} s · {t.errorsCount} err · {t.satisfactionScore}/5
                      </div>
                    </td>
                    <td className="muted" style={{ minWidth: 200 }}>
                      {t.observations || '—'}
                    </td>
                  </tr>
                ))}
                {!visibleTests.length && (
                  <tr>
                    <td colSpan={4} className="empty">
                      {tests.isLoading ? 'Cargando sesiones…' : 'No hay sesiones con estos filtros.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="grid grid-2">
            <div className="field">
              <label htmlFor="ai-plan">Plan de prueba (todas sus sesiones)</label>
              <select id="ai-plan" className="control" value={planId} onChange={(e) => setPlanId(e.target.value)}>
                <option value="">Ninguno</option>
                {plans.data?.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.module} · {p.appVersion}
                  </option>
                ))}
              </select>
              {planId && <span className="field-help">{planSessions} sesión(es) registradas en este plan</span>}
            </div>
            <div className="field">
              <label htmlFor="ai-ctx">Producto / pantalla evaluada (contexto)</label>
              <input id="ai-ctx" className="control" value={context} onChange={(e) => setContext(e.target.value)} placeholder="Ej. Dashboard de notas del sistema académico" />
            </div>
          </div>
          <div className="field">
            <label htmlFor="ai-free">Comentarios u observaciones en texto libre</label>
            <textarea
              id="ai-free"
              className="control"
              rows={4}
              maxLength={12000}
              value={freeText}
              onChange={(e) => setFreeText(e.target.value)}
              placeholder="Pega notas de campo, comentarios de usuarios, errores frecuentes o tareas no completadas…"
            />
            <span className="field-help">{freeText.length}/12000 caracteres</span>
          </div>

          <div className="row" style={{ justifyContent: 'flex-end' }}>
            <Button size="lg" leftIcon={<Sparkles size={18} />} onClick={runAnalysis} isLoading={analyze.isPending} disabled={!hasEvidence}>
              Analizar con IA
            </Button>
          </div>
          {analyze.isPending && (
            <div role="status" aria-live="polite" className="alert alert-info">
              <Spinner size="sm" />
              <span>{STAGES[stage]} Esto puede tardar hasta 30 segundos con proveedores gratuitos.</span>
            </div>
          )}
        </section>

        <aside className="card stack" aria-labelledby="hist-title">
          <h2 id="hist-title" className="card-title">
            <History size={18} aria-hidden="true" /> Historial de análisis
          </h2>
          {history.data?.length ? (
            <ul className="stack-sm" style={{ listStyle: 'none', maxHeight: 520, overflowY: 'auto' }}>
              {history.data.map((a) => (
                <li key={a.id} className="row-between" style={{ gap: 6, flexWrap: 'nowrap', borderBottom: '1px solid #f1f5f9', paddingBottom: 6 }}>
                  <button
                    type="button"
                    onClick={() => load(a)}
                    aria-current={analysis?.id === a.id ? 'true' : undefined}
                    style={{
                      textAlign: 'left',
                      background: analysis?.id === a.id ? '#eff6ff' : 'transparent',
                      border: 'none',
                      borderRadius: 6,
                      padding: '6px 8px',
                      cursor: 'pointer',
                      flex: 1,
                      minHeight: 44,
                    }}
                  >
                    <span className="strong small" style={{ display: 'block' }}>
                      {a.title}
                    </span>
                    <span className="muted">
                      {new Date(a.createdAt).toLocaleString('es-EC', { dateStyle: 'short', timeStyle: 'short' })} · {providerLabel(a.meta.provider)}
                      {a.edited ? ' · editado' : ''}
                    </span>
                  </button>
                  <button
                    type="button"
                    className="icon-btn"
                    aria-label={`Eliminar ${a.title}`}
                    onClick={() => {
                      if (!confirm('¿Eliminar este análisis del historial?')) return;
                      removeAnalysis.mutate(a.id);
                      if (analysis?.id === a.id) {
                        setAnalysis(null);
                        setDraft(null);
                      }
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted">Los análisis que generes se guardan aquí para retomarlos o exportarlos.</p>
          )}
        </aside>
      </div>

      {analysis && draft && (
        <section id="ai-result" className="stack" aria-labelledby="res-title" style={{ scrollMarginTop: 16 }}>
          <div className="card stack">
            <div className="row-between">
              <h2 id="res-title" className="card-title">
                2. Resultado del análisis
              </h2>
              <span className="muted">
                {providerLabel(analysis.meta.provider)} · {analysis.meta.model} · {(analysis.meta.durationMs / 1000).toFixed(1)} s · {analysis.meta.sessions} sesión(es)
              </span>
            </div>
            {analysis.meta.warnings.length > 0 && (
              <div className="alert alert-warning" role="note">
                <AlertTriangle size={18} aria-hidden="true" />
                <div className="small">
                  {analysis.meta.provider === 'local' ? 'Se usó el motor local. ' : 'Se usó un proveedor de respaldo. '}
                  {analysis.meta.warnings.join(' · ')}
                </div>
              </div>
            )}
            <div className="field">
              <label htmlFor="ai-title">Título del reporte</label>
              <input
                id="ai-title"
                className="control"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setDirty(true);
                }}
              />
            </div>
            <div className="row">
              <Button variant="secondary" leftIcon={<Save size={16} />} disabled={!dirty} isLoading={saveEdit.isPending} onClick={() => saveEdit.mutate(undefined, { onSuccess: (a) => { setAnalysis(a); setDirty(false); } })}>
                Guardar edición
              </Button>
              <Button
                leftIcon={<Send size={16} />}
                isLoading={apply.isPending}
                disabled={appliedId === analysis.id || (!selection.findings.some(Boolean) && !selection.stories.some(Boolean))}
                title={appliedId === analysis.id ? 'Este análisis ya se registró; genera uno nuevo para evitar duplicados' : undefined}
                onClick={() => apply.mutate(undefined, { onSuccess: () => setAppliedId(analysis.id) })}
              >
                {appliedId === analysis.id ? 'Ya registrado en el sistema' : 'Registrar hallazgos e historias marcados'}
              </Button>
              <Button
                variant="secondary"
                leftIcon={<Copy size={16} />}
                onClick={() => navigator.clipboard.writeText(markdown).then(() => toast.success('Markdown copiado al portapapeles'), () => toast.error('El navegador no permitió copiar'))}
              >
                Copiar Markdown
              </Button>
              <Button variant="secondary" leftIcon={<FileDown size={16} />} onClick={() => downloadText(`${slug(title)}.md`, markdown)}>
                Descargar .md
              </Button>
              <Button variant="secondary" leftIcon={<Printer size={16} />} onClick={() => window.print()} title="Abre el diálogo de impresión: elige «Guardar como PDF»">
                Exportar PDF
              </Button>
            </div>
            {appliedId === analysis.id && (
              <div className="alert alert-success" role="status">
                <span style={{ flex: 1 }}>Listo. Revisa y prioriza las nuevas historias en el Product Backlog.</span>
                <Button size="sm" variant="secondary" onClick={() => navigate('/scrum')}>
                  Ir al backlog
                </Button>
              </div>
            )}
          </div>

          <AiResultEditor
            result={draft}
            onChange={(r) => {
              setDraft(r);
              setDirty(true);
            }}
            selection={selection}
            onSelectionChange={setSelection}
          />
          <PrintReport analysis={{ ...analysis, title, edited: analysis.edited || dirty }} result={draft} />
        </section>
      )}
    </div>
  );
};
