import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export type TaskStatus = 'pendiente' | 'en_progreso' | 'en_revision' | 'terminado';

/**
 * Tarea de sprint (filas de la hoja "Sprint.N": desarrollador, fase, tipo, tarea,
 * tiempo estimado, tiempo real, estado y comentario). Las tareas no planificadas (TNP)
 * se marcan con unplanned=true.
 */
@Entity('sprint_tasks')
export class SprintTask {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({ type: 'varchar', length: 64 })
  sprintId: string;

  @ApiPropertyOptional()
  @Column({ type: 'varchar', length: 64, nullable: true })
  storyId?: string | null;

  @ApiProperty()
  @Column({ type: 'text' })
  title: string;

  @ApiProperty({ example: 'Boris Vinces' })
  @Column({ type: 'varchar', length: 120 })
  assignee: string;

  @ApiProperty({ example: 'Desarrollo' })
  @Column({ type: 'varchar', length: 40, default: 'Desarrollo' })
  phase: string;

  @ApiProperty({ example: 'Nuevo' })
  @Column({ type: 'varchar', length: 20, default: 'Nuevo' })
  type: string;

  @ApiProperty()
  @Column({ type: 'float', default: 1 })
  estimatedHours: number;

  @ApiProperty()
  @Column({ type: 'float', default: 0 })
  realHours: number;

  @ApiProperty({ enum: ['pendiente', 'en_progreso', 'en_revision', 'terminado'] })
  @Column({ type: 'varchar', length: 20, default: 'pendiente' })
  status: TaskStatus;

  @ApiPropertyOptional()
  @Column({ type: 'text', nullable: true })
  comment?: string;

  @ApiProperty({ description: 'Tarea no planificada (TNP)' })
  @Column({ type: 'boolean', default: false })
  unplanned: boolean;

  @ApiPropertyOptional({ example: '2026-10-03' })
  @Column({ type: 'varchar', length: 10, nullable: true })
  unplannedDate?: string;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;
}
