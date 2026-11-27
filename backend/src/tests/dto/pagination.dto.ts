import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class PaginationDto {
  @ApiPropertyOptional({ description: 'Número de página (empieza en 1)', example: 1, default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({ description: 'Cantidad de registros por página', example: 10, default: 10, minimum: 1, maximum: 1000 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(1000)
  limit: number = 10;
}

/** Filtros del listado de pruebas (Dashboard filtrable, HU-02) */
export class TestQueryDto extends PaginationDto {
  @ApiPropertyOptional({ enum: ['v1', 'v2'] })
  @IsOptional()
  @IsIn(['v1', 'v2'])
  appVersion?: 'v1' | 'v2';

  @ApiPropertyOptional({ enum: ['success', 'assisted', 'failure'] })
  @IsOptional()
  @IsIn(['success', 'assisted', 'failure'])
  taskResult?: 'success' | 'assisted' | 'failure';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  planId?: string;
}
