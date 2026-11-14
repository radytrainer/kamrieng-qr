import type { Metadata } from "next";
import { requireStaff } from "@/lib/rbac/guards";
import { StudentsListView } from "@/features/students/components/students-list-view";

export const metadata: Metadata = {
  title: "Students",
};

export default async function StudentsPage() {
  const session = await requireStaff();
  return <StudentsListView role={session.role} />;
}
