"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  useCreateUser,
  useUpdateUser,
} from "@/features/users/hooks/use-user-mutations";
import {
  ASSIGNABLE_ROLES,
  createUserFormSchema,
  type UserFormInput,
} from "@/features/users/schemas/user-schema";
import { type Role } from "@/lib/constants/roles";
import { useRoleLabels } from "@/lib/i18n/enum-labels";
import type { UserListItem } from "@/features/users/types/user";

interface UserFormDialogProps {
  mode: "create" | "edit";
  user?: UserListItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserFormDialog({
  mode,
  user,
  open,
  onOpenChange,
}: UserFormDialogProps) {
  const t = useTranslations("admin.users.form");
  const tCommon = useTranslations("common");
  const tValidation = useTranslations("validation");
  const roleLabels = useRoleLabels();
  const userFormSchema = React.useMemo(
    () => createUserFormSchema(tValidation),
    [tValidation]
  );
  const createUser = useCreateUser();
  const updateUser = useUpdateUser(user?.id ?? "");
  const mutation = mode === "create" ? createUser : updateUser;

  const form = useForm<UserFormInput>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      email: user?.email ?? "",
      displayName: user?.display_name ?? "",
      roleCode:
        (user?.role_code as (typeof ASSIGNABLE_ROLES)[number]) ?? "teacher",
      isActive: user?.is_active ?? true,
    },
  });

  React.useEffect(() => {
    if (open) {
      form.reset({
        email: user?.email ?? "",
        displayName: user?.display_name ?? "",
        roleCode:
          (user?.role_code as (typeof ASSIGNABLE_ROLES)[number]) ?? "teacher",
        isActive: user?.is_active ?? true,
      });
    }
  }, [open, user, form]);

  const handleSubmit = form.handleSubmit(async (values) => {
    if (mode === "create") {
      await createUser.mutateAsync(values);
    } else if (user) {
      await updateUser.mutateAsync(values);
    }
    onOpenChange(false);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? t("addTitle") : t("editTitle")}
          </DialogTitle>
          <DialogDescription>
            {mode === "create" ? t("addDescription") : t("editDescription")}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("email")}</FormLabel>
                  <FormControl>
                    <Input type="email" disabled={mode === "edit"} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="displayName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("fullName")}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="roleCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("role")}</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {ASSIGNABLE_ROLES.map((role) => (
                        <SelectItem key={role} value={role}>
                          {roleLabels[role as Role]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <FormLabel className="font-normal">{t("active")}</FormLabel>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Save className="size-4" />
                )}
                {mode === "create" ? t("createUser") : tCommon("save")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
