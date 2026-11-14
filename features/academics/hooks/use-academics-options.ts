"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "@/lib/api/fetch-json";
import type { AcademicsOptions } from "@/features/academics/types/academics";

export function useAcademicsOptions() {
  return useQuery({
    queryKey: ["academics", "options"],
    queryFn: () => fetchJson<AcademicsOptions>("/api/academics/options"),
    staleTime: 5 * 60 * 1000,
  });
}
