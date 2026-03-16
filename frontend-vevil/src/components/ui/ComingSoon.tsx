import React from 'react';
import { Link } from 'react-router-dom';

export interface ComingSoonProps {
    title: string;
    description?: string;
    /** Si se pasa, se muestra un enlace "Volver al inicio" */
    showBackLink?: boolean;
}

export const ComingSoon: React.FC<ComingSoonProps> = ({
    title,
    description = 'Esta sección estará disponible pronto. Gracias por tu paciencia.',
    showBackLink = true,
}) => (
    <div
        style={{
            padding: '48px 24px',
            maxWidth: '560px',
            margin: '0 auto',
            textAlign: 'center',
        }}
    >
        <div
            style={{
                fontSize: '64px',
                marginBottom: '24px',
                lineHeight: 1,
            }}
            aria-hidden
        >
            🚧
        </div>
        <h1
            style={{
                fontSize: '28px',
                fontWeight: 700,
                color: '#1e293b',
                margin: '0 0 16px',
            }}
        >
            {title}
        </h1>
        <p
            style={{
                fontSize: '16px',
                color: '#64748b',
                lineHeight: 1.6,
                margin: 0,
            }}
        >
            {description}
        </p>
        {showBackLink && (
            <Link
                to="/dashboard"
                style={{
                    display: 'inline-block',
                    marginTop: '32px',
                    padding: '12px 24px',
                    backgroundColor: '#4f46e5',
                    color: 'white',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontWeight: 600,
                    fontSize: '14px',
                }}
            >
                Volver al inicio
            </Link>
        )}
    </div>
);
