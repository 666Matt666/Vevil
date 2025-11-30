import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { invoicesApi, Invoice, customersApi, Customer, productsApi, Product } from '../../services/api';
import { getEnabledCurrencies, formatMoney, getInvoiceConfig, getCompanyConfig, formatInvoiceNumber } from '../settings/Settings';

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

const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '14px',
    fontWeight: 500,
    color: '#374151',
    marginBottom: '6px'
};

interface InvoiceItem {
    productId: number;
    quantity: number;
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
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [saving, setSaving] = useState(false);
    
    // Form state
    const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
    const [selectedCurrency, setSelectedCurrency] = useState<string>('PYG');
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('cash');
    const [items, setItems] = useState<InvoiceItem[]>([{ productId: 0, quantity: 1 }]);

    // Filtros
    const [searchText, setSearchText] = useState('');
    const [filterCustomerId, setFilterCustomerId] = useState('all');
    const [filterStatus, setFilterStatus] = useState<'all' | PaymentStatus>('all');
    const [filterDateFrom, setFilterDateFrom] = useState('');
    const [filterDateTo, setFilterDateTo] = useState('');

    // Estado local de facturas (para simular estados de pago)
    const [invoiceStatuses, setInvoiceStatuses] = useState<Record<number, PaymentStatus>>({});

    const invoiceConfig = getInvoiceConfig();
    const companyConfig = getCompanyConfig();

    // Cargar estados guardados
    useEffect(() => {
        const saved = localStorage.getItem('invoice_statuses');
        if (saved) {
            setInvoiceStatuses(JSON.parse(saved));
        }
    }, []);

    // Guardar estados
    const saveStatuses = (statuses: Record<number, PaymentStatus>) => {
        localStorage.setItem('invoice_statuses', JSON.stringify(statuses));
        setInvoiceStatuses(statuses);
    };

    // Obtener estado de una factura
    const getInvoiceStatus = (invoiceId: number): PaymentStatus => {
        return invoiceStatuses[invoiceId] || 'paid';
    };

    // Cambiar estado de factura
    const changeInvoiceStatus = (invoiceId: number, status: PaymentStatus) => {
        const newStatuses = { ...invoiceStatuses, [invoiceId]: status };
        saveStatuses(newStatuses);
    };

    // Facturas filtradas
    const filteredInvoices = invoices.filter(invoice => {
        const searchLower = searchText.toLowerCase();
        const matchesSearch = 
            String(invoice.id).includes(searchLower) ||
            formatInvoiceNumber(invoice.id).toLowerCase().includes(searchLower) ||
            (invoice.customer?.name && invoice.customer.name.toLowerCase().includes(searchLower));
        const matchesCustomer = filterCustomerId === 'all' || String(invoice.customerId) === filterCustomerId;
        const matchesStatus = filterStatus === 'all' || getInvoiceStatus(invoice.id) === filterStatus;
        
        // Filtro de fecha
        let matchesDate = true;
        if (filterDateFrom) {
            matchesDate = matchesDate && new Date(invoice.date) >= new Date(filterDateFrom);
        }
        if (filterDateTo) {
            matchesDate = matchesDate && new Date(invoice.date) <= new Date(filterDateTo + 'T23:59:59');
        }
        
        return matchesSearch && matchesCustomer && matchesStatus && matchesDate;
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);
            const [invoicesData, customersData, productsData] = await Promise.all([
                invoicesApi.getAll(),
                customersApi.getAll(),
                productsApi.getAll()
            ]);
            setInvoices(invoicesData);
            setCustomers(customersData);
            setProducts(productsData);
        } catch (err: any) {
            setError(err.message || 'Error al cargar datos');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-PY', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const openCreateModal = () => {
        setSelectedCustomerId('');
        setSelectedCurrency('PYG');
        setSelectedPaymentMethod('cash');
        setItems([{ productId: 0, quantity: 1 }]);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedCustomerId('');
        setSelectedCurrency('PYG');
        setItems([{ productId: 0, quantity: 1 }]);
    };

    const addItem = () => {
        setItems([...items, { productId: 0, quantity: 1 }]);
    };

    const removeItem = (index: number) => {
        if (items.length > 1) {
            setItems(items.filter((_, i) => i !== index));
        }
    };

    const updateItem = (index: number, field: 'productId' | 'quantity', value: number) => {
        const newItems = [...items];
        newItems[index][field] = value;
        setItems(newItems);
    };

    const calculateTotal = () => {
        return items.reduce((sum, item) => {
            const product = products.find(p => p.id === item.productId);
            if (product) {
                return sum + (Number(product.price) * item.quantity);
            }
            return sum;
        }, 0);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!selectedCustomerId) {
            alert('Selecciona un cliente');
            return;
        }

        const validItems = items.filter(item => item.productId > 0 && item.quantity > 0);
        if (validItems.length === 0) {
            alert('Agrega al menos un producto');
            return;
        }

        setSaving(true);

