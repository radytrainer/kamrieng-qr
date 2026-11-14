"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Loader2, ArrowRightLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
} from "@/components/ui/dialog";
import { useAcademicsOptions } from "@/features/academics/hooks/use-academics-options";
import { useBulkMoveClass } from "@/features/students/hooks/use-student-mutations";

const NONE = "__none__";

interface MoveClassDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ids: string[];
  onMoved?: () => void;
}

export function MoveClassDialog({
  open,
  onOpenChange,
  ids,
  onMoved,
}: MoveClassDialogProps) {
  const t = useTranslations("admin.students.moveClass");
  const tForm = useTranslations("admin.students.form");
  const tCommon = useTranslations("common");
  const { data: options } = useAcademicsOptions();
  const moveClass = useBulkMoveClass();

  const [academicYearId, setAcademicYearId] = React.useState("");
  const [classId, setClassId] = React.useState(NONE);
  const [regenerateQr, setRegenerateQr] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      const current = options?.academicYears.find((y) => y.is_current);
      setAcademicYearId(current?.id ?? options?.academicYears[0]?.id ?? "");
      setClassId(NONE);
      setRegenerateQr(false);
    }
  }, [open, options]);

  const classOptions = React.useMemo(
    () =>
      options?.classes.filter((c) => c.academic_year_id === academicYearId) ??
      [],
    [options, academicYearId]
  );

  const handleConfirm = async () => {
    if (!academicYearId) return;
    await moveClass.mutateAsync({
      ids,
      input: {
        academicYearId,
        classId: classId === NONE ? null : classId,
        regenerateQr,
      },
    });
    onOpenChange(false);
    onMoved?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("dialogTitle", { count: ids.length })}</DialogTitle>
          <DialogDescription>{t("dialogDescription")}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">
              {tForm("academicYearField")}
            </label>
            <Select value={academicYearId} onValueChange={setAcademicYearId}>
              <SelectTrigger className="w-full">
                <SelectValue
                  placeholder={tForm("selectAcademicYearPlaceholder")}
                />
              </SelectTrigger>
              <SelectContent>
                {options?.academicYears.map((y) => (
                  <SelectItem key={y.id} value={y.id}>
                    {y.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">{tForm("classField")}</label>
            <Select value={classId} onValueChange={setClassId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={tForm("selectClassPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>—</SelectItem>
                {classOptions.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <label className="flex items-start gap-2.5 text-sm">
            <Checkbox
              checked={regenerateQr}
              onCheckedChange={(checked) => setRegenerateQr(checked === true)}
              className="mt-0.5"
            />
            <span>
              <span className="font-medium">{t("regenerateQrLabel")}</span>
              <span className="text-muted-foreground block text-xs">
                {t("regenerateQrHint")}
              </span>
            </span>
          </label>
        </div>

        <DialogFooter>
          <Button
            onClick={handleConfirm}
            disabled={!academicYearId || moveClass.isPending}
          >
            {moveClass.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <ArrowRightLeft className="size-4" />
            )}
            {t("confirmButton", { count: ids.length })}
          </Button>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={moveClass.isPending}
          >
            {tCommon("cancel")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
