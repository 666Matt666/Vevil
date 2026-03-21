import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Pagination } from '../Pagination';

describe('Pagination', () => {
  it('muestra total de elementos cuando hay una sola página', () => {
    render(
      <Pagination
        page={1}
        limit={20}
        total={5}
        onPageChange={() => {}}
        label="productos"
      />
    );
    expect(screen.getByText(/mostrando 5 productos/i)).toBeInTheDocument();
  });

  it('muestra Anterior y Siguiente cuando hay varias páginas', () => {
    render(
      <Pagination
        page={2}
        limit={10}
        total={50}
        onPageChange={() => {}}
        label="items"
      />
    );
    expect(screen.getByRole('button', { name: /anterior/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /siguiente/i })).toBeInTheDocument();
  });

  it('llama onPageChange con la página al hacer clic en Siguiente', () => {
    const onPageChange = vi.fn();
    render(
      <Pagination
        page={1}
        limit={10}
        total={50}
        onPageChange={onPageChange}
        label="items"
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /siguiente/i }));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('llama onPageChange con la página al hacer clic en Anterior', () => {
    const onPageChange = vi.fn();
    render(
      <Pagination
        page={2}
        limit={10}
        total={50}
        onPageChange={onPageChange}
        label="items"
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /anterior/i }));
    expect(onPageChange).toHaveBeenCalledWith(1);
  });
});
