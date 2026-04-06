import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { AuditService } from '../audit/audit.service';
export declare class ProductsController {
    private readonly productsService;
    private readonly auditService;
    constructor(productsService: ProductsService, auditService: AuditService);
    private userFromReq;
    create(createProductDto: CreateProductDto, req: any): unknown;
    findAll(pageStr?: string, limitStr?: string, search?: string, type?: string, category?: string): unknown;
    findOne(id: string): unknown;
    update(id: string, updateProductDto: UpdateProductDto, req: any): unknown;
    remove(id: string, req: any): unknown;
}
