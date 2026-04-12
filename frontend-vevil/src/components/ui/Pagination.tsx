import React from 'react';

const buttonStyle: React.CSSProperties = {
    padding: '8px 14px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    backgroundColor: '#fff',
    color: '#475569',
    transition: 'all 0.2s',
};

const activeButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: '#4f46e5',
    borderColor: '#4f46e5',
    color: '#fff',
};

interface PaginationProps {
    page: number;
    limit: number;
    total: number;
    onPageChange: (page: number) => void;
    onPageSizeChange?: (size: number) => void;
    pageSizeOptions?: number[];
    label?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
    page,
    limit,
    total,
    onPageChange,
    onPageSizeChange,
    pageSizeOptions = [10, 20, 50],
    label = 'elementos',
}) => {
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const from = total === 0 ? 0 : (page - 1) * limit + 1;
    const to = Math.min(page * limit, total);

    const pages: number[] = [];
    let start = Math.max(1, page - 2);
    let end = Math.min(totalPages, page + 2);
    if (end - start < 4) {
        if (start === 1) end = Math.min(totalPages, start + 4);
        else if (end === totalPages) start = Math.max(1, end - 4);
    }
    for (let i = start; i <= end; i++) pages.push(i);

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            padding: '12px 0',
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px', color: '#64748b' }}>
                {onPageSizeChange && (
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        Mostrar:
                        <select
                            value={limit}
                            onChange={(e) => onPageSizeChange(Number(e.target.value))}
                            style={{
                                padding: '4px 8px',
                                borderRadius: '6px',
                                border: '1px solid #e2e8f0',
                                fontSize: '13px',
                                color: '#475569',
                                cursor: 'pointer',
                            }}
                        >
                            {pageSizeOptions.map(size => (
                                <option key={size} value={size}>{size}</option>
                            ))}
                        </select>
                    </label>
                )}
                <span>Mostrando {from}-{to} de {total} {label}</span>
            </div>
            {totalPages > 1 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <button
                        type="button"
                        aria-label="Página anterior"
                        onClick={() => onPageChange(page - 1)}
                        disabled={page <= 1}
                        style={{ ...buttonStyle, opacity: page <= 1 ? 0.5 : 1, cursor: page <= 1 ? 'not-allowed' : 'pointer' }}
                    >
                        Anterior
                    </button>
                    {start > 1 && (
                        <>
                            <button type="button" onClick={() => onPageChange(1)} style={buttonStyle}>1</button>
                            {start > 2 && <span style={{ padding: '0 4px', color: '#94a3b8' }}>…</span>}
                        </>
                    )}
                    {pages.map((p) => (
                        <button
                            key={p}
                            type="button"
                            onClick={() => onPageChange(p)}
                            style={p === page ? activeButtonStyle : buttonStyle}
                        >
                            {p}
                        </button>
                    ))}
                    {end < totalPages && (
                        <>
                            {end < totalPages - 1 && <span style={{ padding: '0 4px', color: '#94a3b8' }}>…</span>}
                            <button type="button" onClick={() => onPageChange(totalPages)} style={buttonStyle}>{totalPages}</button>
                        </>
                    )}
                    <button
                        type="button"
                        aria-label="Página siguiente"
                        onClick={() => onPageChange(page + 1)}
                        disabled={page >= totalPages}
                        style={{ ...buttonStyle, opacity: page >= totalPages ? 0.5 : 1, cursor: page >= totalPages ? 'not-allowed' : 'pointer' }}
                    >
                        Siguiente
                    </button>
                </div>
            )}
        </div>
    );
};
