import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';
import { AllowedEmail } from './domain/allowed-email.entity.js';
import { SupabaseService } from './supabase.service.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly config: ConfigService,
    private readonly supabaseService: SupabaseService,
    @InjectRepository(AllowedEmail)
    private readonly allowedEmailRepo: Repository<AllowedEmail>,
  ) {}

  async login(email: string, password: string) {
    const allowed = await this.allowedEmailRepo.findOne({
      where: { email, active: true },
    });

    if (!allowed) {
      throw new UnauthorizedException('Email not authorized');
    }

    const supabase = createClient(
      this.config.get<string>('SUPABASE_URL')!,
      this.config.get<string>('SUPABASE_ANON_KEY')!,
    );

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return {
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      expiresIn: data.session.expires_in,
      user: {
        id: data.user.id,
        email: data.user.email,
      },
    };
  }

  async refresh(refreshToken: string) {
    const supabase = createClient(
      this.config.get<string>('SUPABASE_URL')!,
      this.config.get<string>('SUPABASE_ANON_KEY')!,
    );

    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error || !data.session) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return {
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      expiresIn: data.session.expires_in,
      user: {
        id: data.user!.id,
        email: data.user!.email,
      },
    };
  }

  async exchangeOAuthToken(accessToken: string) {
    // Verify the token with Supabase
    const user = await this.supabaseService.verifyToken(accessToken);
    if (!user || !user.email) {
      throw new UnauthorizedException('Invalid OAuth token');
    }

    // Check whitelist
    const allowed = await this.allowedEmailRepo.findOne({
      where: { email: user.email, active: true },
    });

    if (!allowed) {
      throw new UnauthorizedException('Email not authorized to access this system');
    }

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: allowed.name,
        role: allowed.role,
      },
    };
  }
}
