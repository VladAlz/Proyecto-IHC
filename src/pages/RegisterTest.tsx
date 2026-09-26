import React from 'react';
import { useTests } from '../hooks/useTests';
import { TestForm } from '../components/organisms/TestForm/TestForm';
import { tokens } from '../styles/tokens';
import { CreateTestDto } from '../types';

/**
 * Página Registro de Prueba (Ruta /register)
 * Fundamentos IHC:
 * - Embudo de Operacionalización (Semana 2): Captura variables medibles de la tarea.
 * - Mapeo Lógico y Leyes Gestalt: Estructuración ergonómica de la entrada de datos.
 */
export const RegisterTestPage: React.FC = () => {
  const { createTest, isCreating } = useTests();

  const handleCreateTest = async (data: CreateTestDto) => {
    await createTest(data);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ maxWidth: '860px', margin: '0 auto', width: '100%' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: tokens.colors.gray900 }}>
          Registro de Prueba de Usabilidad
        </h1>
        <p style={{ fontSize: '14px', color: tokens.colors.gray600, margin: '4px 0 0 0' }}>
          Captura formal de métricas de desempeño según ISO 9241-11 y observaciones cualitativas
        </p>
      </div>

      <TestForm onSubmit={handleCreateTest} isSubmitting={isCreating} />
    </div>
  );
};
