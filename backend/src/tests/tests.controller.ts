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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { TestsService } from './tests.service';
import { CreateTestDto } from './dto/create-test.dto';
import { UpdateTestDto } from './dto/update-test.dto';
import { PaginationDto } from './dto/pagination.dto';
import { PaginatedResponse } from './interfaces/paginated-response.interface';
import { UsabilityTest } from './entities/usability-test.entity';

@ApiTags('Pruebas de Usabilidad')
@Controller('tests')
export class TestsController {
  constructor(private readonly testsService: TestsService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todas las pruebas de usabilidad registradas con paginación' })
  @ApiQuery({ name: 'page', required: false, description: 'Número de página', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Cantidad por página', example: 10 })
  @ApiResponse({ status: 200, description: 'Listado paginado de pruebas' })
  findAll(@Query() paginationDto: PaginationDto): Promise<PaginatedResponse<UsabilityTest>> {
    return this.testsService.findAll(paginationDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener el detalle de una prueba por ID' })
  @ApiParam({ name: 'id', description: 'ID de la prueba' })
  @ApiResponse({ status: 200, description: 'Detalle de la prueba encontrada', type: UsabilityTest })
  @ApiResponse({ status: 400, description: 'Formato de ID inválido' })
  @ApiResponse({ status: 404, description: 'Prueba no encontrada' })
  findOne(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.testsService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registrar una nueva sesión de prueba de usabilidad' })
  @ApiResponse({ status: 201, description: 'Prueba creada exitosamente', type: UsabilityTest })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  create(@Body() createTestDto: CreateTestDto) {
    return this.testsService.create(createTestDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar parcialmente una prueba de usabilidad' })
  @ApiParam({ name: 'id', description: 'ID de la prueba' })
  @ApiResponse({ status: 200, description: 'Prueba actualizada', type: UsabilityTest })
  @ApiResponse({ status: 400, description: 'Formato de ID inválido' })
  @ApiResponse({ status: 404, description: 'Prueba no encontrada' })
  update(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @Body() updateTestDto: UpdateTestDto) {
    return this.testsService.update(id, updateTestDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una prueba de usabilidad' })
  @ApiParam({ name: 'id', description: 'ID de la prueba a eliminar' })
  @ApiResponse({ status: 200, description: 'Prueba eliminada con éxito' })
  @ApiResponse({ status: 400, description: 'Formato de ID inválido' })
  @ApiResponse({ status: 404, description: 'Prueba no encontrada' })
  remove(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.testsService.remove(id);
  }
}
