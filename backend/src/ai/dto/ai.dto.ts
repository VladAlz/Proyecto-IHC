import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AiAnalysisResult } from '../ai.types';

export class AnalyzeRequestDto {
  @ApiPropertyOptional({ description: 'IDs de sesiones registradas a analizar', type: [String] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(100)
  @IsString({ each: true })
  testIds?: string[];

  @ApiPropertyOptional({ description: 'Compatibilidad Sprint 1: una sola sesión' })
  @IsOptional()
  @IsString()
  testId?: string;

  @ApiPropertyOptional({ description: 'Analizar todas las sesiones de un plan de prueba' })
  @IsOptional()
  @IsString()
  planId?: string;

  @ApiPropertyOptional({
    description: 'Comentarios u observaciones en texto libre',
    example: 'El usuario no encontró el botón de exportación porque estaba al final sin contraste.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(12000)
  observations?: string;

  @ApiPropertyOptional({ description: 'Producto o pantalla evaluada (contexto para la IA)' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  context?: string;

  @ApiPropertyOptional({ description: 'Título para el historial' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;
}

export class UpdateAnalysisDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(255)
  title?: string;

  @ApiProperty({ description: 'Resultado editado por el investigador' })
  @IsObject()
  result: AiAnalysisResult;
}

export class ApplyFindingDto {
  @IsString() @IsNotEmpty() titulo: string;
  @IsString() descripcion: string;
  @IsString() categoria: string;
  @IsString() heuristica: string;
  @IsInt() @Min(1) @Max(4) severidad: number;
  @IsString() pantalla: string;
  @IsOptional() @IsString() evidencia?: string;
  @IsOptional() @IsString() frecuencia?: string;
  @IsOptional() @IsString() recomendacion?: string;
  @IsOptional() @IsString() fundamento?: string;
}

export class ApplyStoryDto {
  @IsString() @IsNotEmpty() titulo: string;
  @IsString() criterio_aceptacion: string;
  @IsIn(['Alta', 'Media', 'Baja']) prioridad: 'Alta' | 'Media' | 'Baja';
  @IsOptional() @IsString() modulo?: string;
  @IsOptional() @IsInt() @Min(1) @Max(10) valor_negocio?: number;
  @IsOptional() @IsInt() @Min(1) @Max(40) story_points?: number;
  @IsOptional() @IsArray() @IsString({ each: true }) tareas?: string[];
  @ApiPropertyOptional({ description: 'Índice del hallazgo (en "findings") que originó la historia' })
  @IsOptional() @IsInt() @Min(0) findingIndex?: number;
}

export class ApplyAnalysisDto {
  @ApiPropertyOptional({ type: [ApplyFindingDto] })
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => ApplyFindingDto)
  findings?: ApplyFindingDto[];

  @ApiPropertyOptional({ type: [ApplyStoryDto] })
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => ApplyStoryDto)
  stories?: ApplyStoryDto[];
}
