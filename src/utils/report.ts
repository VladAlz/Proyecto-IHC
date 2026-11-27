import { AiAnalysis, AiAnalysisResult, SEVERITY_LABELS } from '../types';

const PROVIDER_LABEL: Record<string, string> = {
  gemini: 'Google Gemini',
  groq: 'Groq (Llama)',
  openrouter: 'OpenRouter',
  local: 'Motor heurístico local',
};

export const providerLabel = (p: string) => PROVIDER_LABEL[p] || p;

/**
 * Pipeline de exportación JSON → Markdown (para GitHub Issues, Notion u Obsidian).
 * Las historias usan listas de verificación "- [ ]" para que funcionen como checklist en GitHub.
 */
export function analysisToMarkdown(analysis: Pick<AiAnalysis, 'title' | 'meta' | 'createdAt' | 'edited'>, result: AiAnalysisResult): string {
  const lines: string[] = [];
  lines.push(`# ${analysis.title}`, '');
  lines.push(
    `> Generado el ${new Date(analysis.createdAt).toLocaleString('es-EC')} con **${providerLabel(analysis.meta.provider)}** (${analysis.meta.model})` +
      ` a partir de ${analysis.meta.sessions} sesión(es).${analysis.edited ? ' Revisado y editado por el equipo.' : ''}`,
    '',
  );
  lines.push('## Resumen', '', result.resumen, '');

  lines.push('## Hallazgos priorizados', '');
  if (!result.hallazgos.length) lines.push('_Sin hallazgos._', '');
  lines.push('| # | Severidad | Categoría | Pantalla | Hallazgo | Heurística | Frecuencia |', '|---|---|---|---|---|---|---|');
  result.hallazgos.forEach((h, i) => {
    const cell = (s?: string) => (s || '').replace(/\|/g, '\\|').replace(/\n/g, ' ');
    lines.push(
      `| ${i + 1} | ${h.severidad} · ${SEVERITY_LABELS[h.severidad]} | ${cell(h.categoria)} | ${cell(h.pantalla)} | **${cell(h.titulo)}** — ${cell(h.descripcion)} | ${cell(h.heuristica)} | ${cell(h.frecuencia)} |`,
    );
  });
  lines.push('');
  result.hallazgos
    .filter((h) => h.evidencia)
    .forEach((h, i) => lines.push(`- **Evidencia ${i + 1} (${h.titulo}):** ${h.evidencia}`));
  lines.push('');

  lines.push('## Recomendaciones por pantalla', '');
  result.recomendaciones.forEach((r) => {
    lines.push(`- **[${r.prioridad}] ${r.pantalla}:** ${r.recomendacion}${r.fundamento ? ` _(Fundamento: ${r.fundamento})_` : ''}`);
  });
  lines.push('');

  lines.push('## Historias de usuario sugeridas', '');
  result.historias_usuario.forEach((h, i) => {
    lines.push(`### HU sugerida ${i + 1} · Prioridad ${h.prioridad} · Módulo ${h.modulo}`, '');
    lines.push(h.titulo, '');
    lines.push(`**Criterio de aceptación:** ${h.criterio_aceptacion}`, '');
    lines.push(`**Valor de negocio:** ${h.valor_negocio} · **Story points:** ${h.story_points}`, '');
    const tareas = h.tareas.map((t) => t.trim()).filter(Boolean);
    if (tareas.length) {
      lines.push('**Tareas:**');
      tareas.forEach((t) => lines.push(`- [ ] ${t}`));
      lines.push('');
    }
  });
  return lines.join('\n');
}

export function downloadText(filename: string, content: string, mime = 'text/markdown;charset=utf-8') {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export const slug = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 60) || 'reporte';

/** CSV con BOM para que Excel abra correctamente las tildes */
export function toCsv(rows: (string | number | null | undefined)[][]): string {
  const esc = (v: string | number | null | undefined) => {
    const s = v === null || v === undefined ? '' : String(v);
    return /[",;\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return '﻿' + rows.map((r) => r.map(esc).join(';')).join('\r\n');
}
