import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

/**
 * Entidad UsabilityTest para NestJS / TypeORM (PostgreSQL o SQLite)
 * Alineada a la Norma ISO 9241-11 (Calidad de Uso):
 * - Eficiencia: timeOnTask (tiempo empleado)
 * - Efectividad: taskResult ('success' | 'failure') y errorsCount
 * - Satisfacción: satisfactionScore (1 a 5)
 */
@Entity('usability_tests')
export class UsabilityTest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  evaluatorName: string; // Nombre del evaluador o identificador del participante

  @Column({ type: 'text' })
  taskDescription: string; // Descripción de la tarea evaluada

  @Column({ type: 'float' })
  timeOnTask: number; // Eficiencia (ISO 9241-11): Tiempo en segundos

  @Column({ type: 'int', default: 0 })
  errorsCount: number; // Efectividad inversa: Número de errores o tropiezos

  @Column({ type: 'int' })
  satisfactionScore: number; // Satisfacción (ISO 9241-11): Escala 1 a 5

  @Column({ type: 'varchar', length: 20 })
  taskResult: 'success' | 'failure'; // Efectividad (ISO 9241-11): Éxito o Abandono

  @Column({ type: 'text', nullable: true })
  observations?: string; // Input cualitativo para el Asistente IA (NLP/LLM)

  @CreateDateColumn()
  createdAt: Date;
}
