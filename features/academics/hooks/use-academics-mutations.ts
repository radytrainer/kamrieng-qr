"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import toast from "react-hot-toast";
import { unwrapAction } from "@/lib/actions/action-result";
import {
  bulkSetClassDepartmentAction,
  copyClassesToYearAction,
  createAcademicYearAction,
  createClassAction,
  createDepartmentAction,
  deleteAcademicYearAction,
  deleteClassAction,
  deleteDepartmentAction,
  generateClassesAction,
  updateAcademicYearAction,
  updateClassAction,
  updateDepartmentAction,
} from "@/features/academics/actions/academics-actions";
import type {
  AcademicYearFormInput,
  ClassFormInput,
  DepartmentFormInput,
  GenerateClassesFormInput,
} from "@/features/academics/schemas/academics-schema";

function useInvalidateAcademics() {
  const queryClient = useQueryClient();
  return (key: string) => {
    queryClient.invalidateQueries({ queryKey: ["academics", key] });
    queryClient.invalidateQueries({ queryKey: ["academics", "options"] });
  };
}

// ----------------------------------------------------------- academic years
export function useCreateAcademicYear() {
  const t = useTranslations();
  const invalidate = useInvalidateAcademics();
  return useMutation({
    mutationFn: (input: AcademicYearFormInput) =>
      unwrapAction(createAcademicYearAction(input)),
    onSuccess: () => {
      invalidate("academic-years");
      toast.success(t("admin.academics.toast.yearCreated"));
    },
    onError: (error: Error) =>
      toast.error(error.message || t("toast.genericError")),
  });
}

export function useUpdateAcademicYear(id: string) {
  const t = useTranslations();
  const invalidate = useInvalidateAcademics();
  return useMutation({
    mutationFn: (input: AcademicYearFormInput) =>
      unwrapAction(updateAcademicYearAction(id, input)),
    onSuccess: () => {
      invalidate("academic-years");
      toast.success(t("admin.academics.toast.yearUpdated"));
    },
    onError: (error: Error) =>
      toast.error(error.message || t("toast.genericError")),
  });
}

export function useDeleteAcademicYear() {
  const t = useTranslations();
  const invalidate = useInvalidateAcademics();
  return useMutation({
    mutationFn: (id: string) => unwrapAction(deleteAcademicYearAction(id)),
    onSuccess: () => {
      invalidate("academic-years");
      toast.success(t("admin.academics.toast.yearDeleted"));
    },
    onError: (error: Error) =>
      toast.error(error.message || t("toast.genericError")),
  });
}

// ------------------------------------------------------------------ classes
export function useCreateClass() {
  const t = useTranslations();
  const invalidate = useInvalidateAcademics();
  return useMutation({
    mutationFn: (input: ClassFormInput) =>
      unwrapAction(createClassAction(input)),
    onSuccess: () => {
      invalidate("classes");
      toast.success(t("admin.academics.toast.classCreated"));
    },
    onError: (error: Error) =>
      toast.error(error.message || t("toast.genericError")),
  });
}

export function useUpdateClass(id: string) {
  const t = useTranslations();
  const invalidate = useInvalidateAcademics();
  return useMutation({
    mutationFn: (input: ClassFormInput) =>
      unwrapAction(updateClassAction(id, input)),
    onSuccess: () => {
      invalidate("classes");
      toast.success(t("admin.academics.toast.classUpdated"));
    },
    onError: (error: Error) =>
      toast.error(error.message || t("toast.genericError")),
  });
}

export function useDeleteClass() {
  const t = useTranslations();
  const invalidate = useInvalidateAcademics();
  return useMutation({
    mutationFn: (id: string) => unwrapAction(deleteClassAction(id)),
    onSuccess: () => {
      invalidate("classes");
      toast.success(t("admin.academics.toast.classDeleted"));
    },
    onError: (error: Error) =>
      toast.error(error.message || t("toast.genericError")),
  });
}

export function useGenerateClasses() {
  const t = useTranslations();
  const invalidate = useInvalidateAcademics();
  return useMutation({
    mutationFn: (input: GenerateClassesFormInput) =>
      unwrapAction(generateClassesAction(input)),
    onSuccess: (classes) => {
      invalidate("classes");
      toast.success(
        t("admin.academics.toast.classesGenerated", {
          count: classes.length,
        })
      );
    },
    onError: (error: Error) =>
      toast.error(error.message || t("toast.genericError")),
  });
}

export function useCopyClassesToYear() {
  const t = useTranslations();
  const invalidate = useInvalidateAcademics();
  return useMutation({
    mutationFn: ({
      ids,
      targetAcademicYearId,
    }: {
      ids: string[];
      targetAcademicYearId: string;
    }) => unwrapAction(copyClassesToYearAction(ids, targetAcademicYearId)),
    onSuccess: (count) => {
      invalidate("classes");
      toast.success(t("admin.academics.toast.classesCopied", { count }));
    },
    onError: (error: Error) =>
      toast.error(error.message || t("toast.genericError")),
  });
}

export function useBulkSetClassDepartment() {
  const t = useTranslations();
  const invalidate = useInvalidateAcademics();
  return useMutation({
    mutationFn: ({
      ids,
      departmentId,
    }: {
      ids: string[];
      departmentId: string | null;
    }) => unwrapAction(bulkSetClassDepartmentAction(ids, departmentId)),
    onSuccess: (count) => {
      invalidate("classes");
      toast.success(t("admin.academics.toast.classesDepartmentSet", { count }));
    },
    onError: (error: Error) =>
      toast.error(error.message || t("toast.genericError")),
  });
}

// ------------------------------------------------------------- departments
export function useCreateDepartment() {
  const t = useTranslations();
  const invalidate = useInvalidateAcademics();
  return useMutation({
    mutationFn: (input: DepartmentFormInput) =>
      unwrapAction(createDepartmentAction(input)),
    onSuccess: () => {
      invalidate("departments");
      toast.success(t("admin.academics.toast.departmentCreated"));
    },
    onError: (error: Error) =>
      toast.error(error.message || t("toast.genericError")),
  });
}

export function useUpdateDepartment(id: string) {
  const t = useTranslations();
  const invalidate = useInvalidateAcademics();
  return useMutation({
    mutationFn: (input: DepartmentFormInput) =>
      unwrapAction(updateDepartmentAction(id, input)),
    onSuccess: () => {
      invalidate("departments");
      toast.success(t("admin.academics.toast.departmentUpdated"));
    },
    onError: (error: Error) =>
      toast.error(error.message || t("toast.genericError")),
  });
}

export function useDeleteDepartment() {
  const t = useTranslations();
  const invalidate = useInvalidateAcademics();
  return useMutation({
    mutationFn: (id: string) => unwrapAction(deleteDepartmentAction(id)),
    onSuccess: () => {
      invalidate("departments");
      toast.success(t("admin.academics.toast.departmentDeleted"));
    },
    onError: (error: Error) =>
      toast.error(error.message || t("toast.genericError")),
  });
}
