import { shouldRefreshUserSession } from './shouldRefreshUserSession';

test('returns false when difference < 5 minutes', (done) => {
  const issuedAt = new Date('2019-01-01T00:00:00.000Z');
  const requestedAt = new Date('2019-01-01T00:04:99.999Z');

  const actual = shouldRefreshUserSession(requestedAt, issuedAt);
  expect(actual).toBe(false);
  done();
});

test('returns true when difference >= 5 minutes', (done) => {
  const issuedAt = new Date('2019-01-01T00:00:00.000Z');
  const requestedAt = new Date('2019-01-01T00:05:00.000Z');

  const actual = shouldRefreshUserSession(requestedAt, issuedAt);
  expect(actual).toBe(true);
  done();
});