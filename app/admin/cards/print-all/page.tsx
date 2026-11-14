import type { Metadata } from "next";
import { requireAdmin } from "@/lib/rbac/guards";
import { studentRepository } from "@/features/students/services/student-repository";
import { generateStudentQrDataUrl } from "@/features/qr/services/qr-generator";
import { OfficialCardsPrintView } from "@/features/cards/components/official-cards-print-view";
import { schoolSettingsRepository } from "@/features/settings/services/school-settings-repository";

export const metadata: Metadata = {
  title: "Print All Student Cards",
};

export default async function PrintAllStudentCardsPage({
  searchParams,
}: {
  searchParams: Promise<{
    ids?: string;
    search?: string;
    classId?: string;
    gradeLevel?: string;
  }>;
}) {
  await requireAdmin();
  const { ids, search, classId, gradeLevel } = await searchParams;

  // An explicit checkbox selection (ids) overrides the table filters —
  // print exactly what was picked, regardless of the current search/class.
  const [students, schoolSettings] = await Promise.all([
    studentRepository.listActiveForOfficialCard(
      ids
        ? { ids: ids.split(",").filter(Boolean) }
        : {
            search,
            classId,
            gradeLevel: gradeLevel ? Number(gradeLevel) : undefined,
          }
    ),
    schoolSettingsRepository.get(),
  ]);

  const withQr = await Promise.all(
    students.map(async (student) => ({
      student,
      qrDataUrl: await generateStudentQrDataUrl(student.student_token, {
        size: 200,
      }),
    }))
  );

  return (
    <OfficialCardsPrintView students={withQr} schoolSettings={schoolSettings} />
  );
}
