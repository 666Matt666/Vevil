/**
 * Tasas de cambio desde MoneyConvert (https://moneyconvert.net/api)
 * Sin API key, actualización periódica. Cache local 24h.
 */

const API_URL = 'https://cdn.moneyconvert.net/api/latest.json';
const CACHE_KEY = 'vevil_currency_rates';
const CONVERSION_TARGET_KEY = 'vevil_show_conversion_to';
const TTL_MS = 24 * 60 * 60 * 1000; // 24 horas

export interface CachedRates {
    base: string;
    rates: Record<string, number>;
    updatedAt: string;
}

function getCached(): CachedRates | null {
    try {
        const raw = localStorage.getItem(CACHE_KEY);
        if (!raw) return null;
        return JSON.parse(raw) as CachedRates;
    } catch {
        return null;
    }
}

function setCached(data: CachedRates): void {
    try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    } catch {
        // ignore
    }
}

/**
 * Obtiene tasas desde la API y guarda en cache.
 */
export async function fetchRates(): Promise<CachedRates | null> {
    try {
        const res = await fetch(API_URL);
        if (!res.ok) return null;
        const json = await res.json();
        const base = json.base || 'USD';
        const rates: Record<string, number> = { ...json.rates };
        if (base === 'USD') rates['USD'] = 1;
        const updatedAt = json.ts || new Date().toISOString();
        const cached: CachedRates = { base, rates, updatedAt };
        setCached(cached);
        return cached;
    } catch {
        return null;
    }
}

/**
 * Devuelve las tasas en cache (pueden estar vencidas).
 * Si no hay cache o están vencidas, dispara actualización en segundo plano.
 */
export function getRates(): CachedRates | null {
    const cached = getCached();
    const now = Date.now();
    const updated = cached?.updatedAt ? new Date(cached.updatedAt).getTime() : 0;
    if (!cached || now - updated > TTL_MS) {
        fetchRates().then(() => {});
    }
    return cached;
}

/**
 * Convierte un monto de una moneda a otra usando las tasas en cache.
 */
export function convert(amount: number, fromCode: string, toCode: string): number | null {
    if (fromCode === toCode) return amount;
    const data = getRates();
    if (!data?.rates) return null;
    const r = data.rates;
    const fromRate = r[fromCode];
    const toRate = r[toCode];
    if (fromRate == null || toRate == null) return null;
    return (amount * toRate) / fromRate;
}

/**
 * Moneda a la que el usuario quiere ver la conversión (ej: USD).
 * null = no mostrar conversión.
 */
export function getConversionTarget(): string | null {
    try {
        const v = localStorage.getItem(CONVERSION_TARGET_KEY);
        return v || null;
    } catch {
        return null;
    }
}

export function setConversionTarget(code: string | null): void {
    try {
        if (code) localStorage.setItem(CONVERSION_TARGET_KEY, code);
        else localStorage.removeItem(CONVERSION_TARGET_KEY);
    } catch {
        // ignore
    }
}
