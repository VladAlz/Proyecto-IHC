import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export class PlanTaskDto {
  @ApiProperty({ example: 'T1' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  code: string;

  @ApiProperty({ example: 'Registra una nueva prueba de usabilidad con tus datos.' })
  @IsString()
  @IsNotEmpty({ message: 'Cada tarea necesita un escenario' })
  scenario: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Cada tarea necesita un resultado esperado' })
  expectedResult: string;

  @ApiProperty({ example: 'Éxito + tiempo' })
  @IsString()
  @IsNotEmpty()
  metric: string;

  @ApiProperty({ example: 'Completa sin ayuda en menos de 60 s' })
  @IsString()
  @IsNotEmpty()
  successCriteria: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  followUpQuestion?: string;

  @ApiPropertyOptional({ example: 60 })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxTimeSeconds?: number;
}

export class PlanChecklistDto {
  @IsBoolean() emailParticipants: boolean;
  @IsOptional() @IsString() emailDate?: string;
  @IsBoolean() reminder1: boolean;
  @IsOptional() @IsString() reminder1Date?: string;
  @IsBoolean() reminder2: boolean;
  @IsOptional() @IsString() reminder2Date?: string;
  @IsBoolean() ethicalApproval: boolean;
  @IsBoolean() consentForm: boolean;
  @IsBoolean() usabilityChecklist: boolean;
}

export class CreatePlanDto {
  @ApiProperty() @IsString() @IsNotEmpty({ message: 'Indica el producto o servicio' }) @MaxLength(255)
  product: string;

  @ApiProperty() @IsString() @IsNotEmpty({ message: 'Indica la pantalla o módulo' }) @MaxLength(255)
  module: string;

  @ApiProperty() @IsString() @IsNotEmpty({ message: 'Define el objetivo del test' })
  objective: string;

  @ApiPropertyOptional() @IsOptional() @IsString()
  hypotheses?: string;

  @ApiProperty() @IsString() @IsNotEmpty({ message: 'Describe el perfil de usuarios' })
  userProfile: string;

  @ApiProperty() @IsString() @IsNotEmpty({ message: 'Indica el método' }) @MaxLength(255)
  method: string;

  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(120)
  duration?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(20)
  date?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(255)
  location?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(255)
  moderator?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(255)
  observer?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(255)
  tool?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(500)
  link?: string;

  @ApiPropertyOptional() @IsOptional() @IsString()
  moderatorNotes?: string;

  @ApiPropertyOptional({ enum: ['v1', 'v2'] }) @IsOptional() @IsIn(['v1', 'v2'])
  appVersion?: 'v1' | 'v2';

  @ApiProperty({ type: [PlanTaskDto] })
  @IsArray()
  @ArrayMinSize(1, { message: 'El plan debe tener al menos una tarea' })
  @ValidateNested({ each: true })
  @Type(() => PlanTaskDto)
  tasks: PlanTaskDto[];

  @ApiProperty({ type: PlanChecklistDto })
  @ValidateNested()
  @Type(() => PlanChecklistDto)
  checklist: PlanChecklistDto;

  @ApiPropertyOptional({ enum: ['borrador', 'listo', 'en_ejecucion', 'cerrado'] })
  @IsOptional()
  @IsIn(['borrador', 'listo', 'en_ejecucion', 'cerrado'])
  status?: 'borrador' | 'listo' | 'en_ejecucion' | 'cerrado';
}

export class UpdatePlanDto extends PartialType(CreatePlanDto) {}
