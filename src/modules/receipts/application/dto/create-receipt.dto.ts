import { IsString, IsOptional, IsArray, IsNumber, ValidateNested, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class ReceiptItemDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  quantity: number;

  @ApiProperty({ example: '001' })
  @IsString()
  code: string;

  @ApiProperty({ example: 'Pago por servidores' })
  @IsString()
  description: string;

  @ApiProperty({ example: 63500 })
  @IsNumber()
  unitPrice: number;

  @ApiProperty({ example: 0 })
  @IsNumber()
  taxPercent: number;

  @ApiProperty({ example: 0 })
  @IsNumber()
  discountPercent: number;
}

export class CreateReceiptDto {
  @ApiProperty({ example: 'PISTECH' })
  @IsString()
  companyName: string;

  @ApiPropertyOptional({ example: 'Contreras 575, Florencio Varela, Buenos Aires' })
  @IsOptional()
  @IsString()
  companyAddress?: string;

  @ApiPropertyOptional({ example: '1138207230' })
  @IsOptional()
  @IsString()
  companyPhone?: string;

  @ApiProperty({ example: '2026-03-28' })
  @IsDateString()
  paymentDate: string;

  @ApiProperty({ example: 'Transferencia Bancaria' })
  @IsString()
  paymentMethod: string;

  @ApiProperty({ example: 'MERY GARCIA' })
  @IsString()
  clientName: string;

  @ApiProperty({ type: [ReceiptItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReceiptItemDto)
  items: ReceiptItemDto[];
}
