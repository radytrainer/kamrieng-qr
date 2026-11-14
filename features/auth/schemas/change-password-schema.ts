import { z } from "zod";
import type { ValidationT } from "@/lib/i18n/types";

export function createChangePasswordFormSchema(t: ValidationT) {
  return z
    .object({
      currentPassword: z.string().min(1, t("required")),
      newPassword: z.string().min(6, t("passwordMinLength", { min: 6 })),
      confirmPassword: z.string().min(1, t("required")),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: t("passwordsDoNotMatch"),
      path: ["confirmPassword"],
    });
}

export type ChangePasswordFormInput = z.input<
  ReturnType<typeof createChangePasswordFormSchema>
>;
export type ChangePasswordFormValues = z.output<
  ReturnType<typeof createChangePasswordFormSchema>
>;