        try {
            const newInvoice = await invoicesApi.create({
                customerId: parseInt(selectedCustomerId),
                currency: selectedCurrency,
                items: validItems
            });
            
            // Establecer estado según método de pago
            if (selectedPaymentMethod === 'credit') {
                changeInvoiceStatus(newInvoice.id, 'pending');
            } else {
                changeInvoiceStatus(newInvoice.id, 'paid');
            }
            
            closeModal();
            loadData();
        } catch (err: any) {
            alert(err.message || 'Error al crear factura');
        } finally {
            setSaving(false);
        }
    };

    // Imprimir factura
    const printInvoice = (invoice: Invoice) => {
        const status = getInvoiceStatus(invoice.id);
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
                    <strong>Dirección:</strong> ${invoice.customer?.address || 'N/A'}<br>
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
                                <td style="text-align: right;">${formatMoney(Number(item.priceAtSale), (invoice as any).currency || 'PYG')}</td>
                                <td style="text-align: right;">${formatMoney(Number(item.priceAtSale) * item.quantity, (invoice as any).currency || 'PYG')}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>

                <div class="totals">
                    <div class="total-row">
                        <span>Subtotal:</span>
                        <span>${formatMoney(subtotal, (invoice as any).currency || 'PYG')}</span>
                    </div>
                    <div class="total-row">
                        <span>IVA (10%):</span>
                        <span>${formatMoney(iva, (invoice as any).currency || 'PYG')}</span>
                    </div>
                    <div class="total-row">
                        <span><strong>TOTAL:</strong></span>
                        <span class="total-final">${formatMoney(Number(invoice.total), (invoice as any).currency || 'PYG')}</span>
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

    // Limpiar filtros
    const clearFilters = () => {
        setSearchText('');
        setFilterCustomerId('all');
        setFilterStatus('all');
        setFilterDateFrom('');
        setFilterDateTo('');
    };

    const hasActiveFilters = searchText || filterCustomerId !== 'all' || filterStatus !== 'all' || filterDateFrom || filterDateTo;

    if (loading) {
        return (
            <div style={{ padding: '32px', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ 
                        width: '48px', 
                        height: '48px', 
                        border: '4px solid #e2e8f0',
                        borderTopColor: '#f97316',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 16px'
                    }} />
                    <p style={{ color: '#64748b' }}>Cargando facturas...</p>
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </div>
            </div>
        );
    }

    return (
        <div className="responsive-padding" style={{ padding: '32px' }}>
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
                        {invoices.length} facturas registradas
                        {invoiceConfig.timbrado && (
                            <span style={{ marginLeft: '12px', fontSize: '12px', color: '#94a3b8' }}>
                                | Timbrado: {invoiceConfig.timbrado}
                            </span>
                        )}
                    </p>
                </div>
                <button 
                    onClick={openCreateModal}
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

            {error && (
                <div style={{
                    backgroundColor: '#fee2e2',
                    border: '1px solid #fecaca',
                    borderRadius: '12px',
                    padding: '16px',
                    marginBottom: '24px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <p style={{ color: '#991b1b', margin: 0 }}>❌ {error}</p>
                    <button onClick={loadData} style={{ ...buttonStyle, backgroundColor: '#f97316', color: 'white' }}>
                        Reintentar
                    </button>
                </div>
            )}

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
                            onChange={(e) => setSearchText(e.target.value)}
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
                            onChange={(e) => setFilterCustomerId(e.target.value)}
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
                        onChange={(e) => setFilterStatus(e.target.value as any)}
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
                            onChange={(e) => setFilterDateFrom(e.target.value)}
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
                            onChange={(e) => setFilterDateTo(e.target.value)}
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
                <div style={{ marginTop: '12px', fontSize: '14px', color: '#64748b' }}>
                    Mostrando {filteredInvoices.length} de {invoices.length} facturas
                </div>
            </div>

            {/* Tabla */}
            {invoices.length === 0 ? (
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    padding: '48px',
                    textAlign: 'center',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }}>
                    <p style={{ fontSize: '48px', margin: '0 0 16px 0' }}>📄</p>
                    <p style={{ color: '#64748b', margin: '0 0 16px 0' }}>No hay facturas registradas</p>
                    <button onClick={openCreateModal} style={{ ...buttonStyle, backgroundColor: '#f97316', color: 'white' }}>
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
                            {filteredInvoices.map((invoice) => {
                                const status = getInvoiceStatus(invoice.id);
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
                                                onChange={(e) => changeInvoiceStatus(invoice.id, e.target.value as PaymentStatus)}
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
                                            {formatMoney(Number(invoice.total), (invoice as any).currency || 'PYG')}
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
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
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
                                        onChange={(e) => setSelectedCustomerId(e.target.value)}
                                        required
                                        style={inputStyle}
                                    >
                                        <option value="">Seleccionar cliente...</option>
                                        {customers.map(customer => (
                                            <option key={customer.id} value={customer.id}>
                                                {customer.name} - {customer.tax_id || customer.email}
                                            </option>
                                        ))}
                                    </select>
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

                            {/* Items */}
                            <div style={{ marginBottom: '24px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
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
                                </div>

                                {items.map((item, index) => (
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
                                            onChange={(e) => updateItem(index, 'productId', parseInt(e.target.value))}
                                            style={inputStyle}
                                        >
                                            <option value={0}>Seleccionar producto...</option>
                                            {products.map(product => (
                                                <option key={product.id} value={product.id}>
                                                    {product.name} - {formatMoney(Number(product.price), (product as any).currency || 'PYG')}
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
                                        {formatMoney(calculateTotal(), selectedCurrency)}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                    <span style={{ fontSize: '14px', color: '#64748b' }}>IVA (10%):</span>
                                    <span style={{ fontSize: '16px', color: '#1e293b' }}>
                                        {formatMoney(calculateTotal() * 0.10, selectedCurrency)}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid #e2e8f0' }}>
                                    <span style={{ fontSize: '16px', fontWeight: 600, color: '#475569' }}>Total:</span>
                                    <span style={{ fontSize: '24px', fontWeight: 700, color: '#f97316' }}>
                                        {formatMoney(calculateTotal() * 1.10, selectedCurrency)}
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
        </div>
    );
};

export default InvoiceList;
