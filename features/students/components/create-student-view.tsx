"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { StudentForm } from "@/features/students/components/student-form";
import { useCreateStudent } from "@/features/students/hooks/use-student-mutations";
import { ROUTES } from "@/lib/constants/routes";
import type { StudentFormInput } from "@/features/students/schemas/student-schema";

export function CreateStudentView() {
  const t = useTranslations("admin.students.create");
  const router = useRouter();
  const createStudent = useCreateStudent();

  const handleSubmit = async (values: StudentFormInput) => {
    const student = await createStudent.mutateAsync(values);
    router.push(ROUTES.admin.studentDetail(student.id));
  };

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground text-sm">{t("subtitle")}</p>
      </div>
      <StudentForm
        onSubmit={handleSubmit}
        isSubmitting={createStudent.isPending}
        submitLabel={t("submitLabel")}
        showParents
      />
    </div>
  );
}
