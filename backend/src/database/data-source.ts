import { DataSource } from 'typeorm';
import { UsabilityTest } from '../tests/entities/usability-test.entity';
import { UsabilityFinding } from '../dashboard/entities/usability-finding.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgrespassword',
  database: process.env.DB_DATABASE || 'usability_db',
  entities: [UsabilityTest, UsabilityFinding],
  migrations: [__dirname + '/migrations/*.ts'],
  synchronize: false,
});
