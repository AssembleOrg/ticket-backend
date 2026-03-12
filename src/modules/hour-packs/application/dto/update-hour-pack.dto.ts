import { IsBoolean, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateHourPackDto {
  @ApiPropertyOptional({ example: 15, description: 'Updated weekly hours' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  weeklyHours?: number;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @ApiPropertyOptional({ example: 'Ajuste solicitado por el cliente' })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional({ example: 'admin@pistech.com' })
  @IsOptional()
  @IsString()
  changedBy?: string;
}
