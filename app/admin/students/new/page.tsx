import type { Metadata } from "next";
import { requireAdmin } from "@/lib/rbac/guards";
import { CreateStudentView } from "@/features/students/components/create-student-view";

export const metadata: Metadata = {
  title: "Add Student",
};

export default async function NewStudentPage() {
  await requireAdmin();
  return <CreateStudentView />;
}
