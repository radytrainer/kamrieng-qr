import { z } from "zod";
import type { ValidationT } from "@/lib/i18n/types";

export function createParentFormSchema(t: ValidationT) {
  return z.object({
    englishName: z.string().trim().min(1, t("required")),
    khmerName: z.string().trim().optional(),
    relationship: z.enum(["father", "mother", "guardian"]),
    phone: z.string().trim().optional(),
    email: z.union([z.email(), z.literal("")]).optional(),
    occupation: z.string().trim().optional(),
    isEmergencyContact: z.boolean().default(false),
  });
}

export type ParentFormInput = z.input<
  ReturnType<typeof createParentFormSchema>
>;
