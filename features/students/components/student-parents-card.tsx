"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Plus, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  useAddParent,
  useRemoveParent,
  useStudentParents,
} from "@/features/students/hooks/use-student-parents";
import {
  createParentFormSchema,
  type ParentFormInput,
} from "@/features/students/schemas/parent-schema";

export function StudentParentsCard({ studentId }: { studentId: string }) {
  const t = useTranslations("admin.students.parentsCard");
  const tForm = useTranslations("admin.students.form");
  const tCommon = useTranslations("common");
  const tValidation = useTranslations("validation");
  const { data: parents, isLoading } = useStudentParents(studentId);
  const addParent = useAddParent(studentId);
  const removeParent = useRemoveParent(studentId);
  const [open, setOpen] = React.useState(false);
  const parentFormSchema = React.useMemo(
    () => createParentFormSchema(tValidation),
    [tValidation]
  );

  const form = useForm<ParentFormInput>({
    resolver: zodResolver(parentFormSchema),
    defaultValues: {
      englishName: "",
      khmerName: "",
      relationship: "father",
      phone: "",
      email: "",
      occupation: "",
      isEmergencyContact: false,
    },
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    await addParent.mutateAsync(values);
    form.reset();
    setOpen(false);
  });

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>{tForm("parentsCard")}</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              <Plus className="size-4" />
              {t("add")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("addDialogTitle")}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <FormField
                  control={form.control}
                  name="englishName"
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
                  name="relationship"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("relationship")}</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="father">{t("father")}</SelectItem>
                          <SelectItem value="mother">{t("mother")}</SelectItem>
                          <SelectItem value="guardian">
                            {t("guardian")}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{tForm("phoneNumber")}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="isEmergencyContact"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center gap-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="font-normal">
                        {t("emergencyContact")}
                      </FormLabel>
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit" disabled={addParent.isPending}>
                    {t("addParent")}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {isLoading && (
          <p className="text-muted-foreground text-sm">{tCommon("loading")}</p>
        )}
        {!isLoading && parents?.length === 0 && (
          <p className="text-muted-foreground text-sm">{t("noParents")}</p>
        )}
        {parents?.map((parent) => (
          <div
            key={parent.id}
            className="flex items-center justify-between rounded-lg border p-3"
          >
            <div>
              <p className="flex items-center gap-1.5 text-sm font-medium">
                {parent.english_name}
                {parent.is_emergency_contact && (
                  <Star className="fill-warning text-warning size-3.5" />
                )}
              </p>
              <p className="text-muted-foreground text-xs capitalize">
                {parent.relationship} · {parent.phone || t("noPhone")}
              </p>
            </div>
            <Button
              size="icon"
              variant="ghost"
              className="text-muted-foreground hover:text-destructive size-8"
              onClick={() => removeParent.mutate(parent.id)}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
