import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ScrumService } from './scrum.service';
import {
  CreateDailyDto,
  CreateMemberDto,
  CreateSprintDto,
  CreateStoryDto,
  CreateTaskDto,
  UpdateMemberDto,
  UpdateSprintDto,
  UpdateStoryDto,
  UpdateTaskDto,
} from './dto/scrum.dto';

@ApiTags('SCRUM')
@Controller('scrum')
export class ScrumController {
  constructor(private readonly scrum: ScrumService) {}

  // Equipo
  @Get('members') listMembers() { return this.scrum.listMembers(); }
  @Post('members') @HttpCode(HttpStatus.CREATED) createMember(@Body() dto: CreateMemberDto) { return this.scrum.createMember(dto); }
  @Patch('members/:id') updateMember(@Param('id') id: string, @Body() dto: UpdateMemberDto) { return this.scrum.updateMember(id, dto); }
  @Delete('members/:id') removeMember(@Param('id') id: string) { return this.scrum.removeMember(id); }

  // Product Backlog
  @Get('stories')
  @ApiOperation({ summary: 'Product Backlog ordenado por Cociente de Decisión (BV/SP)' })
  listStories() { return this.scrum.listStories(); }

  @Get('stories/next-code') nextCode() { return this.scrum.nextStoryCode().then((code) => ({ code })); }
  @Post('stories') @HttpCode(HttpStatus.CREATED) createStory(@Body() dto: CreateStoryDto) { return this.scrum.createStory(dto); }
  @Patch('stories/:id') updateStory(@Param('id') id: string, @Body() dto: UpdateStoryDto) { return this.scrum.updateStory(id, dto); }
  @Delete('stories/:id') removeStory(@Param('id') id: string) { return this.scrum.removeStory(id); }

  // Sprints
  @Get('sprints') listSprints() { return this.scrum.listSprints(); }
  @Get('sprints/:id/summary')
  @ApiOperation({ summary: 'Resumen del sprint: horas estimadas vs reales, avance y carga por integrante' })
  sprintSummary(@Param('id') id: string) { return this.scrum.sprintSummary(id); }
  @Post('sprints') @HttpCode(HttpStatus.CREATED) createSprint(@Body() dto: CreateSprintDto) { return this.scrum.createSprint(dto); }
  @Patch('sprints/:id') updateSprint(@Param('id') id: string, @Body() dto: UpdateSprintDto) { return this.scrum.updateSprint(id, dto); }
  @Delete('sprints/:id') removeSprint(@Param('id') id: string) { return this.scrum.removeSprint(id); }

  // Tareas / Sprint Board
  @Get('tasks') @ApiQuery({ name: 'sprintId', required: false })
  listTasks(@Query('sprintId') sprintId?: string) { return this.scrum.listTasks(sprintId); }
  @Post('tasks') @HttpCode(HttpStatus.CREATED) createTask(@Body() dto: CreateTaskDto) { return this.scrum.createTask(dto); }
  @Patch('tasks/:id') updateTask(@Param('id') id: string, @Body() dto: UpdateTaskDto) { return this.scrum.updateTask(id, dto); }
  @Delete('tasks/:id') removeTask(@Param('id') id: string) { return this.scrum.removeTask(id); }

  // Daily Log
  @Get('daily') @ApiQuery({ name: 'sprintId', required: false })
  listDaily(@Query('sprintId') sprintId?: string) { return this.scrum.listDaily(sprintId); }
  @Post('daily') @HttpCode(HttpStatus.CREATED) createDaily(@Body() dto: CreateDailyDto) { return this.scrum.createDaily(dto); }
  @Delete('daily/:id') removeDaily(@Param('id') id: string) { return this.scrum.removeDaily(id); }
}
