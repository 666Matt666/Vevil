import { Repository } from 'typeorm';
import { ClientUser } from './client-user.entity';
export declare class ClientUsersService {
    private clientUsersRepository;
    constructor(clientUsersRepository: Repository<ClientUser>);
    register(email: string, password: string, customerId?: number): Promise<ClientUser>;
    validate(email: string, password: string): Promise<ClientUser | null>;
    findByEmail(email: string): Promise<ClientUser | null>;
    findById(id: number): Promise<ClientUser | null>;
    updateName(id: number, name: string): Promise<void>;
}
