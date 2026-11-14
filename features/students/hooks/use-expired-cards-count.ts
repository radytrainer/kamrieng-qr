"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "@/lib/api/fetch-json";
import type { RenewExpiredCardsFilters } from "@/features/students/actions/student-actions";

function buildQueryString(filters: RenewExpiredCardsFilters): string {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.classId) params.set("classId", filters.classId);
  if (filters.gradeLevel !== undefined)
    params.set("gradeLevel", String(filters.gradeLevel));
  return params.toString();
}

export function useExpiredCardsCount(
  filters: RenewExpiredCardsFilters,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ["students", "expired-count", filters],
    queryFn: () =>
      fetchJson<{ count: number }>(
        `/api/students/expired-count?${buildQueryString(filters)}`
      ),
    enabled: options?.enabled,
  });
}
