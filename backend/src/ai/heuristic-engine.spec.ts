import { generateHeuristicAnalysis } from './heuristic-engine';
import { normalizeAnalysis, normalizeCategory, normalizeHeuristic, normalizePriority, normalizeSeverity, parseJsonLoose } from './ai-normalizer';

describe('Motor heurístico local', () => {
  it('es determinista', () => {
    const input = { sessions: [], freeText: 'No sabía si el formulario se guardó. El botón estaba oculto al final.' };
    expect(generateHeuristicAnalysis(input)).toEqual(generateHeuristicAnalysis(input));
  });

  it('procesa texto libre sin sesiones', () => {
    const r = generateHeuristicAnalysis({ sessions: [], freeText: 'No sabía si el formulario se guardó, no hubo confirmación.' });
    expect(r.hallazgos.map((h) => h.categoria)).toContain('Visibilidad y feedback');
    expect(r.resumen).toContain('texto libre');
  });

  it('registra tareas fallidas aunque no tengan observaciones', () => {
    const r = generateHeuristicAnalysis({
      sessions: [
        { evaluatorName: 'P1', taskDescription: 'Encontrar horario', taskResult: 'failure', timeOnTask: 80, errorsCount: 1, satisfactionScore: 2 },
      ],
    });
    expect(r.hallazgos).toHaveLength(1);
    expect(r.hallazgos[0].severidad).toBe(3);
  });

  it('no inventa hallazgos cuando todo salió bien', () => {
    const r = generateHeuristicAnalysis({
      sessions: [
        { evaluatorName: 'P1', taskDescription: 'X', taskResult: 'success', timeOnTask: 10, errorsCount: 0, satisfactionScore: 5, observations: 'Todo claro y rápido.' },
      ],
    });
    expect(r.hallazgos).toHaveLength(0);
    expect(r.resumen).toContain('No se identificaron');
  });

  it('genera historias con formato Como/quiero/para y tareas', () => {
    const r = generateHeuristicAnalysis({ sessions: [], freeText: 'Tuvo que copiar y pegar manualmente varias veces.' });
    expect(r.historias_usuario[0].titulo).toMatch(/^Como .*quiero .*para /);
    expect(r.historias_usuario[0].tareas.length).toBeGreaterThan(0);
  });
});

describe('Normalizador de salida IA', () => {
  it('normaliza severidades textuales y numéricas', () => {
    expect(normalizeSeverity('Catastrófico')).toBe(4);
    expect(normalizeSeverity('mayor')).toBe(3);
    expect(normalizeSeverity(0)).toBe(1);
    expect(normalizeSeverity('7')).toBe(4);
  });

  it('normaliza prioridades', () => {
    expect(normalizePriority('high')).toBe('Alta');
    expect(normalizePriority('baja')).toBe('Baja');
    expect(normalizePriority(undefined)).toBe('Media');
  });

  it('mapea categorías y heurísticas aproximadas', () => {
    expect(normalizeCategory('Problema de navegación')).toBe('Navegación');
    expect(normalizeCategory('???')).toBe('General');
    expect(normalizeHeuristic('Heurística #5')).toBe('Nielsen #5: Prevención de errores');
  });

  it('acepta el contrato del Sprint 1 (hallazgos_clave)', () => {
    const r = normalizeAnalysis({
      hallazgos_clave: ['Baja visibilidad del botón'],
      historias_usuario: [{ titulo: 'Como X', criterio_aceptacion: 'Y', prioridad: 'alta' }],
      recomendaciones_diseno: ['Aplicar Ley de Fitts'],
    });
    expect(r.hallazgos[0].titulo).toBe('Baja visibilidad del botón');
    expect(r.recomendaciones[0].recomendacion).toBe('Aplicar Ley de Fitts');
  });

  it('extrae JSON rodeado de texto', () => {
    expect(parseJsonLoose('Claro, aquí está: {"a":1} saludos')).toEqual({ a: 1 });
    expect(() => parseJsonLoose('sin json')).toThrow();
  });
});
