const RENDER_API_URL = 'https://evil-backend.onrender.com/api';

const getApiBaseUrl = (): string => {
    // En producción (Vercel) SIEMPRE usar Render; ignorar VITE_API_URL por si quedó apuntando a Fly.io
    if (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')) {
        return RENDER_API_URL;
    }
    const viteApiUrl = import.meta.env.VITE_API_URL;
    if (viteApiUrl && viteApiUrl !== 'undefined' && String(viteApiUrl).trim() !== '' && !String(viteApiUrl).includes('fly.dev')) {
        return String(viteApiUrl).trim();
    }
    if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
        // Usar proxy de Vite para mismo origen (facilita cookies)
        return '/api';
    }
    if (typeof window !== 'undefined') return `http://${window.location.hostname}:3000/api`;
    return RENDER_API_URL;
};

let API_BASE_URL = getApiBaseUrl();
export { getApiBaseUrl };

// Red de seguridad: si por caché o build viejo quedó Fly.io, usar Render cuando estamos en Vercel
if (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app') && API_BASE_URL.includes('fly.dev')) {
    API_BASE_URL = RENDER_API_URL;
    console.warn('[Vevil] URL era Fly.io, usando Render:', RENDER_API_URL);
}

console.log('[Vevil] API base URL:', API_BASE_URL, '| hostname:', typeof window !== 'undefined' ? window.location.hostname : 'N/A');

/** Llama al backend en frío para que Render lo despierte (sin esperar resultado). */
export function wakeBackend(): void {
    try {
        fetch(API_BASE_URL, { method: 'GET', signal: AbortSignal.timeout(12000) }).catch(() => { });
    } catch (_) { }
}

/** Espera a que el backend responda (para “despertarlo” antes de login). Resuelve cuando responde o tras timeoutMs. */
export function wakeBackendAndWait(timeoutMs: number = 65000): Promise<void> {
    return new Promise((resolve) => {
        const t = setTimeout(resolve, timeoutMs);
        fetch(API_BASE_URL, { method: 'GET', signal: AbortSignal.timeout(timeoutMs) })
            .catch(() => { })
            .finally(() => {
                clearTimeout(t);
                resolve();
            });
    });
}

// =====================================================
// SEGURIDAD: Tokens se manejan en memoria (no localStorage)
// El access token se envía en el Authorization header
// El refresh token se usa para revalidar la sesión
// =====================================================

// Almacenar tokens en localStorage para que persistan entre recargas de página
// Esto es menos seguro que memoria pero funciona entre dominios diferentes
const getStoredToken = (key: string): string | null => {
    try {
        return localStorage.getItem(key);
    } catch {
        return null;
    }
};

const setStoredToken = (key: string, value: string): void => {
    console.log('[Vevil] setStoredToken: Attempting to save key:', key);
    try {
        localStorage.setItem(key, value);
        console.log('[Vevil] setStoredToken: SUCCESS, key saved:', key);
        console.log('[Vevil] setStoredToken: Verifying by reading back:', localStorage.getItem(key) ? 'EXISTS' : 'NULL');
    } catch (e) {
        console.error('[Vevil] setStoredToken: ERROR saving token:', e);
    }
};

const clearStoredToken = (key: string): void => {
    try {
        localStorage.removeItem(key);
    } catch { }
};

// Initialize tokens from localStorage
let accessToken: string | null = getStoredToken('vevil_access_token');
let refreshToken: string | null = getStoredToken('vevil_refresh_token');

// Debug: Log what we loaded from localStorage - ALWAYS log, not just DEV mode
if (typeof window !== 'undefined') {
    console.log('[Vevil] Initial tokens loaded:', { accessToken: accessToken ? 'EXISTS' : 'NULL', refreshToken: refreshToken ? 'EXISTS' : 'NULL' });
    console.log('[Vevil] localStorage vevil keys:', Object.keys(localStorage).filter(k => k.startsWith('vevil')));
    // Also log all localStorage for debugging
    console.log('[Vevil] All localStorage:', JSON.stringify(localStorage));
}

