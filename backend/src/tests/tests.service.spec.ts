import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { TestsService } from './tests.service';
import { UsabilityTest } from './entities/usability-test.entity';
import { CreateTestDto } from './dto/create-test.dto';
import { UpdateTestDto } from './dto/update-test.dto';
import { PaginationDto } from './dto/pagination.dto';

describe('TestsService', () => {
  let service: TestsService;
  let mockRepository: {
    find: jest.Mock;
    findOne: jest.Mock;
    findAndCount: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    remove: jest.Mock;
  };

  const mockTest: UsabilityTest = {
    id: 'a001-4b11-9a1c-000000000001',
    evaluatorName: 'Ana Morales (UX Lead)',
    taskDescription: 'Completar registro de nueva prueba de usabilidad y guardar',
    timeOnTask: 48.5,
    errorsCount: 0,
    satisfactionScore: 5,
    taskResult: 'success',
    observations: 'Flujo intuitivo con campos agrupados.',
    createdAt: new Date('2026-09-21T10:15:00.000Z'),
  };

  beforeEach(async () => {
    mockRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      findAndCount: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TestsService,
        {
          provide: getRepositoryToken(UsabilityTest),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<TestsService>(TestsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated tests', async () => {
      const paginationDto: PaginationDto = { page: 1, limit: 10 };
      mockRepository.findAndCount.mockResolvedValue([[mockTest], 1]);

      const result = await service.findAll(paginationDto);

      expect(result.data).toEqual([mockTest]);
      expect(result.meta.total).toBe(1);
      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(10);
      expect(result.meta.totalPages).toBe(1);
    });

    it('should calculate correct pagination for page 2', async () => {
      const paginationDto: PaginationDto = { page: 2, limit: 5 };
      mockRepository.findAndCount.mockResolvedValue([[mockTest], 12]);

      const result = await service.findAll(paginationDto);

      expect(result.meta.page).toBe(2);
      expect(result.meta.totalPages).toBe(3);
    });
  });

  describe('findOne', () => {
    it('should return a test by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockTest);

      const result = await service.findOne(mockTest.id);

      expect(result).toEqual(mockTest);
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: mockTest.id } });
    });

    it('should throw NotFoundException when test not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a new test', async () => {
      const createDto: CreateTestDto = {
        evaluatorName: 'Test User',
        taskDescription: 'Test task',
        timeOnTask: 30,
        errorsCount: 0,
        satisfactionScore: 4,
        taskResult: 'success',
      };

      mockRepository.create.mockReturnValue(mockTest);
      mockRepository.save.mockResolvedValue(mockTest);

      const result = await service.create(createDto);

      expect(result).toEqual(mockTest);
      expect(mockRepository.create).toHaveBeenCalledWith(createDto);
      expect(mockRepository.save).toHaveBeenCalledWith(mockTest);
    });
  });

  describe('update', () => {
    it('should update a test', async () => {
      const updateDto: UpdateTestDto = { satisfactionScore: 3 };
      const updatedTest = { ...mockTest, ...updateDto };

      mockRepository.findOne.mockResolvedValue(mockTest);
      mockRepository.save.mockResolvedValue(updatedTest);

      const result = await service.update(mockTest.id, updateDto);

      expect(result.satisfactionScore).toBe(3);
    });

    it('should throw NotFoundException when updating non-existent test', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.update('non-existent-id', {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a test', async () => {
      mockRepository.findOne.mockResolvedValue(mockTest);
      mockRepository.remove.mockResolvedValue(undefined);

      const result = await service.remove(mockTest.id);

      expect(result).toEqual({ success: true, id: mockTest.id });
    });

    it('should throw NotFoundException when removing non-existent test', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });
});
