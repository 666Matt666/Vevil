import React, { useState, useEffect } from 'react';
import { customersApi, Customer } from '../../services/api';

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

// Departamentos de Paraguay
const departamentosParaguay = [
    'Asunción',
    'Concepción',
    'San Pedro',
    'Cordillera',
    'Guairá',
    'Caaguazú',
    'Caazapá',
    'Itapúa',
    'Misiones',
    'Paraguarí',
    'Alto Paraná',
    'Central',
    'Ñeembucú',
    'Amambay',
    'Canindeyú',
    'Presidente Hayes',
    'Boquerón',
    'Alto Paraguay'
];

interface CustomerFormData {
    name: string;
    email: string;
    phone: string;
    ci: string;  // Cédula de Identidad
    address_street: string;
    address_city: string;
    address_department: string;  // Departamento
    ruc: string;  // RUC paraguayo
}

const emptyForm: CustomerFormData = {
    name: '',
    email: '',
    phone: '',
    ci: '',
    address_street: '',
    address_city: '',
    address_department: '',
    ruc: ''
};

const CustomerList: React.FC = () => {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
    const [formData, setFormData] = useState<CustomerFormData>(emptyForm);
    const [saving, setSaving] = useState(false);
    
    // Filtros
    const [searchText, setSearchText] = useState('');
    const [filterCity, setFilterCity] = useState('all');

    // Obtener departamentos únicos para el filtro
    const uniqueDepartments = [...new Set(customers.map(c => c.address_province).filter(Boolean))];

    // Clientes filtrados
    const filteredCustomers = customers.filter(customer => {
        const searchLower = searchText.toLowerCase();
        const matchesSearch = 
            customer.name.toLowerCase().includes(searchLower) ||
            customer.email.toLowerCase().includes(searchLower) ||
            (customer.tax_id && customer.tax_id.toLowerCase().includes(searchLower));
        const matchesDepartment = filterCity === 'all' || customer.address_province === filterCity;
        return matchesSearch && matchesDepartment;
    });

    useEffect(() => {
        loadCustomers();
    }, []);

    const loadCustomers = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await customersApi.getAll();
            setCustomers(data);
        } catch (err: any) {
            setError(err.message || 'Error al cargar clientes');
        } finally {
            setLoading(false);
        }
    };

    const openCreateModal = () => {
        setEditingCustomer(null);
        setFormData(emptyForm);
        setShowModal(true);
    };

    const openEditModal = (customer: Customer) => {
        setEditingCustomer(customer);
        const phone = customer.phones && customer.phones.length > 0 ? customer.phones[0].number : '';
        setFormData({
            name: customer.name,
            email: customer.email,
            phone: phone,
            ci: customer.address_zip || '',  // Usamos address_zip para CI temporalmente
            address_street: customer.address_street || '',
            address_city: customer.address_city || '',
            address_department: customer.address_province || '',
            ruc: customer.tax_id || ''
        });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingCustomer(null);
        setFormData(emptyForm);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const customerData: any = {
                name: formData.name,
                email: formData.email,
                address_street: formData.address_street || undefined,
                address_city: formData.address_city || undefined,
                address_province: formData.address_department || undefined,  // Departamento
                address_zip: formData.ci || undefined,  // CI (usamos este campo)
                tax_id: formData.ruc || undefined  // RUC
            };

            if (formData.phone) {
                customerData.phones = [{ type: 'mobile', number: formData.phone }];
            }

            if (editingCustomer) {
                await customersApi.update(editingCustomer.id, customerData);
            } else {
                await customersApi.create(customerData);
            }

            closeModal();
            loadCustomers();
        } catch (err: any) {
            alert(err.message || 'Error al guardar');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (customer: Customer) => {
        if (!confirm(`¿Eliminar cliente "${customer.name}"?`)) return;

        try {
            await customersApi.delete(customer.id);
            loadCustomers();
        } catch (err: any) {
            alert(err.message || 'Error al eliminar');
        }
    };

    const getMainPhone = (phones?: { type: string; number: string }[]) => {
        if (!phones || phones.length === 0) return '-';
        return phones[0].number;
    };

    if (loading) {
        return (
            <div style={{ padding: '32px', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ 
                        width: '48px', 
                        height: '48px', 
                        border: '4px solid #e2e8f0',
                        borderTopColor: '#22c55e',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 16px'
                    }} />
                    <p style={{ color: '#64748b' }}>Cargando clientes...</p>
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
                        Clientes
                    </h1>
                    <p style={{ fontSize: '16px', color: '#64748b', margin: '4px 0 0 0' }}>
                        {customers.length} clientes registrados
                    </p>
                </div>
                <button 
                    onClick={openCreateModal}
                    style={{
                        ...buttonStyle,
                        padding: '12px 24px',
                        backgroundColor: '#22c55e',
                        color: 'white',
                    }}
                >
                    + Nuevo Cliente
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
                    <button onClick={loadCustomers} style={{ ...buttonStyle, backgroundColor: '#22c55e', color: 'white' }}>
                        Reintentar
                    </button>
                </div>
            )}

            {/* Barra de Filtros */}
            {customers.length > 0 && (
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
                            placeholder="Buscar por nombre, email o RUC..."
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            style={{
                                padding: '10px 16px',
                                border: '1px solid #e2e8f0',
                                borderRadius: '8px',
                                fontSize: '14px',
                                width: '300px',
                                outline: 'none'
                            }}
                        />
                    </div>
                    {uniqueDepartments.length > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '14px', color: '#64748b' }}>Departamento:</span>
                            <select
                                value={filterCity}
                                onChange={(e) => setFilterCity(e.target.value)}
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
                                {uniqueDepartments.map(dept => (
                                    <option key={dept} value={dept}>{dept}</option>
                                ))}
                            </select>
                        </div>
                    )}
                    {(searchText || filterCity !== 'all') && (
                        <button
                            onClick={() => { setSearchText(''); setFilterCity('all'); }}
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
                        Mostrando {filteredCustomers.length} de {customers.length}
                    </span>
                </div>
            )}

            {/* Tabla */}
            {customers.length === 0 ? (
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    padding: '48px',
                    textAlign: 'center',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }}>
                    <p style={{ fontSize: '48px', margin: '0 0 16px 0' }}>👥</p>
                    <p style={{ color: '#64748b', margin: '0 0 16px 0' }}>No hay clientes registrados</p>
                    <button onClick={openCreateModal} style={{ ...buttonStyle, backgroundColor: '#22c55e', color: 'white' }}>
                        Crear primer cliente
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
                                <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600, color: '#475569', fontSize: '14px' }}>Email</th>
                                <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600, color: '#475569', fontSize: '14px' }}>Teléfono</th>
                                <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600, color: '#475569', fontSize: '14px' }}>Departamento</th>
                                <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600, color: '#475569', fontSize: '14px' }}>RUC</th>
                                <th style={{ padding: '16px', textAlign: 'center', fontWeight: 600, color: '#475569', fontSize: '14px' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCustomers.map((customer) => (
                                <tr key={customer.id} style={{ borderTop: '1px solid #e2e8f0' }}>
                                    <td style={{ padding: '16px', color: '#64748b' }}>#{customer.id}</td>
                                    <td style={{ padding: '16px', fontWeight: 500, color: '#1e293b' }}>{customer.name}</td>
                                    <td style={{ padding: '16px', color: '#64748b' }}>{customer.email}</td>
                                    <td style={{ padding: '16px', color: '#64748b' }}>{getMainPhone(customer.phones)}</td>
                                    <td style={{ padding: '16px', color: '#64748b' }}>{customer.address_province || '-'}</td>
                                    <td style={{ padding: '16px', color: '#64748b', fontFamily: 'monospace' }}>
                                        {customer.tax_id || '-'}
                                    </td>
                                    <td style={{ padding: '16px', textAlign: 'center' }}>
                                        <button
                                            onClick={() => openEditModal(customer)}
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
                                            onClick={() => handleDelete(customer)}
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
                        maxWidth: '600px',
                        maxHeight: '90vh',
                        overflow: 'auto'
                    }}>
                        <h2 style={{ margin: '0 0 24px 0', fontSize: '24px', fontWeight: 600, color: '#1e293b' }}>
                            {editingCustomer ? 'Editar Cliente' : 'Nuevo Cliente'}
                        </h2>

                        <form onSubmit={handleSubmit}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                                <div>
                                    <label style={labelStyle}>Nombre *</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                        style={inputStyle}
                                        placeholder="Nombre completo"
                                    />
                                </div>
                                <div>
                                    <label style={labelStyle}>Email *</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        required
                                        style={inputStyle}
                                        placeholder="email@ejemplo.com"
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                                <div>
                                    <label style={labelStyle}>Teléfono</label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        style={inputStyle}
                                        placeholder="+595 981 123456"
                                    />
                                </div>
                                <div>
                                    <label style={labelStyle}>Cédula de Identidad (CI)</label>
                                    <input
                                        type="text"
                                        value={formData.ci}
                                        onChange={(e) => setFormData({ ...formData, ci: e.target.value })}
                                        style={inputStyle}
                                        placeholder="1.234.567"
                                    />
                                </div>
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={labelStyle}>RUC (Registro Único del Contribuyente)</label>
                                <input
                                    type="text"
                                    value={formData.ruc}
                                    onChange={(e) => setFormData({ ...formData, ruc: e.target.value })}
                                    style={inputStyle}
                                    placeholder="80012345-6"
                                />
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={labelStyle}>Dirección</label>
                                <input
                                    type="text"
                                    value={formData.address_street}
                                    onChange={(e) => setFormData({ ...formData, address_street: e.target.value })}
                                    style={inputStyle}
                                    placeholder="Calle y número"
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                                <div>
                                    <label style={labelStyle}>Ciudad</label>
                                    <input
                                        type="text"
                                        value={formData.address_city}
                                        onChange={(e) => setFormData({ ...formData, address_city: e.target.value })}
                                        style={inputStyle}
                                        placeholder="Asunción, Ciudad del Este, etc."
                                    />
                                </div>
                                <div>
                                    <label style={labelStyle}>Departamento</label>
                                    <select
                                        value={formData.address_department}
                                        onChange={(e) => setFormData({ ...formData, address_department: e.target.value })}
                                        style={inputStyle}
                                    >
                                        <option value="">Seleccionar...</option>
                                        {departamentosParaguay.map(dept => (
                                            <option key={dept} value={dept}>{dept}</option>
                                        ))}
                                    </select>
                                </div>
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
                                        backgroundColor: saving ? '#9ca3af' : '#22c55e',
                                        color: 'white',
                                        padding: '12px 24px'
                                    }}
                                >
                                    {saving ? 'Guardando...' : (editingCustomer ? 'Actualizar' : 'Crear')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomerList;
