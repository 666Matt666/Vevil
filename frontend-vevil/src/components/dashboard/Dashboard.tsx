import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { statsApi, metricsApi, productsApi, customersApi, invoicesApi, getProfile } from '../../services/api';
import type { DashboardMetrics } from '../../services/api';
import { formatMoney } from '../settings/Settings';
import { copy } from '../../copy';

type ProfileUser = { name?: string; lastName?: string; gender?: 'male' | 'female' };

function buildWelcomeMessage(user: ProfileUser | null): string {
    if (!user?.name) return copy.dashboard.welcome;
    const fullName = [user.name, user.lastName].filter(Boolean).join(' ').trim();
    const greeting =
        user.gender === 'female' ? copy.dashboard.welcomeFemale :
        user.gender === 'male' ? copy.dashboard.welcomeMale : copy.dashboard.welcomeNeutral;
    return fullName ? `¡${greeting}, ${fullName}!` : `¡${greeting}!`;
}

const USAGE_KEY = 'vevil_dashboard_usage';

const menuItems = [
    { 
        label: 'Productos', 
        icon: '📦', 
        path: '/products', 
        usageKey: 'products' as const,
        color: '#3b82f6', 
        description: 'Gestionar stock de combustible y productos' 
    },
    { 
        label: 'Clientes', 
        icon: '👥', 
        path: '/customers', 
        usageKey: 'customers' as const,
        color: '#22c55e', 
        description: 'Gestionar base de datos de clientes' 
    },
    { 
        label: 'Facturas', 
        icon: '📄', 
        path: '/invoices', 
        usageKey: 'invoices' as const,
        color: '#f97316', 
        description: 'Crear y ver facturas' 
    },
];

function loadUsage(): Record<string, number> {
    try {
        const raw = localStorage.getItem(USAGE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw) as Record<string, number>;
            return { products: 0, customers: 0, invoices: 0, ...parsed };
        }
    } catch (_) {}
    return { products: 0, customers: 0, invoices: 0 };
}

function saveUsage(usage: Record<string, number>) {
    try {
        localStorage.setItem(USAGE_KEY, JSON.stringify(usage));
    } catch (_) {}
}

function getMostUsedItems(items: typeof menuItems, usage: Record<string, number>): typeof menuItems {
    return [...items]
        .sort((a, b) => (usage[b.usageKey] ?? 0) - (usage[a.usageKey] ?? 0))
        .slice(0, 3);
}

const defaultMetrics: DashboardMetrics = {
    totalProducts: 0,
    totalCustomers: 0,
    totalInvoices: 0,
    totalRevenue: 0,
    revenueLast7Days: 0,
    invoicesLast7Days: 0,
    revenueThisMonth: 0,
    invoicesThisMonth: 0,
    revenueLastMonth: 0,
    invoicesLastMonth: 0,
    lowStockProducts: 0,
    lowStockList: [],
    topProductsSold: [],
    generatedAt: new Date().toISOString(),
};

type PeriodKey = '7' | 'month' | 'lastMonth' | '90' | 'custom';

