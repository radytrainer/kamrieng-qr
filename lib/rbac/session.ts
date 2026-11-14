import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { firebaseAdminAuth } from "@/lib/firebase/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Role } from "@/lib/constants/roles";
import { SESSION_COOKIE_NAME } from "@/lib/rbac/constants";

export { SESSION_COOKIE_NAME };

export interface AppSession {
  firebaseUid: string;
  userId: string;
  email: string;
  displayName: string | null;
  photoUrl: string | null;
  role: Role;
  teacherId: string | null;
  studentId: string | null;
}

/**
 * Resolves the current request's session from the httpOnly `session`
 * cookie (a Firebase session cookie, see app/api/auth/session/route.ts),
 * cross-referenced against the `users` table for role + linked
 * teacher/student record. Returns null for any invalid, expired, missing,
 * or deactivated session — callers decide what to do about that (see
 * lib/rbac/guards.ts).
 *
 * Wrapped in React's `cache()` so the layout guard and every page/action
 * that also calls getSession() within the same request share one
 * Firebase-verify + DB round trip instead of repeating it per call.
 */
export const getSession = cache(async (): Promise<AppSession | null> => {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionCookie) return null;

  let decoded;
  try {
    decoded = await firebaseAdminAuth.verifySessionCookie(sessionCookie, true);
  } catch {
    return null;
  }

  const supabase = createAdminClient();
  const { data: user } = await supabase
    .from("users")
    .select(
      "id, email, display_name, photo_url, role_code, teacher_id, student_id, is_active"
    )
    .eq("firebase_uid", decoded.uid)
    .maybeSingle();

  if (!user || !user.is_active) return null;

  return {
    firebaseUid: decoded.uid,
    userId: user.id,
    email: user.email,
    displayName: user.display_name,
    photoUrl: user.photo_url,
    role: user.role_code as Role,
    teacherId: user.teacher_id,
    studentId: user.student_id,
  };
});
