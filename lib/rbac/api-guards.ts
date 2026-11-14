import "server-only";
import { NextResponse } from "next/server";
import { getSession, type AppSession } from "@/lib/rbac/session";
import type { Role } from "@/lib/constants/roles";

/**
 * Route Handler auth guard. Unlike lib/rbac/guards.ts (which calls
 * `redirect()` and is only valid in Server Components/Actions), this
 * returns a proper 401 JSON response for API consumers instead of an HTTP
 * redirect a fetch() caller can't sensibly follow.
 *
 * Usage:
 *   const auth = await requireApiSession(STAFF_ROLES)
 *   if (auth instanceof NextResponse) return auth
 *   const session = auth
 */
export async function requireApiSession(
  allowedRoles: Role[]
): Promise<AppSession | NextResponse> {
  const session = await getSession();
  if (!session || !allowedRoles.includes(session.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return session;
}
