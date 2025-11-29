import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { invoicesApi, Invoice, customersApi, Customer, productsApi, Product } from '../../services/api';
import { getEnabledCurrencies, formatMoney } from '../settings/Settings';

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
    const [items, setItems] = useState<InvoiceItem[]>([{ productId: 0, quantity: 1 }]);

    // Filtros
    const [searchText, setSearchText] = useState('');
    const [filterCustomerId, setFilterCustomerId] = useState('all');

    // Facturas filtradas
    const filteredInvoices = invoices.filter(invoice => {
        const searchLower = searchText.toLowerCase();
        const matchesSearch = 
            String(invoice.id).includes(searchLower) ||
            (invoice.customer?.name && invoice.customer.name.toLowerCase().includes(searchLower));
        const matchesCustomer = filterCustomerId === 'all' || String(invoice.customerId) === filterCustomerId;
        return matchesSearch && matchesCustomer;
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
        return date.toLocaleDateString('es-AR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const openCreateModal = () => {
        setSelectedCustomerId('');
        setSelectedCurrency('PYG');
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
            await invoicesApi.create({
                customerId: parseInt(selectedCustomerId),
                currency: selectedCurrency,
                items: validItems
            });
            closeModal();
            loadData();
        } catch (err: any) {
            alert(err.message || 'Error al crear factura');
        } finally {
            setSaving(false);
        }
    };

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
        <div style={{ padding: '32px' }}>
            {/* Header */}
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '24px'
            }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#1e293b', margin: 0 }}>
                        Facturas
                    </h1>
                    <p style={{ fontSize: '16px', color: '#64748b', margin: '4px 0 0 0' }}>
                        {invoices.length} facturas registradas
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
            {invoices.length > 0 && (
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    padding: '16px',
                    marginBottom: '16px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                    display: 'flex',
                    gap: '16px',
                    alignItems: 'center',
                    flexWrap: 'wrap'
                }}>
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
                                width: '250px',
                                outline: 'none'
                            }}
                        />
                    </div>
                    {customers.length > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '14px', color: '#64748b' }}>Cliente:</span>
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
                                <option value="all">Todos</option>
                                {customers.map(customer => (
                                    <option key={customer.id} value={customer.id}>{customer.name}</option>
                                ))}
                            </select>
                        </div>
                    )}
                    {(searchText || filterCustomerId !== 'all') && (
                        <button
                            onClick={() => { setSearchText(''); setFilterCustomerId('all'); }}
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
                    <span style={{ marginLeft: 'auto', fontSize: '14px', color: '#64748b' }}>
                        Mostrando {filteredInvoices.length} de {invoices.length}
                    </span>
                    </div>
            )}

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
                    overflow: 'hidden',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f8fafc' }}>
                                <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600, color: '#475569', fontSize: '14px' }}>N° Factura</th>
                                <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600, color: '#475569', fontSize: '14px' }}>Cliente</th>
                                <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600, color: '#475569', fontSize: '14px' }}>Fecha</th>
                                <th style={{ padding: '16px', textAlign: 'center', fontWeight: 600, color: '#475569', fontSize: '14px' }}>Items</th>
                                <th style={{ padding: '16px', textAlign: 'right', fontWeight: 600, color: '#475569', fontSize: '14px' }}>Total</th>
                                <th style={{ padding: '16px', textAlign: 'center', fontWeight: 600, color: '#475569', fontSize: '14px' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredInvoices.map((invoice) => (
                                <tr key={invoice.id} style={{ borderTop: '1px solid #e2e8f0' }}>
                                    <td style={{ padding: '16px' }}>
                                        <span style={{ fontWeight: 600, color: '#f97316' }}>#{invoice.id}</span>
                                    </td>
                                    <td style={{ padding: '16px', fontWeight: 500, color: '#1e293b' }}>
                                        {invoice.customer?.name || 'Cliente'}
                                    </td>
                                    <td style={{ padding: '16px', color: '#64748b' }}>
                                        {formatDate(invoice.date)}
                                    </td>
                                    <td style={{ padding: '16px', textAlign: 'center' }}>
                                        <span style={{
                                            backgroundColor: '#f1f5f9',
                                            padding: '4px 12px',
                                            borderRadius: '9999px',
                                            fontSize: '12px',
                                            color: '#475569'
                                        }}>
                                            {invoice.items?.length || 0} productos
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px', textAlign: 'right', fontWeight: 700, fontSize: '16px', color: '#1e293b' }}>
                                        {formatMoney(Number(invoice.total), (invoice as any).currency || 'PYG')}
                                    </td>
                                    <td style={{ padding: '16px', textAlign: 'center' }}>
                                        <button
                                            onClick={() => navigate(`/invoices/${invoice.id}`)}
                                            style={{
                                                ...buttonStyle,
                                                backgroundColor: '#f1f5f9',
                                                color: '#475569'
                                            }}
                                        >
                                            👁️ Ver Detalle
                                        </button>
                                    </td>
                                </tr>
                            ))}
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
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '16px',
                        padding: '32px',
                        width: '100%',
                        maxWidth: '700px',
                        maxHeight: '90vh',
                        overflow: 'auto'
                    }}>
                        <h2 style={{ margin: '0 0 24px 0', fontSize: '24px', fontWeight: 600, color: '#1e293b' }}>
                            Nueva Factura
                        </h2>

                        <form onSubmit={handleSubmit}>
                            {/* Selector de cliente y moneda */}
                            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginBottom: '24px' }}>
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
                                                {customer.name} - {customer.email}
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
                                                {c.symbol} {c.code} - {c.name}
                                            </option>
                                        ))}
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
