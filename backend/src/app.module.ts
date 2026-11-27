import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TestsModule } from './tests/tests.module';
import { FindingsModule } from './findings/findings.module';
import { PlansModule } from './plans/plans.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { ComparisonModule } from './comparison/comparison.module';
import { ScrumModule } from './scrum/scrum.module';
import { AiModule } from './ai/ai.module';
import { DatabaseModule } from './database/database.module';
import { HealthModule } from './health/health.module';
import { buildDataSourceOptions } from './database/db-config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    TypeOrmModule.forRootAsync({ useFactory: () => buildDataSourceOptions(process.env) }),
    TestsModule,
    FindingsModule,
    PlansModule,
    DashboardModule,
    ComparisonModule,
    ScrumModule,
    AiModule,
    DatabaseModule,
    HealthModule,
  ],
})
export class AppModule {}
