import { getViewport } from './getViewport';
import { Breakpoint } from './types';

it.each(['xs', 'sm', 'md', 'lg', 'xl', 'xxl'] as Breakpoint[])('creates a viewport object', (breakpoint) => {
  const viewport = getViewport(breakpoint);

  expect(viewport.breakpoint).toBe(breakpoint);

  for (const [key, val] of Object.entries(viewport)) {
    if (key === 'breakpoint') {
      continue;
    }
    expect(val).toBe(key === breakpoint);
  }
});