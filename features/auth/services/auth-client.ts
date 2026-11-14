"use client";

import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updatePassword,
} from "firebase/auth";
import { firebaseAuth } from "@/lib/firebase/client";

export class AuthError extends Error {}

/**
 * Exchanges the current Firebase user's ID token for our httpOnly session
 * cookie. Throws AuthError with a user-facing message if the account isn't
 * provisioned (see app/api/auth/session/route.ts).
 */
async function exchangeSessionCookie(): Promise<void> {
  const user = firebaseAuth.currentUser;
  if (!user) throw new AuthError("Not signed in.");

  const idToken = await user.getIdToken();
  const response = await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    // The Firebase client session must not outlive an unprovisioned app session.
    await firebaseSignOut(firebaseAuth);
    throw new AuthError(body?.error ?? "Sign-in failed.");
  }
}

export async function signInWithEmail(
  email: string,
  password: string
): Promise<void> {
  try {
    await signInWithEmailAndPassword(firebaseAuth, email, password);
  } catch (error) {
    throw new AuthError(mapFirebaseError(error));
  }
  await exchangeSessionCookie();
}

export async function signOut(): Promise<void> {
  await Promise.allSettled([
    firebaseSignOut(firebaseAuth),
    fetch("/api/auth/session", { method: "DELETE" }),
  ]);
}

/** Firebase requires a recent sign-in for sensitive operations like this,
 * so re-authenticate with the current password first rather than relying
 * on however old the existing session happens to be. */
export async function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<void> {
  const user = firebaseAuth.currentUser;
  if (!user || !user.email) throw new AuthError("Not signed in.");

  try {
    const credential = EmailAuthProvider.credential(
      user.email,
      currentPassword
    );
    await reauthenticateWithCredential(user, credential);
    await updatePassword(user, newPassword);
  } catch (error) {
    throw new AuthError(mapChangePasswordError(error));
  }
}

function mapFirebaseError(error: unknown): string {
  const code = (error as { code?: string } | null)?.code;
  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Incorrect email or password.";
    case "auth/too-many-requests":
      return "Too many attempts. Please wait a moment and try again.";
    default:
      return "Sign-in failed. Please try again.";
  }
}

function mapChangePasswordError(error: unknown): string {
  const code = (error as { code?: string } | null)?.code;
  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
      return "Current password is incorrect.";
    case "auth/weak-password":
      return "New password is too weak — use at least 6 characters.";
    case "auth/too-many-requests":
      return "Too many attempts. Please wait a moment and try again.";
    default:
      return "Failed to change password. Please try again.";
  }
}
