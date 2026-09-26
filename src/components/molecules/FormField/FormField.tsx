import React from 'react';
import { tokens } from '../../../styles/tokens';

export interface FormFieldProps {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  children: React.ReactNode;
  hint?: string;
}

/**
 * Molécula FormField
 * Fundamentos IHC:
 * - Nielsen #9: Ayuda a reconocer y corregir errores mediante mensajes claros y visibles.
 * - WCAG 2.1: Asociación accesible entre etiqueta, campo interactivo y mensaje de ayuda/error.
 * - Gestalt (Ley de Proximidad): Mantiene la etiqueta y el feedback adheridos espacialmente al campo.
 */
export const FormField: React.FC<FormFieldProps> = ({
  id,
  label,
  required = false,
  error,
  helperText,
  hint,
  children,
}) => {
  const errorId = `${id}-error`;
  const helperId = `${id}-helper`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <label
          htmlFor={id}
          style={{
            fontSize: '14px',
            fontWeight: 600,
            color: tokens.colors.gray800,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <span>{label}</span>
          {required && (
            <span style={{ color: tokens.colors.danger, fontWeight: 700 }} aria-hidden="true">
              *
            </span>
          )}
        </label>

        {hint && (
          <span style={{ fontSize: '12px', color: tokens.colors.gray500 }}>
            {hint}
          </span>
        )}
      </div>

      <div>{children}</div>

      {error && (
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
            fontWeight: 500,
          }}
        >
          <span>⚠</span>
          <span>{error}</span>
        </p>
      )}

      {!error && helperText && (
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
};
