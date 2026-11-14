"use server";

import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { requireSuperAdmin } from "@/lib/rbac/guards";
import { logActivity } from "@/lib/repositories/activity-log-repository";
import { firebaseAdminAuth } from "@/lib/firebase/admin";
import { generateTempPassword } from "@/lib/utils/generate-password";
import { ROUTES } from "@/lib/constants/routes";
import {
  createUserFormSchema,
  type UserFormInput,
} from "@/features/users/schemas/user-schema";
import { userRepository } from "@/features/users/services/user-repository";
import type { UserRow } from "@/features/users/types/user";

export async function createUserAction(input: UserFormInput): Promise<UserRow> {
  const session = await requireSuperAdmin();
  const tValidation = await getTranslations("validation");
  const values = createUserFormSchema(tValidation).parse(input);

  const user = await userRepository.create(values);

  await logActivity({
    userId: session.userId,
    action: "user.created",
    entityType: "user",
    entityId: user.id,
    metadata: { email: user.email, role: user.role_code },
  });

  revalidatePath(ROUTES.admin.settings);
  return user;
}

export async function updateUserAction(
  id: string,
  input: UserFormInput
): Promise<UserRow> {
  const session = await requireSuperAdmin();
  const tValidation = await getTranslations("validation");
  const values = createUserFormSchema(tValidation).parse(input);

  if (id === session.userId && values.roleCode !== "super_admin") {
    const t = await getTranslations("admin.users.form");
    throw new Error(t("cantRemoveOwnSuperAdmin"));
  }

  const user = await userRepository.update(id, values);

  await logActivity({
    userId: session.userId,
    action: "user.updated",
    entityType: "user",
    entityId: id,
  });

  revalidatePath(ROUTES.admin.settings);
  return user;
}

/**
 * Sets (or creates) the Firebase Auth password for a pre-provisioned
 * account. Works whether or not the person has ever logged in — if no
 * Firebase Auth user exists yet for this email, one is created so
 * email/password sign-in works immediately.
 */
export async function resetUserPasswordAction(
  userId: string,
  email: string
): Promise<{ password: string }> {
  const session = await requireSuperAdmin();
  const password = generateTempPassword();

  try {
    const existing = await firebaseAdminAuth.getUserByEmail(email);
    await firebaseAdminAuth.updateUser(existing.uid, { password });
  } catch (error) {
    const code = (error as { code?: string } | null)?.code;
    if (code !== "auth/user-not-found") throw error;
    await firebaseAdminAuth.createUser({
      email,
      password,
      emailVerified: true,
    });
  }

  await logActivity({
    userId: session.userId,
    action: "user.password_reset",
    entityType: "user",
    entityId: userId,
  });

  return { password };
}

export async function setUserActiveAction(
  id: string,
  isActive: boolean
): Promise<UserRow> {
  const session = await requireSuperAdmin();

  if (id === session.userId && !isActive) {
    const t = await getTranslations("admin.users.form");
    throw new Error(t("cantDeactivateOwnAccount"));
  }

  const user = await userRepository.setActive(id, isActive);

  await logActivity({
    userId: session.userId,
    action: isActive ? "user.activated" : "user.deactivated",
    entityType: "user",
    entityId: id,
  });

  revalidatePath(ROUTES.admin.settings);
  return user;
}
