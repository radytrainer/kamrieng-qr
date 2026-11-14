"use server";

import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { requireAdmin } from "@/lib/rbac/guards";
import { logActivity } from "@/lib/repositories/activity-log-repository";
import { ROUTES } from "@/lib/constants/routes";
import {
  createParentFormSchema,
  type ParentFormInput,
} from "@/features/students/schemas/parent-schema";
import { parentRepository } from "@/features/students/services/parent-repository";

export async function addParentAction(
  studentId: string,
  input: ParentFormInput
): Promise<void> {
  const session = await requireAdmin();
  const tValidation = await getTranslations("validation");
  const values = createParentFormSchema(tValidation).parse(input);

  await parentRepository.addToStudent(studentId, values);

  await logActivity({
    userId: session.userId,
    action: "student.parent_added",
    entityType: "student",
    entityId: studentId,
  });

  revalidatePath(ROUTES.admin.studentDetail(studentId));
}

export async function removeParentAction(
  studentId: string,
  parentId: string
): Promise<void> {
  const session = await requireAdmin();
  await parentRepository.removeFromStudent(studentId, parentId);

  await logActivity({
    userId: session.userId,
    action: "student.parent_removed",
    entityType: "student",
    entityId: studentId,
  });

  revalidatePath(ROUTES.admin.studentDetail(studentId));
}
