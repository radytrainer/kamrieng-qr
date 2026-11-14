"use client";

import * as React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Download, Loader2, Plus, Trash2, ArrowRightLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useStudents } from "@/features/students/hooks/use-students";
import { StudentFilters } from "@/features/students/components/student-filters";
import { StudentTable } from "@/features/students/components/student-table";
import { StudentPagination } from "@/features/students/components/student-pagination";
import { ExportStudentsDialog } from "@/features/students/components/export-students-dialog";
import { BulkImportDialog } from "@/features/students/components/bulk-import-dialog";
import { BulkDeactivateDialog } from "@/features/students/components/bulk-deactivate-dialog";
import { RenewExpiredCardsDialog } from "@/features/students/components/renew-expired-cards-dialog";
import { MoveClassDialog } from "@/features/students/components/move-class-dialog";
import { useBulkDeleteStudents } from "@/features/students/hooks/use-student-mutations";
import { ROUTES } from "@/lib/constants/routes";
import type { Role } from "@/lib/constants/roles";

const PAGE_SIZE = 20;

export function StudentsListView({ role }: { role: Role }) {
  const t = useTranslations("admin.students.list");
  const tSelection = useTranslations("admin.students.selection");
  const tCommon = useTranslations("common");
  const isAdmin = role === "super_admin" || role === "school_admin";
  const isSuperAdmin = role === "super_admin";

  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState<string | undefined>();
  const [departmentId, setDepartmentId] = React.useState<string | undefined>();
  const [classId, setClassId] = React.useState<string | undefined>();
  const [page, setPage] = React.useState(1);
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [moveDialogOpen, setMoveDialogOpen] = React.useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false);

  const debouncedSearch = useDebouncedValue(search, 300);
  const bulkDelete = useBulkDeleteStudents();

  const filters = {
    search: debouncedSearch || undefined,
    status,
    departmentId,
    academicYearId: undefined,
    classId,
    page,
    pageSize: PAGE_SIZE,
  };

  const { data, isLoading } = useStudents(filters);

  React.useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status, departmentId, classId]);

  const toggleStudent = React.useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const togglePage = React.useCallback((ids: string[], checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      for (const id of ids) {
        if (checked) next.add(id);
        else next.delete(id);
      }
      return next;
    });
  }, []);

  const clearSelection = () => setSelectedIds(new Set());
  const selectedCount = selectedIds.size;

  const exportSelectedUrl = React.useMemo(
    () => `/api/students/bulk-export?ids=${Array.from(selectedIds).join(",")}`,
    [selectedIds]
  );

  const handleConfirmDelete = async () => {
    await bulkDelete.mutateAsync(Array.from(selectedIds));
    setDeleteConfirmOpen(false);
    clearSelection();
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {t("title")}
          </h1>
          <p className="text-muted-foreground text-sm">{t("subtitle")}</p>
        </div>
        {isAdmin && (
          <div className="flex flex-wrap gap-2">
            <ExportStudentsDialog />
            <BulkImportDialog />
            <BulkDeactivateDialog />
            <RenewExpiredCardsDialog />
            <Button asChild>
              <Link href={ROUTES.admin.studentNew}>
                <Plus className="size-4" />
                {t("addStudent")}
              </Link>
            </Button>
          </div>
        )}
      </div>

      <StudentFilters
        search={search}
        status={status}
        departmentId={departmentId}
        classId={classId}
        onSearchChange={setSearch}
        onStatusChange={setStatus}
        onDepartmentChange={setDepartmentId}
        onClassChange={setClassId}
      />

      {isAdmin && selectedCount > 0 && (
        <div className="bg-muted/50 flex flex-wrap items-center gap-3 rounded-lg border p-3">
          <span className="text-sm font-medium">
            {tSelection("selectedCount", { count: selectedCount })}
          </span>
          <Button size="sm" variant="outline" asChild>
            <a href={exportSelectedUrl}>
              <Download className="size-4" />
              {tSelection("exportSelected")}
            </a>
          </Button>
          <Button size="sm" onClick={() => setMoveDialogOpen(true)}>
            <ArrowRightLeft className="size-4" />
            {tSelection("moveToClass")}
          </Button>
          {isSuperAdmin && (
            <Button
              size="sm"
              variant="destructive"
              onClick={() => setDeleteConfirmOpen(true)}
            >
              <Trash2 className="size-4" />
              {tSelection("deleteSelected")}
            </Button>
          )}
          <Button size="sm" variant="ghost" onClick={clearSelection}>
            {tSelection("clearSelection")}
          </Button>
        </div>
      )}

      <StudentTable
        students={data?.items ?? []}
        isLoading={isLoading}
        canDelete={isSuperAdmin}
        selection={
          isAdmin
            ? {
                selectedIds,
                onToggleStudent: toggleStudent,
                onTogglePage: togglePage,
              }
            : undefined
        }
      />

      <StudentPagination
        page={page}
        pageSize={PAGE_SIZE}
        total={data?.total ?? 0}
        onPageChange={setPage}
      />

      <MoveClassDialog
        open={moveDialogOpen}
        onOpenChange={setMoveDialogOpen}
        ids={Array.from(selectedIds)}
        onMoved={clearSelection}
      />

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {tSelection("deleteConfirmTitle", { count: selectedCount })}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {tSelection("deleteConfirmDescription", {
                count: selectedCount,
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={bulkDelete.isPending}>
              {tCommon("cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={bulkDelete.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {bulkDelete.isPending && (
                <Loader2 className="size-4 animate-spin" />
              )}
              {tSelection("deleteSelected")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
