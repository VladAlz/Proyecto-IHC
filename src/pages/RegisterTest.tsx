import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ClipboardList, Sparkles } from 'lucide-react';
import { TestForm } from '../components/organisms/TestForm/TestForm';
import { PageHeader } from '../components/molecules/PageState/PageState';
import { Button } from '../components/atoms/Button/Button';
import { TEST_DEPENDENTS, useApiMutation } from '../hooks/useApi';
import { api } from '../services/api';
import { CreateTestDto, UsabilityTest } from '../types';

/**
 * Página Registro de prueba (HU-01, HU-09)
 * Registro rápido de una sesión aislada. Para sesiones guiadas por un plan (T1…Tn)
 * se usa la fase de ejecución del módulo Planes de prueba.
 */
export const RegisterTestPage: React.FC = () => {
  const navigate = useNavigate();
  const [lastSaved, setLastSaved] = useState<UsabilityTest | null>(null);
  const create = useApiMutation((dto: CreateTestDto) => api.createTest(dto), {
    invalidate: TEST_DEPENDENTS,
    success: 'Prueba registrada. El dashboard ya incluye esta sesión.',
  });

  return (
    <div className="page">
      <div style={{ maxWidth: 880, margin: '0 auto', width: '100%' }} className="stack">
        <PageHeader
          module="register"
          title="Registrar prueba de usabilidad"
          description="Registra una sesión en menos de un minuto."
          actions={
            <Button variant="secondary" leftIcon={<ClipboardList size={16} />} onClick={() => navigate('/plans')}>
              Ejecutar un plan de prueba
            </Button>
          }
        />
        {lastSaved && (
          <div role="status" className="alert alert-success animate-fade-in">
            <CheckCircle2 size={20} aria-hidden="true" />
            <div style={{ flex: 1 }}>
              <strong>Sesión de {lastSaved.evaluatorName} guardada.</strong>
              <div className="small">Se conservó la tarea y la versión para registrar al siguiente participante más rápido.</div>
            </div>
            <div className="row" style={{ gap: 8 }}>
              <Button variant="secondary" size="sm" onClick={() => navigate('/dashboard')}>
                Ver en dashboard
              </Button>
              <Button size="sm" leftIcon={<Sparkles size={14} />} onClick={() => navigate('/ai-assistant', { state: { testIds: [lastSaved.id] } })}>
                Analizar con IA
              </Button>
            </div>
          </div>
        )}
      </div>
      <TestForm
        isSubmitting={create.isPending}
        onSubmit={async (dto) => {
          const saved = await create.mutateAsync(dto);
          setLastSaved(saved);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    </div>
  );
};
