 import React, { useState, useEffect } from 'react';
 import { motion } from 'framer-motion';
 import { productsApi, Product, getErrorMessage } from '../../services/api';
 import { getEnabledCurrencies, formatMoney } from '../settings/Settings';
 import { LoadingSpinner } from '../ui/LoadingSpinner';
 import { TableSkeleton } from '../ui/TableSkeleton';
 import { ErrorMessage } from '../ui/ErrorMessage';
 import { SuccessMessage } from '../ui/SuccessMessage';
 import { Pagination } from '../ui/Pagination';
 import { ConfirmModal } from '../ui/ConfirmModal';
 import { fadeInUp, staggerContainer } from '../../hooks/useAnimations';

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

const CATEGORY_OPTIONS = [
    { value: '', label: 'Sin categoría' },
    { value: 'fuel', label: 'Combustible' },
    { value: 'lubricants', label: 'Lubricantes' },
    { value: 'snacks', label: 'Snacks / Kiosco' },
    { value: 'other', label: 'Otro' },
];

interface ProductFormData {
    name: string;
    type: string;
    price: string;
    costPrice: string;
    currency: string;
    stock: string;
    minStock: string;
    category: string;
    description: string;
}

const emptyForm: ProductFormData = {
    name: '',
    type: 'fuel',
    price: '',
    costPrice: '',
    currency: 'PYG',
    stock: '',
    minStock: '0',
    category: '',
    description: ''
};

const PAGE_SIZE_OPTIONS = [10, 20, 50];

