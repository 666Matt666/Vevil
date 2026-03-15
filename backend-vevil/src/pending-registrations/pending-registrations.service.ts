import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { PendingRegistration } from './pending-registration.entity';
import { UsersService } from '@/users/users.service';
import { UserRole } from '@/users/entities/user-role.enum';
import { MailService } from '@/mail/mail.service';
import { ConfigService } from '@nestjs/config';

const CONFIRMATION_EXPIRES_HOURS = 24;

@Injectable()
export class PendingRegistrationsService {
  constructor(
    @InjectRepository(PendingRegistration)
    private readonly repo: Repository<PendingRegistration>,
    private readonly usersService: UsersService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
  ) {}

  async createRequest(data: {
    email: string;
    name: string;
    lastName?: string;
    gender?: 'male' | 'female';
  }): Promise<{ message: string }> {
    const email = data.email.trim().toLowerCase();
    const existingUser = await this.usersService.findOneByEmail(email);
    if (existingUser) {
      throw new ConflictException('Ya existe una cuenta con ese correo.');
    }

    const existing = await this.repo.findOne({ where: { email } });
    if (existing) {
      if (existing.status === 'pending_email') {
        // Regenerar token y reenviar email
        const token = crypto.randomBytes(32).toString('hex');
        const expires = new Date(Date.now() + CONFIRMATION_EXPIRES_HOURS * 60 * 60 * 1000);
        await this.repo.update(existing.id, {
          emailConfirmationToken: token,
          emailConfirmationExpires: expires,
          name: data.name,
          lastName: data.lastName ?? existing.lastName,
          gender: data.gender ?? existing.gender,
        });
        await this.sendConfirmationEmail(email, token);
        return { message: 'Si ya solicitaste el registro, te enviamos de nuevo el correo de confirmación.' };
      }
      if (existing.status === 'pending_approval') {
        return { message: 'Ya tienes una solicitud en revisión. Un administrador la aprobará pronto.' };
      }
      if (existing.status === 'rejected') {
        throw new BadRequestException('Tu solicitud fue rechazada. Contacta al administrador si querés intentar de nuevo.');
      }
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + CONFIRMATION_EXPIRES_HOURS * 60 * 60 * 1000);
    await this.repo.save(
      this.repo.create({
        email,
        name: data.name,
        lastName: data.lastName,
        gender: data.gender,
        emailConfirmationToken: token,
        emailConfirmationExpires: expires,
        status: 'pending_email',
      }),
    );
    await this.sendConfirmationEmail(email, token);
    return { message: 'Revisá tu correo y hacé clic en el enlace para confirmar tu solicitud de registro.' };
  }

  private async sendConfirmationEmail(email: string, token: string): Promise<void> {
    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:5173';
    const link = `${frontendUrl.replace(/\/$/, '')}/confirm-registration?token=${token}`;
    await this.mailService.sendRegistrationConfirmationEmail(email, link);
  }

  async confirmEmail(token: string): Promise<{ message: string }> {
    const pending = await this.repo.findOne({
      where: { emailConfirmationToken: token, status: 'pending_email' },
    });
    if (!pending) {
      throw new BadRequestException('El enlace no es válido o ya fue utilizado.');
    }
    if (pending.emailConfirmationExpires && new Date() > pending.emailConfirmationExpires) {
      throw new BadRequestException('El enlace expiró. Solicitá el registro de nuevo.');
    }
    await this.repo.update(pending.id, {
      status: 'pending_approval',
      emailConfirmedAt: new Date(),
      emailConfirmationToken: undefined,
      emailConfirmationExpires: undefined,
    });
    return { message: 'Tu correo fue confirmado. Un administrador revisará tu solicitud y te enviará un correo para crear tu contraseña.' };
  }

  async findAllPending(): Promise<PendingRegistration[]> {
    return this.repo.find({
      where: { status: 'pending_approval' },
      order: { createdAt: 'ASC' },
    });
  }

  async countPending(): Promise<number> {
    return this.repo.count({ where: { status: 'pending_approval' } });
  }

  async approve(id: string, role: UserRole): Promise<{ message: string }> {
    const pending = await this.repo.findOne({ where: { id, status: 'pending_approval' } });
    if (!pending) {
      throw new NotFoundException('Solicitud no encontrada o ya fue procesada.');
    }
    const tempPassword = crypto.randomBytes(16).toString('hex');
    await this.usersService.create(
      {
        email: pending.email,
        name: pending.name,
        lastName: pending.lastName,
        gender: pending.gender,
        password: tempPassword,
        role,
      },
      role,
    );
    const setPasswordToken = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 días
    await this.usersService.setResetPasswordToken(pending.email, setPasswordToken, expires);
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:5173';
    const setPasswordLink = `${frontendUrl.replace(/\/$/, '')}/reset-password?token=${setPasswordToken}`;
    await this.mailService.sendSetPasswordEmail(pending.email, setPasswordLink);
    await this.repo.update(id, { status: 'approved' });
    return { message: 'Usuario aprobado. Se envió un correo para que cree su contraseña.' };
  }

  async reject(id: string): Promise<{ message: string }> {
    const pending = await this.repo.findOne({ where: { id, status: 'pending_approval' } });
    if (!pending) {
      throw new NotFoundException('Solicitud no encontrada o ya fue procesada.');
    }
    await this.repo.update(id, { status: 'rejected' });
    return { message: 'Solicitud rechazada.' };
  }
}
