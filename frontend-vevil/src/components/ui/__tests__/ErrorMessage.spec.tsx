import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorMessage } from '../ErrorMessage';

describe('ErrorMessage', () => {
  it('renders message and retry button when onRetry provided', () => {
    const onRetry = vi.fn();
    render(<ErrorMessage message="Error de red" onRetry={onRetry} />);
    expect(screen.getByText(/Error de red/)).toBeInTheDocument();
    const retry = screen.getByRole('button', { name: /Reintentar/i });
    expect(retry).toBeInTheDocument();
    fireEvent.click(retry);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('renders dismiss button when onDismiss provided', () => {
    const onDismiss = vi.fn();
    render(<ErrorMessage message="Algo falló" onDismiss={onDismiss} />);
    const dismiss = screen.getByRole('button', { name: /Cerrar/i });
    expect(dismiss).toBeInTheDocument();
    fireEvent.click(dismiss);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('has role alert', () => {
    render(<ErrorMessage message="Mensaje" />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('shows both retry and dismiss when both provided', () => {
    render(
      <ErrorMessage
        message="Error"
        onRetry={() => {}}
        onDismiss={() => {}}
      />
    );
    expect(screen.getByRole('button', { name: /Reintentar/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Cerrar/i })).toBeInTheDocument();
  });
});
