import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { DatabaseModule } from './database/database.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { ClientsModule } from './modules/clients/clients.module.js';
import { ProjectsModule } from './modules/projects/projects.module.js';
import { TicketsModule } from './modules/tickets/tickets.module.js';
import { CommentsModule } from './modules/comments/comments.module.js';
import { TimeEntriesModule } from './modules/time-entries/time-entries.module.js';
import { HourPacksModule } from './modules/hour-packs/hour-packs.module.js';
import { AttachmentsModule } from './modules/attachments/attachments.module.js';
import { ResponsiblesModule } from './modules/responsibles/responsibles.module.js';
import { WhatsappModule } from './modules/whatsapp/whatsapp.module.js';
import { HealthModule } from './modules/health/health.module.js';
import { DashboardModule } from './modules/dashboard/dashboard.module.js';
import { TasksModule } from './modules/tasks/tasks.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    DatabaseModule,
    AuthModule,
    ClientsModule,
    ProjectsModule,
    TicketsModule,
    CommentsModule,
    TimeEntriesModule,
    HourPacksModule,
    AttachmentsModule,
    ResponsiblesModule,
    WhatsappModule,
    HealthModule,
    DashboardModule,
    TasksModule,
  ],
})
export class AppModule {}
