import fs from 'node:fs';
import path from 'node:path';

const dataDirectory = path.resolve(process.cwd(), 'data');
const storePath = path.join(dataDirectory, 'store.json');

const initialData = {
  schedule: [],
  messages: [],
};

function ensureStore() {
  if (!fs.existsSync(dataDirectory)) {
    fs.mkdirSync(dataDirectory, { recursive: true });
  }

  if (!fs.existsSync(storePath)) {
    fs.writeFileSync(storePath, JSON.stringify(initialData, null, 2));
  }
}

function readStore() {
  ensureStore();
  return JSON.parse(fs.readFileSync(storePath, 'utf8'));
}

function writeStore(data) {
  fs.writeFileSync(storePath, JSON.stringify(data, null, 2));
}

function nextId(collection) {
  const maxId = collection.reduce((currentMax, item) => {
    const id = item.id ?? 0;
    return id > currentMax ? id : currentMax;
  }, -1);
  return maxId + 1;
}

export function listSchedule() {
  return readStore().schedule;
}

export function createScheduleEntry(input) {
  const store = readStore();
  const entry = {
    id: nextId(store.schedule),
    clientName: input.clientName,
    start: input.start,
    end: input.end,
    status: input.status ?? 'scheduled',
    notes: input.notes ?? '',
    createdAt: new Date().toISOString(),
  };

  store.schedule.push(entry);
  writeStore(store);
  return entry;
}

export function updateScheduleEntry(id, input) {
  const store = readStore();
  const entry = store.schedule.find((item) => item.id === id);

  if (!entry) {
    return null;
  }

  if (input.status !== undefined) {
    entry.status = input.status;
  }
  if (input.notes !== undefined) {
    entry.notes = input.notes;
  }
  if (input.start !== undefined) {
    entry.start = input.start;
  }
  if (input.end !== undefined) {
    entry.end = input.end;
  }

  entry.updatedAt = new Date().toISOString();
  writeStore(store);
  return entry;
}

export function listMessages() {
  return readStore().messages;
}

export function createMessage(input) {
  const store = readStore();
  const message = {
    id: nextId(store.messages),
    contactName: input.contactName,
    channel: input.channel ?? 'sms',
    body: input.body,
    createdAt: new Date().toISOString(),
  };

  store.messages.push(message);
  writeStore(store);
  return message;
}
