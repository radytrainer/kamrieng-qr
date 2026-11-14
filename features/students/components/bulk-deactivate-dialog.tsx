"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Loader2, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { useAcademicsOptions } from "@/features/academics/hooks/use-academics-options";
import { useStudents } from "@/features/students/hooks/use-students";
import { useBulkSetStudentStatus } from "@/features/students/hooks/use-student-mutations";
import { STUDENT_STATUS } from "@/lib/constants/student-status";

const ALL = "__all__";

export function BulkDeactivateDialog() {
  const t = useTranslations("admin.students.bulkDeactivate");
  const tFilters = useTranslations("admin.students.filters");
  const tForm = useTranslations("admin.students.form");
  const tTable = useTranslations("admin.students.table");
  const tCommon = useTranslations("common");
  const [open, setOpen] = React.useState(false);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [classId, setClassId] = React.useState("");
  const [gradeLevel, setGradeLevel] = React.useState("");

  const debouncedSearch = useDebouncedValue(search, 300);
  const { data: academicsOptions } = useAcademicsOptions();
  const bulkDeactivate = useBulkSetStudentStatus();

  const gradeLevels = React.useMemo(() => {
    const levels = new Set<number>();
    academicsOptions?.classes.forEach((c) => {
      if (c.grade_level != null) levels.add(c.grade_level);
    });
    return Array.from(levels).sort((a, b) => a - b);
  }, [academicsOptions]);

  const hasFilter = Boolean(debouncedSearch || classId || gradeLevel);

  const { data: preview, isFetching: isPreviewLoading } = useStudents(
    {
      search: debouncedSearch || undefined,
      status: STUDENT_STATUS.ACTIVE,
      classId: classId || undefined,
      gradeLevel: gradeLevel ? Number(gradeLevel) : undefined,
      page: 1,
      pageSize: 1,
    },
    { enabled: open && hasFilter }
  );

  const resetAndClose = () => {
    setOpen(false);
    setConfirmOpen(false);
    setSearch("");
    setClassId("");
    setGradeLevel("");
  };

  const handleConfirm = async () => {
    await bulkDeactivate.mutateAsync({
      filters: {
        search: debouncedSearch || undefined,
        classId: classId || undefined,
        gradeLevel: gradeLevel ? Number(gradeLevel) : undefined,
      },
      status: STUDENT_STATUS.INACTIVE,
    });
    resetAndClose();
  };

  const matchLabel = React.useMemo(() => {
    const parts: string[] = [];
    if (classId) {
      const cls = academicsOptions?.classes.find((c) => c.id === classId);
      if (cls) parts.push(t("classPart", { name: cls.name }));
    }
    if (gradeLevel) parts.push(t("gradePart", { level: gradeLevel }));
    if (debouncedSearch)
      parts.push(t("matchingPart", { query: debouncedSearch }));
    return parts.join(", ") || t("theSelectedFilters");
  }, [classId, gradeLevel, debouncedSearch, academicsOptions, t]);

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(next) => (next ? setOpen(true) : resetAndClose())}
      >
        <DialogTrigger asChild>
          <Button variant="outline">
            <UserX className="size-4" />
            {t("trigger")}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("dialogTitle")}</DialogTitle>
            <DialogDescription>{t("dialogDescription")}</DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">{t("nameOrCode")}</label>
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={tFilters("searchPlaceholder")}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">
                {tForm("classField")}
              </label>
              <Select
                value={classId || ALL}
                onValueChange={(v) => setClassId(v === ALL ? "" : v)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t("allClasses")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>{t("allClasses")}</SelectItem>
                  {academicsOptions?.classes.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">{t("generation")}</label>
              <Select
                value={gradeLevel || ALL}
                onValueChange={(v) => setGradeLevel(v === ALL ? "" : v)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t("allGenerations")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>{t("allGenerations")}</SelectItem>
                  {gradeLevels.map((g) => (
                    <SelectItem key={g} value={String(g)}>
                      {t("gradeOption", { level: g })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {hasFilter && (
              <p className="text-muted-foreground text-sm">
                {isPreviewLoading ? (
                  <Loader2 className="inline size-3.5 animate-spin" />
                ) : (
                  t("matchCount", { count: preview?.total ?? 0 })
                )}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="destructive"
              disabled={!hasFilter || (preview?.total ?? 0) === 0}
              onClick={() => setConfirmOpen(true)}
            >
              <UserX className="size-4" />
              {tTable("deactivate")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("confirmTitle", { count: preview?.total ?? 0 })}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("confirmDescription", { matchLabel })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={bulkDeactivate.isPending}>
              {tCommon("cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              disabled={bulkDeactivate.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {bulkDeactivate.isPending && (
                <Loader2 className="size-4 animate-spin" />
              )}
              {tTable("deactivate")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
