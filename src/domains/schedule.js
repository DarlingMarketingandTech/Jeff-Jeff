import { createScheduleEntry, listSchedule, updateScheduleEntry } from '../store.js';

export function getSchedule(filters = {}) {
  const entries = listSchedule();

  return entries.filter((entry) => {
    if (filters.from && entry.start < filters.from) {
      return false;
    }

    if (filters.to && entry.end > filters.to) {
      return false;
    }

    return true;
  });
}

export function createSchedule(payload) {
  if (!payload.clientName || !payload.start || !payload.end) {
    throw new Error('clientName, start, and end are required.');
  }

  return createScheduleEntry(payload);
}

export function patchSchedule(id, payload) {
  return updateScheduleEntry(id, payload);
}
