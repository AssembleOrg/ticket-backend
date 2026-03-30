import { IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateVaultEntryDto {
  @IsString()
  label: string;

  @IsString()
  @IsOptional()
  username?: string;

  @IsString()
  password: string;

  @IsString()
  @IsOptional()
  url?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsUUID()
  @IsOptional()
  clientId?: string;

  @IsUUID()
  @IsOptional()
  projectId?: string;
}
