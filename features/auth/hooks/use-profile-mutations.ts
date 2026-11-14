"use client";

import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import toast from "react-hot-toast";
import { unwrapAction } from "@/lib/actions/action-result";
import { updateOwnProfileAction } from "@/features/auth/actions/profile-actions";
import {
  AuthError,
  changePassword,
} from "@/features/auth/services/auth-client";
import type { ProfileFormInput } from "@/features/auth/schemas/profile-schema";
import type { ChangePasswordFormValues } from "@/features/auth/schemas/change-password-schema";

export function useUpdateProfile() {
  const t = useTranslations();
  const router = useRouter();
  return useMutation({
    mutationFn: (input: ProfileFormInput) =>
      unwrapAction(updateOwnProfileAction(input)),
    onSuccess: () => {
      toast.success(t("layout.profile.toast.updated"));
      router.refresh();
    },
    onError: (error: Error) =>
      toast.error(error.message || t("toast.genericError")),
  });
}

export function useChangePassword() {
  const t = useTranslations();
  return useMutation({
    mutationFn: (values: ChangePasswordFormValues) =>
      changePassword(values.currentPassword, values.newPassword),
    onSuccess: () => {
      toast.success(t("layout.profile.toast.passwordChanged"));
    },
    onError: (error: unknown) => {
      const message =
        error instanceof AuthError ? error.message : t("toast.genericError");
      toast.error(message);
    },
  });
}
