import "server-only";
import { getApps, initializeApp, cert, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { env } from "@/lib/env";

/**
 * Firebase Admin SDK — used server-side to verify the Firebase ID token
 * sent by the client on every authenticated request (see
 * `lib/rbac/verify-session.ts` in the Authentication phase).
 */
function getFirebaseAdminApp(): App {
  const existing = getApps()[0];
  if (existing) return existing;

  return initializeApp({
    credential: cert({
      projectId: env.FIREBASE_PROJECT_ID,
      clientEmail: env.FIREBASE_CLIENT_EMAIL,
      // Environment variables store literal "\n" — convert back to real newlines.
      privateKey: env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }),
  });
}

export const firebaseAdminAuth = getAuth(getFirebaseAdminApp());
