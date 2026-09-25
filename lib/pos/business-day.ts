/**
 * Business-day boundaries.
 *
 * A restaurant day does not end at midnight: a ticket opened at 01:30 belongs
 * to the evening that is still running. Ticket numbering, shift reports and the
 * Z-report reconciliation all key off this, so it lives in one pure function.
 *
 * The UTC offset is passed in rather than read from the process: the server may
 * run in UTC while the venue is in Istanbul. A per-restaurant timezone field is
 * the natural next step once COSTERA runs venues in more than one zone.
 */

export const BUSINESS_DAY_START_HOUR = 6;
export const DEFAULT_UTC_OFFSET_MINUTES = 180; // Turkiye, UTC+3

/**
 * The business day `at` falls into, as a UTC-midnight Date suitable for a
 * Prisma `@db.Date` column.
 */
export function businessDayFor(
  at: Date,
  startHour: number = BUSINESS_DAY_START_HOUR,
  utcOffsetMinutes: number = DEFAULT_UTC_OFFSET_MINUTES,
): Date {
  const local = new Date(at.getTime() + utcOffsetMinutes * 60_000);
  if (local.getUTCHours() < startHour) {
    local.setUTCDate(local.getUTCDate() - 1);
  }
  return new Date(Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate()));
}

/** Half-open [start, end) UTC instants covering a business day. */
export function businessDayRange(
  day: Date,
  startHour: number = BUSINESS_DAY_START_HOUR,
  utcOffsetMinutes: number = DEFAULT_UTC_OFFSET_MINUTES,
): { start: Date; end: Date } {
  const startLocal = Date.UTC(
    day.getUTCFullYear(),
    day.getUTCMonth(),
    day.getUTCDate(),
    startHour,
  );
  const start = new Date(startLocal - utcOffsetMinutes * 60_000);
  return { start, end: new Date(start.getTime() + 24 * 60 * 60 * 1000) };
}

/** `2026-09-25`, the form the ticket header and report filters use. */
export function businessDayKey(day: Date): string {
  return day.toISOString().slice(0, 10);
}

/**
 * HH:MM at the venue, not at the server. The report is read by someone who was
 * standing behind the till, so a UTC clock is simply the wrong time.
 */
export function venueTime(at: Date, utcOffsetMinutes: number = DEFAULT_UTC_OFFSET_MINUTES): string {
  return new Date(at.getTime() + utcOffsetMinutes * 60_000).toISOString().slice(11, 16);
}
