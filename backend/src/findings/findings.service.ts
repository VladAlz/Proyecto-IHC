import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsabilityFinding } from './entities/usability-finding.entity';
import { CreateFindingDto, UpdateFindingDto } from './dto/finding.dto';

@Injectable()
export class FindingsService {
  constructor(
    @InjectRepository(UsabilityFinding)
    private readonly repo: Repository<UsabilityFinding>,
  ) {}

  findAll(): Promise<UsabilityFinding[]> {
    return this.repo.find({ order: { severity: 'DESC', createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<UsabilityFinding> {
    const finding = await this.repo.findOne({ where: { id } });
    if (!finding) throw new NotFoundException(`Hallazgo "${id}" no encontrado`);
    return finding;
  }

  create(dto: CreateFindingDto): Promise<UsabilityFinding> {
    return this.repo.save(this.repo.create({ category: 'General', ...dto }));
  }

  createMany(dtos: CreateFindingDto[]): Promise<UsabilityFinding[]> {
    return this.repo.save(dtos.map((dto) => this.repo.create({ category: 'General', ...dto })));
  }

  async update(id: string, dto: UpdateFindingDto): Promise<UsabilityFinding> {
    const finding = await this.findOne(id);
    Object.assign(finding, dto);
    return this.repo.save(finding);
  }

  async remove(id: string): Promise<{ success: boolean; id: string }> {
    const finding = await this.findOne(id);
    await this.repo.remove(finding);
    return { success: true, id };
  }
}
