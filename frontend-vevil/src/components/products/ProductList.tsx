import React, { useState, useEffect } from 'react';
import { productsApi, Product } from '../../services/api';
import { getEnabledCurrencies, formatMoney } from '../settings/Settings';

// Estilos comunes
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

interface ProductFormData {
    name: string;
    type: string;
    price: string;
    currency: string;
    stock: string;
    description: string;
}

const emptyForm: ProductFormData = {
    name: '',
    type: 'fuel',
    price: '',
    currency: 'PYG',
    stock: '',
    description: ''
};

const ProductList: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [formData, setFormData] = useState<ProductFormData>(emptyForm);
    const [saving, setSaving] = useState(false);
    
    // Filtros
    const [searchName, setSearchName] = useState('');
    const [filterType, setFilterType] = useState('all');

    // Productos filtrados
    const filteredProducts = products.filter(product => {
        const matchesName = product.name.toLowerCase().includes(searchName.toLowerCase());
        const matchesType = filterType === 'all' || product.type === filterType;
        return matchesName && matchesType;
    });

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await productsApi.getAll();
            setProducts(data);
        } catch (err: any) {
            setError(err.message || 'Error al cargar productos');
        } finally {
            setLoading(false);
        }
    };

    const openCreateModal = () => {
        setEditingProduct(null);
        setFormData(emptyForm);
        setShowModal(true);
    };

    const openEditModal = (product: Product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            type: product.type,
            price: String(product.price),
            currency: (product as any).currency || 'PYG',
            stock: String(product.stock),
            description: product.description || ''
        });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingProduct(null);
        setFormData(emptyForm);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const productData = {
                name: formData.name,
                type: formData.type,
                price: parseFloat(formData.price),
                currency: formData.currency,
                stock: parseInt(formData.stock),
                description: formData.description || undefined
            };

            if (editingProduct) {
                await productsApi.update(editingProduct.id, productData);
            } else {
                await productsApi.create(productData);
            }

            closeModal();
            loadProducts();
        } catch (err: any) {
            alert(err.message || 'Error al guardar');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (product: Product) => {
        if (!confirm(`¿Eliminar "${product.name}"?`)) return;

        try {
            await productsApi.delete(product.id);
            loadProducts();
        } catch (err: any) {
            alert(err.message || 'Error al eliminar');
        }
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'fuel': return 'Combustible';
            case 'other': return 'Otro';
            default: return type;
        }
    };

    const getTypeStyle = (type: string): React.CSSProperties => {
        return type === 'fuel' 
            ? { backgroundColor: '#dbeafe', color: '#1e40af' }
            : { backgroundColor: '#dcfce7', color: '#166534' };
    };

    if (loading) {
        return (
            <div style={{ padding: '32px', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ 
                        width: '48px', 
                        height: '48px', 
                        border: '4px solid #e2e8f0',
                        borderTopColor: '#4f46e5',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 16px'
                    }} />
                    <p style={{ color: '#64748b' }}>Cargando productos...</p>
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </div>
            </div>
        );
    }

    return (
        <div style={{ padding: '32px' }}>
            {/* Header */}
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '24px'
            }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#1e293b', margin: 0 }}>
                        Productos
                    </h1>
                    <p style={{ fontSize: '16px', color: '#64748b', margin: '4px 0 0 0' }}>
                        {products.length} productos en inventario
                    </p>
                </div>
                <button 
                    onClick={openCreateModal}
                    style={{
                        ...buttonStyle,
                        padding: '12px 24px',
                        backgroundColor: '#4f46e5',
                        color: 'white',
                    }}
                >
                    + Nuevo Producto
                </button>
            </div>

            {error && (
                <div style={{
                    backgroundColor: '#fee2e2',
                    border: '1px solid #fecaca',
                    borderRadius: '12px',
                    padding: '16px',
                    marginBottom: '24px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <p style={{ color: '#991b1b', margin: 0 }}>❌ {error}</p>
                    <button onClick={loadProducts} style={{ ...buttonStyle, backgroundColor: '#4f46e5', color: 'white' }}>
                        Reintentar
                    </button>
                </div>
            )}

            {/* Barra de Filtros */}
            {products.length > 0 && (
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    padding: '16px',
                    marginBottom: '16px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                    display: 'flex',
                    gap: '16px',
                    alignItems: 'center',
                    flexWrap: 'wrap'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '20px' }}>🔍</span>
                        <input
                            type="text"
                            placeholder="Buscar por nombre..."
                            value={searchName}
                            onChange={(e) => setSearchName(e.target.value)}
                            style={{
                                padding: '10px 16px',
                                border: '1px solid #e2e8f0',
                                borderRadius: '8px',
                                fontSize: '14px',
                                width: '250px',
                                outline: 'none'
                            }}
                        />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '14px', color: '#64748b' }}>Tipo:</span>
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            style={{
                                padding: '10px 16px',
                                border: '1px solid #e2e8f0',
                                borderRadius: '8px',
                                fontSize: '14px',
                                backgroundColor: 'white',
                                cursor: 'pointer'
                            }}
                        >
                            <option value="all">Todos</option>
                            <option value="fuel">Combustible</option>
                            <option value="other">Otro</option>
                        </select>
                    </div>
                    {(searchName || filterType !== 'all') && (
                        <button
                            onClick={() => { setSearchName(''); setFilterType('all'); }}
                            style={{
                                ...buttonStyle,
                                backgroundColor: '#f1f5f9',
                                color: '#64748b',
                                fontSize: '12px'
                            }}
                        >
                            ✕ Limpiar filtros
                        </button>
                    )}
                    <span style={{ marginLeft: 'auto', fontSize: '14px', color: '#64748b' }}>
                        Mostrando {filteredProducts.length} de {products.length}
                    </span>
                </div>
            )}

            {/* Tabla */}
            {products.length === 0 ? (
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    padding: '48px',
                    textAlign: 'center',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }}>
                    <p style={{ fontSize: '48px', margin: '0 0 16px 0' }}>📦</p>
                    <p style={{ color: '#64748b', margin: '0 0 16px 0' }}>No hay productos registrados</p>
                    <button onClick={openCreateModal} style={{ ...buttonStyle, backgroundColor: '#4f46e5', color: 'white' }}>
                        Crear primer producto
                    </button>
                </div>
            ) : (
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f8fafc' }}>
                                <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600, color: '#475569', fontSize: '14px' }}>ID</th>
                                <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600, color: '#475569', fontSize: '14px' }}>Nombre</th>
                                <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600, color: '#475569', fontSize: '14px' }}>Tipo</th>
                                <th style={{ padding: '16px', textAlign: 'right', fontWeight: 600, color: '#475569', fontSize: '14px' }}>Precio</th>
                                <th style={{ padding: '16px', textAlign: 'right', fontWeight: 600, color: '#475569', fontSize: '14px' }}>Stock</th>
                                <th style={{ padding: '16px', textAlign: 'center', fontWeight: 600, color: '#475569', fontSize: '14px' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.map((product) => (
                                <tr key={product.id} style={{ borderTop: '1px solid #e2e8f0' }}>
                                    <td style={{ padding: '16px', color: '#64748b' }}>#{product.id}</td>
                                    <td style={{ padding: '16px' }}>
                                        <div>
                                            <span style={{ fontWeight: 500, color: '#1e293b' }}>{product.name}</span>
                                            {product.description && (
                                                <p style={{ fontSize: '12px', color: '#94a3b8', margin: '4px 0 0 0' }}>
                                                    {product.description}
                                                </p>
                                            )}
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px' }}>
                                        <span style={{
                                            ...getTypeStyle(product.type),
                                            padding: '4px 12px',
                                            borderRadius: '9999px',
                                            fontSize: '12px',
                                            fontWeight: 500
                                        }}>
                                            {getTypeLabel(product.type)}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px', textAlign: 'right', fontWeight: 600, color: '#1e293b' }}>
                                        {formatMoney(Number(product.price), (product as any).currency || 'PYG')}
                                    </td>
                                    <td style={{ 
                                        padding: '16px', 
                                        textAlign: 'right', 
                                        color: product.stock < 100 ? '#dc2626' : '#64748b',
                                        fontWeight: product.stock < 100 ? 600 : 400
                                    }}>
                                        {product.stock.toLocaleString()} un.
                                    </td>
                                    <td style={{ padding: '16px', textAlign: 'center' }}>
                                        <button
                                            onClick={() => openEditModal(product)}
                                            style={{
                                                ...buttonStyle,
                                                backgroundColor: '#f1f5f9',
                                                color: '#475569',
                                                marginRight: '8px'
                                            }}
                                        >
                                            ✏️ Editar
                                        </button>
                                        <button
                                            onClick={() => handleDelete(product)}
                                            style={{
                                                ...buttonStyle,
                                                backgroundColor: '#fee2e2',
                                                color: '#dc2626'
                                            }}
                                        >
                                            🗑️ Eliminar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '16px',
                        padding: '32px',
                        width: '100%',
                        maxWidth: '500px',
                        maxHeight: '90vh',
                        overflow: 'auto'
                    }}>
                        <h2 style={{ margin: '0 0 24px 0', fontSize: '24px', fontWeight: 600, color: '#1e293b' }}>
                            {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
                        </h2>

                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={labelStyle}>Nombre *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    style={inputStyle}
                                    placeholder="Ej: Gasolina Premium"
                                />
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={labelStyle}>Tipo *</label>
                                <select
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    required
                                    style={inputStyle}
                                >
                                    <option value="fuel">Combustible</option>
                                    <option value="other">Otro</option>
                                </select>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                                <div>
                                    <label style={labelStyle}>Precio *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        required
                                        style={inputStyle}
                                        placeholder="0.00"
                                    />
                                </div>
                                <div>
                                    <label style={labelStyle}>Moneda *</label>
                                    <select
                                        value={formData.currency}
                                        onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                                        required
                                        style={inputStyle}
                                    >
                                        {getEnabledCurrencies().map(c => (
                                            <option key={c.code} value={c.code}>
                                                {c.symbol} {c.code}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label style={labelStyle}>Stock *</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={formData.stock}
                                        onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                        required
                                        style={inputStyle}
                                        placeholder="0"
                                    />
                                </div>
                            </div>

                            <div style={{ marginBottom: '24px' }}>
                                <label style={labelStyle}>Descripción</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
                                    placeholder="Descripción opcional del producto"
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    style={{
                                        ...buttonStyle,
                                        backgroundColor: '#f1f5f9',
                                        color: '#475569',
                                        padding: '12px 24px'
                                    }}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    style={{
                                        ...buttonStyle,
                                        backgroundColor: saving ? '#9ca3af' : '#4f46e5',
                                        color: 'white',
                                        padding: '12px 24px'
                                    }}
                                >
                                    {saving ? 'Guardando...' : (editingProduct ? 'Actualizar' : 'Crear')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductList;
