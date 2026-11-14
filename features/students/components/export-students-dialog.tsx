"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Download, Loader2 } from "lucide-react";
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
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useAcademicsOptions } from "@/features/academics/hooks/use-academics-options";
import { useStudents } from "@/features/students/hooks/use-students";

const ALL = "__all__";

export function ExportStudentsDialog() {
  const t = useTranslations("admin.students.exportDialog");
  const tList = useTranslations("admin.students.list");
  const tBulk = useTranslations("admin.students.bulkDeactivate");
  const tForm = useTranslations("admin.students.form");
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [classId, setClassId] = React.useState("");
  const [gradeLevel, setGradeLevel] = React.useState("");

  const debouncedSearch = useDebouncedValue(search, 300);
  const { data: academicsOptions } = useAcademicsOptions();

  const gradeLevels = React.useMemo(() => {
    const levels = new Set<number>();
    academicsOptions?.classes.forEach((c) => {
      if (c.grade_level != null) levels.add(c.grade_level);
    });
    return Array.from(levels).sort((a, b) => a - b);
  }, [academicsOptions]);

  const { data: preview, isFetching: isPreviewLoading } = useStudents(
    {
      search: debouncedSearch || undefined,
      classId: classId || undefined,
      gradeLevel: gradeLevel ? Number(gradeLevel) : undefined,
      page: 1,
      pageSize: 1,
    },
    { enabled: open }
  );

  const exportUrl = React.useMemo(() => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (classId) params.set("classId", classId);
    if (gradeLevel) params.set("gradeLevel", gradeLevel);
    const qs = params.toString();
    return qs ? `/api/students/bulk-export?${qs}` : "/api/students/bulk-export";
  }, [debouncedSearch, classId, gradeLevel]);

  const resetAndClose = () => {
    setOpen(false);
    setSearch("");
    setClassId("");
    setGradeLevel("");
  };

  const isEmpty = !isPreviewLoading && (preview?.total ?? 0) === 0;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => (next ? setOpen(true) : resetAndClose())}
    >
      <DialogTrigger asChild>
        <Button variant="outline">
          <Download className="size-4" />
          {tList("export")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("dialogTitle")}</DialogTitle>
          <DialogDescription>{t("dialogDescription")}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">{tBulk("nameOrCode")}</label>
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={tBulk("nameOrCode")}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">
                {tForm("classField")}
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
                  <SelectItem value={ALL}>{tBulk("allGenerations")}</SelectItem>
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
              t("matchCount", { count: preview?.total ?? 0 })
            )}
          </p>
        </div>

        <DialogFooter>
          <Button
            disabled={isEmpty}
            onClick={() => {
              window.location.href = exportUrl;
              resetAndClose();
            }}
          >
            <Download className="size-4" />
            {t("exportButton")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
