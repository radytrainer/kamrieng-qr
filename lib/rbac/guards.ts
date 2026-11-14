import "server-only";
import { redirect } from "next/navigation";
import { getSession, type AppSession } from "@/lib/rbac/session";
import {
  ADMIN_ROLES,
  ROLES,
  STAFF_ROLES,
  type Role,
} from "@/lib/constants/roles";
import { ROUTES } from "@/lib/constants/routes";

/**
 * Server-side auth guards for Server Components, Server Actions, and Route
 * Handlers. This — not Row Level Security — is the primary authorization
 * boundary for the app (see README "Database" section). Call the narrowest
 * guard that fits the page/action.
 */

export async function requireAuth(): Promise<AppSession> {
  const session = await getSession();
  if (!session) redirect(ROUTES.login);
  return session;
}

export async function requireRole(allowed: Role[]): Promise<AppSession> {
  const session = await requireAuth();
  if (!allowed.includes(session.role)) redirect(ROUTES.unauthorized);
  return session;
}

export function requireStaff() {
  return requireRole(STAFF_ROLES);
}

export function requireAdmin() {
  return requireRole(ADMIN_ROLES);
}

export function requireSuperAdmin() {
  return requireRole([ROLES.SUPER_ADMIN]);
}

export function requireTeacher() {
  return requireRole([ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN, ROLES.TEACHER]);
}
