import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { suppliersApi, Supplier, getErrorMessage } from '../../services/api';
import { TableSkeleton } from '../ui/TableSkeleton';
import { ErrorMessage } from '../ui/ErrorMessage';
import { SuccessMessage } from '../ui/SuccessMessage';
import { Pagination } from '../ui/Pagination';
import { ConfirmModal } from '../ui/ConfirmModal';
import { fadeInUp } from '../../hooks/useAnimations';

const PAGE_SIZE_OPTIONS = [10, 20, 50];

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

interface SupplierFormData {
    name: string;
    email: string;
    phone: string;
    contact_person: string;
    address_street: string;
    address_city: string;
    address_province: string;
    tax_id: string;
    notes: string;
    is_active: boolean;
}

const emptyForm: SupplierFormData = {
    name: '',
    email: '',
    phone: '',
    contact_person: '',
    address_street: '',
    address_city: '',
    address_province: '',
    tax_id: '',
    notes: '',
    is_active: true
};

const SuppliersList: React.FC = () => {
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [total, setTotal] = useState(0);
    
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
    const [formData, setFormData] = useState<SupplierFormData>(emptyForm);
    const [saving, setSaving] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<Supplier | null>(null);

    useEffect(() => {
        loadSuppliers();
    }, [page, limit]);

    const loadSuppliers = async () => {
        try {
            setLoading(true);
            setError(null);
            const allSuppliers = await suppliersApi.getAll();
            
            let filtered = allSuppliers;
            if (search.trim()) {
                const searchLower = search.toLowerCase();
                filtered = allSuppliers.filter(s => 
                    s.name.toLowerCase().includes(searchLower) ||
                    s.email.toLowerCase().includes(searchLower) ||
                    (s.contact_person && s.contact_person.toLowerCase().includes(searchLower))
                );
            }
            
            setTotal(filtered.length);
            const start = (page - 1) * limit;
            setSuppliers(filtered.slice(start, start + limit));
        } catch (err: any) {
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (value: string) => {
        setSearch(value);
        setPage(1);
    };

    const openCreate = () => {
        setEditingSupplier(null);
        setFormData(emptyForm);
        setShowModal(true);
    };

    const openEdit = (supplier: Supplier) => {
        setEditingSupplier(supplier);
        setFormData({
            name: supplier.name,
            email: supplier.email,
            phone: supplier.phones?.[0]?.number || '',
            contact_person: supplier.contact_person || '',
            address_street: supplier.address_street || '',
            address_city: supplier.address_city || '',
            address_province: supplier.address_province || '',
            tax_id: supplier.tax_id || '',
            notes: supplier.notes || '',
            is_active: supplier.is_active
        });
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSaving(true);
            setError(null);
            
            const data = {
                name: formData.name,
                email: formData.email,
                phones: formData.phone ? [{ type: 'Principal', number: formData.phone }] : [],
                contact_person: formData.contact_person || null,
                address_street: formData.address_street || null,
                address_city: formData.address_city || null,
                address_province: formData.address_province || null,
                tax_id: formData.tax_id || null,
                notes: formData.notes || null,
                is_active: formData.is_active
            };

            if (editingSupplier) {
                await suppliersApi.update(editingSupplier.id, data);
                setSuccess('Proveedor actualizado correctamente');
            } else {
                await suppliersApi.create(data as any);
                setSuccess('Proveedor creado correctamente');
            }
            
            setShowModal(false);
            loadSuppliers();
        } catch (err: any) {
            setError(getErrorMessage(err));
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteConfirm) return;
        try {
            setError(null);
            await suppliersApi.delete(deleteConfirm.id);
            setSuccess('Proveedor eliminado correctamente');
            setDeleteConfirm(null);
            loadSuppliers();
        } catch (err: any) {
            setError(getErrorMessage(err));
        }
    };

    const getPhoneNumber = (supplier: Supplier): string => {
        return supplier.phones?.[0]?.number || '—';
    };

    return (
        <motion.div 
            className="responsive-padding" 
            style={{ padding: '32px' }}
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                <h1 style={{ fontSize: 'clamp(24px, 5vw, 32px)', fontWeight: 700, color: '#1e293b', margin: 0 }}>
                    🚚 Proveedores
                </h1>
                <button
                    onClick={openCreate}
                    style={{
                        ...buttonStyle,
                        backgroundColor: '#22c55e',
                        color: 'white',
                        padding: '12px 20px',
                        fontSize: '15px'
                    }}
                >
                    + Nuevo Proveedor
                </button>
            </div>

            {success && <SuccessMessage message={success} onClose={() => setSuccess(null)} />}
            {error && <ErrorMessage message={error} onClose={() => setError(null)} />}

            <div style={{ marginBottom: '20px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <input
                    type="text"
                    placeholder="Buscar proveedores..."
                    value={search}
                    onChange={(e) => handleSearch(e.target.value)}
                    style={{ ...inputStyle, maxWidth: '300px' }}
                />
            </div>

            {loading ? (
                <TableSkeleton columns={6} rows={5} />
            ) : suppliers.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚚</div>
                    <p style={{ fontSize: '16px' }}>No hay proveedores registrados</p>
                    <button onClick={openCreate} style={{ ...buttonStyle, backgroundColor: '#22c55e', color: 'white', marginTop: '16px' }}>
                        Crear primer proveedor
                    </button>
                </div>
            ) : (
                <>
                    <div style={{ overflowX: 'auto', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                                    <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: '#475569' }}>Nombre</th>
                                    <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: '#475569' }}>Email</th>
                                    <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: '#475569' }}>Teléfono</th>
                                    <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: '#475569' }}>Contacto</th>
                                    <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: '#475569' }}>Ciudad</th>
                                    <th style={{ padding: '14px 16px', textAlign: 'center', fontSize: '13px', fontWeight: 600, color: '#475569' }}>Estado</th>
                                    <th style={{ padding: '14px 16px', textAlign: 'center', fontSize: '13px', fontWeight: 600, color: '#475569' }}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {suppliers.map((supplier, i) => (
                                    <tr key={supplier.id} style={{ borderBottom: i < suppliers.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                                        <td style={{ padding: '14px 16px', fontSize: '14px', color: '#1e293b' }}>
                                            <strong>{supplier.name}</strong>
                                        </td>
                                        <td style={{ padding: '14px 16px', fontSize: '14px', color: '#475569' }}>{supplier.email}</td>
                                        <td style={{ padding: '14px 16px', fontSize: '14px', color: '#475569' }}>{getPhoneNumber(supplier)}</td>
                                        <td style={{ padding: '14px 16px', fontSize: '14px', color: '#475569' }}>{supplier.contact_person || '—'}</td>
                                        <td style={{ padding: '14px 16px', fontSize: '14px', color: '#475569' }}>{supplier.address_city || '—'}</td>
                                        <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                                            <span style={{
                                                padding: '4px 10px',
                                                borderRadius: '12px',
                                                fontSize: '12px',
                                                fontWeight: 500,
                                                backgroundColor: supplier.is_active ? '#dcfce7' : '#f1f5f9',
                                                color: supplier.is_active ? '#166534' : '#64748b'
                                            }}>
                                                {supplier.is_active ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                                            <button onClick={() => openEdit(supplier)} style={{ ...buttonStyle, backgroundColor: '#3b82f6', color: 'white', marginRight: '8px', padding: '6px 12px' }}>
                                                ✏️
                                            </button>
                                            <button onClick={() => setDeleteConfirm(supplier)} style={{ ...buttonStyle, backgroundColor: '#fee2e2', color: '#dc2626', padding: '6px 12px' }}>
                                                🗑️
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', flexWrap: 'wrap', gap: '12px' }}>
                        <Pagination
                            currentPage={page}
                            totalPages={Math.ceil(total / limit)}
                            onPageChange={setPage}
                        />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '14px', color: '#64748b' }}>Mostrar:</span>
                            <select
                                value={limit}
                                onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                                style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px' }}
                            >
                                {PAGE_SIZE_OPTIONS.map(n => <option key={n} value={n}>{n}</option>)}
                            </select>
                        </div>
                    </div>
                </>
            )}

            {showModal && (
                <div style={{
                    position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px'
                }} onClick={() => setShowModal(false)}>
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }} 
                        animate={{ opacity: 1, scale: 1 }}
                        style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflow: 'auto' }}
                        onClick={(e: any) => e.stopPropagation()}
                    >
                        <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#1e293b', marginBottom: '20px' }}>
                            {editingSupplier ? '✏️ Editar Proveedor' : '➕ Nuevo Proveedor'}
                        </h2>
                        <form onSubmit={handleSubmit}>
                            <div style={{ display: 'grid', gap: '16px' }}>
                                <div>
                                    <label style={labelStyle}>Nombre *</label>
                                    <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} style={inputStyle} required />
                                </div>
                                <div>
                                    <label style={labelStyle}>Email *</label>
                                    <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} style={inputStyle} required />
                                </div>
                                <div>
                                    <label style={labelStyle}>Teléfono</label>
                                    <input type="text" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} style={inputStyle} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Persona de Contacto</label>
                                    <input type="text" value={formData.contact_person} onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })} style={inputStyle} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Dirección</label>
                                    <input type="text" value={formData.address_street} onChange={(e) => setFormData({ ...formData, address_street: e.target.value })} style={inputStyle} />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <div>
                                        <label style={labelStyle}>Ciudad</label>
                                        <input type="text" value={formData.address_city} onChange={(e) => setFormData({ ...formData, address_city: e.target.value })} style={inputStyle} />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Provincia/Depto</label>
                                        <input type="text" value={formData.address_province} onChange={(e) => setFormData({ ...formData, address_province: e.target.value })} style={inputStyle} />
                                    </div>
                                </div>
                                <div>
                                    <label style={labelStyle}>RUC/CUIT</label>
                                    <input type="text" value={formData.tax_id} onChange={(e) => setFormData({ ...formData, tax_id: e.target.value })} style={inputStyle} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Notas</label>
                                    <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} style={{ ...inputStyle, minHeight: '80px' }} />
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <input type="checkbox" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} />
                                    <label style={{ fontSize: '14px', color: '#374151' }}>Proveedor activo</label>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'flex-end' }}>
                                <button type="button" onClick={() => setShowModal(false)} style={{ ...buttonStyle, backgroundColor: '#f1f5f9', color: '#475569' }}>
                                    Cancelar
                                </button>
                                <button type="submit" disabled={saving} style={{ ...buttonStyle, backgroundColor: saving ? '#9ca3af' : '#22c55e', color: 'white' }}>
                                    {saving ? 'Guardando...' : (editingSupplier ? 'Actualizar' : 'Crear')}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}

            {deleteConfirm && (
                <ConfirmModal
                    title="¿Eliminar proveedor?"
                    message={`¿Estás seguro de eliminar "${deleteConfirm.name}"? Esta acción no se puede deshacer.`}
                    confirmText="Eliminar"
                    onConfirm={handleDelete}
                    onCancel={() => setDeleteConfirm(null)}
                />
            )}
        </motion.div>
    );
};

export default SuppliersList;