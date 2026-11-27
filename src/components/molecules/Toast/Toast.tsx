import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

type ToastKind = 'success' | 'error' | 'info';
interface ToastItem {
  id: number;
  kind: ToastKind;
  message: string;
}

interface ToastApi {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

const STYLES: Record<ToastKind, { bg: string; color: string; border: string; icon: React.ReactNode }> = {
  success: { bg: '#f0fdf4', color: '#166534', border: '#bbf7d0', icon: <CheckCircle2 size={18} aria-hidden="true" /> },
  error: { bg: '#fef2f2', color: '#991b1b', border: '#fecaca', icon: <AlertCircle size={18} aria-hidden="true" /> },
  info: { bg: '#eff6ff', color: '#1e3a8a', border: '#bfdbfe', icon: <Info size={18} aria-hidden="true" /> },
};

/**
 * Molécula Toast
 * Fundamentos IHC:
 * - Nielsen #1 (Visibilidad del estado): toda acción que guarda o elimina datos confirma su resultado.
 * - Nielsen #9: los errores se muestran en lenguaje claro con su causa.
 * - WCAG 2.1: región aria-live para lectores de pantalla; los errores no desaparecen solos.
 */
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: number) => setItems((prev) => prev.filter((t) => t.id !== id)), []);

  const push = useCallback(
    (kind: ToastKind, message: string) => {
      const id = Date.now() + Math.random();
      setItems((prev) => [...prev.slice(-3), { id, kind, message }]);
      if (kind !== 'error') setTimeout(() => dismiss(id), 4500);
    },
    [dismiss],
  );

  const api = useMemo<ToastApi>(
    () => ({
      success: (m) => push('success', m),
      error: (m) => push('error', m),
      info: (m) => push('info', m),
    }),
    [push],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="toast-region" role="region" aria-label="Notificaciones" aria-live="polite">
        {items.map((t) => {
          const s = STYLES[t.kind];
          return (
            <div
              key={t.id}
              className="toast"
              role={t.kind === 'error' ? 'alert' : 'status'}
              style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}
            >
              {s.icon}
              <span style={{ flex: 1 }}>{t.message}</span>
              <button
                type="button"
                onClick={() => dismiss(t.id)}
                aria-label="Cerrar notificación"
                style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 2 }}
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast debe usarse dentro de ToastProvider');
  return ctx;
}
