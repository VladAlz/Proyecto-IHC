import { Test, TestingModule } from '@nestjs/testing';
import { TestsController } from './tests.controller';
import { TestsService } from './tests.service';
import { CreateTestDto } from './dto/create-test.dto';
import { PaginationDto } from './dto/pagination.dto';

describe('TestsController', () => {
  let controller: TestsController;
  let mockTestsService: {
    findAll: jest.Mock;
    findOne: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    remove: jest.Mock;
  };

  beforeEach(async () => {
    mockTestsService = {
      findAll: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TestsController],
      providers: [
        {
          provide: TestsService,
          useValue: mockTestsService,
        },
      ],
    }).compile();

    controller = module.get<TestsController>(TestsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should call testsService.findAll with pagination', async () => {
      const paginationDto: PaginationDto = { page: 1, limit: 10 };
      const mockResponse = { data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } };

      mockTestsService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll(paginationDto);

      expect(mockTestsService.findAll).toHaveBeenCalledWith(paginationDto);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('findOne', () => {
    it('should call testsService.findOne with id', async () => {
      const mockTest = { id: 'test-1', evaluatorName: 'Test' };
      mockTestsService.findOne.mockResolvedValue(mockTest);

      const result = await controller.findOne('test-1');

      expect(mockTestsService.findOne).toHaveBeenCalledWith('test-1');
      expect(result).toEqual(mockTest);
    });
  });

  describe('create', () => {
    it('should call testsService.create with dto', async () => {
      const createDto: CreateTestDto = {
        evaluatorName: 'Test User',
        taskDescription: 'Test task',
        timeOnTask: 30,
        errorsCount: 0,
        satisfactionScore: 4,
        taskResult: 'success',
      };

      const mockCreated = { id: 'test-1', ...createDto, createdAt: new Date() };
      mockTestsService.create.mockResolvedValue(mockCreated);

      const result = await controller.create(createDto);

      expect(mockTestsService.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(mockCreated);
    });
  });

  describe('update', () => {
    it('should call testsService.update with id and dto', async () => {
      const updateDto = { satisfactionScore: 3 };
      const mockUpdated = { id: 'test-1', ...updateDto };

      mockTestsService.update.mockResolvedValue(mockUpdated);

      const result = await controller.update('test-1', updateDto);

      expect(mockTestsService.update).toHaveBeenCalledWith('test-1', updateDto);
      expect(result).toEqual(mockUpdated);
    });
  });

  describe('remove', () => {
    it('should call testsService.remove with id', async () => {
      mockTestsService.remove.mockResolvedValue({ success: true, id: 'test-1' });

      const result = await controller.remove('test-1');

      expect(mockTestsService.remove).toHaveBeenCalledWith('test-1');
      expect(result).toEqual({ success: true, id: 'test-1' });
    });
  });
});
