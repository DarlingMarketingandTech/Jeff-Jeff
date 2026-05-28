import test from 'node:test';
import assert from 'node:assert/strict';
import { issueToken, parseToken, validateCredentials } from '../src/domains/auth.js';

test('validates default credentials', () => {
  assert.equal(validateCredentials('jeff', 'chill-mode'), true);
  assert.equal(validateCredentials('jeff', 'bad-pass'), false);
});

test('issues and parses internal token', () => {
  const token = issueToken('internal');
  assert.deepEqual(parseToken(token), { role: 'internal' });
  assert.equal(parseToken('invalid-token'), null);
});
