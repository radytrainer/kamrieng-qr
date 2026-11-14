"use client";

import { useTranslations } from "next-intl";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAcademicsOptions } from "@/features/academics/hooks/use-academics-options";
import { useStudentStatusLabels } from "@/lib/i18n/enum-labels";

const ALL = "__all__";

interface StudentFiltersProps {
  search: string;
  status: string | undefined;
  departmentId: string | undefined;
  classId: string | undefined;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string | undefined) => void;
  onDepartmentChange: (value: string | undefined) => void;
  onClassChange: (value: string | undefined) => void;
}

export function StudentFilters({
  search,
  status,
  departmentId,
  classId,
  onSearchChange,
  onStatusChange,
  onDepartmentChange,
  onClassChange,
}: StudentFiltersProps) {
  const t = useTranslations("admin.students.filters");
  const tBulk = useTranslations("admin.students.bulkDeactivate");
  const { data: options } = useAcademicsOptions();
  const statusLabels = useStudentStatusLabels();

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1 sm:max-w-xs">
        <Search className="text-muted-foreground absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t("searchPlaceholder")}
          className="pl-8"
        />
      </div>

      <Select
        value={status ?? ALL}
        onValueChange={(v) => onStatusChange(v === ALL ? undefined : v)}
      >
        <SelectTrigger className="w-full sm:w-44">
          <SelectValue placeholder={t("allStatuses")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>{t("allStatuses")}</SelectItem>
          {Object.entries(statusLabels).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={departmentId ?? ALL}
        onValueChange={(v) => onDepartmentChange(v === ALL ? undefined : v)}
      >
        <SelectTrigger className="w-full sm:w-52">
          <SelectValue placeholder={t("allDepartments")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>{t("allDepartments")}</SelectItem>
          {options?.departments.map((d) => (
            <SelectItem key={d.id} value={d.id}>
              {d.name_en}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={classId ?? ALL}
        onValueChange={(v) => onClassChange(v === ALL ? undefined : v)}
      >
        <SelectTrigger className="w-full sm:w-44">
          <SelectValue placeholder={tBulk("allClasses")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>{tBulk("allClasses")}</SelectItem>
          {options?.classes.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
