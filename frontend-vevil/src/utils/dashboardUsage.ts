/**
 * Uso del dashboard: cuenta cuántas veces el usuario entra a Productos, Clientes, Facturas
 * (desde el dashboard o desde el sidebar) para mostrar "los 3 más usados" en orden.
 */
const USAGE_KEY = 'vevil_dashboard_usage';

export type DashboardUsageKey = 'products' | 'customers' | 'invoices';

const PATH_TO_KEY: Record<string, DashboardUsageKey> = {
    '/products': 'products',
    '/customers': 'customers',
    '/invoices': 'invoices',
};

export function loadUsage(): Record<DashboardUsageKey, number> {
    try {
        const raw = localStorage.getItem(USAGE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw) as Record<string, number>;
            return { products: 0, customers: 0, invoices: 0, ...parsed };
        }
    } catch (_) {}
    return { products: 0, customers: 0, invoices: 0 };
}

export function saveUsage(usage: Record<DashboardUsageKey, number>): void {
    try {
        localStorage.setItem(USAGE_KEY, JSON.stringify(usage));
    } catch (_) {}
}

/** Registra un uso al entrar a una sección (desde el dashboard o el sidebar). */
export function recordDashboardUsage(path: string): void {
    const key = PATH_TO_KEY[path];
    if (!key) return;
    const usage = loadUsage();
    usage[key] = (usage[key] ?? 0) + 1;
    saveUsage(usage);
}

export function getUsageKeyForPath(path: string): DashboardUsageKey | null {
    return PATH_TO_KEY[path] ?? null;
}
