import { PartialType } from '@nestjs/swagger';
import { CreateVaultEntryDto } from './create-vault-entry.dto.js';

export class UpdateVaultEntryDto extends PartialType(CreateVaultEntryDto) {}
