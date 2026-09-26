import { InputHTMLAttributes, forwardRef } from 'react';
import { tokens } from '../../../styles/tokens';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label?: string;
  error?: string;
  helperText?: string;
  isSuccess?: boolean;
}

/**
 * Átomo Input
 * Fundamentos IHC:
 * - WCAG 2.1 POUR (Principio Comprensible / Operable): Vinculación id-htmlFor, aria-invalid.
 * - Nielsen #9: Ayuda a reconocer y recuperarse de errores con feedback visual y textual.
 * - Norman: Affordance de campo editable y estado de foco explícito.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ id, label, error, helperText, isSuccess, className = '', style, disabled, ...props }, ref) => {
    const hasError = Boolean(error);
    const errorId = `${id}-error`;
    const helperId = `${id}-helper`;

    const borderColor = hasError
      ? tokens.colors.danger
      : isSuccess
      ? tokens.colors.success
      : tokens.colors.gray300;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
        {label && (
          <label
            htmlFor={id}
            style={{
              fontSize: '14px',
              fontWeight: 600,
              color: tokens.colors.gray700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span>{label}</span>
            {props.required && (
              <span style={{ color: tokens.colors.danger, fontSize: '13px' }} aria-hidden="true">
                * Requerido
              </span>
            )}
          </label>
        )}

        <div style={{ position: 'relative', width: '100%' }}>
          <input
            id={id}
            ref={ref}
            disabled={disabled}
            aria-invalid={hasError}
            aria-describedby={hasError ? errorId : helperText ? helperId : undefined}
            style={{
              width: '100%',
              minHeight: '44px', // Ley de Fitts
              padding: '10px 14px',
              fontSize: '15px',
              fontFamily: 'inherit',
              borderRadius: tokens.radii.md,
              border: `1px solid ${borderColor}`,
              backgroundColor: disabled ? tokens.colors.gray100 : tokens.colors.white,
              color: disabled ? tokens.colors.gray400 : tokens.colors.gray900,
              boxShadow: tokens.shadows.sm,
              transition: 'border-color 150ms ease, box-shadow 150ms ease',
              boxSizing: 'border-box',
              outline: 'none',
              ...style,
            }}
            className={`input-field ${hasError ? 'input-error' : ''} ${className}`}
            {...props}
          />
        </div>

        {hasError && (
          <p
            id={errorId}
            role="alert"
            style={{
              fontSize: '13px',
              color: tokens.colors.danger,
              margin: '2px 0 0 0',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <span>⚠</span>
            <span>{error}</span>
          </p>
        )}

        {!hasError && helperText && (
          <p
            id={helperId}
            style={{
              fontSize: '13px',
              color: tokens.colors.gray500,
              margin: '2px 0 0 0',
            }}
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
