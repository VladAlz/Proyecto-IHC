import { IsIn, IsInt, IsNotEmpty, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export const UX_CATEGORIES = [
  'Navegación',
  'Visibilidad y feedback',
  'Jerarquía visual',
  'Formularios y prevención de errores',
  'Contenido y lenguaje',
  'Accesibilidad',
  'Eficiencia',
  'Consistencia',
  'General',
] as const;

export class CreateFindingDto {
  @ApiProperty({ minimum: 1, maximum: 4 })
  @IsInt({ message: 'La severidad debe ser un entero entre 1 y 4' })
  @Min(1)
  @Max(4)
  severity: number;

  @ApiProperty({ example: 'Nielsen #1: Visibilidad del estado del sistema' })
  @IsString()
  @IsNotEmpty({ message: 'Indica la heurística violada' })
  @MaxLength(255)
  heuristicViolated: string;

  @ApiPropertyOptional({ enum: UX_CATEGORIES })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  category?: string;

  @ApiProperty({ example: 'Pestaña Asistente IA' })
  @IsString()
  @IsNotEmpty({ message: 'Indica la pantalla o elemento' })
  @MaxLength(255)
  location: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Describe el problema detectado' })
  description: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  evidence?: string;

  @ApiPropertyOptional({ example: '4/5' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  frequency?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Propón una mejora' })
  recommendation: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  theoreticalBasis?: string;

  @ApiPropertyOptional({ enum: ['pendiente', 'en_backlog', 'resuelto'] })
  @IsOptional()
  @IsIn(['pendiente', 'en_backlog', 'resuelto'])
  status?: 'pendiente' | 'en_backlog' | 'resuelto';

  @ApiPropertyOptional({ enum: ['manual', 'ia', 'heuristica'] })
  @IsOptional()
  @IsIn(['manual', 'ia', 'heuristica'])
  source?: 'manual' | 'ia' | 'heuristica';
}

export class UpdateFindingDto extends PartialType(CreateFindingDto) {}
