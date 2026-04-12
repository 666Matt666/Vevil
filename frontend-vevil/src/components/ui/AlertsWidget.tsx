import { useState, useEffect } from 'react';
import { getInvoiceConfig, getAlertsConfig } from '../settings/Settings';
import { productsApi } from '../../services/api';
import { formatMoney } from '../settings/Settings';

interface Alert {
    type: 'warning' | 'error' | 'info';
    title: string;
    message: string;
}

export const AlertsWidget: React.FC = () => {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        checkAlerts();
    }, []);

    const checkAlerts = async () => {
        const newAlerts: Alert[] = [];
        const config = getAlertsConfig();
        
        try {
            const products = await productsApi.getAll();
            
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
                        message: `${lowStock.length} producto${lowStock.length > 1 ? 's' : ''} con stock bajo o mínimo`
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
                            message: `El timbrado está vencido. Actualizá la configuración.`
                        });
                    } else if (daysUntilExpiry <= config.timbradoExpiryWarningDays) {
                        newAlerts.push({
                            type: 'warning',
                            title: '⚠️ Timbrado por Vencer',
                            message: `Vence en ${daysUntilExpiry} día${daysUntilExpiry > 1 ? 's' : ''}. Actualizá pronto.`
                        });
                    }
                }
            }
        } catch (e) {
            console.error('Error checking alerts:', e);
        }
        
        setAlerts(newAlerts);
    };

    const colors = {
        warning: { bg: '#fef3c7', border: '#f59e0b', text: '#92400e' },
        error: { bg: '#fee2e2', border: '#dc2626', text: '#991b1b' },
        info: { bg: '#dbeafe', border: '#3b82f6', text: '#1e40af' }
    };

    if (alerts.length === 0) return null;

    return (
        <div style={{ position: 'fixed', top: '80px', right: '24px', zIndex: 9998, maxWidth: '300px' }}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    position: 'relative',
                    padding: '10px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: alerts.some(a => a.type === 'error') ? '#dc2626' : '#f59e0b',
                    color: 'white',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }}
            >
                🔔 Alertas ({alerts.length})
            </button>
            
            {isOpen && (
                <div style={{
                    marginTop: '8px',
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                    overflow: 'hidden'
                }}>
                    {alerts.map((alert, i) => (
                        <div
                            key={i}
                            style={{
                                padding: '12px 16px',
                                backgroundColor: colors[alert.type].bg,
                                borderBottom: i < alerts.length - 1 ? `1px solid ${colors[alert.type].border}20` : 'none',
                                borderLeft: `3px solid ${colors[alert.type].border}`
                            }}
                        >
                            <div style={{ fontWeight: 600, fontSize: '13px', color: colors[alert.type].text, marginBottom: '4px' }}>
                                {alert.title}
                            </div>
                            <div style={{ fontSize: '12px', color: colors[alert.type].text, opacity: 0.9 }}>
                                {alert.message}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AlertsWidget;