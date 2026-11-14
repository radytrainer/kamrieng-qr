import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { UserFormValues } from "@/features/users/schemas/user-schema";
import type {
  UserListItem,
  UserListResult,
  UserRow,
} from "@/features/users/types/user";
import type { Database } from "@/types/database.types";

function formToRow(
  input: UserFormValues
): Database["public"]["Tables"]["users"]["Insert"] {
  return {
    email: input.email,
    display_name: input.displayName,
    role_code: input.roleCode,
    is_active: input.isActive,
  };
}

export interface UserListFilters {
  search?: string;
  page: number;
  pageSize: number;
}

export class UserRepository {
  private get client() {
    return createAdminClient();
  }

  async list(filters: UserListFilters): Promise<UserListResult> {
    const { search, page, pageSize } = filters;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = this.client
      .from("users")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);

    if (search) {
      const term = search.trim().replace(/[%,]/g, "");
      query = query.or(`email.ilike.%${term}%,display_name.ilike.%${term}%`);
    }

    const { data, error, count } = await query;
    if (error) throw new Error(error.message);

    return {
      items: data ?? [],
      total: count ?? 0,
      page,
      pageSize,
    };
  }

  async getById(id: string): Promise<UserListItem | null> {
    const { data, error } = await this.client
      .from("users")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data;
  }

  async getByEmail(email: string): Promise<UserRow | null> {
    const { data, error } = await this.client
      .from("users")
      .select("*")
      .eq("email", email)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data;
  }

  async create(input: UserFormValues): Promise<UserRow> {
    const { data, error } = await this.client
      .from("users")
      .insert(formToRow(input))
      .select()
      .single();

    if (error) {
      if (error.code === "23505")
        throw new Error("A user with this email already exists");
      throw new Error(error.message);
    }
    return data;
  }

  async update(id: string, input: UserFormValues): Promise<UserRow> {
    const { data, error } = await this.client
      .from("users")
      .update(formToRow(input))
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async setActive(id: string, isActive: boolean): Promise<UserRow> {
    const { data, error } = await this.client
      .from("users")
      .update({ is_active: isActive })
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }
}

export const userRepository = new UserRepository();
