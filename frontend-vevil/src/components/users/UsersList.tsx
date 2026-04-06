import React, { useState, useEffect } from 'react';
import { usersApi, User, getErrorMessage } from '../../services/api';
import { TableSkeleton } from '../ui/TableSkeleton';
import { ErrorMessage } from '../ui/ErrorMessage';
import { SuccessMessage } from '../ui/SuccessMessage';

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

interface UserFormData {
    name: string;
    email: string;
    password: string;
    role: string;
}

const emptyForm: UserFormData = {
    name: '',
    email: '',
    password: '',
    role: 'user'
};

const UsersList: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [formData, setFormData] = useState<UserFormData>(emptyForm);
    const [saving, setSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [searchText, setSearchText] = useState('');

    const filteredUsers = (users || []).filter(user => {
        const searchLower = searchText.toLowerCase();
        return (
            user.name.toLowerCase().includes(searchLower) ||
            user.email.toLowerCase().includes(searchLower) ||
            user.role.toLowerCase().includes(searchLower)
        );
    });

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await usersApi.getAll();
            setUsers(data.data || []);
        } catch (err) {
            setError(getErrorMessage(err, 'Error al cargar usuarios'));
        } finally {
            setLoading(false);
        }
    };

    const openCreateModal = () => {
        setEditingUser(null);
        setFormData(emptyForm);
        setShowModal(true);
    };

    const openEditModal = (user: User) => {
        setEditingUser(user);
        setFormData({
            name: user.name,
            email: user.email,
            password: '',
            role: user.role
        });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingUser(null);
        setFormData(emptyForm);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim() || !formData.email.trim()) return;

        setSaving(true);
        try {
            if (editingUser) {
                const updateData: Partial<{ name: string; role: string; password: string }> = {
                    name: formData.name,
                    role: formData.role,
                };
                if (formData.password) {
                    updateData.password = formData.password;
                }
                await usersApi.update(editingUser.id, updateData);
                setSuccessMessage('Usuario actualizado correctamente');
            } else {
                await usersApi.create({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    role: formData.role
                });
                setSuccessMessage('Usuario creado correctamente');
            }
            closeModal();
            loadUsers();
        } catch (err) {
            setError(getErrorMessage(err, 'Error al guardar usuario'));
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (user: User) => {
        if (!confirm(`¿Estás seguro de eliminar al usuario "${user.name}"?`)) return;
        try {
            await usersApi.delete(user.id);
            setSuccessMessage('Usuario eliminado correctamente');
            loadUsers();
        } catch (err) {
            setError(getErrorMessage(err, 'Error al eliminar usuario'));
        }
    };

    if (loading) {
        return (
            <div style={{ padding: '24px' }}>
                <TableSkeleton columns={4} rows={5} />
            </div>
        );
    }

    return (
        <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1f2937', margin: 0 }}>
                    👥 Gestión de Usuarios
                </h1>
                <button
                    onClick={openCreateModal}
                    style={{ ...buttonStyle, backgroundColor: '#4f46e5', color: 'white' }}
                >
                    + Nuevo Usuario
                </button>
            </div>

            {error && (
                <ErrorMessage message={error} onClose={() => setError(null)} />
            )}

            {successMessage && (
                <SuccessMessage message={successMessage} onClose={() => setSuccessMessage(null)} />
            )}

            <div style={{ marginBottom: '16px' }}>
                <input
                    type="text"
                    placeholder="Buscar usuarios..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    style={{ ...inputStyle, maxWidth: '300px' }}
                />
            </div>

            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                            <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: 600, color: '#374151' }}>Nombre</th>
                            <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: 600, color: '#374151' }}>Email</th>
                            <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: 600, color: '#374151' }}>Rol</th>
                            <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: 600, color: '#374151' }}>Verificado</th>
                            <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '14px', fontWeight: 600, color: '#374151' }}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.length === 0 ? (
                            <tr>
                                <td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>
                                    No hay usuarios para mostrar
                                </td>
                            </tr>
                        ) : (
                            filteredUsers.map(user => (
                                <tr key={user.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                    <td style={{ padding: '12px 16px', fontSize: '14px', color: '#1f2937' }}>{user.name}</td>
                                    <td style={{ padding: '12px 16px', fontSize: '14px', color: '#1f2937' }}>{user.email}</td>
                                    <td style={{ padding: '12px 16px', fontSize: '14px' }}>
                                        <span style={{
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            fontSize: '12px',
                                            fontWeight: 500,
                                            backgroundColor: user.role === 'admin' ? '#dbeafe' : '#f3f4f6',
                                            color: user.role === 'admin' ? '#1e40af' : '#374151'
                                        }}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td style={{ padding: '12px 16px', fontSize: '14px', color: '#1f2937' }}>
                                        {user.emailVerified ? '✅' : '⏳'}
                                    </td>
                                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                                        <button
                                            onClick={() => openEditModal(user)}
                                            style={{ ...buttonStyle, marginRight: '8px', backgroundColor: '#f3f4f6', color: '#374151' }}
                                        >
                                            Editar
                                        </button>
                                        <button
                                            onClick={() => handleDelete(user)}
                                            style={{ ...buttonStyle, backgroundColor: '#fee2e2', color: '#dc2626' }}
                                        >
                                            Eliminar
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

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
                        borderRadius: '12px',
                        padding: '24px',
                        width: '400px',
                        maxWidth: '90%'
                    }}>
                        <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px' }}>
                            {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
                        </h2>
                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={labelStyle}>Nombre</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    style={inputStyle}
                                    required
                                />
                            </div>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={labelStyle}>Email</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    style={inputStyle}
                                    required
                                    disabled={!!editingUser}
                                />
                            </div>
                            {!editingUser && (
                                <div style={{ marginBottom: '16px' }}>
                                    <label style={labelStyle}>Contraseña</label>
                                    <input
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        style={inputStyle}
                                        required={!editingUser}
                                    />
                                </div>
                            )}
                            <div style={{ marginBottom: '24px' }}>
                                <label style={labelStyle}>Rol</label>
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    style={inputStyle}
                                >
                                    <option value="user">Usuario</option>
                                    <option value="admin">Administrador</option>
                                </select>
                            </div>
                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    style={{ ...buttonStyle, backgroundColor: '#f3f4f6', color: '#374151' }}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    style={{ ...buttonStyle, backgroundColor: '#4f46e5', color: 'white', opacity: saving ? 0.7 : 1 }}
                                >
                                    {saving ? 'Guardando...' : 'Guardar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UsersList;