import { Injectable, Res } from '@nestjs/common';
import ExcelJS from 'exceljs';
import { Response } from 'express';
import { Product } from '../products/product.entity';
import { Customer } from '../customers/customer.entity';
import { Invoice } from '../invoices/invoice.entity';
import { AuditLog } from '../audit/audit-log.entity';

interface ExportData {
  products: Product[];
  customers: Customer[];
  invoices: Invoice[];
  auditLogs: AuditLog[];
}

@Injectable()
export class ExcelExportService {
  private readonly CORPORATE_GREEN = 'FF14532d';
  private readonly HEADER_FONT = { bold: true, color: { argb: 'FFFFFFFF' } as any };
  private readonly HEADER_FILL = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: this.CORPORATE_GREEN },
  } as any;

  async generateExcelBuffer(data: ExportData): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Vevil System';
    workbook.created = new Date();

    // --- Hoja: Products ---
    await this.createProductsSheet(workbook, data.products);

    // --- Hoja: Customers ---
    await this.createCustomersSheet(workbook, data.customers);

    // --- Hoja: Invoices ---
    await this.createInvoicesSheet(workbook, data.invoices);

    // --- Hoja: Audit Log ---
    await this.createAuditSheet(workbook, data.auditLogs);

    // Auto-column width en todas las hojas
    workbook.eachSheet((sheet) => {
      sheet.columns.forEach((col) => {
        let maxLength = 10;
        col.eachCell({ includeEmpty: true }, (cell) => {
          const cellValue = cell.value?.toString() || '';
          maxLength = Math.max(maxLength, cellValue.length);
        });
        col.width = Math.min(maxLength + 2, 50);
      });
    });

    // writeBuffer() retorna Buffer en Node; as cast para satisfacer TS
    return await workbook.xlsx.writeBuffer() as unknown as Buffer;
  }

  private createProductsSheet(workbook: ExcelJS.Workbook, products: Product[]) {
    const sheet = workbook.addWorksheet('Products');

    sheet.columns = [
      { header: 'ID', key: 'id', width: 8 },
      { header: 'Nombre', key: 'name', width: 30 },
      { header: 'Tipo', key: 'type', width: 15 },
      { header: 'Descripción', key: 'description', width: 40 },
      { header: 'Precio', key: 'price', width: 15, numFmt: '"$"#,##0.00' },
      { header: 'Costo', key: 'costPrice', width: 15, numFmt: '"$"#,##0.00' },
      { header: 'Moneda', key: 'currency', width: 12 },
      { header: 'Stock', key: 'stock', width: 12 },
      { header: 'Stock Mín', key: 'minStock', width: 12 },
      { header: 'Categoría', key: 'category', width: 20 },
    ];

    this.applyHeaderStyle(sheet);

    products.forEach((p) => {
      sheet.addRow({
        id: p.id,
        name: p.name,
        type: p.type,
        description: p.description || '',
        price: Number(p.price),
        costPrice: p.costPrice ? Number(p.costPrice) : null,
        currency: p.currency,
        stock: p.stock,
        minStock: p.minStock,
        category: p.category || '',
      });
    });

    this.finalizeSheet(sheet, 'A1:J1');
  }

  private createCustomersSheet(workbook: ExcelJS.Workbook, customers: Customer[]) {
    const sheet = workbook.addWorksheet('Customers');

    sheet.columns = [
      { header: 'ID', key: 'id', width: 8 },
      { header: 'Nombre', key: 'name', width: 30 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Teléfonos', key: 'phones', width: 40 },
      { header: 'Calle', key: 'address_street', width: 30 },
      { header: 'Ciudad', key: 'address_city', width: 20 },
      { header: 'Provincia', key: 'address_province', width: 20 },
      { header: 'Código Postal', key: 'address_zip', width: 15 },
      { header: 'Tax ID (RUC)', key: 'tax_id', width: 20 },
      { header: 'Saldo Crédito', key: 'creditBalance', width: 18, numFmt: '"$"#,##0.00' },
    ];

    this.applyHeaderStyle(sheet);

    customers.forEach((c) => {
      const phonesStr = Array.isArray(c.phones)
        ? c.phones.map((p: any) => `${p.type}: ${p.number}`).join('; ')
        : String(c.phones || '');

      sheet.addRow({
        id: c.id,
        name: c.name,
        email: c.email || '',
        phones: phonesStr,
        address_street: c.address_street || '',
        address_city: c.address_city || '',
        address_province: c.address_province || '',
        address_zip: c.address_zip || '',
        tax_id: c.tax_id || '',
        creditBalance: Number(c.creditBalance),
      });
    });

    this.finalizeSheet(sheet, 'A1:J1');
  }

  private createInvoicesSheet(workbook: ExcelJS.Workbook, invoices: Invoice[]) {
    const sheet = workbook.addWorksheet('Invoices');

    sheet.columns = [
      { header: 'ID', key: 'id', width: 8 },
      { header: 'Cliente', key: 'customerName', width: 30 },
      { header: 'Fecha', key: 'date', width: 15, numFmt: 'dd/mm/yyyy' },
      { header: 'Total', key: 'total', width: 18, numFmt: '"$"#,##0.00' },
      { header: 'Moneda', key: 'currency', width: 12 },
      { header: 'Estado', key: 'status', width: 15 },
      { header: 'Items', key: 'itemCount', width: 10 },
    ];

    this.applyHeaderStyle(sheet);

    invoices.forEach((inv) => {
      const itemCount = inv.items?.length || 0;
      sheet.addRow({
        id: inv.id,
        customerName: inv.customer?.name || 'Sin cliente',
        date: inv.date ? new Date(inv.date) : null,
        total: Number(inv.total),
        currency: inv.currency,
        status: inv.status,
        itemCount: itemCount,
      });
    });

    this.finalizeSheet(sheet, 'A1:G1');
  }

  private createAuditSheet(workbook: ExcelJS.Workbook, auditLogs: AuditLog[]) {
    const sheet = workbook.addWorksheet('Audit Log');

    sheet.columns = [
      { header: 'ID', key: 'id', width: 8 },
      { header: 'Usuario', key: 'userEmail', width: 30 },
      { header: 'Usuario ID', key: 'userId', width: 25 },
      { header: 'Acción', key: 'action', width: 25 },
      { header: 'Entidad', key: 'entityType', width: 15 },
      { header: 'Entity ID', key: 'entityId', width: 15 },
      { header: 'IP', key: 'ip', width: 18 },
      { header: 'Fecha/Hora', key: 'createdAt', width: 25, numFmt: 'dd/mm/yyyy hh:mm:ss' },
    ];

    this.applyHeaderStyle(sheet);

    auditLogs.forEach((log) => {
      sheet.addRow({
        id: log.id,
        userEmail: log.userEmail || '',
        userId: log.userId || '',
        action: log.action,
        entityType: log.entityType,
        entityId: log.entityId || '',
        ip: log.ip || '',
        createdAt: log.createdAt ? new Date(log.createdAt) : null,
      });
    });

    this.finalizeSheet(sheet, 'A1:H1');
  }

  private applyHeaderStyle(sheet: ExcelJS.Worksheet) {
    const headerRow = sheet.getRow(1);
    headerRow.font = this.HEADER_FONT;
    headerRow.fill = this.HEADER_FILL;
    headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
  }

  private finalizeSheet(sheet: ExcelJS.Worksheet, filterRange: string) {
    sheet.autoFilter = filterRange;
    sheet.views = [{ state: 'frozen', ySplit: 1 }]; // Freeze header
  }
}
