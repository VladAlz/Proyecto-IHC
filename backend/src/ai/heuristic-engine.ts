import {
  AiAnalysisInput,
  AiAnalysisResult,
  AiFinding,
  AiRecommendation,
  AiSessionInput,
  AiUserStory,
  Priority,
  Severity,
} from './ai.types';

/**
 * Motor heurístico local (sin LLM). Se usa cuando no hay API key configurada o cuando
 * todos los proveedores fallan (cuota agotada, red, JSON inválido). Clasifica observaciones
 * por palabras clave en categorías UX, calcula severidad a partir de las métricas de la
 * sesión y genera recomendaciones e historias con plantillas fundamentadas en IHC.
 * Es determinista: misma entrada → misma salida.
 */

interface CategoryRule {
  categoria: string;
  heuristica: string;
  keywords: string[];
  titulo: string;
  recomendacion: string;
  fundamento: string;
  historia: string;
  criterio: string;
  modulo: string;
  tareas: string[];
}

const RULES: CategoryRule[] = [
  {
    categoria: 'Jerarquía visual',
    heuristica: 'Nielsen #8: Diseño estético y minimalista',
    keywords: ['contraste', 'oculto', 'no vio', 'no lo vio', 'no la vio', 'al final', 'scroll', 'pequeñ', 'tamaño', 'visible', 'resalt', 'perdid', 'jerarqu'],
    titulo: 'Elementos clave con baja prominencia visual',
    recomendacion: 'Subir el elemento a la zona superior, aumentar tamaño y contraste (≥ 4.5:1) y usar color de acción primaria.',
    fundamento: 'Ley de Figura-Fondo (Gestalt), WCAG 2.1 AA 1.4.3 y Ley de Fitts.',
    historia: 'Como evaluador, quiero ver las acciones principales destacadas en la pantalla, para encontrarlas sin recorrer toda la página',
    criterio: 'Dado que abro la pantalla, cuando busco la acción principal, entonces la veo sin hacer scroll y con contraste mínimo 4.5:1.',
    modulo: 'UI',
    tareas: ['Rediseñar jerarquía visual en Figma', 'Reubicar el componente sobre el pliegue', 'Validar contraste con WAVE/Lighthouse'],
  },
  {
    categoria: 'Navegación',
    heuristica: 'Nielsen #6: Reconocimiento antes que recuerdo',
    keywords: ['no encontr', 'no lo encontr', 'busc', 'ubicar', 'menú', 'menu', 'naveg', 'dónde', 'donde', 'perdió', 'se perdi', 'regres', 'no sabía dónde', 'no sabia donde'],
    titulo: 'Dificultad para localizar funciones en la navegación',
    recomendacion: 'Renombrar y reagrupar las opciones del menú con etiquetas orientadas a la tarea y añadir indicador de ubicación actual.',
    fundamento: 'Arquitectura de información, Nielsen #6 y Ley de Miller (7±2 elementos).',
    historia: 'Como usuario nuevo, quiero que el menú use nombres claros por tarea, para llegar a cada función sin dudar',
    criterio: 'Dado un usuario nuevo, cuando se le pide localizar la función, entonces la encuentra al primer intento en menos de 20 s.',
    modulo: 'UI',
    tareas: ['Card sorting rápido con 3 compañeros', 'Actualizar etiquetas del menú', 'Probar tarea de localización (T1)'],
  },
  {
    categoria: 'Visibilidad y feedback',
    heuristica: 'Nielsen #1: Visibilidad del estado del sistema',
    keywords: ['cargando', 'carga', 'esper', 'no sab', 'no supo si', 'sin respuesta', 'no pasó nada', 'feedback', 'confirm', 'guardó', 'guardo', 'lento', 'congel'],
    titulo: 'Falta de retroalimentación sobre el estado del sistema',
    recomendacion: 'Mostrar estados explícitos de carga, éxito y error (spinner, mensaje de confirmación y toasts) en menos de 100 ms.',
    fundamento: 'Nielsen #1 y golfo de evaluación del ciclo de acción de Norman.',
    historia: 'Como evaluador, quiero recibir confirmación visible al guardar o procesar, para saber que la acción se completó',
    criterio: 'Dado que envío una acción, cuando el sistema procesa, entonces veo un indicador de progreso y luego un mensaje de éxito o error.',
    modulo: 'UI',
    tareas: ['Agregar estados loading/success/error', 'Implementar toast de confirmación', 'Verificar con lector de pantalla (aria-live)'],
  },
  {
    categoria: 'Formularios y prevención de errores',
    heuristica: 'Nielsen #5: Prevención de errores',
    keywords: ['formulario', 'campo', 'valid', 'obligatorio', 'escala', 'input', 'número', 'numero', 'ingres', 'error al', 'equivoc', 'dudó si 1', 'dudo si 1'],
    titulo: 'Formulario propenso a errores de ingreso',
    recomendacion: 'Validar en tiempo real, mostrar ayudas contextuales junto al campo y usar controles con affordance (estrellas, selectores) en lugar de texto libre.',
    fundamento: 'Nielsen #5 y #9, affordance de Norman y Ley de Proximidad (Gestalt).',
    historia: 'Como usuario final, quiero un formulario con validación y mensajes de ayuda, para registrar resultados sin errores',
    criterio: 'Dado que lleno el formulario, cuando un dato es inválido, entonces veo el error junto al campo antes de enviar.',
    modulo: 'Eval.',
    tareas: ['Definir reglas de validación por campo', 'Agregar helper text y mensajes inline', 'Probar con 3 usuarios el registro completo'],
  },
  {
    categoria: 'Contenido y lenguaje',
    heuristica: 'Nielsen #2: Correspondencia entre el sistema y el mundo real',
    keywords: ['etiqueta', 'nombre', 'término', 'termino', 'confus', 'no entend', 'significa', 'jerga', 'técnico', 'tecnico', 'ambig', 'no comunica'],
    titulo: 'Etiquetas y textos poco claros para el usuario',
    recomendacion: 'Reescribir etiquetas con el lenguaje del usuario, evitar tecnicismos y añadir microcopys de ayuda.',
    fundamento: 'Nielsen #2 y modelo mental del usuario (Norman).',
    historia: 'Como usuario, quiero que los textos usen mi lenguaje, para entender cada opción sin ayuda',
    criterio: 'Dado un usuario nuevo, cuando lee las etiquetas, entonces describe correctamente qué hace cada opción.',
    modulo: 'UI',
    tareas: ['Inventario de etiquetas confusas', 'Redactar microcopys', 'Validar comprensión con prueba de 5 segundos'],
  },
  {
    categoria: 'Accesibilidad',
    heuristica: 'Nielsen #4: Consistencia y estándares',
    keywords: ['teclado', 'foco', 'lector', 'accesib', 'tab ', 'shift+tab', 'daltón', 'wcag', 'aria'],
    titulo: 'Barreras de accesibilidad en la interacción',
    recomendacion: 'Garantizar foco visible, orden de tabulación lógico, etiquetas ARIA y contraste conforme a WCAG 2.1 AA.',
    fundamento: 'WCAG 2.1 AA (principios POUR).',
    historia: 'Como usuario que navega con teclado, quiero un foco visible y ordenado, para completar las tareas sin mouse',
    criterio: 'Dado que uso solo teclado, cuando recorro la pantalla, entonces el foco es visible y sigue el orden visual.',
    modulo: 'UI',
    tareas: ['Auditoría WAVE y Lighthouse', 'Corregir orden de tabulación', 'Agregar aria-labels faltantes'],
  },
  {
    categoria: 'Eficiencia',
    heuristica: 'Nielsen #7: Flexibilidad y eficiencia de uso',
    keywords: ['copiar', 'pegar', 'manual', 'pasos', 'repet', 'tard', 'demor', 'muchos clics', 'varias veces', 'fricción', 'friccion'],
    titulo: 'Flujo con pasos manuales innecesarios',
    recomendacion: 'Automatizar la transferencia de datos entre pantallas, reducir pasos y ofrecer atajos o valores por defecto.',
    fundamento: 'Nielsen #7, Ley de Hick y reducción de carga cognitiva.',
    historia: 'Como evaluador, quiero que los datos pasen automáticamente entre módulos, para no copiar y pegar información',
    criterio: 'Dado que selecciono una sesión, cuando abro el módulo destino, entonces sus datos aparecen precargados.',
    modulo: 'IA',
    tareas: ['Mapear pasos actuales del flujo', 'Implementar precarga de datos', 'Medir tiempo en tarea antes/después'],
  },
  {
    categoria: 'Consistencia',
    heuristica: 'Nielsen #4: Consistencia y estándares',
    keywords: ['inconsisten', 'diferente', 'distinto', 'cambia de', 'no coincide', 'otro estilo'],
    titulo: 'Inconsistencias entre pantallas',
    recomendacion: 'Unificar componentes y estilos mediante el sistema de diseño (tokens y Atomic Design).',
    fundamento: 'Nielsen #4 y Ley de Semejanza (Gestalt).',
    historia: 'Como usuario, quiero que los controles se vean y funcionen igual en todas las pantallas, para no reaprender',
    criterio: 'Dado cualquier pantalla, cuando uso botones y formularios, entonces mantienen el mismo estilo y comportamiento.',
    modulo: 'UI',
    tareas: ['Auditar componentes duplicados', 'Consolidar en átomos/moléculas', 'Revisión visual en sprint review'],
  },
];

