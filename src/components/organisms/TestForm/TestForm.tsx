import React, { useState } from 'react';
import { Clock, FileText, RotateCcw, Save, Sparkles, User } from 'lucide-react';
import { AppVersion, CreateTestDto } from '../../../types';
import { Button } from '../../atoms/Button/Button';
import { Input } from '../../atoms/Input/Input';
import { StarRating } from '../../atoms/StarRating/StarRating';
import { FormField } from '../../molecules/FormField/FormField';
import { ResultSelector } from '../../molecules/ResultSelector/ResultSelector';
import { tokens } from '../../../styles/tokens';

export interface TestFormProps {
  onSubmit: (data: CreateTestDto) => Promise<unknown>;
  isSubmitting?: boolean;
}

const INITIAL: CreateTestDto = {
  evaluatorName: '',
  participantProfile: '',
  taskDescription: '',
  appVersion: 'v2',
  timeOnTask: 0,
  errorsCount: 0,
  satisfactionScore: 0,
  taskResult: 'success',
  observations: '',
};

const fieldsetStyle: React.CSSProperties = {
  border: `1px solid ${tokens.colors.gray200}`,
  borderRadius: tokens.radii.lg,
  padding: 24,
  backgroundColor: tokens.colors.white,
  boxShadow: tokens.shadows.sm,
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
  minWidth: 0,
};

const legendStyle: React.CSSProperties = {
  fontSize: 16,
  fontWeight: 700,
  color: tokens.colors.gray900,
  padding: '0 8px',
  display: 'flex',
  alignItems: 'center',
  gap: 8,
};

/**
 * Organismo TestForm (HU-01, HU-09)
 * - Ley de Proximidad (Gestalt): 4 bloques semánticos.
 * - ISO 9241-11: efectividad (resultado de 3 niveles, errores), eficiencia (tiempo) y satisfacción.
 * - Nielsen #5 y #9: validación en línea antes de enviar y errores junto al campo.
 * - Norman: StarRating (affordance) y selector de resultado con icono + texto.
 */
