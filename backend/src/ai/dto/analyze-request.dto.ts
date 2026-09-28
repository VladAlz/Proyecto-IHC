import {
  IsString,
  IsOptional,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  Validate,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

@ValidatorConstraint({ name: 'hasTestOrObservations', async: false })
class HasTestOrObservationsConstraint implements ValidatorConstraintInterface {
  validate(_value: any, args: ValidationArguments): boolean {
    const dto = args.object as AnalyzeRequestDto;
    return Boolean(dto.testId?.trim() || dto.observations?.trim());
  }

  defaultMessage(_args: ValidationArguments): string {
    return 'Debe proporcionar al menos un testId o observations para realizar el análisis';
  }
}

export class AnalyzeRequestDto {
  @ApiPropertyOptional({
    description: 'ID de una prueba registrada previamente en base de datos para extraer sus observaciones',
    example: 'a001-4b11-9a1c-000000000001',
  })
  @IsOptional()
  @IsString()
  testId?: string;

  @ApiPropertyOptional({
    description: 'Observaciones cualitativas directas para analizar con IA',
    example: 'El usuario no encontró el botón de exportación porque estaba al final sin contraste.',
  })
  @IsOptional()
  @IsString()
  observations?: string;

  @Validate(HasTestOrObservationsConstraint)
  readonly _validation?: never;
}
