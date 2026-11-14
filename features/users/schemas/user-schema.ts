import { z } from "zod";
import type { ValidationT } from "@/lib/i18n/types";

export const ASSIGNABLE_ROLES = [
  "super_admin",
  "school_admin",
  "teacher",
  "student",
] as const;

export function createUserFormSchema(t: ValidationT) {
  return z.object({
    email: z.email(t("emailInvalid")),
    displayName: z.string().trim().min(1, t("required")),
    roleCode: z.enum(ASSIGNABLE_ROLES),
    isActive: z.boolean().default(true),
  });
}

export type UserFormInput = z.input<ReturnType<typeof createUserFormSchema>>;
export type UserFormValues = z.output<ReturnType<typeof createUserFormSchema>>;

export const userFilterSchema = z.object({
  search: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export type UserFilterInput = z.infer<typeof userFilterSchema>;
