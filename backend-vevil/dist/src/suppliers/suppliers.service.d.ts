import { Repository } from 'typeorm';
import { Supplier } from './supplier.entity';
export declare class SuppliersService {
    private suppliersRepository;
    constructor(suppliersRepository: Repository<Supplier>);
    findAll(): Promise<Supplier[]>;
    findOne(id: number): Promise<Supplier | null>;
    create(data: Partial<Supplier>): Promise<Supplier>;
    update(id: number, data: Partial<Supplier>): Promise<Supplier | null>;
    remove(id: number): Promise<void>;
}
