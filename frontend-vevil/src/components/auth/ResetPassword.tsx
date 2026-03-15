import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { resetPassword } from '../../services/api';

const ResetPassword: React.FC = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token') || '';

    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (password !== confirm) {
            setError('Las contraseñas no coinciden.');
            return;
        }
        if (password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres.');
            return;
        }
        try {
            await resetPassword(token, password);
            setSuccess(true);
        } catch (err: any) {
            setError(err.message || 'Error al restablecer la contraseña. El enlace pudo haber expirado.');
        }
    };

    if (!token) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                backgroundColor: '#f3f4f6',
                padding: '16px'
            }}>
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                    padding: '40px',
                    width: '100%',
                    maxWidth: '400px'
                }}>
                    <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                        <h1 style={{ fontSize: '32px', fontWeight: 700, color: '#4f46e5', margin: 0 }}>Vevil</h1>
                        <p style={{ color: '#6b7280', marginTop: '8px' }}>Enlace inválido</p>
                    </div>
                    <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '24px' }}>
                        Este enlace no es válido o ya expiró. Solicitá uno nuevo para restablecer tu contraseña.
                    </p>
                    <Link
                        to="/forgot-password"
                        style={{
                            display: 'block',
                            textAlign: 'center',
                            padding: '14px',
                            fontSize: '16px',
                            fontWeight: 600,
                            color: 'white',
                            backgroundColor: '#4f46e5',
                            borderRadius: '8px',
                            textDecoration: 'none'
                        }}
                    >
                        Solicitar nuevo enlace
                    </Link>
                    <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: '#6b7280' }}>
                        <Link to="/login" style={{ color: '#4f46e5', textDecoration: 'none' }}>← Volver al login</Link>
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            backgroundColor: '#f3f4f6',
            padding: '16px'
        }}>
            <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                padding: '40px',
                width: '100%',
                maxWidth: '400px'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <h1 style={{ fontSize: '32px', fontWeight: 700, color: '#4f46e5', margin: 0 }}>Vevil</h1>
                    <p style={{ color: '#6b7280', marginTop: '8px' }}>Nueva contraseña</p>
                </div>

                {!success ? (
                    <>
                        <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '20px' }}>
                            Ingresá tu nueva contraseña (mínimo 6 caracteres).
                        </p>
                        <form onSubmit={handleSubmit}>
                            {error && (
                                <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#fef2f2', color: '#b91c1c', borderRadius: '8px', fontSize: '14px' }}>
                                    {error}
                                </div>
                            )}
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                                    Nueva contraseña
                                </label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={6}
                                    autoComplete="new-password"
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px',
                                        fontSize: '16px',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '8px',
                                        outline: 'none',
                                        boxSizing: 'border-box'
                                    }}
                                    placeholder="••••••••"
                                />
                            </div>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                                    Confirmar contraseña
                                </label>
                                <input
                                    type="password"
                                    value={confirm}
                                    onChange={(e) => setConfirm(e.target.value)}
                                    required
                                    minLength={6}
                                    autoComplete="new-password"
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px',
                                        fontSize: '16px',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '8px',
                                        outline: 'none',
                                        boxSizing: 'border-box'
                                    }}
                                    placeholder="••••••••"
                                />
                            </div>
                            <button
                                type="submit"
                                style={{
                                    width: '100%',
                                    padding: '14px',
                                    fontSize: '16px',
                                    fontWeight: 600,
                                    color: 'white',
                                    backgroundColor: '#4f46e5',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer'
                                }}
                            >
                                Restablecer contraseña
                            </button>
                        </form>
                    </>
                ) : (
                    <div style={{ textAlign: 'center' }}>
                        <p style={{ color: '#059669', fontSize: '15px', marginBottom: '24px' }}>
                            Tu contraseña fue actualizada. Ya podés iniciar sesión.
                        </p>
                        <Link
                            to="/login"
                            style={{
                                display: 'inline-block',
                                padding: '14px 24px',
                                fontSize: '16px',
                                fontWeight: 600,
                                color: 'white',
                                backgroundColor: '#4f46e5',
                                borderRadius: '8px',
                                textDecoration: 'none'
                            }}
                        >
                            Ir al inicio de sesión
                        </Link>
                    </div>
                )}

                <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: '#6b7280' }}>
                    <Link to="/login" style={{ color: '#4f46e5', textDecoration: 'none' }}>← Volver al login</Link>
                </p>
            </div>
        </div>
    );
};

export default ResetPassword;
