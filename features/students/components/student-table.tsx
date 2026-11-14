"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Loader2, MoreHorizontal, Trash2, User } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { StudentStatusBadge } from "@/features/students/components/student-status-badge";
import {
  useDeleteStudent,
  useSetStudentStatus,
} from "@/features/students/hooks/use-student-mutations";
import { STUDENT_STATUS } from "@/lib/constants/student-status";
import { ROUTES } from "@/lib/constants/routes";
import { formatKhmerDateSlash } from "@/lib/utils/khmer-format";
import { useGenderLabel } from "@/lib/i18n/enum-labels";
import type { StudentListItem } from "@/features/students/types/student";

interface StudentTableProps {
  students: StudentListItem[];
  isLoading: boolean;
  canDelete?: boolean;
  /** Selection checkboxes are only rendered when this is provided — the
   * cards page and other read-only embeddings of this table can omit it. */
  selection?: {
    selectedIds: Set<string>;
    onToggleStudent: (id: string) => void;
    onTogglePage: (ids: string[], checked: boolean) => void;
  };
}

export function StudentTable({
  students,
  isLoading,
  canDelete = false,
  selection,
}: StudentTableProps) {
  const t = useTranslations("admin.students.table");
  const tForm = useTranslations("admin.students.form");
  const tProfile = useTranslations("admin.students.profile");
  const tCommon = useTranslations("common");
  const genderLabel = useGenderLabel();
  const setStatus = useSetStudentStatus();
  const deleteStudent = useDeleteStudent();
  const [deleteTarget, setDeleteTarget] =
    React.useState<StudentListItem | null>(null);

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    await deleteStudent.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
  };

  const pageIds = React.useMemo(() => students.map((s) => s.id), [students]);
  const columnCount = selection ? 9 : 8;

  return (
    <div className="bg-card overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            {selection && (
              <TableHead className="w-10">
                <Checkbox
                  checked={
                    pageIds.length > 0 &&
                    pageIds.every((id) => selection.selectedIds.has(id))
                      ? true
                      : pageIds.some((id) => selection.selectedIds.has(id))
                        ? "indeterminate"
                        : false
                  }
                  onCheckedChange={(checked) =>
                    selection.onTogglePage(pageIds, checked === true)
                  }
                  disabled={pageIds.length === 0}
                  aria-label={t("selectAllAria")}
                />
              </TableHead>
            )}
            <TableHead>{t("columnId")}</TableHead>
            <TableHead>{t("columnStudents")}</TableHead>
            <TableHead>{tProfile("gender")}</TableHead>
            <TableHead>{tForm("classField")}</TableHead>
            <TableHead>{t("columnDob")}</TableHead>
            <TableHead>{t("columnFatherPhone")}</TableHead>
            <TableHead>{tForm("status")}</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading &&
            Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell colSpan={columnCount}>
                  <Skeleton className="h-8 w-full" />
                </TableCell>
              </TableRow>
            ))}

          {!isLoading && students.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={columnCount}
                className="text-muted-foreground py-10 text-center"
              >
                {t("emptyState")}
              </TableCell>
            </TableRow>
          )}

          {!isLoading &&
            students.map((student) => (
              <TableRow key={student.id}>
                {selection && (
                  <TableCell>
                    <Checkbox
                      checked={selection.selectedIds.has(student.id)}
                      onCheckedChange={() =>
                        selection.onToggleStudent(student.id)
                      }
                      aria-label={t("selectStudentAria", {
                        name: `${student.khmer_first_name} ${student.khmer_last_name}`,
                      })}
                    />
                  </TableCell>
                )}
                <TableCell className="font-mono text-sm">
                  {student.student_code}
                </TableCell>
                <TableCell>
                  <Link
                    href={ROUTES.admin.studentDetail(student.id)}
                    className="flex items-center gap-3 hover:underline"
                  >
                    <div className="bg-muted flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full">
                      {student.photo_url ? (
                        <Image
                          src={student.photo_url}
                          alt=""
                          width={36}
                          height={36}
                          className="size-full object-cover"
                        />
                      ) : (
                        <User className="text-muted-foreground size-4" />
                      )}
                    </div>
                    <span className="font-khmer-card font-medium">
                      {student.khmer_first_name} {student.khmer_last_name}
                    </span>
                  </Link>
                </TableCell>
                <TableCell className="font-khmer-card">
                  {genderLabel[student.gender] ?? student.gender}
                </TableCell>
                <TableCell>{student.class_name ?? "—"}</TableCell>
                <TableCell className="font-khmer-card">
                  {formatKhmerDateSlash(student.date_of_birth)}
                </TableCell>
                <TableCell>{student.father_phone ?? "—"}</TableCell>
                <TableCell>
                  <StudentStatusBadge
                    status={student.status}
                    academicYearEndDate={student.academic_year_end_date}
                  />
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="size-8">
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={ROUTES.admin.studentDetail(student.id)}>
                          {t("viewProfile")}
                        </Link>
                      </DropdownMenuItem>
                      {student.status === STUDENT_STATUS.ACTIVE ? (
                        <DropdownMenuItem
                          onSelect={() =>
                            setStatus.mutate({
                              id: student.id,
                              status: STUDENT_STATUS.INACTIVE,
                            })
                          }
                        >
                          {t("deactivate")}
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem
                          onSelect={() =>
                            setStatus.mutate({
                              id: student.id,
                              status: STUDENT_STATUS.ACTIVE,
                            })
                          }
                        >
                          {t("activate")}
                        </DropdownMenuItem>
                      )}
                      {canDelete && (
                        <DropdownMenuItem
                          variant="destructive"
                          onSelect={() => setDeleteTarget(student)}
                        >
                          <Trash2 className="size-4" />
                          {tProfile("delete")}
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>

      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{tProfile("deleteDialogTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget &&
                tProfile.rich("deleteDialogBody", {
                  name: (chunks) => (
                    <span className="font-khmer-card text-foreground font-medium">
                      {chunks}
                    </span>
                  ),
                  fullName: `${deleteTarget.khmer_first_name} ${deleteTarget.khmer_last_name}`,
                  code: deleteTarget.student_code,
                })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteStudent.isPending}>
              {tCommon("cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={deleteStudent.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteStudent.isPending && (
                <Loader2 className="size-4 animate-spin" />
              )}
              {tProfile("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
