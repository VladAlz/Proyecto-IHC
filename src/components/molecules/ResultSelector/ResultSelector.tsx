import React from 'react';
import { CheckCircle2, HelpCircle, XCircle } from 'lucide-react';
import type { TaskResult } from '../../../types';
import { tokens } from '../../../styles/tokens';

const OPTIONS: { value: TaskResult; label: string; color: string; bg: string; icon: React.ReactNode }[] = [
  { value: 'success', label: 'Éxito', color: tokens.colors.success, bg: tokens.colors.successLight, icon: <CheckCircle2 size={16} /> },
  { value: 'assisted', label: 'Con ayuda', color: tokens.colors.warning, bg: tokens.colors.warningLight, icon: <HelpCircle size={16} /> },
  { value: 'failure', label: 'Fracaso', color: tokens.colors.danger, bg: tokens.colors.dangerLight, icon: <XCircle size={16} /> },
];

export interface ResultSelectorProps {
  name: string;
  value: TaskResult;
  onChange: (value: TaskResult) => void;
  compact?: boolean;
  label?: string;
}

/**
 * Molécula ResultSelector (Efectividad ISO 9241-11)
 * Tres estados de la plantilla "Registro observación": Sí / Con ayuda / No.
 * - Redundancia de código: color + icono + texto (no depende solo del color, WCAG 1.4.1).
 * - Radio group nativo: navegable con flechas del teclado.
 */
export const ResultSelector: React.FC<ResultSelectorProps> = ({ name, value, onChange, compact, label = 'Resultado de la tarea' }) => (
  <div role="radiogroup" aria-label={label} className="row" style={{ gap: compact ? 6 : 10 }}>
    {OPTIONS.map((opt) => {
      const active = value === opt.value;
      return (
        <label
          key={opt.value}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: compact ? '4px 10px' : '8px 14px',
            minHeight: compact ? 36 : 44,
            borderRadius: tokens.radii.md,
            border: `2px solid ${active ? opt.color : tokens.colors.gray200}`,
            background: active ? opt.bg : tokens.colors.white,
            color: active ? opt.color : tokens.colors.gray700,
            fontWeight: 600,
            fontSize: compact ? 12 : 14,
            cursor: 'pointer',
          }}
        >
          <input
            type="radio"
            name={name}
            value={opt.value}
            checked={active}
            onChange={() => onChange(opt.value)}
            style={{ accentColor: opt.color }}
          />
          {opt.icon}
          <span>{opt.label}</span>
        </label>
      );
    })}
  </div>
);

export const ResultBadge: React.FC<{ value: TaskResult }> = ({ value }) => {
  const opt = OPTIONS.find((o) => o.value === value) || OPTIONS[0];
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '2px 8px',
        borderRadius: 9999,
        fontSize: 12,
        fontWeight: 600,
        color: opt.color,
        background: opt.bg,
        whiteSpace: 'nowrap',
      }}
    >
      {opt.icon}
      {opt.label}
    </span>
  );
};
