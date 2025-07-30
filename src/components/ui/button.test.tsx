import React from 'react';
import { render, screen } from '@testing-library/react';
import { Button } from './button';

test('renders button with children', () => {
  render(<Button>Click me</Button>);
  const buttonElement = screen.getByText(/Click me/i);
  expect(buttonElement).toBeInTheDocument();
});
