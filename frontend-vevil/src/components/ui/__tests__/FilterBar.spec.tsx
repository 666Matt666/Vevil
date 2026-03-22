import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FilterBar } from '../FilterBar';

describe('FilterBar', () => {
  const mockOnSearchChange = vi.fn();
  const mockOnClearFilters = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders search input with placeholder', () => {
    render(
      <FilterBar
        searchPlaceholder="Search customers..."
        searchValue=""
        onSearchChange={mockOnSearchChange}
      />
    );

    expect(screen.getByPlaceholderText('Search customers...')).toBeInTheDocument();
  });

  it('calls onSearchChange when typing in search input', () => {
    render(
      <FilterBar
        searchValue=""
        onSearchChange={mockOnSearchChange}
      />
    );

    const input = screen.getByPlaceholderText('Buscar...');
    fireEvent.change(input, { target: { value: 'test query' } });

    expect(mockOnSearchChange).toHaveBeenCalledWith('test query');
  });

  it('renders filter dropdowns', () => {
    render(
      <FilterBar
        searchValue=""
        onSearchChange={mockOnSearchChange}
        filters={[
          {
            key: 'department',
            label: 'Departamento',
            value: 'all',
            options: [
              { value: 'all', label: 'Todos' },
              { value: 'Central', label: 'Central' }
            ],
            onChange: vi.fn()
          }
        ]}
      />
    );

    expect(screen.getByText('Departamento:')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('shows clear filters button when there are active filters', () => {
    render(
      <FilterBar
        searchValue="test"
        onSearchChange={mockOnSearchChange}
        onClearFilters={mockOnClearFilters}
        showClearButton={true}
      />
    );

    expect(screen.getByText('✕ Limpiar filtros')).toBeInTheDocument();
  });

  it('calls onClearFilters when clear button is clicked', () => {
    render(
      <FilterBar
        searchValue="test"
        onSearchChange={mockOnSearchChange}
        onClearFilters={mockOnClearFilters}
        showClearButton={true}
      />
    );

    fireEvent.click(screen.getByText('✕ Limpiar filtros'));
    expect(mockOnClearFilters).toHaveBeenCalled();
  });

  it('does not show clear button when showClearButton is false and no filters', () => {
    render(
      <FilterBar
        searchValue=""
        onSearchChange={mockOnSearchChange}
        onClearFilters={mockOnClearFilters}
        showClearButton={false}
      />
    );

    expect(screen.queryByText('✕ Limpiar filtros')).not.toBeInTheDocument();
  });
});