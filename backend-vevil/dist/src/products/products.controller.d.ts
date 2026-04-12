import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { AuditService } from '../audit/audit.service';
export declare class ProductsController {
    private readonly productsService;
    private readonly auditService;
    constructor(productsService: ProductsService, auditService: AuditService);
    private userFromReq;
    create(createProductDto: CreateProductDto, req: any): Promise<import("./product.entity").Product>;
    findAll(pageStr?: string, limitStr?: string, search?: string, type?: string, category?: string): Promise<{
        data: import("./product.entity").Product[];
        total: number;
    } | import("./product.entity").Product[]>;
    findOne(id: string): Promise<import("./product.entity").Product>;
    update(id: string, updateProductDto: UpdateProductDto, req: any): Promise<import("./product.entity").Product>;
    remove(id: string, req: any): Promise<import("./product.entity").Product>;
}
