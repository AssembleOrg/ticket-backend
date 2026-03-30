import { IsEnum, IsOptional, IsString, IsUUID, IsInt, IsDateString } from 'class-validator';
import { BoardColumn } from '../../domain/enums/board-column.enum.js';

export class CreateBoardCardDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(BoardColumn)
  @IsOptional()
  column?: BoardColumn;

  @IsString()
  @IsOptional()
  color?: string;

  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @IsInt()
  @IsOptional()
  position?: number;

  @IsUUID()
  responsibleId: string;
}
