import { BUSINESS_HOURS } from '../constants/businessHours';

const BUSINESS_START_HOUR = parseInt(BUSINESS_HOURS.start.split(':')[0], 10);
const BUSINESS_END_HOUR = parseInt(BUSINESS_HOURS.end.split(':')[0], 10);

/**
 * Returns the number of *business minutes* between `from` and `to`.
 * Only minutes within 08:00–20:00 Africa/Algiers are counted.
 * Returns 0 if `to` is before `from`.
 *
 * Used for SLA tracking:
 *  - COD ReconciliationException SLA: 4h  = 240 business minutes
 *  - Bank ReconciliationException SLA: 24h = 1440 business minutes
 */
export const businessMinutesUntil = (from: Date, to: Date): number => {
  if (to <= from) return 0;

  let minutes = 0;
  let cursor = new Date(from);

  while (cursor < to) {
    const algiersHour = getAlgiersHour(cursor);

    if (algiersHour < BUSINESS_START_HOUR) {
      cursor = setAlgiersHour(cursor, BUSINESS_START_HOUR);
      continue;
    }

    if (algiersHour >= BUSINESS_END_HOUR) {
      cursor = setAlgiersHour(addDays(cursor, 1), BUSINESS_START_HOUR);
      continue;
    }

    // Advance one minute at a time within business hours
    const nextMinute = new Date(cursor.getTime() + 60 * 1000);
    const effectiveEnd = to < nextMinute ? to : nextMinute;
    const effectiveAlgiersHour = getAlgiersHour(effectiveEnd);

    if (effectiveAlgiersHour <= BUSINESS_END_HOUR) {
      const diffMs = effectiveEnd.getTime() - cursor.getTime();
      minutes += diffMs / (60 * 1000);
    }

    cursor = nextMinute;
  }

  return Math.floor(minutes);
};

// ─── Helpers (same as calculateAutoCancelAt) ─────────────────────────────────

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

const setAlgiersHour = (date: Date, hour: number): Date => {
  const algiersStr = date.toLocaleString('en-US', {
    timeZone: BUSINESS_HOURS.timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const [month, day, year] = algiersStr.split('/');
  const isoDate = `${year}-${month}-${day}T${String(hour).padStart(2, '0')}:00:00`;
  const local = new Date(isoDate);
  return new Date(local.getTime() + 60 * 60 * 1000); // UTC+1
};

const addDays = (date: Date, days: number): Date =>
  new Date(date.getTime() + days * 24 * 60 * 60 * 1000);