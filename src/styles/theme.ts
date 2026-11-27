/**
 * Identidad visual por módulo (Gestalt: semejanza + figura-fondo).
 * Cada módulo tiene un color de acento que se repite en su pestaña y en su encabezado,
 * para que el usuario reconozca dónde está sin leer (Nielsen #6).
 * Todos los acentos tienen contraste ≥ 4.5:1 con texto blanco (WCAG 2.1 AA).
 */
export type ModuleId = 'dashboard' | 'plans' | 'register' | 'findings' | 'ai' | 'scrum' | 'comparison';

export interface ModuleTheme {
  accent: string; // color sólido (fondos de pestaña activa, iconos)
  soft: string;   // tinte claro para fondos
  ring: string;   // borde suave
}

export const MODULE_THEME: Record<ModuleId, ModuleTheme> = {
  dashboard: { accent: '#2563eb', soft: '#eff6ff', ring: '#bfdbfe' },
  plans: { accent: '#0f766e', soft: '#f0fdfa', ring: '#99f6e4' },
  register: { accent: '#15803d', soft: '#f0fdf4', ring: '#bbf7d0' },
  findings: { accent: '#c2410c', soft: '#fff7ed', ring: '#fed7aa' },
  ai: { accent: '#7c3aed', soft: '#f5f3ff', ring: '#ddd6fe' },
  scrum: { accent: '#be185d', soft: '#fdf2f8', ring: '#fbcfe8' },
  comparison: { accent: '#4338ca', soft: '#eef2ff', ring: '#c7d2fe' },
};

/** Acentos para las 4 tarjetas KPI (identidad por pilar ISO 9241-11) */
export const KPI_ACCENTS = {
  scope: '#4338ca',
  effectiveness: '#15803d',
  efficiency: '#2563eb',
  satisfaction: '#b45309',
};
