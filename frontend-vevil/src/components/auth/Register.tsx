import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { requestRegistration } from '../../services/api';

const Register: React.FC = () => {
    const [name, setName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [gender, setGender] = useState<'male' | 'female' | ''>('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) navigate('/dashboard');
    }, [navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!email.trim()) {
            setError('El correo es obligatorio');
            return;
        }
        if (!name.trim()) {
            setError('El nombre es obligatorio');
            return;
        }

        setIsLoading(true);
        try {
            const res = await requestRegistration({
                email: email.trim(),
                name: name.trim(),
                lastName: lastName.trim() || undefined,
                gender: gender === '' ? undefined : gender,
            });
            setSuccess(res.message || 'Revisá tu correo y hacé clic en el enlace para confirmar. Luego un administrador revisará tu solicitud.');
        } catch (err: any) {
            setError(err.message || 'Error al enviar la solicitud');
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
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <h1 style={{ fontSize: '32px', fontWeight: 700, color: '#4f46e5', margin: 0 }}>Vevil</h1>
                    <p style={{ color: '#6b7280', marginTop: '8px' }}>Sistema de Gestión</p>
                </div>

                <h2 style={{ textAlign: 'center', fontSize: '24px', fontWeight: 600, color: '#111827', marginBottom: '24px' }}>
                    Solicitar registro
                </h2>
                <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '24px', textAlign: 'center' }}>
                    Ingresá tu correo y datos. Te enviaremos un enlace para confirmar. Después un administrador aprobará tu cuenta y te enviará un correo para crear tu contraseña.
                </p>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>Nombre *</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            style={{ width: '100%', padding: '12px 16px', fontSize: '16px', border: '1px solid #d1d5db', borderRadius: '8px', outline: 'none', boxSizing: 'border-box' }}
                            placeholder="Ej. María"
                        />
                    </div>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>Apellido</label>
                        <input
                            type="text"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            style={{ width: '100%', padding: '12px 16px', fontSize: '16px', border: '1px solid #d1d5db', borderRadius: '8px', outline: 'none', boxSizing: 'border-box' }}
                            placeholder="Ej. García"
                        />
                    </div>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>Correo electrónico *</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={{ width: '100%', padding: '12px 16px', fontSize: '16px', border: '1px solid #d1d5db', borderRadius: '8px', outline: 'none', boxSizing: 'border-box' }}
                            placeholder="tu@email.com"
                        />
                    </div>
                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>Género</label>
                        <select
                            value={gender}
                            onChange={(e) => setGender(e.target.value as 'male' | 'female' | '')}
                            style={{ width: '100%', padding: '12px 16px', fontSize: '16px', border: '1px solid #d1d5db', borderRadius: '8px', outline: 'none', boxSizing: 'border-box', background: 'white' }}
                        >
                            <option value="">No especificar</option>
                            <option value="female">Femenino</option>
                            <option value="male">Masculino</option>
                        </select>
                    </div>

                    {error && (
                        <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px' }}>
                            {error}
                        </div>
                    )}
                    {success && (
                        <div style={{ backgroundColor: '#d1fae5', color: '#065f46', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px' }}>
                            {success}
                        </div>
                    )}

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
                        {isLoading ? 'Enviando...' : 'Enviar solicitud'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: '#6b7280' }}>
                    ¿Ya tenés una cuenta?{' '}
                    <Link to="/login" style={{ color: '#4f46e5', textDecoration: 'none', fontWeight: 500 }}>Iniciá sesión</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
