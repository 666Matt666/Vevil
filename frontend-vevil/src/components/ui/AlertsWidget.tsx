import { useState, useEffect, useRef } from 'react';
import { getInvoiceConfig, getAlertsConfig } from '../settings/Settings';
import { productsApi, metricsApi } from '../../services/api';
import { useToast } from '../../hooks/useToast';

interface Alert {
    type: 'warning' | 'error' | 'info';
    title: string;
    message: string;
    key: string;
    timestamp: number;
}

const NOTIFICATION_KEY = 'vevil_last_notification';
const NOTIFICATION_INTERVAL = 5 * 60 * 1000;

export const AlertsWidget: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [panelOpen, setPanelOpen] = useState(false);
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);
    const { showToast } = useToast();
    const panelRef = useRef<HTMLDivElement>(null);
    const [hasNewAlert, setHasNewAlert] = useState(false);

    useEffect(() => {
        if (compact) return;
        const handleClickOutside = (event: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [compact]);

    const requestNotificationPermission = async () => {
        if ('Notification' in window && Notification.permission === 'default') {
            const permission = await Notification.requestPermission();
            setNotificationsEnabled(permission === 'granted');
        } else if ('Notification' in window) {
            setNotificationsEnabled(Notification.permission === 'granted');
        }
    };

    const sendBrowserNotification = (title: string, body: string) => {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(title, {
                body,
                icon: '/logoVevilTransparente.png',
                badge: '/logoVevilTransparente.png',
            });
        }
    };

    useEffect(() => {
        requestNotificationPermission();
        checkAlerts();
        const interval = setInterval(checkAlerts, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    const checkAlerts = async () => {
        const newAlerts: Alert[] = [];
        const config = getAlertsConfig();

        try {
            const products = await productsApi.getAll();
            const metrics = await metricsApi.getMetrics();

            if (config.pendingInvoicesEnabled && (metrics.pendingInvoices || 0) > 0) {
                const pendingAmount = metrics.pendingInvoicesAmount || 0;
                newAlerts.push({
                    type: 'warning',
                    title: '📋 Facturas Pendientes',
                    message: `${metrics.pendingInvoices} factura${metrics.pendingInvoices > 1 ? 's' : ''} pendiente${metrics.pendingInvoices > 1 ? 's' : ''} (${pendingAmount.toLocaleString('es-PY')})`,
                    key: 'pending_invoices',
                    timestamp: Date.now()
                });
            }

            if (config.lowStockEnabled) {
                const threshold = config.lowStockThreshold;
                const lowStock = products.filter(p => {
                    const productMinStock = p.minStock != null && p.minStock > 0 ? p.minStock : threshold;
                    return (p.stock ?? 0) <= productMinStock;
                });
                if (lowStock.length > 0) {
                    newAlerts.push({
                        type: 'warning',
                        title: '⚠️ Stock Bajo',
                        message: `${lowStock.length} producto${lowStock.length > 1 ? 's' : ''} con stock bajo`,
                        key: 'low_stock',
                        timestamp: Date.now()
                    });
                }
            }

            if (config.timbradoExpiryWarningDays > 0) {
                const invoiceConfig = getInvoiceConfig();
                if (invoiceConfig.timbrado && invoiceConfig.timbradoVigenciaHasta) {
                    const expiryDate = new Date(invoiceConfig.timbradoVigenciaHasta);
                    const today = new Date();
                    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

                    if (daysUntilExpiry <= 0) {
                        newAlerts.push({
                            type: 'error',
                            title: '❌ Timbrado Vencido',
                            message: 'El timbrado está vencido. Actualizá la configuración.',
                            key: 'timbrado_expired',
                            timestamp: Date.now()
                        });
                    } else if (daysUntilExpiry <= config.timbradoExpiryWarningDays) {
                        newAlerts.push({
                            type: 'warning',
                            title: '⚠️ Timbrado por Vencer',
                            message: `Vence en ${daysUntilExpiry} día${daysUntilExpiry > 1 ? 's' : ''}`,
                            key: 'timbrado_expiring',
                            timestamp: Date.now()
                        });
                    }
                }
            }

            const lastNotification = localStorage.getItem(NOTIFICATION_KEY);
            const now = Date.now();
            const canNotify = !lastNotification || (now - parseInt(lastNotification)) > NOTIFICATION_INTERVAL;

            if (newAlerts.length > 0) {
                const prevAlerts = alerts.map(a => a.key);
                const hasNew = newAlerts.some(a => !prevAlerts.includes(a.key));

                if (hasNew) {
                    setHasNewAlert(true);
                    setTimeout(() => setHasNewAlert(false), 2000);
                }

                const criticalAlert = newAlerts.find(a => a.type === 'error');
                if (criticalAlert && canNotify) {
                    showToast(criticalAlert.message, 'error');
                    sendBrowserNotification(criticalAlert.title, criticalAlert.message);
                    localStorage.setItem(NOTIFICATION_KEY, now.toString());
                } else if (newAlerts.length > 0 && canNotify) {
                    const firstWarning = newAlerts[0];
                    showToast(firstWarning.message, 'warning');
                    sendBrowserNotification(firstWarning.title, firstWarning.message);
                    localStorage.setItem(NOTIFICATION_KEY, now.toString());
                }
            }
        } catch (e) {
            console.error('Error checking alerts:', e);
        }

        setAlerts(newAlerts);
    };

    const colors = {
        warning: { bg: '#fef3c7', border: '#f59e0b', text: '#92400e', icon: '⚠️' },
        error: { bg: '#fee2e2', border: '#dc2626', text: '#991b1b', icon: '❌' },
        info: { bg: '#dbeafe', border: '#3b82f6', text: '#1e40af', icon: 'ℹ️' }
    };

    const errorCount = alerts.filter(a => a.type === 'error').length;
    const warningCount = alerts.filter(a => a.type === 'warning').length;

    // Compact mode: show as horizontal alerts above content
    if (compact) {
        if (alerts.length === 0) return null;

        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                marginBottom: '16px'
            }}>
                {alerts.map((alert) => {
                    const c = colors[alert.type];
                    return (
                        <div
                            key={alert.key}
                            style={{
                                padding: '12px 16px',
                                borderRadius: '10px',
                                backgroundColor: c.bg,
                                border: `1px solid ${c.border}`,
                                color: c.text,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                fontSize: '14px',
                                fontWeight: 500,
                                animation: 'slideIn 0.2s ease-out'
                            }}
                        >
                            <span style={{ fontSize: '18px' }}>{c.icon}</span>
                            <span style={{ flex: 1 }}>{alert.title}: {alert.message}</span>
                        </div>
                    );
                })}
                <style>{`
                    @keyframes slideIn {
                        from { opacity: 0; transform: translateY(-10px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                `}</style>
            </div>
        );
    }

    if (alerts.length === 0) return null;

    return (
        <div
            ref={panelRef}
            style={{
                position: 'fixed',
                top: '80px',
                right: '24px',
                zIndex: 9998,
            }}
        >
            <button
                onClick={() => setPanelOpen(!panelOpen)}
                style={{
                    position: 'relative',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: 'none',
                    backgroundColor: errorCount > 0 ? '#dc2626' : warningCount > 0 ? '#f59e0b' : '#64748b',
                    color: 'white',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                    fontSize: '14px',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    transform: hasNewAlert ? 'scale(1.1)' : 'scale(1)',
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = hasNewAlert ? 'scale(1.1)' : 'scale(1)'}
            >
                <span style={{ fontSize: '18px' }}>🔔</span>
                <span>Alertas</span>
                <span style={{
                    backgroundColor: 'white',
                    color: errorCount > 0 ? '#dc2626' : '#f59e0b',
                    borderRadius: '50%',
                    width: '22px',
                    height: '22px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: 700
                }}>
                    {alerts.length}
                </span>
            </button>

            {panelOpen && (
                <div style={{
                    marginTop: '12px',
                    width: '340px',
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.2)',
                    overflow: 'hidden',
                    animation: 'slideIn 0.2s ease-out'
                }}>
                    <div style={{
                        padding: '16px 20px',
                        backgroundColor: errorCount > 0 ? '#fef2f2' : '#fef3c7',
                        borderBottom: `1px solid ${errorCount > 0 ? '#fecaca' : '#fcd34d'}`,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '20px' }}>
                                {errorCount > 0 ? '🚨' : '⚠️'}
                            </span>
                            <span style={{
                                fontWeight: 600,
                                color: errorCount > 0 ? '#991b1b' : '#92400e',
                                fontSize: '15px'
                            }}>
                                {errorCount > 0
                                    ? `${errorCount} Alerta${errorCount > 1 ? 's' : ''} Crítica${errorCount > 1 ? 's' : ''}`
                                    : `${warningCount} Aviso${warningCount > 1 ? 's' : ''}`
                                }
                            </span>
                        </div>
                        <button
                            onClick={(e) => { e.stopPropagation(); checkAlerts(); }}
                            style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '16px',
                                padding: '4px',
                                color: errorCount > 0 ? '#991b1b' : '#92400e'
                            }}
                            title="Actualizar"
                        >
                            🔄
                        </button>
                    </div>

                    <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
                        {alerts.map((alert, i) => (
                            <div
                                key={alert.key}
                                style={{
                                    padding: '14px 20px',
                                    backgroundColor: colors[alert.type].bg,
                                    borderBottom: i < alerts.length - 1 ? `1px solid ${colors[alert.type].border}30` : 'none',
                                    cursor: 'pointer',
                                    transition: 'background-color 0.15s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors[alert.type].border + '20'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = colors[alert.type].bg}
                            >
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: '10px'
                                }}>
                                    <span style={{ fontSize: '18px', lineHeight: 1 }}>{colors[alert.type].icon}</span>
                                    <div style={{ flex: 1 }}>
                                        <div style={{
                                            fontWeight: 600,
                                            fontSize: '14px',
                                            color: colors[alert.type].text,
                                            marginBottom: '4px'
                                        }}>
                                            {alert.title}
                                        </div>
                                        <div style={{
                                            fontSize: '13px',
                                            color: colors[alert.type].text,
                                            opacity: 0.9,
                                            lineHeight: 1.4
                                        }}>
                                            {alert.message}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={{
                        padding: '12px 20px',
                        backgroundColor: '#f8fafc',
                        borderTop: '1px solid #e2e8f0',
                        textAlign: 'center'
                    }}>
                        <button
                            onClick={() => {
                                const configSection = alertMapping[alerts[0]?.key];
                                if (configSection) {
                                    window.location.hash = configSection;
                                }
                            }}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: '#3b82f6',
                                fontSize: '13px',
                                cursor: 'pointer',
                                fontWeight: 500
                            }}
                        >
                            🔧 Ir a Configuración
                        </button>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes slideIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
            `}</style>
        </div>
    );
};

const alertMapping: Record<string, string> = {
    pending_invoices: '#/invoices',
    low_stock: '#/products',
    timbrado_expired: '#/settings',
    timbrado_expiring: '#/settings'
};

export default AlertsWidget;
