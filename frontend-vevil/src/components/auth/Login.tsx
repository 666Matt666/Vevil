import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { startAuthentication, browserSupportsWebAuthn } from '@simplewebauthn/browser';
import { login, getProfile, type LoginResponse, wakeBackend, wakeBackendAndWait, webauthnLoginOptions, webauthnLoginVerify } from '../../services/api';
import { copy } from '../../copy';

const LOGIN_EMAIL_KEY = 'vevil_login_email';

const Login: React.FC = () => {
    const [email, setEmail] = useState(() => {
        try {
            return localStorage.getItem(LOGIN_EMAIL_KEY) ?? '';
        } catch {
            return '';
        }
    });
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isWakingUp, setIsWakingUp] = useState(false);
    const [supportsWebAuthn, setSupportsWebAuthn] = useState(false);
    const [isWebAuthnLoading, setIsWebAuthnLoading] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();
    const [showSessionExpired, setShowSessionExpired] = useState(() => searchParams.get('expired') === '1');
    const navigate = useNavigate();

    useEffect(() => {
        // Verificar si hay sesión activa usando el perfil guardado o intentando obtenerlo
        // Con HttpOnly cookies, el navegador maneja la sesión automáticamente
        const profile = localStorage.getItem('vevil_profile');
        if (profile) {
            // Hay un perfil guardado, intentamos obtener el perfil del servidor para verificar la sesión
            getProfile()
                .then(() => navigate('/dashboard'))
                .catch(() => { /* session expired, stay on login */ });
        }
    }, [navigate]);

    useEffect(() => {
        if (showSessionExpired && searchParams.get('expired') === '1') {
            setSearchParams({}, { replace: true });
        }
    }, [showSessionExpired, searchParams, setSearchParams]);

    useEffect(() => {
        setSupportsWebAuthn(typeof window !== 'undefined' && browserSupportsWebAuthn());
    }, []);

    // Despertar el backend en producción (Render free tier) al cargar la página
    useEffect(() => {
        if (window.location.hostname.includes('vercel.app')) wakeBackend();
    }, []);

    const doLogin = async () => {
        setError('');
        setIsLoading(true);
        try {
            // El login ahora usa HttpOnly cookies - no necesitamos guardar tokens en localStorage
            await login(email, password);
            try {
                localStorage.setItem(LOGIN_EMAIL_KEY, email.trim());
            } catch (_) {}
            // Obtener el perfil después del login exitoso
            const user = await getProfile();
            const profile = { ...user, role: user.role ?? (user.email?.toLowerCase() === 'admin@vevil.com' ? 'admin' : undefined) };
            localStorage.setItem('vevil_profile', JSON.stringify(profile));
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.message || 'Error al iniciar sesión');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        doLogin();
    };

    const isConnectionError = Boolean(error && (error.includes('conectar') || error.includes('servidor') || error.includes('Render')));

    const handleRetry = async () => {
        if (!isConnectionError || !window.location.hostname.includes('vercel.app')) {
            doLogin();
            return;
        }
        setError('');
        setIsWakingUp(true);
        await wakeBackendAndWait(65000);
        setIsWakingUp(false);
        doLogin();
    };

    const handleWebAuthnLogin = async () => {
        if (!email.trim()) {
            setError(copy.webauthn.noFingerprintForEmail);
            return;
        }
        setError('');
        setIsWebAuthnLoading(true);
        try {
            const options = await webauthnLoginOptions(email.trim());
            const credential = await startAuthentication({ optionsJSON: options });
            // WebAuthn también usa HttpOnly cookies ahora
            await webauthnLoginVerify(
                credential as unknown as Record<string, unknown>,
                options.challenge
            );
            try {
                localStorage.setItem(LOGIN_EMAIL_KEY, email.trim());
            } catch (_) {}
            // Obtener el perfil después del login exitoso
            const user = await getProfile();
            const profile = { ...user, role: user.role ?? (user.email?.toLowerCase() === 'admin@vevil.com' ? 'admin' : undefined) };
            localStorage.setItem('vevil_profile', JSON.stringify(profile));
            navigate('/dashboard');
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : copy.errors.generic;
            const isNoCredential =
                msg.includes('huella registrada') ||
                msg.includes('Usuario no encontrado') ||
                msg.includes('no encontrado');
            setError(isNoCredential ? `${msg} ${copy.webauthn.noFingerprintHint}` : msg);
        } finally {
            setIsWebAuthnLoading(false);
        }
    };

    return (
        <>
            <style>{`
                .vevil-login-input:focus {
                    outline: none;
                    border-color: #6366f1;
                    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
                }
                .vevil-login-btn:hover:not(:disabled) {
                    background: linear-gradient(135deg, #4f46e5 0%, #4338ca 100%);
                    transform: translateY(-1px);
                    box-shadow: 0 8px 20px rgba(79, 70, 229, 0.35);
                }
                .vevil-login-btn:active:not(:disabled) { transform: translateY(0); }
            `}</style>
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'row',
                flexWrap: 'wrap'
            }}>
                {/* Panel izquierdo: branding (visible en pantallas grandes) */}
                <div style={{
                    flex: '1 1 320px',
                    minHeight: '280px',
                    background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '48px 32px',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'radial-gradient(circle at 20% 80%, rgba(99, 102, 241, 0.2) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.15) 0%, transparent 50%)',
                        pointerEvents: 'none'
                    }} />
                    <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
                        <div style={{
                            width: '64px',
                            height: '64px',
                            borderRadius: '16px',
                            background: 'rgba(255,255,255,0.15)',
                            backdropFilter: 'blur(8px)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 20px',
                            fontSize: '28px'
                        }}>
                            V
                        </div>
                        <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#fff', margin: 0, letterSpacing: '-0.02em' }}>
                            Vevil
                        </h1>
                        <p style={{ color: 'rgba(255,255,255,0.75)', marginTop: '8px', fontSize: '15px' }}>
                            Sistema de Gestión
                        </p>
                    </div>
                </div>

                {/* Panel derecho: formulario */}
                <div style={{
                    flex: '1 1 400px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '32px 24px',
                    background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)'
                }}>
                    <div style={{
                        width: '100%',
                        maxWidth: '400px',
                        background: '#fff',
                        borderRadius: '20px',
                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.07), 0 10px 30px -10px rgba(0,0,0,0.12)',
                        padding: '40px 36px',
                        border: '1px solid rgba(0,0,0,0.04)'
                    }}>
                        <form onSubmit={handleSubmit} style={{ marginTop: '8px' }}>
                            <div style={{ marginBottom: '18px' }}>
                                <label htmlFor="login-email" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>
                                    Email
                                </label>
                                <input
                                    id="login-email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="vevil-login-input"
                                    style={{
                                        width: '100%',
                                        padding: '12px 14px',
                                        fontSize: '15px',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '12px',
                                        boxSizing: 'border-box',
                                        transition: 'border-color 0.2s, box-shadow 0.2s',
                                        backgroundColor: '#fafafa'
                                    }}
                                    placeholder="tu@email.com"
                                />
                                <Link
                                    to="/forgot-password"
                                    style={{
                                        display: 'inline-block',
                                        marginTop: '8px',
                                        fontSize: '13px',
                                        color: '#6366f1',
                                        textDecoration: 'none',
                                        fontWeight: 500
                                    }}
                                >
                                    ¿Olvidaste tu contraseña?
                                </Link>
                            </div>

                            <div style={{ marginBottom: '24px' }}>
                                <label htmlFor="login-password" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>
                                    Contraseña
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        id="login-password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="vevil-login-input"
                                        style={{
                                            width: '100%',
                                            padding: '12px 44px 12px 14px',
                                            fontSize: '15px',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '12px',
                                            outline: 'none',
                                            boxSizing: 'border-box',
                                            transition: 'border-color 0.2s, box-shadow 0.2s',
                                            backgroundColor: '#fafafa'
                                        }}
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                                        style={{
                                            position: 'absolute',
                                            right: '12px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            background: 'none',
                                            border: 'none',
                                            padding: '4px',
                                            cursor: 'pointer',
                                            color: '#64748b',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            borderRadius: '6px'
                                        }}
                                    >
                                        {showPassword ? (
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                                <line x1="1" y1="1" x2="23" y2="23" />
                                            </svg>
                                        ) : (
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                                <circle cx="12" cy="12" r="3" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {showSessionExpired && (
                                <div style={{
                                    backgroundColor: '#eff6ff',
                                    color: '#1e40af',
                                    padding: '12px 14px',
                                    borderRadius: '12px',
                                    marginBottom: '20px',
                                    fontSize: '14px',
                                    border: '1px solid #bfdbfe'
                                }}>
                                    Sesión expirada. Volvé a iniciar sesión.
                                </div>
                            )}
                            {error && (
                                <div style={{
                                    backgroundColor: '#fef2f2',
                                    color: '#b91c1c',
                                    padding: '12px 14px',
                                    borderRadius: '12px',
                                    marginBottom: '20px',
                                    fontSize: '14px',
                                    border: '1px solid #fecaca'
                                }}>
                                    <div style={{ marginBottom: isConnectionError ? '10px' : 0 }}>{error}</div>
                                    {isConnectionError && (
                                        <button
                                            type="button"
                                            onClick={handleRetry}
                                            disabled={isLoading || isWakingUp}
                                            style={{
                                                padding: '8px 14px',
                                                fontSize: '13px',
                                                fontWeight: 600,
                                                color: '#b91c1c',
                                                background: '#fff',
                                                border: '1px solid #fecaca',
                                                borderRadius: '8px',
                                                cursor: isLoading ? 'not-allowed' : 'pointer'
                                            }}
                                        >
                                            {isWakingUp ? 'Despertando servidor... (hasta ~1 min)' : 'Reintentar'}
                                        </button>
                                    )}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isLoading || isWebAuthnLoading}
                                className="vevil-login-btn"
                                style={{
                                    width: '100%',
                                    padding: '14px',
                                    fontSize: '15px',
                                    fontWeight: 600,
                                    color: '#fff',
                                    background: isLoading ? '#94a3b8' : 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                                    border: 'none',
                                    borderRadius: '12px',
                                    cursor: isLoading ? 'not-allowed' : 'pointer',
                                    transition: 'transform 0.2s, box-shadow 0.2s'
                                }}
                            >
                                {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
                            </button>
                            {supportsWebAuthn && email.trim() && (
                                <button
                                    type="button"
                                    disabled={isLoading || isWebAuthnLoading}
                                    onClick={handleWebAuthnLogin}
                                    style={{
                                        width: '100%',
                                        marginTop: '12px',
                                        padding: '12px',
                                        fontSize: '14px',
                                        fontWeight: 600,
                                        color: '#4f46e5',
                                        background: 'transparent',
                                        border: '1px solid #c7d2fe',
                                        borderRadius: '12px',
                                        cursor: isLoading || isWebAuthnLoading ? 'not-allowed' : 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px'
                                    }}
                                >
                                    {isWebAuthnLoading ? copy.webauthn.addingFingerprint : copy.webauthn.loginWithFingerprint}
                                </button>
                            )}
                            {typeof window !== 'undefined' && window.location.hostname.includes('vercel.app') && (
                                <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '10px', textAlign: 'center' }}>
                                    La primera vez puede tardar unos segundos.
                                </p>
                            )}
                        </form>

                        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: '#64748b' }}>
                            ¿No tenés cuenta?{' '}
                            <Link to="/register" style={{ color: '#6366f1', textDecoration: 'none', fontWeight: 600 }}>
                                Registrate
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Login;
