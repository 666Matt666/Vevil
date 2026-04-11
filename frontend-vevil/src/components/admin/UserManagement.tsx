import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { usersApi, SystemUser, getErrorMessage, pendingRegistrationsApi, type PendingRegistrationItem } from '../../services/api';
import { useToast } from '../../hooks/useToast';
import { fadeInUp } from '../../hooks/useAnimations';
import { ConfirmModal } from '../ui/ConfirmModal';
import { copy } from '../../copy';
import { useProfile } from '../../hooks/useAuth';

const UserManagement: React.FC<{ showAllUsers?: boolean }> = ({ showAllUsers = false }) => {
    const [users, setUsers] = useState<SystemUser[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [togglingId, setTogglingId] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<string | null>(null);
    const { showToast } = useToast();
    const navigate = useNavigate();
    
    // Check if user is admin
    const { data: profile, isLoading: profileLoading } = useProfile();
    const isAdmin = String(profile?.role ?? '').toLowerCase() === 'admin' || profile?.email?.toLowerCase() === 'admin@vevil.com';
    
    // For non-admin users, we'll show only their own profile using the /me endpoint
    const isRegularUser = !profileLoading && !isAdmin && profile;
    
    // Check if user can edit a specific user (admin or own profile)
    // Use String() to ensure robust comparison across different ID formats
    const canEditUser = (userId: string) => isAdmin || String(userId) === String(profile?.id);
    
    // Pending registrations state (only for admins)
    const [pendingList, setPendingList] = useState<PendingRegistrationItem[]>([]);
    const [pendingLoading, setPendingLoading] = useState(false);
    const [pendingError, setPendingError] = useState('');
    const [pendingActioning, setPendingActioning] = useState<string | null>(null);
    const [approveRole, setApproveRole] = useState<Record<string, 'admin' | 'user'>>({});
    
    const loadPendingRegistrations = async () => {
        if (!isAdmin) return;
        setPendingLoading(true);
        setPendingError('');
        try {
            const data = await pendingRegistrationsApi.getList();
            setPendingList(Array.isArray(data) ? data : []);
        } catch (err) {
            setPendingError(getErrorMessage(err, 'Error al cargar solicitudes'));
        } finally {
            setPendingLoading(false);
        }
    };
    
    useEffect(() => {
        // Only load pending registrations for admins in the users management view
        if (isAdmin && showAllUsers) {
            loadPendingRegistrations();
        }
    }, [isAdmin, showAllUsers]);
    
    const handleApprove = async (id: string) => {
        const role = approveRole[id] || 'user';
        setPendingActioning(id);
        setPendingError('');
        try {
            await pendingRegistrationsApi.approve(id, role);
            showToast('Solicitud aprobada', 'success');
            setPendingList((prev) => prev.filter((r) => r.id !== id));
        } catch (err) {
            showToast(getErrorMessage(err, 'Error al aprobar'), 'error');
        } finally {
            setPendingActioning(null);
        }
    };
    
    const handleReject = async (id: string) => {
        if (!window.confirm(copy.pendingRegistrations.rejectConfirm)) return;
        setPendingActioning(id);
        setPendingError('');
        try {
            await pendingRegistrationsApi.reject(id);
            showToast('Solicitud rechazada', 'success');
            setPendingList((prev) => prev.filter((r) => r.id !== id));
        } catch (err) {
            showToast(getErrorMessage(err, 'Error al rechazar'), 'error');
        } finally {
            setPendingActioning(null);
        }
    };
    
    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<SystemUser | null>(null);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'user'
    });

    const loadUsers = async (pageNum: number = page) => {
        try {
            setLoading(true);
            // Si showAllUsers es true, cargar todos los usuarios (para admin)
            // Si no, cargar solo el perfil del usuario actual
            if (showAllUsers && isAdmin) {
                const data = await usersApi.getAll({ 
                    page: pageNum, 
                    limit: 10,
                    search: search || undefined 
                });
                setUsers(data.data);
                setTotal(data.total);
            } else {
                // Siempre usar /users/me para mostrar el perfil del usuario actual
                const myProfile = await usersApi.getMe();
                setUsers([myProfile]);
                setTotal(1);
            }
            setPage(pageNum);
        } catch (err) {
            showToast(getErrorMessage(err, 'Error al cargar usuarios'), 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Only load users if profile is loaded
        if (!profileLoading) {
            loadUsers(1);
        }
    }, [search, isAdmin, profileLoading, profile?.id, showAllUsers]);

    const handleToggleActive = async (userId: string) => {
        try {
            setTogglingId(userId);
            const result = await usersApi.toggleActive(userId);
            setUsers(prev => prev.map(u => 
                u.id === userId ? { ...u, isActive: result.isActive } : u
            ));
            showToast(result.message, 'success');
        } catch (err) {
            showToast(getErrorMessage(err, 'Error al cambiar estado'), 'error');
        } finally {
            setTogglingId(null);
        }
    };

    const handleDeleteClick = (userId: string) => {
        setUserToDelete(userId);
        setDeleteConfirmOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!userToDelete) return;
        try {
            setDeletingId(userToDelete);
            await usersApi.delete(userToDelete);
            showToast('Usuario eliminado', 'success');
            loadUsers();
        } catch (err) {
            showToast(getErrorMessage(err, 'Error al eliminar usuario'), 'error');
        } finally {
            setDeletingId(null);
            setDeleteConfirmOpen(false);
            setUserToDelete(null);
        }
    };

    const handleDeleteCancel = () => {
        setDeleteConfirmOpen(false);
        setUserToDelete(null);
    };
    
    // Create/Edit handlers
    const handleCreateClick = () => {
        setEditingUser(null);
        setFormData({ name: '', email: '', password: '', role: 'user' });
        setIsModalOpen(true);
    };
    
    const handleEditClick = (user: SystemUser) => {
        setEditingUser(user);
        setFormData({ 
            name: user.name || '', 
            email: user.email || '', 
            password: '', 
            role: user.role || 'user' 
        });
        setIsModalOpen(true);
    };
    
    const handleModalClose = () => {
        setIsModalOpen(false);
        setEditingUser(null);
    };
    
    const handleSave = async () => {
        if (!formData.name.trim() || !formData.email.trim()) {
            showToast('Nombre y email son obligatorios', 'error');
            return;
        }
        if (!editingUser && !formData.password) {
            showToast('La contraseña es obligatoria para nuevos usuarios', 'error');
            return;
        }
        
        try {
            setSaving(true);
            if (editingUser) {
                // Update existing user
                const updateData: { name: string; email: string; role?: string; password?: string } = {
                    name: formData.name,
                    email: formData.email,
                };
                // Only admins can change role
                if (isAdmin) {
                    updateData.role = formData.role;
                }
                if (formData.password) {
                    updateData.password = formData.password;
                }
                await usersApi.update(editingUser.id, updateData);
                showToast('Usuario actualizado correctamente', 'success');
            } else {
                // Create new user
                await usersApi.create({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    role: formData.role
                });
                showToast('Usuario creado correctamente', 'success');
            }
            handleModalClose();
            loadUsers();
        } catch (err) {
            showToast(getErrorMessage(err, 'Error al guardar usuario'), 'error');
        } finally {
            setSaving(false);
        }
    };

    const totalPages = Math.ceil(total / 10);

    return (
        <motion.div 
            className="responsive-padding" 
            style={{ padding: '32px' }}
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
        >
            {/* Header */}
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'flex-start',
                marginBottom: '24px',
                flexWrap: 'wrap',
                gap: '16px'
            }}>
                <div>
                    <h1 style={{ fontSize: 'clamp(22px, 5vw, 28px)', fontWeight: 700, color: '#1e293b', margin: 0 }}>
                        {showAllUsers && isAdmin ? 'Gestión de Usuarios' : 'Mi Perfil'}
                    </h1>
                    <p style={{ fontSize: '16px', color: '#64748b', margin: '4px 0 0 0' }}>
                        {isAdmin 
                            ? `${total} usuario${total !== 1 ? 's' : ''} registrado${total !== 1 ? 's' : ''}` 
                            : 'Información de tu cuenta'}
                    </p>
                </div>
                {/* Only admins can create new users (only in the users management view) */}
                {showAllUsers && isAdmin && (
                    <button
                        onClick={handleCreateClick}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#4f46e5',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: 500,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        ➕ Nuevo Usuario
                    </button>
                )}
            </div>

            {/* Buscador - solo cuando se muestran todos los usuarios (vista de admin) */}
            {showAllUsers && isAdmin && (
                <div style={{ marginBottom: '24px' }}>
                    <input
                        type="text"
                        placeholder="Buscar por nombre o email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{
                            padding: '12px 16px',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            fontSize: '14px',
                            width: '300px',
                            outline: 'none'
                        }}
                    />
                </div>
            )}

            {/* Tabla */}
            <div style={{ 
                backgroundColor: 'white', 
                borderRadius: '12px', 
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                overflow: 'hidden'
            }}>
                {loading ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                        Cargando usuarios...
                    </div>
                ) : users.length === 0 ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                        No se encontraron usuarios
                    </div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                                <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600, color: '#475569' }}>Usuario</th>
                                <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600, color: '#475569' }}>Email</th>
                                <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600, color: '#475569' }}>Rol</th>
                                <th style={{ padding: '16px', textAlign: 'center', fontWeight: 600, color: '#475569' }}>Estado</th>
                                <th style={{ padding: '16px', textAlign: 'center', fontWeight: 600, color: '#475569' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '16px' }}>
                                        <div style={{ fontWeight: 500, color: '#1e293b' }}>
                                            {user.name} {user.lastName}
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px', color: '#64748b' }}>
                                        {user.email}
                                    </td>
                                    <td style={{ padding: '16px' }}>
                                        <span style={{
                                            padding: '4px 12px',
                                            borderRadius: '20px',
                                            fontSize: '12px',
                                            fontWeight: 500,
                                            backgroundColor: user.role === 'admin' ? '#dbeafe' : '#f1f5f9',
                                            color: user.role === 'admin' ? '#1e40af' : '#475569'
                                        }}>
                                            {user.role === 'admin' ? '👑 Admin' : '👤 Usuario'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px', textAlign: 'center' }}>
                                        <span style={{
                                            padding: '4px 12px',
                                            borderRadius: '20px',
                                            fontSize: '12px',
                                            fontWeight: 500,
                                            backgroundColor: user.isActive ? '#dcfce7' : '#fee2e2',
                                            color: user.isActive ? '#166534' : '#991b1b'
                                        }}>
                                            {user.isActive ? '✅ Activo' : '❌ Inactivo'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px', textAlign: 'center' }}>
                                        {/* Edit button: solo se muestra cuando showAllUsers es true (vista de admin) */}
                                        {showAllUsers ? (
                                            <button
                                                onClick={() => handleEditClick(user)}
                                                style={{
                                                    padding: '8px 16px',
                                                    fontSize: '13px',
                                                    border: 'none',
                                                    borderRadius: '6px',
                                                    backgroundColor: '#e0e7ff',
                                                    color: '#4338ca',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                ✏️ Editar
                                            </button>
                                        ) : null}
                                        {/* Toggle active and delete buttons: solo para admins y solo en vista de gestión de usuarios */}
                                        {showAllUsers && isAdmin && String(user.id) !== String(profile?.id) && (
                                            <>
                                                <button
                                                    onClick={() => handleToggleActive(user.id)}
                                                    disabled={togglingId === user.id}
                                                    style={{
                                                        padding: '8px 16px',
                                                        fontSize: '13px',
                                                        border: 'none',
                                                        borderRadius: '6px',
                                                        cursor: togglingId === user.id ? 'not-allowed' : 'pointer',
                                                        backgroundColor: user.isActive ? '#fef3c7' : '#dcfce7',
                                                        color: user.isActive ? '#92400e' : '#166534',
                                                        opacity: togglingId === user.id ? 0.6 : 1
                                                    }}
                                                >
                                                    {user.isActive ? 'Desactivar' : 'Activar'}
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(user.id)}
                                                    disabled={deletingId === user.id}
                                                style={{
                                                    padding: '8px 16px',
                                                    fontSize: '13px',
                                                    border: 'none',
                                                    borderRadius: '6px',
                                                    cursor: deletingId === user.id ? 'not-allowed' : 'pointer',
                                                    backgroundColor: '#fee2e2',
                                                    color: '#991b1b',
                                                    opacity: deletingId === user.id ? 0.6 : 1
                                                }}
                                            >
                                                Eliminar
                                            </button>
                                        </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    gap: '8px', 
                    marginTop: '24px' 
                }}>
                    <button
                        onClick={() => loadUsers(page - 1)}
                        disabled={page === 1}
                        style={{
                            padding: '8px 16px',
                            border: '1px solid #e2e8f0',
                            borderRadius: '6px',
                            backgroundColor: page === 1 ? '#f1f5f9' : 'white',
                            color: page === 1 ? '#94a3b8' : '#475569',
                            cursor: page === 1 ? 'not-allowed' : 'pointer'
                        }}
                    >
                        Anterior
                    </button>
                    <span style={{ padding: '8px 16px', color: '#64748b' }}>
                        Página {page} de {totalPages}
                    </span>
                    <button
                        onClick={() => loadUsers(page + 1)}
                        disabled={page === totalPages}
                        style={{
                            padding: '8px 16px',
                            border: '1px solid #e2e8f0',
                            borderRadius: '6px',
                            backgroundColor: page === totalPages ? '#f1f5f9' : 'white',
                            color: page === totalPages ? '#94a3b8' : '#475569',
                            cursor: page === totalPages ? 'not-allowed' : 'pointer'
                        }}
                    >
                        Siguiente
                    </button>
                </div>
            )}

            {/* Confirm Modal for Delete */}
            <ConfirmModal
                open={deleteConfirmOpen}
                title="Eliminar Usuario"
                message="¿Estás seguro de eliminar este usuario? Esta acción no se puede deshacer."
                confirmLabel="Eliminar"
                cancelLabel="Cancelar"
                onConfirm={handleDeleteConfirm}
                onCancel={handleDeleteCancel}
                variant="danger"
            />
            
            {/* Create/Edit Modal */}
            {isModalOpen && (
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
                        width: '100%',
                        maxWidth: '450px',
                        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
                    }}>
                        <h2 style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: 600, color: '#1e293b' }}>
                            {editingUser ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
                        </h2>
                        
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500, color: '#374151' }}>
                                Nombre completo *
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Juan Pérez"
                                style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>
                        
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500, color: '#374151' }}>
                                Email *
                            </label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="juan@ejemplo.com"
                                disabled={!isAdmin}
                                style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    boxSizing: 'border-box',
                                    backgroundColor: !isAdmin ? '#f3f4f6' : 'white',
                                    color: !isAdmin ? '#9ca3af' : '#374151'
                                }}
                            />
                        </div>
                        
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500, color: '#374151' }}>
                                Contraseña {editingUser ? '(dejar en blanco para mantener)' : '*'}
                            </label>
                            <input
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                placeholder="••••••••"
                                style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    boxSizing: 'border-box',
                                    backgroundColor: 'white'
                                }}
                            />
                        </div>
                        
                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500, color: '#374151' }}>
                                Rol
                            </label>
                            <select
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                disabled={!isAdmin}
                                style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    boxSizing: 'border-box',
                                    backgroundColor: !isAdmin ? '#f3f4f6' : 'white',
                                    color: !isAdmin ? '#9ca3af' : '#374151'
                                }}
                            >
                                <option value="user">Usuario</option>
                                <option value="admin">Administrador</option>
                            </select>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                            <button
                                onClick={handleModalClose}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: '#f3f4f6',
                                    color: '#374151',
                                    border: 'none',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    fontWeight: 500,
                                    cursor: 'pointer'
                                }}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: saving ? '#9ca3af' : '#4f46e5',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    fontWeight: 500,
                                    cursor: saving ? 'not-allowed' : 'pointer'
                                }}
                            >
                                {saving ? 'Guardando...' : (editingUser ? 'Actualizar' : 'Crear')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Pending Registrations Section - Only for Admins in Users Management view */}
            {showAllUsers && isAdmin && (
                <div style={{ marginTop: '48px' }}>
                    <h2 style={{ fontSize: 'clamp(20px, 4vw, 24px)', fontWeight: 700, color: '#1e293b', marginBottom: '16px', borderTop: '1px solid #e2e8f0', paddingTop: '24px' }}>
                        Gestión de Registro
                    </h2>
                    <p style={{ color: '#64748b', marginBottom: '24px' }}>
                        {copy.pendingRegistrations.intro}
                    </p>

                    {pendingLoading ? (
                        <div style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
                            {copy.pendingRegistrations.loading}
                        </div>
                    ) : pendingError ? (
                        <div style={{ padding: '16px', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '8px' }}>
                            {pendingError}
                        </div>
                    ) : pendingList.length === 0 ? (
                        <div style={{ padding: '32px', textAlign: 'center', color: '#64748b', backgroundColor: '#f8fafc', borderRadius: '12px' }}>
                            {copy.pendingRegistrations.empty}
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {pendingList.map((item) => (
                                <div
                                    key={item.id}
                                    style={{
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '12px',
                                        padding: '20px',
                                        backgroundColor: 'white',
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        gap: '16px',
                                    }}
                                >
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: '18px', color: '#1e293b' }}>
                                            {[item.name, item.lastName].filter(Boolean).join(' ')}
                                        </div>
                                        <div style={{ color: '#64748b', marginTop: '4px' }}>{item.email}</div>
                                        {item.gender && (
                                            <div style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>
                                                {copy.register.gender}: {item.gender === 'female' ? copy.pendingRegistrations.genderFemale : copy.pendingRegistrations.genderMale}
                                            </div>
                                        )}
                                        <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '8px' }}>
                                            {copy.pendingRegistrations.confirmedAt} · {new Date(item.createdAt).toLocaleString()}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                                            {copy.pendingRegistrations.profile}:
                                            <select
                                                value={approveRole[item.id] ?? 'user'}
                                                onChange={(e) =>
                                                    setApproveRole((prev) => ({
                                                        ...prev,
                                                        [item.id]: e.target.value as 'admin' | 'user',
                                                    }))
                                                }
                                                style={{
                                                    padding: '8px 12px',
                                                    borderRadius: '8px',
                                                    border: '1px solid #e2e8f0',
                                                    fontSize: '14px',
                                                }}
                                            >
                                                <option value="user">{copy.pendingRegistrations.profileRoleUser}</option>
                                                <option value="admin">{copy.pendingRegistrations.profileRoleAdmin}</option>
                                            </select>
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => handleApprove(item.id)}
                                            disabled={pendingActioning === item.id}
                                            style={{
                                                padding: '10px 20px',
                                                backgroundColor: pendingActioning === item.id ? '#9ca3af' : '#22c55e',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '8px',
                                                fontWeight: 600,
                                                cursor: pendingActioning === item.id ? 'not-allowed' : 'pointer',
                                            }}
                                        >
                                            {pendingActioning === item.id ? '...' : copy.pendingRegistrations.approve}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleReject(item.id)}
                                            disabled={pendingActioning === item.id}
                                            style={{
                                                padding: '10px 20px',
                                                backgroundColor: 'transparent',
                                                color: '#dc2626',
                                                border: '1px solid #dc2626',
                                                borderRadius: '8px',
                                                fontWeight: 600,
                                                cursor: pendingActioning === item.id ? 'not-allowed' : 'pointer',
                                            }}
                                        >
                                            {copy.pendingRegistrations.reject}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </motion.div>
    );
};

export default UserManagement;
