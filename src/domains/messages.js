import { createMessage, listMessages } from '../store.js';

export function getMessages() {
  return listMessages();
}

export function sendMessage(payload) {
  if (!payload.contactName || !payload.body) {
    throw new Error('contactName and body are required.');
  }

  return createMessage(payload);
}
