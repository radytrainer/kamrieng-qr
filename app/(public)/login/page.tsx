import { Suspense } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getSession } from "@/lib/rbac/session";
import { ROUTES } from "@/lib/constants/routes";
import { SCHOOL_INFO } from "@/lib/constants/school";
import { LoginForm } from "@/features/auth/components/login-form";
import { SchoolLogo } from "@/components/shared/school-logo";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { ThemeToggle } from "@/components/shared/theme-toggle";

export const metadata: Metadata = {
  title: "Sign in",
};

export default async function LoginPage() {
  const session = await getSession();
  if (session) redirect(ROUTES.admin.dashboard);

  const t = await getTranslations("public.login");

  return (
    <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-6 py-16">
      {/* Background photo + dark scrim so the light card and title stay
       * readable on top of it. */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/background.webp"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/55 to-black/75" />
      </div>

      <div className="absolute top-4 right-4 flex items-center gap-2">
        <ThemeToggle />
        <LanguageSwitcher />
      </div>

      <div className="animate-in fade-in-0 slide-in-from-bottom-4 flex w-full max-w-sm flex-col items-center gap-6 duration-500">
        <div className="flex flex-col items-center gap-3 text-center">
          <SchoolLogo size={64} className="ring-card shadow-lg ring-4" />
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-white">
              {t("title")}
            </h1>
            <p className="mt-1 text-sm text-white/75">{t("subtitle")}</p>
          </div>
        </div>

        <div className="bg-card ring-foreground/10 w-full rounded-2xl p-6 shadow-xl ring-1 sm:p-8">
          <Suspense>
            <LoginForm />
          </Suspense>
        </div>

        <p className="text-xs text-white/60">
          © {new Date().getFullYear()} {SCHOOL_INFO.name}
        </p>
      </div>
    </div>
  );
}
