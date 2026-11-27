import {
  AiAnalysisResult,
  AiFinding,
  AiRecommendation,
  AiUserStory,
  NIELSEN_HEURISTICS,
  Priority,
  Severity,
  UX_CATEGORIES,
} from './ai.types';

/**
 * "Firewall" de la respuesta del modelo: parsea, valida y normaliza el JSON devuelto
 * para que el frontend reciba siempre el contrato AiAnalysisResult, aunque el modelo
 * omita campos, use mayúsculas distintas o envuelva la respuesta en ```json.
 */
export class AiOutputError extends Error {}

const FIBONACCI = [1, 2, 3, 5, 8, 13];

const str = (v: unknown, max = 600): string =>
  typeof v === 'string' ? v.trim().slice(0, max) : typeof v === 'number' ? String(v) : '';

const strip = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');

export function parseJsonLoose(raw: string): unknown {
  const cleaned = raw.replace(/```(?:json)?/gi, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(cleaned.slice(start, end + 1));
      } catch {
        /* sigue abajo */
      }
    }
    throw new AiOutputError('La respuesta del modelo no es un JSON válido');
  }
}

export function normalizeSeverity(v: unknown): Severity {
  const n = typeof v === 'number' ? v : parseInt(String(v ?? ''), 10);
  if (Number.isFinite(n)) return Math.min(4, Math.max(1, Math.round(n))) as Severity;
  const s = strip(String(v ?? ''));
  if (s.includes('catastro') || s.includes('critic')) return 4;
  if (s.includes('mayor') || s.includes('alta') || s.includes('high')) return 3;
  if (s.includes('menor') || s.includes('media')) return 2;
  return 2;
}

export function normalizePriority(v: unknown): Priority {
  const s = strip(String(v ?? ''));
  if (s.startsWith('alt') || s === 'high' || s.includes('critic')) return 'Alta';
  if (s.startsWith('baj') || s === 'low') return 'Baja';
  return 'Media';
}

export function normalizeCategory(v: unknown): string {
  const s = strip(String(v ?? ''));
  if (!s) return 'General';
  const exact = UX_CATEGORIES.find((c) => strip(c) === s);
  if (exact) return exact;
  const rules: [string, string[]][] = [
    ['Navegación', ['naveg', 'menu', 'arquitectura', 'ubic']],
    ['Visibilidad y feedback', ['visibil', 'feedback', 'retroal', 'estado', 'carga']],
    ['Jerarquía visual', ['jerarq', 'contraste', 'visual', 'layout', 'disen']],
    ['Formularios y prevención de errores', ['formul', 'prevenc', 'error', 'valid', 'campo']],
    ['Contenido y lenguaje', ['conten', 'lengua', 'etiquet', 'texto', 'termin']],
    ['Accesibilidad', ['acces', 'wcag', 'teclado', 'lector']],
    ['Eficiencia', ['eficien', 'tiempo', 'atajo', 'rapidez', 'productiv']],
    ['Consistencia', ['consist', 'estandar']],
  ];
  const match = rules.find(([, keys]) => keys.some((k) => s.includes(k)));
  return match ? match[0] : 'General';
}

export function normalizeHeuristic(v: unknown): string {
  const raw = str(v, 255);
  const num = raw.match(/#?\s*(10|[1-9])\b/);
  if (num) return NIELSEN_HEURISTICS[parseInt(num[1], 10) - 1];
  const s = strip(raw);
  const found = NIELSEN_HEURISTICS.find((h) => {
    const key = strip(h.split(':')[1] || '').trim().split(' ').slice(0, 2).join(' ');
    return key && s.includes(key);
  });
  return found || raw || NIELSEN_HEURISTICS[0];
}

const asArray = (v: unknown): any[] => (Array.isArray(v) ? v : []);

export function normalizeAnalysis(input: unknown): AiAnalysisResult {
  if (!input || typeof input !== 'object') throw new AiOutputError('La respuesta no es un objeto JSON');
  const o = input as Record<string, unknown>;

  // Compatibilidad con el contrato del Sprint 1 (hallazgos_clave / recomendaciones_diseno)
  const rawFindings = asArray(o.hallazgos ?? o.findings ?? o.hallazgos_clave);
  const rawRecs = asArray(o.recomendaciones ?? o.recommendations ?? o.recomendaciones_diseno);
  const rawStories = asArray(o.historias_usuario ?? o.historias ?? o.user_stories);

  const hallazgos: AiFinding[] = rawFindings
    .map((f) => {
      if (typeof f === 'string') {
        return {
          titulo: str(f, 120),
          descripcion: str(f),
          categoria: normalizeCategory(f),
          heuristica: normalizeHeuristic(f),
          severidad: 2 as Severity,
          pantalla: 'General',
          evidencia: '',
        };
      }
      const titulo = str(f?.titulo ?? f?.title, 160) || str(f?.descripcion, 120);
      return {
        titulo,
        descripcion: str(f?.descripcion ?? f?.description) || titulo,
        categoria: normalizeCategory(f?.categoria ?? f?.category),
        heuristica: normalizeHeuristic(f?.heuristica ?? f?.heuristic),
        severidad: normalizeSeverity(f?.severidad ?? f?.severity),
        pantalla: str(f?.pantalla ?? f?.screen ?? f?.ubicacion, 160) || 'General',
        evidencia: str(f?.evidencia ?? f?.evidence),
        frecuencia: str(f?.frecuencia ?? f?.frequency, 30) || undefined,
      };
    })
    .filter((f) => f.titulo)
    .sort((a, b) => b.severidad - a.severidad)
    .slice(0, 8);

  const recomendaciones: AiRecommendation[] = rawRecs
    .map((r) =>
      typeof r === 'string'
        ? { pantalla: 'General', recomendacion: str(r), fundamento: '', prioridad: 'Media' as Priority }
        : {
            pantalla: str(r?.pantalla ?? r?.screen, 160) || 'General',
            recomendacion: str(r?.recomendacion ?? r?.recommendation ?? r?.accion),
            fundamento: str(r?.fundamento ?? r?.rationale ?? r?.basis),
            prioridad: normalizePriority(r?.prioridad ?? r?.priority),
          },
    )
    .filter((r) => r.recomendacion)
    .slice(0, 8);

  const historias_usuario: AiUserStory[] = rawStories
    .map((h) => {
      const sp = parseInt(String(h?.story_points ?? h?.puntos ?? 3), 10);
      const bv = parseInt(String(h?.valor_negocio ?? h?.business_value ?? 5), 10);
      const target = Number.isFinite(sp) ? sp : 3;
      return {
        titulo: str(h?.titulo ?? h?.title, 400),
        criterio_aceptacion: str(h?.criterio_aceptacion ?? h?.acceptance_criteria, 800),
        prioridad: normalizePriority(h?.prioridad ?? h?.priority),
        modulo: str(h?.modulo ?? h?.module, 40) || 'UI',
        valor_negocio: Number.isFinite(bv) ? Math.min(10, Math.max(1, bv)) : 5,
        story_points: FIBONACCI.reduce((best, f) => (Math.abs(f - target) < Math.abs(best - target) ? f : best), 1),
        tareas: asArray(h?.tareas ?? h?.tasks).map((t) => str(t, 200)).filter(Boolean).slice(0, 6),
      };
    })
    .filter((h) => h.titulo)
    .slice(0, 6);

  const resumen = str(o.resumen ?? o.summary, 1500);

  if (!hallazgos.length && !recomendaciones.length && !historias_usuario.length) {
    throw new AiOutputError('El modelo no devolvió hallazgos, recomendaciones ni historias');
  }

  return {
    resumen: resumen || `Se identificaron ${hallazgos.length} hallazgos y ${historias_usuario.length} historias sugeridas.`,
    hallazgos,
    recomendaciones,
    historias_usuario,
  };
}
