"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { setLocaleAction } from "@/lib/i18n/actions";
import { LOCALES, type Locale } from "@/i18n/config";

interface LanguageSwitcherProps {
  className?: string;
}

export function LanguageSwitcher({ className }: LanguageSwitcherProps) {
  const locale = useLocale() as Locale;
  const t = useTranslations("layout.languageSwitcher");
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();
  // Flips the highlighted pill the instant it's clicked, instead of
  // waiting for the cookie write + server round-trip + refresh — without
  // this, useLocale() (and therefore the highlight) doesn't move until the
  // whole page has already re-rendered in the new language, which reads as
  // a stuck/laggy button right up until the content suddenly swaps.
  const [optimisticLocale, setOptimisticLocale] = React.useState<Locale | null>(
    null
  );
  const activeLocale = optimisticLocale ?? locale;

  function handleChange(next: Locale) {
    if (next === locale || isPending) return;
    setOptimisticLocale(next);
    startTransition(async () => {
      await setLocaleAction(next);
      router.refresh();
    });
  }

  // router.refresh() resolves once the new RSC payload has actually been
  // applied, and Next.js keeps `isPending` true for that whole window (it's
  // wired into this same useTransition) — so clearing the optimistic guess
  // here lands right as useLocale() catches up, with no flicker between.
  React.useEffect(() => {
    if (!isPending) setOptimisticLocale(null);
  }, [isPending]);

  return (
    <div
      className={cn(
        "bg-card/80 inline-flex items-center gap-1 rounded-full border p-1 backdrop-blur-sm transition-opacity duration-200",
        isPending && "opacity-60",
        className
      )}
    >
      {LOCALES.map((l) => (
        <button
          key={l}
          type="button"
          aria-pressed={activeLocale === l}
          onClick={() => handleChange(l)}
          disabled={isPending}
          className={cn(
            "flex h-7 items-center gap-1.5 rounded-full px-2.5 text-xs font-medium whitespace-nowrap transition-all duration-200 disabled:cursor-not-allowed",
            l === "km" && "font-khmer-card",
            activeLocale === l
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {isPending && optimisticLocale === l && (
            <Loader2 className="size-3 animate-spin" />
          )}
          {l === "km" ? t("khmer") : t("english")}
        </button>
      ))}
    </div>
  );
}
