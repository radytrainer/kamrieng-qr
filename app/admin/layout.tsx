import { requireStaff } from "@/lib/rbac/guards";
import { AdminShell } from "@/components/layout/admin-shell";
import { clientEnv } from "@/lib/env.client";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireStaff();

  return (
    <AdminShell
      session={session}
      schoolName={clientEnv.NEXT_PUBLIC_SCHOOL_NAME}
    >
      {children}
    </AdminShell>
  );
}