export const getAccessToken = (): string | null => {
    const token = accessToken;
    console.log('[Vevil] getAccessToken called, returning:', token ? 'EXISTS' : 'NULL');
    return token;
};
export const setAccessToken = (token: string | null): void => {
    console.log('[Vevil] setAccessToken called with:', token ? 'TOKEN' : 'NULL');
    accessToken = token;
    if (token) {
        setStoredToken('vevil_access_token', token);
        console.log('[Vevil] Access token saved to localStorage');
    } else {
        clearStoredToken('vevil_access_token');
    }
};
export const getRefreshToken = (): string | null => {
    const token = refreshToken;
    console.log('[Vevil] getRefreshToken called, returning:', token ? 'EXISTS' : 'NULL');
    return token;
};
export const setRefreshToken = (token: string | null): void => {
    console.log('[Vevil] setRefreshToken called with:', token ? 'TOKEN' : 'NULL');
    refreshToken = token;
    if (token) {
        setStoredToken('vevil_refresh_token', token);
        console.log('[Vevil] Token saved to localStorage');
    } else {
        clearStoredToken('vevil_refresh_token');
    }
};

// Verificar si hay sesión activa
export const hasActiveSession = async (): Promise<boolean> => {
    return !!accessToken;
};

// Logout: llama al endpoint para invalidar el refresh token en el servidor
// y limpiar las cookies (el servidor envía cookies vacías con fecha pasada)
export const clearTokens = async (): Promise<void> => {
    if (import.meta.env.DEV) console.log('[API] clearTokens: Starting logout...');
    try {
        const res = await fetch(`${API_BASE_URL}/auth/logout`, {
            method: 'POST',
            credentials: 'include',
        });
        if (import.meta.env.DEV) console.log('[API] clearTokens: Logout request sent, status:', res.status);
        // Si el servidor devuelve 401, el token ya no es válido - igualmente limpiamos localmente
    } catch (e) {
        if (import.meta.env.DEV) console.error('[API] clearTokens: Error', e);
    }
    // Limpiar tokens de localStorage
    clearStoredToken('vevil_access_token');
    clearStoredToken('vevil_refresh_token');
    // Limpiar variables en memoria
    accessToken = null;
    refreshToken = null;
    if (import.meta.env.DEV) console.log('[API] clearTokens: Tokens cleared from localStorage and memory');
};

// Cambiar contraseña del usuario logueado
export const changePassword = async (currentPassword: string, newPassword: string): Promise<{ message: string }> => {
    const response = await fetchWithAuth('/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
    });
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Error al cambiar contraseña' }));
        throw new Error(error.message || 'Error al cambiar contraseña');
    }
    return response.json();
};

// Reintentos para cold start del backend (Render free tier puede tardar ~1 min en despertar)
const RETRY_DELAYS_MS = [5000, 15000, 30000]; // 5s, 15s, 30s entre intentos
const REQUEST_TIMEOUT_MS = 50000; // 50 s por intento

const fetchWithRetry = async (url: string, options: RequestInit, retriesLeft = RETRY_DELAYS_MS.length): Promise<Response> => {
    try {
        const res = await fetch(url, { ...options, signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
        return res;
    } catch (e: any) {
        const isRetryable = retriesLeft > 0 && (e?.message?.includes('fetch') || e?.name === 'TypeError' || e?.name === 'AbortError');
        if (isRetryable) {
            const delay = RETRY_DELAYS_MS[RETRY_DELAYS_MS.length - retriesLeft] ?? 5000;
            await new Promise((r) => setTimeout(r, delay));
            return fetchWithRetry(url, options, retriesLeft - 1);
        }
        throw e;
    }
};

// ============ AUTENTICACIÓN ============
export interface UserProfile {
    id?: string;
    email?: string;
    name?: string;
    lastName?: string;
    role?: string;
    isActive?: boolean;
    avatar?: string;
}
export interface LoginResponse {
    access_token: string;
    refresh_token?: string;
    user?: UserProfile;
}
export interface RegisterResponse {
    id: string;
    email: string;
    name: string;
}
// TEMPORAL: Deshabilitar guardado de tokens para pruebas
export const login = async (email: string, password: string): Promise<LoginResponse> => {
    const loginUrl = `${API_BASE_URL}/auth/login`;
    console.log('[Vevil] Login → POST', loginUrl);
    try {
        const response = await fetchWithRetry(loginUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        console.log('[Vevil] Login response status:', response.status, response.statusText);
        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Credenciales inválidas' }));
            throw new Error(error.message || 'Error al iniciar sesión');
        }

        const data = await response.json();
        console.log('[Vevil] Login response:', data);
        if (data.access_token) {
            setAccessToken(data.access_token);
            console.log('[Vevil] Access token guardado en memoria');
        }
        if (data.refresh_token) {
            setRefreshToken(data.refresh_token);
            console.log('[Vevil] Refresh token guardado en memoria');
        }

        return data;
    } catch (error: any) {
        if (import.meta.env.DEV) console.warn('[Vevil] Login error:', error?.name, error?.message);
        if (error?.message?.includes('Failed to fetch') || error?.name === 'TypeError' || error?.name === 'AbortError') {
            throw new Error('No se pudo conectar al servidor. Si usás el plan gratis de Render, esperá ~1 minuto y probá de nuevo (el backend se “despierta” solo).');
        }
        throw error;
    }
};

export const register = async (name: string, email: string, password: string): Promise<RegisterResponse> => {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password }),
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Error al registrar usuario' }));
            throw new Error(error.message || 'Error al registrar usuario');
        }
        return response.json();
    } catch (error: any) {
        throw error;
    }
};

