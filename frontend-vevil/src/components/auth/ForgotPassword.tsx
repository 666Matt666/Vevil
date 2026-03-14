import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const ForgotPassword: React.FC = () => {
    const [email, setEmail] = useState('');
    const [sent, setSent] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Por ahora solo mostramos mensaje; cuando el backend tenga endpoint de reset se puede llamar aquí
        setSent(true);
    };

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
                    <p style={{ color: '#6b7280', marginTop: '8px' }}>Recuperar contraseña</p>
                </div>

                {!sent ? (
                    <>
                        <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '20px' }}>
                            Ingresá tu email y te enviaremos un enlace para restablecer tu contraseña.
                        </p>
                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px',
                                        fontSize: '16px',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '8px',
                                        outline: 'none',
                                        boxSizing: 'border-box'
                                    }}
                                    placeholder="tu@email.com"
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
                                Enviar enlace
                            </button>
                        </form>
                    </>
                ) : (
                    <div style={{ textAlign: 'center' }}>
                        <p style={{ color: '#059669', fontSize: '15px', marginBottom: '16px' }}>
                            Si existe una cuenta con ese email, recibirás instrucciones para restablecer tu contraseña.
                        </p>
                        <p style={{ color: '#6b7280', fontSize: '13px', marginBottom: '24px' }}>
                            Revisá tu bandeja de entrada y la carpeta de spam.
                        </p>
                        <Link
                            to="/login"
                            style={{
                                display: 'inline-block',
                                color: '#4f46e5',
                                textDecoration: 'none',
                                fontWeight: 500
                            }}
                        >
                            Volver al inicio de sesión
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

export default ForgotPassword;
