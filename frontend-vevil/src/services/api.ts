// Obtener la URL del backend dinámicamente
const getApiBaseUrl = (): string => {
    // Si hay variable de entorno, usarla
    if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL;
    }
    // Si estamos en localhost, usar localhost
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return 'http://localhost:3000/api';
    }
    // Si estamos accediendo por IP (desde celular), usar la misma IP con puerto 3000
    return `http://${window.location.hostname}:3000/api`;
};

const API_BASE_URL = getApiBaseUrl();

// Función helper para obtener el token
const getToken = (): string | null => {
    return localStorage.getItem('token');
};

// ============ AUTENTICACIÓN ============
export const login = async (email: string, password: string): Promise<{ access_token: string }> => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Credenciales inválidas' }));
        throw new Error(error.message || 'Error al iniciar sesión');
    }

    return response.json();
};

// Función helper para hacer peticiones autenticadas
const fetchWithAuth = async (endpoint: string, options: RequestInit = {}): Promise<Response> => {
    const token = getToken();
    
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
    };
    
    if (token) {
        (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });
    
    // Si el token expiró, redirigir al login
    if (response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
        throw new Error('Sesión expirada');
    }
    
    return response;
};

// ============ PRODUCTOS ============
export interface Product {
    id: number;
    name: string;
    type: string;
    price: number;
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

export interface Invoice {
    id: number;
    customer: Customer;
    customerId: number;
    date: string;
    total: number;
    items: InvoiceItem[];
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
    
    create: async (invoice: { customerId: number; items: { productId: number; quantity: number }[] }): Promise<Invoice> => {
        const response = await fetchWithAuth('/invoices', {
            method: 'POST',
            body: JSON.stringify(invoice),
        });
        if (!response.ok) throw new Error('Error al crear factura');
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

