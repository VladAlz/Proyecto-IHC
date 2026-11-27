import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException } from '@nestjs/common';
import { AiService } from './ai.service';
import { UsabilityTest } from '../tests/entities/usability-test.entity';
import { AiAnalysis } from './entities/ai-analysis.entity';
import { FindingsService } from '../findings/findings.service';
import { ScrumService } from '../scrum/scrum.service';
import { AiAnalysisInput } from './ai.types';

const VALID_LLM_JSON = {
  resumen: 'Dos de tres participantes fallaron al exportar.',
  hallazgos: [
    {
      titulo: 'Botón de exportar poco visible',
      descripcion: 'El botón está al final de la página.',
      categoria: 'Jerarquía visual',
      heuristica: 'Nielsen #8: Diseño estético y minimalista',
      severidad: 4,
      pantalla: 'Dashboard',
      evidencia: '"No encontró el botón"',
      frecuencia: '2/3',
    },
  ],
  recomendaciones: [{ pantalla: 'Dashboard', recomendacion: 'Mover a la cabecera', fundamento: 'Figura-Fondo', prioridad: 'Alta' }],
  historias_usuario: [
    {
      titulo: 'Como evaluador, quiero ver la exportación arriba, para encontrarla rápido',
      criterio_aceptacion: 'Dado..., cuando..., entonces...',
      prioridad: 'Alta',
      modulo: 'Dash.',
      valor_negocio: 8,
      story_points: 3,
      tareas: ['Rediseñar cabecera'],
    },
  ],
};

const SAMPLE_INPUT: AiAnalysisInput = {
  sessions: [
    {
      evaluatorName: 'P1',
      taskDescription: 'Localizar botón de exportación',
      taskResult: 'failure',
      timeOnTask: 92,
      errorsCount: 3,
      satisfactionScore: 2,
      observations: 'No encontró el botón de exportación porque estaba oculto al final de la página sin contraste.',
    },
    {
      evaluatorName: 'P2',
      taskDescription: 'Enviar observaciones a la IA',
      taskResult: 'assisted',
      timeOnTask: 110,
      errorsCount: 2,
      satisfactionScore: 2,
      observations: 'Tuvo que copiar y pegar manualmente el texto entre pestañas; fue lento.',
    },
  ],
};

function geminiResponse(payload: unknown, status = 200) {
  const body =
    status === 200 ? { candidates: [{ content: { parts: [{ text: JSON.stringify(payload) }] } }] } : payload;
  return Promise.resolve({ ok: status === 200, status, text: () => Promise.resolve(JSON.stringify(body)) });
}

function openAiResponse(content: string) {
  return Promise.resolve({
    ok: true,
    status: 200,
    text: () => Promise.resolve(JSON.stringify({ choices: [{ message: { content } }] })),
  });
}

