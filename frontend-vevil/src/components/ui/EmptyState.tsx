import React from 'react';

interface EmptyStateProps {
  icon: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction
}) => {
  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '48px',
      textAlign: 'center',
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
    }}>
      <p style={{ fontSize: '48px', margin: '0 0 16px 0' }}>{icon}</p>
      <p style={{ color: '#1e293b', fontSize: '18px', fontWeight: 600, margin: '0 0 8px 0' }}>{title}</p>
      {description && (
        <p style={{ color: '#64748b', margin: '0 0 16px 0' }}>{description}</p>
      )}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          style={{
            padding: '10px 20px',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'pointer',
            backgroundColor: '#22c55e',
            color: 'white',
            transition: 'all 0.2s'
          }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};