/** Solicitar registro: envía email al usuario para que confirme; luego un admin debe aprobar. */
export const requestRegistration = async (data: {
    email: string;
    name: string;
    lastName?: string;
    gender?: 'male' | 'female';
}): Promise<{ message: string }> => {
    const response = await fetch(`${API_BASE_URL}/auth/request-registration`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        const err = await response.json().catch(() => ({ message: 'Error al enviar la solicitud' }));
        throw new Error(err.message || 'Error al enviar la solicitud');
    }
    return response.json();
};

/** Confirmar correo desde el link del email (token en query). */
export const confirmRegistration = async (token: string): Promise<{ message: string }> => {
    const response = await fetch(`${API_BASE_URL}/auth/confirm-registration?token=${encodeURIComponent(token)}`);
    if (!response.ok) {
        const err = await response.json().catch(() => ({ message: 'Enlace inválido o expirado' }));
        throw new Error(err.message || 'Enlace inválido o expirado');
    }
    return response.json();
};

// ============ SOLICITUDES DE REGISTRO (admin) ============
export interface PendingRegistrationItem {
    id: string;
    email: string;
    name: string;
    lastName?: string;
    gender?: string;
    status: string;
    emailConfirmedAt?: string;
    createdAt: string;
}

export const pendingRegistrationsApi = {
    getCount: async (): Promise<number> => {
        const r = await fetchWithAuth('/pending-registrations/count');
        if (!r.ok) return 0;
        const data = await r.json();
        return data.count ?? 0;
    },
    getList: async (): Promise<PendingRegistrationItem[]> => {
        const r = await fetchWithAuth('/pending-registrations');
        if (!r.ok) throw new Error('Error al cargar solicitudes');
        return r.json();
    },
    approve: async (id: string, role: 'admin' | 'user'): Promise<{ message: string }> => {
        const r = await fetchWithAuth(`/pending-registrations/${id}/approve`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ role }),
        });
        if (!r.ok) {
            const err = await r.json().catch(() => ({}));
            throw new Error(err.message || 'Error al aprobar');
        }
        return r.json();
    },
    reject: async (id: string): Promise<{ message: string }> => {
        const r = await fetchWithAuth(`/pending-registrations/${id}/reject`, {
            method: 'POST',
        });
        if (!r.ok) {
            const err = await r.json().catch(() => ({}));
            throw new Error(err.message || 'Error al rechazar');
        }
        return r.json();
    },
};

export const forgotPassword = async (email: string): Promise<{ message: string }> => {
    const url = `${API_BASE_URL}/auth/forgot-password`;
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
    });
    if (!response.ok) {
        const err = await response.json().catch(() => ({ message: 'Error al enviar' }));
        throw new Error(err.message || 'Error al enviar');
    }
    return response.json();
};

export const resetPassword = async (token: string, newPassword: string): Promise<{ message: string }> => {
    const url = `${API_BASE_URL}/auth/reset-password`;
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
    });
    if (!response.ok) {
        const err = await response.json().catch(() => ({ message: 'Error al restablecer' }));
        throw new Error(err.message || 'Error al restablecer');
    }
    return response.json();
};

// =====================================================
// REFRESH DE AUTH: Ahora el servidor maneja las cookies automáticamente
// El navegador envía automáticamente las cookies HttpOnly con cada request
// =====================================================
const refreshAuth = async (): Promise<boolean> => {
    console.log('[API] refreshAuth: Starting...');
    const currentRefreshToken = getRefreshToken();
    console.log('[API] refreshAuth: Current refresh token:', currentRefreshToken ? 'EXISTS' : 'MISSING');

    if (!currentRefreshToken) {
        console.log('[API] refreshAuth: No refresh token available - returning false');
        return false;
    }
    try {
        // Don't send Authorization header when refreshing - it conflicts with extracting refresh token
        const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refresh_token: currentRefreshToken }),
        });
        console.log('[API] refreshAuth: Response status:', res.status);
        if (!res.ok) {
            console.log('[API] refreshAuth: Response not OK, returning false');
            // Si el refresh falla con 401, limpiar tokens para que el usuario pueda iniciar sesión nuevamente
            if (res.status === 401) {
                console.log('[API] refreshAuth: Got 401, clearing tokens');
                setAccessToken(null);
                setRefreshToken(null);
            }
            return false;
        }

        // Obtener nuevos tokens del body
        const data = await res.json();
        console.log('[API] refreshAuth: New tokens received:', data.access_token ? 'YES' : 'NO');
        if (data.access_token) {
            setAccessToken(data.access_token);
            console.log('[API] refreshAuth: New access token set');
        }
        if (data.refresh_token) {
            setRefreshToken(data.refresh_token);
            console.log('[API] refreshAuth: New refresh token set');
        }
        console.log('[API] refreshAuth: Success, returning true');
        return true;
    } catch (e) {
        console.error('[API] refreshAuth: Error', e);
        return false;
    }
};

