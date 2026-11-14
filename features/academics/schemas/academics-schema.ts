import { z } from "zod";
import type { ValidationT } from "@/lib/i18n/types";

const optionalText = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v === "" ? undefined : v));

const uuidOrEmpty = z
  .union([z.uuid(), z.literal("")])
  .optional()
  .transform((v) => (v === "" ? undefined : v));

export function createAcademicYearFormSchema(t: ValidationT) {
  return z
    .object({
      name: z.string().trim().min(1, t("required")),
      startDate: z.string().min(1, t("required")),
      endDate: z.string().min(1, t("required")),
      isCurrent: z.boolean().default(false),
    })
    .refine((data) => data.endDate > data.startDate, {
      message: t("endDateAfterStart"),
      path: ["endDate"],
    });
}
export type AcademicYearFormInput = z.input<
  ReturnType<typeof createAcademicYearFormSchema>
>;
export type AcademicYearFormValues = z.output<
  ReturnType<typeof createAcademicYearFormSchema>
>;

export function createClassFormSchema(t: ValidationT) {
  return z.object({
    name: z.string().trim().min(1, t("required")),
    academicYearId: z.uuid(t("selectAcademicYear")),
    departmentId: uuidOrEmpty,
    studyProgramId: uuidOrEmpty,
    gradeLevel: z.coerce.number().int().min(1).max(13).optional(),
    capacity: z.coerce.number().int().min(1).optional(),
  });
}
export type ClassFormInput = z.input<ReturnType<typeof createClassFormSchema>>;
export type ClassFormValues = z.output<
  ReturnType<typeof createClassFormSchema>
>;

export function createGenerateClassesFormSchema(t: ValidationT) {
  return z.object({
    academicYearId: z.uuid(t("selectAcademicYear")),
    gradeLevel: z.coerce.number().int().min(1).max(13),
    namePrefix: z.string().trim().min(1, t("required")),
    // Kept as a raw string here (not split into an array) — turning this
    // field into a different shape between input/output breaks
    // zodResolver's generics against useForm<GenerateClassesFormInput>().
    // splitSections() below does the actual parsing, called after .parse().
    sections: z.string().trim().min(1, t("required")),
    departmentId: uuidOrEmpty,
    studyProgramId: uuidOrEmpty,
    capacity: z.coerce.number().int().min(1).optional(),
  });
}
export type GenerateClassesFormInput = z.input<
  ReturnType<typeof createGenerateClassesFormSchema>
>;
export type GenerateClassesFormValues = z.output<
  ReturnType<typeof createGenerateClassesFormSchema>
>;

/** "A,B,C" / "A B C" -> ["A","B","C"], deduped — one class gets created per
 * resulting token, named `${namePrefix}${section}`. */
export function splitSections(value: string): string[] {
  return Array.from(
    new Set(
      value
        .split(/[,\s]+/)
        .map((s) => s.trim())
        .filter(Boolean)
    )
  );
}

export function createDepartmentFormSchema(t: ValidationT) {
  return z.object({
    code: z.string().trim().min(1, t("required")),
    nameEn: z.string().trim().min(1, t("required")),
    nameKm: optionalText,
    description: optionalText,
    isActive: z.boolean().default(true),
  });
}
export type DepartmentFormInput = z.input<
  ReturnType<typeof createDepartmentFormSchema>
>;
export type DepartmentFormValues = z.output<
  ReturnType<typeof createDepartmentFormSchema>
>;
