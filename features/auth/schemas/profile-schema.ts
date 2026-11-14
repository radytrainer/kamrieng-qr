import { z } from "zod";
import type { ValidationT } from "@/lib/i18n/types";

export function createProfileFormSchema(t: ValidationT) {
  return z.object({
    displayName: z.string().trim().min(1, t("required")),
  });
}

export type ProfileFormInput = z.input<
  ReturnType<typeof createProfileFormSchema>
>;
export type ProfileFormValues = z.output<
  ReturnType<typeof createProfileFormSchema>
>;
