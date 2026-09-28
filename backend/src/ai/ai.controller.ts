import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { AnalyzeRequestDto } from './dto/analyze-request.dto';

@ApiTags('Asistente IA')
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('analyze')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Analizar observaciones de usabilidad con Google Gemini y generar historias ágiles',
  })
  @ApiResponse({
    status: 200,
    description: 'Análisis estructurado con hallazgos, historias de usuario y recomendaciones',
    schema: {
      example: {
        hallazgos_clave: ['Baja visibilidad del botón de exportar...'],
        historias_usuario: [
          {
            titulo: 'Aumentar contraste del botón',
            criterio_aceptacion: 'Ratio de contraste mínimo 4.5:1',
            prioridad: 'alta',
          },
        ],
        recomendaciones_diseno: ['Aplicar Ley de Fitts: mínimo 44×44px'],
      },
    },
  })
  analyze(@Body() dto: AnalyzeRequestDto) {
    return this.aiService.analyze(dto);
  }
}
