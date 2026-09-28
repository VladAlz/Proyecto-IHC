import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsabilityTest } from './entities/usability-test.entity';
import { CreateTestDto } from './dto/create-test.dto';
import { UpdateTestDto } from './dto/update-test.dto';
import { PaginationDto } from './dto/pagination.dto';
import { PaginatedResponse } from './interfaces/paginated-response.interface';

@Injectable()
export class TestsService {
  constructor(
    @InjectRepository(UsabilityTest)
    private readonly testRepository: Repository<UsabilityTest>,
  ) {}

  async findAll(paginationDto: PaginationDto): Promise<PaginatedResponse<UsabilityTest>> {
    const { page, limit } = paginationDto;
    const skip = (page - 1) * limit;

    const [data, total] = await this.testRepository.findAndCount({
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

  async create(createTestDto: CreateTestDto): Promise<UsabilityTest> {
    const test = this.testRepository.create(createTestDto);
    return this.testRepository.save(test);
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
