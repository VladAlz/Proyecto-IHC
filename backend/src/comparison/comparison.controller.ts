import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ComparisonService, CreateMatrixDto } from './comparison.service';

@ApiTags('Comparativa antes/después')
@Controller('comparison')
export class ComparisonController {
  constructor(private readonly comparison: ComparisonService) {}

  @Get()
  @ApiOperation({ summary: 'Métricas v1 (inicial) vs v2 (rediseño) y promedios de la matriz de usabilidad' })
  get() {
    return this.comparison.getComparison();
  }

  @Get('matrix')
  list() {
    return this.comparison.listEvaluations();
  }

  @Post('matrix')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registrar una evaluación con la matriz de usability test' })
  create(@Body() dto: CreateMatrixDto) {
    return this.comparison.createEvaluation(dto);
  }

  @Delete('matrix/:id')
  remove(@Param('id') id: string) {
    return this.comparison.removeEvaluation(id);
  }
}
