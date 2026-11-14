import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireStaff } from "@/lib/rbac/guards";
import { studentRepository } from "@/features/students/services/student-repository";
import { StudentProfileView } from "@/features/students/components/student-profile-view";

export const metadata: Metadata = {
  title: "Student Profile",
};

export default async function StudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireStaff();
  const { id } = await params;

  const student = await studentRepository.getById(id);
  if (!student) notFound();

  return <StudentProfileView student={student} role={session.role} />;
}
