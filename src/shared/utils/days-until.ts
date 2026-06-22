/**
 * Due-date countdown utilities.
 * Due time is always 8 PM local time on the given ISO date (YYYY-MM-DD).
 */

/** Compute whole days until 8 PM local time on the given ISO date. Negative means overdue. */
export function daysUntil(isoDate: string): number {
  const parts = isoDate.split('-')
  const y = Number(parts[0])
  const m = Number(parts[1])
  const d = Number(parts[2])
  const dueMs = new Date(y, m - 1, d, 20, 0, 0).getTime()
  return Math.floor((dueMs - Date.now()) / 86400000)
}

/** Format a due date as a compact countdown string for display. */
export function formatDue(isoDate: string): string {
  const d = daysUntil(isoDate)
  if (d > 0) return `${d}d`
  if (d === 0) return 'TODAY'
  return `-${Math.abs(d)}d`
}

/** Return true if the due date has passed 8 PM local time. */
export function isOverdue(isoDate: string): boolean {
  return daysUntil(isoDate) < 0
}
