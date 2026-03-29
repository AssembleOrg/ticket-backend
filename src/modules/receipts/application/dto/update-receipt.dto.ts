import { PartialType } from '@nestjs/swagger';
import { CreateReceiptDto } from './create-receipt.dto.js';

export class UpdateReceiptDto extends PartialType(CreateReceiptDto) {}
