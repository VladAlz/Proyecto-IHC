import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  ClipboardList,
  FilePlus2,
  KanbanSquare,
  LayoutDashboard,
  SearchCheck,
  Sparkles,
  SplitSquareVertical,
} from 'lucide-react';
import { tokens } from '../../../styles/tokens';
import { MODULE_THEME, ModuleId } from '../../../styles/theme';

export interface TabItem {
  id: ModuleId;
  path: string;
  label: string;
  icon: React.ReactNode;
  shortcut: string;
}

/**
 * Orden de las pestañas = flujo metodológico del proyecto integrador:
 * plan → registro → dashboard → hallazgos → IA → SCRUM → antes/después.
 * 7 elementos: dentro del límite 7±2 de Miller.
 */
export const TABS: TabItem[] = [
  { id: 'dashboard', path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} />, shortcut: '1' },
  { id: 'plans', path: '/plans', label: 'Planes de prueba', icon: <ClipboardList size={18} />, shortcut: '2' },
  { id: 'register', path: '/register', label: 'Registrar prueba', icon: <FilePlus2 size={18} />, shortcut: '3' },
  { id: 'findings', path: '/findings', label: 'Hallazgos', icon: <SearchCheck size={18} />, shortcut: '4' },
  { id: 'ai', path: '/ai-assistant', label: 'Asistente IA', icon: <Sparkles size={18} />, shortcut: '5' },
  { id: 'scrum', path: '/scrum', label: 'SCRUM', icon: <KanbanSquare size={18} />, shortcut: '6' },
  { id: 'comparison', path: '/comparison', label: 'Antes / Después', icon: <SplitSquareVertical size={18} />, shortcut: '7' },
];

/**
 * Molécula TabNavigation
 * - Figura-Fondo (Gestalt): la sección activa contrasta con borde inferior y fondo.
 * - WCAG 2.1: enlaces de navegación con aria-current="page"; flechas ←/→ para moverse y
 *   atajos Alt+1…7 (Nielsen #7: aceleradores para usuarios expertos, hallazgo de la prueba v2).
 * - Ley de Fitts: área de 48px de alto por pestaña.
 */
export const TabNavigation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!e.altKey || e.ctrlKey || e.metaKey) return;
      const tab = TABS.find((t) => t.shortcut === e.key);
      if (tab) {
        e.preventDefault();
        navigate(tab.path);
        document.getElementById(`tab-link-${tab.id}`)?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [navigate]);

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    let next = index;
    if (e.key === 'ArrowRight') next = (index + 1) % TABS.length;
    else if (e.key === 'ArrowLeft') next = (index - 1 + TABS.length) % TABS.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = TABS.length - 1;
    else return;
    e.preventDefault();
    document.getElementById(`tab-link-${TABS[next].id}`)?.focus();
  };

  return (
    <nav
      aria-label="Navegación principal"
      className="no-print"
      style={{ borderBottom: `1px solid ${tokens.colors.gray200}`, backgroundColor: tokens.colors.white, padding: '10px 16px', boxShadow: tokens.shadows.sm }}
    >
      <ul className="nav-list">
        {TABS.map((tab, index) => {
          const isActive = location.pathname.startsWith(tab.path);
          const theme = MODULE_THEME[tab.id];
          return (
            <li key={tab.id}>
              <NavLink
                id={`tab-link-${tab.id}`}
                to={tab.path}
                aria-current={isActive ? 'page' : undefined}
                title={`${tab.label} (Alt+${tab.shortcut})`}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className={`nav-pill ${isActive ? 'is-active' : ''}`}
                style={{ '--pill-accent': theme.accent, '--pill-soft': theme.soft } as React.CSSProperties}
              >
                <span aria-hidden="true" style={{ display: 'inline-flex' }}>
                  {tab.icon}
                </span>
                {tab.label}
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
