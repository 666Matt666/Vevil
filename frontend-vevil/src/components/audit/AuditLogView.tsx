import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useProfile } from '../../hooks/useAuth';
import { auditApi, getErrorMessage, type AuditLogItem } from '../../services/api';
import { exportAuditToCsv } from '../../utils/exportCsv';

import { ErrorMessage } from '../ui/ErrorMessage';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { Pagination } from '../ui/Pagination';

const ENTITY_TYPES = [
    { value: '', label: 'Todos' },
    { value: 'invoice', label: 'Factura' },
    { value: 'customer', label: 'Cliente' },
    { value: 'product', label: 'Producto' },
    { value: 'auth', label: 'Auth' },
];

const LIMIT_OPTIONS = [20, 50, 100, 200];

const AuditLogView: React.FC = () => {
    const navigate = useNavigate();
    const { data: profile } = useProfile();
    const isAdmin = String(profile?.role ?? '').toLowerCase() === 'admin' || profile?.email?.toLowerCase() === 'admin@vevil.com';

    // Redirect non-admin users
    useEffect(() => {
        if (profile && !isAdmin) {
            navigate('/dashboard', { replace: true });
        }
    }, [profile, isAdmin, navigate]);
    const [logs, setLogs] = useState<AuditLogItem[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [userId, setUserId] = useState('');
    const [entityType, setEntityType] = useState('');
    const [entityId, setEntityId] = useState('');
    const [limit, setLimit] = useState(50);

    const load = async (pageNum: number = page) => {
        try {
            setLoading(true);
            setError(null);
            const offset = (pageNum - 1) * limit;
            const params: { userId?: string; entityType?: string; entityId?: string; limit: number; offset?: number } = { limit };
            if (userId.trim()) params.userId = userId.trim();
            if (entityType) params.entityType = entityType;
            if (entityId.trim()) params.entityId = entityId.trim();
            if (!params.userId && !(params.entityType && params.entityId)) params.offset = offset;
            const result = await auditApi.getList(params);
            setLogs(result.data);
            setTotal(result.total);
        } catch (err) {
            setError(getErrorMessage(err, 'Error al cargar auditoría'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load(page);
    }, [page, limit]);

    const handleApplyFilters = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        load(1);
    };

    const goToPage = (newPage: number) => setPage(newPage);

    const formatDate = (dateStr: string) => {
        try {
            return new Date(dateStr).toLocaleString('es-PY', {
                dateStyle: 'short',
                timeStyle: 'medium',
            });
        } catch {
            return dateStr;
        }
    };

    const formatDateCsv = (dateStr: string) => (dateStr ? dateStr.slice(0, 19).replace('T', ' ') : '');

    const handleExportCsv = () => {
        exportAuditToCsv(logs, formatDateCsv);
    };

    const handleExportExcel = async () => {
        try {
            await auditApi.exportExcel();
        } catch (err) {
            alert(getErrorMessage(err, 'Error al exportar Excel'));
        }
    };

    return (
        <div className="responsive-padding" style={{ padding: '32px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ fontSize: 'clamp(24px, 5vw, 32px)', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>
                        📋 Auditoría
                    </h1>
                    <p style={{ color: '#64748b', margin: 0 }}>
                        Historial de acciones (quién hizo qué y cuándo).
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                        type="button"
                        aria-label="Exportar auditoría a CSV"
                        onClick={handleExportCsv}
                        disabled={logs.length === 0}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: logs.length === 0 ? '#cbd5e1' : '#0f766e',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: 600,
                            cursor: logs.length === 0 ? 'not-allowed' : 'pointer',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        📥 Exportar CSV
                    </button>
                    <button
                        type="button"
                        aria-label="Exportar auditoría a Excel"
                        onClick={handleExportExcel}
                        disabled={logs.length === 0}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: logs.length === 0 ? '#cbd5e1' : '#14532d',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: 600,
                            cursor: logs.length === 0 ? 'not-allowed' : 'pointer',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        📊 Exportar Excel
                    </button>
                </div>
            </div>

            {/* Filtros */}
            <form
                onSubmit={handleApplyFilters}
                style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '12px',
                    alignItems: 'flex-end',
                    marginBottom: '24px',
                    backgroundColor: 'white',
                    padding: '16px',
                    borderRadius: '12px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                }}
            >
                <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '140px' }}>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>Usuario (ID)</span>
                    <input
                        type="text"
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                        placeholder="UUID"
                        style={{
                            padding: '8px 12px',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            fontSize: '14px',
                        }}
                    />
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '120px' }}>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>Tipo entidad</span>
                    <select
                        value={entityType}
                        onChange={(e) => setEntityType(e.target.value)}
                        style={{
                            padding: '8px 12px',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            fontSize: '14px',
                        }}
                    >
                        {ENTITY_TYPES.map((o) => (
                            <option key={o.value || 'all'} value={o.value}>{o.label}</option>
                        ))}
                    </select>
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '100px' }}>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>ID entidad</span>
                    <input
                        type="text"
                        value={entityId}
                        onChange={(e) => setEntityId(e.target.value)}
                        placeholder="ej. 1"
                        style={{
                            padding: '8px 12px',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            fontSize: '14px',
                        }}
                    />
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '80px' }}>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>Límite</span>
                    <select
                        value={limit}
                        onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                        style={{
                            padding: '8px 12px',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            fontSize: '14px',
                        }}
                    >
                        {LIMIT_OPTIONS.map((n) => (
                            <option key={n} value={n}>{n}</option>
                        ))}
                    </select>
                </label>
                <button
                    type="submit"
                    style={{
                        padding: '8px 20px',
                        backgroundColor: '#4f46e5',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: 500,
                        cursor: 'pointer',
                    }}
                >
                    Aplicar
                </button>
            </form>

            {error && (
                <ErrorMessage message={error} onRetry={load} onDismiss={() => setError(null)} />
            )}

            {loading ? (
                <LoadingSpinner message="Cargando auditoría..." color="#4f46e5" minHeight={280} />
            ) : logs.length === 0 ? (
                <div style={{ padding: '48px', textAlign: 'center', color: '#64748b', backgroundColor: '#f8fafc', borderRadius: '12px' }}>
                    No hay registros con los filtros indicados.
                </div>
            ) : (
                <div className="responsive-table-container" style={{ overflowX: 'auto', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                    <table className="responsive-table" style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
                                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#64748b' }}>Fecha</th>
                                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#64748b' }}>Usuario</th>
                                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#64748b' }}>Acción</th>
                                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#64748b' }}>Entidad</th>
                                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#64748b' }}>Detalle</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.map((log) => (
                                <tr key={log.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '12px 16px', fontSize: '14px', color: '#475569' }}>
                                        {formatDate(log.createdAt)}
                                    </td>
                                    <td style={{ padding: '12px 16px', fontSize: '14px' }}>
                                        {log.userEmail || log.userId || '—'}
                                    </td>
                                    <td style={{ padding: '12px 16px', fontSize: '14px', fontFamily: 'monospace' }}>
                                        {log.action}
                                    </td>
                                    <td style={{ padding: '12px 16px', fontSize: '14px' }}>
                                        {log.entityType}
                                        {log.entityId ? ` #${log.entityId}` : ''}
                                    </td>
                                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#64748b', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {log.newValue && Object.keys(log.newValue).length > 0
                                            ? JSON.stringify(log.newValue)
                                            : log.oldValue && Object.keys(log.oldValue).length > 0
                                                ? `(anterior: ${JSON.stringify(log.oldValue)})`
                                                : '—'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {total > limit && (
                        <div style={{ padding: '12px 16px' }}>
                            <Pagination
                                page={page}
                                limit={limit}
                                total={total}
                                onPageChange={goToPage}
                                label="registros"
                            />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AuditLogView;
