"use client";

import * as React from "react";
import Image from "next/image";
import { format } from "date-fns";
import { useLocale, useTranslations } from "next-intl";
import {
  Briefcase,
  Calendar,
  CheckCircle2,
  MapPin,
  Phone,
  User,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { formatKhmerDateLong, toKhmerNumeral } from "@/lib/utils/khmer-format";
import { useGenderLabel } from "@/lib/i18n/enum-labels";
import { SCHOOL_INFO } from "@/lib/constants/school";
import { SchoolLogo } from "@/components/shared/school-logo";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import type { Locale } from "@/i18n/config";
import type { StudentListItem } from "@/features/students/types/student";

function formatDob(value: string, locale: Locale): string {
  if (locale === "km") return formatKhmerDateLong(value);

  try {
    return format(new Date(value), "dd MMM yyyy");
  } catch {
    return value;
  }
}

const INFO_ICON_STYLE = {
  indigo:
    "bg-indigo-100 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400",
  amber: "bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400",
  emerald:
    "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400",
  rose: "bg-rose-100 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400",
} as const;

function InfoRow({
  icon: Icon,
  tone,
  label,
  value,
  wrap,
}: {
  icon: typeof User;
  tone: keyof typeof INFO_ICON_STYLE;
  label: string;
  value: React.ReactNode;
  wrap?: boolean;
}) {
  return (
    <div className="flex items-start gap-2.5 py-1.5">
      <span
        className={cn(
          "flex size-6 shrink-0 items-center justify-center rounded-full",
          INFO_ICON_STYLE[tone]
        )}
      >
        <Icon className="size-3.5" />
      </span>
      {wrap ? (
        <div className="min-w-0 flex-1">
          <p className="text-muted-foreground text-xs">{label}</p>
          <p className="text-sm font-medium break-words">{value ?? "—"}</p>
        </div>
      ) : (
        <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
          <span className="text-muted-foreground text-xs">{label}</span>
          <span className="truncate text-right text-sm font-medium">
            {value ?? "—"}
          </span>
        </div>
      )}
    </div>
  );
}

const PARENT_ACCENT = {
  father: {
    card: "border-blue-200 bg-blue-50/60 dark:border-blue-900/50 dark:bg-blue-950/20",
    icon: "bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400",
  },
  mother: {
    card: "border-rose-200 bg-rose-50/60 dark:border-rose-900/50 dark:bg-rose-950/20",
    icon: "bg-rose-100 text-rose-600 dark:bg-rose-900/50 dark:text-rose-400",
  },
} as const;

function ParentCard({
  accent,
  role,
  name,
  phone,
  job,
}: {
  accent: keyof typeof PARENT_ACCENT;
  role: string;
  name: string | null;
  phone: string | null;
  job: string | null;
}) {
  const { card, icon } = PARENT_ACCENT[accent];
  return (
    <div className={cn("rounded-lg border p-3", card)}>
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "flex size-6 shrink-0 items-center justify-center rounded-full",
            icon
          )}
        >
          <User className="size-3.5" />
        </span>
        <p className="text-muted-foreground text-xs font-semibold">{role}</p>
      </div>
      <p className="mt-1 truncate text-sm font-medium">{name ?? "—"}</p>
      <div className="text-muted-foreground mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-xs">
        <span className="inline-flex items-center gap-1">
          <Phone className="size-3" />
          {phone ?? "—"}
        </span>
        <span className="inline-flex items-center gap-1">
          <Briefcase className="size-3" />
          {job ?? "—"}
        </span>
      </div>
    </div>
  );
}

interface VerificationSuccessCardProps {
  student: StudentListItem;
}

