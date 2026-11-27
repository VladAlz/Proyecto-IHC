import { ForbiddenException, Controller, HttpCode, HttpStatus, Module, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SeedService } from './seed.service';

@ApiTags('Administración')
@Controller('admin')
export class AdminController {
  constructor(
    private readonly seedService: SeedService,
    private readonly config: ConfigService,
  ) {}

  @Post('reset')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Borrar todos los datos y restaurar la semilla (solo entorno local)' })
  reset() {
    if ((this.config.get<string>('ALLOW_RESET') || 'true') === 'false') {
      throw new ForbiddenException('El reinicio de datos está deshabilitado (ALLOW_RESET=false)');
    }
    return this.seedService.reset();
  }
}

@Module({
  controllers: [AdminController],
  providers: [SeedService],
  exports: [SeedService],
})
export class DatabaseModule {}
