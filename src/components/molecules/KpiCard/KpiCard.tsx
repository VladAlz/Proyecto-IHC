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
}

/**
 * Molécula KpiCard
 * Fundamentos IHC:
 * - Ley de Semejanza (Gestalt - Semana 6): Misma estructura visual, dimensiones y jerarquía
 *   para comunicar que los 4 KPIs pertenecen a la misma categoría analítica.
 * - Reconocimiento sobre Recuerdo (Nielsen #6): Los deltas y comparativas temporales evitan
 *   que el evaluador deba recordar valores previos.
 * - ISO 9241-11: Identificación explícita del pilar (Efectividad, Eficiencia, Satisfacción).
 */
export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  unit,
  icon,
  trendText,
  trendDirection = 'neutral',
  isPositive = true,
  subtext = 'vs. semana anterior',
  isoStandard,
}) => {
  const trendColor =
    trendDirection === 'neutral'
      ? tokens.colors.gray500
      : isPositive
      ? tokens.colors.success
      : tokens.colors.danger;

  const trendBg =
    trendDirection === 'neutral'
      ? tokens.colors.gray100
      : isPositive
      ? tokens.colors.successLight
      : tokens.colors.dangerLight;

  return (
    <div
      style={{
        backgroundColor: tokens.colors.white,
        borderRadius: tokens.radii.lg,
        padding: tokens.spacing.lg,
        border: `1px solid ${tokens.colors.gray200}`,
        boxShadow: tokens.shadows.sm,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: '160px',
        transition: 'transform 180ms ease, box-shadow 180ms ease',
      }}
      className="kpi-card"
    >
      {/* Header del Card: Título + Icono + Etiqueta ISO */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          {isoStandard && (
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                textTransform: 'uppercase',
                color: tokens.colors.primary,
                letterSpacing: '0.5px',
                display: 'block',
                marginBottom: '2px',
              }}
            >
              {isoStandard}
            </span>
          )}
          <h3
            style={{
              fontSize: '14px',
              fontWeight: 600,
              color: tokens.colors.gray600,
              margin: 0,
            }}
          >
            {title}
          </h3>
        </div>

        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: tokens.radii.md,
            backgroundColor: tokens.colors.primaryLight,
            color: tokens.colors.primary,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          aria-hidden="true"
        >
          {icon}
        </div>
      </div>

      {/* Valor principal grande (Continuidad visual) */}
      <div style={{ margin: '12px 0 8px 0', display: 'flex', alignItems: 'baseline', gap: '4px' }}>
        <span
          style={{
            fontSize: '32px',
            fontWeight: 700,
            color: tokens.colors.gray900,
            lineHeight: 1,
            letterSpacing: '-0.5px',
          }}
        >
          {value}
        </span>
        {unit && (
          <span style={{ fontSize: '15px', color: tokens.colors.gray500, fontWeight: 500 }}>
            {unit}
          </span>
        )}
      </div>

      {/* Indicador de tendencia (Nielsen #6: Reconocimiento) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
        {trendText && (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '2px',
              fontWeight: 600,
              color: trendColor,
              backgroundColor: trendBg,
              padding: '2px 8px',
              borderRadius: tokens.radii.full,
            }}
          >
            {trendDirection === 'up' && <TrendingUp size={14} />}
            {trendDirection === 'down' && <TrendingDown size={14} />}
            <span>{trendText}</span>
          </span>
        )}
        <span style={{ color: tokens.colors.gray500 }}>{subtext}</span>
      </div>
    </div>
  );
};
