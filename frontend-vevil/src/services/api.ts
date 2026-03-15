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

// Corrección en runtime: si por caché o build viejo quedó Fly.io, usar Render cuando estamos en Vercel
if (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app') && API_BASE_URL.includes('fly.dev')) {
    console.warn('[Vevil] URL era Fly.io, usando Render:', RENDER_API_URL);
    API_BASE_URL = RENDER_API_URL;
}

if (typeof window !== 'undefined') {
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

const getToken = (): string | null => localStorage.getItem('token');
const getRefreshToken = (): string | null => localStorage.getItem('refresh_token');
const setTokens = (access: string, refresh?: string) => {
    localStorage.setItem('token', access);
    if (refresh != null) localStorage.setItem('refresh_token', refresh);
    else localStorage.removeItem('refresh_token');
};
export const clearTokens = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
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
export const login = async (email: string, password: string): Promise<{ access_token: string }> => {
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
        return response.json();
    } catch (error: any) {
        console.warn('[Vevil] Login error:', error?.name, error?.message);
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

const refreshAuth = async (): Promise<boolean> => {
    const refresh = getRefreshToken();
    if (!refresh) return false;
    try {
        const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh_token: refresh }),
        });
        if (!res.ok) return false;
        const data = await res.json();
        setTokens(data.access_token, data.refresh_token);
        return true;
    } catch {
        return false;
    }
};

const fetchWithAuth = async (endpoint: string, options: RequestInit = {}): Promise<Response> => {
    let token = getToken();
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
    };
    if (token) (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;

    let response: Response;
    try {
        response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });
    } catch (e: any) {
        if (e?.message?.includes('Failed to fetch') || e?.name === 'TypeError' || e?.name === 'AbortError') {
            throw new Error('No se pudo conectar al servidor. Si usás el plan gratis de Render, esperá ~1 minuto y probá de nuevo.');
        }
        throw e;
    }

    if (response.status === 401 && (await refreshAuth())) {
        token = getToken();
        if (token) (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
        response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });
    }

    if (response.status === 401) {
        clearTokens();
        window.location.href = '/login';
        throw new Error('Sesión expirada');
    }
    return response;
};

export const getProfile = async () => {
    const r = await fetchWithAuth('/auth/profile');
    if (!r.ok) throw new Error('No autorizado');
    return r.json();
};

// ============ PRODUCTOS ============
export interface Product {
    id: number;
    name: string;
    type: string;
    price: number;
    currency?: string;
    stock: number;
    description?: string;
}

export const productsApi = {
    getAll: async (): Promise<Product[]> => {
        const response = await fetchWithAuth('/products');
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
    lowStockList: { id: number; name: string; stock: number }[];
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

