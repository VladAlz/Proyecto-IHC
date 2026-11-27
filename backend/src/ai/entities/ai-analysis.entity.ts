import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AiAnalysisMeta, AiAnalysisResult } from '../ai.types';

/** Historial de análisis IA (permite editar el resultado antes de exportar: co-creación) */
@Entity('ai_analyses')
export class AiAnalysis {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'Análisis plan Dashboard v1' })
  @Column({ type: 'varchar', length: 255 })
  title: string;

  @ApiPropertyOptional({ description: 'IDs de las sesiones analizadas' })
  @Column({ type: 'simple-json', nullable: true })
  testIds?: string[];

  @ApiPropertyOptional()
  @Column({ type: 'varchar', length: 64, nullable: true })
  planId?: string;

  @ApiPropertyOptional()
  @Column({ type: 'text', nullable: true })
  freeText?: string;

  @ApiProperty()
  @Column({ type: 'simple-json' })
  result: AiAnalysisResult;

  @ApiProperty()
  @Column({ type: 'simple-json' })
  meta: AiAnalysisMeta;

  @ApiProperty({ description: 'true si el investigador editó la salida de la IA' })
  @Column({ type: 'boolean', default: false })
  edited: boolean;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}
