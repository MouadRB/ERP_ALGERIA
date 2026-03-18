import { BUSINESS_HOURS } from '../constants/businessHours';

const BUSINESS_START_HOUR = parseInt(BUSINESS_HOURS.start.split(':')[0], 10); // 8
const BUSINESS_END_HOUR = parseInt(BUSINESS_HOURS.end.split(':')[0], 10);     // 20
const BUSINESS_DURATION_MS = (BUSINESS_END_HOUR - BUSINESS_START_HOUR) * 60 * 60 * 1000;

/**
 * Returns the wall-clock Date at which `durationMs` of *business time*
 * will have elapsed, starting from `from`.
 *
 * The auto-cancel timer pauses outside 08:00–20:00 Africa/Algiers.
 * This is used for:
 *  - BC approval timeout
 *  - Order auto-cancel after N business hours
 */
export const calculateAutoCancelAt = (
  from: Date,
  durationMs: number,
): Date => {
  let remaining = durationMs;
  let cursor = new Date(from);

  while (remaining > 0) {
    const algiersHour = getAlgiersHour(cursor);

    if (algiersHour < BUSINESS_START_HOUR) {
      // Before business hours — jump to start of business
      cursor = setAlgiersHour(cursor, BUSINESS_START_HOUR);
      continue;
    }

    if (algiersHour >= BUSINESS_END_HOUR) {
      // After business hours — jump to next day's business start
      cursor = setAlgiersHour(addDays(cursor, 1), BUSINESS_START_HOUR);
      continue;
    }

    // We are within business hours — how many ms until end of business day?
    const endOfBusinessToday = setAlgiersHour(cursor, BUSINESS_END_HOUR);
    const msUntilEndOfDay = endOfBusinessToday.getTime() - cursor.getTime();

    if (remaining <= msUntilEndOfDay) {
      cursor = new Date(cursor.getTime() + remaining);
      remaining = 0;
    } else {
      remaining -= msUntilEndOfDay;
      cursor = setAlgiersHour(addDays(cursor, 1), BUSINESS_START_HOUR);
    }
  }

  return cursor;
};

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Returns the current hour (0–23) in Africa/Algiers timezone.
 */
const getAlgiersHour = (date: Date): number => {
  return parseInt(
    date.toLocaleString('en-US', {
      timeZone: BUSINESS_HOURS.timezone,
      hour: 'numeric',
      hour12: false,
    }),
    10,
  );
};

/**
 * Returns a new Date representing the same calendar day in Africa/Algiers
 * but at a specific hour (minutes/seconds zeroed).
 */
const setAlgiersHour = (date: Date, hour: number): Date => {
  const algiersStr = date.toLocaleString('en-US', {
    timeZone: BUSINESS_HOURS.timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  // algiersStr is "MM/DD/YYYY"
  const [month, day, year] = algiersStr.split('/');
  const isoDate = `${year}-${month}-${day}T${String(hour).padStart(2, '0')}:00:00`;

  // Parse as Africa/Algiers local time → UTC
  const local = new Date(isoDate);
  const offset = getAlgiersOffset(local);
  return new Date(local.getTime() - offset);
};

/**
 * Returns Africa/Algiers UTC offset in ms for a given Date.
 * Algeria is UTC+1 year-round (no DST).
 */
const getAlgiersOffset = (_date: Date): number => {
  // Algeria does not observe DST — always UTC+1
  return -1 * 60 * 60 * 1000;
};

const addDays = (date: Date, days: number): Date =>
  new Date(date.getTime() + days * 24 * 60 * 60 * 1000);