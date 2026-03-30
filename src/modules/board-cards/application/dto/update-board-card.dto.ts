import { PartialType } from '@nestjs/swagger';
import { CreateBoardCardDto } from './create-board-card.dto.js';

export class UpdateBoardCardDto extends PartialType(CreateBoardCardDto) {}
