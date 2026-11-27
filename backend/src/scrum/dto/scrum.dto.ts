import {
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const DATE_MESSAGE = 'La fecha debe tener el formato AAAA-MM-DD';

export class CreateMemberDto {
  @ApiProperty() @IsString() @IsNotEmpty({ message: 'El nombre es obligatorio' }) @MaxLength(120)
  name: string;

  @ApiProperty() @IsString() @IsNotEmpty({ message: 'El rol es obligatorio' }) @MaxLength(120)
  role: string;

  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) @Max(24)
  hoursPerDay?: number;
}
export class UpdateMemberDto extends PartialType(CreateMemberDto) {}

export class CreateStoryDto {
  @ApiPropertyOptional({ description: 'Si se omite se genera HU-NN' })
  @IsOptional() @IsString() @MaxLength(30)
  code?: string;

  @ApiProperty() @IsString() @IsNotEmpty({ message: 'Escribe la historia (Como..., quiero..., para...)' })
  title: string;

  @ApiProperty() @IsString() @IsNotEmpty({ message: 'Define el criterio de aceptación' })
  acceptanceCriteria: string;

  @ApiPropertyOptional({ enum: ['Alta', 'Media', 'Baja'] }) @IsOptional() @IsIn(['Alta', 'Media', 'Baja'])
  priority?: 'Alta' | 'Media' | 'Baja';

  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(40)
  module?: string;

  @ApiPropertyOptional({ minimum: 1, maximum: 10 }) @IsOptional() @IsInt() @Min(1) @Max(10)
  businessValue?: number;

  @ApiPropertyOptional({ minimum: 1, maximum: 40 }) @IsOptional() @IsInt() @Min(1) @Max(40)
  storyPoints?: number;

  @ApiPropertyOptional({ enum: ['backlog', 'sprint', 'hecha'] }) @IsOptional() @IsIn(['backlog', 'sprint', 'hecha'])
  status?: 'backlog' | 'sprint' | 'hecha';

  @ApiPropertyOptional() @IsOptional() @IsString()
  sprintId?: string | null;

  @ApiPropertyOptional({ enum: ['manual', 'ia', 'hallazgo'] }) @IsOptional() @IsIn(['manual', 'ia', 'hallazgo'])
  source?: 'manual' | 'ia' | 'hallazgo';

  @ApiPropertyOptional() @IsOptional() @IsString()
  findingId?: string | null;
}
export class UpdateStoryDto extends PartialType(CreateStoryDto) {}

export class CreateSprintDto {
  @ApiProperty() @IsInt() @Min(1)
  number: number;

  @ApiProperty() @IsString() @IsNotEmpty({ message: 'Define el objetivo del sprint' })
  goal: string;

  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(60)
  weeksLabel?: string;

  @ApiProperty() @Matches(DATE_REGEX, { message: DATE_MESSAGE })
  startDate: string;

  @ApiProperty() @Matches(DATE_REGEX, { message: DATE_MESSAGE })
  endDate: string;

  @ApiPropertyOptional({ enum: ['planificado', 'activo', 'cerrado'] })
  @IsOptional() @IsIn(['planificado', 'activo', 'cerrado'])
  status?: 'planificado' | 'activo' | 'cerrado';

  @ApiPropertyOptional() @IsOptional() @IsString() productOwner?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() scrumMaster?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() deliverables?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() reviewCompleted?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() reviewPending?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() reviewDelivered?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() retroWentWell?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() retroWentWrong?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() retroAgreements?: string;
}
export class UpdateSprintDto extends PartialType(CreateSprintDto) {}

export class CreateTaskDto {
  @ApiProperty() @IsString() @IsNotEmpty()
  sprintId: string;

  @ApiPropertyOptional() @IsOptional() @IsString()
  storyId?: string | null;

  @ApiProperty() @IsString() @IsNotEmpty({ message: 'Describe la tarea' })
  title: string;

  @ApiProperty() @IsString() @IsNotEmpty({ message: 'Asigna un responsable' }) @MaxLength(120)
  assignee: string;

  @ApiPropertyOptional({ example: 'Desarrollo' })
  @IsOptional() @IsIn(['Análisis', 'Diseño', 'Desarrollo', 'Pruebas', 'Documentación'])
  phase?: string;

  @ApiPropertyOptional({ example: 'Nuevo' })
  @IsOptional() @IsIn(['Nuevo', 'Mejora', 'Error'])
  type?: string;

  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) @Max(200)
  estimatedHours?: number;

  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) @Max(200)
  realHours?: number;

  @ApiPropertyOptional({ enum: ['pendiente', 'en_progreso', 'en_revision', 'terminado'] })
  @IsOptional() @IsIn(['pendiente', 'en_progreso', 'en_revision', 'terminado'])
  status?: 'pendiente' | 'en_progreso' | 'en_revision' | 'terminado';

  @ApiPropertyOptional() @IsOptional() @IsString()
  comment?: string;

  @ApiPropertyOptional() @IsOptional() @IsBoolean()
  unplanned?: boolean;

  @ApiPropertyOptional() @IsOptional() @Matches(DATE_REGEX, { message: DATE_MESSAGE })
  unplannedDate?: string;
}
export class UpdateTaskDto extends PartialType(CreateTaskDto) {}

export class CreateDailyDto {
  @ApiProperty() @IsString() @IsNotEmpty()
  sprintId: string;

  @ApiProperty() @IsString() @IsNotEmpty({ message: 'Selecciona el integrante' })
  member: string;

  @ApiProperty() @Matches(DATE_REGEX, { message: DATE_MESSAGE })
  date: string;

  @ApiProperty() @IsString() @IsNotEmpty({ message: 'Indica qué avanzaste' })
  done: string;

  @ApiProperty() @IsString() @IsNotEmpty({ message: 'Indica el siguiente paso' })
  next: string;

  @ApiPropertyOptional() @IsOptional() @IsString()
  impediments?: string;
}
