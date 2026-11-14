import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { requireAdmin } from "@/lib/rbac/guards";
import { AcademicsNav } from "@/features/academics/components/academics-nav";
import { ClassesView } from "@/features/academics/components/classes-view";

export const metadata: Metadata = {
  title: "Classes",
};

export default async function ClassesPage() {
  await requireAdmin();
  const t = await getTranslations("admin.academics.page");

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground text-sm">{t("subtitle")}</p>
      </div>
      <AcademicsNav />
      <ClassesView />
    </div>
  );
}
