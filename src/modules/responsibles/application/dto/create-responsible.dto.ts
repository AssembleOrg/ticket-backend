import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateResponsibleDto {
  @ApiProperty({ example: 'Juan Pérez' })
  @IsString()
  name: string;
}
