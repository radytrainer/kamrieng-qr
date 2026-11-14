"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { StudentForm } from "@/features/students/components/student-form";
import { useUpdateStudent } from "@/features/students/hooks/use-student-mutations";
import type { StudentFormInput } from "@/features/students/schemas/student-schema";
import type { StudentListItem } from "@/features/students/types/student";

interface EditStudentSheetProps {
  student: StudentListItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditStudentSheet({
  student,
  open,
  onOpenChange,
}: EditStudentSheetProps) {
  const t = useTranslations("admin.students.edit");
  const tCommon = useTranslations("common");
  const updateStudent = useUpdateStudent(student.id);

  const defaultValues: Partial<StudentFormInput> = {
    studentCode: student.student_code,
    name: `${student.khmer_first_name} ${student.khmer_last_name}`,
    gender: student.gender as "male" | "female" | "other",
    dateOfBirth: student.date_of_birth,
    placeOfBirth: student.place_of_birth ?? undefined,
    nationality: student.nationality,
    phone: student.phone ?? undefined,
    email: student.email ?? undefined,
    address: student.address ?? undefined,
    province: student.province ?? undefined,
    district: student.district ?? undefined,
    commune: student.commune ?? undefined,
    village: student.village ?? undefined,
    departmentId: student.department_id ?? undefined,
    studyProgramId: student.study_program_id ?? undefined,
    classId: student.class_id ?? undefined,
    academicYearId: student.academic_year_id ?? undefined,
    studyYear: student.study_year ?? undefined,
    semester: (student.semester as 1 | 2) ?? undefined,
    gpa: student.gpa ?? undefined,
    creditsEarned: student.credits_earned,
    status: student.status as StudentFormInput["status"],
    issueDate: student.issue_date ?? undefined,
    expiryDate: student.expiry_date ?? undefined,
    photoUrl: student.photo_url ?? undefined,
  };

  const handleSubmit = async (values: StudentFormInput) => {
    await updateStudent.mutateAsync(values);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>{t("title")}</SheetTitle>
        </SheetHeader>
        <div className="px-4 pb-6">
          <StudentForm
            defaultValues={defaultValues}
            onSubmit={handleSubmit}
            isSubmitting={updateStudent.isPending}
            submitLabel={tCommon("save")}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
