import type { Metadata } from "next";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { ThemeToggle } from "@/components/shared/theme-toggle";

export const metadata: Metadata = {
  title: "Unauthorized",
};

export default async function UnauthorizedPage() {
  const t = await getTranslations("public.unauthorized");

  return (
    <div className="relative flex flex-1 flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <ThemeToggle />
        <LanguageSwitcher />
      </div>

      <div className="bg-destructive/10 text-destructive flex size-14 items-center justify-center rounded-2xl">
        <ShieldAlert className="size-7" />
      </div>
      <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
      <p className="text-muted-foreground max-w-sm text-sm">
        {t("description")}
      </p>
      <Button asChild className="mt-2">
        <Link href="/login">{t("backToSignIn")}</Link>
      </Button>
    </div>
  );
}
