import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Evaluación con la matriz de usability test (Proyecto integrador, sección 14):
 * claridad, facilidad de aprendizaje, eficiencia, eficacia, prevención de errores y satisfacción (1-5).
 */
@Entity('matrix_evaluations')
export class MatrixEvaluation {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ enum: ['v1', 'v2'] })
  @Column({ type: 'varchar', length: 10 })
  appVersion: 'v1' | 'v2';

  @ApiProperty({ example: 'Santiago Mora' })
  @Column({ type: 'varchar', length: 120 })
  evaluator: string;

  @ApiProperty() @Column({ type: 'int' }) clarity: number;
  @ApiProperty() @Column({ type: 'int' }) learnability: number;
  @ApiProperty() @Column({ type: 'int' }) efficiency: number;
  @ApiProperty() @Column({ type: 'int' }) effectiveness: number;
  @ApiProperty() @Column({ type: 'int' }) errorPrevention: number;
  @ApiProperty() @Column({ type: 'int' }) satisfaction: number;

  @ApiPropertyOptional()
  @Column({ type: 'text', nullable: true })
  notes?: string;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;
}
