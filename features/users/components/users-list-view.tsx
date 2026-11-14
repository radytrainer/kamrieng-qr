"use client";

import * as React from "react";
import { formatDistanceToNow } from "date-fns";
import { useTranslations } from "next-intl";
import { MoreHorizontal, Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
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
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useUsers } from "@/features/users/hooks/use-users";
import {
  useResetUserPassword,
  useSetUserActive,
} from "@/features/users/hooks/use-user-mutations";
import { UserRoleBadge } from "@/features/users/components/user-role-badge";
import { UserFormDialog } from "@/features/users/components/user-form-dialog";
import { ResetPasswordResultDialog } from "@/features/users/components/reset-password-result-dialog";
import { StudentPagination } from "@/features/students/components/student-pagination";
import type { UserListItem } from "@/features/users/types/user";

const PAGE_SIZE = 20;

export function UsersListView() {
  const t = useTranslations("admin.users.list");
  const tCommon = useTranslations("common");
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const debouncedSearch = useDebouncedValue(search, 300);

  const { data, isLoading } = useUsers({
    search: debouncedSearch || undefined,
    page,
    pageSize: PAGE_SIZE,
  });
  const setActive = useSetUserActive();
  const resetPassword = useResetUserPassword();

  const [createOpen, setCreateOpen] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState<UserListItem | null>(
    null
  );
  const [resetResult, setResetResult] = React.useState<{
    email: string;
    password: string;
  } | null>(null);

  const handleResetPassword = (user: UserListItem) => {
    resetPassword.mutate(
      { id: user.id, email: user.email },
      {
        onSuccess: ({ password }) =>
          setResetResult({ email: user.email, password }),
      }
    );
  };

  React.useEffect(() => setPage(1), [debouncedSearch]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {t("title")}
          </h1>
          <p className="text-muted-foreground text-sm">{t("subtitle")}</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="size-4" />
          {t("addUser")}
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="text-muted-foreground absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("searchPlaceholder")}
          className="pl-8"
        />
      </div>

      <div className="bg-card overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("columnUser")}</TableHead>
              <TableHead>{t("columnRole")}</TableHead>
              <TableHead>{t("columnLastLogin")}</TableHead>
              <TableHead>{t("columnStatus")}</TableHead>
              <TableHead className="w-10" />
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
                  {t("emptyState")}
                </TableCell>
              </TableRow>
            )}
            {!isLoading &&
              data?.items.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{user.display_name}</span>
                      <span className="text-muted-foreground text-xs">
                        {user.email}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <UserRoleBadge role={user.role_code} />
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {user.last_login_at
                      ? formatDistanceToNow(new Date(user.last_login_at), {
                          addSuffix: true,
                        })
                      : t("never")}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        user.is_active
                          ? "border-success/30 bg-success/10 text-success"
                          : "text-muted-foreground"
                      }
                    >
                      {user.is_active ? tCommon("active") : tCommon("inactive")}
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
                        <DropdownMenuItem onSelect={() => setEditingUser(user)}>
                          {t("edit")}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={() => handleResetPassword(user)}
                        >
                          {t("resetPassword")}
                        </DropdownMenuItem>
                        {user.is_active ? (
                          <DropdownMenuItem
                            onSelect={() =>
                              setActive.mutate({ id: user.id, isActive: false })
                            }
                          >
                            {t("deactivate")}
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onSelect={() =>
                              setActive.mutate({ id: user.id, isActive: true })
                            }
                          >
                            {t("activate")}
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
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

      <UserFormDialog
        mode="create"
        open={createOpen}
        onOpenChange={setCreateOpen}
      />
      {editingUser && (
        <UserFormDialog
          mode="edit"
          user={editingUser}
          open={Boolean(editingUser)}
          onOpenChange={(open) => !open && setEditingUser(null)}
        />
      )}

      <ResetPasswordResultDialog
        email={resetResult?.email ?? null}
        password={resetResult?.password ?? null}
        onClose={() => setResetResult(null)}
      />
    </div>
  );
}
