"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import toast from "react-hot-toast";
import { userKeys } from "@/features/users/hooks/query-keys";
import {
  createUserAction,
  resetUserPasswordAction,
  setUserActiveAction,
  updateUserAction,
} from "@/features/users/actions/user-actions";
import type { UserFormInput } from "@/features/users/schemas/user-schema";

export function useCreateUser() {
  const t = useTranslations();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UserFormInput) => createUserAction(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      toast.success(t("toast.created", { entity: t("entity.user") }));
    },
    onError: (error: Error) =>
      toast.error(error.message || t("toast.genericError")),
  });
}

export function useUpdateUser(id: string) {
  const t = useTranslations();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UserFormInput) => updateUserAction(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      toast.success(t("toast.updated", { entity: t("entity.user") }));
    },
    onError: (error: Error) =>
      toast.error(error.message || t("toast.genericError")),
  });
}

export function useResetUserPassword() {
  const t = useTranslations("toast");
  return useMutation({
    mutationFn: ({ id, email }: { id: string; email: string }) =>
      resetUserPasswordAction(id, email),
    onError: (error: Error) => toast.error(error.message || t("genericError")),
  });
}

export function useSetUserActive() {
  const t = useTranslations();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      setUserActiveAction(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      toast.success(t("toast.updated", { entity: t("entity.user") }));
    },
    onError: (error: Error) =>
      toast.error(error.message || t("toast.genericError")),
  });
}
