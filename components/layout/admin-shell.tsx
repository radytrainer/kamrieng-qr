"use client";

import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { AdminHeader } from "@/components/layout/admin-header";
import type { AppSession } from "@/lib/rbac/session";

interface AdminShellProps {
  session: AppSession;
  schoolName: string;
  children: React.ReactNode;
}

export function AdminShell({ session, schoolName, children }: AdminShellProps) {
  return (
    // print:h-auto / print:overflow-visible undo the fixed-height, scrollable
    // app-shell for print media — otherwise the print engine treats this
    // container's viewport-bounded box as "the whole page" and squeezes
    // every printable page's content into it instead of paginating.
    <div className="flex h-dvh w-full overflow-hidden print:h-auto print:overflow-visible">
      <AdminSidebar role={session.role} schoolName={schoolName} />
      <div className="flex min-w-0 flex-1 flex-col print:block">
        <AdminHeader
          displayName={session.displayName}
          email={session.email}
          photoUrl={session.photoUrl}
          role={session.role}
        />
        <main className="bg-muted/30 relative flex-1 overflow-y-auto p-4 sm:p-6 print:h-auto print:overflow-visible print:p-0">
          {children}
        </main>
      </div>
    </div>
  );
}
