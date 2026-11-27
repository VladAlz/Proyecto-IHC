import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TestPlan } from './entities/test-plan.entity';
import { CreatePlanDto, UpdatePlanDto } from './dto/plan.dto';
import { UsabilityTest } from '../tests/entities/usability-test.entity';

export interface PlanTaskStats {
  code: string;
  scenario: string;
  sessions: number;
  successRate: number;
  assistedRate: number;
  avgTime: number;
  avgErrors: number;
  avgSatisfaction: number;
}

@Injectable()
export class PlansService {
  constructor(
    @InjectRepository(TestPlan)
    private readonly repo: Repository<TestPlan>,
    @InjectRepository(UsabilityTest)
    private readonly testRepo: Repository<UsabilityTest>,
  ) {}

  findAll(): Promise<TestPlan[]> {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<TestPlan> {
    const plan = await this.repo.findOne({ where: { id } });
    if (!plan) throw new NotFoundException(`Plan "${id}" no encontrado`);
    return plan;
  }

  create(dto: CreatePlanDto): Promise<TestPlan> {
    return this.repo.save(this.repo.create(dto));
  }

  async update(id: string, dto: UpdatePlanDto): Promise<TestPlan> {
    const plan = await this.findOne(id);
    Object.assign(plan, dto);
    return this.repo.save(plan);
  }

  async remove(id: string): Promise<{ success: boolean; id: string }> {
    const plan = await this.findOne(id);
    await this.repo.remove(plan);
    return { success: true, id };
  }

  /** Resultados por tarea del plan (equivalente a resumir la hoja "Registro observación") */
  async getResults(id: string): Promise<{ plan: TestPlan; participants: number; tasks: PlanTaskStats[] }> {
    const plan = await this.findOne(id);
    const sessions = await this.testRepo.find({ where: { planId: id } });
    const participants = new Set(sessions.map((s) => s.evaluatorName)).size;

    const avg = (values: number[]) =>
      values.length ? Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10 : 0;

    const tasks = plan.tasks.map((task) => {
      const rows = sessions.filter((s) => s.taskCode === task.code);
      const pct = (n: number) => (rows.length ? Math.round((n / rows.length) * 1000) / 10 : 0);
      return {
        code: task.code,
        scenario: task.scenario,
        sessions: rows.length,
        successRate: pct(rows.filter((r) => r.taskResult === 'success').length),
        assistedRate: pct(rows.filter((r) => r.taskResult === 'assisted').length),
        avgTime: avg(rows.map((r) => Number(r.timeOnTask))),
        avgErrors: avg(rows.map((r) => Number(r.errorsCount))),
        avgSatisfaction: avg(rows.map((r) => Number(r.satisfactionScore))),
      };
    });

    return { plan, participants, tasks };
  }
}
