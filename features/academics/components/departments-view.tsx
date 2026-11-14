"use client";

import * as React from "react";
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
import { useDepartments } from "@/features/academics/hooks/use-academics-lists";
import { useDeleteDepartment } from "@/features/academics/hooks/use-academics-mutations";
import { DepartmentFormDialog } from "@/features/academics/components/department-form-dialog";
import type { Department } from "@/features/academics/types/academics";

export function DepartmentsView() {
  const t = useTranslations("admin.academics.department");
  const tCommon = useTranslations("common");
  const { data, isLoading } = useDepartments();
  const deleteDepartment = useDeleteDepartment();
  const [createOpen, setCreateOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Department | null>(null);

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
              <TableHead>{t("columnCode")}</TableHead>
              <TableHead>{t("columnNameEn")}</TableHead>
              <TableHead>{t("columnNameKm")}</TableHead>
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
              data?.map((department) => (
                <TableRow key={department.id}>
                  <TableCell className="font-mono text-sm">
                    {department.code}
                  </TableCell>
                  <TableCell className="font-medium">
                    {department.name_en}
                  </TableCell>
                  <TableCell className="font-khmer-card">
                    {department.name_km ?? "—"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        department.is_active
                          ? "border-success/30 bg-success/10 text-success"
                          : ""
                      }
                    >
                      {department.is_active
                        ? tCommon("active")
                        : tCommon("inactive")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onSelect={() => setEditing(department)}
                        >
                          {t("edit")}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          variant="destructive"
                          onSelect={() =>
                            deleteDepartment.mutate(department.id)
                          }
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

      <DepartmentFormDialog
        mode="create"
        open={createOpen}
        onOpenChange={setCreateOpen}
      />
      {editing && (
        <DepartmentFormDialog
          mode="edit"
          department={editing}
          open={Boolean(editing)}
          onOpenChange={(open) => !open && setEditing(null)}
        />
      )}
    </div>
  );
}
