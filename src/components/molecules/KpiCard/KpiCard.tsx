import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { tokens } from '../../../styles/tokens';

export interface KpiCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: React.ReactNode;
  trendText?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
  isPositive?: boolean; // Si la tendencia es favorable (ej: menos tiempo = favorable)
  subtext?: string;
  isoStandard?: string; // Etiqueta ISO 9241-11 (Efectividad, Eficiencia, Satisfacción)
  accent?: string; // Color de identidad del pilar
}

/**
 * Molécula KpiCard
 * Fundamentos IHC:
 * - Ley de Semejanza (Gestalt): misma estructura en las 4 tarjetas; el color de acento distingue cada pilar ISO.
 * - Jerarquía visual: la cifra es el elemento dominante (38px); el texto de apoyo es breve.
 * - Reconocimiento sobre recuerdo (Nielsen #6): la tendencia se muestra junto al valor.
 */
export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  unit,
  icon,
  trendText,
  trendDirection = 'neutral',
  isPositive = true,
  subtext,
  isoStandard,
  accent = tokens.colors.primary,
}) => {
  const trendColor = trendDirection === 'neutral' ? tokens.colors.gray600 : isPositive ? '#166534' : '#b91c1c';
  const trendBg = trendDirection === 'neutral' ? tokens.colors.gray100 : isPositive ? '#dcfce7' : '#fee2e2';

  return (
    <div
      className="kpi-card"
      style={{
        backgroundColor: tokens.colors.white,
        borderRadius: 14,
        padding: '18px 20px',
        border: `1px solid ${tokens.colors.gray200}`,
        borderTop: `5px solid ${accent}`,
        boxShadow: tokens.shadows.md,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        minWidth: 0,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ minWidth: 0 }}>
          {isoStandard && (
            <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: accent, display: 'block' }}>
              {isoStandard}
            </span>
          )}
          <h3 style={{ fontSize: 16, fontWeight: 600, color: tokens.colors.gray800, margin: '2px 0 0' }}>{title}</h3>
        </div>
        <div
          aria-hidden="true"
          style={{
            width: 46,
            height: 46,
            borderRadius: 12,
            backgroundColor: accent,
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: `0 6px 14px -6px ${accent}`,
          }}
        >
          {icon}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
        <span style={{ fontSize: 38, fontWeight: 800, color: tokens.colors.gray900, lineHeight: 1, letterSpacing: '-1px' }}>{value}</span>
        {unit && <span style={{ fontSize: 16, color: tokens.colors.gray600, fontWeight: 600 }}>{unit}</span>}
      </div>

      {(trendText || subtext) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, flexWrap: 'wrap' }}>
          {trendText && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                fontWeight: 700,
                color: trendColor,
                backgroundColor: trendBg,
                padding: '3px 10px',
                borderRadius: 9999,
                whiteSpace: 'nowrap',
              }}
            >
              {trendDirection === 'up' && <TrendingUp size={15} aria-hidden="true" />}
              {trendDirection === 'down' && <TrendingDown size={15} aria-hidden="true" />}
              {trendText}
            </span>
          )}
          {subtext && <span style={{ color: tokens.colors.gray600 }}>{subtext}</span>}
        </div>
      )}
    </div>
  );
};