type FetchWithAuthConfig = { skipRedirectOn401?: boolean };

const fetchWithAuth = async (
    endpoint: string,
    options: RequestInit = {},
    config: FetchWithAuthConfig = {}
): Promise<Response> => {
    const token = getAccessToken();
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
    };

    let response: Response;
    try {
        console.log('[API] fetchWithAuth:', endpoint, 'method:', options.method || 'GET', 'token:', token ? 'EXISTS' : 'NULL');
        response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers,
        });
        console.log('[API] fetchWithAuth response:', endpoint, 'status:', response.status);
    } catch (e: any) {
        console.error('[API] fetchWithAuth error:', endpoint, e);
        if (e?.message?.includes('Failed to fetch') || e?.name === 'TypeError' || e?.name === 'AbortError') {
            throw new Error('No se pudo conectar al servidor. Si usás el plan gratis de Render, esperá ~1 minuto y probá de nuevo.');
        }
        throw e;
    }

    // Si recibimos 401, intentar refresh del token
    if (response.status === 401 && !config.skipRedirectOn401) {
        console.log('[API] fetchWithAuth: Got 401, attempting refresh...');
        const refreshed = await refreshAuth();
        if (refreshed) {
            // Reintentar la petición original con el nuevo token
            const newToken = getAccessToken();
            const retryHeaders: HeadersInit = {
                'Content-Type': 'application/json',
                ...(newToken ? { Authorization: `Bearer ${newToken}` } : {}),
                ...options.headers,
            };
            console.log('[API] fetchWithAuth: Retrying with new token');
            return fetch(`${API_BASE_URL}${endpoint}`, {
                ...options,
                headers: retryHeaders,
            });
        }
    }

    return response;
};

export const getProfile = async (): Promise<UserProfile> => {
    const r = await fetchWithAuth('/auth/profile');
    if (!r.ok) throw new Error('No autorizado');
    return r.json();
};

// ============ WEBAUTHN (huella / passkey) ============
/** Opciones para iniciar sesión con huella (email debe tener credencial registrada). */
export const webauthnLoginOptions = async (email: string): Promise<{ challenge: string;[k: string]: unknown }> => {
    const r = await fetch(`${API_BASE_URL}/auth/webauthn/login/options`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
    });
    if (!r.ok) {
        const err = await r.json().catch(() => ({ message: 'No hay huella registrada para este correo' }));
        throw new Error(err.message || 'Error al obtener opciones');
    }
    return r.json();
};

