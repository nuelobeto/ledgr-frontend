// ASP.NET's DateOnly fields (Transaction.Date, RecurringTransaction.NextDueDate/EndDate)
// serialize as bare "yyyy-MM-dd" strings. `new Date("2026-07-02")` parses that as UTC
// midnight, so formatting it in any timezone behind UTC rolls it back a day (shows "Jul 1").
// Split and construct with the local-time constructor instead to keep the calendar date as-is.
export function parseDateOnly(value: string): Date {
  const [year, month, day] = value.split("-").map(Number)
  return new Date(year, month - 1, day)
}

export function formatDateOnly(
  value: string,
  options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" }
): string {
  return parseDateOnly(value).toLocaleDateString(undefined, options)
}

// For actual DateTime fields (CreatedAtUtc/UpdatedAtUtc, etc.) — these serialize as full
// ISO 8601 timestamps ("2026-07-02T05:34:01.48Z"), which `new Date()` parses unambiguously.
// The UTC-midnight rollback problem above is specific to bare date-only strings; don't use
// parseDateOnly here.
export function formatDateTime(
  value: string,
  options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" }
): string {
  return new Date(value).toLocaleDateString(undefined, options)
}
