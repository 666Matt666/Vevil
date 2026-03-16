import React from 'react';

export interface ErrorMessageProps {
    message: string;
    onRetry?: () => void;
    onDismiss?: () => void;
    /** Clase CSS adicional para el contenedor */
    className?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
    message,
    onRetry,
    onDismiss,
    className = '',
}) => (
    <div
        role="alert"
        className={className}
        style={{
            backgroundColor: '#fee2e2',
            border: '1px solid #fecaca',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
        }}
    >
        <p style={{ color: '#991b1b', margin: 0, flex: '1 1 200px' }}>❌ {message}</p>
        <div style={{ display: 'flex', gap: '8px' }}>
            {onRetry && (
                <button
                    type="button"
                    onClick={onRetry}
                    style={{
                        padding: '8px 16px',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: 500,
                        cursor: 'pointer',
                        backgroundColor: '#4f46e5',
                        color: 'white',
                    }}
                >
                    Reintentar
                </button>
            )}
            {onDismiss && (
                <button
                    type="button"
                    onClick={onDismiss}
                    style={{
                        padding: '8px 16px',
                        border: '1px solid #94a3b8',
                        borderRadius: '6px',
                        fontSize: '14px',
                        backgroundColor: 'transparent',
                        color: '#475569',
                        cursor: 'pointer',
                    }}
                >
                    Cerrar
                </button>
            )}
        </div>
    </div>
);
