import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Json } from "@/types/database.types";

export interface LogActivityInput {
  userId: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: Record<string, Json>;
}

/** Fire-and-forget audit trail write. Never throws — a failed audit log
 * write must not roll back or block the user-facing action it describes. */
export async function logActivity(input: LogActivityInput): Promise<void> {
  try {
    const supabase = createAdminClient();
    await supabase.from("activity_logs").insert({
      user_id: input.userId,
      action: input.action,
      entity_type: input.entityType,
      entity_id: input.entityId ?? null,
      metadata: input.metadata ?? {},
    });
  } catch (error) {
    console.error("Failed to write activity log", input.action, error);
  }
}
