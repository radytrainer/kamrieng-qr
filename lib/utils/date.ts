export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function isPastDate(date: string | null | undefined): boolean {
  return Boolean(date) && date! < todayIso();
}

/** The earliest of several dates, ignoring nulls/undefined — null if none
 * are set. Used to combine multiple expiry sources (e.g. a student's own
 * academic year and their class's) so whichever one lapses first governs;
 * isPastDate(earliestDate(a, b)) is equivalent to isPastDate(a) || isPastDate(b). */
export function earliestDate(
  ...dates: Array<string | null | undefined>
): string | null {
  const defined = dates.filter((d): d is string => Boolean(d));
  if (defined.length === 0) return null;
  return defined.reduce((min, d) => (d < min ? d : min));
}
