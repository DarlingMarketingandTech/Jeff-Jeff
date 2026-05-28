import { createScheduleEntry, listSchedule, updateScheduleEntry } from '../store.js';
import { AppError } from '../errors.js';

function isIsoDate(value) {
  if (typeof value !== 'string') {
    return false;
  }
  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) {
    return false;
  }
  return new Date(timestamp).toISOString() === value;
}

export function getSchedule(filters = {}) {
  const entries = listSchedule();

  return entries.filter((entry) => {
    const entryStart = Date.parse(entry.start);
    const entryEnd = Date.parse(entry.end);
    if (Number.isNaN(entryStart) || Number.isNaN(entryEnd)) {
      return false;
    }

    if (filters.from) {
      const from = Date.parse(filters.from);
      if (Number.isNaN(from) || entryStart < from) {
        return false;
      }
    }

    if (filters.to) {
      const to = Date.parse(filters.to);
      if (Number.isNaN(to) || entryEnd > to) {
        return false;
      }
    }

    return true;
  });
}

export function createSchedule(payload) {
  if (!payload.clientName || !payload.start || !payload.end) {
    throw new AppError('clientName, start, and end are required.');
  }
  if (!isIsoDate(payload.start) || !isIsoDate(payload.end)) {
    throw new AppError('start and end must be ISO-8601 date-time strings.');
  }

  return createScheduleEntry(payload);
}

export function patchSchedule(id, payload) {
  return updateScheduleEntry(id, payload);
}