const SCREEN_HINTS: [string[], string][] = [
  [['export', 'reporte', 'pdf'], 'Dashboard - Exportación de reportes'],
  [['dashboard', 'kpi', 'métrica', 'metrica', 'gráfic', 'grafic'], 'Dashboard UX'],
  [['formulario', 'registro', 'registrar', 'campo', 'satisfacción', 'escala'], 'Registro de prueba'],
  [['ia', 'asistente', 'observacion', 'análisis', 'analisis'], 'Asistente IA'],
  [['backlog', 'sprint', 'tablero', 'scrum'], 'Módulo SCRUM'],
  [['menú', 'menu', 'pestaña', 'naveg'], 'Navegación principal'],
  [['plan', 'tarea'], 'Plan de prueba'],
];

const lower = (s: string) => s.toLowerCase();

function detectScreen(text: string, fallback: string): string {
  const t = lower(text);
  const hit = SCREEN_HINTS.find(([keys]) => keys.some((k) => t.includes(k)));
  return hit ? hit[1] : fallback || 'General';
}

function sessionSeverity(s: AiSessionInput): Severity {
  if (s.taskResult === 'failure') return s.errorsCount >= 3 || s.satisfactionScore <= 1 ? 4 : 3;
  if (s.taskResult === 'assisted') return s.errorsCount >= 2 ? 3 : 2;
  if (s.errorsCount >= 2 || s.satisfactionScore <= 2) return 2;
  return 1;
}