/** Verificar huella y obtener tokens. */
export const webauthnLoginVerify = async (
    response: Record<string, unknown>,
    challenge: string
): Promise<{ access_token: string; refresh_token?: string }> => {
    const r = await fetch(`${API_BASE_URL}/auth/webauthn/login/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ response, challenge }),
    });
    if (!r.ok) {
        const err = await r.json().catch(() => ({ message: 'Verificación fallida' }));
        throw new Error(err.message || 'Verificación fallida');
    }
    return r.json();
};

/**
 * Tipo para opciones de registro WebAuthn (compatible con simplewebauthn)
 * Basado en PublicKeyCredentialCreationOptionsJSON
 */
export interface WebAuthnRegisterOptions {
    challenge: string;
    rp: { name: string; id: string };
    user: { id: string; name: string; displayName: string };
    pubKeyCredParams: Array<{ type: 'public-key'; alg: number }>;
    timeout?: number;
    excludeCredentials?: Array<{ id: string; type: 'public-key' }>;
    authenticatorSelection?: {
        authenticatorAttachment?: 'platform' | 'cross-platform';
        requireResidentKey?: boolean;
        userVerification?: 'required' | 'preferred' | 'discouraged';
    };
    attestation?: 'none' | 'indirect' | 'direct' | 'enterprise';
    extensions?: Record<string, unknown>;
}

/** Opciones para registrar huella (requiere sesión). */
export const webauthnRegisterOptions = async (): Promise<WebAuthnRegisterOptions> => {
    const r = await fetchWithAuth('/auth/webauthn/register/options', { method: 'POST' });
    if (!r.ok) throw new Error('Error al obtener opciones');
    return r.json();
};

// Alias para compatibilidad
export const webauthnRegisterOptionsTyped = webauthnRegisterOptions;

/** Verificar y guardar credencial de huella (requiere sesión). */
export const webauthnRegisterVerify = async (
    response: Record<string, unknown>,
    challenge: string
): Promise<{ verified: boolean }> => {
    const r = await fetchWithAuth('/auth/webauthn/register/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ response, challenge }),
    });
    if (!r.ok) throw new Error('Error al registrar huella');
    return r.json();
};

// ============ PRODUCTOS ============
export interface Product {
    id: number;
    name: string;
    type: string;
    price: number;
    costPrice?: number | null;
    currency?: string;
    stock: number;
    minStock?: number;
    category?: string | null;
    description?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
}

export const productsApi = {
    getAll: async (): Promise<Product[]> => {
        const response = await fetchWithAuth('/products');
        if (!response.ok) throw new Error('Error al obtener productos');
        return response.json();
    },
    getPage: async (
        page: number,
        limit: number,
        filters?: { search?: string; type?: string; category?: string },
    ): Promise<PaginatedResponse<Product>> => {
        const params = new URLSearchParams({ page: String(page), limit: String(limit) });
        if (filters?.search?.trim()) params.set('search', filters.search.trim());
        if (filters?.type?.trim()) params.set('type', filters.type.trim());
        if (filters?.category?.trim()) params.set('category', filters.category.trim());
        const response = await fetchWithAuth(`/products?${params.toString()}`);
        if (!response.ok) throw new Error('Error al obtener productos');
        return response.json();
    },
    getById: async (id: number): Promise<Product> => {
        const response = await fetchWithAuth(`/products/${id}`);
        if (!response.ok) throw new Error('Error al obtener producto');
        return response.json();
    },
    create: async (product: Partial<Product>): Promise<Product> => {
        const response = await fetchWithAuth('/products', {
            method: 'POST',
            body: JSON.stringify(product),
        });
        if (!response.ok) throw new Error('Error al crear producto');
        return response.json();
    },
    update: async (id: number, product: Partial<Product>): Promise<Product> => {
        const response = await fetchWithAuth(`/products/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(product),
        });
        if (!response.ok) throw new Error('Error al actualizar producto');
        return response.json();
    },
    delete: async (id: number): Promise<void> => {
        const response = await fetchWithAuth(`/products/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Error al eliminar producto');
    },
};

// ============ PROVEEDORES ============
export interface Supplier {
    id: number;
    name: string;
    email: string;
    phones: { type: string; number: string }[];
    contact_person: string | null;
    address_street: string | null;
    address_city: string | null;
    address_province: string | null;
    tax_id: string | null;
    notes: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export const suppliersApi = {
    getAll: async (): Promise<Supplier[]> => {
        const response = await fetchWithAuth('/suppliers');
        if (!response.ok) throw new Error('Error al obtener proveedores');
        return response.json();
    },
    getById: async (id: number): Promise<Supplier> => {
        const response = await fetchWithAuth(`/suppliers/${id}`);
        if (!response.ok) throw new Error('Error al obtener proveedor');
        return response.json();
    },
    create: async (supplier: Omit<Supplier, 'id' | 'created_at' | 'updated_at'>): Promise<Supplier> => {
        const response = await fetchWithAuth('/suppliers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(supplier),
        });
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.message || 'Error al crear proveedor');
        }
        return response.json();
    },
    update: async (id: number, supplier: Partial<Supplier>): Promise<Supplier> => {
        const response = await fetchWithAuth(`/suppliers/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(supplier),
        });
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.message || 'Error al actualizar proveedor');
        }
        return response.json();
    },
    delete: async (id: number): Promise<void> => {
        const response = await fetchWithAuth(`/suppliers/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Error al eliminar proveedor');
    },
};

// ============ MOVIMIENTOS DE STOCK ============
export interface StockMovement {
    id: number;
    productId: number;
    product: Product;
    type: 'in' | 'out';
    quantity: number;
    reason: string;
    note: string | null;
    invoiceId: number | null;
    createdAt: string;
}

export const stockMovementsApi = {
    getAll: async (productId?: number): Promise<StockMovement[]> => {
        const url = productId != null ? `/stock-movements?productId=${productId}` : '/stock-movements';
        const response = await fetchWithAuth(url);
        if (!response.ok) throw new Error('Error al obtener movimientos');
        return response.json();
    },
    create: async (data: { productId: number; type: 'in' | 'out'; quantity: number; reason: string; note?: string }): Promise<StockMovement> => {
        const response = await fetchWithAuth('/stock-movements', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.message || 'Error al registrar movimiento');
        }
        return response.json();
    },
};

// ============ CLIENTES ============
export interface Customer {
    id: number;
    name: string;
    email: string;
    phones?: { type: string; number: string }[];
    address_street?: string;
    address_city?: string;
    address_province?: string;
    address_zip?: string;
    google_maps_link?: string;
    tax_id?: string;
    creditBalance?: number;
}

export const customersApi = {
    getAll: async (): Promise<Customer[]> => {
        const response = await fetchWithAuth('/customers');
        if (!response.ok) throw new Error('Error al obtener clientes');
        return response.json();
    },
    getPage: async (
        page: number,
        limit: number,
        filters?: { search?: string; department?: string },
    ): Promise<PaginatedResponse<Customer>> => {
        const params = new URLSearchParams({ page: String(page), limit: String(limit) });
        if (filters?.search?.trim()) params.set('search', filters.search.trim());
        if (filters?.department?.trim()) params.set('department', filters.department.trim());
        const response = await fetchWithAuth(`/customers?${params.toString()}`);
        if (!response.ok) throw new Error('Error al obtener clientes');
        return response.json();
    },
    getDepartments: async (): Promise<string[]> => {
        const response = await fetchWithAuth('/customers/meta/departments');
        if (!response.ok) throw new Error('Error al obtener departamentos');
        return response.json();
    },
    getById: async (id: number): Promise<Customer> => {
        const response = await fetchWithAuth(`/customers/${id}`);
        if (!response.ok) throw new Error('Error al obtener cliente');
        return response.json();
    },

    create: async (customer: Omit<Customer, 'id'>): Promise<Customer> => {
        const response = await fetchWithAuth('/customers', {
            method: 'POST',
            body: JSON.stringify(customer),
        });
        if (!response.ok) {
            let errorMsg = 'Error al crear cliente';
            try {
                const data = await response.json();
                errorMsg = data.message || data.error || JSON.stringify(data);
            } catch {}
            throw new Error(errorMsg);
        }
        return response.json();
    },

    update: async (id: number, customer: Partial<Customer>): Promise<Customer> => {
        const response = await fetchWithAuth(`/customers/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(customer),
        });
        if (!response.ok) throw new Error('Error al actualizar cliente');
        return response.json();
    },

    delete: async (id: number): Promise<void> => {
        const response = await fetchWithAuth(`/customers/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || 'Error al eliminar cliente');
        }
    },
};

// ============ FACTURAS ============
export interface InvoiceItem {
    id: number;
    productId: number;
    product?: Product;
    quantity: number;
    priceAtSale: number;
    discountPercent?: number;
}

export interface Payment {
    id: number;
    invoiceId: number;
    amount: number;
    date: string;
    method?: string;
}

export interface Invoice {
    id: number;
    customer: Customer;
    customerId: number;
    date: string;
    total: number;
    currency?: string;
    status?: string;
    notes?: string;
    discountPercent?: number;
    dueDate?: string;
    items: InvoiceItem[];
    payments?: Payment[];
}

export const invoicesApi = {
    getAll: async (): Promise<Invoice[]> => {
        const response = await fetchWithAuth('/invoices');
        if (!response.ok) throw new Error('Error al obtener facturas');
        return response.json();
    },
    getPage: async (
        page: number,
        limit: number,
        filters?: { search?: string; customerId?: number; status?: string; dateFrom?: string; dateTo?: string },
    ): Promise<PaginatedResponse<Invoice>> => {
        const params = new URLSearchParams({ page: String(page), limit: String(limit) });
        if (filters?.search?.trim()) params.set('search', filters.search.trim());
        if (filters?.customerId != null) params.set('customerId', String(filters.customerId));
        if (filters?.status?.trim()) params.set('status', filters.status.trim());
        if (filters?.dateFrom) params.set('dateFrom', filters.dateFrom);
        if (filters?.dateTo) params.set('dateTo', filters.dateTo);
        const response = await fetchWithAuth(`/invoices?${params.toString()}`);
        if (!response.ok) throw new Error('Error al obtener facturas');
        return response.json();
    },
    getById: async (id: number): Promise<Invoice> => {
        const response = await fetchWithAuth(`/invoices/${id}`);
        if (!response.ok) throw new Error('Error al obtener factura');
        return response.json();
    },

    create: async (invoice: { 
        customerId: number; 
        currency?: string; 
        status?: string; 
        items: { productId: number; quantity: number; discountPercent?: number }[];
        notes?: string;
        discountPercent?: number;
        dueDate?: string;
    }): Promise<Invoice> => {
        const response = await fetchWithAuth('/invoices', {
            method: 'POST',
            body: JSON.stringify(invoice),
        });
        if (!response.ok) throw new Error('Error al crear factura');
        return response.json();
    },

    updateStatus: async (id: number, status: string): Promise<Invoice> => {
        const response = await fetchWithAuth(`/invoices/${id}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status }),
        });
        if (!response.ok) throw new Error('Error al actualizar estado');
        return response.json();
    },

    getPayments: async (id: number): Promise<Payment[]> => {
        const response = await fetchWithAuth(`/invoices/${id}/payments`);
        if (!response.ok) throw new Error('Error al obtener pagos');
        return response.json();
    },

    addPayment: async (id: number, body: { amount: number; method?: string }): Promise<Payment> => {
        const response = await fetchWithAuth(`/invoices/${id}/payments`, {
            method: 'POST',
            body: JSON.stringify(body),
        });
        if (!response.ok) throw new Error('Error al registrar pago');
        return response.json();
    },

    /** Elimina un pago de una factura. */
    deletePayment: async (invoiceId: number, paymentId: number): Promise<{ success: boolean }> => {
        const response = await fetchWithAuth(`/invoices/${invoiceId}/payments/${paymentId}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Error al eliminar pago');
        return response.json();
    },

    /** Envía recordatorio de cobro por email al cliente. Solo facturas pendientes. */
    sendReminder: async (id: number): Promise<{ sent: boolean; reason?: string }> => {
        const response = await fetchWithAuth(`/invoices/${id}/send-reminder`, { method: 'POST' });
        if (!response.ok) throw new Error('Error al enviar recordatorio');
        return response.json();
    },

    /** Actualiza una factura (solo facturas pending o cancelled pueden editarsi). */
    update: async (id: number, invoice: { customerId?: number; currency?: string; status?: string; items?: { productId?: number; quantity?: number; priceAtSale?: number }[] }): Promise<Invoice> => {
        const response = await fetchWithAuth(`/invoices/${id}`, {
            method: 'PUT',
            body: JSON.stringify(invoice),
        });
        if (!response.ok) throw new Error('Error al actualizar factura');
        return response.json();
    },

    /** Elimina una factura (solo facturas pending o cancelled pueden eliminarse). */
    remove: async (id: number): Promise<{ success: boolean }> => {
        const response = await fetchWithAuth(`/invoices/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Error al eliminar factura');
        return response.json();
    },
};

