import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsabilityTest } from '../tests/entities/usability-test.entity';
import { UsabilityFinding } from './entities/usability-finding.entity';

export interface DashboardSummaryResponse {
  totalTests: number;
  successRate: number;
  avgTime: number;
  avgSatisfaction: number;
  trends?: {
    totalTestsDiff: number;
    successRateDiff: number;
    avgTimeDiff: number;
    avgSatisfactionDiff: number;
  };
}

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(UsabilityTest)
    private readonly testRepository: Repository<UsabilityTest>,
    @InjectRepository(UsabilityFinding)
    private readonly findingRepository: Repository<UsabilityFinding>,
  ) {}

  async getSummary(): Promise<DashboardSummaryResponse> {
    const tests = await this.testRepository.find({
      order: { createdAt: 'ASC' },
    });

    if (tests.length === 0) {
      return {
        totalTests: 0,
        successRate: 0,
        avgTime: 0,
        avgSatisfaction: 0,
        trends: {
          totalTestsDiff: 0,
          successRateDiff: 0,
          avgTimeDiff: 0,
          avgSatisfactionDiff: 0,
        },
      };
    }

    const totalTests = tests.length;
    const successCount = tests.filter((t) => t.taskResult === 'success').length;
    const successRate = Math.round((successCount / totalTests) * 1000) / 10;

    const totalTime = tests.reduce((sum, t) => sum + Number(t.timeOnTask || 0), 0);
    const avgTime = Math.round((totalTime / totalTests) * 10) / 10;

    const totalSatisfaction = tests.reduce(
      (sum, t) => sum + Number(t.satisfactionScore || 0),
      0,
    );
    const avgSatisfaction = Math.round((totalSatisfaction / totalTests) * 10) / 10;

    const trends = this.calculateTrends(tests);

    return {
      totalTests,
      successRate,
      avgTime,
      avgSatisfaction,
      trends,
    };
  }

  private calculateTrends(
    tests: import('../tests/entities/usability-test.entity').UsabilityTest[],
  ): DashboardSummaryResponse['trends'] {
    if (tests.length < 2) {
      return {
        totalTestsDiff: 0,
        successRateDiff: 0,
        avgTimeDiff: 0,
        avgSatisfactionDiff: 0,
      };
    }

    const midPoint = Math.floor(tests.length / 2);
    const olderHalf = tests.slice(0, midPoint);
    const recentHalf = tests.slice(midPoint);

    const calcSuccessRate = (group: typeof tests) => {
      if (group.length === 0) return 0;
      const successCount = group.filter((t) => t.taskResult === 'success').length;
      return (successCount / group.length) * 100;
    };

    const calcAvgTime = (group: typeof tests) => {
      if (group.length === 0) return 0;
      const total = group.reduce((sum, t) => sum + Number(t.timeOnTask || 0), 0);
      return total / group.length;
    };

    const calcAvgSatisfaction = (group: typeof tests) => {
      if (group.length === 0) return 0;
      const total = group.reduce((sum, t) => sum + Number(t.satisfactionScore || 0), 0);
      return total / group.length;
    };

    const olderSuccessRate = calcSuccessRate(olderHalf);
    const recentSuccessRate = calcSuccessRate(recentHalf);
    const olderAvgTime = calcAvgTime(olderHalf);
    const recentAvgTime = calcAvgTime(recentHalf);
    const olderAvgSatisfaction = calcAvgSatisfaction(olderHalf);
    const recentAvgSatisfaction = calcAvgSatisfaction(recentHalf);

    return {
      totalTestsDiff: recentHalf.length - olderHalf.length,
      successRateDiff: Math.round((recentSuccessRate - olderSuccessRate) * 10) / 10,
      avgTimeDiff: Math.round((recentAvgTime - olderAvgTime) * 10) / 10,
      avgSatisfactionDiff: Math.round((recentAvgSatisfaction - olderAvgSatisfaction) * 10) / 10,
    };
  }

  async getFindings(): Promise<UsabilityFinding[]> {
    return this.findingRepository.find({
      order: { severity: 'DESC' },
    });
  }
}
