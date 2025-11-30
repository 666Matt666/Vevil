import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';

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
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    
    // Verificar autenticación
    const token = localStorage.getItem('token');
    
    // Si no hay token, redirigir al login
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // Detectar cambio de tamaño de pantalla
    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (!mobile) {
                setIsMobileMenuOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Cerrar menú al cambiar de ruta
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location.pathname]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    // Obtener título de la página actual
    const getCurrentPageTitle = () => {
        const current = menuItems.find(item => 
            location.pathname === item.path || 
            (item.path !== '/dashboard' && location.pathname.startsWith(item.path))
        );
        return current ? `${current.icon} ${current.label}` : '📱 Vevil';
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            {/* Overlay para cerrar menú en móvil */}
            {isMobile && isMobileMenuOpen && (
                <div 
                    onClick={() => setIsMobileMenuOpen(false)}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        zIndex: 99,
                        transition: 'opacity 0.3s'
                    }}
                />
            )}

            {/* Sidebar */}
            <aside style={{
                width: '260px',
                minWidth: '260px',
                backgroundColor: '#1e293b',
                color: 'white',
                display: 'flex',
                flexDirection: 'column',
                position: 'fixed',
                top: 0,
                left: isMobile ? (isMobileMenuOpen ? 0 : -260) : 0,
                bottom: 0,
                zIndex: 100,
                transition: 'left 0.3s ease-in-out',
                boxShadow: isMobileMenuOpen ? '4px 0 20px rgba(0,0,0,0.3)' : 'none'
            }}>
                {/* Logo */}
                <div style={{
                    padding: '24px',
                    borderBottom: '1px solid #334155',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div>
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
                    {/* Botón cerrar en móvil */}
                    {isMobile && (
                        <button
                            onClick={() => setIsMobileMenuOpen(false)}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: '#94a3b8',
                                fontSize: '24px',
                                cursor: 'pointer',
                                padding: '4px'
                            }}
                        >
                            ✕
                        </button>
                    )}
                </div>

                {/* Navigation */}
                <nav style={{ flex: 1, padding: '16px 0', overflowY: 'auto' }}>
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
                marginLeft: isMobile ? 0 : '260px',
                minHeight: '100vh',
                paddingTop: isMobile ? '60px' : 0
            }}>
                {/* Header móvil */}
                {isMobile && (
                    <header style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '60px',
                        backgroundColor: '#1e293b',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0 16px',
                        zIndex: 50,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                    }}>
                        {/* Botón hamburguesa */}
                        <button
                            onClick={toggleMobileMenu}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: 'white',
                                fontSize: '24px',
                                cursor: 'pointer',
                                padding: '8px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '4px'
                            }}
                            aria-label="Menú"
                        >
                            <span style={{ 
                                width: '24px', 
                                height: '3px', 
                                backgroundColor: 'white', 
                                borderRadius: '2px',
                                transition: 'all 0.3s',
                                transform: isMobileMenuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none'
                            }} />
                            <span style={{ 
                                width: '24px', 
                                height: '3px', 
                                backgroundColor: 'white', 
                                borderRadius: '2px',
                                transition: 'all 0.3s',
                                opacity: isMobileMenuOpen ? 0 : 1
                            }} />
                            <span style={{ 
                                width: '24px', 
                                height: '3px', 
                                backgroundColor: 'white', 
                                borderRadius: '2px',
                                transition: 'all 0.3s',
                                transform: isMobileMenuOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none'
                            }} />
                        </button>

                        {/* Título de página */}
                        <span style={{ 
                            color: 'white', 
                            fontSize: '16px', 
                            fontWeight: 600 
                        }}>
                            {getCurrentPageTitle()}
                        </span>

                        {/* Logo pequeño */}
                        <span style={{ 
                            color: '#818cf8', 
                            fontSize: '18px', 
                            fontWeight: 700 
                        }}>
                            V
                        </span>
                    </header>
                )}
                
                <Outlet />
            </main>

            {/* Estilos globales responsive */}
            <style>{`
                @media (max-width: 768px) {
                    /* Ajustes generales para móvil */
                    .responsive-grid {
                        grid-template-columns: 1fr !important;
                    }
                    
                    .responsive-table-container {
                        overflow-x: auto;
                        -webkit-overflow-scrolling: touch;
                    }
                    
                    .responsive-table {
                        min-width: 600px;
                    }
                    
                    .responsive-modal {
                        width: 100% !important;
                        max-width: 100% !important;
                        height: 100% !important;
                        max-height: 100% !important;
                        border-radius: 0 !important;
                        margin: 0 !important;
                    }
                    
                    .responsive-filters {
                        flex-direction: column !important;
                    }
                    
                    .responsive-filters > * {
                        width: 100% !important;
                    }
                    
                    .responsive-hide-mobile {
                        display: none !important;
                    }
                    
                    .responsive-padding {
                        padding: 16px !important;
                    }
                }
                
                @media (max-width: 480px) {
                    .responsive-text-small {
                        font-size: 12px !important;
                    }
                    
                    .responsive-button-small {
                        padding: 8px 12px !important;
                        font-size: 12px !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default Layout;
