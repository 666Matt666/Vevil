import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

export interface HelpItem {
    id: string;
    title: string;
    content: React.ReactNode;
}

const helpItems: HelpItem[] = [
    {
        id: 'primeros-pasos',
        title: '¿Qué es Vevil? Primeros pasos',
        content: (
            <>
                <p style={{ margin: '0 0 8px 0' }}>Vevil es un sistema de gestión para facturación, clientes, productos y cuentas corrientes.</p>
                <p style={{ margin: '0 0 8px 0' }}><strong>Primeros pasos:</strong> dale de alta tus productos en Productos, luego tus clientes en Clientes, y después creá facturas desde Facturas. En Cuentas Corrientes ves lo que te deben y podés registrar cobros.</p>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>Usá el menú de la izquierda para moverte. Si algo no se entiende, buscá en esta ayuda o tocá el botón ❓.</p>
            </>
        ),
    },
    {
        id: 'no-conexion',
        title: 'No se conecta o tarda mucho al iniciar sesión',
        content: (
            <>
                <p style={{ margin: '0 0 8px 0' }}>Si usás la app en la nube (vevil.vercel.app), el servidor puede estar “dormido” la primera vez.</p>
                <ul style={{ margin: '0 0 8px 0', paddingLeft: '20px' }}>
                    <li>Esperá hasta 1 minuto y hacé clic en <strong>Reintentar</strong>.</li>
                    <li>O abrí en otra pestaña <code style={{ background: '#e2e8f0', padding: '2px 6px', borderRadius: '4px' }}>evil-backend.onrender.com/api</code> y cuando cargue, volvé al login.</li>
                </ul>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>En la pantalla de login verás el mensaje: “La primera vez puede tardar unos segundos.”</p>
            </>
        ),
    },
    {
        id: 'no-inicio-sesion',
        title: 'No puedo iniciar sesión (usuario o contraseña incorrectos)',
        content: (
            <>
                <p style={{ margin: '0 0 8px 0' }}>Revisá que el email y la contraseña sean correctos. Si olvidaste la contraseña:</p>
                <p style={{ margin: '0 0 8px 0' }}>
                    <Link to="/forgot-password" style={{ color: '#6366f1', fontWeight: 600 }}>¿Olvidaste tu contraseña?</Link> — te enviamos un enlace para restablecerla.
                </p>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>Si no tenés cuenta, <Link to="/register" style={{ color: '#6366f1' }}>registrate</Link>.</p>
            </>
        ),
    },
    {
        id: 'olvide-contrasena',
        title: 'Olvidé mi contraseña',
        content: (
            <>
                <p style={{ margin: '0 0 8px 0' }}>En la pantalla de login hacé clic en <strong>¿Olvidaste tu contraseña?</strong></p>
                <p style={{ margin: 0 }}>
                    <Link to="/forgot-password" style={{ color: '#6366f1', fontWeight: 600 }}>Ir a recuperar contraseña →</Link>
                </p>
            </>
        ),
    },
    {
        id: 'crear-cliente',
        title: 'Cómo dar de alta un cliente',
        content: (
            <>
                <p style={{ margin: '0 0 8px 0' }}>Entrá a <strong>Clientes</strong> en el menú y hacé clic en el botón para agregar (por ejemplo “Nuevo cliente” o “+” ).</p>
                <p style={{ margin: 0 }}>
                    <Link to="/customers" style={{ color: '#6366f1', fontWeight: 600 }}>Ir a Clientes →</Link>
                </p>
            </>
        ),
    },
    {
        id: 'crear-factura',
        title: 'Cómo crear una factura',
        content: (
            <>
                <p style={{ margin: '0 0 8px 0' }}>Entrá a <strong>Facturas</strong> y usá el botón para crear una nueva factura. Elegí el cliente y los productos o servicios.</p>
                <p style={{ margin: 0 }}>
                    <Link to="/invoices" style={{ color: '#6366f1', fontWeight: 600 }}>Ir a Facturas →</Link>
                </p>
            </>
        ),
    },
    {
        id: 'productos',
        title: 'Cómo agregar productos o servicios',
        content: (
            <>
                <p style={{ margin: '0 0 8px 0' }}>Entrá a <strong>Productos</strong> en el menú y agregá los ítems que después podés usar en las facturas.</p>
                <p style={{ margin: 0 }}>
                    <Link to="/products" style={{ color: '#6366f1', fontWeight: 600 }}>Ir a Productos →</Link>
                </p>
            </>
        ),
    },
    {
        id: 'cuentas-cobros',
        title: 'Ver cuentas corrientes y cobros pendientes',
        content: (
            <>
                <p style={{ margin: '0 0 8px 0' }}>En <strong>Cuentas Corrientes</strong> ves el estado de cuenta por cliente y los cobros pendientes.</p>
                <p style={{ margin: 0 }}>
                    <Link to="/accounts" style={{ color: '#6366f1', fontWeight: 600 }}>Ir a Cuentas Corrientes →</Link>
                </p>
            </>
        ),
    },
    {
        id: 'reportes',
        title: 'Cómo ver reportes',
        content: (
            <>
                <p style={{ margin: '0 0 8px 0' }}>Entrá a <strong>Reportes</strong> para ver resúmenes de ventas, facturación y otros informes.</p>
                <p style={{ margin: 0 }}>
                    <Link to="/reports" style={{ color: '#6366f1', fontWeight: 600 }}>Ir a Reportes →</Link>
                </p>
            </>
        ),
    },
    {
        id: 'configuracion',
        title: 'Cambiar datos de mi cuenta o configuración',
        content: (
            <>
                <p style={{ margin: '0 0 8px 0' }}>En <strong>Configuración</strong> podés actualizar tu perfil y preferencias.</p>
                <p style={{ margin: 0 }}>
                    <Link to="/settings" style={{ color: '#6366f1', fontWeight: 600 }}>Ir a Configuración →</Link>
                </p>
            </>
        ),
    },
    {
        id: 'ver-factura',
        title: 'Ver el detalle de una factura',
        content: (
            <>
                <p style={{ margin: '0 0 8px 0' }}>En <strong>Facturas</strong> hacé clic en la factura que quieras ver (o en “Ver” / el número). Ahí ves ítems, totales y podés registrar pagos.</p>
                <p style={{ margin: 0 }}>
                    <Link to="/invoices" style={{ color: '#6366f1', fontWeight: 600 }}>Ir a Facturas →</Link>
                </p>
            </>
        ),
    },
    {
        id: 'registrar-pago',
        title: 'Registrar un pago en una factura',
        content: (
            <>
                <p style={{ margin: '0 0 8px 0' }}>Abrí la factura desde <strong>Facturas</strong> (clic en la factura). En el detalle hay una sección para cargar pagos (monto, fecha, medio de pago). También podés ver y cargar cobros desde <strong>Cuentas Corrientes</strong>.</p>
                <p style={{ margin: 0 }}>
                    <Link to="/invoices" style={{ color: '#6366f1', fontWeight: 600 }}>Ir a Facturas</Link>
                    {' · '}
                    <Link to="/accounts" style={{ color: '#6366f1', fontWeight: 600 }}>Cuentas Corrientes</Link>
                </p>
            </>
        ),
    },
    {
        id: 'sesion-expirada',
        title: 'Me sacó de la sesión o dice que no estoy logueado',
        content: (
            <>
                <p style={{ margin: '0 0 8px 0' }}>Si pasó mucho tiempo sin usar la app o se cerró el navegador, la sesión puede vencer. Volvé a <strong>Iniciar sesión</strong> con tu email y contraseña.</p>
                <p style={{ margin: 0 }}>Si el problema sigue, probá cerrar sesión y entrar de nuevo, o usar <Link to="/forgot-password" style={{ color: '#6366f1' }}>¿Olvidaste tu contraseña?</Link></p>
            </>
        ),
    },
    {
        id: 'cerrar-sesion',
        title: 'Cómo cerrar sesión',
        content: (
            <>
                <p style={{ margin: '0 0 8px 0' }}>En el menú de la izquierda, abajo, tocá <strong>🚪 Cerrar Sesión</strong>. Volverás a la pantalla de login.</p>
            </>
        ),
    },
];

