import type { Metadata } from "next";
import { requireSuperAdmin } from "@/lib/rbac/guards";
import { schoolSettingsRepository } from "@/features/settings/services/school-settings-repository";
import { SettingsView } from "@/features/settings/components/settings-view";

export const metadata: Metadata = {
  title: "Settings",
};

export default async function SettingsPage() {
  await requireSuperAdmin();
  const schoolSettings = await schoolSettingsRepository.get();
  return <SettingsView schoolSettings={schoolSettings} />;
}