export function VerificationSuccessCard({
  student,
}: VerificationSuccessCardProps) {
  const locale = useLocale() as Locale;
  const t = useTranslations("public.verification.success");
  const genderLabel = useGenderLabel();

  const fullName =
    locale === "km"
      ? `${student.khmer_first_name} ${student.khmer_last_name}`
      : `${student.english_first_name} ${student.english_last_name}`;

  return (
    <Card className="border-success/30 w-full max-w-sm overflow-hidden py-0 shadow-md">
      <div className="bg-success text-success-foreground flex items-center gap-2 py-3 pr-2 pl-3">
        <div className="flex min-w-0 flex-1 items-center justify-center gap-2">
          <CheckCircle2 className="size-5 shrink-0" />
          <span
            className={cn(
              "truncate text-lg font-semibold",
              locale === "km" && "font-khmer-card"
            )}
          >
            {t("verified")}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <ThemeToggle />
          <LanguageSwitcher />
        </div>
      </div>

      <CardContent className="relative flex flex-col gap-4 overflow-hidden pt-6 pb-6">
        {/* eslint-disable-next-line @next/next/no-img-element -- local trusted SVG watermark; next/image refuses to optimize SVG without dangerouslyAllowSVG */}
        <img
          src="/logo/moeys.svg"
          alt=""
          className="pointer-events-none absolute inset-0 top-1/3 m-auto size-48 object-contain opacity-[0.08] blur-[1px] saturate-75"
        />

        <div className="relative flex items-center justify-center gap-2.5">
          <SchoolLogo size={40} />
          <div className="text-center leading-tight">
            <p className="font-khmer-card text-base font-semibold">
              {SCHOOL_INFO.khmerName}
            </p>
            <p className="text-muted-foreground text-xs">{SCHOOL_INFO.name}</p>
          </div>
        </div>

        <div className="relative flex flex-col items-center gap-2">
          <div className="border-success/20 bg-muted flex size-24 items-center justify-center overflow-hidden rounded-full border-4">
            {student.photo_url ? (
              <Image
                src={student.photo_url}
                alt=""
                width={96}
                height={96}
                className="size-full object-cover"
              />
            ) : (
              <User className="text-muted-foreground size-10" />
            )}
          </div>

          <p
            className={cn(
              "text-lg font-semibold",
              locale === "km" && "font-khmer-card"
            )}
          >
            {fullName}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-1.5">
            <Badge
              variant="outline"
              className={cn("font-mono", locale === "km" && "font-khmer-card")}
            >
              {t("studentCode", { code: student.student_code })}
            </Badge>
            {student.class_name && (
              <Badge
                variant="outline"
                className={cn(locale === "km" && "font-khmer-card")}
              >
                {t("classLabel", {
                  className:
                    locale === "km"
                      ? toKhmerNumeral(student.class_name)
                      : student.class_name,
                })}
              </Badge>
            )}
            <Badge
              variant="outline"
              className={cn(
                "border-success/30 bg-success/10 text-success",
                locale === "km" && "font-khmer-card"
              )}
            >
              {t("active")}
            </Badge>
          </div>
        </div>

        <Separator className="relative" />

        <section className="relative">
          <h3 className="text-muted-foreground mb-1 text-xs font-semibold tracking-wide uppercase">
            {t("personalInfo")}
          </h3>
          <div className="bg-muted/40 rounded-lg px-3">
            <InfoRow
              icon={User}
              tone="indigo"
              label={t("sex")}
              value={genderLabel[student.gender] ?? student.gender}
            />
            <InfoRow
              icon={Calendar}
              tone="amber"
              label={t("dob")}
              value={formatDob(student.date_of_birth, locale)}
            />
            <InfoRow
              icon={Phone}
              tone="emerald"
              label={t("phone")}
              value={student.phone}
            />
            <InfoRow
              icon={MapPin}
              tone="rose"
              label={t("address")}
              value={student.address}
              wrap
            />
          </div>
        </section>

        <section className="relative">
          <h3 className="text-muted-foreground mb-1.5 text-xs font-semibold tracking-wide uppercase">
            {t("parentGuardian")}
          </h3>
          <div className="flex flex-col gap-2">
            <ParentCard
              accent="father"
              role={t("father")}
              name={student.father_name}
              phone={student.father_phone}
              job={student.father_job}
            />
            <ParentCard
              accent="mother"
              role={t("mother")}
              name={student.mother_name}
              phone={student.mother_phone}
              job={student.mother_job}
            />
          </div>
        </section>
      </CardContent>
    </Card>
  );
}
