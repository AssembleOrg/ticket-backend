import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TicketPriority } from '../../domain/enums/ticket-priority.enum.js';

export class CreateTicketDto {
  @ApiProperty({ example: 'No puedo iniciar sesión' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Cuando pongo mi usuario y contraseña me dice credenciales inválidas' })
  @IsString()
  description: string;

  @ApiPropertyOptional({ enum: TicketPriority, default: TicketPriority.MEDIUM })
  @IsOptional()
  @IsEnum(TicketPriority)
  priority?: TicketPriority;

  @ApiProperty({ example: 'uuid-del-cliente' })
  @IsUUID()
  clientId: string;

  @ApiProperty({ example: 'uuid-del-proyecto' })
  @IsUUID()
  projectId: string;
}
