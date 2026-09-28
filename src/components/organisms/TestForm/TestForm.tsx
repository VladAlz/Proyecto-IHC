import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, RotateCcw, Save, Sparkles, User, FileText, Clock } from 'lucide-react';
import { CreateTestDto } from '../../../types';
import { Button } from '../../atoms/Button/Button';
import { Input } from '../../atoms/Input/Input';
import { StarRating } from '../../atoms/StarRating/StarRating';
import { FormField } from '../../molecules/FormField/FormField';
import { tokens } from '../../../styles/tokens';

export interface TestFormProps {
  onSubmit: (data: CreateTestDto) => Promise<unknown>;
  isSubmitting?: boolean;
}

const INITIAL_FORM_STATE: CreateTestDto = {
  evaluatorName: '',
  taskDescription: '',
  timeOnTask: 60,
  errorsCount: 0,
  satisfactionScore: 4,
  taskResult: 'success',
  observations: '',
};

/**
 * Organismo TestForm
 * Fundamentos IHC:
 * - Ley Gestalt de Proximidad y Cierre (Semana 6): Campos organizados en 4 bloques
 *   semánticos delimitados para reducir la carga cognitiva (Miller: 3-7 ítems).
 * - Calidad de Uso ISO 9241-11 (Semana 2): Captura Efectividad (éxito/fallo, errores),
 *   Eficiencia (tiempo en tarea) y Satisfacción (escala 1-5).
 * - Don Norman (Metáforas y Affordance - Semana 4): Reemplazo de inputs confusos por
 *   StarRating interactivo, switches claros de resultado y feedback inmediato.
 * - WCAG 2.1 AA (Semana 3): Formularios accesibles con etiquetas persistentes y mensajes inline.
 */
