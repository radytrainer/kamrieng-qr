import { z } from "zod";
import type { ValidationT } from "@/lib/i18n/types";

export function createCardTextSettingsFormSchema(t: ValidationT) {
  return z.object({
    cardIssueBuddhistLine: z.string().trim().min(1, t("required")),
    cardIssueGregorianLine: z.string().trim().min(1, t("required")),
  });
}
export type CardTextSettingsFormInput = z.input<
  ReturnType<typeof createCardTextSettingsFormSchema>
>;
export type CardTextSettingsFormValues = z.output<
  ReturnType<typeof createCardTextSettingsFormSchema>
>;
