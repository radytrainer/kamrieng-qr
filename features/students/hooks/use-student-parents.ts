"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import toast from "react-hot-toast";
import { fetchJson } from "@/lib/api/fetch-json";
import {
  addParentAction,
  removeParentAction,
} from "@/features/students/actions/parent-actions";
import type { StudentParent } from "@/features/students/services/parent-repository";
import type { ParentFormInput } from "@/features/students/schemas/parent-schema";

const parentsKey = (studentId: string) =>
  ["students", studentId, "parents"] as const;

export function useStudentParents(studentId: string) {
  return useQuery({
    queryKey: parentsKey(studentId),
    queryFn: () =>
      fetchJson<StudentParent[]>(`/api/students/${studentId}/parents`),
    enabled: Boolean(studentId),
  });
}

export function useAddParent(studentId: string) {
  const t = useTranslations();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ParentFormInput) => addParentAction(studentId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: parentsKey(studentId) });
      toast.success(t("admin.students.toast.parentAdded"));
    },
    onError: (error: Error) =>
      toast.error(error.message || t("toast.genericError")),
  });
}

export function useRemoveParent(studentId: string) {
  const t = useTranslations();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (parentId: string) => removeParentAction(studentId, parentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: parentsKey(studentId) });
      toast.success(t("admin.students.toast.parentRemoved"));
    },
    onError: (error: Error) =>
      toast.error(error.message || t("toast.genericError")),
  });
}
