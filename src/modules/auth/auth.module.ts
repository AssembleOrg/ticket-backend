import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { SupabaseService } from './supabase.service.js';
import { SupabaseAuthGuard } from './guards/supabase-auth.guard.js';
import { AllowedEmail } from './domain/allowed-email.entity.js';
import { AllowedPhone } from './domain/allowed-phone.entity.js';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([AllowedEmail, AllowedPhone])],
  controllers: [AuthController],
  providers: [AuthService, SupabaseService, SupabaseAuthGuard],
  exports: [SupabaseService, SupabaseAuthGuard, TypeOrmModule],
})
export class AuthModule {}
