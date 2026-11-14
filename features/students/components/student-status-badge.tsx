"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { isPastDate } from "@/lib/utils/date";
import {
  STUDENT_STATUS,
  type StudentStatus,
} from "@/lib/constants/student-status";
import { useStudentStatusLabels } from "@/lib/i18n/enum-labels";

const STATUS_STYLES: Record<StudentStatus, string> = {
  active: "bg-success/15 text-success border-success/30",
  inactive: "bg-muted text-muted-foreground border-border",
  graduated: "bg-info/15 text-info border-info/30",
  suspended: "bg-warning/15 text-warning-foreground border-warning/30",
  transferred: "bg-muted text-muted-foreground border-border",
  expelled: "bg-destructive/15 text-destructive border-destructive/30",
};

const EXPIRED_STYLE =
  "bg-destructive/15 text-destructive border-destructive/30";

interface StudentStatusBadgeProps {
  status: string;
  /** The academic year end date of the student's class (or their own, as a
   * fallback) — when it's in the past, an otherwise "Active" student shows
   * as "Expired" instead. Computed live, not a stored status. */
  academicYearEndDate?: string | null;
}

export function StudentStatusBadge({
  status,
  academicYearEndDate,
}: StudentStatusBadgeProps) {
  const t = useTranslations("admin.students.statusBadge");
  const statusLabels = useStudentStatusLabels();
  const key = status as StudentStatus;
  const isExpired =
    status === STUDENT_STATUS.ACTIVE && isPastDate(academicYearEndDate);
  const label = isExpired ? t("expired") : (statusLabels[key] ?? status);
  const style = isExpired
    ? EXPIRED_STYLE
    : (STATUS_STYLES[key] ?? "text-muted-foreground");

  return (
    <Badge variant="outline" className={cn("font-normal", style)}>
      {label}
    </Badge>
  );
}
