import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { getSession } from "@/lib/rbac/session";
import { STAFF_ROLES } from "@/lib/constants/roles";
import { ROUTES } from "@/lib/constants/routes";
import { verifyStudentToken } from "@/features/verification/services/verification-service";
import { VerificationSuccessCard } from "@/features/verification/components/verification-success-card";
import { VerificationFailedCard } from "@/features/verification/components/verification-failed-card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Student Verification",
};

export default async function StudentVerificationPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const session = await getSession();
  const { outcome, student } = await verifyStudentToken(
    token,
    session?.userId ?? null
  );
  const t = await getTranslations("public.verification");

  const isStaff = Boolean(session && STAFF_ROLES.includes(session.role));

  return (
    <div className="from-secondary/40 to-background flex flex-1 flex-col items-center justify-center gap-6 bg-gradient-to-b px-6 py-16">
      {outcome === "success" ? (
        <VerificationSuccessCard student={student} />
      ) : (
        <VerificationFailedCard outcome={outcome} student={student} />
      )}

      {isStaff && student && (
        <Button variant="outline" asChild>
          <Link href={ROUTES.admin.studentDetail(student.id)}>
            <ArrowLeft className="size-4" />
            {t("fullProfile")}
          </Link>
        </Button>
      )}
    </div>
  );
}
