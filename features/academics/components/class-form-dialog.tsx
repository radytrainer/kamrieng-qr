"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Loader2, Save } from "lucide-react";
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
  useDepartments,
  useAcademicYears,
  useStudyPrograms,
} from "@/features/academics/hooks/use-academics-lists";
import {
  useCreateClass,
  useUpdateClass,
} from "@/features/academics/hooks/use-academics-mutations";
import {
  createClassFormSchema,
  type ClassFormInput,
} from "@/features/academics/schemas/academics-schema";
import type { SchoolClass } from "@/features/academics/types/academics";

const NONE = "__none__";

interface ClassFormDialogProps {
  mode: "create" | "edit";
  schoolClass?: SchoolClass;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ClassFormDialog({
  mode,
  schoolClass,
  open,
  onOpenChange,
}: ClassFormDialogProps) {
  const t = useTranslations("admin.academics.class");
  const tCommon = useTranslations("common");
  const tValidation = useTranslations("validation");
  const classFormSchema = React.useMemo(
    () => createClassFormSchema(tValidation),
    [tValidation]
  );
  const { data: departments } = useDepartments();
  const { data: studyPrograms } = useStudyPrograms();
  const { data: academicYears } = useAcademicYears();

  const createClass = useCreateClass();
  const updateClass = useUpdateClass(schoolClass?.id ?? "");
  const mutation = mode === "create" ? createClass : updateClass;

  const form = useForm<ClassFormInput>({
    resolver: zodResolver(classFormSchema),
    defaultValues: {
      name: schoolClass?.name ?? "",
      academicYearId: schoolClass?.academic_year_id ?? "",
      departmentId: schoolClass?.department_id ?? undefined,
      studyProgramId: schoolClass?.study_program_id ?? undefined,
      gradeLevel: schoolClass?.grade_level ?? undefined,
      capacity: schoolClass?.capacity ?? undefined,
    },
  });

  React.useEffect(() => {
    if (open) {
      form.reset({
        name: schoolClass?.name ?? "",
        academicYearId: schoolClass?.academic_year_id ?? "",
        departmentId: schoolClass?.department_id ?? undefined,
        studyProgramId: schoolClass?.study_program_id ?? undefined,
        gradeLevel: schoolClass?.grade_level ?? undefined,
        capacity: schoolClass?.capacity ?? undefined,
      });
    }
  }, [open, schoolClass, form]);

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
            <FormField
              control={form.control}
              name="academicYearId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("academicYear")}</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue
                          placeholder={t("selectAcademicYearPlaceholder")}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {academicYears?.map((y) => (
                        <SelectItem key={y.id} value={y.id}>
                          {y.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="departmentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("department")}</FormLabel>
                    <Select
                      value={field.value ?? NONE}
                      onValueChange={(v) => field.onChange(v === NONE ? "" : v)}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="—" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={NONE}>—</SelectItem>
                        {departments?.map((d) => (
                          <SelectItem key={d.id} value={d.id}>
                            {d.name_en}
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
                name="studyProgramId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("studyProgram")}</FormLabel>
                    <Select
                      value={field.value ?? NONE}
                      onValueChange={(v) => field.onChange(v === NONE ? "" : v)}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="—" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={NONE}>—</SelectItem>
                        {studyPrograms?.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name_en}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="gradeLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("gradeLevel")}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={13}
                        {...field}
                        value={
                          (field.value as number | string | undefined) ?? ""
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="capacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("capacity")}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        {...field}
                        value={
                          (field.value as number | string | undefined) ?? ""
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
