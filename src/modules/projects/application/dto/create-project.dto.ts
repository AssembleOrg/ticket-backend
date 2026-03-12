import { IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProjectDto {
  @ApiProperty({ example: 'Sistema de Ventas' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Sistema principal de ventas online' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'uuid-del-cliente' })
  @IsUUID()
  clientId: string;
}
