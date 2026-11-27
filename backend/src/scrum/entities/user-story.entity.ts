import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export type StoryStatus = 'backlog' | 'sprint' | 'hecha';
export type StoryPriority = 'Alta' | 'Media' | 'Baja';

/**
 * Historia de usuario del Product Backlog (hoja "Backlog" de la matriz de planificación):
 * Business Value, Story Points y Cociente de Decisión = BV / SP.
 */
@Entity('user_stories')
export class UserStory {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'HU-01' })
  @Column({ type: 'varchar', length: 30 })
  code: string;

  @ApiProperty({ example: 'Como evaluador, quiero registrar una prueba... para analizar...' })
  @Column({ type: 'text' })
  title: string;

  @ApiProperty()
  @Column({ type: 'text' })
  acceptanceCriteria: string;

  @ApiProperty({ enum: ['Alta', 'Media', 'Baja'] })
  @Column({ type: 'varchar', length: 10, default: 'Media' })
  priority: StoryPriority;

  @ApiProperty({ example: 'IA' })
  @Column({ type: 'varchar', length: 40, default: 'UI' })
  module: string;

  @ApiProperty({ description: 'Business Value 1-10' })
  @Column({ type: 'int', default: 5 })
  businessValue: number;

  @ApiProperty({ description: 'Story Points (Fibonacci)' })
  @Column({ type: 'int', default: 3 })
  storyPoints: number;

  @ApiProperty({ enum: ['backlog', 'sprint', 'hecha'] })
  @Column({ type: 'varchar', length: 20, default: 'backlog' })
  status: StoryStatus;

  @ApiPropertyOptional()
  @Column({ type: 'varchar', length: 64, nullable: true })
  sprintId?: string | null;

  @ApiProperty({ enum: ['manual', 'ia', 'hallazgo'] })
  @Column({ type: 'varchar', length: 20, default: 'manual' })
  source: 'manual' | 'ia' | 'hallazgo';

  @ApiPropertyOptional({ description: 'Hallazgo de usabilidad que originó la historia (trazabilidad)' })
  @Column({ type: 'varchar', length: 64, nullable: true })
  findingId?: string | null;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;
}
