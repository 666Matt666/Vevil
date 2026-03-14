import React, { useState, useEffect } from 'react';
import { getRates, fetchRates } from '../../services/currencyRates';
import type { CachedRates } from '../../services/currencyRates';

/**
 * Barra de tasas de cambio: diseño sutil, siempre arriba en pantallas que implican dinero.
 * Se muestra en Layout solo en rutas: dashboard, products, invoices, accounts, reports.
 */
const CurrencyRatesBar: React.FC = () => {
    const [rates, setRates] = useState<CachedRates | null>(null);

    useEffect(() => {
        const cached = getRates();
        setRates(cached);
        fetchRates().then((data) => {
            if (data) setRates(data);
        });
    }, []);

    const pygPerUsd = rates?.rates?.PYG;
    const arsPerUsd = rates?.rates?.ARS;
    const brlPerUsd = rates?.rates?.BRL;
    const ratesUpdated = rates?.updatedAt;

    return (
        <div
            style={{
                background: 'linear-gradient(to bottom, #fafbfc 0%, #f1f5f9 100%)',
                borderBottom: '1px solid #e2e8f0',
                padding: '10px 20px',
                marginBottom: 0,
            }}
        >
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexWrap: 'wrap',
                    gap: '8px',
                    maxWidth: 1200,
                    margin: '0 auto',
                }}
            >
                <span
                    style={{
                        fontSize: '11px',
                        color: '#64748b',
                        marginRight: '4px',
                        fontWeight: 500,
                    }}
                >
                    Referencia
                </span>
                <span
                    style={{
                        fontSize: '13px',
                        color: '#475569',
                        fontWeight: 600,
                        padding: '4px 10px',
                        background: 'rgba(59, 130, 246, 0.08)',
                        borderRadius: '6px',
                        border: '1px solid rgba(59, 130, 246, 0.2)',
                    }}
                >
                    $ 1 USD
                </span>
                <span style={{ color: '#cbd5e1', fontSize: '12px', margin: '0 2px' }}>·</span>
                <span
                    style={{
                        fontSize: '12px',
                        color: '#475569',
                        padding: '4px 10px',
                        background: 'rgba(16, 185, 129, 0.06)',
                        borderRadius: '6px',
                        border: '1px solid rgba(16, 185, 129, 0.15)',
                    }}
                >
                    <span style={{ color: '#64748b', fontWeight: 500 }}>PYG</span>{' '}
                    {pygPerUsd != null ? `₲ ${Number(pygPerUsd).toLocaleString('es-PY', { maximumFractionDigits: 0 })}` : '—'}
                </span>
                <span
                    style={{
                        fontSize: '12px',
                        color: '#475569',
                        padding: '4px 10px',
                        background: 'rgba(30, 64, 175, 0.06)',
                        borderRadius: '6px',
                        border: '1px solid rgba(30, 64, 175, 0.15)',
                    }}
                >
                    <span style={{ color: '#64748b', fontWeight: 500 }}>ARS</span>{' '}
                    {arsPerUsd != null ? Number(arsPerUsd).toLocaleString('es-PY', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '—'}
                </span>
                <span
                    style={{
                        fontSize: '12px',
                        color: '#475569',
                        padding: '4px 10px',
                        background: 'rgba(22, 101, 52, 0.06)',
                        borderRadius: '6px',
                        border: '1px solid rgba(22, 101, 52, 0.15)',
                    }}
                >
                    <span style={{ color: '#64748b', fontWeight: 500 }}>BRL</span>{' '}
                    {brlPerUsd != null ? `R$ ${Number(brlPerUsd).toLocaleString('es-PY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—'}
                </span>
            </div>
            {ratesUpdated && (
                <p
                    style={{
                        fontSize: '10px',
                        color: '#94a3b8',
                        margin: '6px 0 0 0',
                        textAlign: 'center',
                    }}
                >
                    Tasas del momento · Actualizado: {new Date(ratesUpdated).toLocaleString('es-PY')}
                </p>
            )}
        </div>
    );
};

export default CurrencyRatesBar;
