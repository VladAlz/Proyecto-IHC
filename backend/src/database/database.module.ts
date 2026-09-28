import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsabilityTest } from '../tests/entities/usability-test.entity';
import { UsabilityFinding } from '../dashboard/entities/usability-finding.entity';
import { SeedService } from './seed.service';

@Module({
  imports: [TypeOrmModule.forFeature([UsabilityTest, UsabilityFinding])],
  providers: [SeedService],
  exports: [SeedService],
})
export class DatabaseModule {}
