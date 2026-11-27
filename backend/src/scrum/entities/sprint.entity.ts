import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export type SprintStatus = 'planificado' | 'activo' | 'cerrado';

/**
 * Sprint (hojas "Sprint.N" de la matriz de planificación) con Sprint Review y Retrospectiva.
 */
@Entity('sprints')
export class Sprint {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 1 })
  @Column({ type: 'int' })
  number: number;

  @ApiProperty({ example: 'Diagnóstico, backlog y prototipos iniciales' })
  @Column({ type: 'text' })
  goal: string;

  @ApiPropertyOptional({ example: 'Sem. 10–11' })
  @Column({ type: 'varchar', length: 60, nullable: true })
  weeksLabel?: string;

  @ApiProperty({ example: '2026-09-14' })
  @Column({ type: 'varchar', length: 10 })
  startDate: string;

  @ApiProperty({ example: '2026-09-27' })
  @Column({ type: 'varchar', length: 10 })
  endDate: string;

  @ApiProperty({ enum: ['planificado', 'activo', 'cerrado'] })
  @Column({ type: 'varchar', length: 20, default: 'planificado' })
  status: SprintStatus;

  @ApiPropertyOptional()
  @Column({ type: 'varchar', length: 120, nullable: true })
  productOwner?: string;

  @ApiPropertyOptional()
  @Column({ type: 'varchar', length: 120, nullable: true })
  scrumMaster?: string;

  @ApiPropertyOptional({ description: 'Entregables clave del sprint' })
  @Column({ type: 'text', nullable: true })
  deliverables?: string;

  // --- Sprint Review ---
  @ApiPropertyOptional() @Column({ type: 'text', nullable: true }) reviewCompleted?: string;
  @ApiPropertyOptional() @Column({ type: 'text', nullable: true }) reviewPending?: string;
  @ApiPropertyOptional() @Column({ type: 'text', nullable: true }) reviewDelivered?: string;

  // --- Retrospectiva ---
  @ApiPropertyOptional() @Column({ type: 'text', nullable: true }) retroWentWell?: string;
  @ApiPropertyOptional() @Column({ type: 'text', nullable: true }) retroWentWrong?: string;
  @ApiPropertyOptional() @Column({ type: 'text', nullable: true }) retroAgreements?: string;
}
