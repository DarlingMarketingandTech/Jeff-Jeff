import test from 'node:test';
import assert from 'node:assert/strict';
import { getRoleCapabilities, hasCapability } from '../src/domains/permissions.js';

test('internal role has write capabilities', () => {
  assert.equal(hasCapability('internal', 'schedule:write'), true);
  assert.equal(hasCapability('internal', 'message:write'), true);
});

test('client role is read-only', () => {
  assert.equal(hasCapability('client', 'schedule:read'), true);
  assert.equal(hasCapability('client', 'schedule:write'), false);
  assert.deepEqual(getRoleCapabilities('client').sort(), ['message:read', 'schedule:read']);
});
