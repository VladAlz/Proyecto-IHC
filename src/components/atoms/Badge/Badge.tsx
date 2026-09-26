import React from 'react';
import { tokens } from '../../../styles/tokens';

export type BadgeVariant = 'default' | 'success' | 'danger' | 'warning' | 'info';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  severity?: 1 | 2 | 3 | 4;
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
}

/**
 * Átomo Badge
 * Fundamentos IHC:
 * - Ley de Semejanza (Gestalt): Comunica categorías homogéneas mediante atributos visuales uniformes.
 * - WCAG 2.1 AA: Contrastes probados para alta legibilidad sin depender exclusivamente del color.
 */
export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  severity,
  size = 'md',
  icon,
}) => {
  let bg: string = tokens.colors.gray100;
  let color: string = tokens.colors.gray700;
  let border: string = tokens.colors.gray300;

  if (severity) {
    const sevToken = tokens.colors.severity[severity];
    bg = sevToken.bg;
    color = sevToken.text;
    border = sevToken.border;
  } else {
    switch (variant) {
      case 'success':
        bg = tokens.colors.successLight;
        color = tokens.colors.success;
        border = tokens.colors.successBorder;
        break;
      case 'danger':
        bg = tokens.colors.dangerLight;
        color = tokens.colors.danger;
        border = tokens.colors.dangerBorder;
        break;
      case 'warning':
        bg = tokens.colors.warningLight;
        color = tokens.colors.warning;
        border = tokens.colors.warningBorder;
        break;
      case 'info':
        bg = tokens.colors.primaryLight;
        color = tokens.colors.primary;
        border = '#bfdbfe';
        break;
    }
  }

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: size === 'sm' ? '2px 8px' : '4px 10px',
        fontSize: size === 'sm' ? '11px' : '12px',
        fontWeight: 600,
        lineHeight: 1.2,
        borderRadius: '9999px',
        backgroundColor: bg,
        color,
        border: `1px solid ${border}`,
        whiteSpace: 'nowrap',
      }}
    >
      {icon && <span style={{ display: 'inline-flex', fontSize: '12px' }}>{icon}</span>}
      {children}
    </span>
  );
};
