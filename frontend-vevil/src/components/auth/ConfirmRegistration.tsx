import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { confirmRegistration } from '../../services/api';

const ConfirmRegistration: React.FC = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading');
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('Falta el enlace de confirmación.');
            return;
        }
        confirmRegistration(token)
            .then((res) => {
                setStatus('ok');
                setMessage(res.message || 'Tu correo fue confirmado. Un administrador revisará tu solicitud y te enviará un correo para crear tu contraseña.');
            })
            .catch((err) => {
                setStatus('error');
                setMessage(err.message || 'El enlace no es válido o expiró.');
            });
    }, [token]);

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
                maxWidth: '440px',
                textAlign: 'center'
            }}>
                <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#111827', marginBottom: '16px' }}>Vevil</h1>
                {status === 'loading' && <p style={{ color: '#6b7280' }}>Confirmando...</p>}
                {status === 'ok' && (
                    <>
                        <p style={{ color: '#065f46', marginBottom: '24px', lineHeight: 1.5 }}>{message}</p>
                        <Link
                            to="/login"
                            style={{
                                display: 'inline-block',
                                padding: '12px 24px',
                                backgroundColor: '#4f46e5',
                                color: 'white',
                                textDecoration: 'none',
                                borderRadius: '8px',
                                fontWeight: 600
                            }}
                        >
                            Ir a iniciar sesión
                        </Link>
                    </>
                )}
                {status === 'error' && (
                    <>
                        <p style={{ color: '#991b1b', marginBottom: '24px', lineHeight: 1.5 }}>{message}</p>
                        <Link to="/register" style={{ color: '#4f46e5', fontWeight: 500 }}>Solicitar registro de nuevo</Link>
                    </>
                )}
            </div>
        </div>
    );
};

export default ConfirmRegistration;
