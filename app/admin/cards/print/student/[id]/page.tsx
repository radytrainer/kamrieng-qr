import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/rbac/guards";
import { studentRepository } from "@/features/students/services/student-repository";
import { isCardExpired } from "@/features/students/utils/card-status";
import { generateStudentQrDataUrl } from "@/features/qr/services/qr-generator";
import { SingleCardPrintView } from "@/features/cards/components/single-card-print-view";
import { OfficialStudentCard } from "@/features/cards/templates/official-student-card";
import { schoolSettingsRepository } from "@/features/settings/services/school-settings-repository";

export const metadata: Metadata = {
  title: "Print Student Card",
};

export default async function PrintStudentCardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const [student, schoolSettings] = await Promise.all([
    studentRepository.getOfficialCardById(id),
    schoolSettingsRepository.get(),
  ]);
  if (!student) notFound();

  const qrDataUrl = await generateStudentQrDataUrl(student.student_token, {
    size: 200,
  });

  return (
    <SingleCardPrintView
      personName={`${student.khmer_first_name} ${student.khmer_last_name}`}
      isExpired={isCardExpired(student)}
    >
      <OfficialStudentCard
        student={student}
        qrDataUrl={qrDataUrl}
        schoolSettings={schoolSettings}
      />
    </SingleCardPrintView>
  );
}
