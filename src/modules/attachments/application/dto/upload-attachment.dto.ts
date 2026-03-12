import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class UploadAttachmentDto {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  ticketId: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  uploadedBy?: string;
}
