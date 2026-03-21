import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile, pendingRegistrationsApi, type PendingRegistrationItem, getErrorMessage } from '../../services/api';
import { copy } from '../../copy';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { ErrorMessage } from '../ui/ErrorMessage';
import { SuccessMessage } from '../ui/SuccessMessage';

const PendingRegistrations: React.FC = () => {
    const navigate = useNavigate();
    const [list, setList] = useState<PendingRegistrationItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [actioning, setActioning] = useState<string | null>(null);
    const [approveRole, setApproveRole] = useState<Record<string, 'admin' | 'user'>>({});

    const loadList = () => {
        setLoading(true);
        setError('');
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
            .catch((err) => setError(getErrorMessage(err, 'Error al cargar')))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        loadList();
    }, [navigate]);

    const handleApprove = async (id: string) => {
        const role = approveRole[id] || 'user';
        setActioning(id);
        setError('');
        try {
            await pendingRegistrationsApi.approve(id, role);
            setSuccessMessage('Solicitud aprobada');
            setList((prev) => prev.filter((r) => r.id !== id));
        } catch (err) {
            setError(getErrorMessage(err, 'Error al aprobar'));
        } finally {
            setActioning(null);
        }
    };

    const handleReject = async (id: string) => {
        if (!window.confirm(copy.pendingRegistrations.rejectConfirm)) return;
        setActioning(id);
        setError('');
        try {
            await pendingRegistrationsApi.reject(id);
            setSuccessMessage('Solicitud rechazada');
            setList((prev) => prev.filter((r) => r.id !== id));
        } catch (err) {
            setError(getErrorMessage(err, 'Error al rechazar'));
        } finally {
            setActioning(null);
        }
    };

    if (loading) {
        return (
            <div className="responsive-padding" style={{ padding: '32px' }}>
                <LoadingSpinner message={copy.pendingRegistrations.loading} color="#4f46e5" minHeight={280} />
            </div>
        );
    }

    return (
        <div className="responsive-padding" style={{ padding: '32px' }}>
            <h1 style={{ fontSize: 'clamp(24px, 5vw, 32px)', fontWeight: 700, color: '#1e293b', marginBottom: '24px' }}>
                {copy.pendingRegistrations.title}
            </h1>
            <p style={{ color: '#64748b', marginBottom: '24px' }}>
                {copy.pendingRegistrations.intro}
            </p>

            {successMessage && (
                <SuccessMessage
                    message={successMessage}
                    onDismiss={() => setSuccessMessage(null)}
                    autoDismissMs={4000}
                />
            )}
            {error && (
                <ErrorMessage
                    message={error}
                    onRetry={loadList}
                    onDismiss={() => setError('')}
                />
            )}

            {list.length === 0 ? (
                <div style={{ padding: '32px', textAlign: 'center', color: '#64748b', backgroundColor: '#f8fafc', borderRadius: '12px' }}>
                    {copy.pendingRegistrations.empty}
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
                                        {copy.register.gender}: {item.gender === 'female' ? copy.pendingRegistrations.genderFemale : copy.pendingRegistrations.genderMale}
                                    </div>
                                )}
                                <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '8px' }}>
                                    {copy.pendingRegistrations.confirmedAt} · {new Date(item.createdAt).toLocaleString()}
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                                    {copy.pendingRegistrations.profile}:
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
                                        <option value="user">{copy.pendingRegistrations.profileRoleUser}</option>
                                        <option value="admin">{copy.pendingRegistrations.profileRoleAdmin}</option>
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
                                    {actioning === item.id ? '...' : copy.pendingRegistrations.approve}
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
                                    {copy.pendingRegistrations.reject}
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
