import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Entidad UsabilityTest para NestJS / TypeORM (PostgreSQL)
 * Alineada a la Norma ISO 9241-11 (Calidad de Uso):
 * - Eficiencia: timeOnTask (tiempo empleado en segundos)
 * - Efectividad: taskResult ('success' | 'failure') y errorsCount
 * - Satisfacción: satisfactionScore (1 a 5)
 */
@Entity('usability_tests')
export class UsabilityTest {
  @ApiProperty({ description: 'Identificador único UUID de la prueba', example: 'a001-4b11-9a1c-000000000001' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Nombre o rol del evaluador/participante', example: 'Ana Morales (UX Lead)' })
  @Column({ type: 'varchar', length: 255 })
  evaluatorName: string;

  @ApiProperty({ description: 'Descripción de la tarea evaluada', example: 'Completar registro de nueva prueba de usabilidad y guardar' })
  @Column({ type: 'text' })
  taskDescription: string;

  @ApiProperty({ description: 'Eficiencia (ISO 9241-11): Tiempo empleado en segundos', example: 48.5 })
  @Column({ type: 'float' })
  timeOnTask: number;

  @ApiProperty({ description: 'Efectividad inversa: Número de errores o tropiezos', example: 0 })
  @Column({ type: 'int', default: 0 })
  errorsCount: number;

  @ApiProperty({ description: 'Satisfacción (ISO 9241-11): Escala 1 a 5', example: 5 })
  @Column({ type: 'int' })
  satisfactionScore: number;

  @ApiProperty({ description: 'Efectividad (ISO 9241-11): Resultado de la tarea', enum: ['success', 'failure'], example: 'success' })
  @Column({ type: 'varchar', length: 20 })
  taskResult: 'success' | 'failure';

  @ApiProperty({ description: 'Observaciones cualitativas (input para módulo IA)', required: false, example: 'Flujo intuitivo con campos agrupados.' })
  @Column({ type: 'text', nullable: true })
  observations?: string;

  @ApiProperty({ description: 'Fecha y hora de creación de la prueba' })
  @CreateDateColumn()
  createdAt: Date;
}
