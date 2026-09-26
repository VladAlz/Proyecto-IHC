import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Copy,
  Download,
  Check,
  FileText,
  AlertOctagon,
  ArrowRight,
  Lightbulb,
  ListTodo,
} from 'lucide-react';
import { UsabilityTest, AiAnalysisResult } from '../../../types';
import { Button } from '../../atoms/Button/Button';
import { Badge } from '../../atoms/Badge/Badge';
import { Spinner } from '../../atoms/Spinner/Spinner';
import { tokens } from '../../../styles/tokens';

export interface AiAnalysisPanelProps {
  tests: UsabilityTest[];
  initialObservations?: string;
  initialTestId?: string;
  onAnalyze: (payload: { testId?: string; observations?: string }) => Promise<unknown>;
  result: AiAnalysisResult | null;
  isAnalyzing: boolean;
}

/**
 * Organismo AiAnalysisPanel
 * Fundamentos IHC:
 * - Cierra el Ciclo APE 1 (Semana 2): Observación → Hallazgo → Acción de Diseño.
 * - Nielsen #1 (Visibilidad del estado del sistema): Elimina la incertidumbre del textarea
 *   antiguo mediante estados explícitos de progreso, spinners y visualización en tiempo real.
 * - Transformación Cognitiva (Norman): En lugar de un JSON crudo o un textarea en blanco,
 *   estructura los resultados en tarjetas visuales con jerarquía clara y prioridades (Badges).
 * - Facilidad de transición: Permite exportar a Markdown/Issues con un solo clic.
 */
