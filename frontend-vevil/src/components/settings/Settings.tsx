import React, { useState, useEffect } from 'react';

// ============== TIPOS ==============

export interface CurrencyConfig {
    code: string;
    symbol: string;
    name: string;
    enabled: boolean;
}

export interface CompanyConfig {
    name: string;
    ruc: string;
    address: string;
    city: string;
    phone: string;
    email: string;
    website: string;
}

export interface InvoiceConfig {
    timbrado: string;
    timbradoVigenciaDesde: string;
    timbradoVigenciaHasta: string;
    puntoExpedicion: string;
    establecimiento: string;
    rangoDesde: number;
    rangoHasta: number;
    siguienteNumero: number;
}

export interface TaxConfig {
    defaultRate: number;
    rates: { name: string; rate: number; }[];
}

export interface ProductType {
    id: string;
    name: string;
    icon: string;
}

export interface UnitOfMeasure {
    id: string;
    code: string;
    name: string;
}

export interface PaymentMethod {
    id: string;
    name: string;
    icon: string;
    enabled: boolean;
}

export interface AlertsConfig {
    lowStockEnabled: boolean;
    lowStockThreshold: number;
    timbradoExpiryWarningDays: number;
}

export interface AppearanceConfig {
    theme: 'light' | 'dark';
    primaryColor: string;
}

// ============== VALORES POR DEFECTO ==============

const defaultCurrencies: CurrencyConfig[] = [
    { code: 'PYG', symbol: '₲', name: 'Guaraníes (Paraguay)', enabled: true },
    { code: 'USD', symbol: '$', name: 'Dólares (USD)', enabled: true },
    { code: 'ARS', symbol: '$', name: 'Pesos Argentinos', enabled: false },
];

const defaultCompany: CompanyConfig = {
    name: '',
    ruc: '',
    address: '',
    city: '',
    phone: '',
    email: '',
    website: ''
};

const defaultInvoice: InvoiceConfig = {
    timbrado: '',
    timbradoVigenciaDesde: '',
    timbradoVigenciaHasta: '',
    puntoExpedicion: '001',
    establecimiento: '001',
    rangoDesde: 1,
    rangoHasta: 1000000,
    siguienteNumero: 1
};

const defaultTax: TaxConfig = {
    defaultRate: 10,
    rates: [
        { name: 'IVA 10%', rate: 10 },
        { name: 'IVA 5%', rate: 5 },
        { name: 'Exento', rate: 0 }
    ]
};

const defaultProductTypes: ProductType[] = [
    { id: 'fuel', name: 'Combustible', icon: '⛽' },
    { id: 'lubricant', name: 'Lubricantes', icon: '🛢️' },
    { id: 'snack', name: 'Snacks', icon: '🍫' },
    { id: 'beverage', name: 'Bebidas', icon: '🥤' },
    { id: 'service', name: 'Servicios', icon: '🔧' },
    { id: 'other', name: 'Otros', icon: '📦' }
];

const defaultUnits: UnitOfMeasure[] = [
    { id: 'ltr', code: 'LTR', name: 'Litros' },
    { id: 'gal', code: 'GAL', name: 'Galones' },
    { id: 'uni', code: 'UNI', name: 'Unidades' },
    { id: 'kg', code: 'KG', name: 'Kilogramos' },
    { id: 'mt', code: 'MT', name: 'Metros' }
];

const defaultPaymentMethods: PaymentMethod[] = [
    { id: 'cash', name: 'Efectivo', icon: '💵', enabled: true },
    { id: 'card', name: 'Tarjeta Débito/Crédito', icon: '💳', enabled: true },
    { id: 'transfer', name: 'Transferencia Bancaria', icon: '🏦', enabled: true },
    { id: 'credit', name: 'Crédito (Cuenta Corriente)', icon: '📝', enabled: false },
    { id: 'qr', name: 'QR / Billetera Digital', icon: '📱', enabled: false }
];

const defaultAlerts: AlertsConfig = {
    lowStockEnabled: true,
    lowStockThreshold: 100,
    timbradoExpiryWarningDays: 30
};

const defaultAppearance: AppearanceConfig = {
    theme: 'light',
    primaryColor: '#4f46e5'
};

// ============== FUNCIONES DE ALMACENAMIENTO ==============

