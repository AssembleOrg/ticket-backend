import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AllowedEmail, UserRole } from '../modules/auth/domain/allowed-email.entity.js';
import { Responsible } from '../modules/responsibles/domain/entities/responsible.entity.js';
import { Ticket } from '../modules/tickets/domain/entities/ticket.entity.js';

// Map old misspelled names to correct canonical email
const LEGACY_NAME_MAP: Record<string, string> = {
  'raba': 'brianezequiel.reba@gmail.com',
};

const SEED_USERS = [
  { email: 'carlosjoelsalda@gmail.com', name: 'Charly', role: UserRole.ADMIN },
  { email: 'julychaves17@gmail.com', name: 'July', role: UserRole.ADMIN },
  { email: 'afuenzalida243@gmail.com', name: 'Aaron', role: UserRole.RESPONSIBLE },
  { email: 'brianezequiel.reba@gmail.com', name: 'Reba', role: UserRole.RESPONSIBLE },
  { email: 'xgonzalo.08.01@gmail.com', name: 'Gonza', role: UserRole.ADMIN },
];

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(AllowedEmail)
    private readonly allowedEmailRepo: Repository<AllowedEmail>,
    @InjectRepository(Responsible)
    private readonly responsibleRepo: Repository<Responsible>,
    @InjectRepository(Ticket)
    private readonly ticketRepo: Repository<Ticket>,
  ) {}

  async onModuleInit() {
    // Seed allowed emails
    for (const user of SEED_USERS) {
      const existing = await this.allowedEmailRepo.findOne({
        where: { email: user.email },
      });

      if (existing) {
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

    // Seed responsibles and merge duplicates
    for (const user of SEED_USERS) {
      // Find by email first (the canonical one)
      let canonical = await this.responsibleRepo.findOne({
        where: { email: user.email },
      });

      if (!canonical) {
        canonical = await this.responsibleRepo.save(
          this.responsibleRepo.create({
            name: user.name,
            email: user.email,
          }),
        );
        this.logger.log(`Seeded responsible: ${user.name} (${user.email})`);
      } else if (canonical.name !== user.name) {
        await this.responsibleRepo.update(canonical.id, { name: user.name });
        this.logger.log(`Updated responsible: ${user.name}`);
      }

    }

    // Cleanup: merge all responsibles without email into their canonical match
    const orphans = await this.responsibleRepo
      .createQueryBuilder('r')
      .where('r.email IS NULL OR r.email = :empty', { empty: '' })
      .getMany();

    for (const orphan of orphans) {
      // Find the best canonical match by name (case-insensitive, partial)
      const nameLower = orphan.name.toLowerCase();
      const allWithEmail = await this.responsibleRepo
        .createQueryBuilder('r')
        .where('r.email IS NOT NULL')
        .andWhere("r.email != ''")
        .getMany();

      // Check legacy name map first, then try name matching
      const legacyEmail = LEGACY_NAME_MAP[nameLower];
      const match = legacyEmail
        ? allWithEmail.find((r) => r.email === legacyEmail)
        : allWithEmail.find(
            (r) => r.name.toLowerCase() === nameLower ||
                   r.name.toLowerCase().includes(nameLower) ||
                   nameLower.includes(r.name.toLowerCase()),
          );

      if (match) {
        await this.ticketRepo.update(
          { responsibleId: orphan.id },
          { responsibleId: match.id },
        );
        await this.responsibleRepo.delete(orphan.id);
        this.logger.log(`Merged orphan "${orphan.name}" → "${match.name}" (${match.id})`);
      } else {
        // No match found, just delete the orphan (reassign tickets to null)
        await this.ticketRepo.update(
          { responsibleId: orphan.id },
          { responsibleId: undefined as any },
        );
        await this.responsibleRepo.delete(orphan.id);
        this.logger.log(`Deleted orphan responsible "${orphan.name}" (no match found)`);
      }
    }
  }
}
