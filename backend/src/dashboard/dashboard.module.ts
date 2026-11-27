import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { UsabilityFinding } from '../findings/entities/usability-finding.entity';
import { UsabilityTest } from '../tests/entities/usability-test.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UsabilityFinding, UsabilityTest])],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
