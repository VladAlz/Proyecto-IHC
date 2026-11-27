import { join } from 'path';
import { mkdirSync } from 'fs';
import { DataSourceOptions } from 'typeorm';
import { UsabilityTest } from '../tests/entities/usability-test.entity';
import { UsabilityFinding } from '../findings/entities/usability-finding.entity';
import { TestPlan } from '../plans/entities/test-plan.entity';
import { UserStory } from '../scrum/entities/user-story.entity';
import { Sprint } from '../scrum/entities/sprint.entity';
import { SprintTask } from '../scrum/entities/sprint-task.entity';
import { DailyLog } from '../scrum/entities/daily-log.entity';
import { TeamMember } from '../scrum/entities/team-member.entity';
import { AiAnalysis } from '../ai/entities/ai-analysis.entity';
import { MatrixEvaluation } from '../comparison/entities/matrix-evaluation.entity';

export const ENTITIES = [
  UsabilityTest,
  UsabilityFinding,
  TestPlan,
  UserStory,
  Sprint,
  SprintTask,
  DailyLog,
  TeamMember,
  AiAnalysis,
  MatrixEvaluation,
];

/**
 * Configuración de base de datos:
 * - DB_TYPE=sqljs (por defecto): SQLite embebido en un archivo local, sin Docker ni instalación.
 * - DB_TYPE=postgres: PostgreSQL (docker-compose.yml de la raíz), igual que en el Sprint 1.
 */
export function buildDataSourceOptions(env: NodeJS.ProcessEnv = process.env): DataSourceOptions {
  const type = (env.DB_TYPE || 'sqljs').toLowerCase();

  if (type === 'postgres') {
    return {
      type: 'postgres',
      host: env.DB_HOST || 'localhost',
      port: parseInt(env.DB_PORT || '5433', 10),
      username: env.DB_USERNAME || 'postgres',
      password: env.DB_PASSWORD || 'postgrespassword',
      database: env.DB_DATABASE || 'usability_db',
      entities: ENTITIES,
      synchronize: true,
    };
  }

  const location = env.DB_FILE || join(process.cwd(), 'data', 'usability.sqlite');
  mkdirSync(join(location, '..'), { recursive: true });

  return {
    type: 'sqljs',
    location,
    autoSave: true,
    entities: ENTITIES,
    synchronize: true,
  };
}

export function describeDatabase(env: NodeJS.ProcessEnv = process.env): string {
  const options = buildDataSourceOptions(env);
  if (options.type === 'postgres') {
    return `PostgreSQL ${options.host}:${options.port}/${options.database}`;
  }
  return `SQLite embebido (${(options as { location: string }).location})`;
}
