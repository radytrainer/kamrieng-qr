"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useUpdateCardTextSettings } from "@/features/settings/hooks/use-school-settings-mutations";
import {
  createCardTextSettingsFormSchema,
  type CardTextSettingsFormInput,
} from "@/features/settings/schemas/school-settings-schema";
import type { SchoolSettings } from "@/features/settings/types/school-settings";

interface CardTextSettingsFormProps {
  settings: SchoolSettings;
}

export function CardTextSettingsForm({ settings }: CardTextSettingsFormProps) {
  const t = useTranslations("admin.settings.cardText");
  const tCommon = useTranslations("common");
  const tValidation = useTranslations("validation");
  const router = useRouter();
  const mutation = useUpdateCardTextSettings();
  const cardTextSettingsFormSchema = React.useMemo(
    () => createCardTextSettingsFormSchema(tValidation),
    [tValidation]
  );

  const form = useForm<CardTextSettingsFormInput>({
    resolver: zodResolver(cardTextSettingsFormSchema),
    defaultValues: {
      cardIssueBuddhistLine: settings.cardIssueBuddhistLine,
      cardIssueGregorianLine: settings.cardIssueGregorianLine,
    },
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    await mutation.mutateAsync(values);
    router.refresh();
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="cardIssueBuddhistLine"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("buddhistLine")}</FormLabel>
                  <FormControl>
                    <Input className="font-khmer-card" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="cardIssueGregorianLine"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("gregorianLine")}</FormLabel>
                  <FormControl>
                    <Input className="font-khmer-card" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Save className="size-4" />
                )}
                {tCommon("save")}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
