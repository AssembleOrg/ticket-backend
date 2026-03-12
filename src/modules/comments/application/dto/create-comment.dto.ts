import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({ example: 'Ya probé reiniciar y sigue igual' })
  @IsString()
  content: string;

  @ApiProperty({ example: 'Juan Pérez' })
  @IsString()
  authorName: string;

  @ApiPropertyOptional({ example: 'client', enum: ['client', 'internal'] })
  @IsOptional()
  @IsString()
  authorType?: string;

  @ApiProperty({ example: 'uuid-del-ticket' })
  @IsUUID()
  ticketId: string;
}
