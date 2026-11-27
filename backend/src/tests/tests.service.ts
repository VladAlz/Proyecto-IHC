import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, In, Repository } from 'typeorm';
import { UsabilityTest } from './entities/usability-test.entity';
import { CreateTestDto } from './dto/create-test.dto';
import { UpdateTestDto } from './dto/update-test.dto';
import { TestQueryDto } from './dto/pagination.dto';
import { PaginatedResponse } from './interfaces/paginated-response.interface';

@Injectable()
export class TestsService {
  constructor(
    @InjectRepository(UsabilityTest)
    private readonly testRepository: Repository<UsabilityTest>,
  ) {}

  async findAll(query: TestQueryDto): Promise<PaginatedResponse<UsabilityTest>> {
    const { page, limit, appVersion, taskResult, planId } = query;
    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<UsabilityTest> = {};
    if (appVersion) where.appVersion = appVersion;
    if (taskResult) where.taskResult = taskResult;
    if (planId) where.planId = planId;

    const [data, total] = await this.testRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<UsabilityTest> {
    const test = await this.testRepository.findOne({ where: { id } });
    if (!test) {
      throw new NotFoundException(`Prueba con id "${id}" no encontrada`);
    }
    return test;
  }

  async findByIds(ids: string[]): Promise<UsabilityTest[]> {
    if (!ids.length) return [];
    return this.testRepository.find({ where: { id: In(ids) }, order: { createdAt: 'ASC' } });
  }

  async create(createTestDto: CreateTestDto): Promise<UsabilityTest> {
    const test = this.testRepository.create(createTestDto);
    return this.testRepository.save(test);
  }

  async createMany(dtos: CreateTestDto[]): Promise<UsabilityTest[]> {
    const tests = dtos.map((dto) => this.testRepository.create(dto));
    return this.testRepository.save(tests);
  }

  async update(id: string, updateTestDto: UpdateTestDto): Promise<UsabilityTest> {
    const test = await this.findOne(id);
    Object.assign(test, updateTestDto);
    return this.testRepository.save(test);
  }

  async remove(id: string): Promise<{ success: boolean; id: string }> {
    const test = await this.findOne(id);
    await this.testRepository.remove(test);
    return { success: true, id };
  }
}
