const KHMER_DIGITS = ["០", "១", "២", "៣", "៤", "៥", "៦", "៧", "៨", "៩"];

/** Converts Arabic digits in a string/number to Khmer numerals, leaving
 * non-digit characters (e.g. "/" separators) untouched. */
export function toKhmerNumeral(value: number | string): string {
  return String(value)
    .split("")
    .map((c) => KHMER_DIGITS[Number(c)] ?? c)
    .join("");
}

export const KHMER_MONTHS = [
  "មករា",
  "កុម្ភៈ",
  "មីនា",
  "មេសា",
  "ឧសភា",
  "មិថុនា",
  "កក្កដា",
  "សីហា",
  "កញ្ញា",
  "តុលា",
  "វិច្ឆិកា",
  "ធ្នូ",
];

/** "YYYY-MM-DD" -> Khmer-numeral "DD/MM/YYYY". Parses the date string
 * directly rather than going through a Date object, to avoid any
 * timezone-shift risk from UTC-midnight parsing + local getters. */
export function formatKhmerDateSlash(value: string | null): string {
  if (!value) return "—";
  const [year, month, day] = value.split("-");
  if (!year || !month || !day) return value;
  return toKhmerNumeral(`${day}/${month}/${year}`);
}

/** "YYYY-MM-DD" -> "DD <Khmer month name> YYYY", e.g. "១៦ មីនា ២០១៤". */
export function formatKhmerDateLong(value: string | null): string {
  if (!value) return "—";
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return value;
  return `${toKhmerNumeral(day)} ${KHMER_MONTHS[month - 1]} ${toKhmerNumeral(year)}`;
}
