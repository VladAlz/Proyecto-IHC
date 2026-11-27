import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TeamMember } from './entities/team-member.entity';
import { UserStory } from './entities/user-story.entity';
import { Sprint } from './entities/sprint.entity';
import { SprintTask } from './entities/sprint-task.entity';
import { DailyLog } from './entities/daily-log.entity';
import { UsabilityFinding } from '../findings/entities/usability-finding.entity';
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

export interface SprintSummary {
  sprint: Sprint;
  stories: UserStory[];
  totals: {
    tasks: number;
    done: number;
    estimatedHours: number;
    realHours: number;
    unplannedHours: number;
    storyPoints: number;
    completedPoints: number;
    progress: number;
  };
  byStatus: Record<string, number>;
  byMember: { member: string; estimatedHours: number; realHours: number; tasks: number; done: number }[];
}

const round1 = (n: number) => Math.round(n * 10) / 10;

@Injectable()
export class ScrumService {
  constructor(
    @InjectRepository(TeamMember) private readonly members: Repository<TeamMember>,
    @InjectRepository(UserStory) private readonly stories: Repository<UserStory>,
    @InjectRepository(Sprint) private readonly sprints: Repository<Sprint>,
    @InjectRepository(SprintTask) private readonly tasks: Repository<SprintTask>,
    @InjectRepository(DailyLog) private readonly dailies: Repository<DailyLog>,
    @InjectRepository(UsabilityFinding) private readonly findings: Repository<UsabilityFinding>,
  ) {}

  // ---------------- Equipo ----------------
  listMembers() {
    return this.members.find({ order: { name: 'ASC' } });
  }
  createMember(dto: CreateMemberDto) {
    return this.members.save(this.members.create(dto));
  }
  async updateMember(id: string, dto: UpdateMemberDto) {
    const m = await this.getOr404(this.members, id, 'Integrante');
    return this.members.save(Object.assign(m, dto));
  }
  async removeMember(id: string) {
    const m = await this.getOr404(this.members, id, 'Integrante');
    await this.members.remove(m);
    return { success: true, id };
  }

  // ---------------- Product Backlog ----------------
  /** Backlog ordenado por Cociente de Decisión (Business Value / Story Points) descendente */
  async listStories(): Promise<(UserStory & { decisionRatio: number })[]> {
    const all = await this.stories.find();
    return all
      .map((s) => Object.assign(s, { decisionRatio: Math.round((s.businessValue / Math.max(1, s.storyPoints)) * 100) / 100 }))
      .sort((a, b) => b.decisionRatio - a.decisionRatio || a.code.localeCompare(b.code));
  }

  async createStory(dto: CreateStoryDto) {
    const code = dto.code?.trim() || (await this.nextStoryCode());
    const story = this.stories.create({ ...dto, code });
    if (story.sprintId) story.status = story.status === 'hecha' ? 'hecha' : 'sprint';
    const saved = await this.stories.save(story);
    if (saved.findingId) await this.setFindingStatus(saved.findingId, 'en_backlog');
    return saved;
  }

  async updateStory(id: string, dto: UpdateStoryDto) {
    const story = await this.getOr404(this.stories, id, 'Historia');
    Object.assign(story, dto);
    if (dto.sprintId !== undefined) {
      if (dto.sprintId && story.status === 'backlog') story.status = 'sprint';
      if (!dto.sprintId && story.status === 'sprint') story.status = 'backlog';
    }
    const saved = await this.stories.save(story);
    if (saved.findingId && saved.status === 'hecha') await this.setFindingStatus(saved.findingId, 'resuelto');
    return saved;
  }

  async removeStory(id: string) {
    const story = await this.getOr404(this.stories, id, 'Historia');
    await this.tasks.update({ storyId: id }, { storyId: null });
    await this.stories.remove(story);
    return { success: true, id };
  }

  async nextStoryCode(): Promise<string> {
    const all = await this.stories.find({ select: ['code'] });
    const max = all.reduce((acc, s) => {
      const n = parseInt((s.code.match(/(\d+)\s*$/) || [])[1] || '0', 10);
      return Math.max(acc, n);
    }, 0);
    return `HU-${String(max + 1).padStart(2, '0')}`;
  }

  // ---------------- Sprints ----------------
  listSprints() {
    return this.sprints.find({ order: { number: 'ASC' } });
  }

  async createSprint(dto: CreateSprintDto) {
    this.assertDates(dto.startDate, dto.endDate);
    if (dto.status === 'activo') await this.sprints.update({ status: 'activo' }, { status: 'planificado' });
    return this.sprints.save(this.sprints.create(dto));
  }

  async updateSprint(id: string, dto: UpdateSprintDto) {
    const sprint = await this.getOr404(this.sprints, id, 'Sprint');
    Object.assign(sprint, dto);
    this.assertDates(sprint.startDate, sprint.endDate);
    if (dto.status === 'activo') {
      const actives = await this.sprints.find({ where: { status: 'activo' } });
      for (const other of actives.filter((s) => s.id !== id)) {
        other.status = 'planificado';
        await this.sprints.save(other);
      }
    }
    return this.sprints.save(sprint);
  }

  async removeSprint(id: string) {
    const sprint = await this.getOr404(this.sprints, id, 'Sprint');
    await this.tasks.delete({ sprintId: id });
    await this.dailies.delete({ sprintId: id });
    await this.stories.update({ sprintId: id, status: 'sprint' }, { sprintId: null, status: 'backlog' });
    await this.sprints.remove(sprint);
    return { success: true, id };
  }

