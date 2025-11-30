import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { statsApi } from '../../services/api';
import { formatMoney } from '../settings/Settings';

interface DashboardStats {
    totalProducts: number;
    totalCustomers: number;
    totalInvoices: number;
    totalRevenue: number;
}

const menuItems = [
    { 
        label: 'Productos', 
        icon: '📦', 
        path: '/products', 
        color: '#3b82f6', 
        description: 'Gestionar stock de combustible y productos' 
    },
    { 
        label: 'Clientes', 
        icon: '👥', 
        path: '/customers', 
        color: '#22c55e', 
        description: 'Gestionar base de datos de clientes' 
    },
    { 
        label: 'Facturas', 
        icon: '📄', 
        path: '/invoices', 
        color: '#f97316', 
        description: 'Crear y ver facturas' 
    },
];

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            setLoading(true);
            const data = await statsApi.getDashboardStats();
            setStats(data);
        } catch (err) {
            console.error('Error loading stats:', err);
            // Si falla, mostramos valores en 0
            setStats({
                totalProducts: 0,
                totalCustomers: 0,
                totalInvoices: 0,
                totalRevenue: 0,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="responsive-padding" style={{ padding: '32px' }}>
            {/* Header */}
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ 
                    fontSize: 'clamp(24px, 5vw, 32px)', 
                    fontWeight: 700, 
                    color: '#1e293b',
                    margin: '0 0 8px 0'
                }}>
                    ¡Bienvenido!
                </h1>
                <p style={{ 
                    fontSize: 'clamp(14px, 3vw, 18px)', 
                    color: '#64748b',
                    margin: 0
                }}>
                    ¿Qué te gustaría hacer hoy?
                </p>
            </div>

            {/* Cards Grid */}
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
                gap: '16px' 
            }}>
                {menuItems.map((item) => (
                    <div
                        key={item.path}
                        onClick={() => navigate(item.path)}
                        style={{
                            backgroundColor: 'white',
                            borderRadius: '16px',
                            overflow: 'hidden',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                            cursor: 'pointer',
                            transition: 'transform 0.2s, box-shadow 0.2s'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-4px)';
                            e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.1)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.05)';
                        }}
                    >
                        {/* Icon Header */}
                        <div style={{
                            backgroundColor: item.color,
                            padding: '40px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <span style={{ fontSize: '64px' }}>{item.icon}</span>
                        </div>
                        
                        {/* Content */}
                        <div style={{ padding: '24px' }}>
                            <h3 style={{ 
                                fontSize: '20px', 
                                fontWeight: 600, 
                                color: '#1e293b',
                                margin: '0 0 8px 0'
                            }}>
                                {item.label}
                            </h3>
                            <p style={{ 
                                fontSize: '14px', 
                                color: '#64748b',
                                margin: 0,
                                lineHeight: 1.5
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
                            {stats?.totalProducts || 0}
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
                            {stats?.totalCustomers || 0}
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
                            {stats?.totalInvoices || 0}
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
                            {formatMoney(stats?.totalRevenue || 0, 'PYG')}
                        </p>
                    )}
                </div>
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
