import Image from "next/image";
import Link from "next/link";
import { User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { getTranslations } from "next-intl/server";
import { StudentStatusBadge } from "@/features/students/components/student-status-badge";
import { ROUTES } from "@/lib/constants/routes";
import type { RecentStudent } from "@/features/dashboard/types/dashboard";

export async function RecentStudentsList({
  students,
}: {
  students: RecentStudent[];
}) {
  const t = await getTranslations("admin.dashboard");

  if (students.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">{t("noStudentsYet")}</p>
    );
  }

  return (
    <div className="flex flex-col divide-y">
      {students.map((student) => (
        <Link
          key={student.id}
          href={ROUTES.admin.studentDetail(student.id)}
          className="hover:bg-muted/50 flex items-center gap-3 py-2.5 first:pt-0 last:pb-0"
        >
          <div className="bg-muted flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full">
            {student.photoUrl ? (
              <Image
                src={student.photoUrl}
                alt=""
                width={36}
                height={36}
                className="size-full object-cover"
              />
            ) : (
              <User className="text-muted-foreground size-4" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-khmer-card truncate text-sm font-medium">
              {student.khmerName}
            </p>
            <p className="text-muted-foreground truncate text-xs">
              {student.studentCode} ·{" "}
              {formatDistanceToNow(new Date(student.createdAt), {
                addSuffix: true,
              })}
            </p>
          </div>
          <StudentStatusBadge
            status={student.status}
            academicYearEndDate={student.academicYearEndDate}
          />
        </Link>
      ))}
    </div>
  );
}
