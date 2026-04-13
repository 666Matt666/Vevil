import React, { useState, useEffect, useMemo } from 'react';
import { LoadingSpinner } from '../ui/LoadingSpinner';

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

interface ScheduledBackup {
    date: Date;
    frequency: 'diario' | 'semanal' | 'mensual';
    slot: string;
    status: 'completed' | 'scheduled' | 'failed';
    backup?: Backup;
    time: string;
}

const BackupList: React.FC = () => {
    const [backups, setBackups] = useState<Backup[]>([]);
    const [loading, setLoading] = useState(true);
    const [triggering, setTriggering] = useState(false);
    const [selectedBackup, setSelectedBackup] = useState<Backup | null>(null);
    const [preview, setPreview] = useState<string>('');
    const [previewLoading, setPreviewLoading] = useState(false);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [backupDestination, setBackupDestination] = useState<'local' | 'github'>('local');

    const loadBackupSettings = async () => {
        try {
            const res = await fetch('/api/backups/settings');
            if (res.ok) {
                const data = await res.json();
                setBackupDestination(data.destination || 'local');
            }
        } catch (err) {
            console.error('Error loading backup settings:', err);
        }
    };

    const handleDestinationChange = async (dest: 'local' | 'github') => {
        try {
            const res = await fetch('/api/backups/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ destination: dest }),
            });
            if (res.ok) {
                setBackupDestination(dest);
            }
        } catch (err) {
            console.error('Error saving backup settings:', err);
        }
    };

    useEffect(() => {
        loadBackups();
        loadBackupSettings();
    }, []);

    const getBackupSchedule = (date: Date): { time: string; frequency: string } | null => {
        const day = date.getDay();
        const dayOfMonth = date.getDate();
        
        // No hay backups los domingos (día 0)
        if (day === 0) return null;
        
        // Mensual: 1° del mes (solo si no es domingo)
        if (dayOfMonth === 1) {
            return { time: '02:00', frequency: 'mensual' };
        }
        // Semanal: Sábados (día 6)
        if (day === 6) {
            return { time: '02:00', frequency: 'semanal' };
        }
        // Diario: Lunes a Sábado (días 1-6), excepto el 1° del mes
        return { time: '02:00', frequency: 'diario' };
    };

    const getSlotForDate = (date: Date, frequency: string): string => {
        if (frequency === 'diario') {
            const day = date.getDate();
            return `diario_${((day - 1) % 3) + 1}`;
        }
        if (frequency === 'semanal') {
            const week = Math.ceil(date.getDate() / 7);
            return `semanal_${week}`;
        }
        const month = date.getMonth();
        return `mensual_${(month % 3) + 1}`;
    };

    const getSlotLabel = (frequency: string, slot: string): string => {
        const match = slot.match(/(\d+)$/);
        const num = match ? match[1] : '?';
        if (frequency === 'diario') return `D${num}`;
        if (frequency === 'semanal') return `S${num}`;
        return `M${num}`;
    };

    const getFrequencyColor = (frequency: string) => {
        if (frequency === 'diario') return '#22c55e';
        if (frequency === 'semanal') return '#3b82f6';
        return '#8b5cf6';
    };

    const getFrequencyLabel = (frequency: string) => {
        if (frequency === 'diario') return 'Diario';
        if (frequency === 'semanal') return 'Semanal';
        return 'Mensual';
    };

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

    const calendarDays = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startDayOfWeek = firstDay.getDay();
        
        const days: { date: Date; isCurrentMonth: boolean }[] = [];
        
        const prevMonthDays = startDayOfWeek;
        for (let i = prevMonthDays - 1; i >= 0; i--) {
            const d = new Date(year, month, -i);
            days.push({ date: d, isCurrentMonth: false });
        }
        
        for (let i = 1; i <= daysInMonth; i++) {
            days.push({ date: new Date(year, month, i), isCurrentMonth: true });
        }
        
        const remaining = 42 - days.length;
        for (let i = 1; i <= remaining; i++) {
            days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
        }
        
        return days;
    }, [currentDate]);

    const scheduledBackups = useMemo(() => {
        const scheduled: ScheduledBackup[] = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        calendarDays.forEach(({ date, isCurrentMonth }) => {
            if (!isCurrentMonth) return;
            
            const schedule = getBackupSchedule(date);
            // No hay backup programado los domingos
            if (!schedule) return;
            
            const dateStr = date.toISOString().split('T')[0];
            
            const backupForDate = backups.find(b => {
                if (!b.createdAt) return false;
                const backupDate = new Date(b.createdAt).toISOString().split('T')[0];
                return backupDate === dateStr && b.frequency === schedule.frequency;
            });
            
            scheduled.push({
                date,
                frequency: schedule.frequency as 'diario' | 'semanal' | 'mensual',
                slot: getSlotForDate(date, schedule.frequency),
                status: backupForDate?.status === 'completed' ? 'completed' : 
                        date < today ? 'failed' : 'scheduled',
                backup: backupForDate,
                time: schedule.time
            });
        });
        
        return scheduled;
    }, [calendarDays, backups]);

    const getStatusColor = (status: string, isPast: boolean) => {
        if (status === 'completed') return '#22c55e';
        if (status === 'running') return '#f59e0b';
        if (status === 'failed') return '#dc2626';
        if (isPast) return '#94a3b8';
        return '#6366f1';
    };

    const getStatusIcon = (status: string) => {
        if (status === 'completed') return '✓';
        if (status === 'running') return '⏳';
        if (status === 'failed') return '✗';
        return '○';
    };

    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

    const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

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

    const formatSize = (bytes?: number) => {
        if (!bytes) return '—';
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const downloadAlerts = backups.filter(b => b.needsDownload);

    const getBackupForDay = (date: Date) => {
        const dateStr = date.toISOString().split('T')[0];
        return scheduledBackups.find(s => s.date.toISOString().split('T')[0] === dateStr);
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (loading) {
        return <LoadingSpinner message="Cargando backups..." color="#6366f1" />;
    }

    return (
        <div className="responsive-padding" style={{ padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ fontSize: 'clamp(24px, 5vw, 32px)', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>
                        💾 Backups
                    </h1>
                    <p style={{ color: '#64748b' }}>
                        Calendario de respaldos automáticos programados.
                    </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <select
                        value={backupDestination}
                        onChange={(e) => handleDestinationChange(e.target.value as 'local' | 'github')}
                        style={{
                            padding: '8px 12px',
                            borderRadius: '6px',
                            border: '1px solid #e2e8f0',
                            fontSize: '13px',
                            backgroundColor: 'white',
                            cursor: 'pointer',
                        }}
                    >
                        <option value="local">💾 Render Disk</option>
                        <option value="github">🐙 GitHub (vevil-backups)</option>
                    </select>
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
                                📥 {b.frequency} - {b.slot}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid #e2e8f0' }}>
                    <button onClick={prevMonth} style={{ padding: '8px 16px', backgroundColor: '#f1f5f9', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '18px' }}>◀</button>
                    <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 600, color: '#1e293b' }}>
                        {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </h2>
                    <button onClick={nextMonth} style={{ padding: '8px 16px', backgroundColor: '#f1f5f9', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '18px' }}>▶</button>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid #e2e8f0' }}>
                    {dayNames.map(day => (
                        <div key={day} style={{ padding: '12px', textAlign: 'center', fontWeight: 600, color: '#64748b', fontSize: '13px' }}>
                            {day}
                        </div>
                    ))}
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
                    {calendarDays.map(({ date, isCurrentMonth }, index) => {
                        const backup = getBackupForDay(date);
                        const isToday = date.toDateString() === new Date().toDateString();
                        const isPast = date < today;
                        const freqColor = backup ? getFrequencyColor(backup.frequency) : '#94a3b8';
                        
                        return (
                            <div
                                key={index}
                                style={{
                                    minHeight: '100px',
                                    padding: '8px',
                                    borderRight: (index + 1) % 7 !== 0 ? '1px solid #f1f5f9' : 'none',
                                    borderBottom: index < 35 ? '1px solid #f1f5f9' : 'none',
                                    backgroundColor: isCurrentMonth ? (isToday ? '#f0fdf4' : 'white') : '#f8fafc',
                                    opacity: isCurrentMonth ? 1 : 0.5
                                }}
                            >
                                <div style={{ fontSize: '14px', fontWeight: isToday ? 600 : 400, color: isToday ? '#16a34a' : '#475569', marginBottom: '4px' }}>
                                    {date.getDate()}
                                </div>
                                {backup && isCurrentMonth && (
                                    <>
                                        <div style={{
                                            padding: '4px 6px',
                                            borderRadius: '4px',
                                            backgroundColor: freqColor + '15',
                                            border: `1px solid ${freqColor}30`,
                                            color: freqColor,
                                            fontSize: '11px',
                                            fontWeight: 600,
                                            marginBottom: '2px',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            cursor: backup.backup ? 'pointer' : 'default'
                                        }}
                                        onClick={() => backup.backup && viewBackup(backup.backup)}
                                        >
                                            <span>{getSlotLabel(backup.frequency, backup.slot)}</span>
                                            <span style={{ fontSize: '10px', opacity: 0.8 }}>{backup.time}</span>
                                        </div>
                                        <div style={{ fontSize: '10px', color: getStatusColor(backup.status, isPast), display: 'flex', alignItems: 'center', gap: '3px' }}>
                                            {getStatusIcon(backup.status)} {backup.status === 'completed' ? 'Listo' : backup.status === 'failed' ? 'Fallido' : ''}
                                        </div>
                                    </>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Panel dePróximos Backups */}
            <div style={{ marginTop: '24px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', padding: '20px' }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 600, color: '#1e293b' }}>
                    📅 Próximos Backups del Mes
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
                    {scheduledBackups
                        .filter(s => s.date >= today && s.date.getMonth() === currentDate.getMonth())
                        .sort((a, b) => a.date.getTime() - b.date.getTime())
                        .slice(0, 10)
                        .map((sb, i) => (
                            <div key={i} style={{ 
                                padding: '12px', 
                                borderRadius: '8px', 
                                backgroundColor: getFrequencyColor(sb.frequency) + '10',
                                border: `1px solid ${getFrequencyColor(sb.frequency)}30`,
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <div>
                                    <div style={{ fontSize: '13px', fontWeight: 600, color: getFrequencyColor(sb.frequency) }}>
                                        {getSlotLabel(sb.frequency, sb.slot)} - {getFrequencyLabel(sb.frequency)}
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                                        {sb.date.toLocaleDateString('es-PY', { weekday: 'short', day: 'numeric' })} a las {sb.time}
                                    </div>
                                </div>
                                {sb.backup && (
                                    <button 
                                        onClick={() => viewBackup(sb.backup!)}
                                        style={{
                                            padding: '4px 8px',
                                            fontSize: '11px',
                                            backgroundColor: getFrequencyColor(sb.frequency),
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Ver
                                    </button>
                                )}
                            </div>
                        ))}
                </div>
            </div>

            <div style={{ marginTop: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <div style={{ padding: '16px', backgroundColor: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                    <div style={{ fontSize: '12px', color: '#16a34a', fontWeight: 600, marginBottom: '4px' }}>Tipos de Backup</div>
                    <div style={{ fontSize: '11px', color: '#166534' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                            <span style={{ display: 'inline-block', width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#22c55e' }}></span>
                            <span>D1/D2/D3 - Diario (02:00)</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                            <span style={{ display: 'inline-block', width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#3b82f6' }}></span>
                            <span>S1/S2/S3/S4 - Semanal (sábados)</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ display: 'inline-block', width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#8b5cf6' }}></span>
                            <span>M1/M2/M3 - Mensual (1° del mes)</span>
                        </div>
                    </div>
                </div>
                <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '12px', color: '#475569', fontWeight: 600, marginBottom: '4px' }}>Estados</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>
                        <div>✓ Listo - Ejecutado correctamente</div>
                        <div>○ Pendiente - Sin ejecutar aún</div>
                        <div>✗ Fallido - No se ejecutó</div>
                    </div>
                </div>
            </div>

            <div style={{ marginTop: '32px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1e293b', marginBottom: '16px' }}>Ejecución Manual</h3>
                <p style={{ color: '#64748b', marginBottom: '16px' }}>
                    Además de los respaldos automáticos, podés ejecutar un backup manual en cualquier momento haciendo clic en "Crear Backup Ahora".
                </p>
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
                                {selectedBackup.frequency} - {selectedBackup.slot}
                            </h2>
                            <button onClick={() => setSelectedBackup(null)} style={{
                                background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer',
                            }}>✕</button>
                        </div>
                        <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
                            <p>Fecha: {new Date(selectedBackup.createdAt).toLocaleString('es-PY')}</p>
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
        </div>
    );
};

export default BackupList;