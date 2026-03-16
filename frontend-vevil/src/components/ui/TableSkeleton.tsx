import React from 'react';

const pulseKeyframes = `@keyframes vevil-pulse { 0%, 100% { opacity: 0.6; } 50% { opacity: 1; } }`;

interface TableSkeletonProps {
    rows?: number;
    cols?: number;
    message?: string;
}

export const TableSkeleton: React.FC<TableSkeletonProps> = ({
    rows = 8,
    cols = 5,
    message = 'Cargando...',
}) => (
    <div style={{ padding: '32px' }}>
        <style>{pulseKeyframes}</style>
        <div
            style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                overflow: 'hidden',
            }}
        >
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${cols}, 1fr)`,
                    gap: '1px',
                    backgroundColor: '#e2e8f0',
                    padding: '1px',
                }}
            >
                {/* Header */}
                {Array.from({ length: cols }).map((_, i) => (
                    <div
                        key={`h-${i}`}
                        style={{
                            backgroundColor: '#f8fafc',
                            height: '44px',
                            borderRadius: '6px',
                        }}
                    />
                ))}
                {/* Rows */}
                {Array.from({ length: rows }).map((_, r) =>
                    Array.from({ length: cols }).map((_, c) => (
                        <div
                            key={`${r}-${c}`}
                            style={{
                                backgroundColor: 'white',
                                height: '52px',
                                borderRadius: '6px',
                                animation: 'vevil-pulse 1.5s ease-in-out infinite',
                            }}
                        />
                    )),
                )}
            </div>
        </div>
        <p style={{ textAlign: 'center', color: '#64748b', marginTop: '16px' }}>{message}</p>
    </div>
);
