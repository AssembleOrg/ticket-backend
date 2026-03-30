import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AllowedEmail, UserRole } from '../modules/auth/domain/allowed-email.entity.js';

const SEED_USERS = [
  { email: 'carlosjoelsalda@gmail.com', name: 'Carlos Salda', role: UserRole.ADMIN },
  { email: 'julychaves17@gmail.com', name: 'July Chaves', role: UserRole.ADMIN },
  { email: 'afuenzalida243@gmail.com', name: 'A. Fuenzalida', role: UserRole.RESPONSIBLE },
  { email: 'brianezequiel.reba@gmail.com', name: 'Brian Reba', role: UserRole.RESPONSIBLE },
  { email: 'xgonzalo.08.01@gmail.com', name: 'Gonzalo', role: UserRole.ADMIN },
];

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(AllowedEmail)
    private readonly allowedEmailRepo: Repository<AllowedEmail>,
  ) {}

  async onModuleInit() {
    for (const user of SEED_USERS) {
      const existing = await this.allowedEmailRepo.findOne({
        where: { email: user.email },
      });

      if (existing) {
        // Update role and name if changed
        if (existing.role !== user.role || existing.name !== user.name) {
          await this.allowedEmailRepo.update(existing.id, {
            role: user.role,
            name: user.name,
          });
          this.logger.log(`Updated user: ${user.email} (${user.role})`);
        }
      } else {
        await this.allowedEmailRepo.save(
          this.allowedEmailRepo.create({
            email: user.email,
            name: user.name,
            role: user.role,
            active: true,
          }),
        );
        this.logger.log(`Seeded user: ${user.email} (${user.role})`);
      }
    }
  }
}
