"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "@/lib/api/fetch-json";
import { studentKeys } from "@/features/students/hooks/query-keys";
import type { StudentRow } from "@/features/students/types/student";

export function useStudent(id: string) {
  return useQuery({
    queryKey: studentKeys.detail(id),
    queryFn: () => fetchJson<StudentRow>(`/api/students/${id}`),
    enabled: Boolean(id),
  });
}
