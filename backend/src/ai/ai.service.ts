import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { TestsService } from '../tests/tests.service';
import { AnalyzeRequestDto } from './dto/analyze-request.dto';
import {
  USABILITY_ANALYSIS_SYSTEM_PROMPT,
  buildUsabilityAnalysisPrompt,
} from './prompts/usability-analysis.prompt';

export interface AiAnalysisResult {
  hallazgos_clave: string[];
  historias_usuario: {
    titulo: string;
    criterio_aceptacion: string;
    prioridad: 'alta' | 'media' | 'baja';
  }[];
  recomendaciones_diseno: string[];
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private genAI: GoogleGenerativeAI | null = null;

  constructor(
    private readonly configService: ConfigService,
    private readonly testsService: TestsService,
  ) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (apiKey && apiKey.trim() !== '') {
      this.genAI = new GoogleGenerativeAI(apiKey.trim());
      this.logger.log('🟢 Google Gemini API SDK inicializado correctamente.');
    } else {
      this.logger.warn(
        '⚠️ GEMINI_API_KEY no configurada. El módulo de IA operará en modo de análisis heurístico local.',
      );
    }
  }

  async analyze(dto: AnalyzeRequestDto): Promise<AiAnalysisResult> {
    let observations = dto.observations || '';
    let taskDescription = 'Evaluación general del flujo';

    if (dto.testId) {
      try {
        const test = await this.testsService.findOne(dto.testId);
        if (test) {
          taskDescription = test.taskDescription;
          if (!observations) {
            observations = test.observations || '';
          }
        }
      } catch (err) {
        this.logger.warn(`No se pudo cargar la prueba con ID ${dto.testId}: ${err.message}`);
      }
    }

    if (!observations.trim()) {
      observations = 'El flujo general presenta demoras de interacción en componentes interactivos.';
    }

    // Si tenemos Google Gemini disponible, ejecutamos la llamada al LLM
    if (this.genAI) {
      try {
        const model = this.genAI.getGenerativeModel({
          model: 'gemini-1.5-flash',
          systemInstruction: USABILITY_ANALYSIS_SYSTEM_PROMPT,
        });

        const prompt = buildUsabilityAnalysisPrompt(observations, taskDescription);
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // Limpiar posibles bloques ```json ... ``` devueltos por el modelo
        const cleaned = responseText
          .replace(/```json/gi, '')
          .replace(/```/g, '')
          .trim();

        const parsed = JSON.parse(cleaned);
        if (parsed.hallazgos_clave && parsed.historias_usuario && parsed.recomendaciones_diseno) {
          return parsed as AiAnalysisResult;
        }
      } catch (error) {
        this.logger.error(`Error al invocar Google Gemini API: ${error.message}. Empleando fallback heurístico.`);
      }
    }

    // Fallback heurístico inteligente fundamentado en IHC
    return this.generateHeuristicAnalysis(observations, taskDescription);
  }

  private generateHeuristicAnalysis(
    observations: string,
    taskDescription: string,
  ): AiAnalysisResult {
    const isExportOrFinding = observations.toLowerCase().includes('botón') || observations.toLowerCase().includes('encontró');
    const isRatingOrNumber = observations.toLowerCase().includes('estrella') || observations.toLowerCase().includes('escala');

    return {
      hallazgos_clave: [
        `Observación analizada: "${observations.slice(0, 120)}${observations.length > 120 ? '...' : ''}"`,
        isExportOrFinding
          ? 'Baja visibilidad y contraste insuficiente en elementos de acción primaria (Violación Nielsen #1 y #8).'
          : 'Dificultad de procesamiento perceptual en tareas secuenciales (Carga cognitiva de Miller).',
        isRatingOrNumber
          ? 'El modelo mental del usuario requiere mapeos naturales inmediatos (Affordance y Manipulación Directa).'
          : 'La ausencia de feedback visible en tiempo real genera el "abismo de evaluación" descrito por Don Norman.',
      ],
      historias_usuario: [
        {
          titulo: 'Optimizar la visibilidad y estado de respuesta en acciones críticas',
          criterio_aceptacion:
            'Dado que el evaluador interactúa con el sistema, cuando ejecuta una acción asíncrona, debe ver un indicador visual de progreso claro en menos de 100ms.',
          prioridad: 'alta',
        },
        {
          titulo: 'Mejorar el contraste perceptual y jerarquía visual de acciones primarias',
          criterio_aceptacion:
            'Todos los botones principales deben contar con un ratio de contraste mínimo de 4.5:1 (WCAG 2.1 AA) y área táctil de al menos 44×44px (Ley de Fitts).',
          prioridad: 'alta',
        },
        {
          titulo: 'Simplificar formularios agrupando campos por afinidad funcional',
          criterio_aceptacion:
            'Los campos del formulario deben estructurarse en bloques con bordes sutiles según la Ley Gestalt de Proximidad.',
          prioridad: 'media',
        },
      ],
      recomendaciones_diseno: [
        'Aplicar la Ley de Fitts: Maximizar el área interactiva de los controles críticos a un mínimo de 44×44px.',
        'Garantizar el principio POUR de WCAG 2.1 AA con foco visible y contraste adecuado entre figura y fondo.',
        'Integrar micro-retroalimentación visual inmediata tras guardar o modificar un registro para cerrar el ciclo de Norman.',
      ],
    };
  }
}
