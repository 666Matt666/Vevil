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
        return 'http://localhost:3000/api';
    }
    if (typeof window !== 'undefined') return `http://${window.location.hostname}:3000/api`;
    return RENDER_API_URL;
};

let API_BASE_URL = getApiBaseUrl();
export { getApiBaseUrl };

// Red de seguridad: si por caché o build viejo quedó Fly.io, usar Render cuando estamos en Vercel
if (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app') && API_BASE_URL.includes('fly.dev')) {
    API_BASE_URL = RENDER_API_URL;
    if (import.meta.env.DEV) console.warn('[Vevil] URL era Fly.io, usando Render:', RENDER_API_URL);
}

if (typeof window !== 'undefined' && import.meta.env.DEV) {
    console.log('[Vevil] API base URL:', API_BASE_URL);
}

/** Llama al backend en frío para que Render lo despierte (sin esperar resultado). */
export function wakeBackend(): void {
    try {
        fetch(API_BASE_URL, { method: 'GET', signal: AbortSignal.timeout(12000) }).catch(() => {});
    } catch (_) {}
}

/** Espera a que el backend responda (para “despertarlo” antes de login). Resuelve cuando responde o tras timeoutMs. */
export function wakeBackendAndWait(timeoutMs: number = 65000): Promise<void> {
    return new Promise((resolve) => {
        const t = setTimeout(resolve, timeoutMs);
        fetch(API_BASE_URL, { method: 'GET', signal: AbortSignal.timeout(timeoutMs) })
            .catch(() => {})
            .finally(() => {
                clearTimeout(t);
                resolve();
            });
    });
}

// =====================================================
// SEGURIDAD: Tokens ahora se manejan via HttpOnly Cookies
// El navegador envía automáticamente las cookies con cada request
// =====================================================

