import { PartialType } from '@nestjs/swagger';
import { CreateResponsibleDto } from './create-responsible.dto.js';

export class UpdateResponsibleDto extends PartialType(CreateResponsibleDto) {}
