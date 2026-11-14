"use client";

import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import toast from "react-hot-toast";
import { updateCardTextSettingsAction } from "@/features/settings/actions/school-settings-actions";
import type { CardTextSettingsFormInput } from "@/features/settings/schemas/school-settings-schema";

export function useUpdateCardTextSettings() {
  const t = useTranslations();
  return useMutation({
    mutationFn: (input: CardTextSettingsFormInput) =>
      updateCardTextSettingsAction(input),
    onSuccess: () => toast.success(t("admin.settings.toast.cardTextUpdated")),
    onError: (error: Error) =>
      toast.error(error.message || t("toast.genericError")),
  });
}
