import { SuppliersService } from './suppliers.service';
import { Supplier } from './supplier.entity';
export declare class SuppliersController {
    private readonly suppliersService;
    constructor(suppliersService: SuppliersService);
    findAll(): Promise<Supplier[]>;
    findOne(id: string): Promise<Supplier | null>;
    create(data: Partial<Supplier>): Promise<Supplier>;
    update(id: string, data: Partial<Supplier>): Promise<Supplier | null>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
}
