import axios from 'axios';
import {
  UsabilityTest,
  CreateTestDto,
  UpdateTestDto,
  DashboardSummary,
  UsabilityFinding,
  AiAnalysisResult,
} from '../types';
import {
  INITIAL_TESTS,
  INITIAL_FINDINGS,
  calculateDashboardSummary,
  generateMockAiAnalysis,
} from './mockData';

// Configuración base de Axios conectada a NestJS (puerto 3000 vía proxy o variable de entorno)
const API_URL = import.meta.env.VITE_API_URL || '/api';

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 4000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const STORAGE_KEY = 'ihc_usability_tests_v1';
const FINDINGS_STORAGE_KEY = 'ihc_usability_findings_v1';

// Inicialización de almacenamiento local (Mock Storage)
function getLocalTests(): UsabilityTest[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_TESTS));
      return INITIAL_TESTS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_TESTS;
  }
}

function saveLocalTests(tests: UsabilityTest[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tests));
  } catch (err) {
    console.error('Error al persistir tests en localStorage:', err);
  }
}

function getLocalFindings(): UsabilityFinding[] {
  try {
    const raw = localStorage.getItem(FINDINGS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(FINDINGS_STORAGE_KEY, JSON.stringify(INITIAL_FINDINGS));
      return INITIAL_FINDINGS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_FINDINGS;
  }
}

// Estado de conectividad con el backend
let isBackendAvailable = false;
let hasCheckedBackend = false;

/**
 * Verifica la disponibilidad del backend de NestJS
 */
export async function checkBackendHealth(): Promise<{ online: boolean; message: string }> {
  try {
    const response = await apiClient.get('/tests', { timeout: 2000 });
    isBackendAvailable = response.status >= 200 && response.status < 300;
    hasCheckedBackend = true;
    return {
      online: true,
      message: 'Conectado exitosamente con NestJS Backend (:3000)',
    };
  } catch {
    isBackendAvailable = false;
    hasCheckedBackend = true;
    return {
      online: false,
      message: 'Modo Local / Mock Activo (Backend en http://localhost:3000 no detectado)',
    };
  }
}

export function getBackendStatus(): { isAvailable: boolean; hasChecked: boolean } {
  return { isAvailable: isBackendAvailable, hasChecked: hasCheckedBackend };
}

// ==========================================
// SERVICIOS CRUD: Pruebas de Usabilidad (Tests)
// ==========================================

export async function fetchTests(): Promise<UsabilityTest[]> {
  try {
    const res = await apiClient.get<UsabilityTest[] | { data: UsabilityTest[]; meta: unknown }>('/tests');
    isBackendAvailable = true;
    const tests: UsabilityTest[] = Array.isArray(res.data)
      ? res.data
      : (res.data as { data: UsabilityTest[] }).data;
    saveLocalTests(tests);
    return tests;
  } catch (error) {
    isBackendAvailable = false;
    // Fallback transparente al mock local
    return getLocalTests();
  }
}

export async function fetchTestById(id: string): Promise<UsabilityTest | undefined> {
  try {
    const res = await apiClient.get<UsabilityTest>(`/tests/${id}`);
    isBackendAvailable = true;
    return res.data;
  } catch (error) {
    isBackendAvailable = false;
    const tests = getLocalTests();
    return tests.find((t) => t.id === id);
  }
}

export async function createUsabilityTest(dto: CreateTestDto): Promise<UsabilityTest> {
  const newLocalTest: UsabilityTest = {
    ...dto,
    id: `test-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    createdAt: new Date().toISOString(),
  };

  try {
    const res = await apiClient.post<UsabilityTest>('/tests', dto);
    isBackendAvailable = true;
    // Actualizar también en storage local
    const tests = getLocalTests();
    saveLocalTests([res.data, ...tests.filter((t) => t.id !== res.data.id)]);
    return res.data;
  } catch (error) {
    // Si el backend aún no está levantado, operamos transparentemente con persistencia local
    isBackendAvailable = false;
    const tests = getLocalTests();
    const updated = [newLocalTest, ...tests];
    saveLocalTests(updated);
    return newLocalTest;
  }
}

export async function updateUsabilityTest(id: string, dto: UpdateTestDto): Promise<UsabilityTest> {
  try {
    const res = await apiClient.patch<UsabilityTest>(`/tests/${id}`, dto);
    isBackendAvailable = true;
    const tests = getLocalTests();
    saveLocalTests(tests.map((t) => (t.id === id ? res.data : t)));
    return res.data;
  } catch (error) {
    isBackendAvailable = false;
    const tests = getLocalTests();
    let updatedItem: UsabilityTest | undefined;
    const updated = tests.map((t) => {
      if (t.id === id) {
        updatedItem = { ...t, ...dto };
        return updatedItem;
      }
      return t;
    });
    saveLocalTests(updated);
    if (!updatedItem) throw new Error('Prueba no encontrada');
    return updatedItem;
  }
}

export async function deleteUsabilityTest(id: string): Promise<void> {
  try {
    await apiClient.delete(`/tests/${id}`);
    isBackendAvailable = true;
  } catch (error) {
    isBackendAvailable = false;
  } finally {
    const tests = getLocalTests();
    saveLocalTests(tests.filter((t) => t.id !== id));
  }
}

// ==========================================
// SERVICIOS DASHBOARD: KPIs y Hallazgos
// ==========================================

export async function fetchDashboardSummary(): Promise<DashboardSummary> {
  try {
    const res = await apiClient.get<DashboardSummary>('/dashboard/summary');
    isBackendAvailable = true;
    return res.data;
  } catch (error) {
    isBackendAvailable = false;
    const tests = getLocalTests();
    return calculateDashboardSummary(tests);
  }
}

export async function fetchDashboardFindings(): Promise<UsabilityFinding[]> {
  try {
    const res = await apiClient.get<UsabilityFinding[]>('/dashboard/findings');
    isBackendAvailable = true;
    return res.data;
  } catch (error) {
    isBackendAvailable = false;
    return getLocalFindings();
  }
}

// ==========================================
// SERVICIO MÓDULO IA: Análisis de Usabilidad
// ==========================================

export async function analyzeObservationsWithAi(payload: {
  testId?: string;
  observations?: string;
}): Promise<AiAnalysisResult> {
  try {
    const res = await apiClient.post<AiAnalysisResult>('/ai/analyze', payload);
    isBackendAvailable = true;
    return res.data;
  } catch (error) {
    isBackendAvailable = false;
    // Simular latencia de red para demostrar el estado de carga (Nielsen #1: Visibilidad)
    await new Promise((resolve) => setTimeout(resolve, 800));
    return generateMockAiAnalysis(payload.observations);
  }
}

// Reiniciar datos al seed original si es requerido
export function resetMockDataToSeed(): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_TESTS));
  localStorage.setItem(FINDINGS_STORAGE_KEY, JSON.stringify(INITIAL_FINDINGS));
}
