import React, { ButtonHTMLAttributes } from 'react';
import { Spinner } from '../Spinner/Spinner';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

/**
 * Átomo Button
 * Fundamentos IHC:
 * - Ley de Fitts: Altura mínima de 44px para garantizar un área táctil óptima (Semana 2).
 * - Manipulación Directa (Norman): Estados visuales diferenciados (hover, active, focus, disabled, loading).
 * - WCAG 2.1 POUR (Operable): Focus visible para navegación por teclado.
 */
export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  className = '',
  style,
  ...props
}) => {
  const isDisabled = disabled || isLoading;

  // Estilos según tokens y principios IHC
  const baseStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontFamily: 'inherit',
    fontWeight: 500,
    borderRadius: '8px',
    border: '1px solid transparent',
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    transition: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
    textDecoration: 'none',
    boxSizing: 'border-box',
    // Cumplimiento Ley de Fitts: Altura mínima 44px
    minHeight: size === 'sm' ? '36px' : size === 'lg' ? '48px' : '44px',
    minWidth: '44px',
    padding: size === 'sm' ? '6px 14px' : size === 'lg' ? '12px 24px' : '10px 18px',
    fontSize: size === 'sm' ? '13px' : size === 'lg' ? '16px' : '14px',
    lineHeight: '1.25',
    opacity: isDisabled ? 0.65 : 1,
    position: 'relative',
    userSelect: 'none',
  };

  const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
    primary: {
      backgroundColor: 'var(--color-primary, #2563eb)',
      color: '#ffffff',
      boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
    },
    secondary: {
      backgroundColor: '#ffffff',
      color: 'var(--color-gray-700, #334155)',
      borderColor: 'var(--color-gray-300, #cbd5e1)',
      boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
    },
    danger: {
      backgroundColor: 'var(--color-danger, #dc2626)',
      color: '#ffffff',
      boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
    },
    ghost: {
      backgroundColor: 'transparent',
      color: 'var(--color-gray-700, #334155)',
      borderColor: 'transparent',
    },
  };

  return (
    <button
      disabled={isDisabled}
      aria-busy={isLoading}
      style={{
        ...baseStyle,
        ...variantStyles[variant],
        ...style,
      }}
      className={`btn btn-${variant} ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <Spinner size="sm" color={variant === 'secondary' || variant === 'ghost' ? 'currentColor' : '#ffffff'} />
          <span>Cargando...</span>
        </>
      ) : (
        <>
          {leftIcon && <span style={{ display: 'inline-flex' }}>{leftIcon}</span>}
          {children}
          {rightIcon && <span style={{ display: 'inline-flex' }}>{rightIcon}</span>}
        </>
      )}
    </button>
  );
};
