import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { confirmRegistration } from '../../services/api';
import { copy } from '../../copy';

const ConfirmRegistration: React.FC = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading');
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage(copy.confirmRegistration.errorMissingLink);
            return;
        }
        confirmRegistration(token)
            .then((res) => {
                setStatus('ok');
                setMessage(res.message || copy.confirmRegistration.successMessage);
            })
            .catch((err) => {
                setStatus('error');
                setMessage(err.message || copy.confirmRegistration.errorInvalid);
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
                <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#111827', marginBottom: '16px' }}>{copy.app.name}</h1>
                {status === 'loading' && <p style={{ color: '#6b7280' }}>{copy.confirmRegistration.confirming}</p>}
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
                            {copy.confirmRegistration.goLogin}
                        </Link>
                    </>
                )}
                {status === 'error' && (
                    <>
                        <p style={{ color: '#991b1b', marginBottom: '24px', lineHeight: 1.5 }}>{message}</p>
                        <Link to="/register" style={{ color: '#4f46e5', fontWeight: 500 }}>{copy.confirmRegistration.requestAgain}</Link>
                    </>
                )}
            </div>
        </div>
    );
};

export default ConfirmRegistration;
