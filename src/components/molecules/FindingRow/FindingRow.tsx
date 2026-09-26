import React, { useState } from 'react';
import { ChevronDown, ChevronUp, AlertCircle, Sparkles } from 'lucide-react';
import { UsabilityFinding } from '../../../types';
import { Badge } from '../../atoms/Badge/Badge';
import { tokens } from '../../../styles/tokens';

export interface FindingRowProps {
  finding: UsabilityFinding;
  onSendToAi?: (finding: UsabilityFinding) => void;
}

/**
 * Molécula FindingRow
 * Fundamentos IHC:
 * - Clasificación por Severidad de Nielsen (1 a 4) con contraste visual evidente.
 * - Ley de Cierre (Gestalt): Delimitación visual nítida para cada hallazgo.
 * - Reconocimiento vs Recuerdo: Vinculación directa con la heurística y la justificación teórica.
 */
export const FindingRow: React.FC<FindingRowProps> = ({ finding, onSendToAi }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getSeverityLabel = (sev: 1 | 2 | 3 | 4) => {
    switch (sev) {
      case 1:
        return 'Nivel 1: Cosmético';
      case 2:
        return 'Nivel 2: Menor';
      case 3:
        return 'Nivel 3: Mayor';
      case 4:
        return 'Nivel 4: Catastrófico';
    }
  };

  return (
    <div
      style={{
        backgroundColor: tokens.colors.white,
        borderRadius: tokens.radii.md,
        border: `1px solid ${tokens.colors.gray200}`,
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        transition: 'border-color 150ms ease, box-shadow 150ms ease',
      }}
      className="finding-row"
    >
      {/* Cabecera del hallazgo */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '12px',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <Badge severity={finding.severity}>
            <AlertCircle size={13} />
            <span>{getSeverityLabel(finding.severity)}</span>
          </Badge>

          <span style={{ fontSize: '13px', fontWeight: 600, color: tokens.colors.gray800 }}>
            {finding.heuristicViolated}
          </span>

          <span
            style={{
              fontSize: '12px',
              backgroundColor: tokens.colors.gray100,
              color: tokens.colors.gray600,
              padding: '2px 8px',
              borderRadius: tokens.radii.sm,
            }}
          >
            Ubicación: <strong>{finding.location}</strong>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {onSendToAi && (
            <button
              type="button"
              onClick={() => onSendToAi(finding)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '12px',
                fontWeight: 600,
                color: tokens.colors.primary,
                backgroundColor: tokens.colors.primaryLight,
                border: '1px solid #bfdbfe',
                borderRadius: tokens.radii.sm,
                padding: '4px 10px',
                cursor: 'pointer',
              }}
              title="Analizar esta observación en el Asistente IA"
            >
              <Sparkles size={13} />
              <span>Enviar a IA</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            aria-expanded={isExpanded}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: '13px',
              color: tokens.colors.gray600,
              padding: '4px',
            }}
          >
            <span>{isExpanded ? 'Menos' : 'Detalles'}</span>
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* Descripción concisa */}
      <p style={{ fontSize: '14px', color: tokens.colors.gray800, margin: 0, lineHeight: 1.5 }}>
        <strong>Problema:</strong> {finding.description}
      </p>

      {/* Recomendación visible o expandida */}
      <div
        style={{
          backgroundColor: tokens.colors.gray50,
          borderLeft: `4px solid ${tokens.colors.primary}`,
          padding: '10px 14px',
          borderRadius: '0 8px 8px 0',
          fontSize: '13px',
          color: tokens.colors.gray700,
        }}
      >
        <strong>Recomendación:</strong> {finding.recommendation}
      </div>

      {isExpanded && finding.theoreticalBasis && (
        <div
          style={{
            fontSize: '12px',
            color: tokens.colors.gray500,
            borderTop: `1px dashed ${tokens.colors.gray200}`,
            paddingTop: '8px',
          }}
        >
          <strong>Fundamento Teórico IHC:</strong> {finding.theoreticalBasis}
        </div>
      )}
    </div>
  );
};
