import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile } from '../../services/api';
import {
    pendingRegistrationsApi,
    type PendingRegistrationItem,
} from '../../services/api';

const PendingRegistrations: React.FC = () => {
    const navigate = useNavigate();
    const [list, setList] = useState<PendingRegistrationItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [actioning, setActioning] = useState<string | null>(null);
    const [approveRole, setApproveRole] = useState<Record<string, 'admin' | 'user'>>({});

    useEffect(() => {
        getProfile()
            .then((user: any) => {
                if (user?.role !== 'admin') {
                    navigate('/dashboard', { replace: true });
                    return;
                }
                return pendingRegistrationsApi.getList();
            })
            .then((data) => {
                if (Array.isArray(data)) setList(data);
            })
            .catch((err) => setError(err.message || 'Error al cargar'))
            .finally(() => setLoading(false));
    }, [navigate]);

    const handleApprove = async (id: string) => {
        const role = approveRole[id] || 'user';
        setActioning(id);
        setError('');
        try {
            await pendingRegistrationsApi.approve(id, role);
            setList((prev) => prev.filter((r) => r.id !== id));
        } catch (err: any) {
            setError(err.message || 'Error al aprobar');
        } finally {
            setActioning(null);
        }
    };

    const handleReject = async (id: string) => {
        if (!window.confirm('¿Rechazar esta solicitud?')) return;
        setActioning(id);
        setError('');
        try {
            await pendingRegistrationsApi.reject(id);
            setList((prev) => prev.filter((r) => r.id !== id));
        } catch (err: any) {
            setError(err.message || 'Error al rechazar');
        } finally {
            setActioning(null);
        }
    };

    if (loading) {
        return (
            <div className="responsive-padding" style={{ padding: '32px' }}>
                <p>Cargando solicitudes...</p>
            </div>
        );
    }

    return (
        <div className="responsive-padding" style={{ padding: '32px' }}>
            <h1 style={{ fontSize: 'clamp(24px, 5vw, 32px)', fontWeight: 700, color: '#1e293b', marginBottom: '24px' }}>
                Solicitudes de registro
            </h1>
            <p style={{ color: '#64748b', marginBottom: '24px' }}>
                Revisá los datos, asigná un perfil y aprobá para que el usuario reciba un correo para crear su contraseña.
            </p>

            {error && (
                <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px' }}>
                    {error}
                </div>
            )}

            {list.length === 0 ? (
                <div style={{ padding: '32px', textAlign: 'center', color: '#64748b', backgroundColor: '#f8fafc', borderRadius: '12px' }}>
                    No hay solicitudes pendientes de aprobación.
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {list.map((item) => (
                        <div
                            key={item.id}
                            style={{
                                border: '1px solid #e2e8f0',
                                borderRadius: '12px',
                                padding: '20px',
                                backgroundColor: 'white',
                                display: 'flex',
                                flexWrap: 'wrap',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: '16px',
                            }}
                        >
                            <div>
                                <div style={{ fontWeight: 600, fontSize: '18px', color: '#1e293b' }}>
                                    {[item.name, item.lastName].filter(Boolean).join(' ')}
                                </div>
                                <div style={{ color: '#64748b', marginTop: '4px' }}>{item.email}</div>
                                {item.gender && (
                                    <div style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>
                                        Género: {item.gender === 'female' ? 'Femenino' : 'Masculino'}
                                    </div>
                                )}
                                <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '8px' }}>
                                    Confirmado el correo · {new Date(item.createdAt).toLocaleString()}
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                                    Perfil:
                                    <select
                                        value={approveRole[item.id] ?? 'user'}
                                        onChange={(e) =>
                                            setApproveRole((prev) => ({
                                                ...prev,
                                                [item.id]: e.target.value as 'admin' | 'user',
                                            }))
                                        }
                                        style={{
                                            padding: '8px 12px',
                                            borderRadius: '8px',
                                            border: '1px solid #e2e8f0',
                                            fontSize: '14px',
                                        }}
                                    >
                                        <option value="user">Usuario</option>
                                        <option value="admin">Administrador</option>
                                    </select>
                                </label>
                                <button
                                    type="button"
                                    onClick={() => handleApprove(item.id)}
                                    disabled={actioning === item.id}
                                    style={{
                                        padding: '10px 20px',
                                        backgroundColor: actioning === item.id ? '#9ca3af' : '#22c55e',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontWeight: 600,
                                        cursor: actioning === item.id ? 'not-allowed' : 'pointer',
                                    }}
                                >
                                    {actioning === item.id ? '...' : 'Aprobar'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleReject(item.id)}
                                    disabled={actioning === item.id}
                                    style={{
                                        padding: '10px 20px',
                                        backgroundColor: 'transparent',
                                        color: '#dc2626',
                                        border: '1px solid #dc2626',
                                        borderRadius: '8px',
                                        fontWeight: 600,
                                        cursor: actioning === item.id ? 'not-allowed' : 'pointer',
                                    }}
                                >
                                    Rechazar
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PendingRegistrations;
