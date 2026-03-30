import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { SupabaseService } from './supabase.service.js';
import { SupabaseAuthGuard } from './guards/supabase-auth.guard.js';
import { RolesGuard } from './guards/roles.guard.js';
import { AllowedEmail } from './domain/allowed-email.entity.js';
import { AllowedPhone } from './domain/allowed-phone.entity.js';
import { Responsible } from '../responsibles/domain/entities/responsible.entity.js';
import { Ticket } from '../tickets/domain/entities/ticket.entity.js';
import { SeedService } from '../../database/seed.service.js';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([AllowedEmail, AllowedPhone, Responsible, Ticket])],
  controllers: [AuthController],
  providers: [AuthService, SupabaseService, SupabaseAuthGuard, RolesGuard, SeedService],
  exports: [SupabaseService, SupabaseAuthGuard, RolesGuard, TypeOrmModule],
})
export class AuthModule {}
