import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export type FindingStatus = 'pendiente' | 'en_backlog' | 'resuelto';
export type FindingSource = 'manual' | 'ia' | 'heuristica';

/**
 * Hallazgo de usabilidad (hoja "Hallazgos y mejoras" de la plantilla)
 * Clasificado por heurística de Nielsen, categoría UX y severidad 1-4.
 */
@Entity('usability_findings')
export class UsabilityFinding {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Severidad Nielsen (1 Cosmético, 2 Menor, 3 Mayor, 4 Catastrófico)', minimum: 1, maximum: 4 })
  @Column({ type: 'int' })
  severity: number;

  @ApiProperty({ description: 'Heurística de Nielsen violada', example: 'Nielsen #1: Visibilidad del estado del sistema' })
  @Column({ type: 'varchar', length: 255 })
  heuristicViolated: string;

  @ApiProperty({ description: 'Categoría UX', example: 'Navegación' })
  @Column({ type: 'varchar', length: 80, default: 'General' })
  category: string;

  @ApiProperty({ description: 'Pantalla o elemento donde ocurre', example: 'Pestaña Asistente IA' })
  @Column({ type: 'varchar', length: 255 })
  location: string;

  @ApiProperty({ description: 'Problema detectado' })
  @Column({ type: 'text' })
  description: string;

  @ApiPropertyOptional({ description: 'Evidencia observada', example: '4 de 5 usuarios dudaron' })
  @Column({ type: 'text', nullable: true })
  evidence?: string;

  @ApiPropertyOptional({ description: 'Frecuencia', example: '4/5' })
  @Column({ type: 'varchar', length: 30, nullable: true })
  frequency?: string;

  @ApiProperty({ description: 'Recomendación / mejora propuesta' })
  @Column({ type: 'text' })
  recommendation: string;

  @ApiPropertyOptional({ description: 'Fundamento IHC (Norman, Gestalt, Fitts, WCAG...)' })
  @Column({ type: 'text', nullable: true })
  theoreticalBasis?: string;

  @ApiProperty({ enum: ['pendiente', 'en_backlog', 'resuelto'] })
  @Column({ type: 'varchar', length: 20, default: 'pendiente' })
  status: FindingStatus;

  @ApiProperty({ enum: ['manual', 'ia', 'heuristica'] })
  @Column({ type: 'varchar', length: 20, default: 'manual' })
  source: FindingSource;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;
}
