import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { AiAnalysis } from './entities/ai-analysis.entity';
import { UsabilityTest } from '../tests/entities/usability-test.entity';
import { FindingsModule } from '../findings/findings.module';
import { ScrumModule } from '../scrum/scrum.module';

@Module({
  imports: [TypeOrmModule.forFeature([AiAnalysis, UsabilityTest]), FindingsModule, ScrumModule],
  controllers: [AiController],
  providers: [AiService],
  exports: [AiService],
})
export class AiModule {}
