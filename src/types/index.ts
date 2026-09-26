/**
 * Tipos de datos e interfaces compartidas entre Frontend (Boris) y Backend (Pedro)
 * Alineados a la Guía de Acción Sprint 1 - Grupo 4 IHC (ISO 9241-11, Nielsen, Gestalt, Norman)
 */

export interface UsabilityTest {
  id: string;
  evaluatorName: string;      // Quién evalúa
  taskDescription: string;    // Tarea evaluada
  timeOnTask: number;         // Eficiencia en segundos (ISO 9241-11)
  errorsCount: number;        // Efectividad inversa (número entero >= 0)
  satisfactionScore: number;  // Satisfacción escala 1-5 (ISO 9241-11)
  taskResult: 'success' | 'failure'; // Efectividad (ISO 9241-11)
  observations?: string;      // Observaciones cualitativas (input para módulo IA)
  createdAt: string;          // Timestamp ISO 8601
}

export interface CreateTestDto {
  evaluatorName: string;
  taskDescription: string;
  timeOnTask: number;
  errorsCount: number;
  satisfactionScore: number;
  taskResult: 'success' | 'failure';
  observations?: string;
}

export type UpdateTestDto = Partial<CreateTestDto>;

export interface DashboardSummary {
  totalTests: number;
  successRate: number;        // Porcentaje (0 - 100)
  avgTime: number;            // Tiempo promedio en segundos
  avgSatisfaction: number;    // Satisfacción promedio (1 - 5)
  // Tendencias con respecto al período anterior (Semana 6: Reconocimiento antes que Recuerdo)
  trends?: {
    totalTestsDiff: number;       // ej: +3 vs semana anterior
    successRateDiff: number;      // ej: +5.2%
    avgTimeDiff: number;          // ej: -8.5s (mejora de eficiencia)
    avgSatisfactionDiff: number;  // ej: +0.4
  };
}

export interface UsabilityFinding {
  id: string;
  severity: 1 | 2 | 3 | 4;   // 1: Cosmético, 2: Menor, 3: Mayor, 4: Catastrófico (Nielsen)
  heuristicViolated: string; // Heurística de Nielsen violada
  location: string;          // Pestaña o elemento donde ocurre
  description: string;       // Descripción técnica del problema
  recommendation: string;    // Acción correctiva propuesta
  theoreticalBasis?: string; // Fundamento IHC (Norman, Gestalt, Fitts, ISO 9241-11)
}

export interface AiAnalysisResult {
  hallazgos_clave: string[];
  historias_usuario: {
    titulo: string;
    criterio_aceptacion: string;
    prioridad: 'alta' | 'media' | 'baja';
  }[];
  recomendaciones_diseno: string[];
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  statusCode?: number;
}
