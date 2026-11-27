import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScrumController } from './scrum.controller';
import { ScrumService } from './scrum.service';
import { TeamMember } from './entities/team-member.entity';
import { UserStory } from './entities/user-story.entity';
import { Sprint } from './entities/sprint.entity';
import { SprintTask } from './entities/sprint-task.entity';
import { DailyLog } from './entities/daily-log.entity';
import { UsabilityFinding } from '../findings/entities/usability-finding.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TeamMember, UserStory, Sprint, SprintTask, DailyLog, UsabilityFinding])],
  controllers: [ScrumController],
  providers: [ScrumService],
  exports: [ScrumService],
})
export class ScrumModule {}
