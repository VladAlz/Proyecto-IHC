import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';

@ApiTags('Dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  @ApiOperation({ summary: 'KPIs ISO 9241-11, tendencias, distribución de hallazgos y desempeño por tarea' })
  @ApiQuery({ name: 'appVersion', required: false, enum: ['v1', 'v2'] })
  @ApiQuery({ name: 'from', required: false, example: '2026-09-01' })
  @ApiQuery({ name: 'to', required: false, example: '2026-10-31' })
  getSummary(
    @Query('appVersion') appVersion?: 'v1' | 'v2',
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const version = appVersion === 'v1' || appVersion === 'v2' ? appVersion : undefined;
    return this.dashboardService.getSummary({ appVersion: version, from, to });
  }
}
