/**
 * IST Timezone Utilities
 *
 * Uses built-in JavaScript Intl timezone handling.
 * Works consistently in both local (IST) and server (UTC) environments.
 * No manual offset calculations.
 */

/** Get today's date in IST as YYYY-MM-DD */
export function getTodayIST() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
}

/** Convert a UTC timestamp to IST date string (YYYY-MM-DD) */
export function toISTDateString(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
}

/**
 * Get date N days ago in IST as YYYY-MM-DD.
 * Computes today's IST date, then subtracts N days.
 */
export function getISTDaysAgo(n) {
  const today = getTodayIST();
  const [y, m, d] = today.split('-').map(Number);
  const past = new Date(y, m - 1, d - n);
  return `${past.getFullYear()}-${String(past.getMonth() + 1).padStart(2, '0')}-${String(past.getDate()).padStart(2, '0')}`;
}

/** Get first day of current month in IST as YYYY-MM-DD */
export function getISTMonthStartDate() {
  return getTodayIST().slice(0, 8) + '01';
}
