import type { useTranslations } from "next-intl";

/** Shape of `useTranslations("validation")` (client) / the resolved value of
 * `getTranslations("validation")` (server) — both produce a structurally
 * identical translator, so this one type covers zod schema factories used
 * from either side. */
export type ValidationT = ReturnType<typeof useTranslations<"validation">>;
