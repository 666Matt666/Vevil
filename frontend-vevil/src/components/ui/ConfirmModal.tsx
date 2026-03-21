import React, { useEffect, useRef } from 'react';

interface ConfirmModalProps {
    open: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: 'danger' | 'primary';
    loading?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

const buttonBase: React.CSSProperties = {
    padding: '10px 20px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    border: 'none',
    transition: 'all 0.2s',
};

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
    open,
    title,
    message,
    confirmLabel = 'Confirmar',
    cancelLabel = 'Cancelar',
    variant = 'danger',
    loading = false,
    onConfirm,
    onCancel,
}) => {
    const cancelRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (!open) return;
        cancelRef.current?.focus();
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onCancel();
        };
        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
    }, [open, onCancel]);

    if (!open) return null;

    const confirmBg = variant === 'danger' ? '#dc2626' : '#4f46e5';

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-modal-title"
            aria-describedby="confirm-modal-desc"
            style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1100,
                padding: '16px',
            }}
            onClick={onCancel}
        >
            <div
                style={{
                    backgroundColor: '#fff',
                    borderRadius: '16px',
                    padding: '24px',
                    maxWidth: '400px',
                    width: '100%',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <h3 id="confirm-modal-title" style={{ margin: '0 0 12px 0', fontSize: '18px', fontWeight: 600, color: '#1e293b' }}>
                    {title}
                </h3>
                <p id="confirm-modal-desc" style={{ margin: '0 0 24px 0', fontSize: '15px', color: '#64748b', lineHeight: 1.5 }}>
                    {message}
                </p>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                    <button
                        ref={cancelRef}
                        type="button"
                        onClick={onCancel}
                        disabled={loading}
                        aria-label={cancelLabel}
                        style={{
                            ...buttonBase,
                            backgroundColor: '#f1f5f9',
                            color: '#475569',
                        }}
                    >
                        {cancelLabel}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={loading}
                        aria-label={confirmLabel}
                        style={{
                            ...buttonBase,
                            backgroundColor: loading ? '#94a3b8' : confirmBg,
                            color: '#fff',
                        }}
                    >
                        {loading ? 'Eliminando...' : confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
};
