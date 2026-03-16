/**
 * Exporta listados a CSV (UTF-8 con BOM para Excel).
 */
import type { Invoice, Customer, Product } from '../services/api';

function escapeCsvCell(value: string): string {
    const s = String(value ?? '').replace(/"/g, '""');
    return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s}"` : s;
}

function downloadCsv(content: string, filename: string): void {
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + content], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

/** Formato de fecha por defecto para CSV (YYYY-MM-DD, ideal para Excel). */
function defaultFormatDate(dateString: string): string {
    return dateString ? dateString.slice(0, 10) : '';
}

export function exportInvoicesToCsv(
    invoices: Invoice[],
    formatInvoiceNumber: (id: number) => string,
    formatDate: (dateString: string) => string = defaultFormatDate,
): void {
    const headers = ['Número', 'Fecha', 'Cliente', 'Email', 'RUC', 'Total', 'Moneda', 'Estado'];
    const rows = invoices.map((inv) => [
        formatInvoiceNumber(inv.id),
        formatDate(inv.date),
        inv.customer?.name ?? '',
        inv.customer?.email ?? '',
        inv.customer?.tax_id ?? '',
        String(inv.total ?? ''),
        inv.currency ?? 'PYG',
        inv.status ?? 'pending',
    ]);
    const csvContent = [headers.map(escapeCsvCell).join(','), ...rows.map((r) => r.map(escapeCsvCell).join(','))].join('\n');
    downloadCsv(csvContent, `facturas_${new Date().toISOString().slice(0, 10)}.csv`);
}

/** Exporta clientes a CSV (listado filtrado). */
export function exportCustomersToCsv(customers: Customer[], getMainPhone: (c: Customer) => string): void {
    const headers = ['ID', 'Nombre', 'Email', 'Teléfono', 'Departamento', 'RUC', 'Ciudad', 'Dirección'];
    const rows = customers.map((c) => [
        String(c.id),
        c.name ?? '',
        c.email ?? '',
        getMainPhone(c),
        c.address_province ?? '',
        c.tax_id ?? '',
        c.address_city ?? '',
        c.address_street ?? '',
    ]);
    const csvContent = [headers.map(escapeCsvCell).join(','), ...rows.map((r) => r.map(escapeCsvCell).join(','))].join('\n');
    downloadCsv(csvContent, `clientes_${new Date().toISOString().slice(0, 10)}.csv`);
}

/** Exporta productos a CSV (listado filtrado). */
export function exportProductsToCsv(
    products: Product[],
    getTypeLabel: (type: string) => string,
    getCategoryLabel: (category: string) => string,
): void {
    const headers = ['ID', 'Nombre', 'Tipo', 'Categoría', 'Precio', 'Moneda', 'Costo', 'Stock', 'Stock mín.', 'Descripción'];
    const rows = products.map((p) => [
        String(p.id),
        p.name ?? '',
        getTypeLabel(p.type),
        getCategoryLabel(p.category ?? ''),
        String(p.price ?? ''),
        p.currency ?? 'PYG',
        p.costPrice != null ? String(p.costPrice) : '',
        String(p.stock ?? ''),
        String(p.minStock ?? ''),
        p.description ?? '',
    ]);
    const csvContent = [headers.map(escapeCsvCell).join(','), ...rows.map((r) => r.map(escapeCsvCell).join(','))].join('\n');
    downloadCsv(csvContent, `productos_${new Date().toISOString().slice(0, 10)}.csv`);
}
