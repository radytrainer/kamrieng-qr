"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "@/lib/api/fetch-json";
import { studentKeys } from "@/features/students/hooks/query-keys";
import type { StudentFilterInput } from "@/features/students/schemas/student-schema";
import type { StudentListResult } from "@/features/students/types/student";

function buildQueryString(filters: StudentFilterInput): string {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.status) params.set("status", filters.status);
  if (filters.departmentId) params.set("departmentId", filters.departmentId);
  if (filters.classId) params.set("classId", filters.classId);
  if (filters.academicYearId)
    params.set("academicYearId", filters.academicYearId);
  if (filters.gradeLevel !== undefined)
    params.set("gradeLevel", String(filters.gradeLevel));
  params.set("page", String(filters.page));
  params.set("pageSize", String(filters.pageSize));
  return params.toString();
}

export function useStudents(
  filters: StudentFilterInput,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: studentKeys.list(filters),
    queryFn: () =>
      fetchJson<StudentListResult>(
        `/api/students?${buildQueryString(filters)}`
      ),
    placeholderData: (previousData) => previousData,
    enabled: options?.enabled,
  });
}
