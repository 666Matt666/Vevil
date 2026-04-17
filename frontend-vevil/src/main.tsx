import React, { useState, useEffect, Suspense, lazy } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryProvider } from './hooks/QueryProvider';
import { ToastProvider } from './hooks/useToast';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import './assets/main.css'

// Auth (critical, load eagerly)
import Login from './components/auth/Login.tsx';
import Register from './components/auth/Register.tsx';
import ForgotPassword from './components/auth/ForgotPassword.tsx';
import ResetPassword from './components/auth/ResetPassword.tsx';
import ConfirmRegistration from './components/auth/ConfirmRegistration.tsx';

// Layout (critical)
import Layout from './components/layout/Layout.tsx';

// Lazy load heavy components (code splitting)
const Dashboard = lazy(() => import('./components/dashboard/Dashboard.tsx'));
const ProductList = lazy(() => import('./components/products/ProductList.tsx'));
const CustomerList = lazy(() => import('./components/customers/CustomerList.tsx'));
const InvoiceList = lazy(() => import('./components/invoices/InvoiceList.tsx'));
const InvoiceDetail = lazy(() => import('./components/invoices/InvoiceDetail.tsx'));
const Reports = lazy(() => import('./components/reports/Reports.tsx'));
const AccountsReceivable = lazy(() => import('./components/accounts/AccountsReceivable.tsx'));
const StockMovements = lazy(() => import('./components/stock-movements/StockMovements.tsx'));
const Settings = lazy(() => import('./components/settings/Settings.tsx'));
const PendingRegistrations = lazy(() => import('./components/admin/PendingRegistrations.tsx'));
const UserManagement = lazy(() => import('./components/admin/UserManagement.tsx'));
const AuditLogView = lazy(() => import('./components/audit/AuditLogView.tsx'));
const SuppliersList = lazy(() => import('./components/suppliers/SuppliersList.tsx'));
const PublicPortal = lazy(() => import('./components/public/PublicPortal.tsx'));

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
                     <Route path="dashboard" element={
                         <Suspense fallback={<LoadingSpinner message="Cargando dashboard..." />}>
                             <Dashboard />
                         </Suspense>
                     } />
                     <Route path="products" element={
                         <Suspense fallback={<LoadingSpinner message="Cargando productos..." />}>
                             <ProductList />
                         </Suspense>
                     } />
                     <Route path="stock-movements" element={
                         <Suspense fallback={<LoadingSpinner message="Cargando movimientos..." />}>
                             <StockMovements />
                         </Suspense>
                     } />
                     <Route path="customers" element={
                         <Suspense fallback={<LoadingSpinner message="Cargando clientes..." />}>
                             <CustomerList />
                         </Suspense>
                     } />
                     <Route path="suppliers" element={
                         <Suspense fallback={<LoadingSpinner message="Cargando proveedores..." />}>
                             <SuppliersList />
                         </Suspense>
                     } />
                     <Route path="invoices" element={
                         <Suspense fallback={<LoadingSpinner message="Cargando facturas..." />}>
                             <InvoiceList />
                         </Suspense>
                     } />
                     <Route path="invoices/:invoiceId" element={
                         <Suspense fallback={<LoadingSpinner message="Cargando factura..." />}>
                             <InvoiceDetail />
                         </Suspense>
                     } />
                     <Route path="reports" element={
                         <Suspense fallback={<LoadingSpinner message="Cargando reportes..." />}>
                             <Reports />
                         </Suspense>
                     } />
                     <Route path="accounts" element={
                         <Suspense fallback={<LoadingSpinner message="Cargando cuentas corrientes..." />}>
                             <AccountsReceivable />
                         </Suspense>
                     } />
                     <Route path="pending-registrations" element={
                         <Suspense fallback={<LoadingSpinner message="Cargando..." />}>
                             <PendingRegistrations />
                         </Suspense>
                     } />
                     <Route path="audit" element={
                         <Suspense fallback={<LoadingSpinner message="Cargando auditoría..." />}>
                             <AuditLogView />
                         </Suspense>
                     } />
                     <Route path="users" element={
                         <Suspense fallback={<LoadingSpinner message="Cargando usuarios..." />}>
                             <UserManagement showAllUsers={false} />
                         </Suspense>
                     } />
                     <Route path="admin/users" element={
                         <Suspense fallback={<LoadingSpinner message="Cargando usuarios..." />}>
                             <UserManagement showAllUsers={true} />
                         </Suspense>
                     } />
                     <Route path="settings" element={
                         <Suspense fallback={<LoadingSpinner message="Cargando configuración..." />}>
                             <Settings />
                         </Suspense>
                     } />
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

