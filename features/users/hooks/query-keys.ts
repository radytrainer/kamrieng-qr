import type { UserFilterInput } from "@/features/users/schemas/user-schema";

export const userKeys = {
  all: ["users"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  list: (filters: UserFilterInput) => [...userKeys.lists(), filters] as const,
};
