import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComparisonController } from './comparison.controller';
import { ComparisonService } from './comparison.service';
import { MatrixEvaluation } from './entities/matrix-evaluation.entity';
import { UsabilityTest } from '../tests/entities/usability-test.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MatrixEvaluation, UsabilityTest])],
  controllers: [ComparisonController],
  providers: [ComparisonService],
})
export class ComparisonModule {}
