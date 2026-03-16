import { Repository } from 'typeorm';
import { StockMovement } from './stock-movement.entity';
import { CreateStockMovementDto } from './dto/create-stock-movement.dto';
import { ProductsService } from '../products/products.service';
export declare class StockMovementsService {
    private readonly movementRepo;
    private readonly productsService;
    constructor(movementRepo: Repository<StockMovement>, productsService: ProductsService);
    create(dto: CreateStockMovementDto): Promise<StockMovement>;
    recordSale(productId: number, quantity: number, invoiceId: number): Promise<StockMovement>;
    findAll(filters?: {
        productId?: number;
    }): Promise<StockMovement[]>;
    findOne(id: number): Promise<StockMovement>;
}
