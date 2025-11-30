import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Obtener la URL del backend dinámicamente
const getApiUrl = () => {
    // Si estamos en localhost, usar localhost
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return 'http://localhost:3000';
    }
    // Si estamos accediendo por IP (desde celular), usar la misma IP con puerto 3000
    return `http://${window.location.hostname}:3000`;
};

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    
    // Si ya está autenticado, redirigir al dashboard
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            navigate('/dashboard');
        }
    }, [navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const apiUrl = getApiUrl();
            const response = await fetch(`${apiUrl}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                throw new Error('Credenciales inválidas');
            }

            const data = await response.json();
            localStorage.setItem('token', data.access_token);
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.message || 'Error al iniciar sesión');
        } finally {
            setIsLoading(false);
        }
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
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <h1 style={{ 
                        fontSize: '32px', 
                        fontWeight: 700, 
                        color: '#4f46e5',
                        margin: 0
                    }}>
                        Vevil
                    </h1>
                    <p style={{ color: '#6b7280', marginTop: '8px' }}>Sistema de Gestión</p>
                </div>

                {/* Título */}
                <h2 style={{ 
                    textAlign: 'center', 
                    fontSize: '24px', 
                    fontWeight: 600, 
                    color: '#111827',
                    marginBottom: '24px'
                }}>
                    Bienvenido
                </h2>

                {/* Formulario */}
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ 
                            display: 'block', 
                            fontSize: '14px', 
                            fontWeight: 500, 
                            color: '#374151',
                            marginBottom: '6px'
                        }}>
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

                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ 
                            display: 'block', 
                            fontSize: '14px', 
                            fontWeight: 500, 
                            color: '#374151',
                            marginBottom: '6px'
                        }}>
                            Contraseña
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
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
                            placeholder="••••••••"
                        />
                    </div>

                    {/* Error */}
                    {error && (
                        <div style={{
                            backgroundColor: '#fee2e2',
                            color: '#991b1b',
                            padding: '12px 16px',
                            borderRadius: '8px',
                            marginBottom: '20px',
                            fontSize: '14px'
                        }}>
                            {error}
                        </div>
                    )}

                    {/* Botón */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        style={{
                            width: '100%',
                            padding: '14px',
                            fontSize: '16px',
                            fontWeight: 600,
                            color: 'white',
                            backgroundColor: isLoading ? '#9ca3af' : '#4f46e5',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: isLoading ? 'not-allowed' : 'pointer',
                            transition: 'background-color 0.2s'
                        }}
                    >
                        {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                    </button>
                </form>

                {/* Link a registro */}
                <p style={{ 
                    textAlign: 'center', 
                    marginTop: '24px', 
                    fontSize: '14px',
                    color: '#6b7280'
                }}>
                    ¿No tienes una cuenta?{' '}
                    <a href="/register" style={{ 
                        color: '#4f46e5', 
                        textDecoration: 'none',
                        fontWeight: 500
                    }}>
                        Regístrate aquí
                    </a>
                </p>
            </div>
        </div>
    );
};

export default Login;

