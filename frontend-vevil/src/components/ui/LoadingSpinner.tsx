import React from 'react';

const spinKeyframes = `@keyframes vevil-spin { to { transform: rotate(360deg); } }`;

interface LoadingSpinnerProps {
    message?: string;
    /** Color del borde superior del spinner (default: #4f46e5) */
    color?: string;
    size?: number;
    minHeight?: number;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    message,
    color = '#4f46e5',
    size = 48,
    minHeight = 400,
}) => (
    <div
        style={{
            padding: '32px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: `${minHeight}px`,
        }}
    >
        <style>{spinKeyframes}</style>
        <div style={{ textAlign: 'center' }}>
            <div
                style={{
                    width: `${size}px`,
                    height: `${size}px`,
                    border: '4px solid #e2e8f0',
                    borderTopColor: color,
                    borderRadius: '50%',
                    animation: 'vevil-spin 1s linear infinite',
                    margin: '0 auto 16px',
                }}
            />
            {message && <p style={{ color: '#64748b', margin: 0 }}>{message}</p>}
        </div>
    </div>
);
