import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { invoicesApi, Invoice, getErrorMessage } from '../../services/api';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { ErrorMessage } from '../ui/ErrorMessage';
import { formatMoney, getCompanyConfig } from '../settings/Settings';
import { exportInvoiceToPdf } from '../../utils/exportInvoicePdf';

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
        } catch (err) {
            setError(getErrorMessage(err, 'Error al cargar la factura'));
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
        return <LoadingSpinner message="Cargando factura..." color="#f97316" />;
    }

    if (error || !invoice) {
        return (
            <div style={{ padding: '32px' }}>
                <div style={{ marginBottom: '16px' }}>
                    <Link to="/invoices" style={{ color: '#f97316', textDecoration: 'none', fontWeight: 500 }}>
                        ← Volver a facturas
                    </Link>
                </div>
                <ErrorMessage
                    message={error || 'Factura no encontrada'}
                    onRetry={loadInvoice}
                    onDismiss={() => setError(null)}
                />
            </div>
        );
    }

    const subtotal = Number(invoice.total) / (1 + IVA_RATE);
    const iva = Number(invoice.total) - subtotal;
    const company = getCompanyConfig();
    const currency = invoice.currency ?? 'PYG';

    return (
        <div style={{ padding: '32px' }}>
            {/* Volver + Descargar PDF */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
                <Link to="/invoices" style={{
                    color: '#f97316',
                    textDecoration: 'none',
                    fontWeight: 500,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px'
                }}>
                    ← Volver a facturas
                </Link>
                <button
                    type="button"
                    onClick={() => exportInvoiceToPdf(invoice)}
                    style={{
                        padding: '10px 18px',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        backgroundColor: 'white',
                        color: '#64748b',
                        fontWeight: 500,
                        cursor: 'pointer',
                    }}
                    title="Descargar factura en PDF"
                >
                    📄 Descargar PDF
                </button>
            </div>

            {/* Factura */}
            <div style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                overflow: 'hidden'
            }}>
                {/* Header centrado con logo */}
                <div style={{
                    backgroundColor: '#1e293b',
                    color: 'white',
                    padding: '32px',
                    textAlign: 'center'
                }}>
                    <img
                        src="/logoVevil.jpg"
                        alt="Logo Vevil"
                        style={{
                            height: '40px',
                            width: 'auto',
                            objectFit: 'contain',
                            marginBottom: '12px'
                        }}
                        onError={(e) => {
                            e.currentTarget.style.display = 'none';
                        }}
                    />
                    <h1 style={{ margin: 0, fontSize: '32px', fontWeight: 700, letterSpacing: '2px' }}>FACTURA</h1>
                    <p style={{ margin: '8px 0 0 0', color: '#94a3b8', fontSize: '16px', fontFamily: 'monospace' }}>
                        N° {String(invoice.id).padStart(7, '0')}
                    </p>
                </div>

                {/* Datos de empresa centrados */}
                <div style={{
                    padding: '24px 32px',
                    backgroundColor: '#f8fafc',
                    borderBottom: '1px solid #e2e8f0',
                    textAlign: 'center'
                }}>
                    <p style={{ margin: 0, fontWeight: 600, color: '#1e293b', fontSize: '14px' }}>
                        {company?.name || 'Vevil - Sistema de Gestión'}
                    </p>
                    {company?.ruc && <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '12px' }}>RUC: {company.ruc}</p>}
                    {company?.address && <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '12px' }}>{company.address}</p>}
                    {company?.city && <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '12px' }}>{company.city}</p>}
                    {company?.phone && <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '12px' }}>Tel: {company.phone}</p>}
                    {company?.email && <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '12px' }}>{company.email}</p>}
                </div>

                {/* Info principal */}
                <div style={{ padding: '32px' }}>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '48px',
                        marginBottom: '32px',
                        borderBottom: '2px solid #e2e8f0',
                        paddingBottom: '24px'
                    }}>
                        {/* Cliente */}
                        <div>
                            <h3 style={{
                                margin: '0 0 12px 0',
                                fontSize: '12px',
                                textTransform: 'uppercase',
                                color: '#94a3b8',
                                letterSpacing: '1.5px',
                                fontWeight: 600
                            }}>
                                Cliente
                            </h3>
                            <p style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#1e293b' }}>
                                {invoice.customer?.name || '—'}
                            </p>
                            {invoice.customer?.email && (
                                <p style={{ margin: '6px 0 0 0', color: '#64748b', fontSize: '14px' }}>
                                    {invoice.customer.email}
                                </p>
                            )}
                            {invoice.customer?.tax_id && (
                                <p style={{ margin: '6px 0 0 0', color: '#64748b', fontSize: '14px', fontFamily: 'monospace' }}>
                                    RUC: {invoice.customer.tax_id}
                                </p>
                            )}
                        </div>

                        {/* Fecha + Estado */}
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ marginBottom: '12px' }}>
                                <h3 style={{
                                    margin: '0 0 4px 0',
                                    fontSize: '12px',
                                    textTransform: 'uppercase',
                                    color: '#94a3b8',
                                    letterSpacing: '1.5px',
                                    fontWeight: 600
                                }}>
                                    Fecha de Emisión
                                </h3>
                                <p style={{ margin: 0, fontSize: '16px', color: '#1e293b' }}>
                                    {formatDate(invoice.date)}
                                </p>
                            </div>
                            <div>
                                <h3 style={{
                                    margin: '0 0 8px 0',
                                    fontSize: '12px',
                                    textTransform: 'uppercase',
                                    color: '#94a3b8',
                                    letterSpacing: '1.5px',
                                    fontWeight: 600
                                }}>
                                    Estado
                                </h3>
                                {invoice.status === 'paid' && (
                                    <span style={{
                                        padding: '8px 20px',
                                        backgroundColor: '#dcfce7',
                                        color: '#166534',
                                        borderRadius: '9999px',
                                        fontSize: '15px',
                                        fontWeight: 700,
                                        display: 'inline-block'
                                    }}>
                                        ✓ Pagada
                                    </span>
                                )}
                                {invoice.status === 'pending' && (
                                    <span style={{
                                        padding: '8px 20px',
                                        backgroundColor: '#fef3c7',
                                        color: '#92400e',
                                        borderRadius: '9999px',
                                        fontSize: '15px',
                                        fontWeight: 700,
                                        display: 'inline-block'
                                    }}>
                                        ⏳ Pendiente
                                    </span>
                                )}
                                {invoice.status === 'cancelled' && (
                                    <span style={{
                                        padding: '8px 20px',
                                        backgroundColor: '#fee2e2',
                                        color: '#991b1b',
                                        borderRadius: '9999px',
                                        fontSize: '15px',
                                        fontWeight: 700,
                                        display: 'inline-block'
                                    }}>
                                        ✕ Anulada
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Tabla de ítems */}
                    <h3 style={{
                        margin: '0 0 16px 0',
                        fontSize: '14px',
                        textTransform: 'uppercase',
                        color: '#94a3b8',
                        letterSpacing: '1.5px',
                        fontWeight: 600
                    }}>
                        Detalle de Productos
                    </h3>

                    <div style={{
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        marginBottom: '32px'
                    }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#f8fafc' }}>
                                    <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '12px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                        Producto
                                    </th>
                                    <th style={{ padding: '14px 16px', textAlign: 'center', fontSize: '12px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                        Cant.
                                    </th>
                                    <th style={{ padding: '14px 16px', textAlign: 'right', fontSize: '12px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                        P. Unit.
                                    </th>
                                    <th style={{ padding: '14px 16px', textAlign: 'right', fontSize: '12px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                        Subtotal
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {(invoice.items || []).map((item, idx) => {
                                    const price = Number(item.priceAtSale);
                                    const subtotal = price * item.quantity;
                                    return (
                                        <tr key={idx} style={{ borderTop: '1px solid #e2e8f0' }}>
                                            <td style={{ padding: '14px 16px', fontSize: '14px', color: '#1e293b' }}>
                                                {item.product?.name ?? `Producto #${item.productId}`}
                                            </td>
                                            <td style={{ padding: '14px 16px', textAlign: 'center', fontSize: '14px', color: '#64748b' }}>
                                                {item.quantity}
                                            </td>
                                            <td style={{ padding: '14px 16px', textAlign: 'right', fontSize: '14px', color: '#64748b' }}>
                                                {formatMoney(price, currency)}
                                            </td>
                                            <td style={{ padding: '14px 16px', textAlign: 'right', fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>
                                                {formatMoney(subtotal, currency)}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Totales */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        marginBottom: '32px'
                    }}>
                        <div style={{
                            width: '300px',
                            border: '1px solid #e2e8f0',
                            borderRadius: '12px',
                            padding: '20px',
                            backgroundColor: '#f8fafc'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span style={{ color: '#64748b', fontSize: '14px' }}>Subtotal:</span>
                                <span style={{ color: '#1e293b', fontSize: '14px', fontWeight: 500 }}>
                                    {formatMoney(subtotal, currency)}
                                </span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                <span style={{ color: '#64748b', fontSize: '14px' }}>IVA (10%):</span>
                                <span style={{ color: '#1e293b', fontSize: '14px', fontWeight: 500 }}>
                                    {formatMoney(iva, currency)}
                                </span>
                            </div>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                borderTop: '2px solid #e2e8f0',
                                paddingTop: '12px',
                                marginTop: '4px'
                            }}>
                                <span style={{ color: '#1e293b', fontSize: '18px', fontWeight: 700 }}>Total:</span>
                                <span style={{ color: '#1e293b', fontSize: '18px', fontWeight: 700 }}>
                                    {formatMoney(total, currency)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InvoiceDetail;
