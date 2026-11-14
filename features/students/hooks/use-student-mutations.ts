"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import toast from "react-hot-toast";
import { unwrapAction } from "@/lib/actions/action-result";
import { studentKeys } from "@/features/students/hooks/query-keys";
import {
  bulkDeleteStudentsAction,
  bulkMoveClassAction,
  bulkRenewExpiredCardsAction,
  bulkSetStudentStatusAction,
  createStudentAction,
  deleteStudentAction,
  setStudentStatusAction,
  updateStudentAction,
  type BulkStudentStatusFilters,
  type MoveClassInput,
  type RenewExpiredCardsFilters,
} from "@/features/students/actions/student-actions";
import type { StudentFormInput } from "@/features/students/schemas/student-schema";

export function useCreateStudent() {
  const t = useTranslations();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: StudentFormInput) =>
      unwrapAction(createStudentAction(input)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentKeys.lists() });
      toast.success(t("toast.created", { entity: t("entity.student") }));
    },
    onError: (error: Error) =>
      toast.error(error.message || t("toast.genericError")),
  });
}

export function useUpdateStudent(id: string) {
  const t = useTranslations();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: StudentFormInput) =>
      unwrapAction(updateStudentAction(id, input)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: studentKeys.detail(id) });
      toast.success(t("toast.updated", { entity: t("entity.student") }));
    },
    onError: (error: Error) =>
      toast.error(error.message || t("toast.genericError")),
  });
}

export function useSetStudentStatus() {
  const t = useTranslations();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      unwrapAction(setStudentStatusAction(id, status)),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: studentKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: studentKeys.detail(variables.id),
      });
      toast.success(t("admin.students.toast.statusUpdated"));
    },
    onError: (error: Error) =>
      toast.error(error.message || t("toast.genericError")),
  });
}

export function useBulkSetStudentStatus() {
  const t = useTranslations();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      filters,
      status,
    }: {
      filters: BulkStudentStatusFilters;
      status: string;
    }) => unwrapAction(bulkSetStudentStatusAction(filters, status)),
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: studentKeys.lists() });
      toast.success(t("admin.students.toast.bulkStatusUpdated", { count }));
    },
    onError: (error: Error) =>
      toast.error(error.message || t("toast.genericError")),
  });
}

export function useDeleteStudent() {
  const t = useTranslations();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => unwrapAction(deleteStudentAction(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentKeys.lists() });
      toast.success(t("toast.deleted", { entity: t("entity.student") }));
    },
    onError: (error: Error) =>
      toast.error(error.message || t("toast.genericError")),
  });
}

export function useBulkMoveClass() {
  const t = useTranslations();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ ids, input }: { ids: string[]; input: MoveClassInput }) =>
      unwrapAction(bulkMoveClassAction(ids, input)),
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: studentKeys.lists() });
      toast.success(t("admin.students.toast.bulkClassChanged", { count }));
    },
    onError: (error: Error) =>
      toast.error(error.message || t("toast.genericError")),
  });
}

export function useBulkRenewExpiredCards() {
  const t = useTranslations();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      filters,
      destination,
    }: {
      filters: RenewExpiredCardsFilters;
      destination: { classId: string | null; academicYearId: string };
    }) => unwrapAction(bulkRenewExpiredCardsAction(filters, destination)),
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: studentKeys.lists() });
      toast.success(t("admin.students.toast.bulkCardsRenewed", { count }));
    },
    onError: (error: Error) =>
      toast.error(error.message || t("toast.genericError")),
  });
}

export function useBulkDeleteStudents() {
  const t = useTranslations();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => unwrapAction(bulkDeleteStudentsAction(ids)),
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: studentKeys.lists() });
      toast.success(t("admin.students.toast.bulkDeleted", { count }));
    },
    onError: (error: Error) =>
      toast.error(error.message || t("toast.genericError")),
  });
}
