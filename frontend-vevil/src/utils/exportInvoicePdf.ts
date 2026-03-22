/**
 * Genera un PDF de una factura con jsPDF.
 * Usa datos de empresa desde Configuración (getCompanyConfig).
 */
import jsPDF from 'jspdf';
import type { Invoice } from '../services/api';
import { getCompanyConfig } from '../components/settings/Settings';

function formatDate(dateString: string): string {
    if (!dateString) return '';
    const d = new Date(dateString);
    return d.toLocaleDateString('es-PY', { year: 'numeric', month: 'long', day: 'numeric' });
}

function formatMoney(value: number, currency: string = 'PYG'): string {
    return `${currency} ${value.toLocaleString('es-PY', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export function exportInvoiceToPdf(invoice: Invoice): void {
    const company = getCompanyConfig();
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();
    let y = 20;
    const lineH = 6;
    const margin = 20;

    // Izquierda: FACTURA + N°
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('FACTURA', margin, y);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`N° ${String(invoice.id).padStart(7, '0')}`, margin, y + lineH + 2);

    // Derecha: Datos de empresa desde Configuración
    const rightX = pageW - margin;
    let yRight = y;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(company.name || 'Vevil - Sistema de Gestión', rightX, yRight, { align: 'right' });
    yRight += lineH;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    if (company.ruc) {
        doc.text(`RUC: ${company.ruc}`, rightX, yRight, { align: 'right' });
        yRight += lineH;
    }
    if (company.address) {
        doc.text(company.address, rightX, yRight, { align: 'right' });
        yRight += lineH;
    }
    if (company.city) {
        doc.text(company.city, rightX, yRight, { align: 'right' });
        yRight += lineH;
    }
    if (company.phone) {
        doc.text(company.phone, rightX, yRight, { align: 'right' });
        yRight += lineH;
    }
    if (company.email) {
        doc.text(company.email, rightX, yRight, { align: 'right' });
        yRight += lineH;
    }
    if (company.website) {
        doc.text(company.website, rightX, yRight, { align: 'right' });
    }
    y = Math.max(y + lineH + 4, yRight) + 8;

    // Cliente
    doc.setFont('helvetica', 'bold');
    doc.text('Cliente', margin, y);
    doc.setFont('helvetica', 'normal');
    y += lineH;
    doc.text(invoice.customer?.name ?? '—', margin, y);
    y += lineH;
    if (invoice.customer?.email) {
        doc.text(invoice.customer.email, margin, y);
        y += lineH;
    }
    if (invoice.customer?.tax_id) {
        doc.text(`RUC: ${invoice.customer.tax_id}`, margin, y);
        y += lineH;
    }
    y += 4;

    // Fecha y estado
    doc.text(`Fecha de emisión: ${formatDate(invoice.date)}`, margin, y);
    doc.text(`Estado: ${invoice.status === 'paid' ? 'Pagada' : invoice.status === 'pending' ? 'Pendiente' : 'Anulada'}`, pageW - margin, y, { align: 'right' });
    y += lineH + 8;

    // Tabla de ítems
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Detalle', margin, y);
    y += lineH + 2;

    const colW = { product: 80, qty: 22, price: 35, total: 40 };
    const tableX = margin;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('Producto', tableX, y);
    doc.text('Cant.', tableX + colW.product, y);
    doc.text('P. unit.', tableX + colW.product + colW.qty, y);
    doc.text('Subtotal', tableX + colW.product + colW.qty + colW.price, y);
    y += lineH + 2;

    doc.setFont('helvetica', 'normal');
    const currency = invoice.currency ?? 'PYG';
    (invoice.items || []).forEach((item) => {
        const price = Number(item.priceAtSale);
        const subtotal = price * item.quantity;
        doc.text(item.product?.name ?? `Producto #${item.productId}`, tableX, y);
        doc.text(String(item.quantity), tableX + colW.product, y);
        doc.text(formatMoney(price, currency), tableX + colW.product + colW.qty, y);
        doc.text(formatMoney(subtotal, currency), tableX + colW.product + colW.qty + colW.price, y);
        y += lineH;
    });
    y += 6;

    // Totales (IVA 10% Paraguay)
    const total = Number(invoice.total);
    const subtotal = total / 1.1;
    const iva = total - subtotal;
    doc.setFont('helvetica', 'normal');
    doc.text(`Subtotal:`, pageW - margin - 50, y);
    doc.text(formatMoney(subtotal, currency), pageW - margin, y, { align: 'right' });
    y += lineH;
    doc.text('IVA (10%):', pageW - margin - 50, y);
    doc.text(formatMoney(iva, currency), pageW - margin, y, { align: 'right' });
    y += lineH;
    doc.setFont('helvetica', 'bold');
    doc.text('Total:', pageW - margin - 50, y);
    doc.text(formatMoney(total, currency), pageW - margin, y, { align: 'right' });

    doc.save(`factura_${String(invoice.id).padStart(7, '0')}.pdf`);
}
