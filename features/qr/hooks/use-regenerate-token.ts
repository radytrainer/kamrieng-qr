"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import toast from "react-hot-toast";
import { unwrapAction } from "@/lib/actions/action-result";
import { studentKeys } from "@/features/students/hooks/query-keys";
import { regenerateStudentTokenAction } from "@/features/students/actions/student-actions";

export function useRegenerateToken(studentId: string) {
  const t = useTranslations("admin.qr.toast");
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => unwrapAction(regenerateStudentTokenAction(studentId)),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: studentKeys.detail(studentId),
      });
      toast.success(t("regenerated"));
    },
    onError: (error: Error) =>
      toast.error(error.message || t("regenerateFailed")),
  });
}
