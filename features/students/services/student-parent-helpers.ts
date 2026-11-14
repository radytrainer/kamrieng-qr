import "server-only";
import { parentRepository } from "@/features/students/services/parent-repository";
import type { StudentFormValues } from "@/features/students/schemas/student-schema";

/** Creates father/mother parent records for a just-created student, when
 * the create form (or a bulk-import row) collected that info. A blank name
 * falls back to a placeholder ("Father"/"Mother") so a provided phone
 * number is never silently dropped — matches the convention used for the
 * original bulk data import. */
export async function createParentsForStudent(
  studentId: string,
  values: Pick<
    StudentFormValues,
    | "fatherName"
    | "fatherPhone"
    | "fatherJob"
    | "motherName"
    | "motherPhone"
    | "motherJob"
  >
): Promise<void> {
  const parents = [
    {
      relationship: "father" as const,
      name: values.fatherName,
      phone: values.fatherPhone,
      job: values.fatherJob,
    },
    {
      relationship: "mother" as const,
      name: values.motherName,
      phone: values.motherPhone,
      job: values.motherJob,
    },
  ];

  for (const parent of parents) {
    if (!parent.name && !parent.phone) continue;
    await parentRepository.addToStudent(studentId, {
      englishName:
        parent.name || (parent.relationship === "father" ? "Father" : "Mother"),
      khmerName: parent.name || undefined,
      relationship: parent.relationship,
      phone: parent.phone || undefined,
      occupation: parent.job || undefined,
      isEmergencyContact: false,
    });
  }
}
