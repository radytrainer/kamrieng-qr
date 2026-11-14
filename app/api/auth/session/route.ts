import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { firebaseAdminAuth } from "@/lib/firebase/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { SESSION_COOKIE_NAME } from "@/lib/rbac/session";

const SESSION_EXPIRES_IN_MS = 14 * 24 * 60 * 60 * 1000; // 14 days

const sessionRequestSchema = z.object({
  idToken: z.string().min(1),
});

/**
 * Exchanges a Firebase ID token (obtained client-side via the Firebase Auth
 * SDK) for an httpOnly session cookie the server can verify on every
 * request. Also enforces provisioning: this app does not auto-create
 * accounts on sign-in — the `users` row must already exist (created by an
 * admin, see supabase/seed/01_rbac.sql or the future Users admin screen).
 */
export async function POST(request: NextRequest) {
  const json = await request.json().catch(() => null);
  const parsed = sessionRequestSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

  const { idToken } = parsed.data;

  let decoded;
  try {
    decoded = await firebaseAdminAuth.verifyIdToken(idToken, true);
  } catch {
    return NextResponse.json(
      { error: "Invalid or expired sign-in token" },
      { status: 401 }
    );
  }

  const supabase = createAdminClient();

  let userRow = (
    await supabase
      .from("users")
      .select("id, firebase_uid, is_active")
      .eq("firebase_uid", decoded.uid)
      .maybeSingle()
  ).data;

  if (!userRow && decoded.email) {
    userRow = (
      await supabase
        .from("users")
        .select("id, firebase_uid, is_active")
        .eq("email", decoded.email)
        .maybeSingle()
    ).data;
  }

  if (!userRow || !userRow.is_active) {
    return NextResponse.json(
      {
        error:
          "This account is not registered in the system. Contact your school administrator.",
      },
      { status: 403 }
    );
  }

  await supabase
    .from("users")
    .update({
      firebase_uid: decoded.uid,
      last_login_at: new Date().toISOString(),
    })
    .eq("id", userRow.id);

  const sessionCookie = await firebaseAdminAuth.createSessionCookie(idToken, {
    expiresIn: SESSION_EXPIRES_IN_MS,
  });

  const response = NextResponse.json({ status: "ok" });
  response.cookies.set(SESSION_COOKIE_NAME, sessionCookie, {
    maxAge: SESSION_EXPIRES_IN_MS / 1000,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "lax",
  });
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ status: "ok" });
  response.cookies.delete(SESSION_COOKIE_NAME);
  return response;
}
