"use client";

import * as React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  Contact,
  Download,
  FileArchive,
  Printer,
  QrCode,
  Search,
} from "lucide-react";
import { Input } from "@/components/ui/input";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { StudentStatusBadge } from "@/features/students/components/student-status-badge";
import { StudentPagination } from "@/features/students/components/student-pagination";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useStudents } from "@/features/students/hooks/use-students";
import { useAcademicsOptions } from "@/features/academics/hooks/use-academics-options";
import { ROUTES } from "@/lib/constants/routes";

const PAGE_SIZE = 10;

interface StudentPrintFilters {
  search: string;
  onSearchChange: (value: string) => void;
  classId: string;
  onClassIdChange: (value: string) => void;
  gradeLevel: string;
  onGradeLevelChange: (value: string) => void;
  selectedIds: Set<string>;
  onToggleStudent: (id: string) => void;
  onTogglePage: (ids: string[], checked: boolean) => void;
}

function StudentsCardsTable({
  search,
  onSearchChange,
  classId,
  onClassIdChange,
  gradeLevel,
  onGradeLevelChange,
  selectedIds,
  onToggleStudent,
  onTogglePage,
}: StudentPrintFilters) {
  const t = useTranslations("admin.cards");
  const tFilters = useTranslations("admin.students.filters");
  const tBulk = useTranslations("admin.students.bulkDeactivate");
  const tTable = useTranslations("admin.students.table");
  const [page, setPage] = React.useState(1);
  const debouncedSearch = useDebouncedValue(search, 300);
  const { data: academicsOptions } = useAcademicsOptions();

  const gradeLevels = React.useMemo(() => {
    const levels = new Set<number>();
    academicsOptions?.classes.forEach((c) => {
      if (c.grade_level != null) levels.add(c.grade_level);
    });
    return Array.from(levels).sort((a, b) => a - b);
  }, [academicsOptions]);

  const { data, isLoading } = useStudents({
    search: debouncedSearch || undefined,
    status: "active",
    classId: classId || undefined,
    gradeLevel: gradeLevel ? Number(gradeLevel) : undefined,
    page,
    pageSize: PAGE_SIZE,
  });
  const pageIds = React.useMemo(
    () => data?.items.map((s) => s.id) ?? [],
    [data]
  );

  React.useEffect(() => setPage(1), [debouncedSearch, classId, gradeLevel]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative max-w-sm min-w-[220px] flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={tFilters("searchPlaceholder")}
            className="pl-8"
          />
        </div>
        <Select
          value={classId || "all"}
          onValueChange={(v) => onClassIdChange(v === "all" ? "" : v)}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder={tBulk("allClasses")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{tBulk("allClasses")}</SelectItem>
            {academicsOptions?.classes.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={gradeLevel || "all"}
          onValueChange={(v) => onGradeLevelChange(v === "all" ? "" : v)}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder={tBulk("allGenerations")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{tBulk("allGenerations")}</SelectItem>
            {gradeLevels.map((g) => (
              <SelectItem key={g} value={String(g)}>
                {tBulk("gradeOption", { level: g })}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="bg-card overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox
                  checked={
                    pageIds.length > 0 &&
                    pageIds.every((id) => selectedIds.has(id))
                      ? true
                      : pageIds.some((id) => selectedIds.has(id))
                        ? "indeterminate"
                        : false
                  }
                  onCheckedChange={(checked) =>
                    onTogglePage(pageIds, checked === true)
                  }
                  disabled={pageIds.length === 0}
                  aria-label={t("selectAllAria")}
                />
              </TableHead>
              <TableHead>{t("columnStudent")}</TableHead>
              <TableHead>{t("columnCode")}</TableHead>
              <TableHead>{t("columnStatus")}</TableHead>
              <TableHead className="w-72" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading &&
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={5}>
                    <Skeleton className="h-8 w-full" />
                  </TableCell>
                </TableRow>
              ))}
            {!isLoading && data?.items.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-muted-foreground py-10 text-center"
                >
                  {tTable("emptyState")}
                </TableCell>
              </TableRow>
            )}
            {!isLoading &&
              data?.items.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.has(student.id)}
                      onCheckedChange={() => onToggleStudent(student.id)}
                      aria-label={t("selectStudentAria", {
                        name: `${student.khmer_first_name} ${student.khmer_last_name}`,
                      })}
                    />
                  </TableCell>
                  <TableCell>
                    <span className="font-khmer-card font-medium">
                      {student.khmer_first_name} {student.khmer_last_name}
                    </span>
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {student.student_code}
                  </TableCell>
                  <TableCell>
                    <StudentStatusBadge
                      status={student.status}
                      academicYearEndDate={student.academic_year_end_date}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={ROUTES.admin.studentDetail(student.id)}>
                          <QrCode className="size-4" />
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <a
                          href={`/api/students/${student.id}/qr?download=1`}
                          download
                        >
                          <Download className="size-4" />
                          {t("downloadQr")}
                        </a>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link
                          href={ROUTES.admin.printStudentCard(student.id)}
                          target="_blank"
                        >
                          <Contact className="size-4" />
                          {t("downloadCard")}
                        </Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>

      <StudentPagination
        page={page}
        pageSize={PAGE_SIZE}
        total={data?.total ?? 0}
        onPageChange={setPage}
      />
    </div>
  );
}

export function CardsListView() {
  const t = useTranslations("admin.cards");
  const [search, setSearch] = React.useState("");
  const [classId, setClassId] = React.useState("");
  const [gradeLevel, setGradeLevel] = React.useState("");
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());

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

  const selectedCount = selectedIds.size;

  // A checkbox selection overrides the search/class/generation filters —
  // print or export exactly the picked students, regardless of what's
  // currently typed in the filters.
  const printAllHref = React.useMemo(() => {
    const params = new URLSearchParams();
    if (selectedCount > 0) {
      params.set("ids", Array.from(selectedIds).join(","));
    } else {
      if (search.trim()) params.set("search", search.trim());
      if (classId) params.set("classId", classId);
      if (gradeLevel) params.set("gradeLevel", gradeLevel);
    }
    const qs = params.toString();
    return qs ? `/admin/cards/print-all?${qs}` : "/admin/cards/print-all";
  }, [search, classId, gradeLevel, selectedIds, selectedCount]);

  const qrZipHref = React.useMemo(() => {
    if (selectedCount === 0) return "/api/students/bulk-qr-zip";
    return `/api/students/bulk-qr-zip?ids=${Array.from(selectedIds).join(",")}`;
  }, [selectedIds, selectedCount]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {t("title")}
          </h1>
          <p className="text-muted-foreground text-sm">{t("subtitle")}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {selectedCount > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">
                {t("selectedCount", { count: selectedCount })}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedIds(new Set())}
              >
                {t("clearSelection")}
              </Button>
            </div>
          )}
          <Button variant="outline" asChild>
            <Link href={printAllHref} target="_blank">
              <Printer className="size-4" />
              {selectedCount > 0
                ? t("printSelectedPdf", { count: selectedCount })
                : t("printCardsPdf")}
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <a href={qrZipHref}>
              <FileArchive className="size-4" />
              {selectedCount > 0
                ? t("downloadSelectedQrZip", { count: selectedCount })
                : t("downloadAllQrZip")}
            </a>
          </Button>
        </div>
      </div>

      <StudentsCardsTable
        search={search}
        onSearchChange={setSearch}
        classId={classId}
        onClassIdChange={setClassId}
        gradeLevel={gradeLevel}
        onGradeLevelChange={setGradeLevel}
        selectedIds={selectedIds}
        onToggleStudent={toggleStudent}
        onTogglePage={togglePage}
      />
    </div>
  );
}
