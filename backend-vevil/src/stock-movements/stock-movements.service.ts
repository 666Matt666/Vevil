import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StockMovement } from './stock-movement.entity';
import { CreateStockMovementDto } from './dto/create-stock-movement.dto';
import { Product } from '../products/product.entity';
import { ProductsService } from '../products/products.service';

@Injectable()
export class StockMovementsService {
  constructor(
    @InjectRepository(StockMovement)
    private readonly movementRepo: Repository<StockMovement>,
    private readonly productsService: ProductsService,
  ) {}

  async create(dto: CreateStockMovementDto) {
    const product = await this.productsService.findOne(dto.productId);
    const currentStock = product.stock;
    const qty = dto.quantity;

    if (dto.type === 'in') {
      await this.productsService.update(product.id, {
        stock: currentStock + qty,
      });
    } else {
      if (currentStock < qty) {
        throw new BadRequestException(
          `Stock insuficiente para ${product.name}. Actual: ${currentStock}, solicitado: ${qty}`,
        );
      }
      await this.productsService.update(product.id, {
        stock: currentStock - qty,
      });
    }

    const movement = this.movementRepo.create({
      productId: product.id,
      product,
      type: dto.type,
      quantity: qty,
      reason: dto.reason,
      note: dto.note ?? null,
      invoiceId: null,
    });
    return this.movementRepo.save(movement);
  }

  /** Usado por InvoicesService al crear una factura: registra la salida por venta. */
  async recordSale(productId: number, quantity: number, invoiceId: number) {
    const product = await this.productsService.findOne(productId);
    const movement = this.movementRepo.create({
      productId: product.id,
      product,
      type: 'out',
      quantity,
      reason: 'sale',
      note: null,
      invoiceId,
    });
    return this.movementRepo.save(movement);
  }

  async findAll(filters?: { productId?: number }) {
    const qb = this.movementRepo
      .createQueryBuilder('m')
      .leftJoinAndSelect('m.product', 'product')
      .orderBy('m.createdAt', 'DESC');

    if (filters?.productId != null) {
      qb.andWhere('m.productId = :productId', { productId: filters.productId });
    }
    return qb.getMany();
  }

  async findOne(id: number) {
    const m = await this.movementRepo.findOne({
      where: { id },
      relations: ['product'],
    });
    if (!m) throw new NotFoundException(`Movimiento ${id} no encontrado`);
    return m;
  }
}
