import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { SupabaseService } from '../supabase.service.js';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AllowedEmail } from '../domain/allowed-email.entity.js';

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  constructor(
    private readonly supabaseService: SupabaseService,
    @InjectRepository(AllowedEmail)
    private readonly allowedEmailRepo: Repository<AllowedEmail>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException('Missing authorization token');
    }

    const user = await this.supabaseService.verifyToken(token);
    if (!user) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    const allowed = await this.allowedEmailRepo.findOne({
      where: { email: user.email, active: true },
    });

    if (!allowed) {
      throw new UnauthorizedException('Email not authorized');
    }

    (request as any).user = {
      ...user,
      role: allowed.role,
      name: allowed.name,
    };
    return true;
  }

  private extractToken(request: Request): string | null {
    // 1. Try Authorization header
    const auth = request.headers.authorization;
    if (auth) {
      const [type, token] = auth.split(' ');
      if (type === 'Bearer' && token) return token;
    }

    // 2. Try cookie
    return (request as any).cookies?.access_token ?? null;
  }
}
