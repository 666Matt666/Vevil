import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EmptyState } from '../EmptyState';

describe('EmptyState', () => {
  it('renders icon, title, and description', () => {
    render(
      <EmptyState
        icon="👥"
        title="No items found"
        description="Add some items to get started"
      />
    );

    expect(screen.getByText('👥')).toBeInTheDocument();
    expect(screen.getByText('No items found')).toBeInTheDocument();
    expect(screen.getByText('Add some items to get started')).toBeInTheDocument();
  });

  it('renders action button when provided', () => {
    const mockOnAction = vi.fn();
    render(
      <EmptyState
        icon="👥"
        title="No items"
        action={<button onClick={mockOnAction}>Add Item</button>}
      />
    );

    const button = screen.getByText('Add Item');
    expect(button).toBeInTheDocument();

    fireEvent.click(button);
    expect(mockOnAction).toHaveBeenCalled();
  });

  it('does not render action button when not provided', () => {
    render(
      <EmptyState
        icon="👥"
        title="No items"
      />
    );

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('does not render description when not provided', () => {
    render(
      <EmptyState
        icon="👥"
        title="No items"
      />
    );

    const paragraphs = screen.getAllByText(/No items/);
    expect(paragraphs).toHaveLength(1);
  });
});