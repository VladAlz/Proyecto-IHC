import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('team_members')
export class TeamMember {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'Vladimir González' })
  @Column({ type: 'varchar', length: 120 })
  name: string;

  @ApiProperty({ example: 'Scrum Master / QA' })
  @Column({ type: 'varchar', length: 120 })
  role: string;

  @ApiProperty({ description: 'Horas disponibles por día (matriz de planificación)', example: 2 })
  @Column({ type: 'float', default: 2 })
  hoursPerDay: number;
}
