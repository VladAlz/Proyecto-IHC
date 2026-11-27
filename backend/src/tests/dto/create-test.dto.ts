import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  IsInt,
  Max,
  IsIn,
  IsOptional,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO para la creación de pruebas de usabilidad
 * Cumple con validaciones de tipo e integridad requeridas por el Frontend
 */
export class CreateTestDto {
  @ApiProperty({ description: 'Nombre del participante o evaluador', example: 'P1 - Vladimir González' })
  @IsString({ message: 'El nombre del evaluador debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre del evaluador es obligatorio' })
  @MaxLength(255)
  evaluatorName: string;

  @ApiPropertyOptional({ description: 'Perfil del participante', example: 'Estudiante 5to nivel' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  participantProfile?: string;

  @ApiProperty({ description: 'Descripción de la tarea ejecutada', example: 'Localizar el botón de exportación de reporte' })
  @IsString({ message: 'La descripción de la tarea debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La descripción de la tarea es obligatoria' })
  taskDescription: string;

  @ApiPropertyOptional({ description: 'Código de tarea del plan', example: 'T1' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  taskCode?: string;

  @ApiPropertyOptional({ description: 'ID del plan de prueba' })
  @IsOptional()
  @IsString()
  planId?: string;

  @ApiPropertyOptional({ description: 'Versión evaluada del aplicativo', enum: ['v1', 'v2'], default: 'v2' })
  @IsOptional()
  @IsIn(['v1', 'v2'], { message: "La versión debe ser 'v1' (inicial) o 'v2' (rediseño)" })
  appVersion?: 'v1' | 'v2';

  @ApiProperty({ description: 'Tiempo en segundos empleado en la tarea', example: 48.5 })
  @IsNumber({}, { message: 'El tiempo en tarea debe ser un valor numérico' })
  @Min(0.1, { message: 'El tiempo en tarea debe ser mayor a 0' })
  @Max(7200, { message: 'El tiempo en tarea no puede superar 2 horas' })
  timeOnTask: number;

  @ApiProperty({ description: 'Número de errores durante la ejecución', example: 0 })
  @IsInt({ message: 'El número de errores debe ser un entero' })
  @Min(0, { message: 'El número de errores no puede ser negativo' })
  @Max(100, { message: 'El número de errores no puede superar 100' })
  errorsCount: number;

  @ApiProperty({ description: 'Satisfacción percibida 1 a 5', example: 5, minimum: 1, maximum: 5 })
  @IsInt({ message: 'La satisfacción debe ser un número entero' })
  @Min(1, { message: 'La satisfacción mínima es 1' })
  @Max(5, { message: 'La satisfacción máxima es 5' })
  satisfactionScore: number;

  @ApiProperty({ description: 'Resultado de la tarea', enum: ['success', 'assisted', 'failure'], example: 'success' })
  @IsIn(['success', 'assisted', 'failure'], {
    message: "El resultado debe ser 'success', 'assisted' (con ayuda) o 'failure'",
  })
  taskResult: 'success' | 'assisted' | 'failure';

  @ApiPropertyOptional({ description: 'Observaciones cualitativas para el módulo IA' })
  @IsOptional()
  @IsString({ message: 'Las observaciones deben ser texto' })
  @MaxLength(5000)
  observations?: string;
}
