import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { RotateCcw, Server } from 'lucide-react';
import { TabNavigation } from '../../molecules/TabNavigation/TabNavigation';
import { checkBackendHealth, resetMockDataToSeed } from '../../../services/api';
import { tokens } from '../../../styles/tokens';
import { Button } from '../../atoms/Button/Button';

/**
 * Plantilla MainLayout
 * Fundamentos IHC:
 * - Continuidad Perceptual (Gestalt): Header común → Navegación persistente por pestañas → Área de contenido.
 * - Visibilidad del estado del sistema (Nielsen #1): Indicador de salud del backend en tiempo real.
 * - Responsive: Diseñado para un consumo fluido en tablet (>=768px) y desktop (>=1024px).
 */
export const MainLayout: React.FC = () => {
  const [backendStatus, setBackendStatus] = useState<{
    online: boolean;
    message: string;
    checked: boolean;
  }>({
    online: false,
    message: 'Verificando conectividad con NestJS...',
    checked: false,
  });

  const [isVerifying, setIsVerifying] = useState(false);

  const verifyBackend = async () => {
    setIsVerifying(true);
    const res = await checkBackendHealth();
    setBackendStatus({
      online: res.online,
      message: res.message,
      checked: true,
    });
    setIsVerifying(false);
  };

  useEffect(() => {
    verifyBackend();
  }, []);

  const handleResetData = () => {
    if (confirm('¿Deseas restaurar la base de datos al estado inicial de 10 pruebas y hallazgos del Sprint 1?')) {
      resetMockDataToSeed();
      window.location.reload();
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: tokens.colors.gray50,
      }}
    >
      {/* 1. HEADER PRINCIPAL */}
      <header
        style={{
          backgroundColor: tokens.colors.white,
          borderBottom: `1px solid ${tokens.colors.gray200}`,
          padding: '16px 24px',
          boxShadow: tokens.shadows.sm,
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          {/* Título e identidad del proyecto */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: tokens.radii.md,
                backgroundColor: tokens.colors.primary,
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '18px',
                boxShadow: tokens.shadows.sm,
              }}
            >
              2.0
            </div>
            <div>
              <h1 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: tokens.colors.gray900 }}>
                Usability Test Dashboard 2.0
              </h1>
              <p style={{ fontSize: '12px', color: tokens.colors.gray500, margin: '2px 0 0 0' }}>
                Asistente IA para Pruebas de Usabilidad • Grupo 4 IHC • Sprint 1
              </p>
            </div>
          </div>

          {/* Estado de conectividad Backend & Acciones */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {/* Pill de estado del Backend (Nielsen #1) */}
            <div
              title={backendStatus.message}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 12px',
                borderRadius: tokens.radii.full,
                fontSize: '12px',
                fontWeight: 600,
                backgroundColor: backendStatus.online ? tokens.colors.successLight : tokens.colors.warningLight,
                color: backendStatus.online ? tokens.colors.success : tokens.colors.warning,
                border: `1px solid ${backendStatus.online ? tokens.colors.successBorder : tokens.colors.warningBorder}`,
              }}
            >
              <Server size={14} />
              <span>
                {backendStatus.online
                  ? 'NestJS Backend Conectado (:3000)'
                  : 'Modo Mock Local Activo'}
              </span>

              <button
                type="button"
                onClick={verifyBackend}
                disabled={isVerifying}
                title="Comprobar conexión con http://localhost:3000/api"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: isVerifying ? 'wait' : 'pointer',
                  padding: '2px',
                  display: 'inline-flex',
                  color: 'inherit',
                }}
              >
                <RotateCcw size={12} className={isVerifying ? 'animate-spin' : ''} />
              </button>
            </div>

            {/* Botón de reinicio de seed */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetData}
              title="Restaurar los 10 registros de prueba iniciales"
              leftIcon={<RotateCcw size={13} />}
            >
              Resetear Seed
            </Button>
          </div>
        </div>
      </header>

      {/* 2. BARRA DE NAVEGACIÓN POR PESTAÑAS (Figura-Fondo Gestalt & WAI-ARIA) */}
      <TabNavigation />

      {/* 3. ÁREA DE CONTENIDO PRINCIPAL */}
      <main
        style={{
          flex: 1,
          maxWidth: '1200px',
          width: '100%',
          margin: '0 auto',
          padding: '28px 20px',
          boxSizing: 'border-box',
        }}
      >
        <Outlet />
      </main>

      {/* 4. FOOTER CON FUNDAMENTOS IHC */}
      <footer
        style={{
          backgroundColor: tokens.colors.white,
          borderTop: `1px solid ${tokens.colors.gray200}`,
          padding: '20px 24px',
          fontSize: '12px',
          color: tokens.colors.gray500,
          marginTop: 'auto',
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div>
            <strong>IHC 2026 Grupo 4:</strong> Vladimir González (QA/Scrum) • Santiago Mora (UX/UI) • Pedro Acaro (Backend) • Boris Vinces (Frontend)
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <span>ISO 9241-11 Calidad de Uso</span>
            <span>WCAG 2.1 AA</span>
            <span>10 Heurísticas de Nielsen</span>
            <span>Leyes Gestalt</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
