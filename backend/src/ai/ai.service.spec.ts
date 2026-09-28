import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AiService } from './ai.service';
import { TestsService } from '../tests/tests.service';
import { AnalyzeRequestDto } from './dto/analyze-request.dto';

describe('AiService', () => {
  let service: AiService;
  let mockConfigService: { get: jest.Mock };
  let mockTestsService: { findOne: jest.Mock };

  beforeEach(async () => {
    mockConfigService = {
      get: jest.fn().mockReturnValue(''),
    };

    mockTestsService = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: TestsService,
          useValue: mockTestsService,
        },
      ],
    }).compile();

    service = module.get<AiService>(AiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('analyze', () => {
    it('should return heuristic analysis when no Gemini API key', async () => {
      const dto: AnalyzeRequestDto = {
        observations: 'El usuario no encontró el botón de exportación',
      };

      const result = await service.analyze(dto);

      expect(result.hallazgos_clave).toBeDefined();
      expect(result.hallazgos_clave.length).toBeGreaterThan(0);
      expect(result.historias_usuario).toBeDefined();
      expect(result.historias_usuario.length).toBeGreaterThan(0);
      expect(result.recomendaciones_diseno).toBeDefined();
      expect(result.recomendaciones_diseno.length).toBeGreaterThan(0);
    });

    it('should use default observations when none provided', async () => {
      const dto: AnalyzeRequestDto = {};

      const result = await service.analyze(dto);

      expect(result.hallazgos_clave).toBeDefined();
      expect(result.historias_usuario).toBeDefined();
    });

    it('should load test data when testId is provided', async () => {
      const mockTest = {
        id: 'test-1',
        taskDescription: 'Test task',
        observations: 'Test observations from DB',
      };

      mockTestsService.findOne.mockResolvedValue(mockTest);

      const dto: AnalyzeRequestDto = { testId: 'test-1' };

      const result = await service.analyze(dto);

      expect(mockTestsService.findOne).toHaveBeenCalledWith('test-1');
      expect(result.hallazgos_clave).toBeDefined();
    });

    it('should handle testId not found gracefully', async () => {
      mockTestsService.findOne.mockResolvedValue(null);

      const dto: AnalyzeRequestDto = { testId: 'non-existent' };

      const result = await service.analyze(dto);

      expect(result.hallazgos_clave).toBeDefined();
      expect(result.historias_usuario).toBeDefined();
    });

    it('should return valid structure with prioridad values', async () => {
      const dto: AnalyzeRequestDto = {
        observations: 'Problemas con el formulario de registro',
      };

      const result = await service.analyze(dto);

      result.historias_usuario.forEach((historia) => {
        expect(['alta', 'media', 'baja']).toContain(historia.prioridad);
        expect(historia.titulo).toBeDefined();
        expect(historia.criterio_aceptacion).toBeDefined();
      });
    });
  });
});
