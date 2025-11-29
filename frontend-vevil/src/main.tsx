import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './assets/main.css'

// Auth
import Login from './components/auth/Login.tsx';

// Layout
import Layout from './components/layout/Layout.tsx';

// Pages
import Dashboard from './components/dashboard/Dashboard.tsx';
import ProductList from './components/products/ProductList.tsx';
import CustomerList from './components/customers/CustomerList.tsx';
import InvoiceList from './components/invoices/InvoiceList.tsx';
import InvoiceDetail from './components/invoices/InvoiceDetail.tsx';
import Settings from './components/settings/Settings.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <BrowserRouter>
            <Routes>
                {/* Ruta pública */}
                <Route path="/login" element={<Login />} />
                
                {/* Rutas protegidas con Layout */}
                <Route path="/" element={<Layout />}>
                    <Route index element={<Navigate to="/dashboard" replace />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="products" element={<ProductList />} />
                    <Route path="customers" element={<CustomerList />} />
                    <Route path="invoices" element={<InvoiceList />} />
                    <Route path="invoices/:invoiceId" element={<InvoiceDetail />} />
                    <Route path="settings" element={<Settings />} />
                </Route>
            </Routes>
        </BrowserRouter>
    </React.StrictMode>,
)

