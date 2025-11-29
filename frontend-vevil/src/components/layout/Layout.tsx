import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';

const menuItems = [
    { label: 'Inicio', icon: '🏠', path: '/dashboard' },
    { label: 'Productos', icon: '📦', path: '/products' },
    { label: 'Clientes', icon: '👥', path: '/customers' },
    { label: 'Facturas', icon: '📄', path: '/invoices' },
    { label: 'Cuentas Corrientes', icon: '💳', path: '/accounts' },
    { label: 'Reportes', icon: '📊', path: '/reports' },
    { label: 'Configuración', icon: '⚙️', path: '/settings' },
];

const Layout: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            {/* Sidebar - Fijo */}
            <aside style={{
                width: '260px',
                minWidth: '260px',
                backgroundColor: '#1e293b',
                color: 'white',
                display: 'flex',
                flexDirection: 'column',
                position: 'fixed',
                top: 0,
                left: 0,
                bottom: 0,
                zIndex: 100
            }}>
                {/* Logo */}
                <div style={{
                    padding: '24px',
                    borderBottom: '1px solid #334155'
                }}>
                    <h1 style={{ 
                        fontSize: '24px', 
                        fontWeight: 700, 
                        margin: 0,
                        color: '#818cf8'
                    }}>
                        Vevil
                    </h1>
                    <p style={{ 
                        fontSize: '12px', 
                        color: '#94a3b8', 
                        margin: '4px 0 0 0' 
                    }}>
                        Sistema de Gestión
                    </p>
                </div>

                {/* Navigation */}
                <nav style={{ flex: 1, padding: '16px 0' }}>
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path || 
                                        (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    padding: '14px 24px',
                                    textDecoration: 'none',
                                    color: isActive ? 'white' : '#94a3b8',
                                    backgroundColor: isActive ? '#4f46e5' : 'transparent',
                                    borderLeft: isActive ? '4px solid #818cf8' : '4px solid transparent',
                                    transition: 'all 0.2s',
                                    fontSize: '15px'
                                }}
                            >
                                <span style={{ fontSize: '20px' }}>{item.icon}</span>
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* Logout */}
                <div style={{ padding: '16px 24px', borderTop: '1px solid #334155' }}>
                    <button
                        onClick={handleLogout}
                        style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            padding: '12px',
                            backgroundColor: 'transparent',
                            border: '1px solid #475569',
                            borderRadius: '8px',
                            color: '#f87171',
                            fontSize: '14px',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        🚪 Cerrar Sesión
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main style={{ 
                flex: 1, 
                backgroundColor: '#f1f5f9',
                overflow: 'auto',
                marginLeft: '260px',
                minHeight: '100vh'
            }}>
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;

