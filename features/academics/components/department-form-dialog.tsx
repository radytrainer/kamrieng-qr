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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  useCreateDepartment,
  useUpdateDepartment,
} from "@/features/academics/hooks/use-academics-mutations";
import {
  createDepartmentFormSchema,
  type DepartmentFormInput,
} from "@/features/academics/schemas/academics-schema";
import type { Department } from "@/features/academics/types/academics";

interface DepartmentFormDialogProps {
  mode: "create" | "edit";
  department?: Department;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DepartmentFormDialog({
  mode,
  department,
  open,
  onOpenChange,
}: DepartmentFormDialogProps) {
  const t = useTranslations("admin.academics.department");
  const tCommon = useTranslations("common");
  const tValidation = useTranslations("validation");
  const departmentFormSchema = React.useMemo(
    () => createDepartmentFormSchema(tValidation),
    [tValidation]
  );
  const createDepartment = useCreateDepartment();
  const updateDepartment = useUpdateDepartment(department?.id ?? "");
  const mutation = mode === "create" ? createDepartment : updateDepartment;

  const form = useForm<DepartmentFormInput>({
    resolver: zodResolver(departmentFormSchema),
    defaultValues: {
      code: department?.code ?? "",
      nameEn: department?.name_en ?? "",
      nameKm: department?.name_km ?? "",
      description: department?.description ?? "",
      isActive: department?.is_active ?? true,
    },
  });

  React.useEffect(() => {
    if (open) {
      form.reset({
        code: department?.code ?? "",
        nameEn: department?.name_en ?? "",
        nameKm: department?.name_km ?? "",
        description: department?.description ?? "",
        isActive: department?.is_active ?? true,
      });
    }
  }, [open, department, form]);

  const handleSubmit = form.handleSubmit(async (values) => {
    await mutation.mutateAsync(values);
    onOpenChange(false);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? t("addTitle") : t("editTitle")}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("code")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("codePlaceholder")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="nameEn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("nameEn")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("nameEnPlaceholder")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="nameKm"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("nameKm")}</FormLabel>
                  <FormControl>
                    <Input
                      className="font-khmer-card"
                      placeholder={t("nameKmPlaceholder")}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("description")}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <FormLabel className="font-normal">{t("isActive")}</FormLabel>
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
                {mode === "create" ? tCommon("create") : tCommon("save")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
