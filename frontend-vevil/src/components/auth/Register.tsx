import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { requestRegistration, getProfile } from '../../services/api';
import { copy } from '../../copy';

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
        // Verificar si hay sesión activa usando el perfil guardado
        const profile = localStorage.getItem('vevil_profile');
        if (profile) {
            getProfile()
                .then(() => navigate('/dashboard'))
                .catch(() => { /* stay on register */ });
        }
    }, [navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!email.trim()) {
            setError(copy.register.requiredEmail);
            return;
        }
        if (!name.trim()) {
            setError(copy.register.requiredName);
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
            setSuccess(res.message || copy.register.successMessage);
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
                    <h1 style={{ fontSize: '32px', fontWeight: 700, color: '#4f46e5', margin: 0 }}>{copy.app.name}</h1>
                    <p style={{ color: '#6b7280', marginTop: '8px' }}>{copy.app.subtitle}</p>
                </div>

                <h2 style={{ textAlign: 'center', fontSize: '24px', fontWeight: 600, color: '#111827', marginBottom: '24px' }}>
                    {copy.register.title}
                </h2>
                <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '24px', textAlign: 'center' }}>
                    {copy.register.intro}
                </p>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '20px' }}>
                        <label htmlFor="register-name" style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>{copy.register.name} *</label>
                        <input
                            id="register-name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            style={{ width: '100%', padding: '12px 16px', fontSize: '16px', border: '1px solid #d1d5db', borderRadius: '8px', outline: 'none', boxSizing: 'border-box' }}
                            placeholder="Ej. María"
                        />
                    </div>
                    <div style={{ marginBottom: '20px' }}>
                        <label htmlFor="register-lastName" style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>{copy.register.lastName}</label>
                        <input
                            id="register-lastName"
                            type="text"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            style={{ width: '100%', padding: '12px 16px', fontSize: '16px', border: '1px solid #d1d5db', borderRadius: '8px', outline: 'none', boxSizing: 'border-box' }}
                            placeholder="Ej. García"
                        />
                    </div>
                    <div style={{ marginBottom: '20px' }}>
                        <label htmlFor="register-email" style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>{copy.auth.email} *</label>
                        <input
                            id="register-email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={{ width: '100%', padding: '12px 16px', fontSize: '16px', border: '1px solid #d1d5db', borderRadius: '8px', outline: 'none', boxSizing: 'border-box' }}
                            placeholder="tu@email.com"
                        />
                    </div>
                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>{copy.register.gender}</label>
                        <select
                            value={gender}
                            onChange={(e) => setGender(e.target.value as 'male' | 'female' | '')}
                            style={{ width: '100%', padding: '12px 16px', fontSize: '16px', border: '1px solid #d1d5db', borderRadius: '8px', outline: 'none', boxSizing: 'border-box', background: 'white' }}
                        >
                            <option value="">{copy.register.genderPlaceholder}</option>
                            <option value="female">{copy.register.genderFemale}</option>
                            <option value="male">{copy.register.genderMale}</option>
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
                        {isLoading ? copy.register.sending : copy.register.submit}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: '#6b7280' }}>
                    {copy.register.haveAccount}{' '}
                    <Link to="/login" style={{ color: '#4f46e5', textDecoration: 'none', fontWeight: 500 }}>{copy.register.goLogin}</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
