 import React, { useState, useEffect, useMemo, useCallback } from 'react';
 import { motion } from 'framer-motion';
 import { useNavigate, useLocation } from 'react-router-dom';
 import { invoicesApi, Invoice, customersApi, Customer, productsApi, Product, getErrorMessage } from '../../services/api';
 import { getEnabledCurrencies, formatMoney, getInvoiceConfig, getCompanyConfig, formatInvoiceNumber } from '../settings/Settings';
 import { TableSkeleton } from '../ui/TableSkeleton';
 import { ErrorMessage } from '../ui/ErrorMessage';
 import { SuccessMessage } from '../ui/SuccessMessage';
 import { Pagination } from '../ui/Pagination';
 import { ConfirmModal } from '../ui/ConfirmModal';
 import { exportInvoiceToPdf } from '../../utils/exportInvoicePdf';
 import { fadeInUp } from '../../hooks/useAnimations';
 import { useToast } from '../../hooks/useToast';

const PAGE_SIZE_OPTIONS = [10, 20, 50];

const buttonStyle: React.CSSProperties = {
    padding: '8px 16px',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s'
};

const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    boxSizing: 'border-box'
};

const cardStyle: React.CSSProperties = {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '24px',
};

const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '14px',
    fontWeight: 500,
    color: '#374151',
    marginBottom: '6px'
};

// Line item for invoice form
interface InvoiceFormItem {
    productId: number;
    quantity: number;
    discountPercent?: number;
}

// Estados de pago
type PaymentStatus = 'paid' | 'pending' | 'cancelled';

const statusLabels: Record<PaymentStatus, string> = {
    paid: 'Pagada',
    pending: 'Pendiente',
    cancelled: 'Anulada'
};

const statusColors: Record<PaymentStatus, { bg: string; text: string }> = {
    paid: { bg: '#dcfce7', text: '#166534' },
    pending: { bg: '#fef3c7', text: '#92400e' },
    cancelled: { bg: '#fee2e2', text: '#991b1b' }
};

