import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TestsModule } from './tests/tests.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { AiModule } from './ai/ai.module';
import { DatabaseModule } from './database/database.module';
import { HealthModule } from './health/health.module';
import { UsabilityTest } from './tests/entities/usability-test.entity';
import { UsabilityFinding } from './dashboard/entities/usability-finding.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get<string>('DB_USERNAME', 'postgres'),
        password: configService.get<string>('DB_PASSWORD', 'postgrespassword'),
        database: configService.get<string>('DB_DATABASE', 'usability_db'),
        entities: [UsabilityTest, UsabilityFinding],
        synchronize: true,
      }),
    }),
    TestsModule,
    DashboardModule,
    AiModule,
    DatabaseModule,
    HealthModule,
  ],
})
export class AppModule {}
