import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsabilityTest } from '../tests/entities/usability-test.entity';
import { UsabilityFinding } from '../dashboard/entities/usability-finding.entity';
import * as seedData from './seed-data.json';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(UsabilityTest)
    private readonly testRepository: Repository<UsabilityTest>,
    @InjectRepository(UsabilityFinding)
    private readonly findingRepository: Repository<UsabilityFinding>,
  ) {}

  async onApplicationBootstrap() {
    await this.seedTests();
    await this.seedFindings();
  }

  private async seedTests() {
    const count = await this.testRepository.count();
    if (count === 0 && seedData.tests && seedData.tests.length > 0) {
      this.logger.log(`🌱 Sembrando ${seedData.tests.length} pruebas iniciales de usabilidad...`);
      for (const t of seedData.tests) {
        const test = this.testRepository.create({
          id: t.id,
          evaluatorName: t.evaluatorName,
          taskDescription: t.taskDescription,
          timeOnTask: t.timeOnTask,
          errorsCount: t.errorsCount,
          satisfactionScore: t.satisfactionScore,
          taskResult: t.taskResult as 'success' | 'failure',
          observations: t.observations,
          createdAt: new Date(t.createdAt),
        });
        await this.testRepository.save(test);
      }
      this.logger.log('✅ Pruebas de usabilidad sembradas con éxito en PostgreSQL.');
    }
  }

  private async seedFindings() {
    const count = await this.findingRepository.count();
    if (count === 0 && seedData.findings && seedData.findings.length > 0) {
      this.logger.log(`🌱 Sembrando ${seedData.findings.length} hallazgos heurísticos...`);
      for (const f of seedData.findings) {
        const finding = this.findingRepository.create({
          id: f.id,
          severity: f.severity as 1 | 2 | 3 | 4,
          heuristicViolated: f.heuristicViolated,
          location: f.location,
          description: f.description,
          recommendation: f.recommendation,
          theoreticalBasis: f.theoreticalBasis,
        });
        await this.findingRepository.save(finding);
      }
      this.logger.log('✅ Hallazgos heurísticos sembrados con éxito en PostgreSQL.');
    }
  }
}
