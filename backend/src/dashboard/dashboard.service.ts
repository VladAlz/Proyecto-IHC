import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { UsabilityTest } from '../tests/entities/usability-test.entity';
import { UsabilityFinding } from '../findings/entities/usability-finding.entity';
import { computeMetrics, UsabilityMetrics } from '../common/metrics';

export interface DashboardSummaryResponse extends UsabilityMetrics {
  trends: {
    totalTestsDiff: number;
    successRateDiff: number;
    avgTimeDiff: number;
    avgSatisfactionDiff: number;
  };
  findingsBySeverity: Record<string, number>;
  findingsByCategory: { category: string; count: number }[];
  findingsByStatus: Record<string, number>;
  tasks: {
    task: string;
    sessions: number;
    successRate: number;
    avgTime: number;
    avgErrors: number;
    avgSatisfaction: number;
  }[];
}

export interface DashboardFilters {
  appVersion?: 'v1' | 'v2';
  from?: string;
  to?: string;
}

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(UsabilityTest)
    private readonly testRepository: Repository<UsabilityTest>,
    @InjectRepository(UsabilityFinding)
    private readonly findingRepository: Repository<UsabilityFinding>,
  ) {}

  async getSummary(filters: DashboardFilters = {}): Promise<DashboardSummaryResponse> {
    const where: FindOptionsWhere<UsabilityTest> = {};
    if (filters.appVersion) where.appVersion = filters.appVersion;

    let tests = await this.testRepository.find({ where, order: { createdAt: 'ASC' } });
    if (filters.from) tests = tests.filter((t) => new Date(t.createdAt) >= new Date(`${filters.from}T00:00:00`));
    if (filters.to) tests = tests.filter((t) => new Date(t.createdAt) <= new Date(`${filters.to}T23:59:59`));

    const findings = await this.findingRepository.find();

    const findingsBySeverity: Record<string, number> = { '1': 0, '2': 0, '3': 0, '4': 0 };
    const findingsByStatus: Record<string, number> = { pendiente: 0, en_backlog: 0, resuelto: 0 };
    const categoryMap = new Map<string, number>();
    for (const f of findings) {
      findingsBySeverity[String(f.severity)] = (findingsBySeverity[String(f.severity)] || 0) + 1;
      findingsByStatus[f.status] = (findingsByStatus[f.status] || 0) + 1;
      categoryMap.set(f.category || 'General', (categoryMap.get(f.category || 'General') || 0) + 1);
    }

    const taskMap = new Map<string, UsabilityTest[]>();
    for (const t of tests) {
      const key = t.taskDescription.trim();
      taskMap.set(key, [...(taskMap.get(key) || []), t]);
    }
    const tasks = [...taskMap.entries()]
      .map(([task, rows]) => {
        const m = computeMetrics(rows);
        return {
          task,
          sessions: rows.length,
          successRate: m.successRate,
          avgTime: m.avgTime,
          avgErrors: m.avgErrors,
          avgSatisfaction: m.avgSatisfaction,
        };
      })
      .sort((a, b) => a.successRate - b.successRate || b.avgErrors - a.avgErrors);

    return {
      ...computeMetrics(tests),
      trends: this.calculateTrends(tests),
      findingsBySeverity,
      findingsByStatus,
      findingsByCategory: [...categoryMap.entries()]
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count),
      tasks,
    };
  }

  /** Tendencia: mitad más reciente de las sesiones vs mitad anterior (orden cronológico) */
  private calculateTrends(tests: UsabilityTest[]): DashboardSummaryResponse['trends'] {
    if (tests.length < 2) {
      return { totalTestsDiff: 0, successRateDiff: 0, avgTimeDiff: 0, avgSatisfactionDiff: 0 };
    }
    const mid = Math.floor(tests.length / 2);
    const older = computeMetrics(tests.slice(0, mid));
    const recent = computeMetrics(tests.slice(mid));
    const r = (n: number) => Math.round(n * 10) / 10;
    return {
      totalTestsDiff: recent.totalTests - older.totalTests,
      successRateDiff: r(recent.successRate - older.successRate),
      avgTimeDiff: r(recent.avgTime - older.avgTime),
      avgSatisfactionDiff: r(recent.avgSatisfaction - older.avgSatisfaction),
    };
  }
}
