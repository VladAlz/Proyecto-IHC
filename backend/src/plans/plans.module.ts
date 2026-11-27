import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlansController } from './plans.controller';
import { PlansService } from './plans.service';
import { TestPlan } from './entities/test-plan.entity';
import { UsabilityTest } from '../tests/entities/usability-test.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TestPlan, UsabilityTest])],
  controllers: [PlansController],
  providers: [PlansService],
  exports: [PlansService],
})
export class PlansModule {}
