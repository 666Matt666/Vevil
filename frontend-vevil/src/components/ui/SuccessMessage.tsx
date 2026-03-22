import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface SuccessMessageProps {
    message: string;
    onDismiss?: () => void;
    /** Auto-dismiss after ms (default 4000). 0 = no auto-dismiss */
    autoDismissMs?: number;
}

export const SuccessMessage: React.FC<SuccessMessageProps> = ({
    message,
    onDismiss,
    autoDismissMs = 4000,
}) => {
    useEffect(() => {
        if (autoDismissMs > 0 && onDismiss) {
            const t = setTimeout(onDismiss, autoDismissMs);
            return () => clearTimeout(t);
        }
    }, [autoDismissMs, onDismiss]);

    return (
        <motion.div
            role="status"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            style={{
                backgroundColor: '#dcfce7',
                border: '1px solid #86efac',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '12px',
            }}
        >
            <p style={{ color: '#166534', margin: 0 }}>✓ {message}</p>
            {onDismiss && (
                <button
                    type="button"
                    onClick={onDismiss}
                    style={{
                        padding: '4px 12px',
                        border: '1px solid #22c55e',
                        borderRadius: '6px',
                        fontSize: '13px',
                        backgroundColor: 'transparent',
                        color: '#166534',
                        cursor: 'pointer',
                    }}
                >
                    Cerrar
                </button>
            )}
        </motion.div>
    );
};
