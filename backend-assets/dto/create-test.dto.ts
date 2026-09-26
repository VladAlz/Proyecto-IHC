import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  IsInt,
  Max,
  IsIn,
  IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO para la creación de pruebas de usabilidad
 * Cumple con validaciones de tipo e integridad requeridas por el Frontend
 */
export class CreateTestDto {
  @ApiProperty({
    description: 'Nombre del evaluador o identificador del sujeto de prueba',
    example: 'Vladimir González',
  })
  @IsString({ message: 'El nombre del evaluador debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre del evaluador es obligatorio' })
  evaluatorName: string;

  @ApiProperty({
    description: 'Descripción de la tarea ejecutada',
    example: 'Localizar el botón de exportación de reporte',
  })
  @IsString({ message: 'La descripción de la tarea debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La descripción de la tarea es obligatoria' })
  taskDescription: string;

  @ApiProperty({
    description: 'Eficiencia: Tiempo en segundos empleado en completar la tarea',
    example: 48.5,
  })
  @IsNumber({}, { message: 'El tiempo en tarea debe ser un valor numérico' })
  @Min(0.1, { message: 'El tiempo en tarea debe ser mayor a 0' })
  timeOnTask: number;

  @ApiProperty({
    description: 'Efectividad inversa: Número de tropiezos o errores durante la ejecución',
    example: 0,
  })
  @IsInt({ message: 'El número de errores debe ser un entero' })
  @Min(0, { message: 'El número de errores no puede ser negativo' })
  errorsCount: number;

  @ApiProperty({
    description: 'Satisfacción percibida del usuario según escala visual 1 a 5',
    example: 5,
    minimum: 1,
    maximum: 5,
  })
  @IsInt({ message: 'La satisfacción debe ser un número entero' })
  @Min(1, { message: 'La satisfacción mínima es 1' })
  @Max(5, { message: 'La satisfacción máxima es 5' })
  satisfactionScore: number;

  @ApiProperty({
    description: 'Efectividad: Resultado de completitud de la tarea',
    enum: ['success', 'failure'],
    example: 'success',
  })
  @IsIn(['success', 'failure'], {
    message: "El resultado de la tarea debe ser 'success' o 'failure'",
  })
  taskResult: 'success' | 'failure';

  @ApiPropertyOptional({
    description: 'Observaciones cualitativas recogidas durante la sesión para procesamiento IA',
    example: 'El evaluador identificó rápidamente la opción tras el rediseño con mayor contraste.',
  })
  @IsOptional()
  @IsString({ message: 'Las observaciones deben ser texto' })
  observations?: string;
}
