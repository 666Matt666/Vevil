import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryProvider } from './hooks/QueryProvider';
import { ToastProvider } from './hooks/useToast';
import './assets/main.css'

// Auth
import Login from './components/auth/Login.tsx';
import Register from './components/auth/Register.tsx';
import ForgotPassword from './components/auth/ForgotPassword.tsx';
import ResetPassword from './components/auth/ResetPassword.tsx';
import ConfirmRegistration from './components/auth/ConfirmRegistration.tsx';

// Layout
import Layout from './components/layout/Layout.tsx';

// Pages
import Dashboard from './components/dashboard/Dashboard.tsx';
import ProductList from './components/products/ProductList.tsx';
import CustomerList from './components/customers/CustomerList.tsx';
import InvoiceList from './components/invoices/InvoiceList.tsx';
import InvoiceDetail from './components/invoices/InvoiceDetail.tsx';
import Settings from './components/settings/Settings.tsx';
import Reports from './components/reports/Reports.tsx';
import AccountsReceivable from './components/accounts/AccountsReceivable.tsx';
import StockMovements from './components/stock-movements/StockMovements.tsx';
import PendingRegistrations from './components/admin/PendingRegistrations.tsx';
import UserManagement from './components/admin/UserManagement.tsx';
import AuditLogView from './components/audit/AuditLogView.tsx';
import SuppliersList from './components/suppliers/SuppliersList.tsx';
import PublicPortal from './components/public/PublicPortal.tsx';

// Componente que escucha cambios en localStorage para detectar cambio de usuario
const AppContent: React.FC = () => {
    const [userId, setUserId] = useState<string>(() => {
        try {
            const p = JSON.parse(localStorage.getItem('vevil_profile') || '{}');
            return p?.id ? String(p.id) : 'none';
        } catch { return 'none'; }
    });

    // Escuchar evento personalizado de login
    useEffect(() => {
        const handleLogin = (e: CustomEvent) => {
            if (e.detail?.profile?.id) {
                setUserId(String(e.detail.profile.id));
            }
        };
        window.addEventListener('vevil-login', handleLogin as EventListener);
        return () => window.removeEventListener('vevil-login', handleLogin as EventListener);
    }, []);

    return (
        <>
            <Routes>
                {/* Rutas públicas */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/confirm-registration" element={<ConfirmRegistration />} />
                <Route path="/portal" element={<PublicPortal />} />

                {/* Rutas protegidas con Layout */}
                {/* Key basada en userId para remarcar Layout cuando cambia el usuario */}
                <Route path="/" element={<Layout key={userId} />}>
                    <Route index element={<Navigate to="/dashboard" replace />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="products" element={<ProductList />} />
                    <Route path="stock-movements" element={<StockMovements />} />
                    <Route path="customers" element={<CustomerList />} />
                    <Route path="suppliers" element={<SuppliersList />} />
                    <Route path="invoices" element={<InvoiceList />} />
                    <Route path="invoices/:invoiceId" element={<InvoiceDetail />} />
                    <Route path="reports" element={<Reports />} />
                    <Route path="accounts" element={<AccountsReceivable />} />
                    <Route path="pending-registrations" element={<PendingRegistrations />} />
                    <Route path="audit" element={<AuditLogView />} />
                    <Route path="users" element={<UserManagement />} />
                    <Route path="admin/users" element={<UserManagement showAllUsers={true} />} />
                    <Route path="settings" element={<Settings />} />
                </Route>
            </Routes>
        </>
    );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <ToastProvider>
            <QueryProvider>
                <BrowserRouter>
                    <AppContent />
                </BrowserRouter>
            </QueryProvider>
        </ToastProvider>
    </React.StrictMode>,
)

