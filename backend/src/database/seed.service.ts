import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { UsabilityTest } from '../tests/entities/usability-test.entity';
import { UsabilityFinding } from '../findings/entities/usability-finding.entity';
import { TestPlan } from '../plans/entities/test-plan.entity';
import { TeamMember } from '../scrum/entities/team-member.entity';
import { UserStory } from '../scrum/entities/user-story.entity';
import { Sprint } from '../scrum/entities/sprint.entity';
import { SprintTask } from '../scrum/entities/sprint-task.entity';
import { ENTITIES } from './db-config';
import {
  SEED_FINDINGS,
  SEED_MEMBERS,
  SEED_PLAN,
  SEED_SPRINTS,
  SEED_STORIES,
  SEED_TASKS,
  SEED_TESTS,
} from './seed-data';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly config: ConfigService,
  ) {}

  async onApplicationBootstrap() {
    if ((this.config.get<string>('SEED_ON_START') || 'true') === 'false') return;
    const tests = await this.dataSource.getRepository(UsabilityTest).count();
    const stories = await this.dataSource.getRepository(UserStory).count();
    if (tests === 0 && stories === 0) {
      await this.seed();
    }
  }

  /** Borra todos los datos y vuelve a sembrar (botón "Restaurar datos demo") */
  async reset() {
    for (const entity of ENTITIES) {
      await this.dataSource.getRepository(entity).clear();
    }
    await this.seed();
    return { success: true };
  }

  async seed() {
    const em = this.dataSource.manager;
    this.logger.log('🌱 Sembrando datos iniciales (Sprint 1 + demo)...');

    await em.save(
      UsabilityTest,
      SEED_TESTS.map((t) => em.create(UsabilityTest, { ...t, createdAt: new Date(t.createdAt) } as Partial<UsabilityTest>)),
    );
    await em.save(UsabilityFinding, SEED_FINDINGS.map((f) => em.create(UsabilityFinding, f as Partial<UsabilityFinding>)));
    await em.save(TestPlan, em.create(TestPlan, SEED_PLAN as Partial<TestPlan>));
    await em.save(TeamMember, SEED_MEMBERS.map((m) => em.create(TeamMember, m)));

    const sprints = await em.save(Sprint, SEED_SPRINTS.map((s) => em.create(Sprint, s as Partial<Sprint>)));
    const sprintId = (n: number | null) => (n ? sprints.find((s) => s.number === n)?.id ?? null : null);

    const stories = await em.save(
      UserStory,
      SEED_STORIES.map(({ sprint, ...s }) => em.create(UserStory, { ...s, sprintId: sprintId(sprint) } as Partial<UserStory>)),
    );
    const storyId = (code: string | null) => (code ? stories.find((s) => s.code === code)?.id ?? null : null);

    await em.save(
      SprintTask,
      SEED_TASKS.map(({ sprint, story, ...t }) =>
        em.create(SprintTask, { ...t, sprintId: sprintId(sprint), storyId: storyId(story) } as Partial<SprintTask>),
      ),
    );
    this.logger.log('✅ Datos sembrados.');
  }
}
