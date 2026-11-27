import { UsabilityTest } from '../tests/entities/usability-test.entity';

export interface UsabilityMetrics {
  totalTests: number;
  successRate: number;   // % éxito sin ayuda (Efectividad)
  assistedRate: number;  // % completado con ayuda
  failureRate: number;   // % fracaso / abandono
  avgTime: number;       // s (Eficiencia)
  avgErrors: number;
  avgSatisfaction: number; // 1-5 (Satisfacción)
}

const round1 = (n: number) => Math.round(n * 10) / 10;

/** Métricas ISO 9241-11 sobre un conjunto de sesiones */
export function computeMetrics(tests: UsabilityTest[]): UsabilityMetrics {
  const n = tests.length;
  if (!n) {
    return { totalTests: 0, successRate: 0, assistedRate: 0, failureRate: 0, avgTime: 0, avgErrors: 0, avgSatisfaction: 0 };
  }
  const count = (r: string) => tests.filter((t) => t.taskResult === r).length;
  const sum = (f: (t: UsabilityTest) => number) => tests.reduce((acc, t) => acc + Number(f(t) || 0), 0);
  return {
    totalTests: n,
    successRate: round1((count('success') / n) * 100),
    assistedRate: round1((count('assisted') / n) * 100),
    failureRate: round1((count('failure') / n) * 100),
    avgTime: round1(sum((t) => t.timeOnTask) / n),
    avgErrors: round1(sum((t) => t.errorsCount) / n),
    avgSatisfaction: round1(sum((t) => t.satisfactionScore) / n),
  };
}
