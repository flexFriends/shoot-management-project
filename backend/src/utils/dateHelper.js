import { startOfDay, endOfDay, addDays, format } from 'date-fns';
import datesFnTz from 'date-fns-tz';

const { utcToZonedTime, zonedTimeToUtc } = datesFnTz;

const TIMEZONE = process.env.TIMEZONE || 'UTC';

/**
 * Get current date in studio timezone
 */
export const getNowInTimezone = () => {
  return utcToZonedTime(new Date(), TIMEZONE);
};

/**
 * Get tomorrow in studio timezone
 */
export const getTomorrowInTimezone = () => {
  const now = getNowInTimezone();
  return addDays(now, 1);
};

/**
 * Get start of day in UTC (for database queries)
 */
export const getStartOfDayUTC = (date = new Date()) => {
  const zonedDate = utcToZonedTime(date, TIMEZONE);
  const start = startOfDay(zonedDate);
  return zonedTimeToUtc(start, TIMEZONE);
};

/**
 * Get end of day in UTC (for database queries)
 */
export const getEndOfDayUTC = (date = new Date()) => {
  const zonedDate = utcToZonedTime(date, TIMEZONE);
  const end = endOfDay(zonedDate);
  return zonedTimeToUtc(end, TIMEZONE);
};

/**
 * Check if given date is today
 */
export const isToday = (date) => {
  const today = getNowInTimezone();
  const checkDate = utcToZonedTime(date, TIMEZONE);
  return format(today, 'yyyy-MM-dd') === format(checkDate, 'yyyy-MM-dd');
};

export default {
  getNowInTimezone,
  getTomorrowInTimezone,
  getStartOfDayUTC,
  getEndOfDayUTC,
  isToday,
};
