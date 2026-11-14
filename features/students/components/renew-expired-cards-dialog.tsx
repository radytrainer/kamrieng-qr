"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Loader2, RefreshCw } from "lucide-react";
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
import { useExpiredCardsCount } from "@/features/students/hooks/use-expired-cards-count";
import { useBulkRenewExpiredCards } from "@/features/students/hooks/use-student-mutations";

const ALL = "__all__";
const NONE = "__none__";

export function RenewExpiredCardsDialog() {
  const t = useTranslations("admin.students.renewExpired");
  const tBulk = useTranslations("admin.students.bulkDeactivate");
  const tForm = useTranslations("admin.students.form");
  const tCommon = useTranslations("common");
  const [open, setOpen] = React.useState(false);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [classId, setClassId] = React.useState("");
  const [gradeLevel, setGradeLevel] = React.useState("");
  const [academicYearId, setAcademicYearId] = React.useState("");
  const [destClassId, setDestClassId] = React.useState(NONE);

  const debouncedSearch = useDebouncedValue(search, 300);
  const { data: academicsOptions } = useAcademicsOptions();
  const renewCards = useBulkRenewExpiredCards();

  React.useEffect(() => {
    if (open) {
      const current = academicsOptions?.academicYears.find((y) => y.is_current);
      setAcademicYearId(
        current?.id ?? academicsOptions?.academicYears[0]?.id ?? ""
      );
      setDestClassId(NONE);
    }
  }, [open, academicsOptions]);

  const gradeLevels = React.useMemo(() => {
    const levels = new Set<number>();
    academicsOptions?.classes.forEach((c) => {
      if (c.grade_level != null) levels.add(c.grade_level);
    });
    return Array.from(levels).sort((a, b) => a - b);
  }, [academicsOptions]);

  const destClassOptions = React.useMemo(
    () =>
      academicsOptions?.classes.filter(
        (c) => c.academic_year_id === academicYearId
      ) ?? [],
    [academicsOptions, academicYearId]
  );

  const sourceFilters = {
    search: debouncedSearch || undefined,
    classId: classId || undefined,
    gradeLevel: gradeLevel ? Number(gradeLevel) : undefined,
  };

  const { data: preview, isFetching: isPreviewLoading } = useExpiredCardsCount(
    sourceFilters,
    { enabled: open }
  );

  const resetAndClose = () => {
    setOpen(false);
    setConfirmOpen(false);
    setSearch("");
    setClassId("");
    setGradeLevel("");
  };

  const handleConfirm = async () => {
    await renewCards.mutateAsync({
      filters: sourceFilters,
      destination: {
        academicYearId,
        classId: destClassId === NONE ? null : destClassId,
      },
    });
    resetAndClose();
  };

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(next) => (next ? setOpen(true) : resetAndClose())}
      >
        <DialogTrigger asChild>
          <Button variant="outline">
            <RefreshCw className="size-4" />
            {t("trigger")}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("dialogTitle")}</DialogTitle>
            <DialogDescription>{t("dialogDescription")}</DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
              {t("sourceHeading")}
            </p>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">
                {tBulk("nameOrCode")}
              </label>
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("searchPlaceholder")}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">
                  {t("currentClass")}
                </label>
                <Select
                  value={classId || ALL}
                  onValueChange={(v) => setClassId(v === ALL ? "" : v)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={tBulk("allClasses")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL}>{tBulk("allClasses")}</SelectItem>
                    {academicsOptions?.classes.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">
                  {tBulk("generation")}
                </label>
                <Select
                  value={gradeLevel || ALL}
                  onValueChange={(v) => setGradeLevel(v === ALL ? "" : v)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={tBulk("allGenerations")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL}>
                      {tBulk("allGenerations")}
                    </SelectItem>
                    {gradeLevels.map((g) => (
                      <SelectItem key={g} value={String(g)}>
                        {tBulk("gradeOption", { level: g })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <p className="text-muted-foreground text-sm">
              {isPreviewLoading ? (
                <Loader2 className="inline size-3.5 animate-spin" />
              ) : (
                t("matchCount", { count: preview?.count ?? 0 })
              )}
            </p>

            <p className="text-muted-foreground pt-2 text-xs font-medium tracking-wide uppercase">
              {t("destinationHeading")}
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">
                  {tForm("academicYearField")}
                </label>
                <Select
                  value={academicYearId}
                  onValueChange={setAcademicYearId}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={tForm("selectAcademicYearPlaceholder")}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {academicsOptions?.academicYears.map((y) => (
                      <SelectItem key={y.id} value={y.id}>
                        {y.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">
                  {tForm("classField")}
                </label>
                <Select value={destClassId} onValueChange={setDestClassId}>
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={tForm("selectClassPlaceholder")}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE}>—</SelectItem>
                    {destClassOptions.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              disabled={!academicYearId || (preview?.count ?? 0) === 0}
              onClick={() => setConfirmOpen(true)}
            >
              <RefreshCw className="size-4" />
              {t("renewButton")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("confirmTitle", { count: preview?.count ?? 0 })}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("confirmDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={renewCards.isPending}>
              {tCommon("cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              disabled={renewCards.isPending}
            >
              {renewCards.isPending && (
                <Loader2 className="size-4 animate-spin" />
              )}
              {t("renewButton")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
