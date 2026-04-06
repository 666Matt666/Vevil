import React, { useEffect, createContext, useContext, useState, useCallback } from 'react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
    id: number;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) throw new Error('useToast must be used within ToastProvider');
    return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: ToastType = 'info') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 3000);
    }, []);

    const removeToast = (id: number) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    const colors = {
        success: { bg: '#dcfce7', text: '#166534', border: '#22c55e' },
        error: { bg: '#fee2e2', text: '#991b1b', border: '#dc2626' },
        info: { bg: '#dbeafe', text: '#1e40af', border: '#3b82f6' },
        warning: { bg: '#fef3c7', text: '#92400e', border: '#f59e0b' }
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div style={{
                position: 'fixed',
                bottom: '24px',
                right: '24px',
                zIndex: 9999,
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
            }}>
                {toasts.map(toast => (
                    <div
                        key={toast.id}
                        onClick={() => removeToast(toast.id)}
                        style={{
                            padding: '12px 20px',
                            borderRadius: '8px',
                            backgroundColor: colors[toast.type].bg,
                            color: colors[toast.type].text,
                            border: `1px solid ${colors[toast.type].border}`,
                            fontWeight: 500,
                            cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                            minWidth: '250px',
                            maxWidth: '350px',
                            fontSize: '14px'
                        }}
                    >
                        {toast.type === 'success' && '✓ '}
                        {toast.type === 'error' && '✕ '}
                        {toast.type === 'warning' && '⚠️ '}
                        {toast.type === 'info' && 'ℹ️ '}
                        {toast.message}
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};

export default ToastProvider;