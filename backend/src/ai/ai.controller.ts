import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { AnalyzeRequestDto, ApplyAnalysisDto, UpdateAnalysisDto } from './dto/ai.dto';

@ApiTags('Asistente IA')
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Get('status')
  @ApiOperation({ summary: 'Proveedor de IA activo y cadena de respaldo configurada' })
  status() {
    return this.aiService.getStatus();
  }

  @Post('analyze')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Analizar sesiones/observaciones: resumen, hallazgos por categoría UX y severidad, recomendaciones por pantalla e historias de usuario',
  })
  @ApiResponse({ status: 200, description: 'Análisis guardado en el historial (incluye meta del proveedor usado)' })
  @ApiResponse({ status: 400, description: 'No se envió evidencia para analizar' })
  analyze(@Body() dto: AnalyzeRequestDto) {
    return this.aiService.analyze(dto);
  }

  @Get('analyses')
  @ApiOperation({ summary: 'Historial de análisis' })
  list() {
    return this.aiService.listAnalyses();
  }

  @Get('analyses/:id')
  get(@Param('id') id: string) {
    return this.aiService.getAnalysis(id);
  }

  @Patch('analyses/:id')
  @ApiOperation({ summary: 'Guardar la versión editada por el investigador (co-creación)' })
  update(@Param('id') id: string, @Body() dto: UpdateAnalysisDto) {
    return this.aiService.updateAnalysis(id, dto);
  }

  @Delete('analyses/:id')
  remove(@Param('id') id: string) {
    return this.aiService.removeAnalysis(id);
  }

  @Post('apply')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registrar hallazgos seleccionados y enviar historias al Product Backlog' })
  apply(@Body() dto: ApplyAnalysisDto) {
    return this.aiService.apply(dto);
  }
}
