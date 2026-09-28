import { Entity, PrimaryColumn, Column } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Entidad UsabilityFinding para hallazgos heurísticos detectados
 * Clasificados según las 10 Heurísticas de Jakob Nielsen y severidad 1 a 4.
 */
@Entity('usability_findings')
export class UsabilityFinding {
  @ApiProperty({ description: 'ID identificador del hallazgo', example: 'find-001' })
  @PrimaryColumn({ type: 'varchar', length: 50 })
  id: string;

  @ApiProperty({ description: 'Severidad Nielsen (1: Cosmético, 2: Menor, 3: Mayor, 4: Catastrófico)', example: 4, minimum: 1, maximum: 4 })
  @Column({ type: 'int' })
  severity: 1 | 2 | 3 | 4;

  @ApiProperty({ description: 'Heurística de Nielsen violada', example: 'Nielsen #1: Visibilidad del estado del sistema' })
  @Column({ type: 'varchar', length: 255 })
  heuristicViolated: string;

  @ApiProperty({ description: 'Pestaña o elemento donde ocurre el problema', example: 'Pestaña Asistente IA' })
  @Column({ type: 'varchar', length: 255 })
  location: string;

  @ApiProperty({ description: 'Descripción técnica del problema', example: 'El textarea es de solo lectura y no existe ningún indicador visual de procesamiento.' })
  @Column({ type: 'text' })
  description: string;

  @ApiProperty({ description: 'Acción correctiva propuesta', example: 'Incorporar estados explícitos de carga (Spinner y mensajes informativos).' })
  @Column({ type: 'text' })
  recommendation: string;

  @ApiProperty({ description: 'Fundamento teórico en IHC (Norman, Gestalt, Fitts, WCAG)', required: false, example: 'Shneiderman #3 y Principio POUR: Perceptible' })
  @Column({ type: 'text', nullable: true })
  theoreticalBasis?: string;
}