  async sprintSummary(id: string): Promise<SprintSummary> {
    const sprint = await this.getOr404(this.sprints, id, 'Sprint');
    const tasks = await this.tasks.find({ where: { sprintId: id } });
    const stories = await this.stories.find({ where: { sprintId: id } });

    const byStatus: Record<string, number> = { pendiente: 0, en_progreso: 0, en_revision: 0, terminado: 0 };
    const memberMap = new Map<string, SprintSummary['byMember'][number]>();
    for (const t of tasks) {
      byStatus[t.status] = (byStatus[t.status] || 0) + 1;
      const m = memberMap.get(t.assignee) || { member: t.assignee, estimatedHours: 0, realHours: 0, tasks: 0, done: 0 };
      m.estimatedHours = round1(m.estimatedHours + Number(t.estimatedHours));
      m.realHours = round1(m.realHours + Number(t.realHours));
      m.tasks += 1;
      if (t.status === 'terminado') m.done += 1;
      memberMap.set(t.assignee, m);
    }

    const done = byStatus.terminado || 0;
    const storyPoints = stories.reduce((a, s) => a + s.storyPoints, 0);
    const completedPoints = stories.filter((s) => s.status === 'hecha').reduce((a, s) => a + s.storyPoints, 0);

    return {
      sprint,
      stories,
      totals: {
        tasks: tasks.length,
        done,
        estimatedHours: round1(tasks.filter((t) => !t.unplanned).reduce((a, t) => a + Number(t.estimatedHours), 0)),
        realHours: round1(tasks.reduce((a, t) => a + Number(t.realHours), 0)),
        unplannedHours: round1(tasks.filter((t) => t.unplanned).reduce((a, t) => a + Number(t.realHours || t.estimatedHours), 0)),
        storyPoints,
        completedPoints,
        progress: tasks.length ? Math.round((done / tasks.length) * 100) : 0,
      },
      byStatus,
      byMember: [...memberMap.values()],
    };
  }

  // ---------------- Tareas (Sprint Board) ----------------
  listTasks(sprintId?: string) {
    return this.tasks.find({ where: sprintId ? { sprintId } : {}, order: { createdAt: 'ASC' } });
  }

  async createTask(dto: CreateTaskDto) {
    await this.getOr404(this.sprints, dto.sprintId, 'Sprint');
    const task = await this.tasks.save(this.tasks.create(dto));
    if (task.storyId) await this.syncStoryFromTasks(task.storyId, dto.sprintId);
    return task;
  }

  async updateTask(id: string, dto: UpdateTaskDto) {
    const task = await this.getOr404(this.tasks, id, 'Tarea');
    Object.assign(task, dto);
    const saved = await this.tasks.save(task);
    if (saved.storyId) await this.syncStoryFromTasks(saved.storyId, saved.sprintId);
    return saved;
  }

  async removeTask(id: string) {
    const task = await this.getOr404(this.tasks, id, 'Tarea');
    await this.tasks.remove(task);
    return { success: true, id };
  }

  /**
   * Trazabilidad hallazgo → historia → tarea → mejora: cuando todas las tareas de una historia
   * están terminadas, la historia pasa a "hecha" y su hallazgo de origen a "resuelto".
   */
  private async syncStoryFromTasks(storyId: string, sprintId: string) {
    const story = await this.stories.findOne({ where: { id: storyId } });
    if (!story) return;
    const storyTasks = await this.tasks.find({ where: { storyId } });
    const allDone = storyTasks.length > 0 && storyTasks.every((t) => t.status === 'terminado');
    story.sprintId = story.sprintId || sprintId;
    story.status = allDone ? 'hecha' : 'sprint';
    await this.stories.save(story);
    if (story.findingId) await this.setFindingStatus(story.findingId, allDone ? 'resuelto' : 'en_backlog');
  }

  // ---------------- Daily Log ----------------
  listDaily(sprintId?: string) {
    return this.dailies.find({ where: sprintId ? { sprintId } : {}, order: { date: 'DESC', createdAt: 'DESC' } });
  }
  async createDaily(dto: CreateDailyDto) {
    await this.getOr404(this.sprints, dto.sprintId, 'Sprint');
    return this.dailies.save(this.dailies.create(dto));
  }
  async removeDaily(id: string) {
    const d = await this.getOr404(this.dailies, id, 'Registro diario');
    await this.dailies.remove(d);
    return { success: true, id };
  }

  // ---------------- Utilidades ----------------
  private async setFindingStatus(findingId: string, status: 'en_backlog' | 'resuelto') {
    const finding = await this.findings.findOne({ where: { id: findingId } });
    if (finding && finding.status !== status) {
      finding.status = status;
      await this.findings.save(finding);
    }
  }

  private assertDates(start: string, end: string) {
    if (start && end && start > end) {
      throw new BadRequestException('La fecha de fin del sprint debe ser posterior a la de inicio');
    }
  }

  private async getOr404<T extends { id: string }>(repo: Repository<T>, id: string, label: string): Promise<T> {
    const entity = await repo.findOne({ where: { id } as never });
    if (!entity) throw new NotFoundException(`${label} "${id}" no encontrado`);
    return entity;
  }
}
