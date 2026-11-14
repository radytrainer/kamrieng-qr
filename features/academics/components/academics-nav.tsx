"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/constants/routes";

export function AcademicsNav() {
  const t = useTranslations("admin.academics.nav");
  const pathname = usePathname();

  const TABS = [
    { label: t("academicYears"), href: ROUTES.admin.academics.academicYears },
    { label: t("classes"), href: ROUTES.admin.academics.classes },
    { label: t("departments"), href: ROUTES.admin.academics.departments },
  ];

  return (
    <div className="flex gap-1 overflow-x-auto border-b">
      {TABS.map((tab) => {
        const isActive = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "shrink-0 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors",
              isActive
                ? "border-primary text-foreground"
                : "text-muted-foreground hover:text-foreground border-transparent"
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
