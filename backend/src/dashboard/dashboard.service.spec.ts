import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DashboardService } from './dashboard.service';
import { UsabilityTest } from '../tests/entities/usability-test.entity';
import { UsabilityFinding } from './entities/usability-finding.entity';

describe('DashboardService', () => {
  let service: DashboardService;
  let mockTestRepository: { find: jest.Mock };
  let mockFindingRepository: { find: jest.Mock };

  const mockTests: UsabilityTest[] = [
    {
      id: 'test-1',
      evaluatorName: 'User 1',
      taskDescription: 'Task 1',
      timeOnTask: 50,
      errorsCount: 1,
      satisfactionScore: 4,
      taskResult: 'success',
      createdAt: new Date('2026-09-01'),
    },
    {
      id: 'test-2',
      evaluatorName: 'User 2',
      taskDescription: 'Task 2',
      timeOnTask: 100,
      errorsCount: 3,
      satisfactionScore: 2,
      taskResult: 'failure',
      createdAt: new Date('2026-09-15'),
    },
    {
      id: 'test-3',
      evaluatorName: 'User 3',
      taskDescription: 'Task 3',
      timeOnTask: 60,
      errorsCount: 0,
      satisfactionScore: 5,
      taskResult: 'success',
      createdAt: new Date('2026-09-20'),
    },
  ];

  const mockFindings: UsabilityFinding[] = [
    {
      id: 'find-001',
      severity: 4,
      heuristicViolated: 'Nielsen #1',
      location: 'Dashboard',
      description: 'Test finding',
      recommendation: 'Fix it',
    },
  ];

  beforeEach(async () => {
    mockTestRepository = { find: jest.fn() };
    mockFindingRepository = { find: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        {
          provide: getRepositoryToken(UsabilityTest),
          useValue: mockTestRepository,
        },
        {
          provide: getRepositoryToken(UsabilityFinding),
          useValue: mockFindingRepository,
        },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getSummary', () => {
    it('should return zeroed summary when no tests exist', async () => {
      mockTestRepository.find.mockResolvedValue([]);

      const result = await service.getSummary();

      expect(result.totalTests).toBe(0);
      expect(result.successRate).toBe(0);
      expect(result.avgTime).toBe(0);
      expect(result.avgSatisfaction).toBe(0);
      expect(result.trends.totalTestsDiff).toBe(0);
    });

    it('should calculate correct metrics with tests', async () => {
      mockTestRepository.find.mockResolvedValue(mockTests);

      const result = await service.getSummary();

      expect(result.totalTests).toBe(3);
      expect(result.successRate).toBeCloseTo(66.7, 1);
      expect(result.avgTime).toBeCloseTo(70, 0);
      expect(result.avgSatisfaction).toBeCloseTo(3.7, 1);
    });

    it('should calculate trends dynamically', async () => {
      mockTestRepository.find.mockResolvedValue(mockTests);

      const result = await service.getSummary();

      expect(result.trends).toBeDefined();
      expect(typeof result.trends.totalTestsDiff).toBe('number');
      expect(typeof result.trends.successRateDiff).toBe('number');
      expect(typeof result.trends.avgTimeDiff).toBe('number');
      expect(typeof result.trends.avgSatisfactionDiff).toBe('number');
    });

    it('should return zero trends when less than 2 tests', async () => {
      mockTestRepository.find.mockResolvedValue([mockTests[0]]);

      const result = await service.getSummary();

      expect(result.trends.totalTestsDiff).toBe(0);
      expect(result.trends.successRateDiff).toBe(0);
    });
  });

  describe('getFindings', () => {
    it('should return findings ordered by severity DESC', async () => {
      mockFindingRepository.find.mockResolvedValue(mockFindings);

      const result = await service.getFindings();

      expect(result).toEqual(mockFindings);
      expect(mockFindingRepository.find).toHaveBeenCalledWith({
        order: { severity: 'DESC' },
      });
    });
  });
});
