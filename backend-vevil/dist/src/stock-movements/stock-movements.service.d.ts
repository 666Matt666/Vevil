import { Repository } from 'typeorm';
import { StockMovement } from './stock-movement.entity';
import { CreateStockMovementDto } from './dto/create-stock-movement.dto';
import { ProductsService } from '../products/products.service';
export declare class StockMovementsService {
    private readonly movementRepo;
    private readonly productsService;
    constructor(movementRepo: Repository<StockMovement>, productsService: ProductsService);
    create(dto: CreateStockMovementDto): unknown;
    recordSale(productId: number, quantity: number, invoiceId: number): unknown;
    findAll(filters?: {
        productId?: number;
    }): unknown;
    findOne(id: number): unknown;
}