// Monedas
export const getEnabledCurrencies = (): CurrencyConfig[] => {
    const saved = localStorage.getItem('config_currencies');
    if (saved) return JSON.parse(saved).filter((c: CurrencyConfig) => c.enabled);
    return defaultCurrencies.filter(c => c.enabled);
};

export const getAllCurrencies = (): CurrencyConfig[] => {
    const saved = localStorage.getItem('config_currencies');
    return saved ? JSON.parse(saved) : defaultCurrencies;
};

// Empresa
export const getCompanyConfig = (): CompanyConfig => {
    const saved = localStorage.getItem('config_company');
    return saved ? JSON.parse(saved) : defaultCompany;
};

// Facturación
export const getInvoiceConfig = (): InvoiceConfig => {
    const saved = localStorage.getItem('config_invoice');
    return saved ? JSON.parse(saved) : defaultInvoice;
};

// Impuestos
export const getTaxConfig = (): TaxConfig => {
    const saved = localStorage.getItem('config_tax');
    return saved ? JSON.parse(saved) : defaultTax;
};

// Tipos de producto
export const getProductTypes = (): ProductType[] => {
    const saved = localStorage.getItem('config_productTypes');
    return saved ? JSON.parse(saved) : defaultProductTypes;
};

// Unidades
export const getUnitsOfMeasure = (): UnitOfMeasure[] => {
    const saved = localStorage.getItem('config_units');
    return saved ? JSON.parse(saved) : defaultUnits;
};

// Métodos de pago
export const getPaymentMethods = (): PaymentMethod[] => {
    const saved = localStorage.getItem('config_paymentMethods');
    return saved ? JSON.parse(saved) : defaultPaymentMethods;
};

export const getEnabledPaymentMethods = (): PaymentMethod[] => {
    return getPaymentMethods().filter(p => p.enabled);
};

// Alertas
export const getAlertsConfig = (): AlertsConfig => {
    const saved = localStorage.getItem('config_alerts');
    return saved ? JSON.parse(saved) : defaultAlerts;
};

// Apariencia
export const getAppearanceConfig = (): AppearanceConfig => {
    const saved = localStorage.getItem('config_appearance');
    return saved ? JSON.parse(saved) : defaultAppearance;
};

// Formatear moneda
export const formatMoney = (amount: number, currencyCode: string): string => {
    const currencies = getAllCurrencies();
    const currency = currencies.find(c => c.code === currencyCode);
    
    if (!currency) return `${amount.toFixed(2)}`;
    
    const decimals = currencyCode === 'PYG' ? 0 : 2;
    const formatted = amount.toLocaleString('es-PY', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    });
    
    if (currencyCode === 'ARS') return `${currency.symbol} ${formatted} ARS`;
    return `${currency.symbol} ${formatted}`;
};

// Formatear número de factura
export const formatInvoiceNumber = (num: number): string => {
    const config = getInvoiceConfig();
    const establecimiento = config.establecimiento.padStart(3, '0');
    const punto = config.puntoExpedicion.padStart(3, '0');
    const numero = String(num).padStart(7, '0');
    return `${establecimiento}-${punto}-${numero}`;
};

// ============== ESTILOS ==============

const buttonStyle: React.CSSProperties = {
    padding: '8px 16px',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s'
};

const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    boxSizing: 'border-box'
};

const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '14px',
    fontWeight: 500,
    color: '#374151',
    marginBottom: '6px'
};

const cardStyle: React.CSSProperties = {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    marginBottom: '24px'
};

// ============== SECCIONES DEL MENÚ ==============

type Section = 'company' | 'invoice' | 'currencies' | 'tax' | 'productTypes' | 'units' | 'payments' | 'alerts' | 'appearance';

const menuSections = [
    { id: 'company' as Section, label: 'Datos de Empresa', icon: '🏢' },
    { id: 'invoice' as Section, label: 'Facturación', icon: '🧾' },
    { id: 'currencies' as Section, label: 'Monedas', icon: '💰' },
    { id: 'tax' as Section, label: 'Impuestos', icon: '📊' },
    { id: 'productTypes' as Section, label: 'Tipos de Producto', icon: '📦' },
    { id: 'units' as Section, label: 'Unidades de Medida', icon: '📏' },
    { id: 'payments' as Section, label: 'Métodos de Pago', icon: '💳' },
    { id: 'alerts' as Section, label: 'Alertas', icon: '⚠️' },
    { id: 'appearance' as Section, label: 'Apariencia', icon: '🎨' },
];

