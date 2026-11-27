import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { FindingsService } from './findings.service';
import { CreateFindingDto, UpdateFindingDto } from './dto/finding.dto';

@ApiTags('Hallazgos')
@Controller('findings')
export class FindingsController {
  constructor(private readonly findingsService: FindingsService) {}

  @Get()
  @ApiOperation({ summary: 'Matriz de hallazgos priorizada por severidad' })
  findAll() {
    return this.findingsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.findingsService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registrar un hallazgo de usabilidad' })
  create(@Body() dto: CreateFindingDto) {
    return this.findingsService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateFindingDto) {
    return this.findingsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.findingsService.remove(id);
  }
}
