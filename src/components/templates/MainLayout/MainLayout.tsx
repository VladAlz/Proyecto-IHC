import React from 'react';
import { Outlet } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Bot, DatabaseBackup, RotateCcw, Server } from 'lucide-react';
import { TabNavigation } from '../../molecules/TabNavigation/TabNavigation';
import { Button } from '../../atoms/Button/Button';
import { api, getErrorMessage } from '../../../services/api';
import { useAiStatus } from '../../../hooks/useApi';
import { useToast } from '../../molecules/Toast/Toast';
import { tokens } from '../../../styles/tokens';

const PROVIDER_LABEL: Record<string, string> = {
  gemini: 'Gemini',
  groq: 'Groq',
  openrouter: 'OpenRouter',
  local: 'Motor local',
};

const Pill: React.FC<{ ok: boolean; icon: React.ReactNode; children: React.ReactNode; title?: string }> = ({ ok, icon, children, title }) => (
  <span
    title={title}
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      padding: '7px 14px',
      borderRadius: 9999,
      fontSize: 14,
      fontWeight: 600,
      background: 'rgba(255,255,255,0.14)',
      color: '#ffffff',
      border: '1px solid rgba(255,255,255,0.28)',
    }}
  >
    {/* Punto de estado: verde = ok, ámbar = atención (acompañado de texto, no solo color) */}
    <span aria-hidden="true" style={{ width: 10, height: 10, borderRadius: 9999, background: ok ? '#4ade80' : '#fbbf24', boxShadow: '0 0 0 3px rgba(255,255,255,0.18)' }} />
    {icon}
    {children}
  </span>
);

/**
 * Plantilla MainLayout
 * - Continuidad (Gestalt): cabecera → navegación persistente → contenido.
 * - Nielsen #1: estado del backend y del proveedor de IA siempre visibles.
 */
export const MainLayout: React.FC = () => {
  const qc = useQueryClient();
  const toast = useToast();
  const health = useQuery({ queryKey: ['health'], queryFn: api.health, refetchInterval: 15000, retry: 0 });
  const ai = useAiStatus();
  const online = health.isSuccess;
  const [resetting, setResetting] = React.useState(false);

  const handleReset = async () => {
    if (!confirm('¿Restaurar los datos iniciales? Se borrarán las pruebas, planes, hallazgos, análisis y datos SCRUM registrados localmente.')) return;
    setResetting(true);
    try {
      await api.resetData();
      await qc.invalidateQueries();
      toast.success('Datos restaurados al estado inicial (Sprint 1 + demo).');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setResetting(false);
    }
  };

  const aiProvider = ai.data?.primary ?? 'local';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: tokens.colors.gray50 }}>
      <a href="#main" className="skip-link">
        Saltar al contenido
      </a>
      <header className="no-print app-header">
        <div className="row-between" style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div className="row" style={{ gap: 14, flexWrap: 'nowrap' }}>
            <div
              aria-hidden="true"
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                background: '#ffffff',
                color: '#4338ca',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: 15,
                boxShadow: '0 8px 20px -8px rgba(0,0,0,0.45)',
                flexShrink: 0,
              }}
            >
              IHC
            </div>
            <div>
              <p style={{ fontSize: 20, fontWeight: 800, color: '#ffffff', lineHeight: 1.2 }}>Usability Test Dashboard</p>
              <p style={{ fontSize: 14, color: '#e0e7ff' }}>Pruebas de usabilidad con IA · Grupo 4</p>
            </div>
          </div>

          <div className="row" style={{ gap: 8 }}>
            <Pill
              ok={online}
              icon={<Server size={14} aria-hidden="true" />}
              title={online ? 'API NestJS en http://localhost:3000/api' : getErrorMessage(health.error)}
            >
              {health.isLoading ? 'Conectando…' : online ? 'Backend conectado' : 'Backend sin conexión'}
            </Pill>
            {online && (
              <Pill
                ok={aiProvider !== 'local'}
                icon={<Bot size={14} aria-hidden="true" />}
                title={
                  ai.data
                    ? `Cadena: ${ai.data.chain.map((c) => `${PROVIDER_LABEL[c.provider] || c.provider}${c.configured ? '' : ' (sin key)'}`).join(' → ')}`
                    : undefined
                }
              >
                IA: {PROVIDER_LABEL[aiProvider] || aiProvider}
              </Pill>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              disabled={!online}
              isLoading={resetting}
              leftIcon={<DatabaseBackup size={14} />}
              title="Borrar los datos locales y volver a la semilla del Sprint 1"
              style={{ color: '#ffffff', borderColor: 'rgba(255,255,255,0.35)' }}
            >
              Restaurar datos
            </Button>
          </div>
        </div>
      </header>

      <TabNavigation />

      {!online && !health.isLoading && (
        <div className="no-print" style={{ maxWidth: 1280, width: '100%', margin: '16px auto 0', padding: '0 16px' }}>
          <div role="alert" className="alert alert-warning">
            <Server size={18} aria-hidden="true" />
            <div className="stack-sm" style={{ flex: 1 }}>
              <strong>El backend no responde.</strong>
              <span className="small">
                Inicia el proyecto con <code>npm run dev</code> desde la carpeta raíz (levanta API y frontend). Los datos no se
                guardarán hasta que la conexión vuelva.
              </span>
            </div>
            <Button variant="secondary" size="sm" onClick={() => health.refetch()} leftIcon={<RotateCcw size={14} />}>
              Reintentar
            </Button>
          </div>
        </div>
      )}

      <main id="main" style={{ flex: 1, maxWidth: 1280, width: '100%', margin: '0 auto', padding: '24px 16px 40px' }}>
        <Outlet />
      </main>

      <footer
        className="no-print"
        style={{ backgroundColor: tokens.colors.white, borderTop: `1px solid ${tokens.colors.gray200}`, padding: '16px', fontSize: 14, color: tokens.colors.gray600 }}
      >
        <div className="row-between" style={{ maxWidth: 1280, margin: '0 auto' }}>
          <span>
            <strong>IHC 2026 · Grupo 4</strong> · Vladimir González · Santiago Mora · Pedro Acaro · Boris Vinces
          </span>
          <span>
            Atajos: <kbd>Alt</kbd> + <kbd>1</kbd>…<kbd>7</kbd>
          </span>
        </div>
      </footer>
    </div>
  );
};