const priorityFromSeverity = (sev: number): Priority => (sev >= 3 ? 'Alta' : sev === 2 ? 'Media' : 'Baja');
const pointsFromSeverity = (sev: number) => (sev >= 4 ? 5 : sev === 3 ? 3 : 2);

interface Evidence {
  rule: CategoryRule;
  texts: string[];
  sessions: AiSessionInput[];
  severity: Severity;
  screen: string;
}

export function generateHeuristicAnalysis(input: AiAnalysisInput): AiAnalysisResult {
  const units: { text: string; session?: AiSessionInput }[] = [];
  for (const s of input.sessions) {
    if (s.observations?.trim()) units.push({ text: s.observations.trim(), session: s });
  }
  if (input.freeText?.trim()) {
    input.freeText
      .split(/\n+|(?<=[.!?])\s+/)
      .map((t) => t.trim())
      .filter((t) => t.length > 8)
      .forEach((text) => units.push({ text }));
  }

  const evidence = new Map<string, Evidence>();
  for (const unit of units) {
    const t = lower(unit.text);
    const matched = RULES.filter((r) => r.keywords.some((k) => t.includes(k)));
    for (const rule of matched) {
      const sev = unit.session ? sessionSeverity(unit.session) : 2;
      const current = evidence.get(rule.categoria) || {
        rule,
        texts: [],
        sessions: [],
        severity: 1 as Severity,
        screen: detectScreen(`${unit.text} ${unit.session?.taskDescription || ''}`, unit.session?.taskDescription || input.context || ''),
      };
      current.texts.push(unit.text);
      if (unit.session) current.sessions.push(unit.session);
      current.severity = Math.max(current.severity, sev) as Severity;
      evidence.set(rule.categoria, current);
    }
  }

  // Sesiones fallidas sin observación que coincida: se registran como problema de eficacia
  const failedUnexplained = input.sessions.filter(
    (s) => s.taskResult !== 'success' && ![...evidence.values()].some((e) => e.sessions.includes(s)),
  );
  if (failedUnexplained.length) {
    const rule = RULES.find((r) => r.categoria === 'Navegación')!;
    const current = evidence.get(rule.categoria) || {
      rule,
      texts: [],
      sessions: [],
      severity: 1 as Severity,
      screen: failedUnexplained[0].taskDescription,
    };
    failedUnexplained.forEach((s) => {
      current.sessions.push(s);
      current.texts.push(`Tarea "${s.taskDescription}" no completada sin ayuda (${s.timeOnTask} s, ${s.errorsCount} errores).`);
      current.severity = Math.max(current.severity, sessionSeverity(s)) as Severity;
    });
    evidence.set(rule.categoria, current);
  }

  const total = Math.max(input.sessions.length, 1);
  const ordered = [...evidence.values()].sort((a, b) => b.severity - a.severity || b.texts.length - a.texts.length).slice(0, 6);

  const hallazgos: AiFinding[] = ordered.map((e) => ({
    titulo: e.rule.titulo,
    descripcion: `${e.rule.titulo} en "${e.screen}". ${e.sessions.length ? `Afectó a ${new Set(e.sessions.map((s) => s.evaluatorName)).size} participante(s).` : 'Detectado en los comentarios.'}`,
    categoria: e.rule.categoria,
    heuristica: e.rule.heuristica,
    severidad: e.severity,
    pantalla: e.screen,
    evidencia: `"${e.texts[0].slice(0, 220)}${e.texts[0].length > 220 ? '…' : ''}"`,
    frecuencia: e.sessions.length ? `${new Set(e.sessions).size}/${total} sesiones` : `${e.texts.length} comentario(s)`,
  }));

  const recomendaciones: AiRecommendation[] = ordered.map((e) => ({
    pantalla: e.screen,
    recomendacion: e.rule.recomendacion,
    fundamento: e.rule.fundamento,
    prioridad: priorityFromSeverity(e.severity),
  }));

  const historias_usuario: AiUserStory[] = ordered.slice(0, 5).map((e) => ({
    titulo: e.rule.historia,
    criterio_aceptacion: e.rule.criterio,
    prioridad: priorityFromSeverity(e.severity),
    modulo: e.rule.modulo,
    valor_negocio: Math.min(10, 4 + e.severity * 1 + Math.min(2, e.texts.length - 1)),
    story_points: pointsFromSeverity(e.severity),
    tareas: e.rule.tareas,
  }));

  const n = input.sessions.length;
  const failures = input.sessions.filter((s) => s.taskResult === 'failure').length;
  const assisted = input.sessions.filter((s) => s.taskResult === 'assisted').length;
  const avgSat = n ? (input.sessions.reduce((a, s) => a + Number(s.satisfactionScore), 0) / n).toFixed(1) : null;

  const resumenParts: string[] = [];
  if (n) {
    resumenParts.push(
      `Se analizaron ${n} sesión(es): ${n - failures - assisted} con éxito, ${assisted} con ayuda y ${failures} fallida(s); satisfacción promedio ${avgSat}/5.`,
    );
  } else {
    resumenParts.push('Se analizaron comentarios en texto libre sin métricas asociadas.');
  }
  if (hallazgos.length) {
    resumenParts.push(
      `El problema principal es "${hallazgos[0].titulo.toLowerCase()}" (severidad ${hallazgos[0].severidad}) en ${hallazgos[0].pantalla}.`,
      `Se detectaron ${hallazgos.length} categoría(s) de problemas: ${hallazgos.map((h) => h.categoria).join(', ')}.`,
    );
  } else {
    resumenParts.push('No se identificaron problemas recurrentes en la evidencia recibida; se recomienda ampliar las observaciones cualitativas.');
  }
  resumenParts.push('Análisis generado por el motor heurístico local (sin LLM); revísalo antes de exportarlo.');

  return {
    resumen: resumenParts.join(' '),
    hallazgos,
    recomendaciones,
    historias_usuario,
  };
}
