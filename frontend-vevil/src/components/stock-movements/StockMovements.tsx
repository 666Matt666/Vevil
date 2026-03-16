import React, { useState, useEffect } from 'react';
import { stockMovementsApi, StockMovement, productsApi, Product, getErrorMessage } from '../../services/api';
import { formatMoney } from '../settings/Settings';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { ErrorMessage } from '../ui/ErrorMessage';

const REASON_LABELS: Record<string, string> = {
    purchase: 'Compra',
    adjustment_in: 'Ajuste entrada',
    adjustment_out: 'Ajuste salida',
    sale: 'Venta (factura)',
};

const StockMovements: React.FC = () => {
    const [movements, setMovements] = useState<StockMovement[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filterProductId, setFilterProductId] = useState<number | ''>('');
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({
        productId: '' as number | '',
        type: 'in' as 'in' | 'out',
        quantity: '',
        reason: 'purchase' as 'purchase' | 'adjustment_in' | 'adjustment_out',
        note: '',
    });
    const [saving, setSaving] = useState(false);

    const load = async () => {
        try {
            setLoading(true);
            setError(null);
            const [movs, prods] = await Promise.all([
                stockMovementsApi.getAll(filterProductId === '' ? undefined : filterProductId),
                productsApi.getAll(),
            ]);
            setMovements(movs);
            setProducts(prods);
        } catch (e) {
            setError(getErrorMessage(e, 'Error al cargar'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, [filterProductId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.productId || !form.quantity || parseInt(form.quantity, 10) < 1) return;
        setSaving(true);
        try {
            await stockMovementsApi.create({
                productId: form.productId,
                type: form.type,
                quantity: parseInt(form.quantity, 10),
                reason: form.reason,
                note: form.note || undefined,
            });
            setShowForm(false);
            setForm({ productId: '', type: 'in', quantity: '', reason: 'purchase', note: '' });
            load();
        } catch (e: any) {
            alert(e.message || 'Error al guardar');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="responsive-padding" style={{ padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ fontSize: 'clamp(22px, 5vw, 28px)', fontWeight: 700, color: '#1e293b', margin: 0 }}>
                        Movimientos de stock
                    </h1>
                    <p style={{ fontSize: '14px', color: '#64748b', margin: '4px 0 0 0' }}>
                        Entradas (compras, ajustes) y salidas por venta
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => setShowForm(true)}
                    style={{
                        padding: '12px 20px',
                        border: 'none',
                        borderRadius: '8px',
                        backgroundColor: '#4f46e5',
                        color: 'white',
                        fontWeight: 600,
                        cursor: 'pointer',
                    }}
                >
                    + Entrada / Ajuste
                </button>
            </div>

            {error && (
                <ErrorMessage
                    message={error}
                    onRetry={load}
                    onDismiss={() => setError(null)}
                />
            )}

            <div style={{ marginBottom: '16px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                <label style={{ fontSize: '14px', color: '#475569' }}>Filtrar por producto:</label>
                <select
                    value={filterProductId}
                    onChange={(e) => setFilterProductId(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                    style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', minWidth: '220px' }}
                >
                    <option value="">Todos</option>
                    {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name} (stock: {p.stock})</option>
                    ))}
                </select>
            </div>

            {showForm && (
                <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', marginBottom: '24px', border: '1px solid #e2e8f0' }}>
                    <h3 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>Nuevo movimiento</h3>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'flex-end' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', color: '#64748b' }}>Producto *</label>
                            <select
                                required
                                value={form.productId}
                                onChange={(e) => setForm({ ...form, productId: e.target.value === '' ? '' : parseInt(e.target.value, 10) })}
                                style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', minWidth: '200px' }}
                            >
                                <option value="">Elegir...</option>
                                {products.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', color: '#64748b' }}>Tipo *</label>
                            <select
                                value={form.type}
                                onChange={(e) => {
                                    const t = e.target.value as 'in' | 'out';
                                    setForm({ ...form, type: t, reason: t === 'in' ? 'purchase' : 'adjustment_out' });
                                }}
                                style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                            >
                                <option value="in">Entrada</option>
                                <option value="out">Salida</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', color: '#64748b' }}>Motivo *</label>
                            <select
                                value={form.reason}
                                onChange={(e) => setForm({ ...form, reason: e.target.value as 'purchase' | 'adjustment_in' | 'adjustment_out' })}
                                style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                            >
                                {form.type === 'in' && (
                                    <>
                                        <option value="purchase">Compra</option>
                                        <option value="adjustment_in">Ajuste entrada</option>
                                    </>
                                )}
                                {form.type === 'out' && <option value="adjustment_out">Ajuste salida</option>}
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', color: '#64748b' }}>Cantidad *</label>
                            <input
                                type="number"
                                min={1}
                                value={form.quantity}
                                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                                required
                                style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', width: '100px' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', color: '#64748b' }}>Nota</label>
                            <input
                                type="text"
                                value={form.note}
                                onChange={(e) => setForm({ ...form, note: e.target.value })}
                                placeholder="Opcional"
                                style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', width: '180px' }}
                            />
                        </div>
                        <button type="submit" disabled={saving} style={{ padding: '10px 20px', borderRadius: '8px', backgroundColor: saving ? '#94a3b8' : '#4f46e5', color: 'white', border: 'none', cursor: saving ? 'not-allowed' : 'pointer' }}>
                            {saving ? 'Guardando...' : 'Guardar'}
                        </button>
                        <button type="button" onClick={() => setShowForm(false)} style={{ padding: '10px 20px', borderRadius: '8px', backgroundColor: '#f1f5f9', color: '#475569', border: 'none', cursor: 'pointer' }}>
                            Cancelar
                        </button>
                    </form>
                </div>
            )}

            {loading ? (
                <LoadingSpinner message="Cargando movimientos..." color="#0ea5e9" minHeight={200} />
            ) : (
                <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f8fafc' }}>
                                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, color: '#475569', fontSize: '14px' }}>Fecha</th>
                                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, color: '#475569', fontSize: '14px' }}>Producto</th>
                                <th style={{ padding: '12px', textAlign: 'center', fontWeight: 600, color: '#475569', fontSize: '14px' }}>Tipo</th>
                                <th style={{ padding: '12px', textAlign: 'right', fontWeight: 600, color: '#475569', fontSize: '14px' }}>Cantidad</th>
                                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, color: '#475569', fontSize: '14px' }}>Motivo</th>
                                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, color: '#475569', fontSize: '14px' }}>Nota</th>
                            </tr>
                        </thead>
                        <tbody>
                            {movements.length === 0 ? (
                                <tr>
                                    <td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>
                                        No hay movimientos registrados
                                    </td>
                                </tr>
                            ) : (
                                movements.map((m) => (
                                    <tr key={m.id} style={{ borderTop: '1px solid #e2e8f0' }}>
                                        <td style={{ padding: '12px', fontSize: '13px', color: '#64748b' }}>
                                            {new Date(m.createdAt).toLocaleString('es-AR')}
                                        </td>
                                        <td style={{ padding: '12px', fontWeight: 500 }}>{m.product?.name ?? `#${m.productId}`}</td>
                                        <td style={{ padding: '12px', textAlign: 'center' }}>
                                            <span style={{
                                                backgroundColor: m.type === 'in' ? '#dcfce7' : '#fee2e2',
                                                color: m.type === 'in' ? '#166534' : '#991b1b',
                                                padding: '4px 10px',
                                                borderRadius: '9999px',
                                                fontSize: '12px',
                                                fontWeight: 500,
                                            }}>
                                                {m.type === 'in' ? 'Entrada' : 'Salida'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '12px', textAlign: 'right', fontWeight: 600 }}>{m.quantity}</td>
                                        <td style={{ padding: '12px', fontSize: '13px' }}>{REASON_LABELS[m.reason] ?? m.reason}</td>
                                        <td style={{ padding: '12px', fontSize: '13px', color: '#64748b' }}>{m.note || '—'}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default StockMovements;
