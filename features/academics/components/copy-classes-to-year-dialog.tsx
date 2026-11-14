"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { ArrowRightLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { useAcademicYears } from "@/features/academics/hooks/use-academics-lists";
import { useCopyClassesToYear } from "@/features/academics/hooks/use-academics-mutations";

interface CopyClassesToYearDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ids: string[];
  onCopied?: () => void;
}

export function CopyClassesToYearDialog({
  open,
  onOpenChange,
  ids,
  onCopied,
}: CopyClassesToYearDialogProps) {
  const t = useTranslations("admin.academics.copyClasses");
  const tClass = useTranslations("admin.academics.class");
  const tCommon = useTranslations("common");
  const { data: academicYears } = useAcademicYears();
  const copyClasses = useCopyClassesToYear();
  const [targetAcademicYearId, setTargetAcademicYearId] = React.useState("");

  React.useEffect(() => {
    if (open) {
      const current = academicYears?.find((y) => y.is_current);
      setTargetAcademicYearId(current?.id ?? "");
    }
  }, [open, academicYears]);

  const handleConfirm = async () => {
    if (!targetAcademicYearId) return;
    await copyClasses.mutateAsync({ ids, targetAcademicYearId });
    onOpenChange(false);
    onCopied?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("dialogTitle", { count: ids.length })}</DialogTitle>
          <DialogDescription>{t("dialogDescription")}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">
            {tClass("academicYear")}
          </label>
          <Select
            value={targetAcademicYearId}
            onValueChange={setTargetAcademicYearId}
          >
            <SelectTrigger className="w-full">
              <SelectValue
                placeholder={tClass("selectAcademicYearPlaceholder")}
              />
            </SelectTrigger>
            <SelectContent>
              {academicYears?.map((y) => (
                <SelectItem key={y.id} value={y.id}>
                  {y.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <DialogFooter>
          <Button
            onClick={handleConfirm}
            disabled={!targetAcademicYearId || copyClasses.isPending}
          >
            {copyClasses.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <ArrowRightLeft className="size-4" />
            )}
            {t("confirmButton", { count: ids.length })}
          </Button>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={copyClasses.isPending}
          >
            {tCommon("cancel")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
