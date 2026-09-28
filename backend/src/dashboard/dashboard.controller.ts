import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { UsabilityFinding } from './entities/usability-finding.entity';

@ApiTags('Dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Obtener métricas agregadas ISO 9241-11 del Dashboard y tendencias' })
  @ApiResponse({
    status: 200,
    description: 'Resumen cuantitativo del Dashboard',
    schema: {
      example: {
        totalTests: 10,
        successRate: 80.0,
        avgTime: 56.4,
        avgSatisfaction: 4.1,
        trends: {
          totalTestsDiff: 2,
          successRateDiff: 5.5,
          avgTimeDiff: -12.3,
          avgSatisfactionDiff: 0.4,
        },
      },
    },
  })
  getSummary() {
    return this.dashboardService.getSummary();
  }

  @Get('findings')
  @ApiOperation({ summary: 'Obtener matriz de hallazgos heurísticos priorizados por severidad' })
  @ApiResponse({ status: 200, description: 'Listado de hallazgos de usabilidad', type: [UsabilityFinding] })
  getFindings() {
    return this.dashboardService.getFindings();
  }
}
