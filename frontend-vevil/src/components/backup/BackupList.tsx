import React, { useState, useEffect } from 'react';

interface Backup {
    id: string;
    type: 'full' | 'incremental';
    frequency: 'diario' | 'semanal' | 'mensual';
    slot: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    filePath?: string;
    fileSize?: number;
    errorMessage?: string;
    needsDownload: boolean;
    createdAt: string;
    completedAt?: string;
}

const BackupList: React.FC = () => {
    const [backups, setBackups] = useState<Backup[]>([]);
    const [loading, setLoading] = useState(true);
    const [triggering, setTriggering] = useState(false);
    const [selectedBackup, setSelectedBackup] = useState<Backup | null>(null);
    const [preview, setPreview] = useState<string>('');
    const [previewLoading, setPreviewLoading] = useState(false);
    const [filter, setFilter] = useState<string>('all');

    const loadBackups = async () => {
        try {
            const res = await fetch('/api/backups');
            const data = await res.json();
            setBackups(data.data || []);
        } catch (err) {
            console.error('Error loading backups:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadBackups();
    }, []);

    const triggerBackup = async () => {
        setTriggering(true);
        try {
            await fetch('/api/backups/trigger', { method: 'POST' });
            await loadBackups();
        } catch (err) {
            console.error('Error triggering backup:', err);
        } finally {
            setTriggering(false);
        }
    };

    const downloadBackup = async (id: string) => {
        try {
            const res = await fetch(`/api/backups/${id}/download`);
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `backup-${id}.sql`;
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Error downloading backup:', err);
        }
    };

    const viewBackup = async (backup: Backup) => {
        setSelectedBackup(backup);
        setPreviewLoading(true);
        try {
            const res = await fetch(`/api/backups/${backup.id}/content`);
            const data = await res.json();
            setPreview(data.preview || data.error || 'No hay contenido');
        } catch (err) {
            setPreview('Error al cargar contenido');
        } finally {
            setPreviewLoading(false);
        }
    };

    const markAsDownloaded = async (id: string) => {
        await fetch(`/api/backups/${id}/mark-downloaded`, { method: 'POST' });
        await loadBackups();
    };

    const deleteBackup = async (id: string) => {
        if (!confirm('¿Eliminar este backup?')) return;
        await fetch(`/api/backups/${id}`, { method: 'DELETE' });
        await loadBackups();
    };

    const formatSize = (bytes?: number) => {
        if (!bytes) return '—';
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleString('es-PY', {
            dateStyle: 'medium',
            timeStyle: 'short',
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return '#22c55e';
            case 'running': return '#f59e0b';
            case 'failed': return '#dc2626';
            default: return '#64748b';
        }
    };

    const getFrequencyLabel = (freq: string) => {
        switch (freq) {
            case 'diario': return 'Diario';
            case 'semanal': return 'Semanal';
            case 'mensual': return 'Mensual';
            default: return freq;
        }
    };

    const getSlotLabel = (slot: string) => {
        const labels: Record<string, string> = {
            'diario_1': 'Día 1', 'diario_2': 'Día 2', 'diario_3': 'Día 3',
            'semanal_1': 'Sem 1', 'semanal_2': 'Sem 2', 'semanal_3': 'Sem 3', 'semanal_4': 'Sem 4',
            'mensual_1': 'Mes 1', 'mensual_2': 'Mes 2', 'mensual_3': 'Mes 3',
        };
        return labels[slot] || slot;
    };

    const filteredBackups = filter === 'all' ? backups : backups.filter(b => b.frequency === filter);

    const downloadAlerts = backups.filter(b => b.needsDownload);

    return (
        <div className="responsive-padding" style={{ padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ fontSize: 'clamp(24px, 5vw, 32px)', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>
                        💾 Backups
                    </h1>
                    <p style={{ color: '#64748b' }}>
                        Sistema de respaldo automático con rotación de ranuras.
                    </p>
                </div>
                <button
                    onClick={triggerBackup}
                    disabled={triggering}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: triggering ? '#94a3b8' : '#22c55e',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: 500,
                        cursor: triggering ? 'not-allowed' : 'pointer',
                    }}
                >
                    {triggering ? 'Ejecutando...' : 'Crear Backup Ahora'}
                </button>
            </div>

            {downloadAlerts.length > 0 && (
                <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: '#fef3c7', borderRadius: '12px', border: '1px solid #f59e0b' }}>
                    <h3 style={{ margin: '0 0 12px 0', color: '#92400e', fontSize: '16px' }}>
                        ⚠️ Descargar y eliminar backups mensuales
                    </h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {downloadAlerts.map(b => (
                            <button
                                key={b.id}
                                onClick={() => downloadBackup(b.id)}
                                style={{
                                    padding: '8px 12px',
                                    backgroundColor: '#fff',
                                    border: '1px solid #f59e0b',
                                    borderRadius: '6px',
                                    fontSize: '13px',
                                    cursor: 'pointer',
                                }}
                            >
                                📥 {getFrequencyLabel(b.frequency)} {getSlotLabel(b.slot)}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                {['all', 'diario', 'semanal', 'mensual'].map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        style={{
                            padding: '6px 14px',
                            backgroundColor: filter === f ? '#22c55e' : '#f1f5f9',
                            color: filter === f ? 'white' : '#475569',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '13px',
                            cursor: 'pointer',
                        }}
                    >
                        {f === 'all' ? 'Todos' : getFrequencyLabel(f)}
                    </button>
                ))}
            </div>

            <div style={{ display: 'grid', gap: '12px' }}>
                {loading ? (
                    <div style={{ padding: '20px', textAlign: 'center' }}>Cargando...</div>
                ) : filteredBackups.length === 0 ? (
                    <div style={{ padding: '48px', textAlign: 'center', color: '#64748b', backgroundColor: '#f8fafc', borderRadius: '12px' }}>
                        No hay backups disponibles.
                    </div>
                ) : (
                    filteredBackups.map((backup) => (
                        <div
                            key={backup.id}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                padding: '12px 16px',
                                backgroundColor: backup.needsDownload ? '#fef3c7' : 'white',
                                borderRadius: '10px',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                                gap: '12px',
                            }}
                        >
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '2px' }}>
                                    <span style={{
                                        padding: '3px 8px',
                                        borderRadius: '4px',
                                        fontSize: '11px',
                                        fontWeight: 600,
                                        backgroundColor: backup.frequency === 'diario' ? '#dbeafe' : 
                                                        backup.frequency === 'semanal' ? '#dcfce7' : '#fef3c7',
                                        color: backup.frequency === 'diario' ? '#1d4ed8' : 
                                               backup.frequency === 'semanal' ? '#166534' : '#92400e',
                                    }}>
                                        {getFrequencyLabel(backup.frequency)}
                                    </span>
                                    <span style={{ fontSize: '12px', color: '#64748b' }}>
                                        {getSlotLabel(backup.slot)}
                                    </span>
                                    <span style={{
                                        width: '6px',
                                        height: '6px',
                                        borderRadius: '50%',
                                        backgroundColor: getStatusColor(backup.status),
                                    }} />
                                    <span style={{ fontSize: '12px', color: '#64748b' }}>
                                        {backup.status === 'completed' ? '✓' :
                                         backup.status === 'running' ? '⏳' :
                                         backup.status === 'failed' ? '✗' : '...'}
                                    </span>
                                </div>
                                <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                                    {formatDate(backup.createdAt)}
                                </div>
                            </div>
                            <div style={{ fontSize: '13px', color: '#64748b', minWidth: '70px', textAlign: 'right' }}>
                                {formatSize(backup.fileSize)}
                            </div>
                            <div style={{ display: 'flex', gap: '6px' }}>
                                <button
                                    onClick={() => viewBackup(backup)}
                                    style={{
                                        padding: '6px 10px',
                                        backgroundColor: '#f1f5f9',
                                        color: '#475569',
                                        border: 'none',
                                        borderRadius: '4px',
                                        fontSize: '12px',
                                        cursor: 'pointer',
                                    }}
                                >
                                    Ver
                                </button>
                                <button
                                    onClick={() => downloadBackup(backup.id)}
                                    disabled={backup.status !== 'completed'}
                                    style={{
                                        padding: '6px 10px',
                                        backgroundColor: backup.status === 'completed' ? '#e0f2fe' : '#e2e8f0',
                                        color: backup.status === 'completed' ? '#0369a1' : '#94a3b8',
                                        border: 'none',
                                        borderRadius: '4px',
                                        fontSize: '12px',
                                        cursor: backup.status === 'completed' ? 'pointer' : 'not-allowed',
                                    }}
                                >
                                    ↓
                                </button>
                                <button
                                    onClick={() => deleteBackup(backup.id)}
                                    style={{
                                        padding: '6px 10px',
                                        backgroundColor: '#fee2e2',
                                        color: '#dc2626',
                                        border: 'none',
                                        borderRadius: '4px',
                                        fontSize: '12px',
                                        cursor: 'pointer',
                                    }}
                                >
                                    ✕
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {selectedBackup && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 1000,
                }} onClick={() => setSelectedBackup(null)}>
                    <div style={{
                        backgroundColor: 'white', borderRadius: '16px', padding: '24px', maxWidth: '700px', width: '90%',
                        maxHeight: '80vh', overflow: 'auto',
                    }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h2 style={{ margin: 0, fontSize: '20px' }}>
                                {getFrequencyLabel(selectedBackup.frequency)} - {getSlotLabel(selectedBackup.slot)}
                            </h2>
                            <button onClick={() => setSelectedBackup(null)} style={{
                                background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer',
                            }}>✕</button>
                        </div>
                        <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
                            <p>Fecha: {formatDate(selectedBackup.createdAt)}</p>
                            <p>Tamaño: {formatSize(selectedBackup.fileSize)}</p>
                            <p>Tipo: {selectedBackup.type === 'full' ? 'Completo' : 'Incremental'}</p>
                        </div>
                        <div style={{ backgroundColor: '#f8fafc', borderRadius: '8px', padding: '12px', maxHeight: '300px', overflow: 'auto' }}>
                            <pre style={{ margin: 0, fontSize: '11px', fontFamily: 'monospace', whiteSpace: 'pre-wrap', color: '#475569' }}>
                                {previewLoading ? 'Cargando...' : preview}
                            </pre>
                        </div>
                        <div style={{ display: 'flex', gap: '12px', marginTop: '16px', justifyContent: 'flex-end' }}>
                            {selectedBackup.needsDownload && (
                                <button onClick={() => markAsDownloaded(selectedBackup.id)} style={{
                                    padding: '8px 16px', backgroundColor: '#f59e0b', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer',
                                }}>
                                    Marcar como descargado
                                </button>
                            )}
                            <button onClick={() => downloadBackup(selectedBackup.id)} disabled={selectedBackup.status !== 'completed'} style={{
                                padding: '8px 16px', backgroundColor: '#22c55e', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer',
                            }}>
                                Descargar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div style={{ marginTop: '32px', padding: '20px', backgroundColor: '#f0fdf4', borderRadius: '12px', border: '1px solid #bbf7d0' }}>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#14532d' }}>📅 Programación Automática</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', fontSize: '14px', color: '#166534' }}>
                    <div>
                        <strong>Diarios (3 rotativos)</strong>
                        <ul style={{ margin: '4px 0 0 0', paddingLeft: '16px' }}>
                            <li>Ejecuta: Diario 2:00 AM</li>
                            <li>Tipo: Incremental (últimas 24h)</li>
                            <li>Slot: Día 1 → 2 → 3 → 1...</li>
                        </ul>
                    </div>
                    <div>
                        <strong>Semanales (4 rotativos)</strong>
                        <ul style={{ margin: '4px 0 0 0', paddingLeft: '16px' }}>
                            <li>Ejecuta: Sábados 2:00 AM</li>
                            <li>Tipo: Completo (toda la BD)</li>
                            <li>Slot: Sem 1 → 2 → 3 → 4...</li>
                        </ul>
                    </div>
                    <div>
                        <strong>Mensuales (3 rotativos)</strong>
                        <ul style={{ margin: '4px 0 0 0', paddingLeft: '16px' }}>
                            <li>Ejecuta: Último sábado del mes</li>
                            <li>Tipo: Completo (toda la BD)</li>
                            <li>Slot: Mes 1-2-3 (alerts tras 3 meses)</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BackupList;