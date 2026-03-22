import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
  toasts: Toast[];
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    // Auto-remove after 4 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, toasts, removeToast }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    // Return a no-op function if used outside provider
    return {
      showToast: (message: string, type: ToastType = 'info') => console.log(`[Toast ${type}]: ${message}`),
      toasts: [],
      removeToast: () => {},
    };
  }
  return context;
}

// Toast container component - mount once in Layout
export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  const getStyles = (type: ToastType) => {
    switch (type) {
      case 'success':
        return {
          bg: '#dcfce7',
          border: '#86efac',
          text: '#166534',
          icon: '✓',
        };
      case 'error':
        return {
          bg: '#fee2e2',
          border: '#fecaca',
          text: '#991b1b',
          icon: '✕',
        };
      case 'warning':
        return {
          bg: '#fef3c7',
          border: '#fde68a',
          text: '#92400e',
          icon: '⚠',
        };
      case 'info':
      default:
        return {
          bg: '#dbeafe',
          border: '#bfdbfe',
          text: '#1e40af',
          icon: 'ℹ',
        };
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: '80px',
        right: '24px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        maxWidth: '360px',
      }}
    >
      <AnimatePresence>
        {toasts.map((toast) => {
          const styles = getStyles(toast.type);
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 100, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              style={{
                backgroundColor: styles.bg,
                border: `1px solid ${styles.border}`,
                borderRadius: '12px',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              }}
            >
              <span
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: styles.border,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: styles.text,
                  flexShrink: 0,
                }}
              >
                {styles.icon}
              </span>
              <p style={{ color: styles.text, margin: 0, flex: 1, fontSize: '14px', lineHeight: 1.4 }}>
                {toast.message}
              </p>
              <button
                onClick={() => removeToast(toast.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '18px',
                  cursor: 'pointer',
                  color: styles.text,
                  opacity: 0.6,
                  padding: '4px',
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
