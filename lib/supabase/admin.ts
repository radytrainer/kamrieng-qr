import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";
import type { Database } from "@/types/database.types";

/**
 * Privileged Supabase client using the service role key. This BYPASSES Row
 * Level Security entirely — only use it after the caller's identity and
 * role have already been verified server-side (e.g. via the Firebase ID
 * token in `lib/firebase/admin.ts`).
 *
 * Never import this file from a Client Component.
 */
export function createAdminClient() {
  return createSupabaseClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
