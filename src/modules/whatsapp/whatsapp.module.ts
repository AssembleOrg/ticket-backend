import { Module } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service.js';
import { WhatsappFlowService } from './whatsapp-flow.service.js';
import { WhatsappController } from './whatsapp.controller.js';
import { TicketsModule } from '../tickets/tickets.module.js';
import { ProjectsModule } from '../projects/projects.module.js';
import { ClientsModule } from '../clients/clients.module.js';

@Module({
  imports: [TicketsModule, ProjectsModule, ClientsModule],
  controllers: [WhatsappController],
  providers: [WhatsappService, WhatsappFlowService],
  exports: [WhatsappService],
})
export class WhatsappModule {}
