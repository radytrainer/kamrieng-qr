import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ParentFormInput } from "@/features/students/schemas/parent-schema";
import type { Database } from "@/types/database.types";

type ParentRow = Database["public"]["Tables"]["parents"]["Row"];

export interface StudentParent extends ParentRow {
  is_emergency_contact: boolean;
}

export class ParentRepository {
  private get client() {
    return createAdminClient();
  }

  async listByStudent(studentId: string): Promise<StudentParent[]> {
    const { data, error } = await this.client
      .from("student_parents")
      .select("is_emergency_contact, parents (*)")
      .eq("student_id", studentId);

    if (error) throw new Error(error.message);

    return (data ?? [])
      .filter((row) => row.parents)
      .map((row) => ({
        ...(row.parents as unknown as ParentRow),
        is_emergency_contact: row.is_emergency_contact,
      }));
  }

  async addToStudent(studentId: string, input: ParentFormInput): Promise<void> {
    const { data: parent, error: parentError } = await this.client
      .from("parents")
      .insert({
        english_name: input.englishName,
        khmer_name: input.khmerName || null,
        relationship: input.relationship,
        phone: input.phone || null,
        email: input.email || null,
        occupation: input.occupation || null,
      })
      .select()
      .single();

    if (parentError) throw new Error(parentError.message);

    if (input.isEmergencyContact) {
      await this.client
        .from("student_parents")
        .update({ is_emergency_contact: false })
        .eq("student_id", studentId);
    }

    const { error: linkError } = await this.client
      .from("student_parents")
      .insert({
        student_id: studentId,
        parent_id: parent.id,
        is_emergency_contact: input.isEmergencyContact ?? false,
      });

    if (linkError) throw new Error(linkError.message);
  }

  async removeFromStudent(studentId: string, parentId: string): Promise<void> {
    const { error } = await this.client
      .from("student_parents")
      .delete()
      .eq("student_id", studentId)
      .eq("parent_id", parentId);

    if (error) throw new Error(error.message);
  }
}

export const parentRepository = new ParentRepository();
