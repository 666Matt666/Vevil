import React, { useState, useEffect, createContext, useContext } from 'react';

interface ConfirmDialogData {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void | Promise<void>;
}

interface ConfirmContextType {
    showConfirm: (data: ConfirmDialogData) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | null>(null);

export const useConfirm = () => {
    const context = useContext(ConfirmContext);
    if (!context) throw new Error('useConfirm must be used within ConfirmProvider');
    return context;
};

export const ConfirmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [dialog, setDialog] = useState<ConfirmDialogData | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const showConfirm = async (data: ConfirmDialogData): Promise<boolean> => {
        return new Promise((resolve) => {
            setDialog({ ...data, onConfirm: async () => {
                setIsLoading(true);
                try {
                    await data.onConfirm();
                    resolve(true);
                } catch {
                    resolve(false);
                } finally {
                    setIsLoading(false);
                    setDialog(null);
                }
            }});
        });
    };

    const handleCancel = () => {
        setDialog(null);
    };

    if (!dialog) return <>{children}</>;

    return (
        <>
            {children}
            {dialog && (
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
                    zIndex: 9999,
                    padding: '16px'
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        padding: '24px',
                        maxWidth: '400px',
                        width: '100%',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
                    }}>
                        <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1e293b', margin: '0 0 12px 0' }}>
                            {dialog.title}
                        </h3>
                        <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 24px 0' }}>
                            {dialog.message}
                        </p>
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                            <button
                                onClick={handleCancel}
                                disabled={isLoading}
                                style={{
                                    padding: '10px 20px',
                                    borderRadius: '6px',
                                    border: 'none',
                                    backgroundColor: '#f1f5f9',
                                    color: '#475569',
                                    fontWeight: 500,
                                    cursor: isLoading ? 'not-allowed' : 'pointer',
                                    fontSize: '14px'
                                }}
                            >
                                {dialog.cancelText || 'Cancelar'}
                            </button>
                            <button
                                onClick={dialog.onConfirm}
                                disabled={isLoading}
                                style={{
                                    padding: '10px 20px',
                                    borderRadius: '6px',
                                    border: 'none',
                                    backgroundColor: isLoading ? '#9ca3af' : '#dc2626',
                                    color: 'white',
                                    fontWeight: 500,
                                    cursor: isLoading ? 'not-allowed' : 'pointer',
                                    fontSize: '14px'
                                }}
                            >
                                {isLoading ? 'Procesando...' : (dialog.confirmText || 'Confirmar')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ConfirmProvider;