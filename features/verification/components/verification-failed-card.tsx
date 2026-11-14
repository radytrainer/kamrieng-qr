"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { AlertTriangle, Ban, ShieldX, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { SCHOOL_INFO } from "@/lib/constants/school";
import { SchoolLogo } from "@/components/shared/school-logo";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import type { VerificationOutcome } from "@/features/verification/types/verification";
import type { StudentListItem } from "@/features/students/types/student";

const OUTCOME_STYLE: Record<
  Exclude<VerificationOutcome, "success">,
  { icon: typeof ShieldX; tone: string }
> = {
  not_found: {
    icon: ShieldX,
    tone: "bg-destructive text-destructive-foreground",
  },
  expired: { icon: AlertTriangle, tone: "bg-warning text-warning-foreground" },
  inactive: { icon: Ban, tone: "bg-muted text-muted-foreground" },
};

interface VerificationFailedCardProps {
  outcome: Exclude<VerificationOutcome, "success">;
  student: StudentListItem | null;
}

export function VerificationFailedCard({
  outcome,
  student,
}: VerificationFailedCardProps) {
  const locale = useLocale();
  const t = useTranslations(`public.verification.failed.${outcome}`);
  const { icon: Icon, tone } = OUTCOME_STYLE[outcome];

  return (
    <Card className="border-destructive/20 w-full max-w-sm overflow-hidden py-0 shadow-md">
      <div className={`flex items-center gap-2 py-3 pr-2 pl-3 ${tone}`}>
        <div className="flex min-w-0 flex-1 items-center justify-center gap-2">
          <Icon className="size-5 shrink-0" />
          <span
            className={cn(
              "truncate font-semibold",
              locale === "km" && "font-khmer-card"
            )}
          >
            {t("title")}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <ThemeToggle />
          <LanguageSwitcher />
        </div>
      </div>

      <CardContent className="flex flex-col items-center gap-3 pt-6 pb-6 text-center">
        <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
          <SchoolLogo size={18} className="grayscale" />
          {SCHOOL_INFO.name}
        </div>

        {student && (
          <>
            <div className="bg-muted flex size-20 items-center justify-center overflow-hidden rounded-full border grayscale">
              {student.photo_url ? (
                <Image
                  src={student.photo_url}
                  alt=""
                  width={80}
                  height={80}
                  className="size-full object-cover"
                />
              ) : (
                <User className="text-muted-foreground size-8" />
              )}
            </div>
            <p className="font-khmer-card font-medium">
              {student.khmer_first_name} {student.khmer_last_name}
            </p>
            <p className="text-muted-foreground font-mono text-xs">
              {student.student_code}
            </p>
          </>
        )}

        <p
          className={cn(
            "text-muted-foreground text-sm",
            locale === "km" && "font-khmer-card"
          )}
        >
          {t("description")}
        </p>
      </CardContent>
    </Card>
  );
}
