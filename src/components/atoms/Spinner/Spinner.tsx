import React from 'react';

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  label?: string;
}

/**
 * Átomo Spinner
 * Fundamentos IHC:
 * - Nielsen #1: Visibilidad del estado del sistema. Mantiene al usuario informado
 *   de que una acción está en procesamiento.
 * - WCAG 2.1: role="status" y texto oculto accesible para lectores de pantalla.
 */
export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  color = 'var(--color-primary, #2563eb)',
  label = 'Cargando información...',
}) => {
  const pixelSize = size === 'sm' ? 16 : size === 'lg' ? 32 : 24;

  return (
    <span
      role="status"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        verticalAlign: 'middle',
      }}
    >
      <svg
        className="animate-spin"
        width={pixelSize}
        height={pixelSize}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ color }}
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="3"
          strokeDasharray="60"
          strokeDashoffset="20"
          strokeLinecap="round"
          style={{ opacity: 0.25 }}
        />
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="3"
          strokeDasharray="60"
          strokeDashoffset="45"
          strokeLinecap="round"
        />
      </svg>
      <span className="sr-only">{label}</span>
    </span>
  );
};
