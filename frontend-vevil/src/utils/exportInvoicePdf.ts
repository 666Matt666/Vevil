/**
 * Genera un PDF de una factura con jsPDF.
 * Usa datos de empresa desde Configuración (getCompanyConfig).
 * Si no hay logo configurado, usa el logo por defecto de /logoVevil.jpg.
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

export function exportInvoiceToPdf(invoice: Invoice, download: boolean = true): void {
    const company = getCompanyConfig();
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();
    let y = 15;
    const lineH = 6;
    const margin = 20;

    // === HEADER CENTRADO ===
    const centerX = pageW / 2;

    // Logo (centrado, intenta ambos orígenes)
    const logoTry = [company.logoUrl, '/logoVevil.jpg'];
    let logoPlaced = false;
    for (let i = 0; i < logoTry.length && !logoPlaced; i++) {
        const logoUrl = logoTry[i];
        if (!logoUrl) continue;
        try {
            const logoSize = 30;
            doc.addImage(logoUrl, 'JPEG', centerX - logoSize / 2, y, logoSize, logoSize);
            y += logoSize + 8;
            logoPlaced = true;
        } catch (e) {
            console.warn('Error loading logo from', logoUrl, e);
        }
    }

    // Nombre de empresa (centrado)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(company.name || 'Vevil - Sistema de Gestión', centerX, y, { align: 'center' });
    y += lineH;

    // Datos de empresa (centrados, pequeños)
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const companyInfo: string[] = [];
    if (company.ruc) companyInfo.push(`RUC: ${company.ruc}`);
    if (company.address) companyInfo.push(company.address);
    if (company.city) companyInfo.push(company.city);
    if (company.phone) companyInfo.push(`Tel: ${company.phone}`);
    if (company.email) companyInfo.push(`Email: ${company.email}`);
    if (company.website) companyInfo.push(company.website);

    companyInfo.forEach((line) => {
        doc.text(line, centerX, y, { align: 'center' });
        y += lineH;
    });

    y += 6;

    // === TÍTULO FACTURA + NÚMERO (derecha) ===
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.text('FACTURA', pageW - margin, y, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`N° ${String(invoice.id).padStart(7, '0')}`, pageW - margin, y + 6, { align: 'right' });
    y += 18;

    // === DATOS FACTURA (fecha + estado) ===
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Fecha de emisión: ${formatDate(invoice.date)}`, margin, y);
    const statusText = invoice.status === 'paid' ? 'Pagada' : invoice.status === 'pending' ? 'Pendiente' : 'Anulada';
    doc.text(`Estado: ${statusText}`, pageW - margin, y, { align: 'right' });
    y += lineH + 8;

    // === CLIENTE ===
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Cliente', margin, y);
    y += lineH;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(invoice.customer?.name || '—', margin, y);
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

    // === TABLA DE ÍTEMS ===
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

    // === TOTALES (alineados a la derecha) ===
    const total = Number(invoice.total);
    const subtotalVal = total / 1.1;
    const iva = total - subtotalVal;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Subtotal:`, pageW - margin - 50, y);
    doc.text(formatMoney(subtotalVal, currency), pageW - margin, y, { align: 'right' });
    y += lineH;
    doc.text('IVA (10%):', pageW - margin - 50, y);
    doc.text(formatMoney(iva, currency), pageW - margin, y, { align: 'right' });
    y += lineH;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Total:', pageW - margin - 50, y);
    doc.text(formatMoney(total, currency), pageW - margin, y, { align: 'right' });

    if (download) {
        doc.save(`factura_${String(invoice.id).padStart(7, '0')}.pdf`);
    } else {
        const pdfBlob = doc.output('blob');
        const url = URL.createObjectURL(pdfBlob);
        window.open(url, '_blank');
    }
}
