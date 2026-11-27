import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export type TaskResult = 'success' | 'assisted' | 'failure';
export type AppVersion = 'v1' | 'v2';

/**
 * Entidad UsabilityTest (registro de observación de una tarea)
 * Alineada a la Norma ISO 9241-11 (Calidad de Uso):
 * - Eficiencia: timeOnTask (tiempo empleado en segundos)
 * - Efectividad: taskResult ('success' | 'assisted' | 'failure') y errorsCount
 * - Satisfacción: satisfactionScore (1 a 5)
 * appVersion permite la comparativa antes (v1) / después (v2) del rediseño.
 */
@Entity('usability_tests')
export class UsabilityTest {
  @ApiProperty({ description: 'Identificador único UUID de la prueba' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Nombre o código del participante/evaluador', example: 'P1 - Ana Morales' })
  @Column({ type: 'varchar', length: 255 })
  evaluatorName: string;

  @ApiPropertyOptional({ description: 'Perfil del participante', example: 'Estudiante 5to nivel' })
  @Column({ type: 'varchar', length: 255, nullable: true })
  participantProfile?: string;

  @ApiProperty({ description: 'Descripción de la tarea evaluada' })
  @Column({ type: 'text' })
  taskDescription: string;

  @ApiPropertyOptional({ description: 'Código de la tarea dentro del plan (T1, T2...)', example: 'T1' })
  @Column({ type: 'varchar', length: 20, nullable: true })
  taskCode?: string;

  @ApiPropertyOptional({ description: 'Plan de prueba al que pertenece la sesión' })
  @Column({ type: 'varchar', length: 64, nullable: true })
  planId?: string;

  @ApiProperty({ description: 'Versión evaluada del aplicativo', enum: ['v1', 'v2'], example: 'v2' })
  @Column({ type: 'varchar', length: 10, default: 'v2' })
  appVersion: AppVersion;

  @ApiProperty({ description: 'Eficiencia: tiempo empleado en segundos', example: 48.5 })
  @Column({ type: 'float' })
  timeOnTask: number;

  @ApiProperty({ description: 'Número de errores o tropiezos', example: 0 })
  @Column({ type: 'int', default: 0 })
  errorsCount: number;

  @ApiProperty({ description: 'Satisfacción: escala 1 a 5', example: 5 })
  @Column({ type: 'int' })
  satisfactionScore: number;

  @ApiProperty({ description: 'Efectividad: resultado de la tarea', enum: ['success', 'assisted', 'failure'] })
  @Column({ type: 'varchar', length: 20 })
  taskResult: TaskResult;

  @ApiPropertyOptional({ description: 'Observaciones cualitativas (entrada del módulo IA)' })
  @Column({ type: 'text', nullable: true })
  observations?: string;

  @ApiProperty({ description: 'Fecha y hora de creación' })
  @CreateDateColumn()
  createdAt: Date;
}
