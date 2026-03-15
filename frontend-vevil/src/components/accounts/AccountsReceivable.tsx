import React, { useState, useEffect } from 'react';
import { customersApi, Customer, invoicesApi, Invoice, Payment as ApiPayment } from '../../services/api';
import { formatMoney } from '../settings/Settings';

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
}

const AccountsReceivable: React.FC = () => {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
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

    const getCustomerAccounts = (): CustomerAccount[] => {
        return customers.map(customer => {
            const pendingInvoices = invoices.filter(inv =>
                inv.customerId === customer.id && (inv as any).status === 'pending'
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
                totalPaid
            };
        }).filter(acc => acc.totalDebt > 0 || acc.payments.length > 0)
          .sort((a, b) => b.totalDebt - a.totalDebt);
    };

    const customerAccounts = getCustomerAccounts();
    const totalPending = customerAccounts.reduce((sum, acc) => sum + acc.totalDebt, 0);
    const selectedAccount = customerAccounts.find(acc => acc.customer.id === selectedCustomerId);

    const handlePayment = async (e: React.FormEvent) => {
        e.preventDefault();
        const invoiceId = paymentForm.invoiceId ? parseInt(paymentForm.invoiceId, 10) : 0;
        if (!invoiceId || !paymentForm.amount) {
            alert('Seleccioná una factura e ingresá el monto');
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
        } catch (err: any) {
            alert(err.message || 'Error al registrar pago');
        }
    };

    const markInvoiceAsPaid = async (invoiceId: number) => {
        try {
            await invoicesApi.updateStatus(invoiceId, 'paid');
            loadData();
        } catch (err: any) {
            alert(err.message || 'Error al actualizar');
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-PY', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    if (loading) {
        return (
            <div style={{ padding: '32px', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ 
                        width: '48px', 
                        height: '48px', 
                        border: '4px solid #e2e8f0',
                        borderTopColor: '#dc2626',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 16px'
                    }} />
                    <p style={{ color: '#64748b' }}>Cargando cuentas...</p>
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </div>
            </div>
        );
    }

    return (
        <div style={{ padding: '32px' }}>
            {/* Header */}
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#1e293b', margin: 0 }}>
                    💳 Cuentas Corrientes
                </h1>
                <p style={{ fontSize: '16px', color: '#64748b', margin: '4px 0 0 0' }}>
                    Gestión de clientes con crédito y cobranzas
                </p>
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
                    <p style={{ fontSize: '48px', margin: '0 0 16px 0' }}>✅</p>
                    <p style={{ color: '#64748b', margin: 0 }}>
                        No hay cuentas pendientes de cobro
                    </p>
                    <p style={{ color: '#94a3b8', fontSize: '14px', margin: '8px 0 0 0' }}>
                        Los clientes con facturas "Pendientes" aparecerán aquí
                    </p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: selectedCustomerId ? '1fr 1fr' : '1fr', gap: '24px' }}>
                    {/* Lista de clientes */}
                    <div style={cardStyle}>
                        <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 600, color: '#1e293b' }}>
                            Clientes con Cuenta Corriente
                        </h3>
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
                                    {selectedAccount.customer.phone && (
                                        <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#64748b' }}>
                                            📞 {selectedAccount.customer.phone}
                                        </p>
                                    )}
                                </div>
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
                                        color: 'white',
                                        padding: '10px 20px'
                                    }}
                                >
                                    💵 Registrar Pago
                                </button>
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
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <span style={{ fontWeight: 700, color: '#1e293b' }}>
                                                    {formatMoney(Number(inv.total), 'PYG')}
                                                </span>
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
                                            <span style={{ fontWeight: 700, color: '#22c55e' }}>
                                                + {formatMoney(payment.amount, 'PYG')}
                                            </span>
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
                                            #{inv.id} – {formatMoney(Number(inv.total), (inv as any).currency || 'PYG')} ({formatDate(inv.date)})
                                        </option>
                                    ))}
                                </select>
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
        </div>
    );
};

export default AccountsReceivable;












