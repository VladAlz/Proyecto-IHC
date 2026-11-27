import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/** Daily Log: avance, siguiente paso e impedimentos por integrante */
@Entity('daily_logs')
export class DailyLog {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({ type: 'varchar', length: 64 })
  sprintId: string;

  @ApiProperty()
  @Column({ type: 'varchar', length: 120 })
  member: string;

  @ApiProperty({ example: '2026-10-17' })
  @Column({ type: 'varchar', length: 10 })
  date: string;

  @ApiProperty()
  @Column({ type: 'text' })
  done: string;

  @ApiProperty()
  @Column({ type: 'text' })
  next: string;

  @ApiPropertyOptional()
  @Column({ type: 'text', nullable: true })
  impediments?: string;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;
}