// ============== COMPONENTE PRINCIPAL ==============

const Settings: React.FC = () => {
    const [activeSection, setActiveSection] = useState<Section>('company');
    const [saved, setSaved] = useState(false);

    // Estados para cada sección
    const [currencies, setCurrencies] = useState<CurrencyConfig[]>(getAllCurrencies());
    const [company, setCompany] = useState<CompanyConfig>(getCompanyConfig());
    const [invoice, setInvoice] = useState<InvoiceConfig>(getInvoiceConfig());
    const [tax, setTax] = useState<TaxConfig>(getTaxConfig());
    const [productTypes, setProductTypes] = useState<ProductType[]>(getProductTypes());
    const [units, setUnits] = useState<UnitOfMeasure[]>(getUnitsOfMeasure());
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(getPaymentMethods());
    const [alerts, setAlerts] = useState<AlertsConfig>(getAlertsConfig());
    const [appearance, setAppearance] = useState<AppearanceConfig>(getAppearanceConfig());

    const showSaved = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const saveAll = () => {
        localStorage.setItem('config_currencies', JSON.stringify(currencies));
        localStorage.setItem('config_company', JSON.stringify(company));
        localStorage.setItem('config_invoice', JSON.stringify(invoice));
        localStorage.setItem('config_tax', JSON.stringify(tax));
        localStorage.setItem('config_productTypes', JSON.stringify(productTypes));
        localStorage.setItem('config_units', JSON.stringify(units));
        localStorage.setItem('config_paymentMethods', JSON.stringify(paymentMethods));
        localStorage.setItem('config_alerts', JSON.stringify(alerts));
        localStorage.setItem('config_appearance', JSON.stringify(appearance));
        showSaved();
    };

    // ============== RENDER SECCIONES ==============

    const renderCompanySection = () => (
        <div>
            <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#1e293b', margin: '0 0 8px 0' }}>
                🏢 Datos de la Empresa
            </h2>
            <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 24px 0' }}>
                Información que aparecerá en las facturas y documentos
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ gridColumn: 'span 2' }}>
                    <label style={labelStyle}>Razón Social *</label>
                    <input
                        type="text"
                        value={company.name}
                        onChange={(e) => setCompany({ ...company, name: e.target.value })}
                        style={inputStyle}
                        placeholder="Ej: Estación de Servicio El Progreso S.A."
                    />
                </div>
                <div>
                    <label style={labelStyle}>RUC *</label>
                    <input
                        type="text"
                        value={company.ruc}
                        onChange={(e) => setCompany({ ...company, ruc: e.target.value })}
                        style={inputStyle}
                        placeholder="Ej: 80012345-6"
                    />
                </div>
                <div>
                    <label style={labelStyle}>Teléfono</label>
                    <input
                        type="text"
                        value={company.phone}
                        onChange={(e) => setCompany({ ...company, phone: e.target.value })}
                        style={inputStyle}
                        placeholder="Ej: (021) 555-1234"
                    />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                    <label style={labelStyle}>Dirección</label>
                    <input
                        type="text"
                        value={company.address}
                        onChange={(e) => setCompany({ ...company, address: e.target.value })}
                        style={inputStyle}
                        placeholder="Ej: Av. Mariscal López 1234"
                    />
                </div>
                <div>
                    <label style={labelStyle}>Ciudad</label>
                    <input
                        type="text"
                        value={company.city}
                        onChange={(e) => setCompany({ ...company, city: e.target.value })}
                        style={inputStyle}
                        placeholder="Ej: Asunción"
                    />
                </div>
                <div>
                    <label style={labelStyle}>Email</label>
                    <input
                        type="email"
                        value={company.email}
                        onChange={(e) => setCompany({ ...company, email: e.target.value })}
                        style={inputStyle}
                        placeholder="contacto@empresa.com.py"
                    />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                    <label style={labelStyle}>Sitio Web</label>
                    <input
                        type="text"
                        value={company.website}
                        onChange={(e) => setCompany({ ...company, website: e.target.value })}
                        style={inputStyle}
                        placeholder="www.empresa.com.py"
                    />
                </div>
            </div>
        </div>
    );

    const renderInvoiceSection = () => (
        <div>
            <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#1e293b', margin: '0 0 8px 0' }}>
                🧾 Configuración de Facturación
            </h2>
            <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 24px 0' }}>
                Datos requeridos por la SET para facturación
            </p>

            <div style={{ ...cardStyle, backgroundColor: '#fef3c7', border: '1px solid #fcd34d' }}>
                <p style={{ margin: 0, fontSize: '14px', color: '#92400e' }}>
                    ⚠️ <strong>Importante:</strong> Estos datos deben coincidir exactamente con los autorizados por la SET (Subsecretaría de Estado de Tributación).
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ gridColumn: 'span 2' }}>
                    <label style={labelStyle}>Número de Timbrado *</label>
                    <input
                        type="text"
                        value={invoice.timbrado}
                        onChange={(e) => setInvoice({ ...invoice, timbrado: e.target.value })}
                        style={{ ...inputStyle, fontFamily: 'monospace', fontSize: '18px' }}
                        placeholder="Ej: 12345678"
                    />
                </div>
                <div>
                    <label style={labelStyle}>Vigencia Desde</label>
                    <input
                        type="date"
                        value={invoice.timbradoVigenciaDesde}
                        onChange={(e) => setInvoice({ ...invoice, timbradoVigenciaDesde: e.target.value })}
                        style={inputStyle}
                    />
                </div>
                <div>
                    <label style={labelStyle}>Vigencia Hasta</label>
                    <input
                        type="date"
                        value={invoice.timbradoVigenciaHasta}
                        onChange={(e) => setInvoice({ ...invoice, timbradoVigenciaHasta: e.target.value })}
                        style={inputStyle}
                    />
                </div>
                <div>
                    <label style={labelStyle}>Establecimiento</label>
                    <input
                        type="text"
                        value={invoice.establecimiento}
                        onChange={(e) => setInvoice({ ...invoice, establecimiento: e.target.value })}
                        style={{ ...inputStyle, fontFamily: 'monospace' }}
                        placeholder="001"
                        maxLength={3}
                    />
                </div>
                <div>
                    <label style={labelStyle}>Punto de Expedición</label>
                    <input
                        type="text"
                        value={invoice.puntoExpedicion}
                        onChange={(e) => setInvoice({ ...invoice, puntoExpedicion: e.target.value })}
                        style={{ ...inputStyle, fontFamily: 'monospace' }}
                        placeholder="001"
                        maxLength={3}
                    />
                </div>
                <div>
                    <label style={labelStyle}>Rango Autorizado Desde</label>
                    <input
                        type="number"
                        value={invoice.rangoDesde}
                        onChange={(e) => setInvoice({ ...invoice, rangoDesde: parseInt(e.target.value) || 1 })}
                        style={inputStyle}
                        min={1}
                    />
                </div>
                <div>
                    <label style={labelStyle}>Rango Autorizado Hasta</label>
                    <input
                        type="number"
                        value={invoice.rangoHasta}
                        onChange={(e) => setInvoice({ ...invoice, rangoHasta: parseInt(e.target.value) || 1000000 })}
                        style={inputStyle}
                    />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                    <label style={labelStyle}>Siguiente Número de Factura</label>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <input
                            type="number"
                            value={invoice.siguienteNumero}
                            onChange={(e) => setInvoice({ ...invoice, siguienteNumero: parseInt(e.target.value) || 1 })}
                            style={{ ...inputStyle, flex: 1, fontFamily: 'monospace' }}
                            min={invoice.rangoDesde}
                            max={invoice.rangoHasta}
                        />
                        <span style={{ 
                            padding: '12px 16px', 
                            backgroundColor: '#f1f5f9', 
                            borderRadius: '8px',
                            fontFamily: 'monospace',
                            color: '#475569'
                        }}>
                            Vista previa: {formatInvoiceNumber(invoice.siguienteNumero)}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderCurrenciesSection = () => (
        <div>
            <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#1e293b', margin: '0 0 8px 0' }}>
                💰 Monedas Aceptadas
            </h2>
            <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 24px 0' }}>
                Monedas disponibles para productos y facturas
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {currencies.map(currency => (
                    <label 
                        key={currency.code}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px',
                            padding: '16px',
                            backgroundColor: currency.enabled ? '#f0fdf4' : '#f8fafc',
                            border: `2px solid ${currency.enabled ? '#22c55e' : '#e2e8f0'}`,
                            borderRadius: '10px',
                            cursor: 'pointer'
                        }}
                    >
                        <input
                            type="checkbox"
                            checked={currency.enabled}
                            onChange={() => {
                                setCurrencies(prev => prev.map(c => 
                                    c.code === currency.code ? { ...c, enabled: !c.enabled } : c
                                ));
                            }}
                            style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                        />
                        <span style={{ fontSize: '24px', fontWeight: 700, color: currency.enabled ? '#22c55e' : '#94a3b8' }}>
                            {currency.symbol}
                        </span>
                        <div style={{ flex: 1 }}>
                            <span style={{ fontWeight: 600, color: currency.enabled ? '#1e293b' : '#64748b' }}>
                                {currency.code}
                            </span>
                            <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#64748b' }}>
                                {currency.name}
                            </p>
                        </div>
                    </label>
                ))}
            </div>
        </div>
    );

    const renderTaxSection = () => (
        <div>
            <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#1e293b', margin: '0 0 8px 0' }}>
                📊 Configuración de Impuestos
            </h2>
            <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 24px 0' }}>
                Tasas de IVA aplicables a los productos
            </p>

            <div style={{ marginBottom: '24px' }}>
                <label style={labelStyle}>Tasa de IVA por Defecto</label>
                <select
                    value={tax.defaultRate}
                    onChange={(e) => setTax({ ...tax, defaultRate: parseFloat(e.target.value) })}
                    style={inputStyle}
                >
                    {tax.rates.map(rate => (
                        <option key={rate.rate} value={rate.rate}>
                            {rate.name} ({rate.rate}%)
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label style={labelStyle}>Tasas Disponibles</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {tax.rates.map((rate, index) => (
                        <div key={index} style={{ 
                            display: 'flex', 
                            gap: '12px', 
                            alignItems: 'center',
                            padding: '12px',
                            backgroundColor: '#f8fafc',
                            borderRadius: '8px'
                        }}>
                            <input
                                type="text"
                                value={rate.name}
                                onChange={(e) => {
                                    const newRates = [...tax.rates];
                                    newRates[index].name = e.target.value;
                                    setTax({ ...tax, rates: newRates });
                                }}
                                style={{ ...inputStyle, flex: 2 }}
                                placeholder="Nombre"
                            />
                            <input
                                type="number"
                                value={rate.rate}
                                onChange={(e) => {
                                    const newRates = [...tax.rates];
                                    newRates[index].rate = parseFloat(e.target.value) || 0;
                                    setTax({ ...tax, rates: newRates });
                                }}
                                style={{ ...inputStyle, flex: 1 }}
                                placeholder="%"
                                min={0}
                                max={100}
                            />
                            <span style={{ color: '#64748b' }}>%</span>
                            {tax.rates.length > 1 && (
                                <button
                                    onClick={() => setTax({ ...tax, rates: tax.rates.filter((_, i) => i !== index) })}
                                    style={{ ...buttonStyle, backgroundColor: '#fee2e2', color: '#dc2626' }}
                                >
                                    🗑️
                                </button>
                            )}
                        </div>
                    ))}
                </div>
                <button
                    onClick={() => setTax({ ...tax, rates: [...tax.rates, { name: 'Nueva Tasa', rate: 0 }] })}
                    style={{ ...buttonStyle, backgroundColor: '#f1f5f9', color: '#475569', marginTop: '12px' }}
                >
                    + Agregar Tasa
                </button>
            </div>
        </div>
    );

    const renderProductTypesSection = () => (
        <div>
            <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#1e293b', margin: '0 0 8px 0' }}>
                📦 Tipos de Producto
            </h2>
            <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 24px 0' }}>
                Categorías para organizar tus productos
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {productTypes.map((type, index) => (
                    <div key={type.id} style={{ 
                        display: 'flex', 
                        gap: '12px', 
                        alignItems: 'center',
                        padding: '12px',
                        backgroundColor: '#f8fafc',
                        borderRadius: '8px'
                    }}>
                        <input
                            type="text"
                            value={type.icon}
                            onChange={(e) => {
                                const newTypes = [...productTypes];
                                newTypes[index].icon = e.target.value;
                                setProductTypes(newTypes);
                            }}
                            style={{ ...inputStyle, width: '60px', textAlign: 'center', fontSize: '20px' }}
                            maxLength={2}
                        />
                        <input
                            type="text"
                            value={type.name}
                            onChange={(e) => {
                                const newTypes = [...productTypes];
                                newTypes[index].name = e.target.value;
                                setProductTypes(newTypes);
                            }}
                            style={{ ...inputStyle, flex: 1 }}
                            placeholder="Nombre de categoría"
                        />
                        {productTypes.length > 1 && (
                            <button
                                onClick={() => setProductTypes(productTypes.filter((_, i) => i !== index))}
                                style={{ ...buttonStyle, backgroundColor: '#fee2e2', color: '#dc2626' }}
                            >
                                🗑️
                            </button>
                        )}
                    </div>
                ))}
            </div>
            <button
                onClick={() => setProductTypes([...productTypes, { 
                    id: `type_${Date.now()}`, 
                    name: 'Nueva Categoría', 
                    icon: '📁' 
                }])}
                style={{ ...buttonStyle, backgroundColor: '#f1f5f9', color: '#475569', marginTop: '12px' }}
            >
                + Agregar Categoría
            </button>
        </div>
    );

    const renderUnitsSection = () => (
        <div>
            <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#1e293b', margin: '0 0 8px 0' }}>
                📏 Unidades de Medida
            </h2>
            <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 24px 0' }}>
                Unidades para medir cantidades de productos
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {units.map((unit, index) => (
                    <div key={unit.id} style={{ 
                        display: 'flex', 
                        gap: '12px', 
                        alignItems: 'center',
                        padding: '12px',
                        backgroundColor: '#f8fafc',
                        borderRadius: '8px'
                    }}>
                        <input
                            type="text"
                            value={unit.code}
                            onChange={(e) => {
                                const newUnits = [...units];
                                newUnits[index].code = e.target.value.toUpperCase();
                                setUnits(newUnits);
                            }}
                            style={{ ...inputStyle, width: '80px', fontFamily: 'monospace', textTransform: 'uppercase' }}
                            maxLength={5}
                            placeholder="COD"
                        />
                        <input
                            type="text"
                            value={unit.name}
                            onChange={(e) => {
                                const newUnits = [...units];
                                newUnits[index].name = e.target.value;
                                setUnits(newUnits);
                            }}
                            style={{ ...inputStyle, flex: 1 }}
                            placeholder="Nombre completo"
                        />
                        {units.length > 1 && (
                            <button
                                onClick={() => setUnits(units.filter((_, i) => i !== index))}
                                style={{ ...buttonStyle, backgroundColor: '#fee2e2', color: '#dc2626' }}
                            >
                                🗑️
                            </button>
                        )}
                    </div>
                ))}
            </div>
            <button
                onClick={() => setUnits([...units, { 
                    id: `unit_${Date.now()}`, 
                    code: '', 
                    name: '' 
                }])}
                style={{ ...buttonStyle, backgroundColor: '#f1f5f9', color: '#475569', marginTop: '12px' }}
            >
                + Agregar Unidad
            </button>
        </div>
    );

    const renderPaymentsSection = () => (
        <div>
            <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#1e293b', margin: '0 0 8px 0' }}>
                💳 Métodos de Pago
            </h2>
            <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 24px 0' }}>
                Formas de pago aceptadas en tu negocio
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {paymentMethods.map((method) => (
                    <label 
                        key={method.id}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px',
                            padding: '16px',
                            backgroundColor: method.enabled ? '#f0fdf4' : '#f8fafc',
                            border: `2px solid ${method.enabled ? '#22c55e' : '#e2e8f0'}`,
                            borderRadius: '10px',
                            cursor: 'pointer'
                        }}
                    >
                        <input
                            type="checkbox"
                            checked={method.enabled}
                            onChange={() => {
                                setPaymentMethods(prev => prev.map(m => 
                                    m.id === method.id ? { ...m, enabled: !m.enabled } : m
                                ));
                            }}
                            style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                        />
                        <span style={{ fontSize: '24px' }}>{method.icon}</span>
                        <span style={{ flex: 1, fontWeight: 500, color: method.enabled ? '#1e293b' : '#64748b' }}>
                            {method.name}
                        </span>
                    </label>
                ))}
            </div>
        </div>
    );

    const renderAlertsSection = () => (
        <div>
            <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#1e293b', margin: '0 0 8px 0' }}>
                ⚠️ Configuración de Alertas
            </h2>
            <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 24px 0' }}>
                Notificaciones automáticas del sistema
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* Alerta de Stock */}
                <div style={{ 
                    padding: '20px', 
                    backgroundColor: '#f8fafc', 
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0'
                }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                        <input
                            type="checkbox"
                            checked={alerts.lowStockEnabled}
                            onChange={(e) => setAlerts({ ...alerts, lowStockEnabled: e.target.checked })}
                            style={{ width: '20px', height: '20px' }}
                        />
                        <div>
                            <span style={{ fontWeight: 600, color: '#1e293b' }}>📦 Alerta de Stock Bajo</span>
                            <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#64748b' }}>
                                Notificar cuando un producto tenga poco stock
                            </p>
                        </div>
                    </label>
                    {alerts.lowStockEnabled && (
                        <div style={{ marginTop: '16px', marginLeft: '32px' }}>
                            <label style={labelStyle}>Umbral mínimo de unidades</label>
                            <input
                                type="number"
                                value={alerts.lowStockThreshold}
                                onChange={(e) => setAlerts({ ...alerts, lowStockThreshold: parseInt(e.target.value) || 0 })}
                                style={{ ...inputStyle, width: '150px' }}
                                min={1}
                            />
                        </div>
                    )}
                </div>

                {/* Alerta de Timbrado */}
                <div style={{ 
                    padding: '20px', 
                    backgroundColor: '#f8fafc', 
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '20px' }}>🧾</span>
                        <div>
                            <span style={{ fontWeight: 600, color: '#1e293b' }}>Aviso de Vencimiento de Timbrado</span>
                            <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#64748b' }}>
                                Días de anticipación para avisar
                            </p>
                        </div>
                    </div>
                    <div style={{ marginTop: '16px', marginLeft: '32px' }}>
                        <input
                            type="number"
                            value={alerts.timbradoExpiryWarningDays}
                            onChange={(e) => setAlerts({ ...alerts, timbradoExpiryWarningDays: parseInt(e.target.value) || 30 })}
                            style={{ ...inputStyle, width: '100px' }}
                            min={1}
                        />
                        <span style={{ marginLeft: '8px', color: '#64748b' }}>días antes del vencimiento</span>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderAppearanceSection = () => (
        <div>
            <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#1e293b', margin: '0 0 8px 0' }}>
                🎨 Apariencia
            </h2>
            <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 24px 0' }}>
                Personaliza el aspecto visual del sistema
            </p>

            <div style={{ marginBottom: '24px' }}>
                <label style={labelStyle}>Tema</label>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <label style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '24px',
                        backgroundColor: appearance.theme === 'light' ? '#f0fdf4' : '#f8fafc',
                        border: `2px solid ${appearance.theme === 'light' ? '#22c55e' : '#e2e8f0'}`,
                        borderRadius: '12px',
                        cursor: 'pointer'
                    }}>
                        <div style={{
                            width: '60px',
                            height: '40px',
                            backgroundColor: '#ffffff',
                            border: '2px solid #e2e8f0',
                            borderRadius: '8px'
                        }} />
                        <input
                            type="radio"
                            name="theme"
                            checked={appearance.theme === 'light'}
                            onChange={() => setAppearance({ ...appearance, theme: 'light' })}
                        />
                        <span style={{ fontWeight: 500 }}>☀️ Claro</span>
                    </label>
                    <label style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '24px',
                        backgroundColor: appearance.theme === 'dark' ? '#f0fdf4' : '#f8fafc',
                        border: `2px solid ${appearance.theme === 'dark' ? '#22c55e' : '#e2e8f0'}`,
                        borderRadius: '12px',
                        cursor: 'pointer'
                    }}>
                        <div style={{
                            width: '60px',
                            height: '40px',
                            backgroundColor: '#1e293b',
                            border: '2px solid #475569',
                            borderRadius: '8px'
                        }} />
                        <input
                            type="radio"
                            name="theme"
                            checked={appearance.theme === 'dark'}
                            onChange={() => setAppearance({ ...appearance, theme: 'dark' })}
                        />
                        <span style={{ fontWeight: 500 }}>🌙 Oscuro</span>
                    </label>
                </div>
            </div>

            <div>
                <label style={labelStyle}>Color Principal</label>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    {['#4f46e5', '#7c3aed', '#2563eb', '#0891b2', '#059669', '#d97706', '#dc2626', '#db2777'].map(color => (
                        <button
                            key={color}
                            onClick={() => setAppearance({ ...appearance, primaryColor: color })}
                            style={{
                                width: '48px',
                                height: '48px',
                                backgroundColor: color,
                                border: appearance.primaryColor === color ? '4px solid #1e293b' : '2px solid transparent',
                                borderRadius: '12px',
                                cursor: 'pointer'
                            }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );

    const renderContent = () => {
        switch (activeSection) {
            case 'company': return renderCompanySection();
            case 'invoice': return renderInvoiceSection();
            case 'currencies': return renderCurrenciesSection();
            case 'tax': return renderTaxSection();
            case 'productTypes': return renderProductTypesSection();
            case 'units': return renderUnitsSection();
            case 'payments': return renderPaymentsSection();
            case 'alerts': return renderAlertsSection();
            case 'appearance': return renderAppearanceSection();
            default: return null;
        }
    };

    return (
        <div style={{ display: 'flex', height: '100%', minHeight: 'calc(100vh - 64px)' }}>
            {/* Sidebar */}
            <div style={{
                width: '260px',
                backgroundColor: 'white',
                borderRight: '1px solid #e2e8f0',
                padding: '24px 0'
            }}>
                <h1 style={{ 
                    fontSize: '20px', 
                    fontWeight: 700, 
                    color: '#1e293b', 
                    padding: '0 24px 16px',
                    margin: 0,
                    borderBottom: '1px solid #e2e8f0'
                }}>
                    ⚙️ Configuración
                </h1>
                <nav style={{ padding: '16px 12px' }}>
                    {menuSections.map(section => (
                        <button
                            key={section.id}
                            onClick={() => setActiveSection(section.id)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                width: '100%',
                                padding: '12px',
                                border: 'none',
                                borderRadius: '8px',
                                backgroundColor: activeSection === section.id ? '#f1f5f9' : 'transparent',
                                color: activeSection === section.id ? '#1e293b' : '#64748b',
                                fontWeight: activeSection === section.id ? 600 : 400,
                                fontSize: '14px',
                                cursor: 'pointer',
                                textAlign: 'left',
                                marginBottom: '4px',
                                transition: 'all 0.15s'
                            }}
                        >
                            <span style={{ fontSize: '18px' }}>{section.icon}</span>
                            {section.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Content */}
            <div style={{ flex: 1, backgroundColor: '#f8fafc', overflow: 'auto' }}>
                <div style={{ maxWidth: '800px', margin: '0 auto', padding: '32px' }}>
                    <div style={cardStyle}>
                        {renderContent()}
                    </div>

                    {/* Botón Guardar */}
                    <div style={{ 
                        display: 'flex', 
                        justifyContent: 'flex-end', 
                        alignItems: 'center',
                        gap: '16px',
                        position: 'sticky',
                        bottom: '24px'
                    }}>
                        {saved && (
                            <span style={{ 
                                color: '#22c55e', 
                                backgroundColor: '#f0fdf4',
                                padding: '8px 16px',
                                borderRadius: '8px',
                                fontSize: '14px'
                            }}>
                                ✓ Configuración guardada
                            </span>
                        )}
                        <button
                            onClick={saveAll}
                            style={{
                                ...buttonStyle,
                                padding: '14px 32px',
                                fontSize: '16px',
                                backgroundColor: '#4f46e5',
                                color: 'white',
                                boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)'
                            }}
                        >
                            💾 Guardar Todos los Cambios
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
