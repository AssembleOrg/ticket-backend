import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Receipt } from './domain/entities/receipt.entity.js';
import { ReceiptsController } from './receipts.controller.js';
import { ReceiptsService } from './application/receipts.service.js';
import { ReceiptsRepository } from './infrastructure/receipts.repository.js';

@Module({
  imports: [TypeOrmModule.forFeature([Receipt])],
  controllers: [ReceiptsController],
  providers: [ReceiptsService, ReceiptsRepository],
  exports: [ReceiptsService],
})
export class ReceiptsModule {}
