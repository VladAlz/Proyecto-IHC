import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export interface PlanTask {
  code: string;            // T1, T2...
  scenario: string;        // Escenario / tarea leída al participante
  expectedResult: string;  // Resultado esperado
  metric: string;          // Métrica principal (Éxito + tiempo, errores...)
  successCriteria: string; // Criterio de éxito
  followUpQuestion?: string;
  maxTimeSeconds?: number;
}

export interface PlanChecklist {
  emailParticipants: boolean;
  emailDate?: string;
  reminder1: boolean;
  reminder1Date?: string;
  reminder2: boolean;
  reminder2Date?: string;
  ethicalApproval: boolean;
  consentForm: boolean;
  usabilityChecklist: boolean;
}

export type PlanStatus = 'borrador' | 'listo' | 'en_ejecucion' | 'cerrado';

/**
 * Plan de prueba de usabilidad (hojas "Plan de prueba" y "Guion y tareas" de la plantilla
 * y el "Usability Test Plan Dashboard" de referencia). Fase 1 del wizard: configuración.
 */
@Entity('test_plans')
export class TestPlan {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'Usability Test Dashboard 2.0' })
  @Column({ type: 'varchar', length: 255 })
  product: string;

  @ApiProperty({ example: 'Dashboard UX y Registro de prueba' })
  @Column({ type: 'varchar', length: 255 })
  module: string;

  @ApiProperty()
  @Column({ type: 'text' })
  objective: string;

  @ApiPropertyOptional({ description: 'Preguntas o hipótesis a validar' })
  @Column({ type: 'text', nullable: true })
  hypotheses?: string;

  @ApiProperty()
  @Column({ type: 'text' })
  userProfile: string;

  @ApiProperty({ example: 'Prueba moderada presencial' })
  @Column({ type: 'varchar', length: 255 })
  method: string;

  @ApiPropertyOptional({ example: '20 minutos por participante' })
  @Column({ type: 'varchar', length: 120, nullable: true })
  duration?: string;

  @ApiPropertyOptional({ example: '2026-10-20' })
  @Column({ type: 'varchar', length: 20, nullable: true })
  date?: string;

  @ApiPropertyOptional()
  @Column({ type: 'varchar', length: 255, nullable: true })
  location?: string;

  @ApiPropertyOptional()
  @Column({ type: 'varchar', length: 255, nullable: true })
  moderator?: string;

  @ApiPropertyOptional()
  @Column({ type: 'varchar', length: 255, nullable: true })
  observer?: string;

  @ApiPropertyOptional()
  @Column({ type: 'varchar', length: 255, nullable: true })
  tool?: string;

  @ApiPropertyOptional()
  @Column({ type: 'varchar', length: 500, nullable: true })
  link?: string;

  @ApiPropertyOptional()
  @Column({ type: 'text', nullable: true })
  moderatorNotes?: string;

  @ApiProperty({ enum: ['v1', 'v2'] })
  @Column({ type: 'varchar', length: 10, default: 'v2' })
  appVersion: 'v1' | 'v2';

  @ApiProperty({ type: 'array' })
  @Column({ type: 'simple-json' })
  tasks: PlanTask[];

  @ApiProperty()
  @Column({ type: 'simple-json' })
  checklist: PlanChecklist;

  @ApiProperty({ enum: ['borrador', 'listo', 'en_ejecucion', 'cerrado'] })
  @Column({ type: 'varchar', length: 20, default: 'borrador' })
  status: PlanStatus;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}
