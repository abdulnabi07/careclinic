/**
 * IST Timezone Utilities
 *
 * Supabase stores timestamps in UTC. These helpers compute IST-based
 * date boundaries and return them as UTC ISO strings so they can be
 * compared directly against `created_at` values from the database.
 */

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

/**
 * Returns the UTC ISO string for the start of "today" in IST.
 */
export function getISTStartOfDay() {
  const now = new Date();
  const istTime = new Date(now.getTime() + IST_OFFSET_MS);
  istTime.setHours(0, 0, 0, 0);
  return new Date(istTime.getTime() - IST_OFFSET_MS).toISOString();
}

/**
 * Returns the UTC ISO string for the start of "7 days ago" in IST
 * (includes today, so we subtract 6 days).
 */
export function getISTLast7Days() {
  const now = new Date();
  const istTime = new Date(now.getTime() + IST_OFFSET_MS);
  istTime.setDate(istTime.getDate() - 6);
  istTime.setHours(0, 0, 0, 0);
  return new Date(istTime.getTime() - IST_OFFSET_MS).toISOString();
}

/**
 * Returns the UTC ISO string for the start of the current month in IST.
 */
export function getISTMonthStart() {
  const now = new Date();
  const istTime = new Date(now.getTime() + IST_OFFSET_MS);
  istTime.setDate(1);
  istTime.setHours(0, 0, 0, 0);
  return new Date(istTime.getTime() - IST_OFFSET_MS).toISOString();
}
