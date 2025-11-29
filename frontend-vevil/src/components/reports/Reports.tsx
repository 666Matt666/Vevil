import React, { useState, useEffect } from 'react';
import { invoicesApi, Invoice, productsApi, Product, customersApi, Customer } from '../../services/api';
import { formatMoney, getCompanyConfig } from '../settings/Settings';

// Estilos
const buttonStyle: React.CSSProperties = {
    padding: '8px 16px',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s'
};

const cardStyle: React.CSSProperties = {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
};

type DateRange = 'today' | 'week' | 'month' | 'year' | 'custom';

interface SalesData {
    date: string;
    total: number;
    count: number;
}

interface TopProduct {
    product: Product;
    quantity: number;
    revenue: number;
}

interface TopCustomer {
    customer: Customer;
    invoiceCount: number;
    totalSpent: number;
}

const Reports: React.FC = () => {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState<DateRange>('month');
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');
    const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'customers'>('overview');

    const company = getCompanyConfig();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [inv, prod, cust] = await Promise.all([
                invoicesApi.getAll(),
                productsApi.getAll(),
                customersApi.getAll()
            ]);
            setInvoices(inv);
            setProducts(prod);
            setCustomers(cust);
        } catch (err) {
            console.error('Error loading data:', err);
        } finally {
            setLoading(false);
        }
    };

    // Filtrar facturas por rango de fecha
    const getFilteredInvoices = (): Invoice[] => {
        const now = new Date();
        let startDate: Date;
        let endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

        switch (dateRange) {
            case 'today':
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                break;
            case 'week':
                startDate = new Date(now);
                startDate.setDate(now.getDate() - 7);
                break;
            case 'month':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            case 'year':
                startDate = new Date(now.getFullYear(), 0, 1);
                break;
            case 'custom':
                startDate = customStartDate ? new Date(customStartDate) : new Date(0);
                endDate = customEndDate ? new Date(customEndDate + 'T23:59:59') : endDate;
                break;
            default:
                startDate = new Date(0);
        }

        return invoices.filter(inv => {
            const invDate = new Date(inv.date);
            return invDate >= startDate && invDate <= endDate;
        });
    };

    const filteredInvoices = getFilteredInvoices();

    // Cálculos de resumen
    const totalRevenue = filteredInvoices.reduce((sum, inv) => sum + Number(inv.total), 0);
    const totalInvoices = filteredInvoices.length;
    const avgTicket = totalInvoices > 0 ? totalRevenue / totalInvoices : 0;

    // Ventas por día para el gráfico
    const getSalesByDay = (): SalesData[] => {
        const salesMap = new Map<string, SalesData>();
        
        filteredInvoices.forEach(inv => {
            const date = new Date(inv.date).toLocaleDateString('es-PY', { 
                day: '2-digit', 
                month: '2-digit' 
            });
            const existing = salesMap.get(date) || { date, total: 0, count: 0 };
            existing.total += Number(inv.total);
            existing.count += 1;
            salesMap.set(date, existing);
        });

        return Array.from(salesMap.values()).slice(-14); // Últimos 14 días
    };

    // Productos más vendidos
    const getTopProducts = (): TopProduct[] => {
        const productMap = new Map<number, { quantity: number; revenue: number }>();

        filteredInvoices.forEach(inv => {
            inv.items?.forEach(item => {
                const existing = productMap.get(item.productId) || { quantity: 0, revenue: 0 };
                existing.quantity += item.quantity;
                existing.revenue += Number(item.priceAtSale) * item.quantity;
                productMap.set(item.productId, existing);
            });
        });

        const topProducts: TopProduct[] = [];
        productMap.forEach((data, productId) => {
            const product = products.find(p => p.id === productId);
            if (product) {
                topProducts.push({ product, ...data });
            }
        });

        return topProducts.sort((a, b) => b.revenue - a.revenue).slice(0, 10);
    };

    // Clientes más frecuentes
    const getTopCustomers = (): TopCustomer[] => {
        const customerMap = new Map<number, { invoiceCount: number; totalSpent: number }>();

        filteredInvoices.forEach(inv => {
            const existing = customerMap.get(inv.customerId) || { invoiceCount: 0, totalSpent: 0 };
            existing.invoiceCount += 1;
            existing.totalSpent += Number(inv.total);
            customerMap.set(inv.customerId, existing);
        });

        const topCustomers: TopCustomer[] = [];
        customerMap.forEach((data, customerId) => {
            const customer = customers.find(c => c.id === customerId);
            if (customer) {
                topCustomers.push({ customer, ...data });
            }
        });

        return topCustomers.sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 10);
    };

    const salesByDay = getSalesByDay();
    const topProducts = getTopProducts();
    const topCustomers = getTopCustomers();
    const maxSale = Math.max(...salesByDay.map(s => s.total), 1);

    // Exportar a CSV
    const exportToCSV = () => {
        let csv = 'Fecha,N° Factura,Cliente,Total\n';
        filteredInvoices.forEach(inv => {
            const date = new Date(inv.date).toLocaleDateString('es-PY');
            const customerName = inv.customer?.name || 'N/A';
            csv += `${date},${inv.id},"${customerName}",${inv.total}\n`;
        });

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `reporte_ventas_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    // Imprimir reporte
    const printReport = () => {
        const printContent = `
            <html>
            <head>
                <title>Reporte de Ventas - ${company.name || 'Vevil'}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    h1 { color: #1e293b; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { border: 1px solid #e2e8f0; padding: 10px; text-align: left; }
                    th { background: #f8fafc; }
                    .summary { display: flex; gap: 40px; margin: 20px 0; }
                    .summary-item { }
                    .summary-label { color: #64748b; font-size: 14px; }
                    .summary-value { font-size: 24px; font-weight: bold; color: #1e293b; }
                </style>
            </head>
            <body>
                <h1>📊 Reporte de Ventas</h1>
                <p>${company.name || 'Empresa'} - RUC: ${company.ruc || 'N/A'}</p>
                <p>Período: ${dateRange === 'custom' ? `${customStartDate} a ${customEndDate}` : dateRange}</p>
                
                <div class="summary">
                    <div class="summary-item">
                        <div class="summary-label">Total Ventas</div>
                        <div class="summary-value">${formatMoney(totalRevenue, 'PYG')}</div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-label">Facturas</div>
                        <div class="summary-value">${totalInvoices}</div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-label">Ticket Promedio</div>
                        <div class="summary-value">${formatMoney(avgTicket, 'PYG')}</div>
                    </div>
                </div>

                <h2>Detalle de Facturas</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>N° Factura</th>
                            <th>Cliente</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${filteredInvoices.map(inv => `
                            <tr>
                                <td>${new Date(inv.date).toLocaleDateString('es-PY')}</td>
                                <td>#${inv.id}</td>
                                <td>${inv.customer?.name || 'N/A'}</td>
                                <td>${formatMoney(Number(inv.total), 'PYG')}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>

                <h2>Top 10 Productos</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Producto</th>
                            <th>Cantidad</th>
                            <th>Ingresos</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${topProducts.map(tp => `
                            <tr>
                                <td>${tp.product.name}</td>
                                <td>${tp.quantity}</td>
                                <td>${formatMoney(tp.revenue, 'PYG')}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
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

    if (loading) {
        return (
            <div style={{ padding: '32px', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ 
                        width: '48px', 
                        height: '48px', 
                        border: '4px solid #e2e8f0',
                        borderTopColor: '#8b5cf6',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 16px'
                    }} />
                    <p style={{ color: '#64748b' }}>Cargando datos...</p>
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
                alignItems: 'flex-start',
                marginBottom: '24px',
                flexWrap: 'wrap',
                gap: '16px'
            }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#1e293b', margin: 0 }}>
                        📊 Reportes y Estadísticas
                    </h1>
                    <p style={{ fontSize: '16px', color: '#64748b', margin: '4px 0 0 0' }}>
                        Análisis de ventas y rendimiento
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                        onClick={exportToCSV}
                        style={{ ...buttonStyle, backgroundColor: '#22c55e', color: 'white' }}
                    >
                        📥 Exportar CSV
                    </button>
                    <button 
                        onClick={printReport}
                        style={{ ...buttonStyle, backgroundColor: '#3b82f6', color: 'white' }}
                    >
                        🖨️ Imprimir
                    </button>
                </div>
            </div>

            {/* Filtros de fecha */}
            <div style={{ 
                ...cardStyle, 
                marginBottom: '24px',
                display: 'flex',
                gap: '12px',
                alignItems: 'center',
                flexWrap: 'wrap'
            }}>
                <span style={{ fontWeight: 500, color: '#475569' }}>📅 Período:</span>
                {(['today', 'week', 'month', 'year', 'custom'] as DateRange[]).map(range => (
                    <button
                        key={range}
                        onClick={() => setDateRange(range)}
                        style={{
                            ...buttonStyle,
                            backgroundColor: dateRange === range ? '#4f46e5' : '#f1f5f9',
                            color: dateRange === range ? 'white' : '#475569'
                        }}
                    >
                        {range === 'today' && 'Hoy'}
                        {range === 'week' && 'Última Semana'}
                        {range === 'month' && 'Este Mes'}
                        {range === 'year' && 'Este Año'}
                        {range === 'custom' && 'Personalizado'}
                    </button>
                ))}
                
                {dateRange === 'custom' && (
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <input
                            type="date"
                            value={customStartDate}
                            onChange={(e) => setCustomStartDate(e.target.value)}
                            style={{
                                padding: '8px 12px',
                                border: '1px solid #e2e8f0',
                                borderRadius: '6px'
                            }}
                        />
                        <span style={{ color: '#64748b' }}>a</span>
                        <input
                            type="date"
                            value={customEndDate}
                            onChange={(e) => setCustomEndDate(e.target.value)}
                            style={{
                                padding: '8px 12px',
                                border: '1px solid #e2e8f0',
                                borderRadius: '6px'
                            }}
                        />
                    </div>
                )}
            </div>

            {/* Tabs */}
            <div style={{ 
                display: 'flex', 
                gap: '4px', 
                marginBottom: '24px',
                borderBottom: '2px solid #e2e8f0',
                paddingBottom: '0'
            }}>
                {[
                    { id: 'overview', label: '📈 Resumen', icon: '📈' },
                    { id: 'products', label: '📦 Productos', icon: '📦' },
                    { id: 'customers', label: '👥 Clientes', icon: '👥' }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        style={{
                            padding: '12px 24px',
                            border: 'none',
                            backgroundColor: 'transparent',
                            color: activeTab === tab.id ? '#4f46e5' : '#64748b',
                            fontWeight: activeTab === tab.id ? 600 : 400,
                            fontSize: '14px',
                            cursor: 'pointer',
                            borderBottom: activeTab === tab.id ? '2px solid #4f46e5' : '2px solid transparent',
                            marginBottom: '-2px'
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab: Resumen */}
            {activeTab === 'overview' && (
                <>
                    {/* Cards de resumen */}
                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                        gap: '16px',
                        marginBottom: '24px'
                    }}>
                        <div style={{ ...cardStyle, borderLeft: '4px solid #22c55e' }}>
                            <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>💰 Total Ventas</p>
                            <p style={{ fontSize: '28px', fontWeight: 700, color: '#22c55e', margin: '8px 0 0 0' }}>
                                {formatMoney(totalRevenue, 'PYG')}
                            </p>
                        </div>
                        <div style={{ ...cardStyle, borderLeft: '4px solid #3b82f6' }}>
                            <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>🧾 Facturas</p>
                            <p style={{ fontSize: '28px', fontWeight: 700, color: '#3b82f6', margin: '8px 0 0 0' }}>
                                {totalInvoices}
                            </p>
                        </div>
                        <div style={{ ...cardStyle, borderLeft: '4px solid #f97316' }}>
                            <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>🎫 Ticket Promedio</p>
                            <p style={{ fontSize: '28px', fontWeight: 700, color: '#f97316', margin: '8px 0 0 0' }}>
                                {formatMoney(avgTicket, 'PYG')}
                            </p>
                        </div>
                        <div style={{ ...cardStyle, borderLeft: '4px solid #8b5cf6' }}>
                            <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>👥 Clientes Únicos</p>
                            <p style={{ fontSize: '28px', fontWeight: 700, color: '#8b5cf6', margin: '8px 0 0 0' }}>
                                {new Set(filteredInvoices.map(i => i.customerId)).size}
                            </p>
                        </div>
                    </div>

                    {/* Gráfico de barras */}
                    <div style={{ ...cardStyle, marginBottom: '24px' }}>
                        <h3 style={{ margin: '0 0 24px 0', fontSize: '18px', fontWeight: 600, color: '#1e293b' }}>
                            📊 Ventas por Día
                        </h3>
                        {salesByDay.length === 0 ? (
                            <p style={{ color: '#64748b', textAlign: 'center', padding: '40px' }}>
                                No hay datos para el período seleccionado
                            </p>
                        ) : (
                            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '200px', padding: '0 8px' }}>
                                {salesByDay.map((day, index) => (
                                    <div key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <div 
                                            style={{
                                                width: '100%',
                                                maxWidth: '40px',
                                                height: `${(day.total / maxSale) * 160}px`,
                                                minHeight: '4px',
                                                backgroundColor: '#4f46e5',
                                                borderRadius: '4px 4px 0 0',
                                                transition: 'height 0.3s'
                                            }}
                                            title={`${day.date}: ${formatMoney(day.total, 'PYG')}`}
                                        />
                                        <span style={{ 
                                            fontSize: '10px', 
                                            color: '#64748b', 
                                            marginTop: '8px',
                                            transform: 'rotate(-45deg)',
                                            whiteSpace: 'nowrap'
                                        }}>
                                            {day.date}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Últimas facturas */}
                    <div style={cardStyle}>
                        <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 600, color: '#1e293b' }}>
                            🕐 Últimas Facturas
                        </h3>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                                    <th style={{ padding: '12px', textAlign: 'left', color: '#64748b', fontSize: '14px' }}>Fecha</th>
                                    <th style={{ padding: '12px', textAlign: 'left', color: '#64748b', fontSize: '14px' }}>N°</th>
                                    <th style={{ padding: '12px', textAlign: 'left', color: '#64748b', fontSize: '14px' }}>Cliente</th>
                                    <th style={{ padding: '12px', textAlign: 'right', color: '#64748b', fontSize: '14px' }}>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredInvoices.slice(0, 5).map(inv => (
                                    <tr key={inv.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '12px', color: '#64748b' }}>
                                            {new Date(inv.date).toLocaleDateString('es-PY')}
                                        </td>
                                        <td style={{ padding: '12px', fontWeight: 500, color: '#f97316' }}>#{inv.id}</td>
                                        <td style={{ padding: '12px', color: '#1e293b' }}>{inv.customer?.name}</td>
                                        <td style={{ padding: '12px', textAlign: 'right', fontWeight: 600, color: '#1e293b' }}>
                                            {formatMoney(Number(inv.total), 'PYG')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {/* Tab: Productos */}
            {activeTab === 'products' && (
                <div style={cardStyle}>
                    <h3 style={{ margin: '0 0 24px 0', fontSize: '18px', fontWeight: 600, color: '#1e293b' }}>
                        🏆 Top 10 Productos Más Vendidos
                    </h3>
                    {topProducts.length === 0 ? (
                        <p style={{ color: '#64748b', textAlign: 'center', padding: '40px' }}>
                            No hay datos para el período seleccionado
                        </p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {topProducts.map((tp, index) => {
                                const maxRevenue = topProducts[0]?.revenue || 1;
                                const percentage = (tp.revenue / maxRevenue) * 100;
                                
                                return (
                                    <div key={tp.product.id} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                        <span style={{ 
                                            width: '32px', 
                                            height: '32px', 
                                            backgroundColor: index < 3 ? '#fef3c7' : '#f1f5f9',
                                            color: index < 3 ? '#d97706' : '#64748b',
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontWeight: 700,
                                            fontSize: '14px'
                                        }}>
                                            {index + 1}
                                        </span>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                                <span style={{ fontWeight: 500, color: '#1e293b' }}>{tp.product.name}</span>
                                                <span style={{ color: '#64748b', fontSize: '14px' }}>{tp.quantity} vendidos</span>
                                            </div>
                                            <div style={{ 
                                                height: '8px', 
                                                backgroundColor: '#e2e8f0', 
                                                borderRadius: '4px',
                                                overflow: 'hidden'
                                            }}>
                                                <div style={{
                                                    height: '100%',
                                                    width: `${percentage}%`,
                                                    backgroundColor: '#4f46e5',
                                                    borderRadius: '4px',
                                                    transition: 'width 0.5s'
                                                }} />
                                            </div>
                                        </div>
                                        <span style={{ fontWeight: 600, color: '#22c55e', minWidth: '120px', textAlign: 'right' }}>
                                            {formatMoney(tp.revenue, 'PYG')}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* Tab: Clientes */}
            {activeTab === 'customers' && (
                <div style={cardStyle}>
                    <h3 style={{ margin: '0 0 24px 0', fontSize: '18px', fontWeight: 600, color: '#1e293b' }}>
                        🏆 Top 10 Clientes
                    </h3>
                    {topCustomers.length === 0 ? (
                        <p style={{ color: '#64748b', textAlign: 'center', padding: '40px' }}>
                            No hay datos para el período seleccionado
                        </p>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                                    <th style={{ padding: '12px', textAlign: 'left', color: '#64748b', fontSize: '14px' }}>#</th>
                                    <th style={{ padding: '12px', textAlign: 'left', color: '#64748b', fontSize: '14px' }}>Cliente</th>
                                    <th style={{ padding: '12px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>Compras</th>
                                    <th style={{ padding: '12px', textAlign: 'right', color: '#64748b', fontSize: '14px' }}>Total Gastado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {topCustomers.map((tc, index) => (
                                    <tr key={tc.customer.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '12px' }}>
                                            <span style={{ 
                                                width: '28px', 
                                                height: '28px', 
                                                backgroundColor: index < 3 ? '#fef3c7' : '#f1f5f9',
                                                color: index < 3 ? '#d97706' : '#64748b',
                                                borderRadius: '50%',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontWeight: 700,
                                                fontSize: '12px'
                                            }}>
                                                {index + 1}
                                            </span>
                                        </td>
                                        <td style={{ padding: '12px' }}>
                                            <div>
                                                <span style={{ fontWeight: 500, color: '#1e293b' }}>{tc.customer.name}</span>
                                                <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                                                    {tc.customer.email}
                                                </p>
                                            </div>
                                        </td>
                                        <td style={{ padding: '12px', textAlign: 'center' }}>
                                            <span style={{
                                                backgroundColor: '#dbeafe',
                                                color: '#1e40af',
                                                padding: '4px 12px',
                                                borderRadius: '9999px',
                                                fontSize: '12px',
                                                fontWeight: 500
                                            }}>
                                                {tc.invoiceCount} facturas
                                            </span>
                                        </td>
                                        <td style={{ padding: '12px', textAlign: 'right', fontWeight: 700, color: '#22c55e' }}>
                                            {formatMoney(tc.totalSpent, 'PYG')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}
        </div>
    );
};

export default Reports;

