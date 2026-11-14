"use server";

import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { requireSuperAdmin } from "@/lib/rbac/guards";
import { logActivity } from "@/lib/repositories/activity-log-repository";
import { ROUTES } from "@/lib/constants/routes";
import { schoolSettingsRepository } from "@/features/settings/services/school-settings-repository";
import {
  createCardTextSettingsFormSchema,
  type CardTextSettingsFormInput,
} from "@/features/settings/schemas/school-settings-schema";
import type { SchoolSettings } from "@/features/settings/types/school-settings";

export async function updateCardTextSettingsAction(
  input: CardTextSettingsFormInput
): Promise<SchoolSettings> {
  const session = await requireSuperAdmin();
  const tValidation = await getTranslations("validation");
  const values = createCardTextSettingsFormSchema(tValidation).parse(input);
  const settings = await schoolSettingsRepository.update(values);

  await logActivity({
    userId: session.userId,
    action: "settings.card_text_updated",
    entityType: "school_settings",
    entityId: null,
  });

  revalidatePath(ROUTES.admin.settings);
  revalidatePath(ROUTES.admin.cards);
  return settings;
}
