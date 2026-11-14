import { clientEnv } from "@/lib/env.client";

/**
 * The only thing ever encoded in a student's QR code. Deliberately just a
 * URL with an opaque token — no name, photo, or any other PII, per spec.
 */
export function buildStudentQrUrl(token: string): string {
  return `${clientEnv.NEXT_PUBLIC_APP_URL}/student/${token}`;
}
