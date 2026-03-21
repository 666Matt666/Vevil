import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConfirmModal } from '../ConfirmModal';

describe('ConfirmModal', () => {
  it('no renderiza cuando open es false', () => {
    render(
      <ConfirmModal
        open={false}
        title="Eliminar"
        message="¿Seguro?"
        onConfirm={() => {}}
        onCancel={() => {}}
      />
    );
    expect(screen.queryByRole('heading', { name: /eliminar/i })).not.toBeInTheDocument();
  });

  it('renderiza título y mensaje cuando open es true', () => {
    render(
      <ConfirmModal
        open={true}
        title="Eliminar producto"
        message="¿Eliminar el producto X? No se puede deshacer."
        onConfirm={() => {}}
        onCancel={() => {}}
      />
    );
    expect(screen.getByRole('heading', { name: /eliminar producto/i })).toBeInTheDocument();
    expect(screen.getByText(/no se puede deshacer/i)).toBeInTheDocument();
  });

  it('llama onCancel al hacer clic en Cancelar', () => {
    const onCancel = vi.fn();
    render(
      <ConfirmModal
        open={true}
        title="Título"
        message="Mensaje"
        onConfirm={() => {}}
        onCancel={onCancel}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /cancelar/i }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('llama onConfirm al hacer clic en Confirmar', () => {
    const onConfirm = vi.fn();
    render(
      <ConfirmModal
        open={true}
        title="Título"
        message="Mensaje"
        confirmLabel="Eliminar"
        onConfirm={onConfirm}
        onCancel={() => {}}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /eliminar/i }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('muestra "Eliminando..." cuando loading es true', () => {
    render(
      <ConfirmModal
        open={true}
        title="Título"
        message="Mensaje"
        confirmLabel="Eliminar"
        loading={true}
        onConfirm={() => {}}
        onCancel={() => {}}
      />
    );
    const confirmBtn = screen.getByRole('button', { name: 'Eliminar' });
    expect(confirmBtn).toHaveTextContent('Eliminando...');
    expect(confirmBtn).toBeDisabled();
  });
});
