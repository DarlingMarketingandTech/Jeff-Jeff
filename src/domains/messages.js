import { createMessage, listMessages } from '../store.js';
import { AppError } from '../errors.js';

export function getMessages() {
  return listMessages();
}

export function sendMessage(payload) {
  if (!payload.contactName || !payload.body) {
    throw new AppError('contactName and body are required.');
  }

  return createMessage(payload);
}
