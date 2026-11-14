"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { FolderInput, Loader2 } from "lucide-react";
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
import { useDepartments } from "@/features/academics/hooks/use-academics-lists";
import { useBulkSetClassDepartment } from "@/features/academics/hooks/use-academics-mutations";

const NONE = "__none__";

interface SetClassesDepartmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ids: string[];
  onApplied?: () => void;
}

export function SetClassesDepartmentDialog({
  open,
  onOpenChange,
  ids,
  onApplied,
}: SetClassesDepartmentDialogProps) {
  const t = useTranslations("admin.academics.setDepartment");
  const tClass = useTranslations("admin.academics.class");
  const tCommon = useTranslations("common");
  const { data: departments } = useDepartments();
  const setDepartment = useBulkSetClassDepartment();
  const [departmentId, setDepartmentId] = React.useState(NONE);

  React.useEffect(() => {
    if (open) setDepartmentId(NONE);
  }, [open]);

  const handleConfirm = async () => {
    await setDepartment.mutateAsync({
      ids,
      departmentId: departmentId === NONE ? null : departmentId,
    });
    onOpenChange(false);
    onApplied?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("dialogTitle", { count: ids.length })}</DialogTitle>
          <DialogDescription>{t("dialogDescription")}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">{tClass("department")}</label>
          <Select value={departmentId} onValueChange={setDepartmentId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="—" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NONE}>—</SelectItem>
              {departments?.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.name_en}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <DialogFooter>
          <Button onClick={handleConfirm} disabled={setDepartment.isPending}>
            {setDepartment.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <FolderInput className="size-4" />
            )}
            {t("confirmButton", { count: ids.length })}
          </Button>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={setDepartment.isPending}
          >
            {tCommon("cancel")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
