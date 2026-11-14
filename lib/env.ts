import "server-only";
import { z } from "zod";
import { clientEnv } from "@/lib/env.client";

/**
 * Server-only environment variables (secrets). Importing this file from a
 * client component fails at build time thanks to the `server-only` package.
 */
const serverEnvSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  FIREBASE_PROJECT_ID: z.string().min(1),
  FIREBASE_CLIENT_EMAIL: z.email(),
  FIREBASE_PRIVATE_KEY: z.string().min(1),
});

const parsed = serverEnvSchema.safeParse({
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
  FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL,
  FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY,
});

if (!parsed.success) {
  console.error(
    "Invalid server environment variables:",
    z.treeifyError(parsed.error)
  );
  throw new Error(
    "Invalid server environment variables. Check your .env file against .env.example."
  );
}

export const env = {
  ...clientEnv,
  ...parsed.data,
};