function getPeriodDates(period: PeriodKey, customFrom?: string, customTo?: string): { from: string; to: string } | null {
    const today = new Date();
    const y = today.getFullYear();
    const m = today.getMonth();
    const pad = (n: number) => String(n).padStart(2, '0');
    const toStr = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    if (period === '7') {
        const from = new Date(today);
        from.setDate(from.getDate() - 7);
        return { from: toStr(from), to: toStr(today) };
    }
    if (period === 'month') {
        const from = new Date(y, m, 1);
        return { from: toStr(from), to: toStr(today) };
    }
    if (period === 'lastMonth') {
        const from = new Date(y, m - 1, 1);
        const to = new Date(y, m, 0);
        return { from: toStr(from), to: toStr(to) };
    }
    if (period === '90') {
        const from = new Date(today);
        from.setDate(from.getDate() - 90);
        return { from: toStr(from), to: toStr(today) };
    }
    if (period === 'custom' && customFrom && customTo) return { from: customFrom, to: customTo };
    return null;
}

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const [profile, setProfile] = useState<ProfileUser | null>(null);
    const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
    const [loading, setLoading] = useState(true);
    const [seeding, setSeeding] = useState(false);
    const [seedMessage, setSeedMessage] = useState<string | null>(null);
    const [period, setPeriod] = useState<PeriodKey | null>(null);
    const [customFrom, setCustomFrom] = useState('');
    const [customTo, setCustomTo] = useState('');
    const [usage, setUsage] = useState<Record<string, number>>(() => loadUsage());

    useEffect(() => {
        getProfile()
            .then((data: ProfileUser) => setProfile(data))
            .catch(() => setProfile(null));
    }, []);

    useEffect(() => {
        loadMetrics(null);
    }, []);

    const loadMetrics = async (filters: { from: string; to: string } | null) => {
        try {
            setLoading(true);
            const data = await metricsApi.getMetrics(filters || undefined);
            setMetrics(data);
        } catch (err) {
            console.error('Error loading metrics:', err);
            try {
                const fallback = await statsApi.getDashboardStats();
                setMetrics({
                    ...defaultMetrics,
                    totalProducts: fallback.totalProducts,
                    totalCustomers: fallback.totalCustomers,
                    totalInvoices: fallback.totalInvoices,
                    totalRevenue: fallback.totalRevenue,
                    topProductsSold: [],
                });
            } catch {
                setMetrics(defaultMetrics);
            }
        } finally {
            setLoading(false);
        }
    };

    const applyFilter = (p: PeriodKey) => {
        setPeriod(p);
        const dates = getPeriodDates(p, customFrom, customTo);
        if (dates) loadMetrics(dates);
    };

    const applyCustomFilter = () => {
        if (customFrom && customTo) {
            setPeriod('custom');
            loadMetrics({ from: customFrom, to: customTo });
        }
    };

    const handleMenuClick = (item: typeof menuItems[0]) => {
        const next = { ...usage, [item.usageKey]: (usage[item.usageKey] ?? 0) + 1 };
        setUsage(next);
        saveUsage(next);
        navigate(item.path);
    };

    const displayedMenuItems = getMostUsedItems(menuItems, usage);

    const loadSeedData = async () => {
        setSeeding(true);
        setSeedMessage(null);
        
        try {
            // 1. Crear Productos
            const products = [
                { name: 'Nafta Super', type: 'fuel', price: 1.20, stock: 5000, description: 'Combustible estándar' },
                { name: 'Nafta Premium', type: 'fuel', price: 1.50, stock: 3000, description: 'Combustible de alto octanaje' },
                { name: 'Diesel Común', type: 'fuel', price: 1.10, stock: 8000, description: 'Diesel para transporte pesado' },
                { name: 'Aceite Motor 10W40', type: 'other', price: 15.00, stock: 50, description: 'Lubricante sintético' },
                { name: 'Agua Mineral 500ml', type: 'other', price: 1.50, stock: 100, description: 'Bebida refrescante' },
            ];

            const createdProducts = [];
            for (const product of products) {
                try {
                    const data = await productsApi.create(product);
                    createdProducts.push(data);
                } catch (error: any) {
                    // Si el producto ya existe, intentar obtenerlo
                    console.warn(`Producto ${product.name} ya existe o error:`, error);
                }
            }

            // 2. Crear Clientes
            const customers = [
                {
                    name: 'Juan Pérez',
                    email: 'juan.perez@email.com',
                    phones: [
                        { type: 'Móvil', number: '+54 9 11 1234 5678' },
                        { type: 'Casa', number: '4567 8901' }
                    ],
                    address_street: 'Av. Corrientes 1234',
                    address_city: 'Buenos Aires',
                    address_province: 'CABA',
                    address_zip: '1041',
                    google_maps_link: 'https://goo.gl/maps/example1',
                    tax_id: '20-12345678-9'
                },
                {
                    name: 'Empresa de Transportes S.A.',
                    email: 'contacto@transporte.com',
                    phones: [
                        { type: 'Oficina', number: '+54 11 4321 8765' }
                    ],
                    address_street: 'Ruta 9 Km 50',
                    address_city: 'Escobar',
                    address_province: 'Buenos Aires',
                    address_zip: '1625',
                    google_maps_link: 'https://goo.gl/maps/example2',
                    tax_id: '30-87654321-0'
                },
                {
                    name: 'María González',
                    email: 'maria.gonzalez@email.com',
                    phones: [
                        { type: 'Móvil', number: '+54 9 351 123 4567' }
                    ],
                    address_street: 'Calle Falsa 123',
                    address_city: 'Córdoba',
                    address_province: 'Córdoba',
                    address_zip: '5000',
                    google_maps_link: 'https://goo.gl/maps/example3',
                    tax_id: '27-11223344-5'
                }
            ];

            const createdCustomers = [];
            for (const customer of customers) {
                try {
                    const data = await customersApi.create(customer);
                    createdCustomers.push(data);
                } catch (error: any) {
                    console.warn(`Cliente ${customer.name} ya existe o error:`, error);
                }
            }

            // 3. Crear Facturas
            if (createdProducts.length > 0 && createdCustomers.length > 0) {
                const invoices = [
                    {
                        customerId: createdCustomers[0].id,
                        items: [
                            { productId: createdProducts[0].id, quantity: 40 },
                            { productId: createdProducts[4].id, quantity: 2 }
                        ]
                    },
                    {
                        customerId: createdCustomers[1].id,
                        items: [
                            { productId: createdProducts[2].id, quantity: 200 },
                            { productId: createdProducts[3].id, quantity: 5 }
                        ]
                    },
                    {
                        customerId: createdCustomers[2].id,
                        items: [
                            { productId: createdProducts[1].id, quantity: 35 }
                        ]
                    }
                ];

                for (const invoice of invoices) {
                    try {
                        await invoicesApi.create(invoice);
                    } catch (error: any) {
                        console.warn('Error al crear factura:', error);
                    }
                }
            }

            setSeedMessage(`✅ Datos cargados: ${createdProducts.length} productos, ${createdCustomers.length} clientes`);
            
            // Recargar métricas
            await loadMetrics(null);
            
            // Ocultar mensaje después de 5 segundos
            setTimeout(() => setSeedMessage(null), 5000);
        } catch (error: any) {
            setSeedMessage(`❌ Error: ${error.message || 'Error al cargar datos'}`);
        } finally {
            setSeeding(false);
        }
    };

    return (
        <div className="responsive-padding" style={{ padding: '32px' }}>
            {/* Header */}
            <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1 style={{ 
                        fontSize: 'clamp(24px, 5vw, 32px)', 
                        fontWeight: 700, 
                        color: '#1e293b',
                        margin: 0
                    }}>
                        {buildWelcomeMessage(profile)}
                    </h1>
                </div>
                
                {/* Botón para cargar datos de ejemplo */}
                {!loading && (metrics?.totalProducts ?? 0) === 0 && (metrics?.totalCustomers ?? 0) === 0 && (
                    <button
                        onClick={loadSeedData}
                        disabled={seeding}
                        style={{
                            padding: '12px 24px',
                            fontSize: '16px',
                            fontWeight: 600,
                            color: 'white',
                            backgroundColor: seeding ? '#9ca3af' : '#10b981',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: seeding ? 'not-allowed' : 'pointer',
                            transition: 'background-color 0.2s',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        {seeding ? `⏳ ${copy.dashboard.loadingData}` : `📦 ${copy.dashboard.loadExampleData}`}
                    </button>
                )}
            </div>

            {/* Mensaje de resultado */}
            {seedMessage && (
                <div style={{
                    padding: '12px 16px',
                    borderRadius: '8px',
                    marginBottom: '16px',
                    backgroundColor: seedMessage.includes('✅') ? '#d1fae5' : '#fee2e2',
                    color: seedMessage.includes('✅') ? '#065f46' : '#991b1b',
                    fontSize: '14px'
                }}>
                    {seedMessage}
                </div>
            )}

            {/* Accesos rápidos (solo los 3 más usados por el usuario) */}
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
                gap: '12px',
                maxWidth: '520px'
            }}>
                {displayedMenuItems.map((item) => (
                    <div
                        key={item.path}
                        onClick={() => handleMenuClick(item)}
                        style={{
                            backgroundColor: 'white',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.06)',
                            cursor: 'pointer',
                            transition: 'transform 0.2s, box-shadow 0.2s'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.08)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.06)';
                        }}
                    >
                        <div style={{
                            backgroundColor: item.color,
                            padding: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <span style={{ fontSize: '32px' }}>{item.icon}</span>
                        </div>
                        <div style={{ padding: '12px 14px' }}>
                            <h3 style={{ 
                                fontSize: '15px', 
                                fontWeight: 600, 
                                color: '#1e293b',
                                margin: '0 0 4px 0'
                            }}>
                                {item.label}
                            </h3>
                            <p style={{ 
                                fontSize: '12px', 
                                color: '#64748b',
                                margin: 0,
                                lineHeight: 1.35
                            }}>
                                {item.description}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Stats */}
            <div style={{ 
                marginTop: '32px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '12px'
            }}>
                <div style={{
                    backgroundColor: 'white',
                    padding: '24px',
                    borderRadius: '12px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }}>
                    <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>Total Productos</p>
                    {loading ? (
                        <div style={{ 
                            width: '60px', 
                            height: '32px', 
                            backgroundColor: '#e2e8f0', 
                            borderRadius: '4px',
                            marginTop: '8px',
                            animation: 'pulse 1.5s infinite'
                        }} />
                    ) : (
                        <p style={{ fontSize: '32px', fontWeight: 700, color: '#3b82f6', margin: '8px 0 0 0' }}>
                            {metrics?.totalProducts || 0}
                        </p>
                    )}
                </div>
                <div style={{
                    backgroundColor: 'white',
                    padding: '24px',
                    borderRadius: '12px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }}>
                    <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>Total Clientes</p>
                    {loading ? (
                        <div style={{ 
                            width: '60px', 
                            height: '32px', 
                            backgroundColor: '#e2e8f0', 
                            borderRadius: '4px',
                            marginTop: '8px',
                            animation: 'pulse 1.5s infinite'
                        }} />
                    ) : (
                        <p style={{ fontSize: '32px', fontWeight: 700, color: '#22c55e', margin: '8px 0 0 0' }}>
                            {metrics?.totalCustomers || 0}
                        </p>
                    )}
                </div>
                <div style={{
                    backgroundColor: 'white',
                    padding: '24px',
                    borderRadius: '12px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }}>
                    <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>Total Facturas</p>
                    {loading ? (
                        <div style={{ 
                            width: '60px', 
                            height: '32px', 
                            backgroundColor: '#e2e8f0', 
                            borderRadius: '4px',
                            marginTop: '8px',
                            animation: 'pulse 1.5s infinite'
                        }} />
                    ) : (
                        <p style={{ fontSize: '32px', fontWeight: 700, color: '#f97316', margin: '8px 0 0 0' }}>
                            {metrics?.totalInvoices || 0}
                        </p>
                    )}
                </div>
                <div style={{
                    backgroundColor: 'white',
                    padding: '24px',
                    borderRadius: '12px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }}>
                    <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>Ingresos Totales</p>
                    {loading ? (
                        <div style={{ 
                            width: '100px', 
                            height: '32px', 
                            backgroundColor: '#e2e8f0', 
                            borderRadius: '4px',
                            marginTop: '8px',
                            animation: 'pulse 1.5s infinite'
                        }} />
                    ) : (
                        <p style={{ fontSize: '32px', fontWeight: 700, color: '#8b5cf6', margin: '8px 0 0 0' }}>
                            {formatMoney(metrics?.totalRevenue || 0, 'PYG')}
                        </p>
                    )}
                </div>
            </div>

            {/* Métricas y controles - Filtros + métricas */}
            <div style={{ marginTop: '32px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#1e293b', marginBottom: '16px' }}>
                    Métricas y controles
                </h2>

                {/* Filtros por período */}
                <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '8px',
                    alignItems: 'center',
                    marginBottom: '16px',
                    padding: '12px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0'
                }}>
                    <span style={{ fontSize: '14px', color: '#64748b', marginRight: '8px' }}>Período:</span>
                    {(['7', 'month', 'lastMonth', '90'] as const).map((p) => (
                        <button
                            key={p}
                            type="button"
                            onClick={() => applyFilter(p)}
                            style={{
                                padding: '8px 14px',
                                fontSize: '13px',
                                fontWeight: 500,
                                color: period === p ? '#fff' : '#475569',
                                backgroundColor: period === p ? '#3b82f6' : '#fff',
                                border: '1px solid #e2e8f0',
                                borderRadius: '8px',
                                cursor: 'pointer'
                            }}
                        >
                            {p === '7' && 'Últimos 7 días'}
                            {p === 'month' && 'Este mes'}
                            {p === 'lastMonth' && 'Mes pasado'}
                            {p === '90' && 'Últimos 90 días'}
                        </button>
                    ))}
                    {period !== null && (
                        <button
                            type="button"
                            onClick={() => { setPeriod(null); loadMetrics(null); }}
                            style={{
                                padding: '8px 14px',
                                fontSize: '13px',
                                color: '#64748b',
                                backgroundColor: '#fff',
                                border: '1px solid #e2e8f0',
                                borderRadius: '8px',
                                cursor: 'pointer'
                            }}
                        >
                            Limpiar filtro
                        </button>
                    )}
                    <span style={{ fontSize: '13px', color: '#94a3b8', marginLeft: '8px', marginRight: '4px' }}>Personalizado:</span>
                    <input
                        type="date"
                        value={customFrom}
                        onChange={(e) => setCustomFrom(e.target.value)}
                        style={{
                            padding: '6px 10px',
                            fontSize: '13px',
                            border: '1px solid #e2e8f0',
                            borderRadius: '6px'
                        }}
                    />
                    <span style={{ color: '#94a3b8' }}>a</span>
                    <input
                        type="date"
                        value={customTo}
                        onChange={(e) => setCustomTo(e.target.value)}
                        style={{
                            padding: '6px 10px',
                            fontSize: '13px',
                            border: '1px solid #e2e8f0',
                            borderRadius: '6px'
                        }}
                    />
                    <button
                        type="button"
                        onClick={applyCustomFilter}
                        disabled={!customFrom || !customTo}
                        style={{
                            padding: '8px 14px',
                            fontSize: '13px',
                            fontWeight: 500,
                            color: customFrom && customTo ? '#fff' : '#94a3b8',
                            backgroundColor: customFrom && customTo ? '#64748b' : '#e2e8f0',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: customFrom && customTo ? 'pointer' : 'not-allowed'
                        }}
                    >
                        Aplicar
                    </button>
                </div>

                {/* Resultado del período seleccionado (cuando hay filtro from/to) */}
                {!loading && metrics?.periodFrom && metrics?.periodTo && (
                    <div style={{
                        marginBottom: '16px',
                        padding: '16px',
                        backgroundColor: '#eff6ff',
                        borderRadius: '12px',
                        border: '1px solid #bfdbfe'
                    }}>
                        <p style={{ fontSize: '14px', fontWeight: 600, color: '#1e40af', margin: '0 0 12px 0' }}>
                            Resultado del período: {metrics.periodFrom} a {metrics.periodTo}
                        </p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                            <div>
                                <span style={{ fontSize: '12px', color: '#64748b' }}>Facturas: </span>
                                <strong style={{ color: '#1e40af' }}>{metrics.periodInvoices ?? 0}</strong>
                            </div>
                            <div>
                                <span style={{ fontSize: '12px', color: '#64748b' }}>Ingresos: </span>
                                <strong style={{ color: '#1e40af' }}>{formatMoney(metrics.periodRevenue ?? 0, 'PYG')}</strong>
                            </div>
                        </div>
                        {metrics.periodTopProducts && metrics.periodTopProducts.length > 0 && (
                            <div style={{ marginTop: '12px' }}>
                                <p style={{ fontSize: '12px', color: '#475569', margin: '0 0 6px 0' }}>Productos más vendidos en el período:</p>
                                <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#475569' }}>
                                    {metrics.periodTopProducts.slice(0, 5).map((p) => (
                                        <li key={p.productId}><strong>{p.productName}</strong> — {p.quantitySold} u.</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '12px',
                    marginBottom: metrics?.lowStockProducts ? '16px' : 0
                }}>
                    <div style={{
                        backgroundColor: '#f0fdf4',
                        padding: '16px 20px',
                        borderRadius: '12px',
                        border: '1px solid #bbf7d0'
                    }}>
                        <p style={{ fontSize: '13px', color: '#166534', margin: 0 }}>Facturas (últimos 7 días)</p>
                        <p style={{ fontSize: '24px', fontWeight: 700, color: '#15803d', margin: '4px 0 0 0' }}>
                            {loading ? '—' : (metrics?.invoicesLast7Days ?? 0)}
                        </p>
                    </div>
                    <div style={{
                        backgroundColor: '#f5f3ff',
                        padding: '16px 20px',
                        borderRadius: '12px',
                        border: '1px solid #ddd6fe'
                    }}>
                        <p style={{ fontSize: '13px', color: '#5b21b6', margin: 0 }}>Ingresos (últimos 7 días)</p>
                        <p style={{ fontSize: '24px', fontWeight: 700, color: '#6d28d9', margin: '4px 0 0 0' }}>
                            {loading ? '—' : formatMoney(metrics?.revenueLast7Days ?? 0, 'PYG')}
                        </p>
                    </div>
                    <div style={{
                        backgroundColor: metrics?.lowStockProducts ? '#fef2f2' : '#f8fafc',
                        padding: '16px 20px',
                        borderRadius: '12px',
                        border: metrics?.lowStockProducts ? '1px solid #fecaca' : '1px solid #e2e8f0'
                    }}>
                        <p style={{ fontSize: '13px', color: metrics?.lowStockProducts ? '#b91c1c' : '#64748b', margin: 0 }}>
                            Productos con stock bajo
                        </p>
                        <p style={{
                            fontSize: '24px',
                            fontWeight: 700,
                            color: metrics?.lowStockProducts ? '#dc2626' : '#64748b',
                            margin: '4px 0 0 0'
                        }}>
                            {loading ? '—' : (metrics?.lowStockProducts ?? 0)}
                        </p>
                    </div>
                </div>

                {/* Este mes vs Mes pasado */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '12px',
                    marginBottom: '16px'
                }}>
                    <div style={{ backgroundColor: '#eff6ff', padding: '16px 20px', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
                        <p style={{ fontSize: '13px', color: '#1e40af', margin: 0 }}>Este mes — Facturas</p>
                        <p style={{ fontSize: '22px', fontWeight: 700, color: '#2563eb', margin: '4px 0 0 0' }}>
                            {loading ? '—' : (metrics?.invoicesThisMonth ?? 0)}
                        </p>
                    </div>
                    <div style={{ backgroundColor: '#eff6ff', padding: '16px 20px', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
                        <p style={{ fontSize: '13px', color: '#1e40af', margin: 0 }}>Este mes — Ingresos</p>
                        <p style={{ fontSize: '22px', fontWeight: 700, color: '#2563eb', margin: '4px 0 0 0' }}>
                            {loading ? '—' : formatMoney(metrics?.revenueThisMonth ?? 0, 'PYG')}
                        </p>
                    </div>
                    <div style={{ backgroundColor: '#f8fafc', padding: '16px 20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <p style={{ fontSize: '13px', color: '#475569', margin: 0 }}>Mes pasado — Facturas</p>
                        <p style={{ fontSize: '22px', fontWeight: 700, color: '#64748b', margin: '4px 0 0 0' }}>
                            {loading ? '—' : (metrics?.invoicesLastMonth ?? 0)}
                        </p>
                    </div>
                    <div style={{ backgroundColor: '#f8fafc', padding: '16px 20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <p style={{ fontSize: '13px', color: '#475569', margin: 0 }}>Mes pasado — Ingresos</p>
                        <p style={{ fontSize: '22px', fontWeight: 700, color: '#64748b', margin: '4px 0 0 0' }}>
                            {loading ? '—' : formatMoney(metrics?.revenueLastMonth ?? 0, 'PYG')}
                        </p>
                    </div>
                </div>

                {/* Productos más vendidos (últimos 90 días) */}
                {!loading && metrics?.topProductsSold && metrics.topProductsSold.length > 0 && (
                    <div style={{
                        backgroundColor: '#fff',
                        padding: '16px',
                        borderRadius: '12px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                        border: '1px solid #e2e8f0',
                        marginBottom: '16px'
                    }}>
                        <p style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b', margin: '0 0 12px 0' }}>
                            Productos más vendidos (últimos 90 días)
                        </p>
                        <ul style={{ margin: 0, paddingLeft: '20px', color: '#475569', fontSize: '14px' }}>
                            {metrics.topProductsSold.slice(0, 5).map((p, i) => (
                                <li key={p.productId} style={{ marginBottom: '4px' }}>
                                    <strong>{p.productName}</strong> — {p.quantitySold} unidades
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {!loading && metrics?.lowStockList && metrics.lowStockList.length > 0 && (
                    <div style={{
                        backgroundColor: '#fff',
                        padding: '16px',
                        borderRadius: '12px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                        border: '1px solid #fecaca'
                    }}>
                        <p style={{ fontSize: '14px', fontWeight: 600, color: '#b91c1c', margin: '0 0 8px 0' }}>
                            Revisar stock
                        </p>
                        <ul style={{ margin: 0, paddingLeft: '20px', color: '#64748b', fontSize: '14px' }}>
                            {metrics.lowStockList.map((p) => (
                                <li key={p.id}>
                                    {p.name} — <strong style={{ color: '#dc2626' }}>{p.stock} unidades</strong>
                                    {p.minStock > 0 && <span style={{ color: '#94a3b8', fontSize: '13px' }}> (mín: {p.minStock})</span>}
                                </li>
                            ))}
                        </ul>
                        <button
                            type="button"
                            onClick={() => navigate('/products')}
                            style={{
                                marginTop: '12px',
                                padding: '8px 16px',
                                fontSize: '14px',
                                fontWeight: 500,
                                color: '#b91c1c',
                                backgroundColor: '#fef2f2',
                                border: '1px solid #fecaca',
                                borderRadius: '8px',
                                cursor: 'pointer'
                            }}
                        >
                            Ir a Productos
                        </button>
                    </div>
                )}
            </div>
            
            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
            `}</style>
        </div>
    );
};

export default Dashboard;