describe('AiService', () => {
  let service: AiService;
  let env: Record<string, string | undefined>;
  let fetchMock: jest.Mock;
  const testsRepo = { find: jest.fn() };
  const analysesRepo = { create: jest.fn((x) => x), save: jest.fn((x) => Promise.resolve({ id: 'a1', ...x })) };
  const findingsService = { createMany: jest.fn((rows) => Promise.resolve(rows.map((r, i) => ({ id: `f${i}`, ...r })))) };
  const scrumService = { createStory: jest.fn((s) => Promise.resolve({ id: 's1', ...s })) };

  beforeEach(async () => {
    env = { AI_PROVIDER: 'gemini', AI_FALLBACK_PROVIDERS: 'groq' };
    fetchMock = jest.fn();
    (global as any).fetch = fetchMock;
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiService,
        { provide: ConfigService, useValue: { get: (k: string) => env[k] } },
        { provide: getRepositoryToken(UsabilityTest), useValue: testsRepo },
        { provide: getRepositoryToken(AiAnalysis), useValue: analysesRepo },
        { provide: FindingsService, useValue: findingsService },
        { provide: ScrumService, useValue: scrumService },
      ],
    }).compile();
    service = module.get(AiService);
  });

  describe('sin API keys (modo local)', () => {
    it('usa el motor heurístico y no llama a la red', async () => {
      const { result, meta } = await service.runAnalysis(SAMPLE_INPUT);
      expect(fetchMock).not.toHaveBeenCalled();
      expect(meta.provider).toBe('local');
      expect(meta.warnings.join(' ')).toContain('No hay API key');
      expect(result.hallazgos.length).toBeGreaterThan(0);
    });

    it('clasifica las observaciones en categorías UX esperadas', async () => {
      const { result } = await service.runAnalysis(SAMPLE_INPUT);
      const categorias = result.hallazgos.map((h) => h.categoria);
      expect(categorias).toContain('Jerarquía visual');
      expect(categorias).toContain('Eficiencia');
    });

    it('asigna severidad alta a tareas fallidas con muchos errores', async () => {
      const { result } = await service.runAnalysis(SAMPLE_INPUT);
      expect(result.hallazgos[0].severidad).toBe(4);
      expect(result.historias_usuario[0].prioridad).toBe('Alta');
    });

    it('getStatus reporta modo local', () => {
      expect(service.getStatus().mode).toBe('local');
    });
  });

  describe('con Gemini configurado', () => {
    beforeEach(() => {
      env.GEMINI_API_KEY = 'test-key';
    });

    it('parsea correctamente la respuesta JSON del modelo', async () => {
      fetchMock.mockReturnValueOnce(geminiResponse(VALID_LLM_JSON));
      const { result, meta } = await service.runAnalysis(SAMPLE_INPUT);
      expect(meta.provider).toBe('gemini');
      expect(meta.fallback).toBe(false);
      expect(result.hallazgos[0].titulo).toBe('Botón de exportar poco visible');
      expect(result.historias_usuario[0].story_points).toBe(3);
    });

    it('envía la API key en cabecera y el prompt con las sesiones', async () => {
      fetchMock.mockReturnValueOnce(geminiResponse(VALID_LLM_JSON));
      await service.runAnalysis(SAMPLE_INPUT);
      const [url, init] = fetchMock.mock.calls[0];
      expect(url).toContain('gemini-2.5-flash:generateContent');
      expect(init.headers['x-goog-api-key']).toBe('test-key');
      expect(init.body).toContain('Localizar botón de exportación');
      expect(init.body).toContain('responseMimeType');
    });

    it('rellena campos faltantes y normaliza valores fuera de rango', async () => {
      fetchMock.mockReturnValueOnce(
        geminiResponse({
          hallazgos: [{ titulo: 'Sin feedback', severidad: 9, categoria: 'feedback', heuristica: 'heurística 1' }],
          historias_usuario: [{ titulo: 'Como X quiero Y para Z', prioridad: 'ALTA', story_points: 4 }],
        }),
      );
      const { result } = await service.runAnalysis(SAMPLE_INPUT);
      expect(result.hallazgos[0].severidad).toBe(4);
      expect(result.hallazgos[0].categoria).toBe('Visibilidad y feedback');
      expect(result.hallazgos[0].heuristica).toBe('Nielsen #1: Visibilidad del estado del sistema');
      expect(result.hallazgos[0].pantalla).toBe('General');
      expect(result.historias_usuario[0].prioridad).toBe('Alta');
      expect([3, 5]).toContain(result.historias_usuario[0].story_points);
      expect(result.resumen.length).toBeGreaterThan(0);
    });

    it('acepta JSON envuelto en bloque ```json', async () => {
      fetchMock.mockReturnValueOnce(
        Promise.resolve({
          ok: true,
          status: 200,
          text: () =>
            Promise.resolve(
              JSON.stringify({ candidates: [{ content: { parts: [{ text: '```json\n' + JSON.stringify(VALID_LLM_JSON) + '\n```' }] } }] }),
            ),
        }),
      );
      const { meta } = await service.runAnalysis(SAMPLE_INPUT);
      expect(meta.provider).toBe('gemini');
    });

    it('tolera HTTP 500 usando el motor local', async () => {
      fetchMock.mockReturnValueOnce(geminiResponse({ error: { message: 'internal' } }, 500));
      const { meta } = await service.runAnalysis(SAMPLE_INPUT);
      expect(meta.provider).toBe('local');
      expect(meta.fallback).toBe(true);
      expect(meta.warnings[0]).toContain('HTTP 500');
    });

    it('informa el límite de cuota (HTTP 429)', async () => {
      fetchMock.mockReturnValueOnce(geminiResponse({ error: { message: 'quota' } }, 429));
      const { meta } = await service.runAnalysis(SAMPLE_INPUT);
      expect(meta.warnings[0]).toContain('límite de la capa gratuita');
    });

    it('tolera payload vacío', async () => {
      fetchMock.mockReturnValueOnce(Promise.resolve({ ok: true, status: 200, text: () => Promise.resolve('{"candidates":[]}') }));
      const { meta } = await service.runAnalysis(SAMPLE_INPUT);
      expect(meta.provider).toBe('local');
      expect(meta.warnings[0]).toContain('Respuesta vacía');
    });

    it('tolera JSON malformado', async () => {
      fetchMock.mockReturnValueOnce(
        Promise.resolve({
          ok: true,
          status: 200,
          text: () => Promise.resolve(JSON.stringify({ candidates: [{ content: { parts: [{ text: 'esto no es json' }] } }] })),
        }),
      );
      const { meta } = await service.runAnalysis(SAMPLE_INPUT);
      expect(meta.provider).toBe('local');
      expect(meta.warnings[0]).toContain('JSON');
    });

    it('tolera error de red', async () => {
      fetchMock.mockRejectedValueOnce(new Error('ECONNREFUSED'));
      const { meta } = await service.runAnalysis(SAMPLE_INPUT);
      expect(meta.provider).toBe('local');
      expect(meta.warnings[0]).toContain('Error de red');
    });

    it('cae a Groq cuando Gemini falla y Groq está configurado', async () => {
      env.GROQ_API_KEY = 'groq-key';
      fetchMock
        .mockReturnValueOnce(geminiResponse({ error: { message: 'quota' } }, 429))
        .mockReturnValueOnce(openAiResponse(JSON.stringify(VALID_LLM_JSON)));
      const { meta } = await service.runAnalysis(SAMPLE_INPUT);
      expect(meta.provider).toBe('groq');
      expect(meta.fallback).toBe(true);
      const [url, init] = fetchMock.mock.calls[1];
      expect(url).toBe('https://api.groq.com/openai/v1/chat/completions');
      expect(init.headers.Authorization).toBe('Bearer groq-key');
    });

    it('rechaza respuestas sin contenido útil', async () => {
      fetchMock.mockReturnValueOnce(geminiResponse({ resumen: 'nada', hallazgos: [], historias_usuario: [] }));
      const { meta } = await service.runAnalysis(SAMPLE_INPUT);
      expect(meta.provider).toBe('local');
    });
  });

  describe('AI_PROVIDER=local', () => {
    it('no consulta proveedores aunque haya key', async () => {
      env.AI_PROVIDER = 'local';
      env.GEMINI_API_KEY = 'x';
      const { meta } = await service.runAnalysis(SAMPLE_INPUT);
      expect(fetchMock).not.toHaveBeenCalled();
      expect(meta.provider).toBe('local');
    });
  });

  describe('analyze / apply', () => {
    it('exige evidencia para analizar', async () => {
      testsRepo.find.mockResolvedValue([]);
      await expect(service.analyze({})).rejects.toThrow(BadRequestException);
    });

    it('guarda el análisis en el historial con texto libre', async () => {
      const saved = await service.analyze({ observations: 'El usuario no encontró el menú de reportes y se perdió.' });
      expect(analysesRepo.save).toHaveBeenCalled();
      expect(saved.meta.provider).toBe('local');
      expect(saved.result.hallazgos.length).toBeGreaterThan(0);
    });

    it('apply crea hallazgos y enlaza historias a su hallazgo de origen', async () => {
      const res = await service.apply({
        findings: [
          {
            titulo: 'T',
            descripcion: 'D',
            categoria: 'Navegación',
            heuristica: 'Nielsen #6: Reconocimiento antes que recuerdo',
            severidad: 3,
            pantalla: 'Menú',
          },
        ],
        stories: [{ titulo: 'Como X...', criterio_aceptacion: 'C', prioridad: 'Alta', tareas: ['a'], findingIndex: 0 }],
      });
      expect(findingsService.createMany).toHaveBeenCalled();
      expect(scrumService.createStory).toHaveBeenCalledWith(
        expect.objectContaining({ findingId: 'f0', source: 'hallazgo', acceptanceCriteria: expect.stringContaining('- a') }),
      );
      expect(res.stories).toHaveLength(1);
    });
  });
});