interface HelpPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

const HelpPanel: React.FC<HelpPanelProps> = ({ isOpen, onClose }) => {
    const [search, setSearch] = useState('');
    const [openId, setOpenId] = useState<string | null>(null);
    const searchRef = useRef<HTMLInputElement>(null);

    const filtered = search.trim()
        ? helpItems.filter(
            (item) =>
                item.title.toLowerCase().includes(search.toLowerCase())
          )
        : helpItems;

    useEffect(() => {
        if (!isOpen) return;
        searchRef.current?.focus();
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <>
            <div
                onClick={onClose}
                style={{
                    position: 'fixed',
                    inset: 0,
                    backgroundColor: 'rgba(0,0,0,0.4)',
                    zIndex: 1000,
                    animation: 'fadeIn 0.2s ease-out',
                }}
                aria-hidden="true"
            />
            <div
                role="dialog"
                aria-label="Ayuda"
                style={{
                    position: 'fixed',
                    top: 0,
                    right: 0,
                    bottom: 0,
                    width: '100%',
                    maxWidth: '420px',
                    backgroundColor: '#fff',
                    boxShadow: '-4px 0 24px rgba(0,0,0,0.15)',
                    zIndex: 1001,
                    display: 'flex',
                    flexDirection: 'column',
                    animation: 'slideInRight 0.25s ease-out',
                }}
            >
                <div style={{
                    padding: '20px',
                    borderBottom: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                }}>
                    <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#1e293b' }}>
                        ¿En qué podemos ayudarte?
                    </h2>
                    <button
                        onClick={onClose}
                        aria-label="Cerrar ayuda"
                        style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '24px',
                            color: '#64748b',
                            cursor: 'pointer',
                            padding: '4px',
                            lineHeight: 1,
                        }}
                    >
                        ×
                    </button>
                </div>

                <div style={{ padding: '16px', borderBottom: '1px solid #e2e8f0' }}>
                    <input
                        ref={searchRef}
                        type="search"
                        placeholder="Buscar en la ayuda..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        aria-label="Buscar en la ayuda"
                        style={{
                            width: '100%',
                            padding: '10px 14px',
                            fontSize: '14px',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            boxSizing: 'border-box',
                        }}
                    />
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
                    {filtered.length === 0 ? (
                        <p style={{ color: '#64748b', fontSize: '14px' }}>No hay resultados para “{search}”. Probá con otras palabras.</p>
                    ) : (
                        filtered.map((item) => {
                            const isOpenItem = openId === item.id;
                            return (
                                <div
                                    key={item.id}
                                    style={{
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '10px',
                                        marginBottom: '10px',
                                        overflow: 'hidden',
                                    }}
                                >
                                    <button
                                        onClick={() => setOpenId(isOpenItem ? null : item.id)}
                                        style={{
                                            width: '100%',
                                            padding: '14px 16px',
                                            textAlign: 'left',
                                            background: isOpenItem ? '#f1f5f9' : '#fff',
                                            border: 'none',
                                            cursor: 'pointer',
                                            fontSize: '14px',
                                            fontWeight: 600,
                                            color: '#1e293b',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            gap: '8px',
                                        }}
                                    >
                                        <span>{item.title}</span>
                                        <span style={{
                                            transform: isOpenItem ? 'rotate(180deg)' : 'rotate(0deg)',
                                            transition: 'transform 0.2s',
                                            fontSize: '18px',
                                            color: '#6366f1',
                                        }}>
                                            ▼
                                        </span>
                                    </button>
                                    {isOpenItem && (
                                        <div style={{
                                            padding: '0 16px 16px',
                                            fontSize: '14px',
                                            color: '#475569',
                                            lineHeight: 1.5,
                                            borderTop: '1px solid #e2e8f0',
                                        }}>
                                            {item.content}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>

                <div style={{ padding: '12px 16px', borderTop: '1px solid #e2e8f0', fontSize: '12px', color: '#94a3b8', textAlign: 'center' }}>
                    <kbd style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>Esc</kbd> para cerrar
                </div>

                <style>{`
                    @keyframes fadeIn {
                        from { opacity: 0; }
                        to { opacity: 1; }
                    }
                    @keyframes slideInRight {
                        from { transform: translateX(100%); }
                        to { transform: translateX(0); }
                    }
                `}</style>
            </div>
        </>
    );
};

export default HelpPanel;
