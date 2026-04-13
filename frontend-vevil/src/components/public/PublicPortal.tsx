import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { formatMoney, getCompanyConfig } from '../settings/Settings';
import { fadeInUp } from '../../hooks/useAnimations';

interface InvoiceItem {
    productName: string;
    quantity: number;
    price: number;
    total: number;
}

interface Invoice {
    id: number;
    date: string;
    total: number;
    currency: string;
    status: string;
    items: InvoiceItem[];
}

interface User {
    id: number;
    email: string;
    name: string;
    customerId: number | null;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const PublicPortal: React.FC = () => {
    const [view, setView] = useState<'search' | 'login' | 'register' | 'dashboard'>('search');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [error, setError] = useState('');
    const [searched, setSearched] = useState(false);
    const [user, setUser] = useState<User | null>(null);

    const company = getCompanyConfig();

    useEffect(() => {
        const savedUser = localStorage.getItem('vevil_client_user');
        const savedToken = localStorage.getItem('vevil_client_token');
        if (savedUser && savedToken) {
            setUser(JSON.parse(savedUser));
            setView('dashboard');
            loadInvoices(savedToken);
        }
    }, []);

    const loadInvoices = async (token: string) => {
        try {
            const response = await fetch(`${API_URL}/api/client/invoices`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.invoices) {
                setInvoices(data.invoices);
            }
        } catch (err) {
            console.error('Error loading invoices:', err);
        }
    };

    const handleLogin = async () => {
        if (!email.trim() || !password) {
            setError('Por favor completá todos los campos');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await fetch(`${API_URL}/api/client/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await response.json();

            if (data.success) {
                localStorage.setItem('vevil_client_token', data.token);
                localStorage.setItem('vevil_client_user', JSON.stringify(data.user));
                setUser(data.user);
                setView('dashboard');
                loadInvoices(data.token);
            } else {
                setError(data.error || 'Error al iniciar sesión');
            }
        } catch (err) {
            setError('Error de conexión');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async () => {
        if (!email.trim() || !password || !name.trim()) {
            setError('Por favor completá todos los campos');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await fetch(`${API_URL}/api/client/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await response.json();

            if (data.success) {
                localStorage.setItem('vevil_client_token', data.token);
                localStorage.setItem('vevil_client_user', JSON.stringify(data.user));
                setUser(data.user);
                setView('dashboard');
            } else {
                setError(data.error || 'Error al registrarse');
            }
        } catch (err) {
            setError('Error de conexión');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('vevil_client_token');
        localStorage.removeItem('vevil_client_user');
        setUser(null);
        setView('search');
        setInvoices([]);
    };

    const searchInvoicesPublic = async () => {
        if (!email.trim()) {
            setError('Por favor ingresá tu email');
            return;
        }

        setLoading(true);
        setError('');
        setSearched(true);

        try {
            const response = await fetch(`${API_URL}/api/public/invoices-by-email?email=${encodeURIComponent(email)}`);
            const data = await response.json();

            if (data.error) {
                setError(data.error);
                setInvoices([]);
            } else {
                setInvoices(data.invoices || []);
            }
        } catch (err) {
            setError('Error al buscar facturas');
            setInvoices([]);
        } finally {
            setLoading(false);
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'paid': return { label: 'Pagada', color: '#22c55e', bg: '#dcfce7' };
            case 'pending': return { label: 'Pendiente', color: '#f59e0b', bg: '#fef3c7' };
            case 'cancelled': return { label: 'Anulada', color: '#64748b', bg: '#f1f5f9' };
            default: return { label: status, color: '#64748b', bg: '#f1f5f9' };
        }
    };

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('es-PY', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    const totalPending = invoices.filter(i => i.status === 'pending').reduce((sum, i) => sum + i.total, 0);

    return (
        <motion.div 
            initial="hidden" 
            animate="visible" 
            variants={fadeInUp}
            style={{ 
                minHeight: '100vh', 
                background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                padding: '40px 20px'
            }}
        >
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    {company.logoUrl && (
                        <img src={company.logoUrl} alt="Logo" style={{ width: '80px', height: '80px', borderRadius: '12px', marginBottom: '16px' }} />
                    )}
                    <h1 style={{ fontSize: '32px', fontWeight: 700, color: '#1e293b', margin: '0 0 8px 0' }}>
                        {company.name || 'Vevil'}
                    </h1>
                    <p style={{ fontSize: '16px', color: '#64748b', margin: 0 }}>
                        Portal de clientes
                    </p>
                </div>

                {/* User info when logged in */}
                {user && (
                    <div style={{ 
                        backgroundColor: 'white', 
                        borderRadius: '16px', 
                        padding: '20px 24px', 
                        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                        marginBottom: '24px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '12px'
                    }}>
                        <div>
                            <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>Hola, <strong style={{ color: '#1e293b' }}>{user.name || user.email}</strong></p>
                            {totalPending > 0 && (
                                <p style={{ fontSize: '14px', color: '#f59e0b', margin: '4px 0 0 0' }}>
                                    💰 Facturas pendientes: {formatMoney(totalPending, 'PYG')}
                                </p>
                            )}
                        </div>
                        <button
                            onClick={handleLogout}
                            style={{
                                padding: '8px 16px',
                                backgroundColor: '#f1f5f9',
                                color: '#475569',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '14px',
                                cursor: 'pointer'
                            }}
                        >
                            Cerrar sesión
                        </button>
                    </div>
                )}

                {/* Search view */}
                {view === 'search' && (
                    <>
                        <div style={{ 
                            backgroundColor: 'white', 
                            borderRadius: '16px', 
                            padding: '32px', 
                            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                            marginBottom: '24px'
                        }}>
                            <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#1e293b', marginBottom: '16px' }}>
                                📧 Consultá tus facturas
                            </h2>
                            <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '20px' }}>
                                Ingresá tu email para ver todas tus facturas
                            </p>
                            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && searchInvoicesPublic()}
                                    placeholder="tu@email.com"
                                    style={{
                                        flex: '1',
                                        minWidth: '200px',
                                        padding: '14px 18px',
                                        border: '2px solid #e2e8f0',
                                        borderRadius: '10px',
                                        fontSize: '16px',
                                        outline: 'none'
                                    }}
                                />
                                <button
                                    onClick={searchInvoicesPublic}
                                    disabled={loading}
                                    style={{
                                        padding: '14px 28px',
                                        backgroundColor: loading ? '#9ca3af' : '#22c55e',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '10px',
                                        fontSize: '16px',
                                        fontWeight: 600,
                                        cursor: loading ? 'not-allowed' : 'pointer',
                                    }}
                                >
                                    {loading ? 'Buscando...' : '🔍 Buscar'}
                                </button>
                            </div>
                        </div>

                        {/* Error message */}
                        {error && (
                            <div style={{ 
                                backgroundColor: '#fee2e2', 
                                color: '#dc2626', 
                                padding: '16px 20px', 
                                borderRadius: '12px', 
                                marginBottom: '24px' 
                            }}>
                                {error}
                            </div>
                        )}

                        {/* Register/Login links */}
                        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                            <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '12px' }}>
                                ¿Tenés una cuenta?
                            </p>
                            <button
                                onClick={() => setView('login')}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: '#3b82f6',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    cursor: 'pointer',
                                    marginRight: '12px'
                                }}
                            >
                                Iniciar sesión
                            </button>
                            <button
                                onClick={() => setView('register')}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: 'white',
                                    color: '#22c55e',
                                    border: '2px solid #22c55e',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    cursor: 'pointer'
                                }}
                            >
                                Crear cuenta
                            </button>
                        </div>

                        {/* Results */}
                        {searched && !loading && invoices.length > 0 && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {invoices.map((invoice) => {
                                    const status = getStatusLabel(invoice.status);
                                    return (
                                        <div
                                            key={invoice.id}
                                            style={{
                                                backgroundColor: 'white',
                                                borderRadius: '16px',
                                                padding: '24px',
                                                boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                                            }}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                                                <div>
                                                    <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#1e293b', margin: '0 0 4px 0' }}>
                                                        Factura #{String(invoice.id).padStart(7, '0')}
                                                    </h3>
                                                    <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
                                                        {formatDate(invoice.date)}
                                                    </p>
                                                </div>
                                                <span style={{
                                                    padding: '6px 14px',
                                                    borderRadius: '20px',
                                                    fontSize: '13px',
                                                    fontWeight: 600,
                                                    backgroundColor: status.bg,
                                                    color: status.color,
                                                }}>
                                                    {status.label}
                                                </span>
                                            </div>
                                            <div style={{ textAlign: 'right', marginTop: '16px', paddingTop: '16px', borderTop: '2px solid #e2e8f0' }}>
                                                <span style={{ fontSize: '22px', fontWeight: 700, color: '#1e293b' }}>
                                                    Total: {formatMoney(invoice.total, invoice.currency)}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </>
                )}

                {/* Login view */}
                {view === 'login' && (
                    <div style={{ 
                        backgroundColor: 'white', 
                        borderRadius: '16px', 
                        padding: '32px', 
                        boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
                    }}>
                        <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#1e293b', marginBottom: '24px' }}>
                            🔐 Iniciar sesión
                        </h2>
                        {error && (
                            <div style={{ 
                                backgroundColor: '#fee2e2', 
                                color: '#dc2626', 
                                padding: '12px 16px', 
                                borderRadius: '8px', 
                                marginBottom: '16px' 
                            }}>
                                {error}
                            </div>
                        )}
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                style={{ width: '100%', padding: '12px', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '16px' }}
                            />
                        </div>
                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>Contraseña</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={{ width: '100%', padding: '12px', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '16px' }}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button
                                onClick={() => { setView('search'); setError(''); }}
                                style={{
                                    padding: '12px 24px',
                                    backgroundColor: '#f1f5f9',
                                    color: '#475569',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    cursor: 'pointer'
                                }}
                            >
                                Volver
                            </button>
                            <button
                                onClick={handleLogin}
                                disabled={loading}
                                style={{
                                    padding: '12px 24px',
                                    backgroundColor: loading ? '#9ca3af' : '#3b82f6',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    fontWeight: 600,
                                    cursor: loading ? 'not-allowed' : 'pointer'
                                }}
                            >
                                {loading ? 'Ingresando...' : 'Iniciar sesión'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Register view */}
                {view === 'register' && (
                    <div style={{ 
                        backgroundColor: 'white', 
                        borderRadius: '16px', 
                        padding: '32px', 
                        boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
                    }}>
                        <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#1e293b', marginBottom: '24px' }}>
                            📝 Crear cuenta
                        </h2>
                        {error && (
                            <div style={{ 
                                backgroundColor: '#fee2e2', 
                                color: '#dc2626', 
                                padding: '12px 16px', 
                                borderRadius: '8px', 
                                marginBottom: '16px' 
                            }}>
                                {error}
                            </div>
                        )}
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>Nombre</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                style={{ width: '100%', padding: '12px', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '16px' }}
                            />
                        </div>
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                style={{ width: '100%', padding: '12px', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '16px' }}
                            />
                        </div>
                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>Contraseña</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={{ width: '100%', padding: '12px', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '16px' }}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button
                                onClick={() => { setView('search'); setError(''); }}
                                style={{
                                    padding: '12px 24px',
                                    backgroundColor: '#f1f5f9',
                                    color: '#475569',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    cursor: 'pointer'
                                }}
                            >
                                Volver
                            </button>
                            <button
                                onClick={handleRegister}
                                disabled={loading}
                                style={{
                                    padding: '12px 24px',
                                    backgroundColor: loading ? '#9ca3af' : '#22c55e',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    fontWeight: 600,
                                    cursor: loading ? 'not-allowed' : 'pointer'
                                }}
                            >
                                {loading ? 'Creando...' : 'Crear cuenta'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Dashboard view (logged in) */}
                {view === 'dashboard' && (
                    <>
                        {invoices.length === 0 ? (
                            <div style={{ 
                                backgroundColor: 'white', 
                                borderRadius: '16px', 
                                padding: '40px', 
                                textAlign: 'center',
                                boxShadow: '0 2px 12px rgba(0,0,0,0.06)'
                            }}>
                                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📄</div>
                                <p style={{ fontSize: '16px', color: '#64748b' }}>
                                    No tenés facturas registradas
                                </p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {invoices.map((invoice) => {
                                    const status = getStatusLabel(invoice.status);
                                    return (
                                        <div
                                            key={invoice.id}
                                            style={{
                                                backgroundColor: 'white',
                                                borderRadius: '16px',
                                                padding: '24px',
                                                boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                                            }}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                                                <div>
                                                    <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#1e293b', margin: '0 0 4px 0' }}>
                                                        Factura #{String(invoice.id).padStart(7, '0')}
                                                    </h3>
                                                    <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
                                                        {formatDate(invoice.date)}
                                                    </p>
                                                </div>
                                                <span style={{
                                                    padding: '6px 14px',
                                                    borderRadius: '20px',
                                                    fontSize: '13px',
                                                    fontWeight: 600,
                                                    backgroundColor: status.bg,
                                                    color: status.color,
                                                }}>
                                                    {status.label}
                                                </span>
                                            </div>
                                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                                <thead>
                                                    <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                                                        <th style={{ padding: '10px', textAlign: 'left', fontSize: '13px', color: '#475569' }}>Producto</th>
                                                        <th style={{ padding: '10px', textAlign: 'center', fontSize: '13px', color: '#475569' }}>Cant.</th>
                                                        <th style={{ padding: '10px', textAlign: 'right', fontSize: '13px', color: '#475569' }}>Precio</th>
                                                        <th style={{ padding: '10px', textAlign: 'right', fontSize: '13px', color: '#475569' }}>Total</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {invoice.items.map((item, i) => (
                                                        <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                            <td style={{ padding: '10px', fontSize: '14px', color: '#1e293b' }}>{item.productName}</td>
                                                            <td style={{ padding: '10px', textAlign: 'center', fontSize: '14px', color: '#475569' }}>{item.quantity}</td>
                                                            <td style={{ padding: '10px', textAlign: 'right', fontSize: '14px', color: '#475569' }}>{formatMoney(item.price, invoice.currency)}</td>
                                                            <td style={{ padding: '10px', textAlign: 'right', fontSize: '14px', color: '#1e293b', fontWeight: 500 }}>{formatMoney(item.total, invoice.currency)}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                            <div style={{ textAlign: 'right', marginTop: '16px', paddingTop: '16px', borderTop: '2px solid #e2e8f0' }}>
                                                <span style={{ fontSize: '22px', fontWeight: 700, color: '#1e293b' }}>
                                                    Total: {formatMoney(invoice.total, invoice.currency)}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </>
                )}
            </div>
        </motion.div>
    );
};

export default PublicPortal;