export const TestForm: React.FC<TestFormProps> = ({ onSubmit, isSubmitting = false }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<CreateTestDto>(INITIAL_FORM_STATE);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.evaluatorName.trim()) {
      newErrors.evaluatorName = 'El nombre del evaluador es obligatorio';
    } else if (formData.evaluatorName.trim().length < 3) {
      newErrors.evaluatorName = 'Debe tener al menos 3 caracteres';
    }

    if (!formData.taskDescription.trim()) {
      newErrors.taskDescription = 'La descripción de la tarea es obligatoria';
    } else if (formData.taskDescription.trim().length < 5) {
      newErrors.taskDescription = 'Describe la tarea con mayor detalle (mínimo 5 caracteres)';
    }

    if (formData.timeOnTask === undefined || formData.timeOnTask <= 0) {
      newErrors.timeOnTask = 'El tiempo en tarea debe ser un número positivo (segundos)';
    }

    if (formData.errorsCount === undefined || formData.errorsCount < 0) {
      newErrors.errorsCount = 'El número de errores no puede ser negativo';
    }

    if (!formData.satisfactionScore || formData.satisfactionScore < 1 || formData.satisfactionScore > 5) {
      newErrors.satisfactionScore = 'Selecciona una calificación de satisfacción (1 a 5 estrellas)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await onSubmit(formData);
      setSuccessMessage('¡Prueba de usabilidad registrada con éxito!');
      // Resetear después de guardar o mantener para feedback
    } catch (err) {
      console.error(err);
      setErrors({ form: 'Ocurrió un error al guardar la prueba. Intenta nuevamente.' });
    }
  };

  const handleReset = () => {
    setFormData(INITIAL_FORM_STATE);
    setErrors({});
    setSuccessMessage(null);
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: tokens.spacing.xl,
        maxWidth: '860px',
        margin: '0 auto',
      }}
    >
      {/* Notificación de éxito (Norman: Retroalimentación) */}
      {successMessage && (
        <div
          role="status"
          className="animate-fade-in"
          style={{
            backgroundColor: tokens.colors.successLight,
            border: `1px solid ${tokens.colors.successBorder}`,
            color: tokens.colors.success,
            borderRadius: tokens.radii.md,
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CheckCircle2 size={24} />
            <div>
              <strong style={{ fontSize: '15px' }}>{successMessage}</strong>
              <p style={{ fontSize: '13px', margin: '2px 0 0 0', color: tokens.colors.gray700 }}>
                Las métricas del dashboard se han actualizado automáticamente.
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => navigate('/dashboard')}
            >
              Ver en Dashboard
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              leftIcon={<Sparkles size={14} />}
              onClick={() => navigate('/ai-assistant')}
            >
              Analizar con IA
            </Button>
          </div>
        </div>
      )}

      {/* BLOQUE 1: Datos del Evaluador (Gestalt: Proximidad) */}
      <fieldset
        style={{
          border: `1px solid ${tokens.colors.gray200}`,
          borderRadius: tokens.radii.lg,
          padding: '24px',
          backgroundColor: tokens.colors.white,
          boxShadow: tokens.shadows.sm,
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <legend
          style={{
            fontSize: '16px',
            fontWeight: 700,
            color: tokens.colors.gray900,
            padding: '0 8px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <User size={18} color={tokens.colors.primary} />
          <span>1. Información del Evaluador y la Tarea</span>
        </legend>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          <Input
            id="evaluatorName"
            label="Nombre del Evaluador / Participante"
            required
            placeholder="Ej. Vladimir González o Participante #04"
            value={formData.evaluatorName}
            onChange={(e) => {
              setFormData({ ...formData, evaluatorName: e.target.value });
              if (errors.evaluatorName) setErrors({ ...errors, evaluatorName: '' });
            }}
            error={errors.evaluatorName}
            helperText="Persona o perfil que realiza la sesión de usabilidad"
          />

          <Input
            id="taskDescription"
            label="Descripción de la Tarea Evaluada"
            required
            placeholder="Ej. Localizar el botón de exportación y generar reporte"
            value={formData.taskDescription}
            onChange={(e) => {
              setFormData({ ...formData, taskDescription: e.target.value });
              if (errors.taskDescription) setErrors({ ...errors, taskDescription: '' });
            }}
            error={errors.taskDescription}
            helperText="Objetivo específico asignado al usuario durante la prueba"
          />
        </div>
      </fieldset>

      {/* BLOQUE 2: Métricas ISO 9241-11 (Efectividad y Eficiencia) */}
      <fieldset
        style={{
          border: `1px solid ${tokens.colors.gray200}`,
          borderRadius: tokens.radii.lg,
          padding: '24px',
          backgroundColor: tokens.colors.white,
          boxShadow: tokens.shadows.sm,
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <legend
          style={{
            fontSize: '16px',
            fontWeight: 700,
            color: tokens.colors.gray900,
            padding: '0 8px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Clock size={18} color={tokens.colors.primary} />
          <span>2. Métricas de Calidad de Uso (ISO 9241-11)</span>
        </legend>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', minWidth: 0 }}>
          <Input
            id="timeOnTask"
            type="number"
            step="0.5"
            min="1"
            label="Tiempo en Tarea (Segundos)"
            required
            value={formData.timeOnTask}
            onChange={(e) => {
              setFormData({ ...formData, timeOnTask: parseFloat(e.target.value) || 0 });
              if (errors.timeOnTask) setErrors({ ...errors, timeOnTask: '' });
            }}
            error={errors.timeOnTask}
            helperText="Eficiencia: Menor tiempo suele indicar mayor usabilidad"
          />

          <Input
            id="errorsCount"
            type="number"
            min="0"
            step="1"
            label="Cantidad de Errores / Tropiezos"
            required
            value={formData.errorsCount}
            onChange={(e) => {
              setFormData({ ...formData, errorsCount: parseInt(e.target.value, 10) || 0 });
              if (errors.errorsCount) setErrors({ ...errors, errorsCount: '' });
            }}
            error={errors.errorsCount}
            helperText="Efectividad inversa: Clics equivocados o desvíos"
          />

          <FormField
            id="taskResult"
            label="Resultado de la Tarea (Efectividad)"
            required
            helperText="¿El usuario logró completar el objetivo con éxito?"
          >
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
              <label
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  borderRadius: tokens.radii.md,
                  border: `2px solid ${
                    formData.taskResult === 'success'
                      ? tokens.colors.success
                      : tokens.colors.gray200
                  }`,
                  backgroundColor:
                    formData.taskResult === 'success'
                      ? tokens.colors.successLight
                      : tokens.colors.white,
                  color:
                    formData.taskResult === 'success'
                      ? tokens.colors.success
                      : tokens.colors.gray700,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '14px',
                  minHeight: '44px',
                }}
              >
                <input
                  type="radio"
                  name="taskResult"
                  value="success"
                  checked={formData.taskResult === 'success'}
                  onChange={() => setFormData({ ...formData, taskResult: 'success' })}
                  style={{ accentColor: tokens.colors.success }}
                />
                <span>✓ Éxito (Completada)</span>
              </label>

              <label
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  borderRadius: tokens.radii.md,
                  border: `2px solid ${
                    formData.taskResult === 'failure'
                      ? tokens.colors.danger
                      : tokens.colors.gray200
                  }`,
                  backgroundColor:
                    formData.taskResult === 'failure'
                      ? tokens.colors.dangerLight
                      : tokens.colors.white,
                  color:
                    formData.taskResult === 'failure'
                      ? tokens.colors.danger
                      : tokens.colors.gray700,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '14px',
                  minHeight: '44px',
                  textAlign: 'center',
                }}
              >
                <input
                  type="radio"
                  name="taskResult"
                  value="failure"
                  checked={formData.taskResult === 'failure'}
                  onChange={() => setFormData({ ...formData, taskResult: 'failure' })}
                  style={{ accentColor: tokens.colors.danger }}
                />
                <span>✗ Fracaso / Abandono</span>
              </label>
            </div>
          </FormField>
        </div>
      </fieldset>

      {/* BLOQUE 3: Satisfacción con Componente StarRating (Norman Affordance) */}
      <fieldset
        style={{
          border: `1px solid ${tokens.colors.gray200}`,
          borderRadius: tokens.radii.lg,
          padding: '24px',
          backgroundColor: tokens.colors.white,
          boxShadow: tokens.shadows.sm,
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        <legend
          style={{
            fontSize: '16px',
            fontWeight: 700,
            color: tokens.colors.gray900,
            padding: '0 8px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Sparkles size={18} color="#f59e0b" />
          <span>3. Satisfacción Percibida (Escala Visual 1-5)</span>
        </legend>

        <StarRating
          id="satisfactionScore"
          value={formData.satisfactionScore}
          onChange={(rating) => {
            setFormData({ ...formData, satisfactionScore: rating });
            if (errors.satisfactionScore) setErrors({ ...errors, satisfactionScore: '' });
          }}
          error={errors.satisfactionScore}
        />
      </fieldset>

      {/* BLOQUE 4: Observaciones Cualitativas para el Asistente IA */}
      <fieldset
        style={{
          border: `1px solid ${tokens.colors.gray200}`,
          borderRadius: tokens.radii.lg,
          padding: '24px',
          backgroundColor: tokens.colors.white,
          boxShadow: tokens.shadows.sm,
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        <legend
          style={{
            fontSize: '16px',
            fontWeight: 700,
            color: tokens.colors.gray900,
            padding: '0 8px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <FileText size={18} color={tokens.colors.primary} />
          <span>4. Observaciones Cualitativas (Alimentación IA)</span>
        </legend>

        <FormField
          id="observations"
          label="Comentarios, dudas del usuario y puntos de fricción detectados"
          hint={`${formData.observations?.length || 0} caracteres`}
          helperText="Estas observaciones serán analizadas automáticamente en el módulo 'Asistente IA' para generar Historias de Usuario."
        >
          <textarea
            id="observations"
            rows={4}
            value={formData.observations}
            placeholder="Ej. El usuario dudó al buscar el botón guardar; mencionó que la etiqueta no era clara y el contraste era bajo..."
            onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
            style={{
              width: '100%',
              padding: '12px',
              fontFamily: 'inherit',
              fontSize: '14px',
              borderRadius: tokens.radii.md,
              border: `1px solid ${tokens.colors.gray300}`,
              boxSizing: 'border-box',
              outline: 'none',
              resize: 'vertical',
            }}
          />
        </FormField>
      </fieldset>

      {/* Botones de Acción (Consistencia & Ley de Fitts) */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: '12px',
          padding: '8px 0',
        }}
      >
        <Button
          type="button"
          variant="secondary"
          onClick={handleReset}
          disabled={isSubmitting}
          leftIcon={<RotateCcw size={16} />}
        >
          Limpiar
        </Button>

        <Button
          type="submit"
          variant="primary"
          isLoading={isSubmitting}
          leftIcon={<Save size={16} />}
          size="lg"
        >
          Guardar Prueba de Usabilidad
        </Button>
      </div>
    </form>
  );
};
