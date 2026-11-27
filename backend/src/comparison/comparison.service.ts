import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IsIn, IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MatrixEvaluation } from './entities/matrix-evaluation.entity';
import { UsabilityTest } from '../tests/entities/usability-test.entity';
import { computeMetrics, UsabilityMetrics } from '../common/metrics';

export const MATRIX_CRITERIA = [
  'clarity',
  'learnability',
  'efficiency',
  'effectiveness',
  'errorPrevention',
  'satisfaction',
] as const;
export type MatrixCriterion = (typeof MATRIX_CRITERIA)[number];

export class CreateMatrixDto {
  @ApiProperty({ enum: ['v1', 'v2'] }) @IsIn(['v1', 'v2'], { message: 'Selecciona la versión evaluada' })
  appVersion: 'v1' | 'v2';

  @ApiProperty() @IsString() @IsNotEmpty({ message: 'Indica quién evalúa' })
  evaluator: string;

  @ApiProperty() @IsInt() @Min(1) @Max(5) clarity: number;
  @ApiProperty() @IsInt() @Min(1) @Max(5) learnability: number;
  @ApiProperty() @IsInt() @Min(1) @Max(5) efficiency: number;
  @ApiProperty() @IsInt() @Min(1) @Max(5) effectiveness: number;
  @ApiProperty() @IsInt() @Min(1) @Max(5) errorPrevention: number;
  @ApiProperty() @IsInt() @Min(1) @Max(5) satisfaction: number;

  @ApiPropertyOptional() @IsOptional() @IsString()
  notes?: string;
}

type CriteriaAverages = Record<MatrixCriterion, number> & { overall: number; evaluations: number };

export interface ComparisonResponse {
  v1: UsabilityMetrics;
  v2: UsabilityMetrics;
  deltas: {
    successRate: number;
    avgTime: number;
    avgErrors: number;
    avgSatisfaction: number;
    timeImprovementPct: number;
  };
  matrix: { v1: CriteriaAverages; v2: CriteriaAverages };
  tasks: { task: string; v1: UsabilityMetrics; v2: UsabilityMetrics }[];
}

const round1 = (n: number) => Math.round(n * 10) / 10;

@Injectable()
export class ComparisonService {
  constructor(
    @InjectRepository(MatrixEvaluation) private readonly matrixRepo: Repository<MatrixEvaluation>,
    @InjectRepository(UsabilityTest) private readonly testRepo: Repository<UsabilityTest>,
  ) {}

  async getComparison(): Promise<ComparisonResponse> {
    const tests = await this.testRepo.find();
    const v1Tests = tests.filter((t) => t.appVersion === 'v1');
    const v2Tests = tests.filter((t) => t.appVersion === 'v2');
    const v1 = computeMetrics(v1Tests);
    const v2 = computeMetrics(v2Tests);

    const evaluations = await this.matrixRepo.find();
    const averages = (rows: MatrixEvaluation[]): CriteriaAverages => {
      const result = { evaluations: rows.length, overall: 0 } as CriteriaAverages;
      for (const c of MATRIX_CRITERIA) {
        result[c] = rows.length ? round1(rows.reduce((a, r) => a + r[c], 0) / rows.length) : 0;
      }
      result.overall = rows.length ? round1(MATRIX_CRITERIA.reduce((a, c) => a + result[c], 0) / MATRIX_CRITERIA.length) : 0;
      return result;
    };

    const taskKeys = new Set(v1Tests.map((t) => t.taskDescription.trim()));
    const tasks = [...taskKeys]
      .filter((task) => v2Tests.some((t) => t.taskDescription.trim() === task))
      .map((task) => ({
        task,
        v1: computeMetrics(v1Tests.filter((t) => t.taskDescription.trim() === task)),
        v2: computeMetrics(v2Tests.filter((t) => t.taskDescription.trim() === task)),
      }));

    return {
      v1,
      v2,
      deltas: {
        successRate: round1(v2.successRate - v1.successRate),
        avgTime: round1(v2.avgTime - v1.avgTime),
        avgErrors: round1(v2.avgErrors - v1.avgErrors),
        avgSatisfaction: round1(v2.avgSatisfaction - v1.avgSatisfaction),
        timeImprovementPct: v1.avgTime ? round1(((v1.avgTime - v2.avgTime) / v1.avgTime) * 100) : 0,
      },
      matrix: {
        v1: averages(evaluations.filter((e) => e.appVersion === 'v1')),
        v2: averages(evaluations.filter((e) => e.appVersion === 'v2')),
      },
      tasks,
    };
  }

  listEvaluations() {
    return this.matrixRepo.find({ order: { createdAt: 'DESC' } });
  }

  createEvaluation(dto: CreateMatrixDto) {
    return this.matrixRepo.save(this.matrixRepo.create(dto));
  }

  async removeEvaluation(id: string) {
    const row = await this.matrixRepo.findOne({ where: { id } });
    if (!row) throw new NotFoundException(`Evaluación "${id}" no encontrada`);
    await this.matrixRepo.remove(row);
    return { success: true, id };
  }
}
