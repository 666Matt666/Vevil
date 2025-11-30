import { Repository, DataSource } from 'typeorm';
import { Invoice } from './invoice.entity';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { ProductsService } from '../products/products.service';
import { CustomersService } from '../customers/customers.service';
export declare class InvoicesService {
    private invoicesRepository;
    private productsService;
    private customersService;
    private dataSource;
    constructor(invoicesRepository: Repository<Invoice>, productsService: ProductsService, customersService: CustomersService, dataSource: DataSource);
    create(createInvoiceDto: CreateInvoiceDto): Promise<Invoice>;
    findAll(): Promise<Invoice[]>;
    findOne(id: number): Promise<Invoice>;
}
