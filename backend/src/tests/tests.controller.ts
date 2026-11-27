import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  ParseArrayPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { TestsService } from './tests.service';
import { CreateTestDto } from './dto/create-test.dto';
import { UpdateTestDto } from './dto/update-test.dto';
import { TestQueryDto } from './dto/pagination.dto';
import { PaginatedResponse } from './interfaces/paginated-response.interface';
import { UsabilityTest } from './entities/usability-test.entity';

@ApiTags('Pruebas de Usabilidad')
@Controller('tests')
export class TestsController {
  constructor(private readonly testsService: TestsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar pruebas con paginación y filtros (versión, resultado, plan)' })
  @ApiResponse({ status: 200, description: 'Listado paginado de pruebas' })
  findAll(@Query() query: TestQueryDto): Promise<PaginatedResponse<UsabilityTest>> {
    return this.testsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener el detalle de una prueba por ID' })
  @ApiParam({ name: 'id', description: 'ID de la prueba' })
  @ApiResponse({ status: 200, type: UsabilityTest })
  @ApiResponse({ status: 404, description: 'Prueba no encontrada' })
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.testsService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registrar una nueva sesión de prueba de usabilidad' })
  @ApiResponse({ status: 201, type: UsabilityTest })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  create(@Body() createTestDto: CreateTestDto) {
    return this.testsService.create(createTestDto);
  }

  @Post('bulk')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registrar varias observaciones a la vez (ejecución de un plan)' })
  @ApiBody({ type: [CreateTestDto] })
  createMany(@Body(new ParseArrayPipe({ items: CreateTestDto })) dtos: CreateTestDto[]) {
    return this.testsService.createMany(dtos);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar parcialmente una prueba de usabilidad' })
  @ApiResponse({ status: 200, type: UsabilityTest })
  update(@Param('id', new ParseUUIDPipe()) id: string, @Body() updateTestDto: UpdateTestDto) {
    return this.testsService.update(id, updateTestDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una prueba de usabilidad' })
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.testsService.remove(id);
  }
}
