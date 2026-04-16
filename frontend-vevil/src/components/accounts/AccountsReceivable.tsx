import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { customersApi, Customer, invoicesApi, Invoice, Payment as ApiPayment, getErrorMessage } from '../../services/api';
import { useToast } from '../../hooks/useToast';
import { formatMoney } from '../settings/Settings';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { ErrorMessage } from '../ui/ErrorMessage';

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
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
};

interface CustomerAccount {
    customer: Customer;
    pendingInvoices: Invoice[];
    totalDebt: number;
    payments: (ApiPayment & { invoiceId: number })[];
    totalPaid: number;
    creditBalance: number;
}

const AccountsReceivable: React.FC = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentToDelete, setPaymentToDelete] = useState<{ invoiceId: number; paymentId: number; amount: number } | null>(null);
    const [deletingPayment, setDeletingPayment] = useState(false);
    const [paymentForm, setPaymentForm] = useState({
        invoiceId: '' as string,
        amount: '',
        method: 'cash'
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [customersData, invoicesData] = await Promise.all([
                customersApi.getAll(),
                invoicesApi.getAll()
            ]);
            setCustomers(customersData);
            setInvoices(invoicesData);
        } catch (err) {
            console.error('Error loading data:', err);
        } finally {
            setLoading(false);
        }
    };

    const customerAccounts = useMemo((): CustomerAccount[] => {
        return customers.map(customer => {
            const pendingInvoices = invoices.filter(inv =>
                inv.customerId === customer.id && inv.status === 'pending'
            );
            const totalDebt = pendingInvoices.reduce((sum, inv) => sum + Number(inv.total), 0);
            const customerInvoices = invoices.filter(inv => inv.customerId === customer.id);
            const payments: (ApiPayment & { invoiceId: number })[] = [];
            let totalPaid = 0;
            customerInvoices.forEach(inv => {
                (inv.payments || []).forEach((p: ApiPayment) => {
                    payments.push({ ...p, invoiceId: inv.id });
                    totalPaid += Number(p.amount);
                });
            });
            payments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            return {
                customer,
                pendingInvoices,
                totalDebt,
                payments,
                totalPaid,
                creditBalance: customer.creditBalance || 0,
            };
        }).sort((a, b) => b.totalDebt - a.totalDebt);
    }, [customers, invoices]);

    const totalPending = useMemo(() => 
        customerAccounts.reduce((sum, acc) => sum + acc.totalDebt, 0),
        [customerAccounts]
    );

    const selectedAccount = useMemo(() =>
        customerAccounts.find(acc => acc.customer.id === selectedCustomerId),
        [customerAccounts, selectedCustomerId]
    );

    const handlePayment = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        const invoiceId = paymentForm.invoiceId ? parseInt(paymentForm.invoiceId, 10) : 0;
        if (!invoiceId || !paymentForm.amount) {
            showToast('Seleccioná una factura e ingresá el monto', 'error');
            return;
        }
        try {
            await invoicesApi.addPayment(invoiceId, {
                amount: parseFloat(paymentForm.amount),
                method: paymentForm.method
            });
            setShowPaymentModal(false);
            setPaymentForm({ invoiceId: '', amount: '', method: 'cash' });
            loadData();
            showToast('Pago registrado exitosamente', 'success');
        } catch (err) {
            showToast(getErrorMessage(err, 'Error al registrar pago'), 'error');
        }
    }, [paymentForm, loadData, showToast]);

    const markInvoiceAsPaid = useCallback(async (invoiceId: number) => {
        try {
            await invoicesApi.updateStatus(invoiceId, 'paid');
            loadData();
            showToast('Factura marcada como pagada', 'success');
        } catch (err) {
            showToast(getErrorMessage(err, 'Error al actualizar'), 'error');
        }
    }, [loadData, showToast]);

    const handleDeletePayment = useCallback(async () => {
        if (!paymentToDelete) return;
        try {
            setDeletingPayment(true);
            await invoicesApi.deletePayment(paymentToDelete.invoiceId, paymentToDelete.paymentId);
            setPaymentToDelete(null);
            loadData();
            showToast('Pago eliminado exitosamente', 'success');
        } catch (err) {
            showToast(getErrorMessage(err, 'Error al eliminar pago'), 'error');
        } finally {
            setDeletingPayment(false);
        }
    }, [paymentToDelete, loadData, showToast]);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-PY', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    if (loading) {
        return <LoadingSpinner message="Cargando cuentas..." color="#dc2626" />;
    }

    return (
        <div className="responsive-padding" style={{ padding: '32px' }}>
            {error && (
                <ErrorMessage
                    message={error}
                    onRetry={loadData}
                    onDismiss={() => setError(null)}
                />
            )}
            {/* Header */}
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#1e293b', margin: 0 }}>
                    💳 Cuentas Corrientes
                </h1>
                <p style={{ fontSize: '16px', color: '#64748b', margin: '4px 0 0 0' }}>
                    Gestión de clientes con crédito y cobranzas
                </p>
<div style={{ marginTop: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <button
                        onClick={() => navigate('/customers')}
                        style={{
                            ...buttonStyle,
                            backgroundColor: '#6366f1',
                            color: 'white'
                        }}
                    >
                        👤 Ver Clientes
                    </button>
                    <button
                        onClick={() => navigate('/invoices')}
                        style={{
                            ...buttonStyle,
                            backgroundColor: '#f59e0b',
                            color: 'white'
                        }}
                    >
                        🧾 Nueva Factura
                    </button>
                </div>
            </div>

            {/* Resumen */}
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: '16px',
                marginBottom: '24px'
            }}>
                <div style={{ ...cardStyle, borderLeft: '4px solid #dc2626' }}>
                    <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>💰 Total Pendiente</p>
                    <p style={{ fontSize: '28px', fontWeight: 700, color: '#dc2626', margin: '8px 0 0 0' }}>
                        {formatMoney(totalPending, 'PYG')}
                    </p>
                </div>
                <div style={{ ...cardStyle, borderLeft: '4px solid #f97316' }}>
                    <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>👥 Clientes con Deuda</p>
                    <p style={{ fontSize: '28px', fontWeight: 700, color: '#f97316', margin: '8px 0 0 0' }}>
                        {customerAccounts.filter(a => a.totalDebt > 0).length}
                    </p>
                </div>
                <div style={{ ...cardStyle, borderLeft: '4px solid #3b82f6' }}>
                    <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>🧾 Facturas Pendientes</p>
                    <p style={{ fontSize: '28px', fontWeight: 700, color: '#3b82f6', margin: '8px 0 0 0' }}>
                        {customerAccounts.reduce((sum, a) => sum + a.pendingInvoices.length, 0)}
                    </p>
                </div>
            </div>

            {/* Lista de clientes con deuda */}
            {customerAccounts.length === 0 ? (
                <div style={{ ...cardStyle, textAlign: 'center', padding: '48px' }}>
                    <p style={{ fontSize: '48px', margin: '0 0 16px 0' }}>👥</p>
                    <p style={{ color: '#64748b', margin: 0 }}>
                        No hay clientes registrados
                    </p>
                    <p style={{ color: '#94a3b8', fontSize: '14px', margin: '8px 0 0 0' }}>
                        Hacé clic en "Agregar Cliente" para crear uno y gestionar su cuenta corriente
                    </p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: selectedCustomerId ? '1fr 1fr' : '1fr', gap: '24px' }}>
                    {/* Lista de clientes */}
                    <div style={cardStyle}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#1e293b' }}>
                                Clientes con Cuenta Corriente
                            </h3>
<button
                                onClick={() => navigate('/customers')}
                                style={{
                                    ...buttonStyle,
                                    backgroundColor: '#22c55e',
                                    color: 'white',
                                    fontSize: '13px'
                                }}
                            >
                                ➕ Agregar Cliente
                            </button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {customerAccounts.map(account => (
                                <div
                                    key={account.customer.id}
                                    onClick={() => setSelectedCustomerId(
                                        selectedCustomerId === account.customer.id ? null : account.customer.id
                                    )}
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '16px',
                                        backgroundColor: selectedCustomerId === account.customer.id ? '#fef3c7' : '#f8fafc',
                                        border: selectedCustomerId === account.customer.id ? '2px solid #f97316' : '1px solid #e2e8f0',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <div>
                                        <p style={{ margin: 0, fontWeight: 600, color: '#1e293b' }}>
                                            {account.customer.name}
                                        </p>
                                        <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                                            {account.pendingInvoices.length} factura(s) pendiente(s)
                                        </p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <p style={{ 
                                            margin: 0, 
                                            fontWeight: 700, 
                                            fontSize: '18px',
                                            color: account.totalDebt > 0 ? '#dc2626' : '#22c55e'
                                        }}>
                                            {formatMoney(account.totalDebt, 'PYG')}
                                        </p>
                                        {account.totalDebt > 0 && (
                                            <span style={{
                                                fontSize: '10px',
                                                color: '#dc2626',
                                                backgroundColor: '#fee2e2',
                                                padding: '2px 8px',
                                                borderRadius: '9999px'
                                            }}>
                                                DEBE
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Detalle del cliente seleccionado */}
                    {selectedAccount && (
                        <div style={cardStyle}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 600, color: '#1e293b' }}>
                                        {selectedAccount.customer.name}
                                    </h3>
                                    <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#64748b' }}>
                                        {selectedAccount.customer.email}
                                    </p>
                                    {selectedAccount.customer.phones?.[0] && (
                                        <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#64748b' }}>
                                            📞 {selectedAccount.customer.phones[0].number}
                                        </p>
                                    )}
                                </div>
<div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                    <button
                                        onClick={() => navigate(`/customers?edit=${selectedAccount.customer.id}`)}
                                        style={{
                                            ...buttonStyle,
                                            backgroundColor: '#6366f1',
                                            color: 'white'
                                        }}
                                    >
                                        ✏️ Editar Cliente
                                    </button>
                                    <button
                                        onClick={() => {
                                            const firstId = selectedAccount.pendingInvoices[0]?.id;
                                            setPaymentForm({
                                                invoiceId: firstId ? String(firstId) : '',
                                                amount: '',
                                                method: 'cash'
                                            });
                                            setShowPaymentModal(true);
                                        }}
                                        style={{
                                            ...buttonStyle,
                                            backgroundColor: '#22c55e',
                                            color: 'white'
                                        }}
                                    >
                                        💰 Acreditar Pago
                                    </button>
                                    <button
                                        onClick={() => navigate(`/invoices?createForCustomer=${selectedAccount.customer.id}`)}
                                        style={{
                                            ...buttonStyle,
                                            backgroundColor: '#f97316',
                                            color: 'white'
                                        }}
                                    >
                                        🧾 Crear Factura
                                    </button>
                                </div>
                            </div>

                            {/* Balance */}
                            <div style={{
                                backgroundColor: '#f8fafc',
                                padding: '16px',
                                borderRadius: '8px',
                                marginBottom: '24px',
                                display: 'flex',
                                justifyContent: 'space-around',
                                textAlign: 'center'
                            }}>
                                <div>
                                    <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>Total Facturado</p>
                                    <p style={{ margin: '4px 0 0 0', fontSize: '20px', fontWeight: 700, color: '#3b82f6' }}>
                                        {formatMoney(
                                            selectedAccount.pendingInvoices.reduce((s, i) => s + Number(i.total), 0) + selectedAccount.totalPaid,
                                            'PYG'
                                        )}
                                    </p>
                                </div>
                                <div>
                                    <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>Total Pagado</p>
                                    <p style={{ margin: '4px 0 0 0', fontSize: '20px', fontWeight: 700, color: '#22c55e' }}>
                                        {formatMoney(selectedAccount.totalPaid, 'PYG')}
                                    </p>
                                </div>
                                <div>
                                    <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>Saldo Pendiente</p>
                                    <p style={{ margin: '4px 0 0 0', fontSize: '20px', fontWeight: 700, color: '#dc2626' }}>
                                        {formatMoney(selectedAccount.totalDebt, 'PYG')}
                                    </p>
                                </div>
                                {selectedAccount.creditBalance > 0 && (
                                    <div>
                                        <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>Saldo a Favor</p>
                                        <p style={{ margin: '4px 0 0 0', fontSize: '20px', fontWeight: 700, color: '#22c55e' }}>
                                            {formatMoney(selectedAccount.creditBalance, 'PYG')}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Facturas pendientes */}
                            {selectedAccount.pendingInvoices.length > 0 && (
                                <div style={{ marginBottom: '24px' }}>
                                    <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#64748b', textTransform: 'uppercase' }}>
                                        Facturas Pendientes
                                    </h4>
                                    {selectedAccount.pendingInvoices.map(inv => (
                                        <div key={inv.id} style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: '12px',
                                            backgroundColor: '#fef3c7',
                                            borderRadius: '8px',
                                            marginBottom: '8px'
                                        }}>
                                            <div>
                                                <span style={{ fontWeight: 600, color: '#f97316' }}>#{inv.id}</span>
                                                <span style={{ marginLeft: '12px', color: '#64748b', fontSize: '14px' }}>
                                                    {formatDate(inv.date)}
                                                </span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                                <span style={{ fontWeight: 700, color: '#1e293b' }}>
                                                    {formatMoney(Number(inv.total), inv.currency ?? 'PYG')}
                                                </span>
                                                    <button
                                                        type="button"
                                                        onClick={async () => {
                                                            try {
                                                                const result = await invoicesApi.sendReminder(inv.id);
                                                                if (result.sent) {
                                                                    showToast('Recordatorio enviado por email al cliente.', 'success');
                                                                } else {
                                                                    showToast(result.reason || 'No se pudo enviar', 'warning');
                                                                }
                                                            } catch (e) {
                                                                showToast(getErrorMessage(e, 'Error al enviar recordatorio'), 'error');
                                                            }
                                                        }}
                                                        style={{
                                                            ...buttonStyle,
                                                            backgroundColor: '#eff6ff',
                                                            color: '#1d4ed8',
                                                            fontSize: '12px',
                                                            padding: '6px 12px'
                                                        }}
                                                        title="Enviar email de recordatorio al cliente"
                                                    >
                                                        📧 Recordatorio
                                                    </button>
                                                <button
                                                    onClick={() => markInvoiceAsPaid(inv.id)}
                                                    style={{
                                                        ...buttonStyle,
                                                        backgroundColor: '#dcfce7',
                                                        color: '#166534',
                                                        fontSize: '12px',
                                                        padding: '6px 12px'
                                                    }}
                                                >
                                                    ✓ Marcar Pagada
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Historial de pagos */}
                            {selectedAccount.payments.length > 0 && (
                                <div>
                                    <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#64748b', textTransform: 'uppercase' }}>
                                        Historial de Pagos
                                    </h4>
                                    {selectedAccount.payments.sort((a, b) => 
                                        new Date(b.date).getTime() - new Date(a.date).getTime()
                                    ).map(payment => (
                                        <div key={payment.id} style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: '12px',
                                            backgroundColor: '#f0fdf4',
                                            borderRadius: '8px',
                                            marginBottom: '8px'
                                        }}>
                                            <div>
                                                <span style={{ color: '#64748b', fontSize: '14px' }}>
                                                    {formatDate(payment.date)}
                                                </span>
                                                <span style={{ marginLeft: '12px', fontSize: '12px', color: '#94a3b8' }}>
                                                    Factura #{payment.invoiceId} · {payment.method === 'cash' && '💵 Efectivo'}
                                                    {payment.method === 'card' && '💳 Tarjeta'}
                                                    {payment.method === 'transfer' && '🏦 Transferencia'}
                                                </span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span style={{ fontWeight: 700, color: '#22c55e' }}>
                                                    + {formatMoney(payment.amount, 'PYG')}
                                                </span>
                                                <button
                                                    onClick={() => setPaymentToDelete({ invoiceId: payment.invoiceId, paymentId: payment.id, amount: payment.amount })}
                                                    style={{
                                                        background: 'none',
                                                        border: 'none',
                                                        cursor: 'pointer',
                                                        color: '#ef4444',
                                                        padding: '4px',
                                                        fontSize: '16px'
                                                    }}
                                                    title="Eliminar pago"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Modal de pago */}
            {showPaymentModal && selectedAccount && (
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
                        maxWidth: '400px'
                    }}>
                        <h2 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: 600, color: '#1e293b' }}>
                            💵 Registrar Pago
                        </h2>
                        <p style={{ margin: '0 0 24px 0', color: '#64748b' }}>
                            Cliente: <strong>{selectedAccount.customer.name}</strong>
                        </p>

                        <form onSubmit={handlePayment}>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                                    Aplicar a factura *
                                </label>
                                <select
                                    value={paymentForm.invoiceId}
                                    onChange={(e) => setPaymentForm({ ...paymentForm, invoiceId: e.target.value })}
                                    required
                                    style={inputStyle}
                                >
                                    <option value="">Seleccionar factura</option>
                                    {selectedAccount.pendingInvoices.map(inv => (
                                        <option key={inv.id} value={inv.id}>
                                            #{inv.id} – {formatMoney(Number(inv.total), inv.currency ?? 'PYG')} ({formatDate(inv.date)})
                                        </option>
                                    ))}
                                </select>

                                {selectedAccount.creditBalance > 0 && paymentForm.invoiceId && (() => {
                                    const inv = selectedAccount.pendingInvoices.find(i => i.id === Number(paymentForm.invoiceId));
                                    if (inv) {
                                        const apply = Math.min(selectedAccount.creditBalance, Number(inv.total));
                                        return (
                                            <div style={{
                                                marginTop: '12px',
                                                padding: '12px',
                                                backgroundColor: '#f0fdf4',
                                                borderRadius: '8px',
                                                fontSize: '14px',
                                                color: '#166534'
                                            }}>
                                                💰 Cliente tiene saldo a favor de {formatMoney(selectedAccount.creditBalance, 'PYG')}.<br />
                                                Se aplicarán automáticamente <strong>{formatMoney(apply, 'PYG')}</strong> a esta factura.<br />
                                                <span style={{ fontSize: '12px', color: '#374151' }}>
                                                    El monto ingresado se cubrirá primero con saldo a favor y el resto con el método de pago seleccionado.
                                                </span>
                                            </div>
                                        );
                                    }
                                    return null;
                                })()}
                            </div>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                                    Monto *
                                </label>
                                <input
                                    type="number"
                                    value={paymentForm.amount}
                                    onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                                    required
                                    min="0.01"
                                    step="0.01"
                                    style={inputStyle}
                                    placeholder="0"
                                />
                                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                                    Deuda total del cliente: {formatMoney(selectedAccount.totalDebt, 'PYG')}
                                </p>
                            </div>
                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                                    Método de pago
                                </label>
                                <select
                                    value={paymentForm.method}
                                    onChange={(e) => setPaymentForm({ ...paymentForm, method: e.target.value })}
                                    style={inputStyle}
                                >
                                    <option value="cash">💵 Efectivo</option>
                                    <option value="card">💳 Tarjeta</option>
                                    <option value="transfer">🏦 Transferencia</option>
                                </select>
                            </div>

                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                <button
                                    type="button"
                                    onClick={() => setShowPaymentModal(false)}
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
                                    style={{
                                        ...buttonStyle,
                                        backgroundColor: '#22c55e',
                                        color: 'white',
                                        padding: '12px 24px'
                                    }}
                                >
                                    Registrar Pago
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal de confirmación para eliminar pago */}
            {paymentToDelete && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        padding: '24px',
                        maxWidth: '400px',
                        width: '90%',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                    }}>
                        <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 600, color: '#1f2937' }}>
                            Confirmar eliminación
                        </h3>
                        <p style={{ margin: '0 0 24px 0', color: '#64748b', fontSize: '14px' }}>
                            ¿Estás seguro de que deseas eliminar el pago de <strong>{formatMoney(paymentToDelete.amount, 'PYG')}</strong>?
                            <br /><br />
                            Esta acción no se puede deshacer.
                        </p>
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => setPaymentToDelete(null)}
                                disabled={deletingPayment}
                                style={{
                                    padding: '10px 20px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    backgroundColor: '#f1f5f9',
                                    color: '#475569',
                                    cursor: deletingPayment ? 'not-allowed' : 'pointer',
                                    fontWeight: 500
                                }}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleDeletePayment}
                                disabled={deletingPayment}
                                style={{
                                    padding: '10px 20px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    backgroundColor: '#ef4444',
                                    color: 'white',
                                    cursor: deletingPayment ? 'not-allowed' : 'pointer',
                                    fontWeight: 500,
                                    opacity: deletingPayment ? 0.7 : 1
                                }}
                            >
                                {deletingPayment ? 'Eliminando...' : 'Eliminar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AccountsReceivable;