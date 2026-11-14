import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Users,
  IdCard,
  BookOpen,
  Settings,
} from "lucide-react";
import { ROLES, type Role } from "@/lib/constants/roles";
import { ROUTES } from "@/lib/constants/routes";

/** `labelKey` indexes into the `nav.*` namespace in messages/{locale}.json —
 * resolve it with `useTranslations("nav")` at render time rather than
 * displaying it directly. */
export interface NavItem {
  labelKey: "dashboard" | "students" | "academics" | "cards" | "settings";
  href: string;
  icon: LucideIcon;
  roles: Role[];
}

export const NAV_ITEMS: NavItem[] = [
  {
    labelKey: "dashboard",
    href: ROUTES.admin.dashboard,
    icon: LayoutDashboard,
    roles: [ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN, ROLES.TEACHER],
  },
  {
    labelKey: "students",
    href: ROUTES.admin.students,
    icon: Users,
    roles: [ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN, ROLES.TEACHER],
  },
  {
    labelKey: "academics",
    href: ROUTES.admin.academics.classes,
    icon: BookOpen,
    roles: [ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN],
  },
  {
    labelKey: "cards",
    href: ROUTES.admin.cards,
    icon: IdCard,
    roles: [ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN],
  },
  {
    labelKey: "settings",
    href: ROUTES.admin.settings,
    icon: Settings,
    roles: [ROLES.SUPER_ADMIN],
  },
];
