import { IsArray, IsOptional, IsString } from 'class-validator';

export class CreateWikiPageDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];
}
