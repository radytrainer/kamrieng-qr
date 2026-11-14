"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "@/lib/api/fetch-json";
import { userKeys } from "@/features/users/hooks/query-keys";
import type { UserFilterInput } from "@/features/users/schemas/user-schema";
import type { UserListResult } from "@/features/users/types/user";

export function useUsers(filters: UserFilterInput) {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  params.set("page", String(filters.page));
  params.set("pageSize", String(filters.pageSize));

  return useQuery({
    queryKey: userKeys.list(filters),
    queryFn: () => fetchJson<UserListResult>(`/api/users?${params.toString()}`),
    placeholderData: (previous) => previous,
  });
}
