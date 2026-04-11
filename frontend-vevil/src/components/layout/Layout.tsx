import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { clearTokens, type UserProfile, getAccessToken } from '../../services/api';
import { useProfile, usePendingCount } from '../../hooks/useAuth';
import { getErrorMessage } from '../../services/api';
import { recordDashboardUsage } from '../../utils/dashboardUsage';
import CurrencyRatesBar from './CurrencyRatesBar';
import HelpPanel from '../help/HelpPanel';
import { ToastContainer } from '../../hooks/useToast';

const menuItems = [
    { label: 'Inicio', icon: '🏠', path: '/dashboard' },
    { label: 'Productos', icon: '📦', path: '/products' },
    { label: 'Mov. de stock', icon: '📥', path: '/stock-movements' },
    { label: 'Clientes', icon: '👥', path: '/customers' },
    { label: 'Facturas', icon: '📄', path: '/invoices' },
    { label: 'Cuentas Corrientes', icon: '💳', path: '/accounts' },
    { label: 'Reportes', icon: '📊', path: '/reports' },
];

type MenuItem = { label: string; icon: string; path: string; badge?: number; subItems?: MenuItem[] };

const Layout: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [isHelpOpen, setIsHelpOpen] = useState(false);
    const [globalSearch, setGlobalSearch] = useState('');
    const [searchResults, setSearchResults] = useState<{type: string; label: string; path: string}[]>([]);
    const [showSearchResults, setShowSearchResults] = useState(false);
    
    // TEMPORAL: Deshabilitar verificación de autenticación para pruebas
    // const hasToken = Boolean(getAccessToken());
    // 
    // // Redirigir al login si no hay token
    // useEffect(() => {
    //     if (!hasToken) {
    //         navigate('/login', { replace: true });
    //     }
    // }, [hasToken, navigate]);
    // 
    // // Escuchar evento de sesión expirada para redirigir al login
    // useEffect(() => {
    //     const handleSessionExpired = () => {
    //         console.log('[Layout] Session expired event received, redirecting to login');
    //         navigate('/login', { replace: true });
    //     };
    //     window.addEventListener('vevil-session-expired', handleSessionExpired);
    //     return () => window.removeEventListener('vevil-session-expired', handleSessionExpired);
    // }, [navigate]);
    
    // Obtener profile con refetchOnMount=true para detectar cambios de usuario al montar
    // Solo intentar obtener profile si hay token
    const { data: profileData, error: profileError, isLoading: profileLoading } = useProfile({ refetchOnMount: true });
    const { data: pendingCountData } = usePendingCount();

    // Sincronizar profile del cache de React Query
    const [profile, setProfile] = useState<UserProfile | null>(() => {
        try {
            const stored = localStorage.getItem('vevil_profile');
            return stored ? JSON.parse(stored) : null;
        } catch {
            return null;
        }
    });

    // Actualizar profile cuando React Query devuelve datos
    // Solo actualizar si el usuario es diferente (por ID) para detectar cambios de sesión
    useEffect(() => {
        // Si profileData es null pero tenemos un ID de usuario nuevo, es un logout - limpiar
        if (!profileData && profile?.id) {
            // Esto es un caso de logout, no hacer nada aquí
            return;
        }

        if (profileData) {
            const newUserId = String(profileData.id ?? '');
            const currentUserId = String(profile?.id ?? '');

            // Forzar actualización siempre que haya nuevos datos del perfil
            // Esto asegura que el menú se actualice cuando cambia el usuario
            setProfile(profileData);
            try {
                localStorage.setItem('vevil_profile', JSON.stringify(profileData));
            } catch (_) { }
        }
    }, [profileData]);

    // Manejar errores de red
    useEffect(() => {
        if (profileError) {
            const errorMsg = getErrorMessage(profileError);
            console.error('[Layout] Profile error:', errorMsg);

            // Si hay error, verificar si tenemos un admin en localStorage
            let stored = profile;
            if (!stored) {
                try {
                    const s = localStorage.getItem('vevil_profile');
                    stored = s ? JSON.parse(s) : null;
                } catch { /* ignore */ }
            }

            const trustedAdmin = stored && (
                String(stored?.role ?? '').toLowerCase() === 'admin' ||
                stored?.email?.toLowerCase() === 'admin@vevil.com'
            );

            if (!trustedAdmin) {
                // Solo redirigir si no tenemos un admin de confianza
                clearTokens();
                localStorage.removeItem('vevil_profile');
                navigate('/login', { replace: true });
            }
        }
    }, [profileError, navigate, profile]);

    const isAdmin =
        String(profileData?.role ?? profile?.role ?? '').toLowerCase() === 'admin' ||
        (profileData?.email?.toLowerCase() === 'admin@vevil.com' || profile?.email?.toLowerCase() === 'admin@vevil.com');

    // Pending count de React Query - solo admins ven el badge
    const pendingCount = isAdmin ? (pendingCountData ?? 0) : 0;

    // Menú para todos los usuarios: muestra "Configuración"
    const baseMenuItems: MenuItem[] = [
        ...menuItems,
        { label: 'Configuración', icon: '⚙️', path: '/settings' },
    ];

    // Agregar elementos de solo admin: "Usuarios" (todos los usuarios), "Auditoría"
    // Si es admin, agrega los items de admin; si no, usa el menú base
    const menuToRender = isAdmin ? [
        ...baseMenuItems,
        { label: 'Usuarios', icon: '👥', path: '/admin/users', description: 'Gestión de usuarios' },
        { label: 'Auditoría', icon: '📋', path: '/audit' },
    ] : baseMenuItems;

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

    // Cerrar menú y ayuda al cambiar de ruta
    useEffect(() => {
        setIsMobileMenuOpen(false);
        setIsHelpOpen(false);
    }, [location.pathname]);

    // Búsqueda global
    useEffect(() => {
        if (!globalSearch.trim()) {
            setSearchResults([]);
            setShowSearchResults(false);
            return;
        }
        const timer = setTimeout(() => {
            const search = globalSearch.toLowerCase();
            const results: {type: string; label: string; path: string}[] = [];
            
            // Productos
            if ('productos'.includes(search) || search.length > 2) {
                results.push({ type: '📦', label: 'Productos', path: '/products' });
            }
            // Clientes
            if ('clientes'.includes(search) || search.length > 2) {
                results.push({ type: '👥', label: 'Clientes', path: '/customers' });
            }
            // Facturas
            if ('facturas'.includes(search) || 'factura'.includes(search) || search.length > 2) {
                results.push({ type: '📄', label: 'Facturas', path: '/invoices' });
            }
            // Configuración
            if ('configuración'.includes(search) || 'config'.includes(search) || search.length > 2) {
                results.push({ type: '⚙️', label: 'Configuración', path: '/settings' });
            }
            // Reportes
            if ('reportes'.includes(search) || 'reporte'.includes(search) || search.length > 2) {
                results.push({ type: '📊', label: 'Reportes', path: '/reports' });
            }
            // Cuentas
            if ('cuentas'.includes(search) || 'cobrar'.includes(search) || search.length > 2) {
                results.push({ type: '💳', label: 'Cuentas por Cobrar', path: '/accounts' });
            }
            // Stock
            if ('stock'.includes(search) || 'inventario'.includes(search) || search.length > 2) {
                results.push({ type: '📥', label: 'Movimientos de Stock', path: '/stock-movements' });
            }
            // Usuarios (solo admin)
            if (isAdmin && ('usuarios'.includes(search) || 'usuarios'.includes(search))) {
                results.push({ type: '👥', label: 'Gestión de Usuarios', path: '/admin/users' });
            }
            
            setSearchResults(results.slice(0, 6));
            setShowSearchResults(true);
        }, 300);
        return () => clearTimeout(timer);
    }, [globalSearch, isAdmin]);

    const handleSearchSelect = (path: string) => {
        navigate(path);
        setGlobalSearch('');
        setShowSearchResults(false);
    };

    // TEMPORAL: Deshabilitar verificación de autenticación para pruebas
    // if (!hasToken) {
    //     return <Navigate to="/login" replace />;
    // }
    
    // Mostrar loading solo si está cargando y no hay profile guardado
    if (profileLoading && !profile) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <div>Cargando...</div>
            </div>
        );
    }

    const handleLogout = async () => {
        // Usar la función clearTokens que llama al backend y limpia las cookies HttpOnly
        await clearTokens();
        localStorage.removeItem('vevil_profile');
        navigate('/login');
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    // Rutas donde se muestra la barra de tasas (pantallas que implican dinero)
    const showCurrencyBar =
        location.pathname === '/dashboard' ||
        location.pathname.startsWith('/products') ||
        location.pathname.startsWith('/invoices') ||
        location.pathname.startsWith('/accounts') ||
        location.pathname.startsWith('/reports');

    const getCurrentPageTitle = () => {
        const items = menuToRender as { label: string; icon: string; path: string }[];
        const current = items.find(
            (item) =>
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
                {/* Logo + Search */}
                <div style={{
                    padding: '24px',
                    borderBottom: '1px solid #334155',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <img 
                                src="/logoVevilTransparente.png" 
                                alt="Vevil" 
                                style={{ 
                                    height: '40px', 
                                    width: 'auto',
                                    display: 'block'
                                }}
                                onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                }}
                            />
                            <div style={{ display: 'none' }}></div>
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
                    
                    {/* Usuario actual + Avatar */}
                    {(profile || profileData) && (
                        <div style={{ 
                            padding: '16px 24px', 
                            borderBottom: '1px solid #334155',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px'
                        }}>
                            <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                backgroundColor: '#4f46e5',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontWeight: 600,
                                fontSize: '16px',
                                overflow: 'hidden'
                            }}>
                                {(profile?.avatar || profileData?.avatar) ? (
                                    <img 
                                        src={(profile?.avatar || profileData?.avatar)!.replace('/api', '')} 
                                        alt="Avatar" 
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                ) : (
                                    (profile?.name || profileData?.name || 'U')[0].toUpperCase()
                                )}
                            </div>
                            <div style={{ flex: 1, overflow: 'hidden' }}>
                                <div style={{ 
                                    color: 'white', 
                                    fontSize: '14px', 
                                    fontWeight: 500,
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                }}>
                                    {profile?.name || profileData?.name || 'Usuario'}
                                </div>
                                <div style={{ 
                                    color: '#94a3b8', 
                                    fontSize: '12px',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                }}>
                                    {profile?.email || profileData?.email}
                                </div>
                            </div>
                            <button
                                onClick={() => navigate('/admin/users')}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#94a3b8',
                                    cursor: 'pointer',
                                    fontSize: '16px',
                                    padding: '4px'
                                }}
                                title="Editar perfil"
                            >
                                ✏️
                            </button>
                        </div>
                    )}

                    {/* Buscador global */}
                    <div style={{ position: 'relative' }}>
                        <input
                            type="text"
                            placeholder="Buscar..."
                            value={globalSearch}
                            onChange={(e) => setGlobalSearch(e.target.value)}
                            onFocus={() => globalSearch.trim() && setShowSearchResults(true)}
                            style={{
                                width: '100%',
                                padding: '10px 14px',
                                borderRadius: '8px',
                                border: '1px solid #475569',
                                backgroundColor: '#0f172a',
                                color: 'white',
                                fontSize: '14px',
                                outline: 'none',
                                boxSizing: 'border-box'
                            }}
                        />
                        {showSearchResults && searchResults.length > 0 && (
                            <div style={{
                                position: 'absolute',
                                top: '100%',
                                left: 0,
                                right: 0,
                                backgroundColor: '#1e293b',
                                border: '1px solid #475569',
                                borderRadius: '8px',
                                marginTop: '4px',
                                maxHeight: '300px',
                                overflow: 'auto',
                                zIndex: 1000
                            }}>
                                {searchResults.map((result, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleSearchSelect(result.path)}
                                        style={{
                                            width: '100%',
                                            padding: '12px 16px',
                                            border: 'none',
                                            backgroundColor: 'transparent',
                                            color: 'white',
                                            textAlign: 'left',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            fontSize: '14px'
                                        }}
                                        onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#334155')}
                                        onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                                    >
                                        <span>{result.type}</span>
                                        <span>{result.label}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Navigation */}
                <nav style={{ flex: 1, padding: '16px 0', overflowY: 'auto' }}>
                    {menuToRender.map((item) => {
                        const isActive =
                            location.pathname === item.path ||
                            (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
                        const badge = 'badge' in item ? (item as MenuItem).badge : undefined;

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => recordDashboardUsage(item.path)}
                                data-testid={item.path === '/pending-registrations' ? 'nav-link-pending-registrations' : undefined}
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
                                    fontSize: '15px',
                                }}
                            >
                                <span style={{ fontSize: '20px' }}>{item.icon}</span>
                                {item.label}
                                {badge != null && badge > 0 && (
                                    <span
                                        style={{
                                            marginLeft: 'auto',
                                            backgroundColor: '#ef4444',
                                            color: 'white',
                                            fontSize: '12px',
                                            fontWeight: 700,
                                            minWidth: '20px',
                                            height: '20px',
                                            borderRadius: '10px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            padding: '0 6px',
                                        }}
                                    >
                                        {badge}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Ayuda */}
                <div style={{ padding: '12px 24px', borderTop: '1px solid #334155' }}>
                    <button
                        onClick={() => { setIsHelpOpen(true); if (isMobile) setIsMobileMenuOpen(false); }}
                        style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            padding: '12px',
                            backgroundColor: 'rgba(99, 102, 241, 0.15)',
                            border: '1px solid #6366f1',
                            borderRadius: '8px',
                            color: '#a5b4fc',
                            fontSize: '14px',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        ❓ Ayuda
                    </button>
                </div>

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

                {showCurrencyBar && <CurrencyRatesBar />}

                <Outlet />
            </main>

            {/* Botón flotante Ayuda (siempre visible) */}
            <button
                onClick={() => setIsHelpOpen(true)}
                aria-label="Abrir ayuda"
                style={{
                    position: 'fixed',
                    bottom: '24px',
                    right: '24px',
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    backgroundColor: '#6366f1',
                    color: '#fff',
                    border: 'none',
                    fontSize: '22px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(99, 102, 241, 0.45)',
                    zIndex: 100,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.08)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(99, 102, 241, 0.5)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = '0 4px 14px rgba(99, 102, 241, 0.45)';
                }}
            >
                ?
            </button>

            <HelpPanel isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />

            {/* Toast notifications global */}
            <ToastContainer />

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
