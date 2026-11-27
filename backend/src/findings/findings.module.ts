import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FindingsController } from './findings.controller';
import { FindingsService } from './findings.service';
import { UsabilityFinding } from './entities/usability-finding.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UsabilityFinding])],
  controllers: [FindingsController],
  providers: [FindingsService],
  exports: [FindingsService],
})
export class FindingsModule {}