// ============ ESTADÍSTICAS ============
export const statsApi = {
    getDashboardStats: async () => {
        const [products, customers, invoices] = await Promise.all([
            productsApi.getAll(),
            customersApi.getAll(),
            invoicesApi.getAll(),
        ]);

        return {
            totalProducts: products.length,
            totalCustomers: customers.length,
            totalInvoices: invoices.length,
            totalRevenue: invoices.reduce((sum, inv) => sum + Number(inv.total), 0),
        };
    },
    getBasicStats: async () => {
        // Alias for getDashboardStats for compatibility
        return statsApi.getDashboardStats();
    },
};

// ============ MÉTRICAS (CONTROLES) ============
export interface DashboardMetrics {
    totalProducts: number;
    totalCustomers: number;
    totalInvoices: number;
    totalRevenue: number;
    revenueLast7Days: number;
    invoicesLast7Days: number;
    revenueThisMonth: number;
    invoicesThisMonth: number;
    revenueLastMonth: number;
    invoicesLastMonth: number;
    lowStockProducts: number;
    lowStockList: { id: number; name: string; stock: number; minStock: number }[];
    topProductsSold: { productId: number; productName: string; quantitySold: number }[];
    pendingInvoices: number;
    pendingInvoicesAmount: number;
    periodFrom?: string;
    periodTo?: string;
    periodRevenue?: number;
    periodInvoices?: number;
    periodTopProducts?: { productId: number; productName: string; quantitySold: number }[];
    generatedAt: string;
}

