import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { invoicesApi, Invoice } from '../../services/api';
import { formatMoney } from '../settings/Settings';

const InvoiceDetail: React.FC = () => {
    const { invoiceId } = useParams<{ invoiceId: string }>();
    const [invoice, setInvoice] = useState<Invoice | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (invoiceId) {
            loadInvoice();
        }
    }, [invoiceId]);

    const loadInvoice = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await invoicesApi.getById(parseInt(invoiceId!));
            setInvoice(data);
        } catch (err: any) {
            setError(err.message || 'Error al cargar la factura');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-PY', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // IVA de Paraguay: 10%
    const IVA_RATE = 0.10;

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
                    <p style={{ color: '#64748b' }}>Cargando factura...</p>
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </div>
            </div>
        );
    }

    if (error || !invoice) {
        return (
            <div style={{ padding: '32px' }}>
                <Link to="/invoices" style={{ color: '#f97316', textDecoration: 'none', fontWeight: 500 }}>
                    ← Volver a facturas
                </Link>
                <div style={{
                    backgroundColor: '#fee2e2',
                    border: '1px solid #fecaca',
                    borderRadius: '12px',
                    padding: '24px',
                    marginTop: '24px',
                    textAlign: 'center'
                }}>
                    <p style={{ color: '#991b1b', margin: 0 }}>❌ {error || 'Factura no encontrada'}</p>
                </div>
            </div>
        );
    }

    const subtotal = Number(invoice.total) / (1 + IVA_RATE);
    const iva = Number(invoice.total) - subtotal;

    return (
        <div style={{ padding: '32px' }}>
            {/* Volver */}
            <Link to="/invoices" style={{ 
                color: '#f97316', 
                textDecoration: 'none', 
                fontWeight: 500,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '24px'
            }}>
                ← Volver a facturas
            </Link>

            {/* Factura */}
            <div style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                overflow: 'hidden'
            }}>
                {/* Header */}
                <div style={{
                    backgroundColor: '#1e293b',
                    color: 'white',
                    padding: '32px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start'
                }}>
                    <div>
                        <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 700 }}>FACTURA</h1>
                        <p style={{ margin: '8px 0 0 0', color: '#94a3b8', fontSize: '14px' }}>
                            N° {String(invoice.id).padStart(7, '0')}
                        </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <p style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: '#818cf8' }}>Vevil</p>
                        <p style={{ margin: '4px 0 0 0', color: '#94a3b8', fontSize: '12px' }}>Sistema de Gestión</p>
                    </div>
                </div>

                {/* Info */}
                <div style={{ padding: '32px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '32px' }}>
                        {/* Cliente */}
                        <div>
                            <h3 style={{ margin: '0 0 12px 0', fontSize: '12px', textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '1px' }}>
                                Cliente
                            </h3>
                            <p style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#1e293b' }}>
                                {invoice.customer?.name || 'Cliente'}
                            </p>
                            <p style={{ margin: '4px 0 0 0', color: '#64748b' }}>
                                {invoice.customer?.email}
                            </p>
                            {invoice.customer?.tax_id && (
                                <p style={{ margin: '4px 0 0 0', color: '#64748b', fontFamily: 'monospace' }}>
                                    RUC: {invoice.customer.tax_id}
                                </p>
                            )}
                        </div>

                        {/* Fechas */}
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ marginBottom: '16px' }}>
                                <h3 style={{ margin: '0 0 4px 0', fontSize: '12px', textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '1px' }}>
                                    Fecha de Emisión
                                </h3>
                                <p style={{ margin: 0, fontSize: '16px', color: '#1e293b' }}>
                                    {formatDate(invoice.date)}
                                </p>
                            </div>
                            <div>
                                <span style={{
                                    padding: '6px 16px',
                                    backgroundColor: '#dcfce7',
                                    color: '#166534',
                                    borderRadius: '9999px',
                                    fontSize: '14px',
                                    fontWeight: 600
                                }}>
                                    Pagada
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Items */}
                    <div style={{ marginBottom: '32px' }}>
                        <h3 style={{ margin: '0 0 16px 0', fontSize: '12px', textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '1px' }}>
                            Detalle de Productos
                        </h3>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                                    <th style={{ padding: '12px 0', textAlign: 'left', fontWeight: 600, color: '#475569', fontSize: '14px' }}>Producto</th>
                                    <th style={{ padding: '12px 0', textAlign: 'center', fontWeight: 600, color: '#475569', fontSize: '14px' }}>Cantidad</th>
                                    <th style={{ padding: '12px 0', textAlign: 'right', fontWeight: 600, color: '#475569', fontSize: '14px' }}>Precio Unit.</th>
                                    <th style={{ padding: '12px 0', textAlign: 'right', fontWeight: 600, color: '#475569', fontSize: '14px' }}>Subtotal</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoice.items && invoice.items.map((item, index) => (
                                    <tr key={index} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '16px 0', color: '#1e293b' }}>
                                            {item.product?.name || `Producto #${item.productId}`}
                                        </td>
                                        <td style={{ padding: '16px 0', textAlign: 'center', color: '#64748b' }}>
                                            {item.quantity}
                                        </td>
                                        <td style={{ padding: '16px 0', textAlign: 'right', color: '#64748b' }}>
                                            {formatMoney(Number(item.priceAtSale), (invoice as any).currency || 'PYG')}
                                        </td>
                                        <td style={{ padding: '16px 0', textAlign: 'right', fontWeight: 500, color: '#1e293b' }}>
                                            {formatMoney(Number(item.priceAtSale) * item.quantity, (invoice as any).currency || 'PYG')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Totales */}
                    <div style={{ 
                        backgroundColor: '#f8fafc', 
                        padding: '24px', 
                        borderRadius: '12px',
                        marginLeft: 'auto',
                        width: '300px'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                            <span style={{ color: '#64748b' }}>Subtotal:</span>
                            <span style={{ color: '#1e293b' }}>{formatMoney(subtotal, (invoice as any).currency || 'PYG')}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                            <span style={{ color: '#64748b' }}>IVA (10%):</span>
                            <span style={{ color: '#1e293b' }}>{formatMoney(iva, (invoice as any).currency || 'PYG')}</span>
                        </div>
                        <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            paddingTop: '12px',
                            borderTop: '2px solid #e2e8f0'
                        }}>
                            <span style={{ fontWeight: 700, color: '#1e293b', fontSize: '18px' }}>Total:</span>
                            <span style={{ fontWeight: 700, color: '#f97316', fontSize: '18px' }}>
                                {formatMoney(Number(invoice.total), (invoice as any).currency || 'PYG')}
                            </span>
                        </div>
                    </div>

                    {/* Footer */}
                    <div style={{ 
                        marginTop: '32px', 
                        paddingTop: '24px', 
                        borderTop: '1px solid #e2e8f0',
                        textAlign: 'center',
                        color: '#94a3b8',
                        fontSize: '12px'
                    }}>
                        <p style={{ margin: 0 }}>Gracias por su preferencia</p>
                        <p style={{ margin: '4px 0 0 0' }}>Este documento es válido como comprobante de pago</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InvoiceDetail;