export const TestForm: React.FC<TestFormProps> = ({ onSubmit, isSubmitting = false }) => {
  const [form, setForm] = useState<CreateTestDto>(INITIAL);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = <K extends keyof CreateTestDto>(key: K, value: CreateTestDto[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key as string]) setErrors((e) => ({ ...e, [key as string]: '' }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (form.evaluatorName.trim().length < 2) e.evaluatorName = 'Escribe el nombre o código del participante (mínimo 2 caracteres)';
    if (form.taskDescription.trim().length < 5) e.taskDescription = 'Describe la tarea evaluada (mínimo 5 caracteres)';
    if (!form.timeOnTask || form.timeOnTask <= 0) e.timeOnTask = 'Ingresa el tiempo en segundos (mayor a 0)';
    else if (form.timeOnTask > 7200) e.timeOnTask = 'El tiempo no puede superar 7200 s (2 horas)';
    if (form.errorsCount < 0 || !Number.isInteger(form.errorsCount)) e.errorsCount = 'Los errores deben ser un entero desde 0';
    if (!form.satisfactionScore) e.satisfactionScore = 'Selecciona la satisfacción (1 a 5 estrellas)';
    setErrors(e);
    if (Object.keys(e).length) {
      document.getElementById(Object.keys(e)[0])?.focus();
      return false;
    }
    return true;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    try {
      await onSubmit({
        ...form,
        evaluatorName: form.evaluatorName.trim(),
        taskDescription: form.taskDescription.trim(),
        participantProfile: form.participantProfile?.trim() || undefined,
        observations: form.observations?.trim() || undefined,
      });
      setForm({ ...INITIAL, appVersion: form.appVersion, taskDescription: form.taskDescription });
      setErrors({});
    } catch {
      /* el error se informa con toast desde la página */
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 880, margin: '0 auto', width: '100%' }}>
      <fieldset style={fieldsetStyle}>
        <legend style={legendStyle}>
          <User size={18} color={tokens.colors.primary} aria-hidden="true" />
          1. Participante y tarea
        </legend>
        <div className="grid grid-2">
          <Input
            id="evaluatorName"
            label="Participante / evaluador"
            required
            placeholder="Ej. P1 - Ana Morales"
            value={form.evaluatorName}
            onChange={(e) => set('evaluatorName', e.target.value)}
            error={errors.evaluatorName}
            helperText="Usa un código (P1, P2…) si prefieres anonimizar"
          />
          <Input
            id="participantProfile"
            label="Perfil (opcional)"
            placeholder="Ej. Estudiante 5to nivel, usuario de laptop"
            value={form.participantProfile}
            onChange={(e) => set('participantProfile', e.target.value)}
            helperText="Ayuda a interpretar resultados por tipo de usuario"
          />
          <Input
            id="taskDescription"
            label="Tarea evaluada"
            required
            placeholder="Ej. Localizar el botón de exportación de reporte"
            value={form.taskDescription}
            onChange={(e) => set('taskDescription', e.target.value)}
            error={errors.taskDescription}
            helperText="Usa el mismo texto en todas las sesiones de la misma tarea para poder compararlas"
          />
          <FormField id="appVersion" label="Versión evaluada" required helperText="v1 = aplicativo inicial · v2 = versión rediseñada">
            <select id="appVersion" className="control" value={form.appVersion} onChange={(e) => set('appVersion', e.target.value as AppVersion)}>
              <option value="v1">v1 · Inicial (antes del rediseño)</option>
              <option value="v2">v2 · Rediseño (después)</option>
            </select>
          </FormField>
        </div>
      </fieldset>

      <fieldset style={fieldsetStyle}>
        <legend style={legendStyle}>
          <Clock size={18} color={tokens.colors.primary} aria-hidden="true" />
          2. Métricas de calidad de uso (ISO 9241-11)
        </legend>
        <div className="grid grid-2">
          <Input
            id="timeOnTask"
            type="number"
            inputMode="decimal"
            step="0.5"
            min="0.5"
            label="Tiempo en tarea (segundos)"
            required
            value={form.timeOnTask || ''}
            onChange={(e) => set('timeOnTask', parseFloat(e.target.value) || 0)}
            error={errors.timeOnTask}
            helperText="Eficiencia: cronometra desde que lees la tarea hasta que termina"
          />
          <Input
            id="errorsCount"
            type="number"
            inputMode="numeric"
            min="0"
            step="1"
            label="Errores o tropiezos"
            required
            value={form.errorsCount}
            onChange={(e) => set('errorsCount', parseInt(e.target.value, 10) || 0)}
            error={errors.errorsCount}
            helperText="Clics equivocados, desvíos o retrocesos"
          />
        </div>
        <FormField id="taskResult" label="Resultado de la tarea (efectividad)" required helperText="«Con ayuda»: completó solo después de una pista del moderador">
          <ResultSelector name="taskResult" value={form.taskResult} onChange={(v) => set('taskResult', v)} />
        </FormField>
      </fieldset>

      <fieldset style={fieldsetStyle}>
        <legend style={legendStyle}>
          <Sparkles size={18} color="#b45309" aria-hidden="true" />
          3. Satisfacción percibida
        </legend>
        <StarRating id="satisfactionScore" value={form.satisfactionScore} onChange={(v) => set('satisfactionScore', v)} error={errors.satisfactionScore} />
      </fieldset>

      <fieldset style={fieldsetStyle}>
        <legend style={legendStyle}>
          <FileText size={18} color={tokens.colors.primary} aria-hidden="true" />
          4. Observaciones cualitativas
        </legend>
        <FormField
          id="observations"
          label="Comentarios del participante y fricciones observadas"
          hint={`${form.observations?.length || 0}/5000`}
          helperText="Es la entrada principal del Asistente IA: describe qué hizo, qué dijo y dónde dudó."
        >
          <textarea
            id="observations"
            className="control"
            rows={4}
            maxLength={5000}
            value={form.observations}
            placeholder="Ej. Dudó entre 'Reportes' y 'Resultados'; dijo que no veía el botón de guardar porque tenía poco contraste…"
            onChange={(e) => set('observations', e.target.value)}
          />
        </FormField>
      </fieldset>

      <div className="row" style={{ justifyContent: 'flex-end' }}>
        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            setForm(INITIAL);
            setErrors({});
          }}
          disabled={isSubmitting}
          leftIcon={<RotateCcw size={16} />}
        >
          Limpiar
        </Button>
        <Button type="submit" size="lg" isLoading={isSubmitting} leftIcon={<Save size={16} />}>
          Guardar prueba
        </Button>
      </div>
    </form>
  );
};
