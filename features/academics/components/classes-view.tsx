"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import {
  ArrowRightLeft,
  FolderInput,
  MoreHorizontal,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
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
import { useClasses } from "@/features/academics/hooks/use-academics-lists";
import { useDeleteClass } from "@/features/academics/hooks/use-academics-mutations";
import { ClassFormDialog } from "@/features/academics/components/class-form-dialog";
import { GenerateClassesDialog } from "@/features/academics/components/generate-classes-dialog";
import { CopyClassesToYearDialog } from "@/features/academics/components/copy-classes-to-year-dialog";
import { SetClassesDepartmentDialog } from "@/features/academics/components/set-classes-department-dialog";
import type { ClassListItem } from "@/features/academics/types/academics";

export function ClassesView() {
  const t = useTranslations("admin.academics.class");
  const tSelection = useTranslations("admin.academics.classSelection");
  const { data, isLoading } = useClasses();
  const deleteClass = useDeleteClass();
  const [createOpen, setCreateOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<ClassListItem | null>(null);
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [copyDialogOpen, setCopyDialogOpen] = React.useState(false);
  const [departmentDialogOpen, setDepartmentDialogOpen] = React.useState(false);

  const ids = React.useMemo(() => data?.map((c) => c.id) ?? [], [data]);

  const toggleClass = React.useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleAll = React.useCallback(
    (checked: boolean) => {
      setSelectedIds(checked ? new Set(ids) : new Set());
    },
    [ids]
  );

  const clearSelection = () => setSelectedIds(new Set());
  const selectedCount = selectedIds.size;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end gap-2">
        <GenerateClassesDialog />
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="size-4" />
          {t("addButton")}
        </Button>
      </div>

      {selectedCount > 0 && (
        <div className="bg-muted/50 flex flex-wrap items-center gap-3 rounded-lg border p-3">
          <span className="text-sm font-medium">
            {tSelection("selectedCount", { count: selectedCount })}
          </span>
          <Button size="sm" onClick={() => setCopyDialogOpen(true)}>
            <ArrowRightLeft className="size-4" />
            {tSelection("copyToYear")}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setDepartmentDialogOpen(true)}
          >
            <FolderInput className="size-4" />
            {tSelection("setDepartment")}
          </Button>
          <Button size="sm" variant="ghost" onClick={clearSelection}>
            {tSelection("clearSelection")}
          </Button>
        </div>
      )}

      <div className="bg-card overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox
                  checked={
                    ids.length > 0 && ids.every((id) => selectedIds.has(id))
                      ? true
                      : ids.some((id) => selectedIds.has(id))
                        ? "indeterminate"
                        : false
                  }
                  onCheckedChange={(checked) => toggleAll(checked === true)}
                  disabled={ids.length === 0}
                  aria-label={tSelection("selectAllAria")}
                />
              </TableHead>
              <TableHead>{t("columnName")}</TableHead>
              <TableHead>{t("columnAcademicYear")}</TableHead>
              <TableHead>{t("columnDepartment")}</TableHead>
              <TableHead>{t("columnCapacity")}</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading &&
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={6}>
                    <Skeleton className="h-8 w-full" />
                  </TableCell>
                </TableRow>
              ))}
            {!isLoading && data?.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-muted-foreground py-10 text-center"
                >
                  {t("emptyState")}
                </TableCell>
              </TableRow>
            )}
            {!isLoading &&
              data?.map((schoolClass) => (
                <TableRow key={schoolClass.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.has(schoolClass.id)}
                      onCheckedChange={() => toggleClass(schoolClass.id)}
                      aria-label={tSelection("selectClassAria", {
                        name: schoolClass.name,
                      })}
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    {schoolClass.name}
                  </TableCell>
                  <TableCell>{schoolClass.academic_year_name ?? "—"}</TableCell>
                  <TableCell>{schoolClass.department_name ?? "—"}</TableCell>
                  <TableCell>{schoolClass.capacity ?? "—"}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onSelect={() => setEditing(schoolClass)}
                        >
                          {t("edit")}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          variant="destructive"
                          onSelect={() => deleteClass.mutate(schoolClass.id)}
                        >
                          {t("delete")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>

      <ClassFormDialog
        mode="create"
        open={createOpen}
        onOpenChange={setCreateOpen}
      />
      {editing && (
        <ClassFormDialog
          mode="edit"
          schoolClass={editing}
          open={Boolean(editing)}
          onOpenChange={(open) => !open && setEditing(null)}
        />
      )}

      <CopyClassesToYearDialog
        open={copyDialogOpen}
        onOpenChange={setCopyDialogOpen}
        ids={Array.from(selectedIds)}
        onCopied={clearSelection}
      />
      <SetClassesDepartmentDialog
        open={departmentDialogOpen}
        onOpenChange={setDepartmentDialogOpen}
        ids={Array.from(selectedIds)}
        onApplied={clearSelection}
      />
    </div>
  );
}
