import { AuditService } from '../audit/audit.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './product.entity';
import { ProductsService } from './products.service';
export declare class ProductsController {
    private readonly productsService;
    private readonly auditService;
    constructor(productsService: ProductsService, auditService: AuditService);
    private userFromReq;
    create(createProductDto: CreateProductDto, req: any): Promise<Product>;
    findAll(pageStr?: string, limitStr?: string, search?: string, type?: string, category?: string): Promise<Product[] | {
        data: Product[];
        total: number;
    }>;
    findOne(id: string): Promise<Product>;
    update(id: string, updateProductDto: UpdateProductDto, req: any): Promise<Product>;
    remove(id: string, req: any): Promise<Product>;
}
