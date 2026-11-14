"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Loader2, Sparkles } from "lucide-react";
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
import { useGenerateClasses } from "@/features/academics/hooks/use-academics-mutations";
import {
  createGenerateClassesFormSchema,
  splitSections,
  type GenerateClassesFormInput,
} from "@/features/academics/schemas/academics-schema";

const NONE = "__none__";
const DEFAULT_SECTIONS = "A,B,C,D,E,F,G,H,I,J";

export function GenerateClassesDialog() {
  const t = useTranslations("admin.academics.generateClasses");
  const tClass = useTranslations("admin.academics.class");
  const tCommon = useTranslations("common");
  const tValidation = useTranslations("validation");
  const [open, setOpen] = React.useState(false);
  const generateClassesFormSchema = React.useMemo(
    () => createGenerateClassesFormSchema(tValidation),
    [tValidation]
  );
  const { data: departments } = useDepartments();
  const { data: studyPrograms } = useStudyPrograms();
  const { data: academicYears } = useAcademicYears();
  const generateClasses = useGenerateClasses();
  const prefixTouched = React.useRef(false);

  const form = useForm<GenerateClassesFormInput>({
    resolver: zodResolver(generateClassesFormSchema),
    defaultValues: {
      academicYearId: "",
      gradeLevel: undefined,
      namePrefix: "",
      sections: DEFAULT_SECTIONS,
      departmentId: undefined,
      studyProgramId: undefined,
      capacity: undefined,
    },
  });

  React.useEffect(() => {
    if (open) {
      prefixTouched.current = false;
      const current = academicYears?.find((y) => y.is_current);
      form.reset({
        academicYearId: current?.id ?? academicYears?.[0]?.id ?? "",
        gradeLevel: undefined,
        namePrefix: "",
        sections: DEFAULT_SECTIONS,
        departmentId: undefined,
        studyProgramId: undefined,
        capacity: undefined,
      });
    }
  }, [open, academicYears, form]);

  const gradeLevel = form.watch("gradeLevel");
  const namePrefix = form.watch("namePrefix");
  const sectionsRaw = form.watch("sections");

  // Keeps the name prefix in sync with the grade level until the admin
  // edits the prefix by hand — typing "7" auto-fills "7" so the preview
  // reads "7A".."7J" without extra typing for the common case.
  React.useEffect(() => {
    if (!prefixTouched.current && gradeLevel !== undefined) {
      form.setValue("namePrefix", String(gradeLevel));
    }
  }, [gradeLevel, form]);

  const previewNames = React.useMemo(() => {
    const sections = splitSections(sectionsRaw ?? "");
    return sections.map((s) => `${namePrefix ?? ""}${s}`);
  }, [sectionsRaw, namePrefix]);

  const handleSubmit = form.handleSubmit(async (values) => {
    await generateClasses.mutateAsync(values);
    setOpen(false);
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Sparkles className="size-4" />
          {t("trigger")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("dialogTitle")}</DialogTitle>
          <DialogDescription>{t("dialogDescription")}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="academicYearId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{tClass("academicYear")}</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue
                          placeholder={tClass("selectAcademicYearPlaceholder")}
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
                name="gradeLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{tClass("gradeLevel")}</FormLabel>
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
                name="namePrefix"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("namePrefix")}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        onChange={(e) => {
                          prefixTouched.current = true;
                          field.onChange(e);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="sections"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("sections")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("sectionsPlaceholder")} {...field} />
                  </FormControl>
                  <p className="text-muted-foreground text-xs">
                    {t("sectionsHint")}
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            {previewNames.length > 0 && (
              <p className="bg-muted rounded-md p-2 text-sm">
                {t("preview", {
                  count: previewNames.length,
                  names: previewNames.join(", "),
                })}
              </p>
            )}

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="departmentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{tClass("department")}</FormLabel>
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
                    <FormLabel>{tClass("studyProgram")}</FormLabel>
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

            <FormField
              control={form.control}
              name="capacity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{tClass("capacity")}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      {...field}
                      value={(field.value as number | string | undefined) ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={generateClasses.isPending}>
                {generateClasses.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Sparkles className="size-4" />
                )}
                {t("submitButton", { count: previewNames.length })}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={generateClasses.isPending}
              >
                {tCommon("cancel")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
