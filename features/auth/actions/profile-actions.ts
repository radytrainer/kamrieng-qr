"use server";

import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { requireAuth } from "@/lib/rbac/guards";
import { createAdminClient } from "@/lib/supabase/admin";
import { runAction, type ActionResult } from "@/lib/actions/action-result";
import {
  createProfileFormSchema,
  type ProfileFormInput,
} from "@/features/auth/schemas/profile-schema";

/** Self-service display-name update — any authenticated user, not just
 * admins, since everyone (including teacher/student accounts) can edit
 * their own name. Distinct from features/users, which is the admin-only
 * "manage other people's accounts" surface. */
export async function updateOwnProfileAction(
  input: ProfileFormInput
): Promise<ActionResult<{ displayName: string }>> {
  return runAction(async () => {
    const session = await requireAuth();
    const tValidation = await getTranslations("validation");
    const values = createProfileFormSchema(tValidation).parse(input);

    const { error } = await createAdminClient()
      .from("users")
      .update({ display_name: values.displayName })
      .eq("id", session.userId);
    if (error) throw new Error(error.message);

    revalidatePath("/admin", "layout");
    return { displayName: values.displayName };
  });
}
