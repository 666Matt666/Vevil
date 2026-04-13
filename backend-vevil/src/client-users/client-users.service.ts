import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientUser } from './client-user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ClientUsersService {
    constructor(
        @InjectRepository(ClientUser)
        private clientUsersRepository: Repository<ClientUser>,
    ) {}

    async register(email: string, password: string, customerId?: number): Promise<ClientUser> {
        const existing = await this.clientUsersRepository.findOne({ where: { email: email.toLowerCase() } });
        if (existing) {
            throw new BadRequestException('Ya existe una cuenta con este email');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const clientUser = this.clientUsersRepository.create({
            email: email.toLowerCase(),
            password: hashedPassword,
            customerId,
        });
        
        return this.clientUsersRepository.save(clientUser);
    }

    async validate(email: string, password: string): Promise<ClientUser | null> {
        const clientUser = await this.clientUsersRepository.findOne({ 
            where: { email: email.toLowerCase() },
            relations: ['customer']
        });
        
        if (!clientUser || !clientUser.isActive) {
            return null;
        }

        const isValid = await bcrypt.compare(password, clientUser.password);
        if (!isValid) {
            return null;
        }

        return clientUser;
    }

    async findByEmail(email: string): Promise<ClientUser | null> {
        return this.clientUsersRepository.findOne({ 
            where: { email: email.toLowerCase() },
            relations: ['customer']
        });
    }

    async findById(id: number): Promise<ClientUser | null> {
        return this.clientUsersRepository.findOne({ 
            where: { id },
            relations: ['customer']
        });
    }

    async updateName(id: number, name: string): Promise<void> {
        await this.clientUsersRepository.update(id, { name });
    }
}