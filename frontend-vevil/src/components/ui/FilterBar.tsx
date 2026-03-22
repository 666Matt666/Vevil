import React from 'react';

interface FilterOption {
  value: string;
  label: string;
}

interface FilterBarProps {
  searchPlaceholder?: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  filters?: Array<{
    key: string;
    label: string;
    value: string;
    options: FilterOption[];
    onChange: (value: string) => void;
  }>;
  onClearFilters?: () => void;
  showClearButton?: boolean;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchPlaceholder = 'Buscar...',
  searchValue,
  onSearchChange,
  filters = [],
  onClearFilters,
  showClearButton = false
}) => {
  const hasActiveFilters = searchValue || filters.some(f => f.value !== 'all' && f.value !== '');

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '16px',
      marginBottom: '16px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
      display: 'flex',
      gap: '16px',
      alignItems: 'center',
      flexWrap: 'wrap'
    }}>
      {/* Search input */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '20px' }}>🔍</span>
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          style={{
            padding: '10px 16px',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            fontSize: '14px',
            width: '300px',
            outline: 'none'
          }}
        />
      </div>

      {/* Filter dropdowns */}
      {filters.map((filter) => (
        <div key={filter.key} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '14px', color: '#64748b' }}>{filter.label}:</span>
          <select
            value={filter.value}
            onChange={(e) => filter.onChange(e.target.value)}
            style={{
              padding: '10px 16px',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '14px',
              backgroundColor: 'white',
              cursor: 'pointer'
            }}
          >
            {filter.options.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
      ))}

      {/* Clear filters button */}
      {(showClearButton || hasActiveFilters) && onClearFilters && (
        <button
          onClick={onClearFilters}
          style={{
            padding: '8px 16px',
            border: 'none',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 500,
            cursor: 'pointer',
            backgroundColor: '#f1f5f9',
            color: '#64748b',
            transition: 'all 0.2s'
          }}
        >
          ✕ Limpiar filtros
        </button>
      )}
    </div>
  );
};