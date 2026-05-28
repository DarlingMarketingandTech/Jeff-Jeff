import { timingSafeEqual } from 'node:crypto';
import { AppError } from '../errors.js';

function safeEqual(left, right) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

export function validateCredentials(username, password) {
  const configuredUser = process.env.JEFF_USER ?? 'jeff';
  const configuredPassword = process.env.JEFF_PASS ?? 'chill-mode';

  if (process.env.NODE_ENV === 'production' && !process.env.JEFF_PASS) {
    throw new AppError('JEFF_PASS must be configured in production.', 500, false);
  }

  return safeEqual(username, configuredUser) && safeEqual(password, configuredPassword);
}

export function issueToken(role = 'internal') {
  const baseToken = process.env.JEFF_INTERNAL_TOKEN ?? 'jeff-local-token';
  if (process.env.NODE_ENV === 'production' && !process.env.JEFF_INTERNAL_TOKEN) {
    throw new AppError('JEFF_INTERNAL_TOKEN must be configured in production.', 500, false);
  }
  return `${baseToken}:${role}`;
}

export function parseToken(token) {
  if (!token) {
    return null;
  }

  const parts = token.split(':');
  if (parts.length !== 2) {
    return null;
  }

  const [configuredToken, role] = parts;
  const expectedToken = process.env.JEFF_INTERNAL_TOKEN ?? 'jeff-local-token';

  if (!configuredToken || !role || !safeEqual(configuredToken, expectedToken)) {
    return null;
  }

  if (!['internal', 'client'].includes(role)) {
    return null;
  }

  return { role };
}
