"use client";

import { useTranslations } from "next-intl";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UsersListView } from "@/features/users/components/users-list-view";
import { CardTextSettingsForm } from "@/features/settings/components/card-text-settings-form";
import type { SchoolSettings } from "@/features/settings/types/school-settings";

interface SettingsViewProps {
  schoolSettings: SchoolSettings;
}

export function SettingsView({ schoolSettings }: SettingsViewProps) {
  const t = useTranslations("admin.settings");
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground text-sm">{t("subtitle")}</p>
      </div>

      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">{t("tabUsers")}</TabsTrigger>
          <TabsTrigger value="card-text">{t("tabCardText")}</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <UsersListView />
        </TabsContent>

        <TabsContent value="card-text">
          <CardTextSettingsForm settings={schoolSettings} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