export const AiAnalysisPanel: React.FC<AiAnalysisPanelProps> = ({
  tests,
  initialObservations = '',
  initialTestId = '',
  onAnalyze,
  result,
  isAnalyzing,
}) => {
  const [selectedTestId, setSelectedTestId] = useState<string>(initialTestId);
  const [observationsText, setObservationsText] = useState<string>(initialObservations);
  const [copied, setCopied] = useState(false);

  // Sincronizar observaciones si se selecciona una prueba de la lista
  const handleSelectTest = (id: string) => {
    setSelectedTestId(id);
    if (!id) return;
    const found = tests.find((t) => t.id === id);
    if (found) {
      const note = found.observations
        ? found.observations
        : `Evaluador: ${found.evaluatorName} | Tarea: ${found.taskDescription} | Tiempo: ${found.timeOnTask}s | Errores: ${found.errorsCount} | Resultado: ${found.taskResult}`;
      setObservationsText(note);
    }
  };

  useEffect(() => {
    if (initialObservations) {
      setObservationsText(initialObservations);
    }
    if (initialTestId) {
      setSelectedTestId(initialTestId);
    }
  }, [initialObservations, initialTestId]);

  const handleRunAnalysis = async () => {
    if (!observationsText.trim() && !selectedTestId) return;
    await onAnalyze({
      testId: selectedTestId || undefined,
      observations: observationsText.trim(),
    });
  };

  const handleCopyMarkdown = () => {
    if (!result) return;
    let md = `# Reporte de Análisis de Usabilidad Asistido por IA\n\n`;
    md += `## Hallazgos Clave\n`;
    result.hallazgos_clave.forEach((h) => (md += `- ${h}\n`));

    md += `\n## Historias de Usuario Derivadas\n`;
    result.historias_usuario.forEach((hu) => {
      md += `### ${hu.titulo} (Prioridad: ${hu.prioridad})\n`;
      md += `**Criterio de Aceptación:** ${hu.criterio_aceptacion}\n\n`;
    });

    md += `## Recomendaciones de Diseño IHC\n`;
    result.recomendaciones_diseno.forEach((r) => (md += `- ${r}\n`));

    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadJson = () => {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analisis-usabilidad-ia-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing.xl, maxWidth: '1000px', margin: '0 auto' }}>
      {/* 1. SECCIÓN DE ENTRADA Y FLUJO AUTOMÁTICO */}
      <section
        style={{
          backgroundColor: tokens.colors.white,
          borderRadius: tokens.radii.lg,
          border: `1px solid ${tokens.colors.gray200}`,
          padding: '24px',
          boxShadow: tokens.shadows.sm,
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: tokens.radii.md,
              backgroundColor: tokens.colors.primaryLight,
              color: tokens.colors.primary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Sparkles size={20} />
          </div>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: tokens.colors.gray900 }}>
              Generador de Historias de Usuario & Recomendaciones IHC
            </h2>
            <p style={{ fontSize: '13px', color: tokens.colors.gray500, margin: '2px 0 0 0' }}>
              Ciclo APE 1: Transforma notas de campo en requerimientos ágiles y fundamentados técnicamente
            </p>
          </div>
        </div>

        {/* Carga automática desde una prueba existente (Elimina la copia manual de texto) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label htmlFor="test-select" style={{ fontSize: '14px', fontWeight: 600, color: tokens.colors.gray700 }}>
            Seleccionar prueba para cargar observaciones automáticamente:
          </label>
          <select
            id="test-select"
            value={selectedTestId}
            onChange={(e) => handleSelectTest(e.target.value)}
            style={{
              padding: '10px 14px',
              minHeight: '44px',
              borderRadius: tokens.radii.md,
              border: `1px solid ${tokens.colors.gray300}`,
              fontSize: '14px',
              fontFamily: 'inherit',
              backgroundColor: tokens.colors.gray50,
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="">-- Cargar prueba registrada (opcional) --</option>
            {tests.map((t) => (
              <option key={t.id} value={t.id}>
                {t.evaluatorName} - {t.taskDescription} ({t.taskResult === 'success' ? 'Éxito' : 'Fallo'})
              </option>
            ))}
          </select>
        </div>

        {/* Área de texto editable */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label htmlFor="observations-input" style={{ fontSize: '14px', fontWeight: 600, color: tokens.colors.gray700 }}>
            Observaciones cualitativas a procesar:
          </label>
          <textarea
            id="observations-input"
            rows={4}
            value={observationsText}
            onChange={(e) => setObservationsText(e.target.value)}
            placeholder="Ingresa o ajusta las notas observadas durante la sesión de usabilidad..."
            style={{
              padding: '12px',
              borderRadius: tokens.radii.md,
              border: `1px solid ${tokens.colors.gray300}`,
              fontSize: '14px',
              fontFamily: 'inherit',
              resize: 'vertical',
              outline: 'none',
            }}
          />
        </div>

        {/* Botón de acción con Ley de Fitts y Visibilidad de Estado */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '12px' }}>
          <Button
            variant="primary"
            size="lg"
            isLoading={isAnalyzing}
            onClick={handleRunAnalysis}
            disabled={!observationsText.trim() && !selectedTestId}
            leftIcon={<Sparkles size={18} />}
          >
            {isAnalyzing ? 'Procesando con IA (NLP)...' : 'Procesar con IA'}
          </Button>
        </div>
      </section>

      {/* 2. ESTADO DE CARGA EXPLÍCITO (Nielsen #1: Visibilidad del estado del sistema) */}
      {isAnalyzing && (
        <section
          role="status"
          className="animate-fade-in"
          style={{
            backgroundColor: tokens.colors.white,
            borderRadius: tokens.radii.lg,
            border: `1px solid ${tokens.colors.primaryLight}`,
            padding: '32px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
            boxShadow: tokens.shadows.sm,
          }}
        >
          <Spinner size="lg" />
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: tokens.colors.gray800, margin: 0 }}>
            Analizando observaciones de usabilidad...
          </h3>
          <p style={{ fontSize: '13px', color: tokens.colors.gray500, maxWidth: '480px', margin: 0 }}>
            Extrayendo hallazgos clave, clasificando patrones según las 10 Heurísticas de Nielsen y estructurando Historias de Usuario con criterios de aceptación.
          </p>
        </section>
      )}

      {/* 3. RESULTADOS ESTRUCTURADOS EN TARJETAS (NO TEXTAREA) */}
      {!isAnalyzing && result && (
        <section
          className="animate-fade-in"
          style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing.lg }}
        >
          {/* Header de resultados y acciones de exportación */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 700, margin: 0, color: tokens.colors.gray900 }}>
                Resultado del Análisis Estructurado
              </h2>
              <span style={{ fontSize: '13px', color: tokens.colors.success, fontWeight: 500 }}>
                ✓ Contrato AiAnalysisResult procesado correctamente
              </span>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleCopyMarkdown}
                leftIcon={copied ? <Check size={14} color={tokens.colors.success} /> : <Copy size={14} />}
              >
                {copied ? '¡Copiado a portapapeles!' : 'Copiar como Markdown'}
              </Button>

              <Button
                variant="secondary"
                size="sm"
                onClick={handleDownloadJson}
                leftIcon={<Download size={14} />}
              >
                Descargar JSON
              </Button>
            </div>
          </div>

          {/* Tarjeta 1: Hallazgos Clave */}
          <div
            style={{
              backgroundColor: tokens.colors.white,
              borderRadius: tokens.radii.lg,
              border: `1px solid ${tokens.colors.gray200}`,
              padding: '20px 24px',
              boxShadow: tokens.shadows.sm,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <AlertOctagon size={18} color={tokens.colors.primary} />
              <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: tokens.colors.gray900 }}>
                Hallazgos Clave Identificados
              </h3>
            </div>

            <ul style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingLeft: '20px', margin: 0 }}>
              {result.hallazgos_clave.map((hallazgo, idx) => (
                <li key={idx} style={{ fontSize: '14px', color: tokens.colors.gray800, lineHeight: 1.5 }}>
                  {hallazgo}
                </li>
              ))}
            </ul>
          </div>

          {/* Tarjeta 2: Historias de Usuario */}
          <div
            style={{
              backgroundColor: tokens.colors.white,
              borderRadius: tokens.radii.lg,
              border: `1px solid ${tokens.colors.gray200}`,
              padding: '20px 24px',
              boxShadow: tokens.shadows.sm,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <ListTodo size={18} color={tokens.colors.success} />
              <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: tokens.colors.gray900 }}>
                Historias de Usuario Derivadas (Backlog Ágil)
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
              {result.historias_usuario.map((hu, idx) => (
                <div
                  key={idx}
                  style={{
                    border: `1px solid ${tokens.colors.gray200}`,
                    borderRadius: tokens.radii.md,
                    padding: '16px',
                    backgroundColor: tokens.colors.gray50,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '10px',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                      <strong style={{ fontSize: '14px', color: tokens.colors.gray900, lineHeight: 1.3 }}>
                        {hu.titulo}
                      </strong>
                      <Badge
                        variant={hu.prioridad === 'alta' ? 'danger' : hu.prioridad === 'media' ? 'warning' : 'default'}
                        size="sm"
                      >
                        Prioridad: {hu.prioridad}
                      </Badge>
                    </div>

                    <div style={{ marginTop: '10px', fontSize: '13px', color: tokens.colors.gray700 }}>
                      <strong style={{ color: tokens.colors.gray900 }}>Criterio de Aceptación:</strong>{' '}
                      {hu.criterio_aceptacion}
                    </div>
                  </div>

                  <span style={{ fontSize: '11px', color: tokens.colors.gray500, alignSelf: 'flex-end' }}>
                    HU-{String(idx + 1).padStart(2, '0')} (Sprint Backlog)
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Tarjeta 3: Recomendaciones de Diseño IHC */}
          <div
            style={{
              backgroundColor: tokens.colors.white,
              borderRadius: tokens.radii.lg,
              border: `1px solid ${tokens.colors.gray200}`,
              padding: '20px 24px',
              boxShadow: tokens.shadows.sm,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <Lightbulb size={18} color="#d97706" />
              <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: tokens.colors.gray900 }}>
                Recomendaciones de Diseño Fundamentadas en IHC
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {result.recomendaciones_diseno.map((rec, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    padding: '10px 14px',
                    backgroundColor: tokens.colors.warningLight,
                    borderLeft: `4px solid ${tokens.colors.warning}`,
                    borderRadius: '0 8px 8px 0',
                    fontSize: '13px',
                    color: tokens.colors.gray800,
                  }}
                >
                  <ArrowRight size={16} color={tokens.colors.warning} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Estado Inicial Vacio */}
      {!isAnalyzing && !result && (
        <section
          style={{
            backgroundColor: tokens.colors.white,
            borderRadius: tokens.radii.lg,
            border: `1px dashed ${tokens.colors.gray300}`,
            padding: '48px 24px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <FileText size={40} color={tokens.colors.gray400} />
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: tokens.colors.gray700, margin: 0 }}>
            Listo para procesar observaciones
          </h3>
          <p style={{ fontSize: '13px', color: tokens.colors.gray500, maxWidth: '420px', margin: 0 }}>
            Selecciona una sesión de prueba en el selector superior o ingresa tus observaciones cualitativas para generar el reporte con IA.
          </p>
        </section>
      )}
    </div>
  );
};
