import { IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTimeEntryDto {
  @ApiProperty({ example: 120, description: 'Time spent in minutes' })
  @IsInt()
  @Min(1)
  minutes: number;

  @ApiPropertyOptional({ example: 'Investigué los logs y encontré el error' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'Juan Pérez' })
  @IsString()
  loggedBy: string;

  @ApiProperty({ example: 'uuid-del-ticket' })
  @IsUUID()
  ticketId: string;
}
