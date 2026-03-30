/** Server-safe relative time (avoids client hydration mismatch when used in RSC). */
export function formatRelativeTime(d: Date, now = new Date()): string {
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  const diffMs = d.getTime() - now.getTime();
  const sec = Math.round(diffMs / 1000);
  const absSec = Math.abs(sec);
  if (absSec < 60) return rtf.format(sec, "second");
  const min = Math.round(diffMs / 60000);
  if (Math.abs(min) < 60) return rtf.format(min, "minute");
  const hour = Math.round(diffMs / 3600000);
  if (Math.abs(hour) < 24) return rtf.format(hour, "hour");
  const day = Math.round(diffMs / 86400000);
  if (Math.abs(day) < 30) return rtf.format(day, "day");
  const month = Math.round(diffMs / (86400000 * 30));
  if (Math.abs(month) < 12) return rtf.format(month, "month");
  return rtf.format(Math.round(diffMs / (86400000 * 365)), "year");
}