export const metricsApi = {
    getMetrics: async (filters?: { from?: string; to?: string }): Promise<DashboardMetrics> => {
        const params = new URLSearchParams();
        if (filters?.from) params.set('from', filters.from);
        if (filters?.to) params.set('to', filters.to);
        const qs = params.toString();
        const url = qs ? `/metrics?${qs}` : '/metrics';
        const response = await fetchWithAuth(url);
        if (!response.ok) throw new Error('Error al obtener métricas');
        return response.json();
    },
    getDailyRevenue: async (days: number = 30): Promise<{ date: string; revenue: number }[]> => {
        const response = await fetchWithAuth(`/metrics/daily-revenue?days=${days}`);
        if (!response.ok) throw new Error('Error al obtener ingresos diarios');
        return response.json();
    },
    getProductProfits: async (days: number = 90): Promise<{
        productId: number;
        productName: string;
        quantitySold: number;
        revenue: number;
        cost: number;
        profit: number;
        marginPercent: number;
    }[]> => {
        const response = await fetchWithAuth(`/metrics/product-profits?days=${days}`);
        if (!response.ok) throw new Error('Error al obtener ganancias por producto');
        return response.json();
    },
};

// ============ AUDITORÍA ============
export interface AuditLogItem {
    id: number;
    userId: string | null;
    userEmail: string | null;
    action: string;
    entityType: string;
    entityId: string | null;
    oldValue: Record<string, unknown> | null;
    newValue: Record<string, unknown> | null;
    ip: string | null;
    createdAt: string;
}