const InvoiceList: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { showToast } = useToast();
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [totalInvoices, setTotalInvoices] = useState(0);
    const [invoicePage, setInvoicePage] = useState(1);
    const [invoicePageSize, setInvoicePageSize] = useState(20);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [invoiceToCancel, setInvoiceToCancel] = useState<Invoice | null>(null);
    const [cancelling, setCancelling] = useState(false);
    
    // Verificar si es admin
    const [isAdmin, setIsAdmin] = useState(false);
    
    // Modal de edición
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
    const [editCustomerId, setEditCustomerId] = useState<string>('');
    const [editCurrency, setEditCurrency] = useState<string>('PYG');
    const [editStatus, setEditStatus] = useState<string>('pending');
    const [editItems, setEditItems] = useState<{ productId: number; quantity: number }[]>([]);
    
    // Modal de eliminación
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletingInvoice, setDeletingInvoice] = useState<Invoice | null>(null);
    const [deleting, setDeleting] = useState(false);
    
    // Form state
    const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
    const [selectedCurrency, setSelectedCurrency] = useState<string>('PYG');
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('cash');
    const [items, setItems] = useState<InvoiceFormItem[]>([{ productId: 0, quantity: 1 }]);
    const [invoiceNotes, setInvoiceNotes] = useState<string>('');
    const [invoiceDiscount, setInvoiceDiscount] = useState<number>(0);
    const [invoiceDueDate, setInvoiceDueDate] = useState<string>('');
    const [sendEmailToCustomer, setSendEmailToCustomer] = useState<boolean>(true);
    
    // Validation errors state
    const [formErrors, setFormErrors] = useState<{
        customer?: string;
        items?: string;
    }>({});

    // Plantillas de facturas
    const [invoiceTemplates, setInvoiceTemplates] = useState<{name: string; items: {productId: number; quantity: number}[]; paymentMethod: string; currency: string}[]>(() => {
        const saved = localStorage.getItem('invoice_templates');
        return saved ? JSON.parse(saved) : [];
    });
    const [showTemplateDropdown, setShowTemplateDropdown] = useState(false);

    // Filtros
    const [searchText, setSearchText] = useState('');
    const [filterCustomerId, setFilterCustomerId] = useState('all');
    const [filterStatus, setFilterStatus] = useState<'all' | PaymentStatus>('all');
    const [filterDateFrom, setFilterDateFrom] = useState('');
    const [filterDateTo, setFilterDateTo] = useState('');

    const invoiceConfig = getInvoiceConfig();
    const companyConfig = getCompanyConfig();

    const getInvoiceStatus = (invoice: Invoice): PaymentStatus => {
        const s = invoice.status;
        return (s === 'pending' || s === 'paid' || s === 'cancelled' ? s : 'paid') as PaymentStatus;
    };

    const changeInvoiceStatus = async (invoiceId: number, status: PaymentStatus) => {
        try {
            await invoicesApi.updateStatus(invoiceId, status);
            setInvoices(prev => prev.map(inv => inv.id === invoiceId ? { ...inv, status } : inv));
            showToast('Estado de factura actualizado', 'success');
        } catch (err) {
            showToast(getErrorMessage(err, 'Error al actualizar estado'), 'error');
        }
    };

    const handleStatusChange = (invoice: Invoice, newStatus: PaymentStatus) => {
        if (newStatus === 'cancelled') {
            setInvoiceToCancel(invoice);
            return;
        }
        changeInvoiceStatus(invoice.id, newStatus);
    };

    const handleConfirmCancelInvoice = async () => {
        if (!invoiceToCancel) return;
        try {
            setCancelling(true);
            await invoicesApi.updateStatus(invoiceToCancel.id, 'cancelled');
            setInvoices(prev => prev.map(inv => inv.id === invoiceToCancel.id ? { ...inv, status: 'cancelled' } : inv));
            setInvoiceToCancel(null);
            showToast('Factura anulada exitosamente', 'success');
        } catch (err) {
            showToast(getErrorMessage(err, 'Error al anular factura'), 'error');
        } finally {
            setCancelling(false);
        }
    };

    // Funciones para editar factura
    const handleEditInvoice = (invoice: Invoice) => {
        setEditingInvoice(invoice);
        setEditCustomerId(String(invoice.customerId ?? ''));
        setEditCurrency(invoice.currency ?? 'PYG');
        setEditStatus(invoice.status ?? 'pending');
        // Cargar los items de la factura
        setEditItems(invoice.items?.map(item => ({
            productId: item.productId ?? item.product?.id ?? 0,
            quantity: item.quantity ?? 1,
        })) || []);
        setShowEditModal(true);
    };

    const handleConfirmEdit = async () => {
        if (!editingInvoice) return;
        try {
            setSaving(true);
            const customerIdValue = editCustomerId ? parseInt(editCustomerId, 10) : undefined;
            await invoicesApi.update(editingInvoice.id, {
                customerId: !isNaN(customerIdValue!) ? customerIdValue : undefined,
                currency: editCurrency,
                status: editStatus as 'pending' | 'paid' | 'cancelled',
                items: editItems.filter(item => item.productId > 0).map(item => ({
                    productId: item.productId,
                    quantity: item.quantity,
                })),
            });
            showToast('Factura actualizada correctamente', 'success');
            setShowEditModal(false);
            loadData(invoicePage);
        } catch (err) {
            showToast(getErrorMessage(err, 'Error al actualizar factura'), 'error');
        } finally {
            setSaving(false);
        }
    };

    // Agregar item en modo edición
    const addEditItem = () => {
        setEditItems([...editItems, { productId: 0, quantity: 1 }]);
    };

    // Eliminar item en modo edición
    const removeEditItem = (index: number) => {
        if (editItems.length > 1) {
            setEditItems(editItems.filter((_, i) => i !== index));
        }
    };

    // Actualizar item en modo edición
    const updateEditItem = (index: number, field: 'productId' | 'quantity', value: number) => {
        const newItems = [...editItems];
        newItems[index] = { ...newItems[index], [field]: value };
        setEditItems(newItems);
    };

    // Funciones para eliminar factura
    const handleDeleteInvoice = (invoice: Invoice) => {
        setDeletingInvoice(invoice);
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
        if (!deletingInvoice) return;
        try {
            setDeleting(true);
            await invoicesApi.remove(deletingInvoice.id);
            showToast('Factura eliminada correctamente', 'success');
            setShowDeleteModal(false);
            loadData(invoicePage);
        } catch (err) {
            showToast(getErrorMessage(err, 'Error al eliminar factura'), 'error');
        } finally {
            setDeleting(false);
        }
    };

    const loadData = async (page: number = invoicePage) => {
        try {
            setLoading(true);
            setError(null);
            const [invoicesRes, customersData, productsData] = await Promise.all([
                invoicesApi.getPage(invoicePage, invoicePageSize, {
                    search: searchText || undefined,
                    customerId: filterCustomerId !== 'all' ? parseInt(filterCustomerId, 10) : undefined,
                    status: filterStatus !== 'all' ? filterStatus : undefined,
                    dateFrom: filterDateFrom || undefined,
                    dateTo: filterDateTo || undefined,
                }),
                customersApi.getAll(),
                productsApi.getAll()
            ]);
            setInvoices(invoicesRes.data);
            setTotalInvoices(invoicesRes.total);
            setCustomers(customersData);
            setProducts(productsData);
        } catch (err) {
            setError(getErrorMessage(err, 'Error al cargar datos'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData(invoicePage);
        // Verificar si es admin
        try {
            const profileStr = localStorage.getItem('vevil_profile');
            if (profileStr) {
                const profile = JSON.parse(profileStr);
                setIsAdmin(String(profile?.role ?? '').toLowerCase() === 'admin');
            }
        } catch (_) {}
    }, [invoicePage, searchText, filterCustomerId, filterStatus, filterDateFrom, filterDateTo]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-PY', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const openCreateModal = (customerId?: string) => {
        setSelectedCustomerId(customerId ?? '');
        setSelectedCurrency('PYG');
        setSelectedPaymentMethod('cash');
        setItems([{ productId: 0, quantity: 1 }]);
        setShowModal(true);
    };

    // Handle URL query param to open create invoice modal with customer preselected
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const createFor = params.get('createForCustomer');
        if (createFor) {
            openCreateModal(createFor);
            // Clean the URL to avoid re-opening modal on refresh
            navigate(location.pathname, { replace: true });
        }
    }, [location.search, navigate, openCreateModal]);

    const closeModal = () => {
        setShowModal(false);
        setSelectedCustomerId('');
        setSelectedCurrency('PYG');
        setItems([{ productId: 0, quantity: 1 }]);
        setInvoiceNotes('');
        setInvoiceDiscount(0);
        setInvoiceDueDate('');
        setSendEmailToCustomer(true);
    };

    const addItem = () => {
        setItems([...items, { productId: 0, quantity: 1 }]);
    };

    const saveAsTemplate = () => {
        const templateName = prompt('Nombre de la plantilla:');
        if (!templateName) return;
        const validItems = items.filter(i => i.productId > 0);
        if (validItems.length === 0) {
            showToast('Agregá al menos un producto antes de guardar la plantilla', 'error');
            return;
        }
        const newTemplates = [...invoiceTemplates, {
            name: templateName,
            items: validItems,
            paymentMethod: selectedPaymentMethod,
            currency: selectedCurrency
        }];
        setInvoiceTemplates(newTemplates);
        localStorage.setItem('invoice_templates', JSON.stringify(newTemplates));
        showToast('Plantilla guardada correctamente', 'success');
    };

    const loadTemplate = (template: typeof invoiceTemplates[0]) => {
        setItems(template.items.map(i => ({ productId: i.productId, quantity: i.quantity })));
        setSelectedPaymentMethod(template.paymentMethod);
        setSelectedCurrency(template.currency);
        setShowTemplateDropdown(false);
    };

    const deleteTemplate = (index: number) => {
        if (!confirm('¿Eliminar esta plantilla?')) return;
        const newTemplates = invoiceTemplates.filter((_, i) => i !== index);
        setInvoiceTemplates(newTemplates);
        localStorage.setItem('invoice_templates', JSON.stringify(newTemplates));
    };

    const removeItem = (index: number) => {
        if (items.length > 1) {
            setItems(items.filter((_, i) => i !== index));
        }
    };

    const updateItem = (index: number, field: 'productId' | 'quantity' | 'discountPercent', value: number) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };
        setItems(newItems);
    };

    // Memoized calculations to prevent unnecessary re-renders
    const total = useMemo(() => {
        return items.reduce((sum, item) => {
            const product = products.find(p => p.id === item.productId);
            if (product) {
                const itemTotal = Number(product.price) * item.quantity;
                const discount = itemTotal * ((item.discountPercent || 0) / 100);
                return sum + (itemTotal - discount);
            }
            return sum;
        }, 0);
    }, [items, products]);

    const finalTotal = useMemo(() => {
        const discount = total * (invoiceDiscount / 100);
        return total - discount;
    }, [total, invoiceDiscount]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Clear previous validation errors
        setFormErrors({});
        
        // Validate customer
        if (!selectedCustomerId) {
            setFormErrors({ customer: 'Selecciona un cliente' });
            return;
        }

        // Validate items
        const validItems = items.filter(item => item.productId > 0 && item.quantity > 0);
        if (validItems.length === 0) {
            setFormErrors({ items: 'Agrega al menos un producto con cantidad válida' });
            return;
        }

        // Check for duplicate products
        const productIds = validItems.map(item => item.productId);
        if (new Set(productIds).size !== productIds.length) {
            setFormErrors({ items: 'No puedes agregar el mismo producto varias veces' });
            return;
        }

        setSaving(true);

        try {
            const status = selectedPaymentMethod === 'credit' ? 'pending' : 'paid';
            await invoicesApi.create({
                customerId: parseInt(selectedCustomerId),
                currency: selectedCurrency,
                status,
                items: validItems,
                notes: invoiceNotes || undefined,
                discountPercent: invoiceDiscount || undefined,
                dueDate: invoiceDueDate || undefined
            });
            closeModal();
            showToast('Factura creada exitosamente', 'success');
            loadData(invoicePage);
        } catch (err) {
            showToast(getErrorMessage(err, 'Error al crear factura'), 'error');
        } finally {
            setSaving(false);
        }
    };

    // Imprimir factura
    const printInvoice = (invoice: Invoice) => {
        const status = getInvoiceStatus(invoice);
        const subtotal = Number(invoice.total) / 1.10;
        const iva = Number(invoice.total) - subtotal;
        
        const printContent = `
            <html>
            <head>
                <title>Factura ${formatInvoiceNumber(invoice.id)}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; }
                    .header { display: flex; justify-content: space-between; border-bottom: 2px solid #1e293b; padding-bottom: 20px; }
                    .company { }
                    .company h1 { margin: 0; color: #4f46e5; }
                    .invoice-info { text-align: right; }
                    .invoice-number { font-size: 24px; font-weight: bold; color: #1e293b; }
                    .timbrado { font-size: 12px; color: #64748b; margin-top: 8px; }
                    .client-info { margin: 20px 0; padding: 15px; background: #f8fafc; border-radius: 8px; }
                    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                    th { background: #f1f5f9; padding: 12px; text-align: left; border-bottom: 2px solid #e2e8f0; }
                    td { padding: 12px; border-bottom: 1px solid #e2e8f0; }
                    .totals { text-align: right; margin-top: 20px; }
                    .total-row { display: flex; justify-content: flex-end; gap: 40px; margin: 8px 0; }
                    .total-final { font-size: 24px; font-weight: bold; color: #f97316; }
                    .status { padding: 8px 16px; border-radius: 20px; display: inline-block; margin-top: 10px; }
                    .status-paid { background: #dcfce7; color: #166534; }
                    .status-pending { background: #fef3c7; color: #92400e; }
                    .status-cancelled { background: #fee2e2; color: #991b1b; text-decoration: line-through; }
                    .footer { margin-top: 40px; text-align: center; color: #64748b; font-size: 12px; border-top: 1px solid #e2e8f0; padding-top: 20px; }
                    @media print { body { padding: 0; } }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="company">
                        <h1>${companyConfig.name || 'VEVIL'}</h1>
                        <p>RUC: ${companyConfig.ruc || 'N/A'}</p>
                        <p>${companyConfig.address || ''}</p>
                        <p>${companyConfig.city || ''}</p>
                        <p>Tel: ${companyConfig.phone || ''}</p>
                    </div>
                    <div class="invoice-info">
                        <div class="invoice-number">FACTURA</div>
                        <div style="font-size: 20px; font-family: monospace; margin-top: 8px;">
                            ${formatInvoiceNumber(invoice.id)}
                        </div>
                        <div class="timbrado">
                            Timbrado N°: ${invoiceConfig.timbrado || 'N/A'}<br>
                            Vigencia: ${invoiceConfig.timbradoVigenciaDesde || ''} al ${invoiceConfig.timbradoVigenciaHasta || ''}
                        </div>
                        <div class="status status-${status}">${statusLabels[status]}</div>
                    </div>
                </div>

                <div class="client-info">
                    <strong>Cliente:</strong> ${invoice.customer?.name || 'N/A'}<br>
                    <strong>RUC/CI:</strong> ${invoice.customer?.tax_id || 'N/A'}<br>
                    <strong>Dirección:</strong> ${invoice.customer?.address_street || 'N/A'}<br>
                    <strong>Fecha:</strong> ${formatDate(invoice.date)}
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>Cant.</th>
                            <th>Descripción</th>
                            <th style="text-align: right;">P. Unitario</th>
                            <th style="text-align: right;">Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${invoice.items?.map(item => `
                            <tr>
                                <td>${item.quantity}</td>
                                <td>${item.product?.name || 'Producto'}</td>
                                <td style="text-align: right;">${formatMoney(Number(item.priceAtSale), invoice.currency ?? 'PYG')}</td>
                                <td style="text-align: right;">${formatMoney(Number(item.priceAtSale) * item.quantity, invoice.currency ?? 'PYG')}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>

                <div class="totals">
                    <div class="total-row">
                        <span>Subtotal:</span>
                        <span>${formatMoney(subtotal, invoice.currency ?? 'PYG')}</span>
                    </div>
                    <div class="total-row">
                        <span>IVA (10%):</span>
                        <span>${formatMoney(iva, invoice.currency ?? 'PYG')}</span>
                    </div>
                    <div class="total-row">
                        <span><strong>TOTAL:</strong></span>
                        <span class="total-final">${formatMoney(Number(invoice.total), invoice.currency ?? 'PYG')}</span>
                    </div>
                </div>

                <div class="footer">
                    <p>Gracias por su preferencia</p>
                    <p>Este documento es válido como comprobante fiscal</p>
                </div>
            </body>
            </html>
        `;

        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(printContent);
            printWindow.document.close();
            printWindow.print();
        }
    };

    const clearFilters = () => {
        setSearchText('');
        setFilterCustomerId('all');
        setFilterStatus('all');
        setFilterDateFrom('');
        setFilterDateTo('');
        setInvoicePage(1);
    };

    const hasActiveFilters = searchText || filterCustomerId !== 'all' || filterStatus !== 'all' || filterDateFrom || filterDateTo;

    if (loading) {
        return (
            <div className="responsive-padding" style={{ padding: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                    <h1 style={{ fontSize: 'clamp(22px, 5vw, 28px)', fontWeight: 700, color: '#1e293b', margin: 0 }}>Facturas</h1>
                </div>
                <TableSkeleton rows={6} cols={5} message="Cargando facturas..." />
            </div>
        );
    }

    return (
        <motion.div 
            className="responsive-padding" 
            style={{ padding: '32px' }}
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
        >
            {/* Header */}
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'flex-start',
                marginBottom: '24px',
                flexWrap: 'wrap',
                gap: '16px'
            }}>
                <div>
                    <h1 style={{ fontSize: 'clamp(22px, 5vw, 28px)', fontWeight: 700, color: '#1e293b', margin: 0 }}>
                        Facturas
                    </h1>
                    <p style={{ fontSize: '16px', color: '#64748b', margin: '4px 0 0 0' }}>
                        {totalInvoices} facturas registradas
                        {invoiceConfig.timbrado && (
                            <span style={{ marginLeft: '12px', fontSize: '12px', color: '#94a3b8' }}>
                                | Timbrado: {invoiceConfig.timbrado}
                            </span>
                        )}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <button
                        type="button"
                        onClick={() => invoicesApi.exportExcel()}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#14532d',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: 600,
                            cursor: 'pointer',
                        }}
                        title="Exportar facturas a Excel"
                    >
                        📊 Exportar Excel
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            const pdfInvoice = invoices[0];
                            if (pdfInvoice) exportInvoiceToPdf(pdfInvoice);
                        }}
                        style={{
                            ...buttonStyle,
                            padding: '10px 18px',
                            backgroundColor: 'white',
                            color: '#64748b',
                            border: '1px solid #e2e8f0',
                        }}
                        title="Descargar ejemplo de PDF"
                    >
                        📄 PDF
                    </button>
                    <button 
                        onClick={() => openCreateModal()}
                        style={{
                            ...buttonStyle,
                            padding: '12px 24px',
                            backgroundColor: '#f97316',
                            color: 'white',
                        }}
                    >
                        + Nueva Factura
                    </button>
                </div>
            </div>

            {successMessage && (
                <SuccessMessage
                    message={successMessage}
                    onDismiss={() => setSuccessMessage(null)}
                    autoDismissMs={4000}
                />
            )}
            {error && (
                <ErrorMessage
                    message={error}
                    onRetry={() => loadData(invoicePage)}
                    onDismiss={() => setError(null)}
                />
            )}

            <ConfirmModal
                open={invoiceToCancel !== null}
                title="Anular factura"
                message={invoiceToCancel ? `¿Anular la factura ${formatInvoiceNumber(invoiceToCancel.id)}? No se puede deshacer.` : ''}
                confirmLabel="Anular"
                variant="danger"
                loading={cancelling}
                onConfirm={handleConfirmCancelInvoice}
                onCancel={() => setInvoiceToCancel(null)}
            />

            {/* Barra de Filtros */}
            <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '16px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '20px' }}>🔍</span>
                        <input
                            type="text"
                            placeholder="Buscar por N° o cliente..."
                            value={searchText}
                            onChange={(e) => { setSearchText(e.target.value); setInvoicePage(1); }}
                            style={{
                                padding: '10px 16px',
                                border: '1px solid #e2e8f0',
                                borderRadius: '8px',
                                fontSize: '14px',
                                width: '200px',
                                outline: 'none'
                            }}
                        />
                    </div>
                    
                    {customers.length > 0 && (
                        <select
                            value={filterCustomerId}
                            onChange={(e) => { setFilterCustomerId(e.target.value); setInvoicePage(1); }}
                            style={{
                                padding: '10px 16px',
                                border: '1px solid #e2e8f0',
                                borderRadius: '8px',
                                fontSize: '14px',
                                backgroundColor: 'white',
                                cursor: 'pointer'
                            }}
                        >
                            <option value="all">Todos los clientes</option>
                            {customers.map(customer => (
                                <option key={customer.id} value={customer.id}>{customer.name}</option>
                            ))}
                        </select>
                    )}
                    
                    <select
                        value={filterStatus}
                        onChange={(e) => { setFilterStatus(e.target.value as 'all' | PaymentStatus); setInvoicePage(1); }}
                        style={{
                            padding: '10px 16px',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            fontSize: '14px',
                            backgroundColor: 'white',
                            cursor: 'pointer'
                        }}
                    >
                        <option value="all">Todos los estados</option>
                        <option value="paid">✅ Pagadas</option>
                        <option value="pending">⏳ Pendientes</option>
                        <option value="cancelled">❌ Anuladas</option>
                    </select>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '14px', color: '#64748b' }}>📅</span>
                        <input
                            type="date"
                            value={filterDateFrom}
                            onChange={(e) => { setFilterDateFrom(e.target.value); setInvoicePage(1); }}
                            style={{
                                padding: '10px 12px',
                                border: '1px solid #e2e8f0',
                                borderRadius: '8px',
                                fontSize: '14px'
                            }}
                        />
                        <span style={{ color: '#64748b' }}>a</span>
                        <input
                            type="date"
                            value={filterDateTo}
                            onChange={(e) => { setFilterDateTo(e.target.value); setInvoicePage(1); }}
                            style={{
                                padding: '10px 12px',
                                border: '1px solid #e2e8f0',
                                borderRadius: '8px',
                                fontSize: '14px'
                            }}
                        />
                    </div>

                    {hasActiveFilters && (
                        <button
                            onClick={clearFilters}
                            style={{
                                ...buttonStyle,
                                backgroundColor: '#f1f5f9',
                                color: '#64748b',
                                fontSize: '12px'
                            }}
                        >
                            ✕ Limpiar filtros
                        </button>
                    )}
                </div>
            </div>

            {/* Tabla */}
            {!loading && totalInvoices === 0 && !error ? (
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    padding: '48px',
                    textAlign: 'center',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }}>
                    <p style={{ fontSize: '48px', margin: '0 0 16px 0' }}>📄</p>
                    <p style={{ color: '#1e293b', fontSize: '18px', fontWeight: 600, margin: '0 0 8px 0' }}>No hay facturas registradas</p>
                    <p style={{ color: '#64748b', margin: '0 0 24px 0' }}>Creá tu primera factura para empezar a cobrar.</p>
                    <button onClick={() => openCreateModal()} style={{ ...buttonStyle, backgroundColor: '#f97316', color: 'white' }}>
                        Crear primera factura
                    </button>
                </div>
            ) : (
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                    overflowX: 'auto',
                    WebkitOverflowScrolling: 'touch'
                }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '750px' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f8fafc' }}>
                                <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600, color: '#475569', fontSize: '14px' }}>N° Factura</th>
                                <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600, color: '#475569', fontSize: '14px' }}>Cliente</th>
                                <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600, color: '#475569', fontSize: '14px' }}>Fecha</th>
                                <th style={{ padding: '16px', textAlign: 'center', fontWeight: 600, color: '#475569', fontSize: '14px' }}>Estado</th>
                                <th style={{ padding: '16px', textAlign: 'right', fontWeight: 600, color: '#475569', fontSize: '14px' }}>Total</th>
                                <th style={{ padding: '16px', textAlign: 'center', fontWeight: 600, color: '#475569', fontSize: '14px' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoices.map((invoice) => {
                                const status = getInvoiceStatus(invoice);
                                const isCancelled = status === 'cancelled';
                                
                                return (
                                    <tr key={invoice.id} style={{ 
                                        borderTop: '1px solid #e2e8f0',
                                        opacity: isCancelled ? 0.6 : 1
                                    }}>
                                        <td style={{ padding: '16px' }}>
                                            <span style={{ 
                                                fontWeight: 600, 
                                                color: '#f97316',
                                                fontFamily: 'monospace',
                                                textDecoration: isCancelled ? 'line-through' : 'none'
                                            }}>
                                                {formatInvoiceNumber(invoice.id)}
                                            </span>
                                        </td>
                                        <td style={{ padding: '16px', fontWeight: 500, color: '#1e293b' }}>
                                            {invoice.customer?.name || 'Cliente'}
                                        </td>
                                        <td style={{ padding: '16px', color: '#64748b' }}>
                                            {formatDate(invoice.date)}
                                        </td>
                                        <td style={{ padding: '16px', textAlign: 'center' }}>
                                            <select
                                                value={status}
                                                onChange={(e) => handleStatusChange(invoice, e.target.value as PaymentStatus)}
                                                style={{
                                                    padding: '6px 12px',
                                                    backgroundColor: statusColors[status].bg,
                                                    color: statusColors[status].text,
                                                    border: 'none',
                                                    borderRadius: '9999px',
                                                    fontSize: '12px',
                                                    fontWeight: 600,
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <option value="paid">✅ Pagada</option>
                                                <option value="pending">⏳ Pendiente</option>
                                                <option value="cancelled">❌ Anulada</option>
                                            </select>
                                        </td>
                                        <td style={{ 
                                            padding: '16px', 
                                            textAlign: 'right', 
                                            fontWeight: 700, 
                                            fontSize: '16px', 
                                            color: isCancelled ? '#94a3b8' : '#1e293b',
                                            textDecoration: isCancelled ? 'line-through' : 'none'
                                        }}>
                                            {formatMoney(Number(invoice.total), invoice.currency ?? 'PYG')}
                                        </td>
                                        <td style={{ padding: '16px', textAlign: 'center' }}>
                                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                                <button
                                                    onClick={() => navigate(`/invoices/${invoice.id}`)}
                                                    style={{
                                                        ...buttonStyle,
                                                        backgroundColor: '#f1f5f9',
                                                        color: '#475569',
                                                        padding: '8px 12px'
                                                    }}
                                                    title="Ver detalle"
                                                >
                                                    👁️
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        try {
                                                            exportInvoiceToPdf(invoice, false);
                                                        } catch (err) {
                                                            showToast(getErrorMessage(err, 'No se pudo abrir el PDF'), 'error');
                                                        }
                                                    }}
                                                    style={{
                                                        ...buttonStyle,
                                                        backgroundColor: '#7c3aed',
                                                        color: 'white',
                                                        padding: '8px 12px'
                                                    }}
                                                    title="Ver factura (PDF)"
                                                >
                                                    📄 Ver
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        try {
                                                            exportInvoiceToPdf(invoice, true);
                                                        } catch (err) {
                                                            showToast(getErrorMessage(err, 'No se pudo descargar el PDF'), 'error');
                                                        }
                                                    }}
                                                    style={{
                                                        ...buttonStyle,
                                                        backgroundColor: '#3b82f6',
                                                        color: 'white',
                                                        padding: '8px 12px'
                                                    }}
                                                    title="Descargar PDF"
                                                >
                                                    ⬇️
                                                </button>
                                                <button
                                                    onClick={() => printInvoice(invoice)}
                                                    style={{
                                                        ...buttonStyle,
                                                        backgroundColor: '#dbeafe',
                                                        color: '#1e40af',
                                                        padding: '8px 12px'
                                                    }}
                                                    title="Imprimir"
                                                >
                                                    🖨️
                                                </button>
                                                <button
                                                    onClick={() => exportInvoiceToPdf(invoice)}
                                                    style={{
                                                        ...buttonStyle,
                                                        backgroundColor: '#dcfce7',
                                                        color: '#166534',
                                                        padding: '8px 12px'
                                                    }}
                                                    title="Descargar PDF"
                                                >
                                                    📄
                                                </button>
                                                {isAdmin && (invoice.status === 'pending' || invoice.status === 'cancelled') && (
                                                    <>
                                                        <button
                                                            onClick={() => handleEditInvoice(invoice)}
                                                            style={{
                                                                ...buttonStyle,
                                                                backgroundColor: '#fef3c7',
                                                                color: '#92400e',
                                                                padding: '8px 12px'
                                                            }}
                                                            title="Editar"
                                                        >
                                                            ✏️
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteInvoice(invoice)}
                                                            style={{
                                                                ...buttonStyle,
                                                                backgroundColor: '#fee2e2',
                                                                color: '#991b1b',
                                                                padding: '8px 12px'
                                                            }}
                                                            title="Eliminar"
                                                        >
                                                            🗑️
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    <div style={{ padding: '0 16px 16px' }}>
                        <Pagination
                            page={invoicePage}
                            limit={invoicePageSize}
                            total={totalInvoices}
                            onPageChange={setInvoicePage}
                            onPageSizeChange={(size) => { setInvoicePageSize(size); setInvoicePage(1); }}
                            label="facturas"
                        />
                    </div>
                </div>
            )}

            {/* Modal para crear factura */}
            {showModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: window.innerWidth < 768 ? 0 : '16px'
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: window.innerWidth < 768 ? 0 : '16px',
                        padding: window.innerWidth < 768 ? '20px' : '32px',
                        width: '100%',
                        maxWidth: window.innerWidth < 768 ? '100%' : '700px',
                        height: window.innerWidth < 768 ? '100%' : 'auto',
                        maxHeight: window.innerWidth < 768 ? '100%' : '90vh',
                        overflow: 'auto'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 600, color: '#1e293b' }}>
                                Nueva Factura
                            </h2>
                            {invoiceConfig.timbrado && (
                                <div style={{ textAlign: 'right', fontSize: '12px', color: '#64748b' }}>
                                    <div>Timbrado: {invoiceConfig.timbrado}</div>
                                    <div style={{ fontFamily: 'monospace', color: '#f97316', fontWeight: 600 }}>
                                        N°: {formatInvoiceNumber(invoiceConfig.siguienteNumero)}
                                    </div>
                                </div>
                            )}
                        </div>

                        <form onSubmit={handleSubmit}>
                            {/* Selector de cliente, moneda y método de pago */}
                            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                                <div>
                                    <label style={labelStyle}>Cliente *</label>
                                    <select
                                        value={selectedCustomerId}
                                        onChange={(e) => {
                                            setSelectedCustomerId(e.target.value);
                                            if (formErrors.customer) setFormErrors(prev => ({ ...prev, customer: undefined }));
                                        }}
                                        required
                                        style={{
                                            ...inputStyle,
                                            borderColor: formErrors.customer ? '#ef4444' : '#d1d5db'
                                        }}
                                    >
                                        <option value="">Seleccionar cliente...</option>
                                        {customers.map(customer => (
                                            <option key={customer.id} value={customer.id}>
                                                {customer.name} - {customer.tax_id || customer.email}
                                            </option>
                                        ))}
                                    </select>
                                    {formErrors.customer && (
                                        <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                                            {formErrors.customer}
                                        </span>
                                    )}
                                </div>
                                <div>
                                    <label style={labelStyle}>Moneda *</label>
                                    <select
                                        value={selectedCurrency}
                                        onChange={(e) => setSelectedCurrency(e.target.value)}
                                        required
                                        style={inputStyle}
                                    >
                                        {getEnabledCurrencies().map(c => (
                                            <option key={c.code} value={c.code}>
                                                {c.symbol} {c.code}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label style={labelStyle}>Forma de Pago</label>
                                    <select
                                        value={selectedPaymentMethod}
                                        onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                                        style={inputStyle}
                                    >
                                        <option value="cash">💵 Efectivo</option>
                                        <option value="card">💳 Tarjeta</option>
                                        <option value="transfer">🏦 Transferencia</option>
                                        <option value="credit">📝 Crédito</option>
                                    </select>
                                </div>
                            </div>

                            {/* Notes, discount, due date */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                                <div>
                                    <label style={labelStyle}>Notas</label>
                                    <textarea
                                        value={invoiceNotes}
                                        onChange={(e) => setInvoiceNotes(e.target.value)}
                                        placeholder="Observaciones..."
                                        style={{ ...inputStyle, minHeight: '60px', resize: 'vertical' }}
                                    />
                                </div>
                                <div>
                                    <label style={labelStyle}>Descuento (%)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={invoiceDiscount}
                                        onChange={(e) => setInvoiceDiscount(Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)))}
                                        style={inputStyle}
                                    />
                                </div>
                                <div>
                                    <label style={labelStyle}>Fecha Vencimiento</label>
                                    <input
                                        type="date"
                                        value={invoiceDueDate}
                                        onChange={(e) => setInvoiceDueDate(e.target.value)}
                                        style={inputStyle}
                                    />
                                </div>
                            </div>

                            {/* Send email checkbox */}
                            <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <input
                                    type="checkbox"
                                    id="sendEmail"
                                    checked={sendEmailToCustomer}
                                    onChange={(e) => setSendEmailToCustomer(e.target.checked)}
                                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                />
                                <label htmlFor="sendEmail" style={{ fontSize: '14px', color: '#374151', cursor: 'pointer' }}>
                                    📧 Enviar factura por email al cliente
                                </label>
                            </div>

                            {/* Items */}
                            <div style={{ marginBottom: '24px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: formErrors.items ? '4px' : '12px' }}>
                                    <label style={{ ...labelStyle, marginBottom: 0 }}>Productos *</label>
                                    <button
                                        type="button"
                                        onClick={addItem}
                                        style={{
                                            ...buttonStyle,
                                            backgroundColor: '#f1f5f9',
                                            color: '#475569',
                                            fontSize: '12px'
                                        }}
                                    >
                                        + Agregar producto
                                    </button>
                                    {invoiceTemplates.length > 0 && (
                                        <div style={{ position: 'relative', display: 'inline-block' }}>
                                            <button
                                                type="button"
                                                onClick={() => setShowTemplateDropdown(!showTemplateDropdown)}
                                                style={{
                                                    ...buttonStyle,
                                                    backgroundColor: '#dbeafe',
                                                    color: '#1e40af',
                                                    marginLeft: '8px',
                                                    fontSize: '12px'
                                                }}
                                            >
                                                📋 Plantillas ({invoiceTemplates.length})
                                            </button>
                                            {showTemplateDropdown && (
                                                <div style={{
                                                    position: 'absolute',
                                                    top: '100%',
                                                    left: 0,
                                                    backgroundColor: 'white',
                                                    border: '1px solid #e2e8f0',
                                                    borderRadius: '8px',
                                                    minWidth: '200px',
                                                    maxHeight: '200px',
                                                    overflow: 'auto',
                                                    zIndex: 100,
                                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                                }}>
                                                    {invoiceTemplates.map((t, i) => (
                                                        <div key={i} style={{
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            alignItems: 'center',
                                                            padding: '8px 12px',
                                                            borderBottom: '1px solid #f1f5f9'
                                                        }}>
                                                            <button
                                                                onClick={() => loadTemplate(t)}
                                                                style={{
                                                                    background: 'none',
                                                                    border: 'none',
                                                                    textAlign: 'left',
                                                                    cursor: 'pointer',
                                                                    color: '#1e293b',
                                                                    flex: 1
                                                                }}
                                                            >
                                                                {t.name}
                                                            </button>
                                                            <button
                                                                onClick={() => deleteTemplate(i)}
                                                                style={{
                                                                    background: 'none',
                                                                    border: 'none',
                                                                    color: '#ef4444',
                                                                    cursor: 'pointer',
                                                                    fontSize: '12px'
                                                                }}
                                                            >
                                                                🗑️
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    <button
                                        type="button"
                                        onClick={saveAsTemplate}
                                        style={{
                                            ...buttonStyle,
                                            backgroundColor: '#dcfce7',
                                            color: '#166534',
                                            marginLeft: '8px',
                                            fontSize: '12px'
                                        }}
                                    >
                                        💾 Guardar Plantilla
                                    </button>
                                </div>
                                {formErrors.items && (
                                    <span style={{ color: '#ef4444', fontSize: '12px', marginBottom: '12px', display: 'block' }}>
                                        {formErrors.items}
                                    </span>
                                )}

                                {items.map((item, index) => (
                                    <div key={index} style={{ 
                                        display: 'grid', 
                                        gridTemplateColumns: '2fr 1fr 1fr auto', 
                                        gap: '12px', 
                                        marginBottom: '12px',
                                        padding: '12px',
                                        backgroundColor: '#f8fafc',
                                        borderRadius: '8px'
                                    }}>
                                        <select
                                            value={item.productId}
                                            onChange={(e) => updateItem(index, 'productId', parseInt(e.target.value))}
                                            style={inputStyle}
                                        >
                                            <option value={0}>Seleccionar producto...</option>
                                            {products.map(product => (
                                                <option key={product.id} value={product.id}>
                                                    {product.name} - {formatMoney(Number(product.price), product.currency ?? 'PYG')}
                                                </option>
                                            ))}
                                        </select>
                                        <input
                                            type="number"
                                            min="1"
                                            value={item.quantity}
                                            onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                                            style={inputStyle}
                                            placeholder="Cantidad"
                                        />
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            value={item.discountPercent || 0}
                                            onChange={(e) => updateItem(index, 'discountPercent', parseFloat(e.target.value) || 0)}
                                            style={inputStyle}
                                            placeholder="Desc %"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeItem(index)}
                                            disabled={items.length === 1}
                                            style={{
                                                ...buttonStyle,
                                                backgroundColor: items.length === 1 ? '#e2e8f0' : '#fee2e2',
                                                color: items.length === 1 ? '#9ca3af' : '#dc2626',
                                                padding: '12px'
                                            }}
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {/* Total */}
                            <div style={{
                                backgroundColor: '#f8fafc',
                                padding: '16px',
                                borderRadius: '8px',
                                marginBottom: '24px'
                            }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                        <span style={{ fontSize: '14px', color: '#64748b' }}>Subtotal:</span>
                                        <span style={{ fontSize: '16px', color: '#1e293b' }}>
                                            {formatMoney(total, selectedCurrency)}
                                        </span>
                                    </div>
                                {invoiceDiscount > 0 && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                        <span style={{ fontSize: '14px', color: '#16a34a' }}>Descuento ({invoiceDiscount}%):</span>
                                        <span style={{ fontSize: '16px', color: '#16a34a' }}>
                                            -{formatMoney(total * (invoiceDiscount / 100), selectedCurrency)}
                                        </span>
                                    </div>
                                )}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                    <span style={{ fontSize: '14px', color: '#64748b' }}>IVA (10%):</span>
                                    <span style={{ fontSize: '16px', color: '#1e293b' }}>
                                        {formatMoney(finalTotal * 0.10, selectedCurrency)}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid #e2e8f0' }}>
                                    <span style={{ fontSize: '16px', fontWeight: 600, color: '#475569' }}>Total:</span>
                                    <span style={{ fontSize: '24px', fontWeight: 700, color: '#f97316' }}>
                                        {formatMoney(finalTotal * 1.10, selectedCurrency)}
                                    </span>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    style={{
                                        ...buttonStyle,
                                        backgroundColor: '#f1f5f9',
                                        color: '#475569',
                                        padding: '12px 24px'
                                    }}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    style={{
                                        ...buttonStyle,
                                        backgroundColor: saving ? '#9ca3af' : '#f97316',
                                        color: 'white',
                                        padding: '12px 24px'
                                    }}
                                >
                                    {saving ? 'Creando...' : 'Crear Factura'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal para editar factura */}
            {showEditModal && editingInvoice && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        padding: '24px',
                        width: '400px',
                        maxHeight: '80vh',
                        overflowY: 'auto'
                    }}>
                        <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#1f2937' }}>
                            Editar Factura #{formatInvoiceNumber(editingInvoice.id)}
                        </h3>
                        
                        <div style={{ marginBottom: '16px' }}>
                            <label style={labelStyle}>Cliente</label>
                            <select
                                value={editCustomerId}
                                onChange={(e) => setEditCustomerId(e.target.value)}
                                style={inputStyle}
                            >
                                <option value="">Seleccionar cliente...</option>
                                {customers.map(customer => (
                                    <option key={customer.id} value={customer.id}>
                                        {customer.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={labelStyle}>Moneda</label>
                            <select
                                value={editCurrency}
                                onChange={(e) => setEditCurrency(e.target.value)}
                                style={inputStyle}
                            >
                                {getEnabledCurrencies().map(currency => (
                                    <option key={currency.code} value={currency.code}>
                                        {currency.code} - {currency.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <label style={labelStyle}>Estado</label>
                            <select
                                value={editStatus}
                                onChange={(e) => setEditStatus(e.target.value)}
                                style={inputStyle}
                            >
                                <option value="pending">Pendiente</option>
                                <option value="paid">Pagada</option>
                                <option value="cancelled">Anulada</option>
                            </select>
                        </div>

                        {/* Items de la factura */}
                        <div style={{ marginBottom: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                <label style={{ ...labelStyle, marginBottom: 0 }}>Productos</label>
                                <button
                                    type="button"
                                    onClick={addEditItem}
                                    style={{
                                        ...buttonStyle,
                                        backgroundColor: '#f1f5f9',
                                        color: '#475569',
                                        fontSize: '12px'
                                    }}
                                >
                                    + Agregar producto
                                </button>
                            </div>

                            {editItems.map((item, index) => (
                                <div key={index} style={{ 
                                    display: 'grid', 
                                    gridTemplateColumns: '2fr 1fr auto', 
                                    gap: '12px', 
                                    marginBottom: '12px',
                                    padding: '12px',
                                    backgroundColor: '#f8fafc',
                                    borderRadius: '8px'
                                }}>
                                    <select
                                        value={item.productId}
                                        onChange={(e) => updateEditItem(index, 'productId', parseInt(e.target.value))}
                                        style={inputStyle}
                                    >
                                        <option value={0}>Seleccionar producto...</option>
                                        {products.map(product => (
                                            <option key={product.id} value={product.id}>
                                                {product.name} - {formatMoney(Number(product.price), product.currency ?? 'PYG')}
                                            </option>
                                        ))}
                                    </select>
                                    <input
                                        type="number"
                                        min="1"
                                        value={item.quantity}
                                        onChange={(e) => updateEditItem(index, 'quantity', parseInt(e.target.value) || 1)}
                                        style={inputStyle}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeEditItem(index)}
                                        style={{
                                            ...buttonStyle,
                                            backgroundColor: '#fee2e2',
                                            color: '#991b1b',
                                            padding: '8px 12px'
                                        }}
                                        disabled={editItems.length === 1}
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => setShowEditModal(false)}
                                style={{
                                    ...buttonStyle,
                                    backgroundColor: '#f1f5f9',
                                    color: '#475569'
                                }}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleConfirmEdit}
                                disabled={saving}
                                style={{
                                    ...buttonStyle,
                                    backgroundColor: saving ? '#9ca3af' : '#f97316',
                                    color: 'white'
                                }}
                            >
                                {saving ? 'Guardando...' : 'Guardar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal para eliminar factura */}
            {showDeleteModal && deletingInvoice && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        padding: '24px',
                        width: '400px'
                    }}>
                        <h3 style={{ marginTop: 0, color: '#991b1b' }}>Confirmar eliminación</h3>
                        <p style={{ color: '#4b5563', marginBottom: '24px' }}>
                            ¿Está seguro que desea eliminar la factura #{formatInvoiceNumber(deletingInvoice.id)}?
                            <br /><br />
                            <strong>Esta acción no se puede deshacer.</strong>
                        </p>
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                style={{
                                    ...buttonStyle,
                                    backgroundColor: '#f1f5f9',
                                    color: '#475569'
                                }}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                disabled={deleting}
                                style={{
                                    ...buttonStyle,
                                    backgroundColor: deleting ? '#9ca3af' : '#dc2626',
                                    color: 'white'
                                }}
                            >
                                {deleting ? 'Eliminando...' : 'Eliminar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default InvoiceList;
