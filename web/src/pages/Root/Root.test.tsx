import React from 'react';
import Root from './Root';
import { render } from '@testing-library/react';
import { getStore } from '../../store';
import { Client } from '../../client';

it('renders without crashing', () => {
  const client = Client.create(Client.TEST_URI);
  const store = getStore(client);
  const { container } = render(<Root store={store} client={client} />);
  expect(container).toBeInTheDocument();
});