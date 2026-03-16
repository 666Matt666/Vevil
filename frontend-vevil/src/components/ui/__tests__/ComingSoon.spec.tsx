import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ComingSoon } from '../ComingSoon';

const renderWithRouter = (ui: React.ReactElement) =>
  render(<BrowserRouter>{ui}</BrowserRouter>);

describe('ComingSoon', () => {
  it('renders title and default description', () => {
    renderWithRouter(<ComingSoon title="Auditoría" />);
    expect(screen.getByRole('heading', { name: 'Auditoría' })).toBeInTheDocument();
    expect(screen.getByText(/Esta sección estará disponible pronto/)).toBeInTheDocument();
  });

  it('renders custom description when provided', () => {
    renderWithRouter(
      <ComingSoon title="Prueba" description="Texto personalizado aquí." />
    );
    expect(screen.getByText('Texto personalizado aquí.')).toBeInTheDocument();
  });

  it('shows back link when showBackLink is true', () => {
    renderWithRouter(<ComingSoon title="X" showBackLink />);
    expect(screen.getByRole('link', { name: /Volver al inicio/ })).toBeInTheDocument();
  });

  it('hides back link when showBackLink is false', () => {
    renderWithRouter(<ComingSoon title="X" showBackLink={false} />);
    expect(screen.queryByRole('link', { name: /Volver al inicio/ })).not.toBeInTheDocument();
  });
});
