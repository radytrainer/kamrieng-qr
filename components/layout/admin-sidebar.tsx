"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/components/layout/nav-config";
import { useUiStore } from "@/store/ui-store";
import { SchoolLogo } from "@/components/shared/school-logo";
import { SCHOOL_INFO } from "@/lib/constants/school";
import type { Role } from "@/lib/constants/roles";

interface AdminSidebarProps {
  role: Role;
  schoolName: string;
}

export function AdminSidebar({ role, schoolName }: AdminSidebarProps) {
  const t = useTranslations("nav");
  const tLayout = useTranslations("layout");
  const pathname = usePathname();
  const isCollapsed = useUiStore((state) => state.isSidebarCollapsed);
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);

  const items = NAV_ITEMS.filter((item) => item.roles.includes(role));

  return (
    <aside
      className={cn(
        "no-print bg-sidebar text-sidebar-foreground flex h-full flex-col border-r transition-[width] duration-200",
        isCollapsed ? "w-[68px]" : "w-64"
      )}
    >
      <div className="flex h-16 items-center gap-2 border-b px-4">
        <SchoolLogo size={32} />
        {!isCollapsed && (
          <div className="flex min-w-0 flex-col leading-tight">
            <span className="font-khmer-card truncate text-sm font-semibold">
              {SCHOOL_INFO.khmerName}
            </span>
            <span className="text-sidebar-foreground/60 truncate text-xs">
              {schoolName}
            </span>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {items.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          const label = t(item.labelKey);
          return (
            <Link
              key={item.href}
              href={item.href}
              title={label}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
              )}
            >
              <Icon className="size-4 shrink-0" />
              {!isCollapsed && <span className="truncate">{label}</span>}
            </Link>
          );
        })}
      </nav>

      <button
        type="button"
        onClick={toggleSidebar}
        className="text-sidebar-foreground/60 hover:bg-sidebar-accent/60 flex h-11 items-center justify-center gap-2 border-t text-sm"
      >
        <ChevronLeft
          className={cn(
            "size-4 transition-transform",
            isCollapsed && "rotate-180"
          )}
        />
        {!isCollapsed && tLayout("collapse")}
      </button>
    </aside>
  );
}
