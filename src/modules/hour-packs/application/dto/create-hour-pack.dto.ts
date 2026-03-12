import { IsNumber, IsUUID, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateHourPackDto {
  @ApiProperty({ example: 'uuid-del-cliente' })
  @IsUUID()
  clientId: string;

  @ApiProperty({ example: 10, description: 'Weekly hours allocated' })
  @IsNumber()
  @Min(1)
  weeklyHours: number;
}
