import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { Spinner } from '../../atoms/Spinner/Spinner';
import { Button } from '../../atoms/Button/Button';
import { getErrorMessage } from '../../../services/api';
import { MODULE_THEME, ModuleId } from '../../../styles/theme';
import { TABS } from '../TabNavigation/TabNavigation';

/** Estados explícitos de carga y error (Nielsen #1 y #9) */
export const LoadingState: React.FC<{ text?: string }> = ({ text = 'Cargando información...' }) => (
  <div role="status" aria-live="polite" className="stack" style={{ alignItems: 'center', padding: '48px 0' }}>
    <Spinner size="lg" label={text} />
    <p className="muted">{text}</p>
  </div>
);

export const ErrorState: React.FC<{ error: unknown; onRetry?: () => void }> = ({ error, onRetry }) => (
  <div role="alert" className="alert alert-danger" style={{ maxWidth: 640, margin: '24px auto' }}>
    <AlertCircle size={20} aria-hidden="true" />
    <div className="stack-sm" style={{ flex: 1 }}>
      <strong>No se pudo cargar la información</strong>
      <span className="small">{getErrorMessage(error)}</span>
      {onRetry && (
        <div>
          <Button variant="secondary" size="sm" onClick={onRetry} leftIcon={<RotateCcw size={14} />}>
            Reintentar
          </Button>
        </div>
      )}
    </div>
  </div>
);

/**
 * Encabezado de página tipo "hero": icono y color del módulo (los mismos de su pestaña),
 * título grande y una sola línea de descripción para no sobrecargar con texto.
 */
export const PageHeader: React.FC<{ title: string; description?: string; actions?: React.ReactNode; module?: ModuleId }> = ({
  title,
  description,
  actions,
  module,
}) => {
  const theme = module ? MODULE_THEME[module] : undefined;
  const icon = module ? TABS.find((t) => t.id === module)?.icon : undefined;
  return (
    <div
      className="page-header page-hero"
      style={theme ? ({ '--hero-accent': theme.accent, '--hero-soft': theme.soft, '--hero-ring': theme.ring } as React.CSSProperties) : undefined}
    >
      <div className="row" style={{ gap: 16, flexWrap: 'nowrap', alignItems: 'center', minWidth: 0 }}>
        {icon && (
          <span className="hero-icon" aria-hidden="true">
            {icon}
          </span>
        )}
        <div style={{ minWidth: 0 }}>
          <h1>{title}</h1>
          {description && <p>{description}</p>}
        </div>
      </div>
      {actions && <div className="row">{actions}</div>}
    </div>
  );
};
