import { StockMovementsService } from './stock-movements.service';
import { CreateStockMovementDto } from './dto/create-stock-movement.dto';
export declare class StockMovementsController {
    private readonly stockMovementsService;
    constructor(stockMovementsService: StockMovementsService);
    create(dto: CreateStockMovementDto): Promise<import("./stock-movement.entity").StockMovement>;
    findAll(productId?: string): Promise<import("./stock-movement.entity").StockMovement[]>;
    findOne(id: string): Promise<import("./stock-movement.entity").StockMovement>;
}
