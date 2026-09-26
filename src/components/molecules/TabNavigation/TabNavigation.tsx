import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, FilePlus2, Sparkles, SplitSquareVertical } from 'lucide-react';
import { tokens } from '../../../styles/tokens';

export interface TabItem {
  id: string;
  path: string;
  label: string;
  badge?: string;
  icon: React.ReactNode;
}

const TABS: TabItem[] = [
  {
    id: 'dashboard',
    path: '/dashboard',
    label: 'Dashboard UX',
    icon: <LayoutDashboard size={18} />,
  },
  {
    id: 'register',
    path: '/register',
    label: 'Registro de Prueba',
    icon: <FilePlus2 size={18} />,
  },
  {
    id: 'ai-assistant',
    path: '/ai-assistant',
    label: 'Asistente IA',
    icon: <Sparkles size={18} />,
  },
  {
    id: 'redesign-evidence',
    path: '/redesign-evidence',
    label: 'Evidencia Rediseño',
    icon: <SplitSquareVertical size={18} />,
  },
];

/**
 * Molécula TabNavigation
 * Fundamentos IHC:
 * - Ley Gestalt de Figura-Fondo (Semana 6): La pestaña activa se destaca inequívocamente
 *   del fondo con un contraste alto, borde inferior marcado e indicador visual de selección.
 * - WCAG 2.1 POUR (Operable): Implementación de WAI-ARIA tablist/tab con soporte para
 *   navegación por teclado (Flechas izquierda/derecha, Home, End).
 * - Ley de Fitts: Cada pestaña cumple con un área de interacción de al menos 44px de alto.
 */
export const TabNavigation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    let nextIndex = index;
    if (e.key === 'ArrowRight') {
      nextIndex = (index + 1) % TABS.length;
    } else if (e.key === 'ArrowLeft') {
      nextIndex = (index - 1 + TABS.length) % TABS.length;
    } else if (e.key === 'Home') {
      nextIndex = 0;
    } else if (e.key === 'End') {
      nextIndex = TABS.length - 1;
    } else {
      return;
    }

    e.preventDefault();
    navigate(TABS[nextIndex].path);
    // Enfocar el elemento siguiente
    const nextTab = document.getElementById(`tab-link-${TABS[nextIndex].id}`);
    nextTab?.focus();
  };

  return (
    <nav
      aria-label="Navegación principal del dashboard"
      style={{
        borderBottom: `1px solid ${tokens.colors.gray200}`,
        backgroundColor: tokens.colors.white,
        padding: '0 24px',
      }}
    >
      <div
        role="tablist"
        aria-orientation="horizontal"
        style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        {TABS.map((tab, index) => {
          const isActive =
            location.pathname === tab.path ||
            (tab.path === '/dashboard' && location.pathname === '/');

          return (
            <NavLink
              key={tab.id}
              id={`tab-link-${tab.id}`}
              to={tab.path}
              role="tab"
              aria-selected={isActive}
              tabIndex={isActive ? 0 : -1}
              onKeyDown={(e) => handleKeyDown(e, index)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                // Cumplimiento Fitts
                minHeight: '48px',
                padding: '0 16px',
                fontSize: '14px',
                fontWeight: isActive ? 600 : 500,
                textDecoration: 'none',
                // Ley de Figura-Fondo
                color: isActive ? tokens.colors.primary : tokens.colors.gray600,
                backgroundColor: isActive ? tokens.colors.primaryLight : 'transparent',
                borderBottom: isActive
                  ? `3px solid ${tokens.colors.primary}`
                  : '3px solid transparent',
                borderRadius: '8px 8px 0 0',
                transition: 'all 150ms ease',
                whiteSpace: 'nowrap',
                outline: 'none',
              }}
              className={`tab-item ${isActive ? 'tab-item-active' : ''}`}
            >
              <span
                style={{
                  display: 'inline-flex',
                  color: isActive ? tokens.colors.primary : tokens.colors.gray500,
                }}
              >
                {tab.icon}
              </span>
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  style={{
                    backgroundColor: tokens.colors.gray200,
                    color: tokens.colors.gray700,
                    fontSize: '11px',
                    padding: '2px 6px',
                    borderRadius: tokens.radii.full,
                    fontWeight: 600,
                  }}
                >
                  {tab.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
