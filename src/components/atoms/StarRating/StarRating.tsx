import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { tokens } from '../../../styles/tokens';

export interface StarRatingProps {
  id?: string;
  value: number; // 1 - 5 (o 0 si no seleccionado)
  onChange: (rating: number) => void;
  label?: string;
  error?: string;
  disabled?: boolean;
}

const DESCRIPTIONS: Record<number, string> = {
  1: '1 - Muy insatisfecho (Alta fricción cognitiva)',
  2: '2 - Insatisfecho (Dificultades encontradas)',
  3: '3 - Aceptable / Neutral',
  4: '4 - Satisfecho (Flujo comprensible)',
  5: '5 - Muy satisfecho (Excelente usabilidad)',
};

/**
 * Átomo StarRating
 * Fundamentos IHC:
 * - Donald Norman (Affordance & Manipulación Directa): Reemplaza el input numérico abstracto
 *   por una metáfora del mundo real que invita naturalmente al clic y exploración visual.
 * - Nielsen #2 (Correspondencia con el mundo real): Escala de 5 estrellas familiar en evaluación.
 * - Ley de Fitts: Cada estrella posee un área de interacción de al menos 44x44px.
 * - WCAG 2.1: role="radiogroup" accesible con navegación por teclado y aria-checked.
 */
export const StarRating: React.FC<StarRatingProps> = ({
  id = 'satisfaction-rating',
  value,
  onChange,
  label = 'Satisfacción del Usuario (ISO 9241-11)',
  error,
  disabled = false,
}) => {
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const activeValue = hoverValue !== null ? hoverValue : value;

  const handleKeyDown = (e: React.KeyboardEvent, rating: number) => {
    if (disabled) return;
    if (e.key === 'ArrowRight' && rating < 5) {
      onChange(rating + 1);
    } else if (e.key === 'ArrowLeft' && rating > 1) {
      onChange(rating - 1);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onChange(rating);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {label && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label
            id={`${id}-label`}
            style={{ fontSize: '14px', fontWeight: 600, color: tokens.colors.gray700 }}
          >
            {label}
            <span style={{ color: tokens.colors.danger, marginLeft: '4px' }}>*</span>
          </label>
          <span style={{ fontSize: '13px', color: tokens.colors.primary, fontWeight: 600 }}>
            {value > 0 ? `${value} / 5 estrellas` : 'Seleccione una calificación'}
          </span>
        </div>
      )}

      <div
        role="radiogroup"
        aria-labelledby={`${id}-label`}
        aria-describedby={error ? `${id}-error` : undefined}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 8px',
          backgroundColor: tokens.colors.gray50,
          borderRadius: tokens.radii.md,
          border: `1px solid ${error ? tokens.colors.danger : tokens.colors.gray200}`,
          width: 'fit-content',
        }}
        onMouseLeave={() => setHoverValue(null)}
      >
        {[1, 2, 3, 4, 5].map((rating) => {
          const isFilled = rating <= activeValue;

          return (
            <button
              key={rating}
              type="button"
              role="radio"
              aria-checked={value === rating}
              aria-label={DESCRIPTIONS[rating]}
              disabled={disabled}
              onMouseEnter={() => !disabled && setHoverValue(rating)}
              onFocus={() => !disabled && setHoverValue(rating)}
              onBlur={() => setHoverValue(null)}
              onClick={() => !disabled && onChange(rating)}
              onKeyDown={(e) => handleKeyDown(e, rating)}
              style={{
                // Ley de Fitts: área táctil de mínimo 44x44px
                width: '44px',
                height: '44px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'transparent',
                border: 'none',
                cursor: disabled ? 'not-allowed' : 'pointer',
                borderRadius: tokens.radii.sm,
                transition: 'transform 120ms ease, color 120ms ease',
                color: isFilled ? '#f59e0b' : tokens.colors.gray300,
                transform: hoverValue === rating ? 'scale(1.15)' : 'scale(1)',
                outline: 'none',
              }}
              title={DESCRIPTIONS[rating]}
            >
              <Star
                size={28}
                fill={isFilled ? '#f59e0b' : 'none'}
                strokeWidth={2}
                stroke={isFilled ? '#d97706' : tokens.colors.gray400}
              />
            </button>
          );
        })}
      </div>

      {/* Retroalimentación descriptiva inmediata (Norman: Feedback) */}
      <div style={{ minHeight: '20px' }}>
        {activeValue > 0 ? (
          <p style={{ fontSize: '13px', color: tokens.colors.gray600, fontStyle: 'italic' }}>
            {DESCRIPTIONS[activeValue]}
          </p>
        ) : (
          <p style={{ fontSize: '13px', color: tokens.colors.gray400 }}>
            Haga clic en las estrellas para registrar la satisfacción (ISO 9241-11)
          </p>
        )}
      </div>

      {error && (
        <p
          id={`${id}-error`}
          role="alert"
          style={{ fontSize: '13px', color: tokens.colors.danger, display: 'flex', gap: '4px' }}
        >
          <span>⚠</span>
          <span>{error}</span>
        </p>
      )}
    </div>
  );
};