const ProductList: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [formData, setFormData] = useState<ProductFormData>(emptyForm);
    const [saving, setSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [productToDelete, setProductToDelete] = useState<Product | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    const validateField = (field: string, value: string): string | null => {
        switch (field) {
            case 'name':
                if (!value.trim()) return 'El nombre es requerido';
                if (value.trim().length < 2) return 'El nombre debe tener al menos 2 caracteres';
                if (value.trim().length > 100) return 'El nombre no puede exceder 100 caracteres';
                return null;
            case 'price':
                if (!value) return 'El precio es requerido';
                const priceNum = parseFloat(value);
                if (isNaN(priceNum) || priceNum <= 0) return 'El precio debe ser mayor a 0';
                return null;
            case 'stock':
                if (value && (isNaN(parseInt(value)) || parseInt(value) < 0)) {
                    return 'El stock debe ser un número positivo';
                }
                return null;
            case 'minStock':
                if (value && (isNaN(parseInt(value)) || parseInt(value) < 0)) {
                    return 'El stock mínimo debe ser un número positivo';
                }
                return null;
            case 'costPrice':
                if (value && (isNaN(parseFloat(value)) || parseFloat(value) < 0)) {
                    return 'El precio de costo debe ser un número positivo';
                }
                return null;
            default:
                return null;
        }
    };

    const handleFormChange = (field: keyof ProductFormData, value: string) => {
        setFormData({ ...formData, [field]: value });
        const error = validateField(field, value);
        setFieldErrors(prev => ({
            ...prev,
            [field]: error || ''
        }));
    };
    
    const [searchName, setSearchName] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [filterCategory, setFilterCategory] = useState('all');

    const loadProducts = async (pageNum: number = page) => {
        try {
            setLoading(true);
            setError(null);
            const { data, total: totalCount } = await productsApi.getPage(pageNum, pageSize, {
                search: searchName || undefined,
                type: filterType !== 'all' ? filterType : undefined,
                category: filterCategory !== 'all' ? filterCategory : undefined,
            });
            setProducts(data);
            setTotal(totalCount);
        } catch (err) {
            setError(getErrorMessage(err, 'Error al cargar productos'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProducts(page);
    }, [page, searchName, filterType, filterCategory]);

    const goToPage = (newPage: number) => {
        setPage(newPage);
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
            costPrice: product.costPrice != null ? String(product.costPrice) : '',
            currency: product.currency ?? 'PYG',
            stock: String(product.stock),
            minStock: product.minStock != null ? String(product.minStock) : '0',
            category: product.category || '',
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
        
        const errors: Record<string, string> = {};
        ['name', 'price', 'stock', 'minStock', 'costPrice'].forEach(field => {
            const error = validateField(field, formData[field as keyof ProductFormData]);
            if (error) errors[field] = error;
        });
        
        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            return;
        }
        
        setSaving(true);

        try {
            const productData = {
                name: formData.name,
                type: formData.type,
                price: parseFloat(formData.price),
                costPrice: formData.costPrice ? parseFloat(formData.costPrice) : undefined,
                currency: formData.currency,
                stock: parseInt(formData.stock),
                minStock: parseInt(formData.minStock, 10) || 0,
                category: formData.category || undefined,
                description: formData.description || undefined
            };

            if (editingProduct) {
                await productsApi.update(editingProduct.id, productData);
                setSuccessMessage('Producto actualizado');
            } else {
                await productsApi.create(productData);
                setSuccessMessage('Producto creado');
            }

            closeModal();
            loadProducts();
        } catch (err) {
            setError(getErrorMessage(err, 'Error al guardar'));
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteClick = (product: Product) => {
        setProductToDelete(product);
    };

    const handleDeleteConfirm = async () => {
        if (!productToDelete) return;
        try {
            setDeleting(true);
            await productsApi.delete(productToDelete.id);
            setSuccessMessage('Producto eliminado');
            setProductToDelete(null);
            loadProducts(page);
        } catch (err) {
            setError(getErrorMessage(err, 'Error al eliminar'));
        } finally {
            setDeleting(false);
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
            <div className="responsive-padding" style={{ padding: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                    <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#1e293b', margin: 0 }}>📦 Productos</h1>
                </div>
                <TableSkeleton rows={6} cols={6} message="Cargando productos..." />
            </div>
        );
    }

    return (
        <motion.div 
            className="responsive-padding" 
            style={{ padding: '32px' }}
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
        >
            {/* Header */}
            <motion.div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'flex-start',
                marginBottom: '24px',
                flexWrap: 'wrap',
                gap: '16px'
            }} variants={fadeInUp}>
                <div>
                    <h1 style={{ fontSize: 'clamp(22px, 5vw, 28px)', fontWeight: 700, color: '#1e293b', margin: 0 }}>
                        Productos
                    </h1>
                    <p style={{ fontSize: '14px', color: '#64748b', margin: '4px 0 0 0' }}>
                        {products.length} productos en inventario
                    </p>
                </div>
                 <motion.div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }} variants={staggerContainer}>
                     <motion.button
                         type="button"
                         onClick={() => productsApi.exportExcel()}
                         style={{
                             padding: '10px 20px',
                             backgroundColor: '#14532d',
                             color: 'white',
                             border: 'none',
                             borderRadius: '8px',
                             fontWeight: 600,
                             cursor: 'pointer',
                         }}
                         title="Exportar productos a Excel"
                         whileHover={{ scale: 1.02 }}
                         whileTap={{ scale: 0.98 }}
                     >
                         📊 Exportar Excel
                     </motion.button>
                     <motion.button 
                        onClick={openCreateModal}
                        style={{
                            ...buttonStyle,
                            padding: '12px 20px',
                            backgroundColor: '#4f46e5',
                            color: 'white',
                            whiteSpace: 'nowrap'
                        }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        + Nuevo Producto
                    </motion.button>
                </motion.div>
            </motion.div>

            {successMessage && (
                <SuccessMessage
                    message={successMessage}
                    onDismiss={() => setSuccessMessage(null)}
                    autoDismissMs={4000}
                />
            )}
            {error && (
                <ErrorMessage
                    message={error}
                    onRetry={loadProducts}
                    onDismiss={() => setError(null)}
                />
            )}

            {/* Barra de Filtros */}
            {(total > 0 || searchName || filterType !== 'all' || filterCategory !== 'all') && (
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    padding: '16px',
                    marginBottom: '16px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }}>
                    <div style={{
                        display: 'flex',
                        gap: '12px',
                        alignItems: 'center',
                        flexWrap: 'wrap'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '1 1 200px', minWidth: '150px' }}>
                            <span style={{ fontSize: '20px' }}>🔍</span>
                            <input
                                type="text"
                                placeholder="Buscar..."
                                value={searchName}
                                onChange={(e) => { setSearchName(e.target.value); setPage(1); }}
                                style={{
                                    padding: '10px 12px',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    width: '100%',
                                    outline: 'none'
                                }}
                            />
                        </div>
                        <select
                            value={filterType}
                            onChange={(e) => { setFilterType(e.target.value); setPage(1); }}
                            style={{
                                padding: '10px 12px',
                                border: '1px solid #e2e8f0',
                                borderRadius: '8px',
                                fontSize: '14px',
                                backgroundColor: 'white',
                                cursor: 'pointer',
                                minWidth: '120px'
                            }}
                        >
                            <option value="all">Todos los tipos</option>
                            <option value="fuel">Combustible</option>
                            <option value="other">Otro</option>
                        </select>
                        <select
                            value={filterCategory}
                            onChange={(e) => { setFilterCategory(e.target.value); setPage(1); }}
                            style={{
                                padding: '10px 12px',
                                border: '1px solid #e2e8f0',
                                borderRadius: '8px',
                                fontSize: '14px',
                                backgroundColor: 'white',
                                cursor: 'pointer',
                                minWidth: '140px'
                            }}
                        >
                            <option value="all">Todas las categorías</option>
                            {CATEGORY_OPTIONS.filter(o => o.value).map(o => (
                                <option key={o.value} value={o.value}>{o.label}</option>
                            ))}
                        </select>
                        {(searchName || filterType !== 'all' || filterCategory !== 'all') && (
                            <button
                                onClick={() => { setSearchName(''); setFilterType('all'); setFilterCategory('all'); setPage(1); }}
                                style={{
                                    ...buttonStyle,
                                    backgroundColor: '#f1f5f9',
                                    color: '#64748b',
                                    fontSize: '12px',
                                    padding: '10px 12px'
                                }}
                            >
                                ✕ Limpiar
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Tabla */}
            {!loading && total === 0 && !error ? (
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    padding: '48px',
                    textAlign: 'center',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }}>
                    <p style={{ fontSize: '48px', margin: '0 0 16px 0' }}>📦</p>
                    <p style={{ color: '#1e293b', fontSize: '18px', fontWeight: 600, margin: '0 0 8px 0' }}>No hay productos registrados</p>
                    <p style={{ color: '#64748b', margin: '0 0 16px 0' }}>Agregá productos para vender y controlar stock.</p>
                    <button onClick={openCreateModal} style={{ ...buttonStyle, backgroundColor: '#4f46e5', color: 'white' }}>
                        Crear primer producto
                    </button>
                </div>
            ) : (
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                    overflowX: 'auto',
                    WebkitOverflowScrolling: 'touch'
                }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f8fafc' }}>
                                <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600, color: '#475569', fontSize: '14px' }}>ID</th>
                                <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600, color: '#475569', fontSize: '14px' }}>Nombre</th>
                                <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600, color: '#475569', fontSize: '14px' }}>Tipo</th>
                                <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600, color: '#475569', fontSize: '14px' }}>Categoría</th>
                                <th style={{ padding: '16px', textAlign: 'right', fontWeight: 600, color: '#475569', fontSize: '14px' }}>Precio</th>
                                <th style={{ padding: '16px', textAlign: 'right', fontWeight: 600, color: '#475569', fontSize: '14px' }}>Costo</th>
                                <th style={{ padding: '16px', textAlign: 'right', fontWeight: 600, color: '#475569', fontSize: '14px' }}>Stock</th>
                                <th style={{ padding: '16px', textAlign: 'center', fontWeight: 600, color: '#475569', fontSize: '14px' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((product) => (
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
                                    <td style={{ padding: '16px', fontSize: '13px', color: '#64748b' }}>
                                        {CATEGORY_OPTIONS.find(c => c.value === (product.category || ''))?.label || product.category || '—'}
                                    </td>
                                    <td style={{ padding: '16px', textAlign: 'right', fontWeight: 600, color: '#1e293b' }}>
                                        {formatMoney(Number(product.price), product.currency ?? 'PYG')}
                                    </td>
                                    <td style={{ padding: '16px', textAlign: 'right', fontSize: '13px', color: '#64748b' }}>
                                        {product.costPrice != null ? formatMoney(Number(product.costPrice), product.currency ?? 'PYG') : '—'}
                                    </td>
                                    <td style={{ 
                                        padding: '16px', 
                                        textAlign: 'right', 
                                        color: (product.minStock != null && product.minStock > 0 && product.stock < product.minStock) ? '#dc2626' : product.stock < 100 ? '#b45309' : '#64748b',
                                        fontWeight: (product.minStock != null && product.minStock > 0 && product.stock < product.minStock) ? 600 : 400
                                    }}>
                                        {product.stock.toLocaleString()} un.
                                        {(product.minStock != null && product.minStock > 0 && product.stock < product.minStock) && (
                                            <span style={{ display: 'block', fontSize: '11px', color: '#dc2626' }}>Mín: {product.minStock}</span>
                                        )}
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
                                            onClick={() => handleDeleteClick(product)}
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
                    <div style={{ padding: '0 16px 16px' }}>
                        <Pagination
                            page={page}
                            limit={pageSize}
                            total={total}
                            onPageChange={goToPage}
                            onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
                            label="productos"
                        />
                    </div>
                </div>
            )}

            <ConfirmModal
                open={productToDelete !== null}
                title="Eliminar producto"
                message={productToDelete ? `¿Eliminar el producto "${productToDelete.name}"? No se puede deshacer.` : ''}
                confirmLabel="Eliminar"
                variant="danger"
                loading={deleting}
                onConfirm={handleDeleteConfirm}
                onCancel={() => setProductToDelete(null)}
            />

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
                    zIndex: 1000,
                    padding: window.innerWidth < 768 ? 0 : '16px'
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: window.innerWidth < 768 ? 0 : '16px',
                        padding: window.innerWidth < 768 ? '20px' : '32px',
                        width: '100%',
                        maxWidth: window.innerWidth < 768 ? '100%' : '500px',
                        height: window.innerWidth < 768 ? '100%' : 'auto',
                        maxHeight: window.innerWidth < 768 ? '100%' : '90vh',
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
                                    onChange={(e) => handleFormChange('name', e.target.value)}
                                    required
                                    style={inputStyle}
                                    placeholder="Ej: Gasolina Premium"
                                />
                                {fieldErrors.name && <span style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px', display: 'block' }}>{fieldErrors.name}</span>}
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={labelStyle}>Tipo *</label>
                                <select
                                    value={formData.type}
                                    onChange={(e) => handleFormChange('type', e.target.value)}
                                    required
                                    style={inputStyle}
                                >
                                    <option value="fuel">Combustible</option>
                                    <option value="other">Otro</option>
                                </select>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                                <div>
                                    <label style={labelStyle}>Precio venta *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={formData.price}
                                        onChange={(e) => handleFormChange('price', e.target.value)}
                                        required
                                        style={inputStyle}
                                        placeholder="0.00"
                                    />
                                    {fieldErrors.price && <span style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px', display: 'block' }}>{fieldErrors.price}</span>}
                                </div>
                                <div>
                                    <label style={labelStyle}>Costo (opcional)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={formData.costPrice}
                                        onChange={(e) => handleFormChange('costPrice', e.target.value)}
                                        style={inputStyle}
                                        placeholder="Para margen"
                                    />
                                    {fieldErrors.costPrice && <span style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px', display: 'block' }}>{fieldErrors.costPrice}</span>}
                                </div>
                                <div>
                                    <label style={labelStyle}>Moneda *</label>
                                    <select
                                        value={formData.currency}
                                        onChange={(e) => handleFormChange('currency', e.target.value)}
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
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                                <div>
                                    <label style={labelStyle}>Stock actual *</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={formData.stock}
                                        onChange={(e) => handleFormChange('stock', e.target.value)}
                                        required
                                        style={inputStyle}
                                        placeholder="0"
                                    />
                                    {fieldErrors.stock && <span style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px', display: 'block' }}>{fieldErrors.stock}</span>}
                                </div>
                                <div>
                                    <label style={labelStyle}>Stock mínimo</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={formData.minStock}
                                        onChange={(e) => handleFormChange('minStock', e.target.value)}
                                        style={inputStyle}
                                        placeholder="0"
                                    />
                                    {fieldErrors.minStock && <span style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px', display: 'block' }}>{fieldErrors.minStock}</span>}
                                </div>
                                <div>
                                    <label style={labelStyle}>Categoría</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        style={inputStyle}
                                    >
                                        {CATEGORY_OPTIONS.map(o => (
                                            <option key={o.value || 'none'} value={o.value}>{o.label}</option>
                                        ))}
                                    </select>
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
        </motion.div>
    );
};

export default ProductList;
