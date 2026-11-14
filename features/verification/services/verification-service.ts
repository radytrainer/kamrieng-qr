import "server-only";
import { studentRepository } from "@/features/students/services/student-repository";
import { logActivity } from "@/lib/repositories/activity-log-repository";
import { STUDENT_STATUS } from "@/lib/constants/student-status";
import { isPastDate } from "@/lib/utils/date";
import type { VerificationResult } from "@/features/verification/types/verification";

export async function verifyStudentToken(
  token: string,
  viewerUserId: string | null
): Promise<VerificationResult> {
  const student = await studentRepository.getPublicProfileByToken(token);

  await logActivity({
    userId: viewerUserId,
    action: "qr.scanned",
    entityType: "student",
    entityId: student?.id ?? null,
    metadata: { found: Boolean(student) },
  });

  if (!student) {
    return { outcome: "not_found", student: null };
  }

  const isExpired =
    isPastDate(student.expiry_date) ||
    isPastDate(student.academic_year_end_date);

  if (student.status === STUDENT_STATUS.ACTIVE && isExpired) {
    return { outcome: "expired", student };
  }

  if (student.status === STUDENT_STATUS.ACTIVE) {
    return { outcome: "success", student };
  }

  return { outcome: "inactive", student };
}
