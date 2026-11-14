/** Splits a single Khmer full name into first/last at the first space —
 * matches the convention used across bulk-imported student data. Also used
 * as a placeholder for the (still-required) English name columns since the
 * UI only collects a Khmer name. */
export function splitKhmerName(fullName: string): {
  first: string;
  last: string;
} {
  const trimmed = fullName.trim();
  const spaceIdx = trimmed.indexOf(" ");
  if (spaceIdx === -1) return { first: trimmed, last: trimmed };
  return {
    first: trimmed.slice(0, spaceIdx),
    last: trimmed.slice(spaceIdx + 1).trim(),
  };
}

/** Accepts Khmer (ប្រុស/ស្រី) or English (male/female/other) gender values,
 * as either can appear in copy-pasted spreadsheet data. */
export function parseGender(
  raw: string | undefined
): "male" | "female" | "other" {
  const value = raw?.trim().toLowerCase();
  if (!value) return "other";
  if (value === "ប្រុស" || value === "male" || value === "m") return "male";
  if (value === "ស្រី" || value === "female" || value === "f") return "female";
  return "other";
}
