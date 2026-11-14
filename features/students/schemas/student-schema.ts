import { z } from "zod";
import { STUDENT_STATUS } from "@/lib/constants/student-status";
import { splitKhmerName } from "@/lib/utils/student-name";
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

export function createStudentFormSchema(t: ValidationT) {
  return z
    .object({
      // Primary fields — mirror the school's own record-keeping sheet.
      studentCode: optionalText,
      name: z.string().trim().min(1, t("required")), // Khmer full name
      gender: z.enum(["male", "female", "other"]),
      dateOfBirth: z.string().min(1, t("required")), // yyyy-MM-dd
      phone: optionalText,
      address: optionalText,
      classId: uuidOrEmpty,
      photoUrl: optionalText,

      // Parents — only collected on creation; edited afterward via the
      // Parents/Guardians card on the student profile.
      fatherName: optionalText,
      fatherPhone: optionalText,
      fatherJob: optionalText,
      motherName: optionalText,
      motherPhone: optionalText,
      motherJob: optionalText,

      // Advanced / optional — tucked behind a collapsible section in the form.
      placeOfBirth: optionalText,
      nationality: z.string().trim().min(1).default("Khmer"),
      email: z
        .union([z.email(), z.literal("")])
        .optional()
        .transform((v) => (v === "" ? undefined : v)),
      province: optionalText,
      district: optionalText,
      commune: optionalText,
      village: optionalText,
      departmentId: uuidOrEmpty,
      studyProgramId: uuidOrEmpty,
      academicYearId: uuidOrEmpty,
      studyYear: z.coerce.number().int().min(1).max(13).optional(),
      semester: z.union([z.literal(1), z.literal(2)]).optional(),
      gpa: z.coerce.number().min(0).max(4).optional(),
      creditsEarned: z.coerce.number().int().min(0).default(0),
      status: z
        .enum([
          STUDENT_STATUS.ACTIVE,
          STUDENT_STATUS.INACTIVE,
          STUDENT_STATUS.GRADUATED,
          STUDENT_STATUS.SUSPENDED,
          STUDENT_STATUS.TRANSFERRED,
          STUDENT_STATUS.EXPELLED,
        ])
        .default(STUDENT_STATUS.ACTIVE),
      issueDate: optionalText,
      expiryDate: optionalText,
    })
    .transform((data) => {
      // The UI only collects one Khmer name. English name columns still exist
      // (required, not-null in the DB) so we mirror the Khmer split into them
      // as a placeholder — editable later once real transliterations exist.
      const { first, last } = splitKhmerName(data.name);
      return {
        ...data,
        khmerFirstName: first,
        khmerLastName: last,
        englishFirstName: first,
        englishLastName: last,
      };
    });
}

export type StudentFormInput = z.input<
  ReturnType<typeof createStudentFormSchema>
>;
export type StudentFormValues = z.output<
  ReturnType<typeof createStudentFormSchema>
>;

export const studentFilterSchema = z.object({
  search: z.string().trim().optional(),
  status: z.string().optional(),
  departmentId: z.string().optional(),
  classId: z.string().optional(),
  academicYearId: z.string().optional(),
  gradeLevel: z.coerce.number().int().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export type StudentFilterInput = z.infer<typeof studentFilterSchema>;
