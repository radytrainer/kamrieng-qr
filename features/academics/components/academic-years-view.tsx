"use client";

import * as React from "react";
import { format } from "date-fns";
import { useTranslations } from "next-intl";
import { MoreHorizontal, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { useAcademicYears } from "@/features/academics/hooks/use-academics-lists";
import { useDeleteAcademicYear } from "@/features/academics/hooks/use-academics-mutations";
import { AcademicYearFormDialog } from "@/features/academics/components/academic-year-form-dialog";
import type { AcademicYear } from "@/features/academics/types/academics";

export function AcademicYearsView() {
  const t = useTranslations("admin.academics.academicYear");
  const tCommon = useTranslations("common");
  const { data, isLoading } = useAcademicYears();
  const deleteYear = useDeleteAcademicYear();
  const [createOpen, setCreateOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<AcademicYear | null>(null);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="size-4" />
          {t("addButton")}
        </Button>
      </div>

      <div className="bg-card overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("columnName")}</TableHead>
              <TableHead>{t("columnStartDate")}</TableHead>
              <TableHead>{t("columnEndDate")}</TableHead>
              <TableHead>{t("columnStatus")}</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading &&
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={5}>
                    <Skeleton className="h-8 w-full" />
                  </TableCell>
                </TableRow>
              ))}
            {!isLoading && data?.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-muted-foreground py-10 text-center"
                >
                  {t("emptyState")}
                </TableCell>
              </TableRow>
            )}
            {!isLoading &&
              data?.map((year) => (
                <TableRow key={year.id}>
                  <TableCell className="font-medium">{year.name}</TableCell>
                  <TableCell>
                    {format(new Date(year.start_date), "dd MMM yyyy")}
                  </TableCell>
                  <TableCell>
                    {format(new Date(year.end_date), "dd MMM yyyy")}
                  </TableCell>
                  <TableCell>
                    {year.is_current && (
                      <Badge
                        variant="outline"
                        className="border-success/30 bg-success/10 text-success"
                      >
                        {tCommon("current")}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => setEditing(year)}>
                          {t("edit")}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          variant="destructive"
                          onSelect={() => deleteYear.mutate(year.id)}
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

      <AcademicYearFormDialog
        mode="create"
        open={createOpen}
        onOpenChange={setCreateOpen}
      />
      {editing && (
        <AcademicYearFormDialog
          mode="edit"
          academicYear={editing}
          open={Boolean(editing)}
          onOpenChange={(open) => !open && setEditing(null)}
        />
      )}
    </div>
  );
}
