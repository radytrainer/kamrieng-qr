"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { useTranslations } from "next-intl";
import { Loader2, Pencil, Trash2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { StudentStatusBadge } from "@/features/students/components/student-status-badge";
import { StudentParentsCard } from "@/features/students/components/student-parents-card";
import { StudentQrCard } from "@/features/qr/components/student-qr-card";
import { EditStudentSheet } from "@/features/students/components/edit-student-sheet";
import { useStudent } from "@/features/students/hooks/use-student";
import { useDeleteStudent } from "@/features/students/hooks/use-student-mutations";
import { ROUTES } from "@/lib/constants/routes";
import { formatKhmerDateSlash } from "@/lib/utils/khmer-format";
import { useGenderLabel } from "@/lib/i18n/enum-labels";
import type { StudentListItem } from "@/features/students/types/student";
import type { Role } from "@/lib/constants/roles";

function formatDate(value: string | null): string {
  if (!value) return "—";
  try {
    return format(new Date(value), "dd MMM yyyy");
  } catch {
    return value;
  }
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 py-1.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value ?? "—"}</span>
    </div>
  );
}

interface StudentProfileViewProps {
  student: StudentListItem;
  role: Role;
}

export function StudentProfileView({
  student: initialStudent,
  role,
}: StudentProfileViewProps) {
  const router = useRouter();
  const t = useTranslations("admin.students.profile");
  const tForm = useTranslations("admin.students.form");
  const tCommon = useTranslations("common");
  const genderLabel = useGenderLabel();
  const { data: fresh } = useStudent(initialStudent.id);
  const student = { ...initialStudent, ...fresh };
  const [editOpen, setEditOpen] = React.useState(false);
  const isAdmin = role === "super_admin" || role === "school_admin";
  const isSuperAdmin = role === "super_admin";
  const deleteStudent = useDeleteStudent();

  const handleDelete = async () => {
    await deleteStudent.mutateAsync(student.id);
    router.push(ROUTES.admin.students);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <div className="bg-muted flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border">
            {student.photo_url ? (
              <Image
                src={student.photo_url}
                alt=""
                width={80}
                height={80}
                className="size-full object-cover"
              />
            ) : (
              <User className="text-muted-foreground size-8" />
            )}
          </div>
          <div>
            <h1 className="font-khmer-card text-2xl font-semibold tracking-tight">
              {student.khmer_first_name} {student.khmer_last_name}
            </h1>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-muted-foreground font-mono text-xs">
                {student.student_code}
              </span>
              <StudentStatusBadge
                status={student.status}
                academicYearEndDate={student.academic_year_end_date}
              />
            </div>
          </div>
        </div>

        {isAdmin && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setEditOpen(true)}>
              <Pencil className="size-4" />
              {t("edit")}
            </Button>
            {isSuperAdmin && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                    {t("delete")}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      {t("deleteDialogTitle")}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      {t.rich("deleteDialogBody", {
                        name: (chunks) => (
                          <span className="font-khmer-card text-foreground font-medium">
                            {chunks}
                          </span>
                        ),
                        fullName: `${student.khmer_first_name} ${student.khmer_last_name}`,
                        code: student.student_code,
                      })}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={deleteStudent.isPending}>
                      {tCommon("cancel")}
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      disabled={deleteStudent.isPending}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {deleteStudent.isPending && (
                        <Loader2 className="size-4 animate-spin" />
                      )}
                      {t("delete")}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>{t("personalInfo")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-x-8 sm:grid-cols-2">
                <div>
                  <InfoRow
                    label={t("gender")}
                    value={genderLabel[student.gender] ?? student.gender}
                  />
                  <InfoRow
                    label={tForm("dateOfBirth")}
                    value={formatKhmerDateSlash(student.date_of_birth)}
                  />
                  <InfoRow
                    label={tForm("placeOfBirth")}
                    value={student.place_of_birth}
                  />
                  <InfoRow
                    label={tForm("nationality")}
                    value={student.nationality}
                  />
                </div>
                <div>
                  <InfoRow label={t("phone")} value={student.phone} />
                  <InfoRow label={tForm("email")} value={student.email} />
                  <InfoRow
                    label={tForm("address")}
                    value={
                      [
                        student.address,
                        student.village,
                        student.commune,
                        student.district,
                        student.province,
                      ]
                        .filter(Boolean)
                        .join(", ") || "—"
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("academicInfo")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-x-8 sm:grid-cols-2">
                <div>
                  <InfoRow
                    label={tForm("departmentField")}
                    value={student.department_name}
                  />
                  <InfoRow
                    label={tForm("studyProgramField")}
                    value={student.study_program_name}
                  />
                  <InfoRow
                    label={tForm("classField")}
                    value={student.class_name}
                  />
                  <InfoRow
                    label={t("batchAcademicYear")}
                    value={student.academic_year_name}
                  />
                </div>
                <div>
                  <InfoRow
                    label={tForm("studyYear")}
                    value={student.study_year}
                  />
                  <InfoRow label={tForm("semester")} value={student.semester} />
                  <InfoRow
                    label={t("currentGpa")}
                    value={student.gpa?.toFixed(2)}
                  />
                  <InfoRow
                    label={tForm("creditsEarned")}
                    value={student.credits_earned}
                  />
                </div>
              </div>
              <Separator className="my-2" />
              <div className="grid gap-x-8 sm:grid-cols-2">
                <InfoRow
                  label={tForm("cardIssueDate")}
                  value={formatDate(student.issue_date)}
                />
                <InfoRow
                  label={tForm("cardExpiryDate")}
                  value={formatDate(student.expiry_date)}
                />
              </div>
            </CardContent>
          </Card>

          <StudentParentsCard studentId={student.id} />
        </div>

        <div className="flex flex-col gap-6">
          <StudentQrCard studentId={student.id} canManage={isAdmin} />
        </div>
      </div>

      {isAdmin && (
        <EditStudentSheet
          student={student}
          open={editOpen}
          onOpenChange={setEditOpen}
        />
      )}
    </div>
  );
}
