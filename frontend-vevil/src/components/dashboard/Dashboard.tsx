import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { statsApi, productsApi, customersApi, invoicesApi } from '../../services/api';
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
    const [seeding, setSeeding] = useState(false);
    const [seedMessage, setSeedMessage] = useState<string | null>(null);

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
            
            // Recargar estadísticas
            await loadStats();
            
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
                
                {/* Botón para cargar datos de ejemplo */}
                {(!stats || (stats.totalProducts === 0 && stats.totalCustomers === 0)) && (
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
                        {seeding ? '⏳ Cargando...' : '📦 Cargar Datos de Ejemplo'}
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
