import { IsEnum, IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTaskDto {
  @ApiProperty({ example: 'Investigar bug de login' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ example: 'Revisar logs del servidor y reproducir el error' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 120, description: 'Estimated time in minutes' })
  @IsOptional()
  @IsInt()
  @Min(1)
  estimatedMinutes?: number;

  @ApiProperty({ example: 'uuid-del-ticket' })
  @IsUUID()
  ticketId: string;
}
