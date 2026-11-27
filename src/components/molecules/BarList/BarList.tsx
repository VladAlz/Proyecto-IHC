import React from 'react';

export interface BarItem {
  label: string;
  value: number;
  color?: string;
  display?: string;
}

/**
 * Molécula BarList: barras horizontales para magnitudes de una sola serie.
 * - Una sola tonalidad por defecto (magnitud); los colores de estado solo se usan
 *   cuando la barra representa un estado (p. ej. severidad) y siempre con etiqueta textual.
 * - El valor se rotula directamente y el título nativo funciona como tooltip.
 */
export const BarList: React.FC<{ items: BarItem[]; max?: number; ariaLabel: string; emptyText?: string }> = ({
  items,
  max,
  ariaLabel,
  emptyText = 'Sin datos para mostrar',
}) => {
  if (!items.length) return <p className="empty">{emptyText}</p>;
  const top = max ?? Math.max(...items.map((i) => i.value), 1);
  return (
    <ul className="stack-sm" aria-label={ariaLabel} style={{ listStyle: 'none' }}>
      {items.map((item) => (
        <li key={item.label} className="bar-row" title={`${item.label}: ${item.display ?? item.value}`}>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.label}</span>
          <span className="bar-track" aria-hidden="true">
            <span
              className="bar-fill"
              style={{ width: `${Math.max(0, Math.min(100, (item.value / top) * 100))}%`, background: item.color || 'var(--chart-single)' }}
            />
          </span>
          <span className="strong" style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
            {item.display ?? item.value}
          </span>
        </li>
      ))}
    </ul>
  );
};

export interface PairItem {
  label: string;
  before: number;
  after: number;
  format?: (n: number) => string;
}

/** Barras comparativas antes (v1) / después (v2) con leyenda y valores rotulados */
export const PairBarList: React.FC<{ items: PairItem[]; max?: number; ariaLabel: string }> = ({ items, max, ariaLabel }) => {
  const top = max ?? Math.max(...items.flatMap((i) => [i.before, i.after]), 1);
  return (
    <div className="stack">
      <div className="legend" aria-hidden="true">
        <span>
          <span className="legend-swatch" style={{ background: 'var(--chart-v1)' }} />
          Antes (v1)
        </span>
        <span>
          <span className="legend-swatch" style={{ background: 'var(--chart-v2)' }} />
          Después (v2)
        </span>
      </div>
      <ul className="stack" aria-label={ariaLabel} style={{ listStyle: 'none' }}>
        {items.map((item) => {
          const fmt = item.format ?? ((n: number) => String(n));
          return (
            <li key={item.label} className="bar-row" style={{ alignItems: 'start' }}>
              <span style={{ fontSize: 13 }}>{item.label}</span>
              <span className="bar-pair">
                <span className="bar-track" title={`Antes (v1): ${fmt(item.before)}`}>
                  <span className="bar-fill" style={{ width: `${(item.before / top) * 100}%`, background: 'var(--chart-v1)' }} />
                </span>
                <span className="bar-track" title={`Después (v2): ${fmt(item.after)}`}>
                  <span className="bar-fill" style={{ width: `${(item.after / top) * 100}%`, background: 'var(--chart-v2)' }} />
                </span>
              </span>
              <span className="small" style={{ textAlign: 'right', lineHeight: '18px', fontVariantNumeric: 'tabular-nums' }}>
                <span className="sr-only">Antes </span>
                {fmt(item.before)}
                <br />
                <span className="sr-only">Después </span>
                <strong>{fmt(item.after)}</strong>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