// Verificar si hay sesión activa (cookie de access_token existe)
// Nota: No podemos leer la cookie directamente por seguridad (HttpOnly),
// pero podemos verificar que el usuario no haya sido redirigido a login
export const hasActiveSession = async (): Promise<boolean> => {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/profile`, {
            method: 'GET',
            credentials: 'include', // Importante: incluir cookies
        });
        return response.ok;
    } catch {
        return false;
    }
};

// Logout: llama al endpoint para invalidar el refresh token en el servidor
// y limpiar las cookies (el servidor envía cookies vacías con fecha pasada)
export const clearTokens = async (): Promise<void> => {
    try {
        await fetch(`${API_BASE_URL}/auth/logout`, {
            method: 'POST',
            credentials: 'include',
        });
    } catch {
        // Ignorar errores en logout
    }
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
    role?: string;
}
export interface LoginResponse {
    access_token: string;
    refresh_token?: string;
    user?: UserProfile;
}
export const login = async (email: string, password: string): Promise<LoginResponse> => {
    const loginUrl = `${API_BASE_URL}/auth/login`;
    if (import.meta.env.DEV) console.log('[Vevil] Login → POST', loginUrl);
    try {
        const response = await fetchWithRetry(loginUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        if (import.meta.env.DEV) console.log('[Vevil] Login response status:', response.status, response.statusText);
        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Credenciales inválidas' }));
            throw new Error(error.message || 'Error al iniciar sesión');
        }
        return response.json();
    } catch (error: any) {
        if (import.meta.env.DEV) console.warn('[Vevil] Login error:', error?.name, error?.message);
        if (error?.message?.includes('Failed to fetch') || error?.name === 'TypeError' || error?.name === 'AbortError') {
            throw new Error('No se pudo conectar al servidor. Si usás el plan gratis de Render, esperá ~1 minuto y probá de nuevo (el backend se “despierta” solo).');
        }
        throw error;
    }
};

export const register = async (name: string, email: string, password: string): Promise<any> => {
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
        const r = await fetchWithAuth(`${API_BASE_URL}/pending-registrations/count`);
        if (!r.ok) return 0;
        const data = await r.json();
        return data.count ?? 0;
    },
    getList: async (): Promise<PendingRegistrationItem[]> => {
        const r = await fetchWithAuth(`${API_BASE_URL}/pending-registrations`);
        if (!r.ok) throw new Error('Error al cargar solicitudes');
        return r.json();
    },
    approve: async (id: string, role: 'admin' | 'user'): Promise<{ message: string }> => {
        const r = await fetchWithAuth(`${API_BASE_URL}/pending-registrations/${id}/approve`, {
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
        const r = await fetchWithAuth(`${API_BASE_URL}/pending-registrations/${id}/reject`, {
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
    try {
        // El navegador envía automáticamente la cookie de refresh token
        const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include', // Importante: incluir cookies
        });
        if (!res.ok) return false;
        // El servidor envía nuevas cookies automáticamente
        return true;
    } catch {
        return false;
    }
};

type FetchWithAuthConfig = { skipRedirectOn401?: boolean };

const fetchWithAuth = async (
    endpoint: string,
    options: RequestInit = {},
    config: FetchWithAuthConfig = {}
): Promise<Response> => {
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
    };
    // Ya NO necesitamos enviar Authorization header - las cookies se envían automáticamente

    let response: Response;
    try {
        response = await fetch(`${API_BASE_URL}${endpoint}`, { 
            ...options, 
            headers,
            credentials: 'include', // Importante: incluir cookies HttpOnly
        });
    } catch (e: any) {
        if (e?.message?.includes('Failed to fetch') || e?.name === 'TypeError' || e?.name === 'AbortError') {
            throw new Error('No se pudo conectar al servidor. Si usás el plan gratis de Render, esperá ~1 minuto y probá de nuevo.');
        }
        throw e;
    }

    // Intentar refresh si hay 401
    if (response.status === 401 && (await refreshAuth())) {
        // Reintentar request con nuevas cookies
        response = await fetch(`${API_BASE_URL}${endpoint}`, { 
            ...options, 
            headers,
            credentials: 'include',
        });
    }

    if (response.status === 401) {
        if (!config.skipRedirectOn401 && typeof window !== 'undefined') {
            await clearTokens();
            const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
            window.location.assign(`${base}/login?expired=1`);
        }
        throw new Error('Sesión expirada');
    }
    return response;
};

export const getProfile = async () => {
    const r = await fetchWithAuth('/auth/profile', {}, { skipRedirectOn401: true });
    if (!r.ok) throw new Error('No autorizado');
    return r.json();
};

// ============ WEBAUTHN (huella / passkey) ============
/** Opciones para iniciar sesión con huella (email debe tener credencial registrada). */
export const webauthnLoginOptions = async (email: string): Promise<{ challenge: string; [k: string]: unknown }> => {
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

/** Opciones para registrar huella (requiere sesión). */
export const webauthnRegisterOptions = async (): Promise<{ challenge: string; [k: string]: unknown }> => {
    const r = await fetchWithAuth('/auth/webauthn/register/options', { method: 'POST' });
    if (!r.ok) throw new Error('Error al obtener opciones');
    return r.json();
};

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
        if (filters?.type && filters.type !== 'all') params.set('type', filters.type);
        if (filters?.category && filters.category !== 'all') params.set('category', filters.category);
        const response = await fetchWithAuth(`/products?${params.toString()}`);
        if (!response.ok) throw new Error('Error al obtener productos');
        return response.json();
    },
    
    getById: async (id: number): Promise<Product> => {
        const response = await fetchWithAuth(`/products/${id}`);
        if (!response.ok) throw new Error('Error al obtener producto');
        return response.json();
    },
    
    create: async (product: Omit<Product, 'id'>): Promise<Product> => {
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
        if (!response.ok) throw new Error('Error al crear cliente');
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
        if (!response.ok) throw new Error('Error al eliminar cliente');
    },
};

// ============ FACTURAS ============
export interface InvoiceItem {
    id: number;
    productId: number;
    product?: Product;
    quantity: number;
    priceAtSale: number;
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
    
    create: async (invoice: { customerId: number; currency?: string; status?: string; items: { productId: number; quantity: number }[] }): Promise<Invoice> => {
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

    /** Envía recordatorio de cobro por email al cliente. Solo facturas pendientes. */
    sendReminder: async (id: number): Promise<{ sent: boolean; reason?: string }> => {
        const response = await fetchWithAuth(`/invoices/${id}/send-reminder`, { method: 'POST' });
        if (!response.ok) throw new Error('Error al enviar recordatorio');
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

/** Mensaje de error amigable a partir de cualquier error (red, API, etc.). */
export function getErrorMessage(err: unknown, fallback: string = 'Ocurrió un error'): string {
    if (err instanceof Error) {
        const msg = err.message?.trim();
        if (msg) return msg;
    }
    if (typeof err === 'string') return err;
    return fallback;
}