export const auditApi = {
    getList: async (params?: {
        userId?: string;
        entityType?: string;
        entityId?: string;
        limit?: number;
        offset?: number;
    }): Promise<PaginatedResponse<AuditLogItem>> => {
        const search = new URLSearchParams();
        if (params?.userId) search.set('userId', params.userId);
        if (params?.entityType) search.set('entityType', params.entityType);
        if (params?.entityId) search.set('entityId', params.entityId);
        if (params?.limit != null) search.set('limit', String(params.limit));
        if (params?.offset != null) search.set('offset', String(params.offset));
        const qs = search.toString();
        const url = qs ? `/audit?${qs}` : '/audit';
        const response = await fetchWithAuth(url);
        if (!response.ok) throw new Error('Error al cargar auditoría');
        return response.json();
    },
};

// ============ USUARIOS (Admin) ============
export interface SystemUser {
    id: string;
    email: string;
    name: string;
    lastName?: string;
    role: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    avatar?: string;
}

// Tipos de respuesta para usersApi
export interface UsersListResponse {
    data: SystemUser[];
    total: number;
}

export interface ToggleActiveResponse {
    isActive: boolean;
    message: string;
}

export const usersApi = {
    getAll: async (params?: { page?: number; limit?: number; search?: string }): Promise<UsersListResponse> => {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.set('page', String(params.page));
        if (params?.limit) queryParams.set('limit', String(params.limit));
        if (params?.search) queryParams.set('search', params.search);
        const query = queryParams.toString();
        const response = await fetchWithAuth(`/users${query ? '?' + query : ''}`);
        return response.json();
    },

    toggleActive: async (userId: string): Promise<ToggleActiveResponse> => {
        const response = await fetchWithAuth(`/users/${userId}/toggle-active`, { method: 'PATCH' });
        return response.json();
    },

    delete: async (userId: string): Promise<void> => {
        await fetchWithAuth(`/users/${userId}`, { method: 'DELETE' });
    },

    create: async (userData: { email: string; name: string; password: string; role?: string }): Promise<SystemUser> => {
        const response = await fetchWithAuth('/users', {
            method: 'POST',
            body: JSON.stringify(userData),
        });
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.message || 'Error al crear usuario');
        }
        return response.json();
    },

    update: async (userId: string, userData: { email?: string; name?: string; password?: string; role?: string }): Promise<SystemUser> => {
        const response = await fetchWithAuth(`/users/${userId}`, {
            method: 'PATCH',
            body: JSON.stringify(userData),
        });
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.message || 'Error al actualizar usuario');
        }
        return response.json();
    },

    // Get current user's profile (for regular users to see only their own data)
    getMe: async (): Promise<SystemUser> => {
        const response = await fetchWithAuth('/users/me');
        return response.json();
    },

    uploadAvatar: async (file: File): Promise<SystemUser> => {
        const formData = new FormData();
        formData.append('avatar', file);
        const response = await fetchWithAuth('/users/avatar', {
            method: 'POST',
            body: formData,
        });
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.message || 'Error al subir avatar');
        }
        return response.json();
    },
};

/** Mensaje de error amigable a partir de cualquier error (red, API, etc.). */
export function getErrorMessage(err: unknown, fallback: string = 'Ocurrió un error'): string {
    if (err instanceof Error) {
        const msg = err.message?.trim();
        if (msg) return msg;
    }
    if (typeof err === 'string') return err;
    return fallback;
}

