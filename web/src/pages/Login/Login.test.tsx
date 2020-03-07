import React from 'react';
import Login from './Login';
import { render, fireEvent } from '@testing-library/react';
import { getTestComponent } from '../../testing';

it('renders without crashing', () => {
  const { TestComponent } = getTestComponent(Login, {});
  const { container } = render(<TestComponent />);
  expect(container).toBeInTheDocument();
});

it.each(['/library', '/signup'])('has useful links', (href) => {
  const { TestComponent } = getTestComponent(Login, {});
  const { container } = render(<TestComponent />);

  expect(
    container.querySelectorAll<HTMLAnchorElement>(`a[href="${href}"]`).length
  ).toBeGreaterThan(0);
});

it.each(['email or username', 'password'])(
  'has required fields',
  (placeholderText) => {
    const { TestComponent } = getTestComponent(Login, {});
    const { getByPlaceholderText } = render(<TestComponent />);

    expect(getByPlaceholderText(placeholderText)).toBeInTheDocument();
  }
);

it('validates the presence of email and password', () => {
  const { TestComponent } = getTestComponent(Login, {});

  const { getByTestId, getByText } = render(<TestComponent />);
  fireEvent.submit(getByTestId('login-form'));

  expect(getByText('email or username is required')).toBeInTheDocument();
  expect(getByText('password is required')).toBeInTheDocument();
});