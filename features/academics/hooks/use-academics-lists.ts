"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "@/lib/api/fetch-json";
import type {
  AcademicYear,
  ClassListItem,
  Department,
  StudyProgramListItem,
} from "@/features/academics/types/academics";

export function useDepartments() {
  return useQuery({
    queryKey: ["academics", "departments"],
    queryFn: () => fetchJson<Department[]>("/api/academics/departments"),
  });
}

export function useStudyPrograms() {
  return useQuery({
    queryKey: ["academics", "study-programs"],
    queryFn: () =>
      fetchJson<StudyProgramListItem[]>("/api/academics/study-programs"),
  });
}

export function useAcademicYears() {
  return useQuery({
    queryKey: ["academics", "academic-years"],
    queryFn: () => fetchJson<AcademicYear[]>("/api/academics/academic-years"),
  });
}

export function useClasses() {
  return useQuery({
    queryKey: ["academics", "classes"],
    queryFn: () => fetchJson<ClassListItem[]>("/api/academics/classes"),
  });
}
