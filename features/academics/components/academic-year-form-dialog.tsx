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
  useCreateAcademicYear,
  useUpdateAcademicYear,
} from "@/features/academics/hooks/use-academics-mutations";
import {
  createAcademicYearFormSchema,
  type AcademicYearFormInput,
} from "@/features/academics/schemas/academics-schema";
import type { AcademicYear } from "@/features/academics/types/academics";

interface AcademicYearFormDialogProps {
  mode: "create" | "edit";
  academicYear?: AcademicYear;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AcademicYearFormDialog({
  mode,
  academicYear,
  open,
  onOpenChange,
}: AcademicYearFormDialogProps) {
  const t = useTranslations("admin.academics.academicYear");
  const tCommon = useTranslations("common");
  const tValidation = useTranslations("validation");
  const academicYearFormSchema = React.useMemo(
    () => createAcademicYearFormSchema(tValidation),
    [tValidation]
  );
  const createYear = useCreateAcademicYear();
  const updateYear = useUpdateAcademicYear(academicYear?.id ?? "");
  const mutation = mode === "create" ? createYear : updateYear;

  const form = useForm<AcademicYearFormInput>({
    resolver: zodResolver(academicYearFormSchema),
    defaultValues: {
      name: academicYear?.name ?? "",
      startDate: academicYear?.start_date ?? "",
      endDate: academicYear?.end_date ?? "",
      isCurrent: academicYear?.is_current ?? false,
    },
  });

  React.useEffect(() => {
    if (open) {
      form.reset({
        name: academicYear?.name ?? "",
        startDate: academicYear?.start_date ?? "",
        endDate: academicYear?.end_date ?? "",
        isCurrent: academicYear?.is_current ?? false,
      });
    }
  }, [open, academicYear, form]);

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
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("name")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("namePlaceholder")} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("startDate")}</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("endDate")}</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="isCurrent"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div>
                    <FormLabel className="font-normal">
                      {t("isCurrent")}
                    </FormLabel>
                    <p className="text-muted-foreground text-xs">
                      {t("isCurrentHint")}
                    </p>
                  </div>
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
