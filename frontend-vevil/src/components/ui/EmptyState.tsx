import React from 'react';

interface EmptyStateProps {
    icon?: string;
    title: string;
    description?: string;
    action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon = '📭', title, description, action }) => (
    <div style={{
        textAlign: 'center',
        padding: '48px 24px',
        backgroundColor: '#f8fafc',
        borderRadius: '12px',
        border: '1px dashed #cbd5e1'
    }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>{icon}</div>
        <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1e293b', margin: '0 0 8px 0' }}>{title}</h3>
        {description && <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 16px 0' }}>{description}</p>}
        {action}
    </div>
);

export default EmptyState;