import type { Database } from "@/types/database.types";

export type UserRow = Database["public"]["Tables"]["users"]["Row"];

export type UserListItem = UserRow;

export interface UserListResult {
  items: UserListItem[];
  total: number;
  page: number;
  pageSize: number;
}
