import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from '@/users/users.service';
import { User } from '@/users/user.entity';
import { UserRole } from '@/users/entities/user-role.enum';

const E2E_ADMIN_EMAIL = 'admin@vevil.com';
const E2E_ADMIN_PASSWORD = 'admin123';
const E2E_ADMIN_NAME = 'Admin E2E';

/**
 * En desarrollo (o con SEED_E2E_ADMIN=true) crea el usuario admin@vevil.com
 * para que los E2E puedan hacer login. No se ejecuta en producción.
 * Si el usuario ya existe con rol user, lo actualiza a admin.
 */
@Injectable()
export class AppSeedService implements OnApplicationBootstrap {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  async onApplicationBootstrap() {
    const isProduction = this.configService.get<string>('NODE_ENV') === 'production';
    const forceSeed = this.configService.get<string>('SEED_E2E_ADMIN') === 'true';
    const port = String(process.env.PORT ?? this.configService.get<string | number>('PORT') ?? '');
    const isE2E = port === '3001';
    if (isProduction && !forceSeed && !isE2E) return;

    if (isE2E && process.env.NODE_ENV !== 'production') {
      console.log('[Vevil] Seed E2E: ejecutando (PORT=3001)');
    }
    const existing = await this.usersService.findOneByEmail(E2E_ADMIN_EMAIL).catch(() => undefined);

    if (existing) {
      const roleStr = String(existing.role ?? '').toLowerCase();
      try {
        await this.userRepo.update({ id: existing.id }, { role: UserRole.ADMIN });
        if (roleStr !== 'admin' && process.env.NODE_ENV !== 'production') {
          console.log('[Vevil] Usuario E2E admin actualizado a rol admin: admin@vevil.com');
        }
      } catch (e: any) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn('[Vevil] No se pudo actualizar rol admin E2E:', e?.message ?? e);
        }
      }
      return;
    }

    try {
      await this.usersService.create(
        {
          email: E2E_ADMIN_EMAIL,
          name: E2E_ADMIN_NAME,
          password: E2E_ADMIN_PASSWORD,
        },
        UserRole.ADMIN,
      );
      if (process.env.NODE_ENV !== 'production') {
        console.log('[Vevil] Usuario E2E admin creado: admin@vevil.com');
      }
    } catch (e: any) {
      if (e?.code !== '23505' && e?.message !== 'Email already exists') {
        if (process.env.NODE_ENV !== 'production') {
          console.warn('[Vevil] No se pudo crear admin E2E:', e?.message ?? e);
        }
      }
    }
  }
}
